import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactHangoutRegistrations } from "@/lib/schema";
import { normalizeEmail } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { sendImpactHangoutAccessLinkEmail } from "@/lib/notifications/impact-hangout-emails";

export const dynamic = "force-dynamic";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";

/**
 * POST /api/events/impact-hangout/send-access-link
 * Body: { email: string }
 * If a hangout registration exists for this email, sends an email with a link to their page.
 * Always returns { success: true } to avoid leaking whether the email is registered.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email;
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalized = normalizeEmail(email.trim());
    const [registration] = await db
      .select({
        fullName: impactHangoutRegistrations.fullName,
        hangoutName: impactHangoutRegistrations.hangoutName,
        slug: impactHangoutRegistrations.slug,
        id: impactHangoutRegistrations.id,
      })
      .from(impactHangoutRegistrations)
      .where(eq(impactHangoutRegistrations.email, normalized))
      .orderBy(desc(impactHangoutRegistrations.createdAt))
      .limit(1);

    if (registration) {
      const pageSlug = registration.slug ?? registration.id;
      const pageUrl = `${baseUrl}/events/${encodeURIComponent(pageSlug)}`;
      await sendImpactHangoutAccessLinkEmail({
        to: normalized,
        hostName: registration.fullName,
        hangoutName: registration.hangoutName ?? "Impact Hangout",
        pageUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "If we have a hangout registered with that email, we've sent you a link.",
    });
  } catch (error) {
    console.error("Impact Hangout send-access-link error:", error);
    return NextResponse.json(
      { success: true, message: "If we have a hangout registered with that email, we've sent you a link." }
    );
  }
}
