import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { careerApplications, careerOpenings } from "@/lib/schema";
import { createAdminNotification } from "@/lib/notifications/application-notification-utils";

export const runtime = "nodejs";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const toFilePayload = async (file: File | null, maxSize: number) => {
  if (!file || file.size === 0) return null;
  if (file.size > maxSize) {
    throw new Error("File too large");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    data: buffer.toString("base64"),
  };
};

const isValidUrl = (value: string) => {
  if (!value.trim()) return true;

  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const [opening] = await db
      .select()
      .from(careerOpenings)
      .where(eq(careerOpenings.id, id))
      .limit(1);

    if (!opening || !opening.isActive) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const fullName = formData.get("fullName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const cityState = formData.get("cityState")?.toString().trim() || "";
    const linkedInUrl = formData.get("linkedInUrl")?.toString().trim() || "";
    const portfolioUrl = formData.get("portfolioUrl")?.toString().trim() || "";
    const coverLetter = formData.get("coverLetter")?.toString().trim();
    const additionalInfo =
      formData.get("additionalInfo")?.toString().trim() || "";
    const consentToContact =
      formData.get("consentToContact")?.toString().toLowerCase() !== "no";
    const resumeFile = formData.get("resumeFile");

    if (!fullName || !email || !phone || !coverLetter) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!resumeFile || !(resumeFile instanceof File) || resumeFile.size === 0) {
      return NextResponse.json(
        { error: "Resume or CV is required" },
        { status: 400 }
      );
    }

    if (!isValidUrl(linkedInUrl) || !isValidUrl(portfolioUrl)) {
      return NextResponse.json(
        { error: "Profile links must start with http:// or https://." },
        { status: 400 }
      );
    }

    const resumePayload = await toFilePayload(resumeFile, MAX_RESUME_SIZE);

    const [application] = await db
      .insert(careerApplications)
      .values({
        careerOpeningId: opening.id,
        fullName,
        email,
        phone,
        cityState: cityState || null,
        linkedInUrl: linkedInUrl || null,
        portfolioUrl: portfolioUrl || null,
        coverLetter,
        additionalInfo: additionalInfo || null,
        resumeFile: resumePayload,
        consentToContact,
      })
      .returning();

    await createAdminNotification({
      title: "New Career Application",
      message: `${fullName} applied for ${opening.title}.`,
      type: "user",
      priority: "high",
      actionUrl: "/admin/career-applications",
      actionLabel: "Review applications",
      metadata: {
        applicationId: application.id,
        applicantEmail: email,
        careerOpeningId: opening.id,
      },
    });

    return NextResponse.json({ applicationId: application.id });
  } catch (error) {
    console.error("Career application error:", error);

    if (error instanceof Error && error.message === "File too large") {
      return NextResponse.json(
        { error: "Resume is too large. Please upload a file smaller than 5MB." },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
