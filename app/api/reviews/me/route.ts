import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  platformReviews,
  users,
  donations,
  campaignPayouts,
} from "@/lib/schema";
import { getUserFromRequest } from "@/lib/auth";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

const reviewPayloadSchema = z.object({
  rating: z.number().int().min(1).max(5),
  headline: z.string().trim().max(120).optional().nullable(),
  body: z.string().trim().max(1000).optional().nullable(),
  isAnonymous: z.boolean().optional().default(false),
});

function containsPII(text: string) {
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const phoneRegex = /(\+?\d[\d\s().-]{7,}\d)/;
  return emailRegex.test(text) || phoneRegex.test(text);
}

async function getAuthedUser(request: NextRequest) {
  const email = await getUserFromRequest(request);
  if (!email) return null;

  const [user] = await db
    .select({ id: users.id, email: users.email, fullName: users.fullName })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

async function getEligibility(userId: string) {
  const [row] = (await db.execute(sql`
    select
      exists(
        select 1 from ${donations}
        where ${donations.donorId} = ${userId}
          and ${donations.paymentStatus} = 'completed'
      ) as "donorEligible",
      exists(
        select 1 from ${campaignPayouts}
        where ${campaignPayouts.userId} = ${userId}
          and ${campaignPayouts.status} = 'completed'
      ) as "creatorEligible"
  `)) as Array<{ donorEligible: boolean; creatorEligible: boolean }>;

  const donorEligible = Boolean(row?.donorEligible);
  const creatorEligible = Boolean(row?.creatorEligible);
  const eligible = donorEligible || creatorEligible;
  const role =
    donorEligible && creatorEligible
      ? "both"
      : creatorEligible
        ? "creator"
        : "donor";

  return { eligible, donorEligible, creatorEligible, role };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const eligibility = await getEligibility(user.id);

    const [review] = await db
      .select({
        id: platformReviews.id,
        rating: platformReviews.rating,
        headline: platformReviews.headline,
        body: platformReviews.body,
        isAnonymous: platformReviews.isAnonymous,
        createdAt: platformReviews.createdAt,
        updatedAt: platformReviews.updatedAt,
      })
      .from(platformReviews)
      .where(eq(platformReviews.userId, user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      eligible: eligibility.eligible,
      role: eligibility.role,
      review: review ?? null,
      user: { id: user.id, fullName: user.fullName },
      mode: review ? "edit" : "create",
    });
  } catch (error) {
    console.error("Error in GET /api/reviews/me:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load your review" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const eligibility = await getEligibility(user.id);
    if (!eligibility.eligible) {
      return NextResponse.json(
        { success: false, error: "You are not eligible to leave a review yet." },
        { status: 403 }
      );
    }

    const [existing] = await db
      .select({ id: platformReviews.id })
      .from(platformReviews)
      .where(eq(platformReviews.userId, user.id))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, error: "You already have a review. Please edit it." },
        { status: 409 }
      );
    }

    const json = await request.json();
    const parsed = reviewPayloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data.body ?? "";
    const headline = parsed.data.headline ?? "";
    if (containsPII(`${headline} ${body}`)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please remove personal contact information (emails/phone numbers) from your review.",
        },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(platformReviews)
      .values({
        userId: user.id,
        rating: parsed.data.rating,
        headline: parsed.data.headline ?? null,
        body: parsed.data.body ?? null,
        isAnonymous: parsed.data.isAnonymous ?? false,
      })
      .returning({
        id: platformReviews.id,
        rating: platformReviews.rating,
        headline: platformReviews.headline,
        body: platformReviews.body,
        isAnonymous: platformReviews.isAnonymous,
        createdAt: platformReviews.createdAt,
        updatedAt: platformReviews.updatedAt,
      });

    return NextResponse.json({
      success: true,
      review: created,
      role: eligibility.role,
    });
  } catch (error) {
    console.error("Error in POST /api/reviews/me:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit your review" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const eligibility = await getEligibility(user.id);
    if (!eligibility.eligible) {
      return NextResponse.json(
        { success: false, error: "You are not eligible to edit a review yet." },
        { status: 403 }
      );
    }

    const [existing] = await db
      .select({
        id: platformReviews.id,
        updatedAt: platformReviews.updatedAt,
      })
      .from(platformReviews)
      .where(eq(platformReviews.userId, user.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "No review found to edit." },
        { status: 404 }
      );
    }

    // Basic rate limit: 1 edit per 24 hours
    const lastUpdated = existing.updatedAt ? new Date(existing.updatedAt) : null;
    if (lastUpdated) {
      const hoursSince =
        (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return NextResponse.json(
          {
            success: false,
            error:
              "You can update your review once every 24 hours. Please try again later.",
          },
          { status: 429 }
        );
      }
    }

    const json = await request.json();
    const parsed = reviewPayloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data.body ?? "";
    const headline = parsed.data.headline ?? "";
    if (containsPII(`${headline} ${body}`)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please remove personal contact information (emails/phone numbers) from your review.",
        },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(platformReviews)
      .set({
        rating: parsed.data.rating,
        headline: parsed.data.headline ?? null,
        body: parsed.data.body ?? null,
        isAnonymous: parsed.data.isAnonymous ?? false,
        updatedAt: new Date(),
      })
      .where(and(eq(platformReviews.id, existing.id), eq(platformReviews.userId, user.id)))
      .returning({
        id: platformReviews.id,
        rating: platformReviews.rating,
        headline: platformReviews.headline,
        body: platformReviews.body,
        isAnonymous: platformReviews.isAnonymous,
        createdAt: platformReviews.createdAt,
        updatedAt: platformReviews.updatedAt,
      });

    return NextResponse.json({ success: true, review: updated, role: eligibility.role });
  } catch (error) {
    console.error("Error in PUT /api/reviews/me:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update your review" },
      { status: 500 }
    );
  }
}

