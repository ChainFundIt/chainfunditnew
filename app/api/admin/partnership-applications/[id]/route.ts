import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partnershipApplications } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);
    const { id } = await context.params;

    const [deleted] = await db
      .delete(partnershipApplications)
      .where(eq(partnershipApplications.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partnership application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
