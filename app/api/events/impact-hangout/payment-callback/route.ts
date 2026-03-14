import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactHangoutRegistrations } from "@/lib/schema";
import { verifyPaystackPayment } from "@/lib/payments/paystack";
import { capturePayPalOrder } from "@/lib/payments/paypal";
import { eq, sql } from "drizzle-orm";
import { sendImpactHangoutMilestoneEmail } from "@/lib/notifications/impact-hangout-emails";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";

const MILESTONES = [25, 50, 75, 100] as const;
const MILESTONE_COLUMNS = {
  25: "milestone25SentAt" as const,
  50: "milestone50SentAt" as const,
  75: "milestone75SentAt" as const,
  100: "milestone100SentAt" as const,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const token = searchParams.get("token");

    if (token) {
      const capture = await capturePayPalOrder(token);
      if (capture.status !== "COMPLETED") {
        return NextResponse.redirect(
          `${baseUrl}/events?donation=failed&error=paypal_capture_incomplete`
        );
      }

      const customId = capture.purchase_units?.[0]?.custom_id || "";
      const [hangoutSlug = "", amountRaw = "0"] = customId.split("|");
      const amountNgn = parseInt(amountRaw, 10);

      if (!hangoutSlug || !Number.isFinite(amountNgn) || amountNgn <= 0) {
        return NextResponse.redirect(
          `${baseUrl}/events?donation=failed&error=invalid_paypal_metadata`
        );
      }

      const slugLower = String(hangoutSlug).trim().toLowerCase();
      const [row] = await db
        .select()
        .from(impactHangoutRegistrations)
        .where(sql`LOWER(TRIM(${impactHangoutRegistrations.slug})) = ${slugLower}`)
        .limit(1);

      if (!row) {
        return NextResponse.redirect(
          `${baseUrl}/events?donation=failed&error=hangout_not_found`
        );
      }

      const currentTotal =
        row.totalRaisedNgn ??
        (row.paymentStatus === "completed" && row.commitmentAmountNgn != null
          ? row.commitmentAmountNgn
          : 0);
      const newTotal = currentTotal + amountNgn;

      await db
        .update(impactHangoutRegistrations)
        .set({ totalRaisedNgn: newTotal })
        .where(eq(impactHangoutRegistrations.id, row.id));

      const [updated] = await db
        .select()
        .from(impactHangoutRegistrations)
        .where(eq(impactHangoutRegistrations.id, row.id))
        .limit(1);

      if (updated) {
        const goal = updated.fundraisingGoalNgn ?? 0;
        const amountRaised = updated.totalRaisedNgn ?? newTotal;
        const progressPercent =
          goal > 0 ? Math.min(100, Math.round((amountRaised / goal) * 100)) : 0;
        const pageUrl = updated.slug
          ? `${baseUrl}/events/${encodeURIComponent(updated.slug)}`
          : `${baseUrl}/events`;

        for (const p of MILESTONES) {
          if (progressPercent < p) continue;
          const col = MILESTONE_COLUMNS[p];
          const alreadySent = updated[col];
          if (alreadySent) continue;
          const sent = await sendImpactHangoutMilestoneEmail({
            to: updated.email,
            hostName: updated.fullName,
            hangoutName: updated.hangoutName ?? "Impact Hangout",
            milestonePercent: p,
            amountRaisedNgn: amountRaised,
            goalNgn: goal,
            pageUrl,
          });
          if (sent && !sent.error) {
            await db
              .update(impactHangoutRegistrations)
              .set({ [col]: new Date() })
              .where(eq(impactHangoutRegistrations.id, row.id));
          }
        }
      }

      return NextResponse.redirect(
        `${baseUrl}/events/${encodeURIComponent(row.slug ?? hangoutSlug)}?donation=success`
      );
    }

    if (!reference) {
      return NextResponse.redirect(
        `${baseUrl}/events/register?payment=failed&error=missing_reference`
      );
    }

    const verification = await verifyPaystackPayment(reference);

    if (
      !verification?.status ||
      verification?.data?.status !== "success"
    ) {
      return NextResponse.redirect(
        `${baseUrl}/events/register?payment=failed&error=verification_failed`
      );
    }

    const metadata = verification.data?.metadata ?? {};
    const isDonation = metadata.type === "donation";

    if (isDonation) {
      const hangoutSlug = metadata.impactHangoutSlug;
      const rawAmount = metadata.amountNgn;
      const amountNgn =
        typeof rawAmount === "number"
          ? rawAmount
          : typeof rawAmount === "string"
            ? parseInt(rawAmount, 10)
            : 0;
      if (!hangoutSlug || amountNgn <= 0) {
        return NextResponse.redirect(
          `${baseUrl}/events?donation=failed&error=invalid_metadata`
        );
      }
      const slugLower = String(hangoutSlug).trim().toLowerCase();
      const [row] = await db
        .select()
        .from(impactHangoutRegistrations)
        .where(sql`LOWER(TRIM(${impactHangoutRegistrations.slug})) = ${slugLower}`)
        .limit(1);
      if (!row) {
        return NextResponse.redirect(
          `${baseUrl}/events?donation=failed&error=hangout_not_found`
        );
      }
      const currentTotal = row.totalRaisedNgn ?? (row.paymentStatus === "completed" && row.commitmentAmountNgn != null ? row.commitmentAmountNgn : 0);
      const newTotal = currentTotal + amountNgn;
      await db
        .update(impactHangoutRegistrations)
        .set({ totalRaisedNgn: newTotal })
        .where(eq(impactHangoutRegistrations.id, row.id));

      const [updated] = await db
        .select()
        .from(impactHangoutRegistrations)
        .where(eq(impactHangoutRegistrations.id, row.id))
        .limit(1);
      if (updated) {
        const goal = updated.fundraisingGoalNgn ?? 0;
        const amountRaised = updated.totalRaisedNgn ?? newTotal;
        const progressPercent = goal > 0 ? Math.min(100, Math.round((amountRaised / goal) * 100)) : 0;
        const pageUrl = updated.slug
          ? `${baseUrl}/events/${encodeURIComponent(updated.slug)}`
          : `${baseUrl}/events`;
        for (const p of MILESTONES) {
          if (progressPercent < p) continue;
          const col = MILESTONE_COLUMNS[p];
          const alreadySent = updated[col];
          if (alreadySent) continue;
          const sent = await sendImpactHangoutMilestoneEmail({
            to: updated.email,
            hostName: updated.fullName,
            hangoutName: updated.hangoutName ?? "Impact Hangout",
            milestonePercent: p,
            amountRaisedNgn: amountRaised,
            goalNgn: goal,
            pageUrl,
          });
          if (sent && !sent.error) {
            await db
              .update(impactHangoutRegistrations)
              .set({ [col]: new Date() })
              .where(eq(impactHangoutRegistrations.id, row.id));
          }
        }
      }
      const slug = updated?.slug ?? hangoutSlug;
      return NextResponse.redirect(
        `${baseUrl}/events/${encodeURIComponent(slug)}?donation=success`
      );
    }

    const registrationId = metadata.impactHangoutRegistrationId;
    const rawAmount = metadata.commitmentAmountNgn;
    const commitmentAmountNgn =
      typeof rawAmount === "number"
        ? rawAmount
        : typeof rawAmount === "string"
          ? parseInt(rawAmount, 10)
          : null;

    if (!registrationId) {
      return NextResponse.redirect(
        `${baseUrl}/events/register?payment=failed&error=invalid_metadata`
      );
    }

    const [registration] = await db
      .select()
      .from(impactHangoutRegistrations)
      .where(eq(impactHangoutRegistrations.id, registrationId))
      .limit(1);

    if (!registration) {
      return NextResponse.redirect(
        `${baseUrl}/events/register?payment=failed&error=registration_not_found`
      );
    }

    if (registration.paymentStatus === "completed") {
      const slug = registration.slug;
      return NextResponse.redirect(
        slug
          ? `${baseUrl}/events/register?payment=success&slug=${encodeURIComponent(slug)}`
          : `${baseUrl}/events/register?payment=success`
      );
    }

    const totalRaised =
      registration.totalRaisedNgn ??
      (registration.paymentStatus === "completed" && registration.commitmentAmountNgn != null
        ? registration.commitmentAmountNgn
        : 0);
    const newTotalRaised = Number.isFinite(commitmentAmountNgn) ? commitmentAmountNgn : totalRaised;

    await db
      .update(impactHangoutRegistrations)
      .set({
        paymentStatus: "completed",
        paymentReference: reference,
        commitmentAmountNgn:
          Number.isFinite(commitmentAmountNgn) ? commitmentAmountNgn : null,
        totalRaisedNgn: newTotalRaised,
        paidAt: new Date(),
      })
      .where(eq(impactHangoutRegistrations.id, registrationId));

    const [updated] = await db
      .select()
      .from(impactHangoutRegistrations)
      .where(eq(impactHangoutRegistrations.id, registrationId))
      .limit(1);

    if (updated) {
      const goal = updated.fundraisingGoalNgn ?? 0;
      const amountRaised = updated.totalRaisedNgn ?? updated.commitmentAmountNgn ?? 0;
      const progressPercent = goal > 0 ? Math.min(100, Math.round((amountRaised / goal) * 100)) : 0;
      const pageUrl = updated.slug
        ? `${baseUrl}/events/${encodeURIComponent(updated.slug)}`
        : `${baseUrl}/events`;

      for (const p of MILESTONES) {
        if (progressPercent < p) continue;
        const col = MILESTONE_COLUMNS[p];
        const alreadySent = updated[col];
        if (alreadySent) continue;
        const sent = await sendImpactHangoutMilestoneEmail({
          to: updated.email,
          hostName: updated.fullName,
          hangoutName: updated.hangoutName ?? "Impact Hangout",
          milestonePercent: p,
          amountRaisedNgn: amountRaised,
          goalNgn: goal,
          pageUrl,
        });
        if (sent && !sent.error) {
          await db
            .update(impactHangoutRegistrations)
            .set({ [col]: new Date() })
            .where(eq(impactHangoutRegistrations.id, registrationId));
        }
      }
    }

    const slug = updated?.slug;
    return NextResponse.redirect(
      slug
        ? `${baseUrl}/events/register?payment=success&slug=${encodeURIComponent(slug)}`
        : `${baseUrl}/events/register?payment=success`
    );
  } catch (error) {
    console.error("Impact Hangout payment callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/events/register?payment=failed&error=callback_error`
    );
  }
}
