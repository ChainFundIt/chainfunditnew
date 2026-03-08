import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactHangoutRegistrations } from "@/lib/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        { error: "Hangout slug is required" },
        { status: 400 }
      );
    }

    const slugLower = slug.trim().toLowerCase();
    const [row] = await db
      .select({
        id: impactHangoutRegistrations.id,
        slug: impactHangoutRegistrations.slug,
        hangoutName: impactHangoutRegistrations.hangoutName,
        fullName: impactHangoutRegistrations.fullName,
        eventType: impactHangoutRegistrations.eventType,
        cause: impactHangoutRegistrations.cause,
        fundraisingGoalNgn: impactHangoutRegistrations.fundraisingGoalNgn,
        commitmentAmountNgn: impactHangoutRegistrations.commitmentAmountNgn,
        totalRaisedNgn: impactHangoutRegistrations.totalRaisedNgn,
        paymentStatus: impactHangoutRegistrations.paymentStatus,
      })
      .from(impactHangoutRegistrations)
      .where(sql`LOWER(TRIM(${impactHangoutRegistrations.slug})) = ${slugLower}`)
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Hangout not found" }, { status: 404 });
    }

    const amountRaised =
      row.totalRaisedNgn ??
      (row.paymentStatus === "completed" && row.commitmentAmountNgn != null
        ? row.commitmentAmountNgn
        : 0);
    const goal = row.fundraisingGoalNgn ?? 0;

    return NextResponse.json({
      id: row.id,
      slug: row.slug,
      hangoutName: row.hangoutName ?? "Impact Hangout",
      hostName: row.fullName,
      eventType: row.eventType ?? undefined,
      cause: row.cause ?? undefined,
      fundraisingGoalNgn: goal,
      amountRaisedNgn: amountRaised,
      progressPercent:
        goal > 0 ? Math.min(100, Math.round((amountRaised / goal) * 100)) : 0,
    });
  } catch (error) {
    console.error("Impact Hangout get error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
