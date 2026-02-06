import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partnershipApplications } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";
import { sendPartnershipDecisionEmail } from "@/lib/notifications/partnership-decision-emails";

const allowedDecisions = ["yes", "no", "maybe"] as const;
type DecisionValue = (typeof allowedDecisions)[number];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);
    const { id } = await context.params;

    const body = await request.json();
    const decision = body?.decision as DecisionValue | undefined;

    if (!decision || !allowedDecisions.includes(decision)) {
      return NextResponse.json(
        { error: "Decision is required" },
        { status: 400 }
      );
    }

    const [application] = await db
      .update(partnershipApplications)
      .set({ decision })
      .where(eq(partnershipApplications.id, id))
      .returning();

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (decision === "yes" || decision === "no") {
      try {
        await sendPartnershipDecisionEmail({
          fullName: application.fullName,
          email: application.email,
          decision,
        });
      } catch (error) {
        console.error("Error sending partnership decision email:", error);
      }
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error updating partnership decision:", error);
    return NextResponse.json(
      { error: "Failed to update decision" },
      { status: 500 }
    );
  }
}
