import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ambassadorApplications } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";
import { sendAmbassadorDecisionEmail } from "@/lib/notifications/ambassador-decision-emails";

const allowedDecisions = ["yes", "no", "maybe"] as const;
type DecisionValue = (typeof allowedDecisions)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);

    const { id } = await params;
    const body = await request.json();
    const decision = body?.decision as DecisionValue | undefined;

    if (!decision || !allowedDecisions.includes(decision)) {
      return NextResponse.json(
        { error: "Invalid decision value" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(ambassadorApplications)
      .where(eq(ambassadorApplications.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (existing.decision === decision) {
      return NextResponse.json({
        message: "Decision unchanged",
        application: existing,
      });
    }

    const [updated] = await db
      .update(ambassadorApplications)
      .set({ decision })
      .where(eq(ambassadorApplications.id, id))
      .returning();

    if (decision === "yes" || decision === "no") {
      try {
        await sendAmbassadorDecisionEmail({
          fullName: updated.fullName,
          email: updated.email,
          decision,
        });
      } catch (error) {
        console.error("Error sending ambassador decision email:", error);
      }
    }

    return NextResponse.json({
      message: "Decision updated",
      application: updated,
    });
  } catch (error) {
    console.error("Error updating ambassador decision:", error);
    return NextResponse.json(
      { error: "Failed to update decision" },
      { status: 500 }
    );
  }
}
