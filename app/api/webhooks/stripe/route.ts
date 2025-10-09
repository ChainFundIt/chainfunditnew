import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyStripeWebhook } from '@/lib/payments/stripe';
import { db } from '@/lib/db';
import { charityDonations, charities } from '@/lib/schema/charities';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyStripeWebhook(body, signature);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const donationId = paymentIntent.metadata.donationId;

    if (!donationId) {
      console.error('No donation ID in payment intent metadata');
      return;
    }

    // Update donation status
    const [donation] = await db
      .update(charityDonations)
      .set({
        paymentStatus: 'completed',
        transactionId: paymentIntent.id,
        updatedAt: new Date(),
      })
      .where(eq(charityDonations.id, donationId))
      .returning();

    if (!donation) {
      console.error('Donation not found:', donationId);
      return;
    }

    // Update charity total received
    await db
      .update(charities)
      .set({
        totalReceived: sql`${charities.totalReceived} + ${donation.amount}`,
        pendingAmount: sql`${charities.pendingAmount} + ${donation.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(charities.id, donation.charityId));

    console.log('Payment successful:', {
      donationId,
      amount: donation.amount,
      charityId: donation.charityId,
    });

    // TODO: Send confirmation email to donor
    // TODO: Send notification to charity
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const donationId = paymentIntent.metadata.donationId;

    if (!donationId) {
      console.error('No donation ID in payment intent metadata');
      return;
    }

    await db
      .update(charityDonations)
      .set({
        paymentStatus: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(charityDonations.id, donationId));

    console.log('Payment failed:', donationId);

    // TODO: Send failure notification to donor
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const donationId = paymentIntent.metadata.donationId;

    if (!donationId) {
      console.error('No donation ID in payment intent metadata');
      return;
    }

    await db
      .update(charityDonations)
      .set({
        paymentStatus: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(charityDonations.id, donationId));

    console.log('Payment canceled:', donationId);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
    throw error;
  }
}

/**
 * Handle refund
 */
async function handleRefund(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string;

    // Find donation by payment intent ID
    const donation = await db.query.charityDonations.findFirst({
      where: eq(charityDonations.paymentIntentId, paymentIntentId),
    });

    if (!donation) {
      console.error('Donation not found for refund:', paymentIntentId);
      return;
    }

    // Update donation status
    await db
      .update(charityDonations)
      .set({
        paymentStatus: 'refunded',
        updatedAt: new Date(),
      })
      .where(eq(charityDonations.id, donation.id));

    // Update charity totals
    await db
      .update(charities)
      .set({
        totalReceived: sql`${charities.totalReceived} - ${donation.amount}`,
        pendingAmount: sql`${charities.pendingAmount} - ${donation.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(charities.id, donation.charityId));

    console.log('Refund processed:', {
      donationId: donation.id,
      amount: donation.amount,
    });

    // TODO: Send refund confirmation to donor
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}

