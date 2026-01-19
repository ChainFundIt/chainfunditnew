import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { platformReviews, users, donations, campaignPayouts } from "@/lib/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitRaw ?? "10") || 10, 1), 20);

    const donorEligibleSql = sql<boolean>`exists(
      select 1 from ${donations}
      where ${donations.donorId} = ${users.id}
        and ${donations.paymentStatus} = 'completed'
    )`;

    const creatorEligibleSql = sql<boolean>`exists(
      select 1 from ${campaignPayouts}
      where ${campaignPayouts.userId} = ${users.id}
        and ${campaignPayouts.status} = 'completed'
    )`;

    const displayNameSql = sql<string>`case
      when ${platformReviews.isAnonymous} then 'Anonymous'
      else ${users.fullName}
    end`;

    const rows = await db
      .select({
        id: platformReviews.id,
        rating: platformReviews.rating,
        headline: platformReviews.headline,
        body: platformReviews.body,
        isAnonymous: platformReviews.isAnonymous,
        createdAt: platformReviews.createdAt,
        updatedAt: platformReviews.updatedAt,
        displayName: displayNameSql,
        donorEligible: donorEligibleSql,
        creatorEligible: creatorEligibleSql,
      })
      .from(platformReviews)
      .innerJoin(users, eq(platformReviews.userId, users.id))
      .orderBy(desc(platformReviews.updatedAt))
      .limit(limit);

    const reviews = rows.map((r) => {
      const role =
        r.donorEligible && r.creatorEligible
          ? "both"
          : r.creatorEligible
            ? "creator"
            : "donor";
      return {
        id: r.id,
        rating: r.rating,
        headline: r.headline,
        body: r.body,
        displayName: r.displayName,
        role,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Error in /api/reviews/public:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}

