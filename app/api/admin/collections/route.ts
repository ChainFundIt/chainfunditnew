import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  collectionContributions,
  collections,
} from "@/lib/schema/collections";
import { users } from "@/lib/schema/users";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";
import { isMissingCollectionsTable } from "@/lib/collections/owner";
import { getCollectionBalances } from "@/lib/collections/payout-balance";

function adminAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error.message === "2FA verification required") {
      return NextResponse.json(
        { error: "2FA verification required" },
        { status: 403 }
      );
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuthWith2FA(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const offset = (page - 1) * limit;

    const whereConditions = [];
    if (search) {
      whereConditions.push(
        or(
          sql`${collections.title} ILIKE ${`%${search}%`}`,
          sql`${collections.organiserName} ILIKE ${`%${search}%`}`,
          sql`${users.fullName} ILIKE ${`%${search}%`}`,
          sql`${users.email} ILIKE ${`%${search}%`}`
        )
      );
    }
    if (status !== "all") {
      whereConditions.push(eq(collections.status, status));
    }
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [rows, totalCount, statusRows, raisedRows] = await Promise.all([
      db
        .select({
          id: collections.id,
          title: collections.title,
          slug: collections.slug,
          category: collections.category,
          organiserName: collections.organiserName,
          currency: collections.currency,
          status: collections.status,
          isPublic: collections.isPublic,
          targetAmount: collections.targetAmount,
          dueAt: collections.dueAt,
          createdAt: collections.createdAt,
          creatorName: users.fullName,
          creatorEmail: users.email,
        })
        .from(collections)
        .leftJoin(users, eq(collections.creatorId, users.id))
        .where(whereClause)
        .orderBy(desc(collections.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(collections)
        .leftJoin(users, eq(collections.creatorId, users.id))
        .where(whereClause),
      db
        .select({
          status: collections.status,
          count: sql<number>`COUNT(*)`,
        })
        .from(collections)
        .groupBy(collections.status),
      db
        .select({
          currency: collections.currency,
          total: sql<string>`COALESCE(SUM(${collectionContributions.amount}), 0)`,
        })
        .from(collectionContributions)
        .innerJoin(
          collections,
          eq(collectionContributions.collectionId, collections.id)
        )
        .where(eq(collectionContributions.paymentStatus, "completed"))
        .groupBy(collections.currency),
    ]);

    const balances = await getCollectionBalances(rows.map((row) => row.id));
    const contributionCounts = rows.length
      ? await db
          .select({
            collectionId: collectionContributions.collectionId,
            total: sql<number>`COUNT(*)`,
            completed: sql<number>`COUNT(*) FILTER (WHERE ${collectionContributions.paymentStatus} = 'completed')`,
          })
          .from(collectionContributions)
          .where(
            inArray(
              collectionContributions.collectionId,
              rows.map((row) => row.id)
            )
          )
          .groupBy(collectionContributions.collectionId)
      : [];

    const counts = new Map(
      contributionCounts.map((row) => [
        row.collectionId,
        {
          total: Number(row.total || 0),
          completed: Number(row.completed || 0),
        },
      ])
    );

    const stats = {
      totalCollections: 0,
      activeCollections: 0,
      closedCollections: 0,
      raisedByCurrency: {} as Record<string, number>,
    };
    for (const row of statusRows) {
      const rowCount = Number(row.count || 0);
      stats.totalCollections += rowCount;
      if (row.status === "active") stats.activeCollections += rowCount;
      if (row.status === "closed") stats.closedCollections += rowCount;
    }
    for (const row of raisedRows) {
      stats.raisedByCurrency[row.currency] = Number(row.total || 0);
    }

    const total = Number(totalCount[0]?.count || 0);

    return NextResponse.json({
      collections: rows.map((collection) => ({
        ...collection,
        balance: balances.get(collection.id),
        contributionCount: counts.get(collection.id)?.total ?? 0,
        completedContributionCount: counts.get(collection.id)?.completed ?? 0,
      })),
      totalPages: Math.max(Math.ceil(total / limit), 1),
      currentPage: page,
      totalCount: total,
      stats,
    });
  } catch (error) {
    const authResponse = adminAuthError(error);
    if (authResponse) return authResponse;
    console.error("Error fetching admin collections:", error);
    if (isMissingCollectionsTable(error)) {
      return NextResponse.json(
        {
          error:
            "Collections database tables are missing. Run: pnpm db:migrate-collections",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
