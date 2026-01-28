import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partnershipApplications } from "@/lib/schema";
import {
  notifyAdminsOfPartnershipApplication,
  sendPartnershipApplicationConfirmation,
} from "@/lib/notifications/partnership-application-alerts";
import { createAdminNotification } from "@/lib/notifications/application-notification-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      cityState,
      availability,
      startTimeline,
      motivation,
      targetsComfort,
      explainChainfundit,
      respondToCharity,
      dmToCharity,
      messageToFamily,
      convincedBefore,
      handleRejection,
      hoursPerWeek,
      hasInternet,
      meaningOfDoingGood,
      additionalInfo,
    } = body || {};

    if (
      !fullName ||
      !email ||
      !phone ||
      !cityState ||
      !availability ||
      !startTimeline ||
      !motivation ||
      typeof targetsComfort !== "boolean" ||
      !explainChainfundit ||
      !respondToCharity ||
      !dmToCharity ||
      !messageToFamily ||
      !convincedBefore ||
      !handleRejection ||
      !hoursPerWeek ||
      typeof hasInternet !== "boolean" ||
      !meaningOfDoingGood
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const motivationWords = motivation.trim().split(/\s+/).filter(Boolean).length;
    if (motivationWords < 200 || motivationWords > 300) {
      return NextResponse.json(
        { error: "Motivation must be between 200 and 300 words" },
        { status: 400 }
      );
    }

    const [application] = await db
      .insert(partnershipApplications)
      .values({
        fullName,
        email,
        phone,
        cityState,
        availability,
        startTimeline,
        motivation,
        targetsComfort,
        explainChainfundit,
        respondToCharity,
        dmToCharity,
        messageToFamily,
        convincedBefore,
        handleRejection,
        hoursPerWeek: Number(hoursPerWeek),
        hasInternet,
        meaningOfDoingGood,
        additionalInfo: additionalInfo || null,
        decision: "pending",
      })
      .returning();

    await createAdminNotification({
      title: "New Partnerships Application",
      message: `${fullName} submitted a Partnerships & Growth Associate application.`,
      type: "user",
      priority: "high",
      actionUrl: "/admin/partnership-applications",
      actionLabel: "Review applications",
      metadata: {
        applicationId: application.id,
        applicantEmail: email,
      },
    });

    await Promise.all([
      notifyAdminsOfPartnershipApplication({
        applicationId: application.id,
        fullName,
        email,
        cityState,
        availability,
      }),
      sendPartnershipApplicationConfirmation(email, fullName),
    ]);

    return NextResponse.json({ applicationId: application.id });
  } catch (error) {
    console.error("Partnership application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
