import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { careerApplications } from "@/lib/schema";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";

const validDecisions = new Set(["pending", "maybe", "yes", "no"]);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);
    const { id } = await context.params;
    const body = await request.json();
    const decision = typeof body?.decision === "string" ? body.decision : "";

    if (!validDecisions.has(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const [application] = await db
      .update(careerApplications)
      .set({ decision })
      .where(eq(careerApplications.id, id))
      .returning();

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error updating career application decision:", error);
    return NextResponse.json(
      { error: "Failed to update decision" },
      { status: 500 }
    );
  }
}
