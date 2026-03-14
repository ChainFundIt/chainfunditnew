import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { donations } from "@/lib/schema/donations";
import { campaignPayouts, commissionPayouts } from "@/lib/schema";
import { charities, charityDonations } from "@/lib/schema/charities";
import { recurringDonationPayments, recurringDonations } from "@/lib/schema/recurring-donations";
import { eq, and } from "drizzle-orm";
import {
  completeCampaignDonation,
  failCampaignDonation,
} from "@/lib/payments/campaign-donation-processing";
import {
  completeCharityDonation,
  failCharityDonation,
} from "@/lib/payments/charity-donation-processing";
import { verifyPayPalWebhookSignature } from "@/lib/payments/paypal";
import { calculateNextBillingDate } from "@/lib/utils/recurring-donations";
import { updateSubscriptionAfterPayment } from "@/lib/services/subscription-service";

export const runtime = "nodejs";

interface PayPalWebhookEvent {
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    state?: string;
    billing_agreement_id?: string;
    transaction_id?: string;
    custom_id?: string;
    amount?: {
      total?: string;
      currency?: string;
    };
    payout_item_id?: string;
    payout_item?: {
      sender_item_id?: string;
      receiver?: string;
    };
    sender_item_id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
}

function getOrderId(event: PayPalWebhookEvent): string | null {
  return (
    event.resource?.supplementary_data?.related_ids?.order_id ||
    event.resource?.id ||
    null
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body) as PayPalWebhookEvent;

    const isValid = await verifyPayPalWebhookSignature(event, {
      authAlgo: request.headers.get("paypal-auth-algo"),
      certUrl: request.headers.get("paypal-cert-url"),
      transmissionId: request.headers.get("paypal-transmission-id"),
      transmissionSig: request.headers.get("paypal-transmission-sig"),
      transmissionTime: request.headers.get("paypal-transmission-time"),
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handleOneTimeCaptureCompleted(event);
        break;

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.DECLINED":
      case "PAYMENT.CAPTURE.REVERSED":
        await handleOneTimeCaptureFailed(event);
        break;

      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await updatePayPalRecurringStatus(event.resource?.id, "active", true);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await updatePayPalRecurringStatus(event.resource?.id, "cancelled", false);
        break;

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await updatePayPalRecurringStatus(event.resource?.id, "paused", false);
        break;

      case "BILLING.SUBSCRIPTION.EXPIRED":
        await updatePayPalRecurringStatus(event.resource?.id, "expired", false);
        break;

      case "PAYMENT.SALE.COMPLETED":
        await handleRecurringSaleCompleted(event);
        break;

      case "PAYMENT.PAYOUTS-ITEM.SUCCEEDED":
        await handlePayoutItemEvent(event, "completed");
        break;

      case "PAYMENT.PAYOUTS-ITEM.FAILED":
      case "PAYMENT.PAYOUTS-ITEM.BLOCKED":
      case "PAYMENT.PAYOUTS-ITEM.UNCLAIMED":
      case "PAYMENT.PAYOUTS-ITEM.RETURNED":
      case "PAYMENT.PAYOUTS-ITEM.DENIED":
        await handlePayoutItemEvent(event, "failed");
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing PayPal webhook:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleOneTimeCaptureCompleted(event: PayPalWebhookEvent) {
  const orderId = getOrderId(event);
  if (!orderId) return;

  const [campaignDonation] = await db
    .select({ id: donations.id })
    .from(donations)
    .where(eq(donations.paymentIntentId, orderId))
    .limit(1);

  if (campaignDonation) {
    await completeCampaignDonation({
      donationId: campaignDonation.id,
      paymentReference: orderId,
      providerStatus: event.resource?.status || "COMPLETED",
    });
    return;
  }

  const [charityDonation] = await db
    .select({ id: charityDonations.id })
    .from(charityDonations)
    .where(eq(charityDonations.paymentIntentId, orderId))
    .limit(1);

  if (charityDonation) {
    await completeCharityDonation({
      donationId: charityDonation.id,
      paymentReference: orderId,
    });
  }
}

async function handleOneTimeCaptureFailed(event: PayPalWebhookEvent) {
  const orderId = getOrderId(event);
  if (!orderId) return;

  const [campaignDonation] = await db
    .select({ id: donations.id })
    .from(donations)
    .where(eq(donations.paymentIntentId, orderId))
    .limit(1);

  if (campaignDonation) {
    await failCampaignDonation({
      donationId: campaignDonation.id,
      providerStatus: event.event_type || "FAILED",
      failureReason: `PayPal reported ${event.event_type || "a failed payment"}.`,
    });
    return;
  }

  const [charityDonation] = await db
    .select({ id: charityDonations.id })
    .from(charityDonations)
    .where(eq(charityDonations.paymentIntentId, orderId))
    .limit(1);

  if (charityDonation) {
    await failCharityDonation({
      donationId: charityDonation.id,
      failureReason: `PayPal reported ${event.event_type || "a failed payment"}.`,
    });
  }
}

async function updatePayPalRecurringStatus(
  subscriptionId: string | undefined,
  status: "active" | "paused" | "cancelled" | "expired",
  isActive: boolean
) {
  if (!subscriptionId) return;

  await db
    .update(recurringDonations)
    .set({
      status,
      isActive,
      updatedAt: new Date(),
      cancelledAt: status === "cancelled" ? new Date() : null,
      pausedAt: status === "paused" ? new Date() : null,
    })
    .where(
      and(
        eq(recurringDonations.paymentMethod, "paypal"),
        eq(recurringDonations.stripeSubscriptionId, subscriptionId)
      )
    );
}

async function handleRecurringSaleCompleted(event: PayPalWebhookEvent) {
  const subscriptionId = event.resource?.billing_agreement_id;
  const saleId = event.resource?.id;
  const amount = parseFloat(event.resource?.amount?.total || "0");
  const currency = event.resource?.amount?.currency || "USD";

  if (!subscriptionId || !saleId || !Number.isFinite(amount) || amount <= 0) {
    return;
  }

  const existingPayment = await db.query.recurringDonationPayments.findFirst({
    where: eq(recurringDonationPayments.stripePaymentIntentId, saleId),
  });

  if (existingPayment) {
    return;
  }

  const subscription = await db.query.recurringDonations.findFirst({
    where: and(
      eq(recurringDonations.paymentMethod, "paypal"),
      eq(recurringDonations.stripeSubscriptionId, subscriptionId)
    ),
  });

  if (!subscription) {
    return;
  }

  const billingPeriodStart = subscription.lastBillingDate
    ? new Date(subscription.lastBillingDate)
    : new Date();
  const billingPeriodEnd = calculateNextBillingDate(
    subscription.period as "monthly" | "quarterly" | "yearly",
    billingPeriodStart
  );

  const [donation] = await db
    .insert(donations)
    .values({
      campaignId: subscription.campaignId,
      donorId: subscription.donorId,
      chainerId: subscription.chainerId,
      amount: amount.toString(),
      currency,
      paymentMethod: "paypal",
      paymentStatus: "pending",
      message: subscription.message,
      isAnonymous: subscription.isAnonymous,
    })
    .returning();

  await db.insert(recurringDonationPayments).values({
    recurringDonationId: subscription.id,
    donationId: donation.id,
    amount: amount.toString(),
    currency,
    paymentStatus: "pending",
    stripePaymentIntentId: saleId,
    billingPeriodStart: billingPeriodStart.toISOString().split("T")[0],
    billingPeriodEnd: billingPeriodEnd.toISOString().split("T")[0],
    scheduledDate: new Date().toISOString().split("T")[0],
  });

  await completeCampaignDonation({
    donationId: donation.id,
    paymentReference: saleId,
    providerStatus: event.resource?.state || "completed",
  });

  await db
    .update(recurringDonationPayments)
    .set({
      paymentStatus: "completed",
      processedAt: new Date(),
    })
    .where(
      and(
        eq(recurringDonationPayments.recurringDonationId, subscription.id),
        eq(recurringDonationPayments.donationId, donation.id)
      )
    );

  await updateSubscriptionAfterPayment(subscription.id, donation.id, true);
}

async function handlePayoutItemEvent(
  event: PayPalWebhookEvent,
  status: "completed" | "failed"
) {
  const senderItemId =
    event.resource?.payout_item?.sender_item_id ||
    event.resource?.sender_item_id ||
    null;

  if (!senderItemId) {
    return;
  }

  const [type, payoutId] = senderItemId.split(":");
  if (!type || !payoutId) {
    return;
  }

  const transactionId =
    event.resource?.transaction_id ||
    event.resource?.payout_item_id ||
    event.resource?.id ||
    null;
  const failureReason =
    status === "failed"
      ? `PayPal payout event ${event.event_type || "failed"}`
      : null;

  if (type === "campaign") {
    await db
      .update(campaignPayouts)
      .set({
        status,
        transactionId,
        failureReason,
        processedAt: status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(campaignPayouts.id, payoutId));
    return;
  }

  if (type === "ambassador") {
    await db
      .update(commissionPayouts)
      .set({
        status,
        transactionId,
        processedAt: status === "completed" ? new Date() : null,
      })
      .where(eq(commissionPayouts.id, payoutId));
  }
}
