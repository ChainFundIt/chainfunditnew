import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ambassadorApplications, adminNotifications } from "@/lib/schema";
import {
  notifyAdminsOfAmbassadorApplication,
  sendAmbassadorApplicationConfirmation,
} from "@/lib/notifications/ambassador-application-alerts";

export const runtime = "nodejs";

const MAX_CV_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

const toBool = (value: FormDataEntryValue | null) => {
  if (!value) return false;
  return value.toString().toLowerCase() === "yes";
};

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fullName = formData.get("fullName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const state = formData.get("state")?.toString().trim();
    const age = Number(formData.get("age")?.toString() || 0);
    const interest = formData.get("interest")?.toString().trim();

    if (!fullName || !email || !phone || !state || !age || !interest) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cvFile = formData.get("cvFile");
    const videoFile = formData.get("videoFile");

    const [cvPayload, videoPayload] = await Promise.all([
      toFilePayload(cvFile instanceof File ? cvFile : null, MAX_CV_SIZE),
      toFilePayload(
        videoFile instanceof File ? videoFile : null,
        MAX_VIDEO_SIZE
      ),
    ]);

    const [application] = await db
      .insert(ambassadorApplications)
      .values({
        fullName,
        email,
        phone,
        stateOfResidence: state,
        age,
        massComms: toBool(formData.get("massComms")),
        createsContent: toBool(formData.get("createsContent")),
        handles: formData.get("handles")?.toString().trim() || null,
        interest,
        helpedBefore: toBool(formData.get("helpedBefore")),
        helpedDescription:
          formData.get("helpedDescription")?.toString().trim() || null,
        cvFile: cvPayload,
        introVideoFile: videoPayload,
        introVideoLink:
          formData.get("videoLink")?.toString().trim() || null,
        decision: "pending",
      })
      .returning();

    await db.insert(adminNotifications).values({
      title: "New Ambassador Application",
      message: `${fullName} submitted an ambassador application.`,
      type: "user",
      priority: "high",
      actionUrl: "/admin/ambassador-applications",
      actionLabel: "Review applications",
      metadata: {
        applicationId: application.id,
        applicantEmail: email,
      },
    });

    await Promise.all([
      notifyAdminsOfAmbassadorApplication({
        applicationId: application.id,
        fullName,
        email,
        stateOfResidence: state,
        hasCv: Boolean(cvPayload),
        hasVideo: Boolean(videoPayload),
        videoLink: formData.get("videoLink")?.toString().trim() || null,
      }),
      sendAmbassadorApplicationConfirmation(email, fullName),
    ]);

    return NextResponse.json({ applicationId: application.id });
  } catch (error) {
    console.error("Ambassador application error:", error);

    const message =
      error instanceof Error && error.message === "File too large"
        ? "File too large. Please upload a smaller file."
        : "Failed to submit application";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
