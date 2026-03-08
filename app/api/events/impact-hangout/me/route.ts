import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactHangoutRegistrations } from "@/lib/schema";
import { getUserFromRequest } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/impact-hangout/me
 * Returns hangout registrations for the currently logged-in user (by email).
 * Requires auth cookie.
 */
export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const normalizedEmail = userEmail.toLowerCase().trim();
    const rows = await db
      .select({
        id: impactHangoutRegistrations.id,
        slug: impactHangoutRegistrations.slug,
        hangoutName: impactHangoutRegistrations.hangoutName,
        paymentStatus: impactHangoutRegistrations.paymentStatus,
        fundraisingGoalNgn: impactHangoutRegistrations.fundraisingGoalNgn,
        commitmentAmountNgn: impactHangoutRegistrations.commitmentAmountNgn,
        totalRaisedNgn: impactHangoutRegistrations.totalRaisedNgn,
      })
      .from(impactHangoutRegistrations)
      .where(eq(impactHangoutRegistrations.email, normalizedEmail))
      .orderBy(desc(impactHangoutRegistrations.createdAt));

    const hangouts = rows.map((r) => ({
      id: r.id,
      slug: r.slug ?? r.id,
      hangoutName: r.hangoutName ?? "Impact Hangout",
      paymentStatus: r.paymentStatus,
    }));

    // Active = goal set and not yet reached
    const activeHangoutRow = rows.find((r) => {
      const goal = r.fundraisingGoalNgn ?? 0;
      if (goal <= 0) return false;
      const amountRaised =
        r.totalRaisedNgn ??
        (r.paymentStatus === "completed" && r.commitmentAmountNgn != null
          ? r.commitmentAmountNgn
          : 0);
      return amountRaised < goal;
    });
    const activeHangout =
      activeHangoutRow && activeHangoutRow.slug
        ? {
            slug: activeHangoutRow.slug,
            hangoutName: activeHangoutRow.hangoutName ?? "Impact Hangout",
          }
        : null;

    return NextResponse.json({ hangouts, activeHangout });
  } catch (error) {
    console.error("Impact Hangout me error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
