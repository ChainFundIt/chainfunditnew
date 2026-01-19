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

    if (!application?.introVideoFile) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    const videoFile = application.introVideoFile as any;
    const buffer = Buffer.from(videoFile.data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": videoFile.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${
          videoFile.name || "intro-video"
        }"`,
      },
    });
  } catch (error) {
    console.error("Error downloading video:", error);
    return NextResponse.json(
      { error: "Failed to download video" },
      { status: 500 }
    );
  }
}
