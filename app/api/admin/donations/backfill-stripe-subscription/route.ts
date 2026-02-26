import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { recurringDonations, recurringDonationPayments } from '@/lib/schema/recurring-donations';
import { campaigns } from '@/lib/schema/campaigns';
import { notifications } from '@/lib/schema/notifications';
import { eq, and } from 'drizzle-orm';
import { stripe } from '@/lib/payments/stripe';
import Stripe from 'stripe';
import { updateCampaignAmount } from '@/lib/utils/campaign-amount';
import { shouldNotifyUserOfDonation, formatDonationNotificationMessage } from '@/lib/utils/donation-notification-utils';
import { sendDonorConfirmationEmailById } from '@/lib/notifications/donor-confirmation-email';

/**
 * POST /api/admin/donations/backfill-stripe-subscription
 *
 * Backfill a missed recurring donation when Stripe charged successfully but
 * the invoice.payment_succeeded webhook did not create the donation (e.g. webhook
 * failed or was never received).
 *
 * Body: { invoiceId?: string, subscriptionId?: string }
 * - invoiceId: process this specific paid invoice.
 * - subscriptionId: find the first paid invoice for this subscription and process it.
 *
 * Idempotent: if this invoice is already recorded, returns success with alreadyProcessed: true.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { invoiceId, subscriptionId } = body;

    if (!invoiceId && !subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Provide invoiceId or subscriptionId' },
        { status: 400 }
      );
    }

    let invoice: Stripe.Invoice;

    if (invoiceId) {
      invoice = await stripe.invoices.retrieve(invoiceId, {
        expand: ['subscription', 'payment_intent'],
      });
    } else if (subscriptionId) {
      const list = await stripe.invoices.list({
        subscription: subscriptionId,
        status: 'paid',
        limit: 1,
      });
      if (!list.data.length) {
        return NextResponse.json(
          { success: false, error: 'No paid invoice found for this subscription' },
          { status: 400 }
        );
      }
      invoice = await stripe.invoices.retrieve(list.data[0].id, {
        expand: ['subscription', 'payment_intent'],
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide invoiceId or subscriptionId' },
        { status: 400 }
      );
    }

    const subId = typeof invoice.subscription === 'object' ? invoice.subscription?.id : invoice.subscription;
    if (!subId) {
      return NextResponse.json(
        { success: false, error: 'Invoice has no subscription' },
        { status: 400 }
      );
    }
    if (invoice.status !== 'paid') {
      return NextResponse.json(
        { success: false, error: `Invoice status is ${invoice.status}, not paid` },
        { status: 400 }
      );
    }

    // Idempotency
    const existing = await db
      .select({ id: recurringDonationPayments.id, donationId: recurringDonationPayments.donationId })
      .from(recurringDonationPayments)
      .where(eq(recurringDonationPayments.stripeInvoiceId, invoice.id))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        donationId: existing[0].donationId,
        message: 'This invoice was already processed',
      });
    }

    const recurringDonation = await db.query.recurringDonations.findFirst({
      where: eq(recurringDonations.stripeSubscriptionId, subId),
    });
    if (!recurringDonation) {
      return NextResponse.json(
        { success: false, error: `No recurring donation found for Stripe subscription ${subId}` },
        { status: 404 }
      );
    }

    const { processRecurringDonationPayment, updateSubscriptionAfterPayment } = await import(
      '@/lib/services/subscription-service'
    );
    const result = await processRecurringDonationPayment(recurringDonation.id);
    if (!result.success || !result.donationId) {
      return NextResponse.json(
        { success: false, error: result.error ?? 'Failed to process recurring donation payment' },
        { status: 500 }
      );
    }

    const paymentIntentId =
      typeof invoice.payment_intent === 'object' && invoice.payment_intent
        ? invoice.payment_intent.id
        : (invoice.payment_intent as string);

    await db
      .update(donations)
      .set({
        paymentStatus: 'completed',
        paymentIntentId: paymentIntentId ?? undefined,
        processedAt: new Date(),
      })
      .where(eq(donations.id, result.donationId));

    await updateCampaignAmount(recurringDonation.campaignId);
    await updateSubscriptionAfterPayment(recurringDonation.id, result.donationId, true);

    await db
      .update(recurringDonationPayments)
      .set({
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId: paymentIntentId ?? null,
      })
      .where(
        and(
          eq(recurringDonationPayments.recurringDonationId, recurringDonation.id),
          eq(recurringDonationPayments.donationId, result.donationId)
        )
      );

    try {
      const campaignRow = await db.select({ creatorId: campaigns.creatorId }).from(campaigns).where(eq(campaigns.id, recurringDonation.campaignId)).limit(1);
      const donationRow = await db.select({ amount: donations.amount, currency: donations.currency, donorId: donations.donorId }).from(donations).where(eq(donations.id, result.donationId)).limit(1);
      if (campaignRow.length && donationRow.length) {
        const check = await shouldNotifyUserOfDonation(campaignRow[0].creatorId, donationRow[0].amount, donationRow[0].currency);
        if (check.shouldNotify) {
          const period = ['monthly', 'quarterly', 'yearly'].includes(recurringDonation.period) ? recurringDonation.period as 'monthly' | 'quarterly' | 'yearly' : undefined;
          const { title, message } = formatDonationNotificationMessage(donationRow[0].amount, donationRow[0].currency, check.isLargeDonation, period);
          await db.insert(notifications).values({
            userId: campaignRow[0].creatorId,
            type: check.isLargeDonation ? 'large_donation_received' : 'donation_received',
            title,
            message,
            metadata: JSON.stringify({ donationId: result.donationId, campaignId: recurringDonation.campaignId, amount: donationRow[0].amount, currency: donationRow[0].currency, donorId: donationRow[0].donorId, isLargeDonation: check.isLargeDonation }),
          });
          const { sendCampaignDonationEmailById } = await import('@/lib/notifications/campaign-donation-email');
          await sendCampaignDonationEmailById(result.donationId, campaignRow[0].creatorId, check.isLargeDonation);
        }
      }
      await sendDonorConfirmationEmailById(result.donationId);
    } catch (e) {
      console.warn('Notification/email failed during backfill:', e);
    }

    return NextResponse.json({
      success: true,
      donationId: result.donationId,
      campaignId: recurringDonation.campaignId,
      message: 'Donation backfilled and campaign amount updated',
    });
  } catch (error: any) {
    console.error('Backfill stripe subscription error:', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Backfill failed' },
      { status: 500 }
    );
  }
}
