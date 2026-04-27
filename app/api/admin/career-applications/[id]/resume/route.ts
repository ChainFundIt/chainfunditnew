import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { careerApplications } from "@/lib/schema";
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
      .from(careerApplications)
      .where(eq(careerApplications.id, id))
      .limit(1);

    if (!application?.resumeFile) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const resumeFile = application.resumeFile as any;
    const buffer = Buffer.from(resumeFile.data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": resumeFile.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${resumeFile.name || "resume"}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading career application resume:", error);
    return NextResponse.json(
      { error: "Failed to download resume" },
      { status: 500 }
    );
  }
}
