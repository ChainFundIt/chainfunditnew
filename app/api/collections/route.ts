import { NextRequest, NextResponse } from "next/server";
import { db, withRetry } from "@/lib/db";
import { collections, type NewCollection } from "@/lib/schema/collections";
import { users } from "@/lib/schema/users";
import { getUserFromRequest } from "@/lib/auth";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 100);
    const offset = (page - 1) * limit;
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") || "recent";

    const conditions = [
      eq(collections.isPublic, true),
      eq(collections.status, "active"),
    ];

    if (search) {
      conditions.push(
        or(
          ilike(collections.title, `%${search}%`),
          ilike(collections.description, `%${search}%`),
          ilike(collections.organiserName, `%${search}%`)
        )!
      );
    }

    if (category) {
      conditions.push(eq(collections.category, category));
    }

    const whereClause = and(...conditions);
    const orderBy =
      sortBy === "raised"
        ? desc(collections.totalRaised)
        : desc(collections.createdAt);

    const [list, countResult] = await withRetry(() =>
      Promise.all([
        db.query.collections.findMany({
          where: whereClause,
          orderBy,
          limit,
          offset,
        }),
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(collections)
          .where(whereClause),
      ])
    );

    return NextResponse.json({
      collections: list,
      pagination: {
        page,
        limit,
        total: Number(countResult[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    const pgCode =
      error &&
      typeof error === "object" &&
      "cause" in error &&
      error.cause &&
      typeof error.cause === "object" &&
      "code" in error.cause
        ? String((error.cause as { code?: string }).code)
        : null;

    if (pgCode === "42P01") {
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

export async function POST(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
      })
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${userEmail})`)
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const title = String(body.title || "").trim();
    const description = body.description
      ? String(body.description).trim()
      : null;
    const organiserName = String(
      body.organiserName || user.fullName || "Organiser"
    ).trim();
    const coverImage = body.coverImage ? String(body.coverImage) : null;
    const currency = String(body.currency || "USD").toUpperCase();
    const targetAmount =
      body.targetAmount != null && body.targetAmount !== ""
        ? String(body.targetAmount)
        : null;
    const dueAt = body.dueAt ? new Date(body.dueAt) : null;
    const category = body.category ? String(body.category).trim() : null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json(
        { error: "Please choose what you are collecting for" },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(title) || "collection";
    const existing = await db
      .select({ slug: collections.slug })
      .from(collections)
      .where(ilike(collections.slug, `${baseSlug}%`));

    const slug = generateUniqueSlug(
      baseSlug,
      existing.map((row) => row.slug)
    );

    const payload: NewCollection = {
      creatorId: user.id,
      title,
      slug,
      description,
      category,
      organiserName,
      coverImage,
      currency,
      targetAmount,
      dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null,
      status: "active",
      isPublic: true,
    };

    const [created] = await db
      .insert(collections)
      .values(payload)
      .returning();

    return NextResponse.json({ collection: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}