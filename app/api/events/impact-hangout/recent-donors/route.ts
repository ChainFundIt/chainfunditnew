import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactHangoutRegistrations } from "@/lib/schema";
import { and, desc, eq, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select({
        fullName: impactHangoutRegistrations.fullName,
        amount: impactHangoutRegistrations.commitmentAmountNgn,
        paidAt: impactHangoutRegistrations.paidAt,
      })
      .from(impactHangoutRegistrations)
      .where(
        and(
          eq(impactHangoutRegistrations.paymentStatus, "completed"),
          isNotNull(impactHangoutRegistrations.commitmentAmountNgn)
        )
      )
      .orderBy(desc(impactHangoutRegistrations.paidAt))
      .limit(20);

    const donors = rows.map((r) => {
      const firstName =
        typeof r.fullName === "string" && r.fullName.trim()
          ? r.fullName.trim().split(/\s+/)[0]
          : "Someone";
      return {
        name: firstName,
        amount: r.amount ?? 0,
        paidAt: r.paidAt,
      };
    });

    return NextResponse.json({ donors });
  } catch (error) {
    console.error("Impact Hangout recent donors error:", error);
    return NextResponse.json({ donors: [] });
  }
}
