import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ambassadorApplications } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuthWith2FA(request);
    const { id } = await context.params;

    const [application] = await db
      .select()
      .from(ambassadorApplications)
      .where(eq(ambassadorApplications.id, id))
      .limit(1);

    if (!application?.cvFile) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    const cvFile = application.cvFile as any;
    const buffer = Buffer.from(cvFile.data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": cvFile.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${cvFile.name || "cv"}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading CV:", error);
    return NextResponse.json({ error: "Failed to download CV" }, { status: 500 });
  }
}
