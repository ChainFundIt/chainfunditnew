import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema/campaigns";
import { recurringDonations } from "@/lib/schema/recurring-donations";
import { eq } from "drizzle-orm";
import { getPayPalSubscription } from "@/lib/payments/paypal";

function getBaseUrl(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const subscriptionId = request.nextUrl.searchParams.get("token");

  if (!subscriptionId) {
    return NextResponse.redirect(
      `${baseUrl}/campaigns?donation_status=failed&error=missing_paypal_subscription`
    );
  }

  try {
    const paypalSubscription = await getPayPalSubscription(subscriptionId);
    const recurringDonationId = paypalSubscription.custom_id;

    if (!recurringDonationId) {
      throw new Error("PayPal subscription is missing custom_id");
    }

    const [subscription] = await db
      .select({
        id: recurringDonations.id,
        campaignId: recurringDonations.campaignId,
      })
      .from(recurringDonations)
      .where(eq(recurringDonations.id, recurringDonationId))
      .limit(1);

    if (!subscription) {
      throw new Error("Recurring donation not found");
    }

    await db
      .update(recurringDonations)
      .set({
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: paypalSubscription.subscriber?.payer_id || null,
        status: paypalSubscription.status === "ACTIVE" ? "active" : "pending",
        isActive: paypalSubscription.status === "ACTIVE",
        updatedAt: new Date(),
      })
      .where(eq(recurringDonations.id, recurringDonationId));

    const [campaign] = await db
      .select({ slug: campaigns.slug })
      .from(campaigns)
      .where(eq(campaigns.id, subscription.campaignId))
      .limit(1);

    return NextResponse.redirect(
      `${baseUrl}/campaign/${campaign?.slug || subscription.campaignId}?donation_status=success`
    );
  } catch (error) {
    console.error("PayPal subscription callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/campaigns?donation_status=failed&error=paypal_subscription_callback`
    );
  }
}
