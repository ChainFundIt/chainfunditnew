import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema/campaigns";
import { recurringDonations } from "@/lib/schema/recurring-donations";
import { eq } from "drizzle-orm";
import { getPayPalSubscription } from "@/lib/payments/paypal";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paypalSubscriptionId = body?.paypalSubscriptionId;
    const recurringDonationId = body?.recurringDonationId;

    if (!paypalSubscriptionId) {
      return NextResponse.json(
        { success: false, error: "paypalSubscriptionId is required" },
        { status: 400 }
      );
    }

    const paypalSubscription = await getPayPalSubscription(paypalSubscriptionId);
    const localRecurringDonationId = recurringDonationId || paypalSubscription.custom_id;

    if (!localRecurringDonationId) {
      return NextResponse.json(
        { success: false, error: "Unable to resolve recurring donation" },
        { status: 400 }
      );
    }

    const [subscription] = await db
      .select({
        id: recurringDonations.id,
        campaignId: recurringDonations.campaignId,
      })
      .from(recurringDonations)
      .where(eq(recurringDonations.id, localRecurringDonationId))
      .limit(1);

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Recurring donation not found" },
        { status: 404 }
      );
    }

    await db
      .update(recurringDonations)
      .set({
        stripeSubscriptionId: paypalSubscriptionId,
        stripeCustomerId: paypalSubscription.subscriber?.payer_id || null,
        status: paypalSubscription.status === "ACTIVE" ? "active" : "pending",
        isActive: paypalSubscription.status === "ACTIVE",
        updatedAt: new Date(),
      })
      .where(eq(recurringDonations.id, localRecurringDonationId));

    const [campaign] = await db
      .select({ slug: campaigns.slug })
      .from(campaigns)
      .where(eq(campaigns.id, subscription.campaignId))
      .limit(1);

    return NextResponse.json({
      success: true,
      subscriptionId: localRecurringDonationId,
      campaignSlug: campaign?.slug || null,
      providerSubscriptionId: paypalSubscriptionId,
      status: paypalSubscription.status,
    });
  } catch (error: any) {
    console.error("Error confirming PayPal subscription:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm PayPal subscription" },
      { status: 500 }
    );
  }
}
