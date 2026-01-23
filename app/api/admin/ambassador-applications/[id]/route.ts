import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ambassadorApplications } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";

/**
 * DELETE /api/admin/ambassador-applications/[id]
 * Delete an ambassador application (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);

    const { id } = await params;
    const [deleted] = await db
      .delete(ambassadorApplications)
      .where(eq(ambassadorApplications.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    console.error("Error deleting ambassador application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
