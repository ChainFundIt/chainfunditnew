import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { collectionPayouts, collections } from "@/lib/schema/collections";
import { users } from "@/lib/schema/users";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";

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
          sql`${users.fullName} ILIKE ${`%${search}%`}`,
          sql`${users.email} ILIKE ${`%${search}%`}`,
          sql`${collections.title} ILIKE ${`%${search}%`}`
        )
      );
    }
    if (status !== "all") {
      whereConditions.push(eq(collectionPayouts.status, status));
    }
    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [payoutsList, totalCount, statusRows] = await Promise.all([
      db
        .select({
          id: collectionPayouts.id,
          requestedAmount: collectionPayouts.requestedAmount,
          grossAmount: collectionPayouts.grossAmount,
          fees: collectionPayouts.fees,
          netAmount: collectionPayouts.netAmount,
          currency: collectionPayouts.currency,
          status: collectionPayouts.status,
          payoutProvider: collectionPayouts.payoutProvider,
          reference: collectionPayouts.reference,
          bankName: collectionPayouts.bankName,
          accountNumber: collectionPayouts.accountNumber,
          accountName: collectionPayouts.accountName,
          rejectionReason: collectionPayouts.rejectionReason,
          failureReason: collectionPayouts.failureReason,
          createdAt: collectionPayouts.createdAt,
          userName: users.fullName,
          userEmail: users.email,
          collectionTitle: collections.title,
          collectionSlug: collections.slug,
        })
        .from(collectionPayouts)
        .leftJoin(users, eq(collectionPayouts.userId, users.id))
        .leftJoin(collections, eq(collectionPayouts.collectionId, collections.id))
        .where(whereClause)
        .orderBy(desc(collectionPayouts.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(collectionPayouts)
        .leftJoin(users, eq(collectionPayouts.userId, users.id))
        .leftJoin(collections, eq(collectionPayouts.collectionId, collections.id))
        .where(whereClause),
      db
        .select({
          status: collectionPayouts.status,
          currency: collectionPayouts.currency,
          total: sql<string>`COALESCE(SUM(${collectionPayouts.requestedAmount}), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(collectionPayouts)
        .groupBy(collectionPayouts.status, collectionPayouts.currency),
    ]);

    const stats = {
      totalPayouts: 0,
      pendingPayouts: 0,
      pendingAmountByCurrency: {} as Record<string, number>,
      paidAmountByCurrency: {} as Record<string, number>,
    };

    for (const row of statusRows) {
      const rowCount = Number(row.count || 0);
      const amount = Number(row.total || 0);
      stats.totalPayouts += rowCount;
      if (row.status === "pending") {
        stats.pendingPayouts += rowCount;
        stats.pendingAmountByCurrency[row.currency] =
          (stats.pendingAmountByCurrency[row.currency] || 0) + amount;
      }
      if (row.status === "completed") {
        stats.paidAmountByCurrency[row.currency] =
          (stats.paidAmountByCurrency[row.currency] || 0) + amount;
      }
    }

    const total = Number(totalCount[0]?.count || 0);

    return NextResponse.json({
      payouts: payoutsList,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      currentPage: page,
      totalCount: total,
      stats,
    });
  } catch (error) {
    const authResponse = adminAuthError(error);
    if (authResponse) return authResponse;
    console.error("Error fetching collection payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection payouts" },
      { status: 500 }
    );
  }
}
