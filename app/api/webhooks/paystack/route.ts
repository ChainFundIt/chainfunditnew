import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyPaystackWebhook } from '@/lib/payments/paystack';
import { db } from '@/lib/db';
import { charityDonations, charities } from '@/lib/schema/charities';
import { eq, sql } from 'drizzle-orm';
import { notifyAdminsOfCharityDonation } from '@/lib/notifications/charity-donation-alerts';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/paystack
 * Handle Paystack webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyPaystackWebhook(body, signature);
    if (!isValid) {
      console.error('Paystack webhook signature verification failed');
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data);
        break;

      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;

      case 'transfer.failed':
        await handleTransferFailed(event.data);
        break;

      case 'transfer.reversed':
        await handleTransferReversed(event.data);
        break;

      default:
        console.log(`Unhandled Paystack event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful charge
 */
async function handleChargeSuccess(data: any) {
  try {
    const reference = data.reference;
    const metadata = data.metadata;

    if (!metadata?.donationId) {
      console.error('No donation ID in Paystack metadata');
      return;
    }

    // Update donation status
    const [donation] = await db
      .update(charityDonations)
      .set({
        paymentStatus: 'completed',
        transactionId: reference,
        updatedAt: new Date(),
      })
      .where(eq(charityDonations.id, metadata.donationId))
      .returning();

    if (!donation) {
      console.error('Donation not found:', metadata.donationId);
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

    console.log('Paystack payment successful:', {
      donationId: metadata.donationId,
      amount: donation.amount,
      reference,
    });

    // Get charity details for notification
    const charity = await db.query.charities.findFirst({
      where: eq(charities.id, donation.charityId),
    });

    if (charity) {
      // Send notification to admins
      await notifyAdminsOfCharityDonation({
        donationId: donation.id,
        charityId: charity.id,
        charityName: charity.name,
        amount: donation.amount,
        currency: donation.currency,
        donorName: donation.donorName || 'Anonymous',
        donorEmail: donation.donorEmail || '',
        isAnonymous: donation.isAnonymous,
        message: donation.message || undefined,
      });
    }

    // TODO: Send confirmation email to donor
  } catch (error) {
    console.error('Error handling Paystack charge success:', error);
    throw error;
  }
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(data: any) {
  try {
    const metadata = data.metadata;

    if (!metadata?.donationId) {
      console.error('No donation ID in Paystack metadata');
      return;
    }

    await db
      .update(charityDonations)
      .set({
        paymentStatus: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(charityDonations.id, metadata.donationId));

    console.log('Paystack payment failed:', metadata.donationId);

    // TODO: Send failure notification to donor
  } catch (error) {
    console.error('Error handling Paystack charge failure:', error);
    throw error;
  }
}

/**
 * Handle successful transfer (payout)
 */
async function handleTransferSuccess(data: any) {
  try {
    const reference = data.reference;
    const amount = data.amount / 100; // Convert from kobo to Naira

    console.log('Paystack transfer successful:', {
      reference,
      amount,
      recipient: data.recipient?.details?.account_name,
    });

    // TODO: Update payout status in charity_payouts table
    // TODO: Send confirmation to charity
  } catch (error) {
    console.error('Error handling Paystack transfer success:', error);
    throw error;
  }
}

/**
 * Handle failed transfer
 */
async function handleTransferFailed(data: any) {
  try {
    const reference = data.reference;

    console.log('Paystack transfer failed:', {
      reference,
      reason: data.status,
    });

    // TODO: Update payout status to failed
    // TODO: Notify admin
  } catch (error) {
    console.error('Error handling Paystack transfer failure:', error);
    throw error;
  }
}

/**
 * Handle reversed transfer
 */
async function handleTransferReversed(data: any) {
  try {
    const reference = data.reference;

    console.log('Paystack transfer reversed:', {
      reference,
    });

    // TODO: Update payout status
    // TODO: Credit back to charity pending amount
  } catch (error) {
    console.error('Error handling Paystack transfer reversal:', error);
    throw error;
  }
}

