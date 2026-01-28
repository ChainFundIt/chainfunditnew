import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partnershipApplications } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);
    const { id } = await context.params;

    const body = await request.json();
    const { decision } = body || {};

    if (!decision) {
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

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error updating partnership decision:", error);
    return NextResponse.json(
      { error: "Failed to update decision" },
      { status: 500 }
    );
  }
}
