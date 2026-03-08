import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactHangoutRegistrations } from "@/lib/schema";
import { normalizeEmail } from "@/lib/db";
import { generateSlug, generateUniqueSlug } from "@/lib/utils/slug";
import { like, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      hostType,
      plannedWhen,
      cause,
      receiveUpdates,
      eventType,
      hangoutName,
      fundraisingGoalNgn,
    } = body || {};

    if (!fullName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email.trim());

    // Block if user already has an active hangout (goal not yet reached)
    const existingByEmail = await db
      .select({
        slug: impactHangoutRegistrations.slug,
        fundraisingGoalNgn: impactHangoutRegistrations.fundraisingGoalNgn,
        commitmentAmountNgn: impactHangoutRegistrations.commitmentAmountNgn,
        totalRaisedNgn: impactHangoutRegistrations.totalRaisedNgn,
        paymentStatus: impactHangoutRegistrations.paymentStatus,
      })
      .from(impactHangoutRegistrations)
      .where(sql`LOWER(${impactHangoutRegistrations.email}) = LOWER(${normalizedEmail})`);

    const active = existingByEmail.find((r) => {
      const goal = r.fundraisingGoalNgn ?? 0;
      if (goal <= 0) return false;
      const amountRaised =
        r.totalRaisedNgn ??
        (r.paymentStatus === "completed" && r.commitmentAmountNgn != null
          ? r.commitmentAmountNgn
          : 0);
      return amountRaised < goal;
    });

    if (active) {
      return NextResponse.json(
        {
          error: "You already have an active Impact Hangout. Reach your current goal or wait until it ends before creating another.",
          code: "ACTIVE_HANGOUT_EXISTS",
          slug: active.slug ?? undefined,
        },
        { status: 409 }
      );
    }

    const goalNgn =
      typeof fundraisingGoalNgn === "number" && fundraisingGoalNgn > 0
        ? Math.round(fundraisingGoalNgn)
        : null;

    const nameForSlug = hangoutName?.trim() || "impact-hangout";
    const baseSlug = generateSlug(nameForSlug) || "impact-hangout";
    const existing = await db
      .select({ slug: impactHangoutRegistrations.slug })
      .from(impactHangoutRegistrations)
      .where(like(impactHangoutRegistrations.slug, `${baseSlug}%`));
    const slug = generateUniqueSlug(
      baseSlug,
      existing.map((r) => r.slug).filter(Boolean) as string[]
    );

    const [registration] = await db
      .insert(impactHangoutRegistrations)
      .values({
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
        hostType: hostType?.trim() || null,
        plannedWhen: plannedWhen?.trim() || null,
        cause: cause?.trim() || null,
        receiveUpdates: Boolean(receiveUpdates),
        eventType: eventType?.trim() || null,
        hangoutName: hangoutName?.trim() || null,
        slug,
        fundraisingGoalNgn: goalNgn,
        paymentStatus: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      id: registration.id,
      slug: registration.slug ?? slug,
    });
  } catch (error) {
    console.error("Impact Hangout registration error:", error);
    return NextResponse.json(
      { error: "Failed to submit registration" },
      { status: 500 }
    );
  }
}
