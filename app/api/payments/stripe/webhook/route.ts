import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { recurringDonations, recurringDonationPayments } from '@/lib/schema/recurring-donations';
import { campaigns } from '@/lib/schema/campaigns';
import { notifications } from '@/lib/schema/notifications';
import { eq, sum, and } from 'drizzle-orm';
import { verifyStripeWebhook } from '@/lib/payments/stripe';
import Stripe from 'stripe';
import { shouldCloseForGoalReached, closeCampaign } from '@/lib/utils/campaign-closure';
import { shouldNotifyUserOfDonation, formatDonationNotificationMessage } from '@/lib/utils/donation-notification-utils';
import { sendDonorConfirmationEmailById } from '@/lib/notifications/donor-confirmation-email';

// Helper function to update campaign currentAmount based on completed donations
async function updateCampaignAmount(campaignId: string) {
  try {
    // Calculate total amount from completed donations
    const donationStats = await db
      .select({
        totalAmount: sum(donations.amount),
      })
      .from(donations)
      .where(and(
        eq(donations.campaignId, campaignId),
        eq(donations.paymentStatus, 'completed')
      ));

    const totalAmount = Number(donationStats[0]?.totalAmount || 0);

    // Update campaign currentAmount
    await db
      .update(campaigns)
      .set({
        currentAmount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

  } catch (error) {
    console.error('Error updating campaign amount:', error);
  }
}

// Helper function to create notification for successful donation
async function createSuccessfulDonationNotification(donationId: string, campaignId: string) {
  try {
    // Get campaign creator ID
    const campaign = await db
      .select({ creatorId: campaigns.creatorId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign.length) {
      console.error('Campaign not found:', campaignId);
      return;
    }

    // Get donation details
    const donation = await db
      .select({ 
        amount: donations.amount, 
        currency: donations.currency,
        donorId: donations.donorId 
      })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length) {
      console.error('Donation not found:', donationId);
      return;
    }

    // Check user preferences before creating notification
    const notificationCheck = await shouldNotifyUserOfDonation(
      campaign[0].creatorId,
      donation[0].amount,
      donation[0].currency
    );

    if (!notificationCheck.shouldNotify) {
      console.log(`Skipping notification for user ${campaign[0].creatorId}: ${notificationCheck.reason}`);
      return;
    }

    // Format notification message based on whether it's a large donation
    const { title, message } = formatDonationNotificationMessage(
      donation[0].amount,
      donation[0].currency,
      notificationCheck.isLargeDonation
    );

    // Create notification for campaign creator
    await db.insert(notifications).values({
      userId: campaign[0].creatorId,
      type: notificationCheck.isLargeDonation ? 'large_donation_received' : 'donation_received',
      title,
      message,
      metadata: JSON.stringify({
        donationId,
        campaignId,
        amount: donation[0].amount,
        currency: donation[0].currency,
        donorId: donation[0].donorId,
        isLargeDonation: notificationCheck.isLargeDonation
      })
    });

    console.log(`✅ Donation notification created for user ${campaign[0].creatorId}${notificationCheck.isLargeDonation ? ' (Large Donation)' : ''}`);

  } catch (error) {
    console.error('Error creating successful donation notification:', error);
  }
}

// Helper function to create notification for failed donation
async function createFailedDonationNotification(donationId: string, campaignId: string) {
  try {
    // Get campaign creator ID
    const campaign = await db
      .select({ creatorId: campaigns.creatorId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign.length) {
      console.error('Campaign not found:', campaignId);
      return;
    }

    // Get donation details
    const donation = await db
      .select({ 
        amount: donations.amount, 
        currency: donations.currency,
        donorId: donations.donorId 
      })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length) {
      console.error('Donation not found:', donationId);
      return;
    }

    // Create notification for campaign creator
    await db.insert(notifications).values({
      userId: campaign[0].creatorId,
      type: 'donation_failed',
      title: 'Donation Failed',
      message: `A donation of ${donation[0].currency} ${donation[0].amount} failed to process. Please check your payment settings.`,
      metadata: JSON.stringify({
        donationId,
        campaignId,
        amount: donation[0].amount,
        currency: donation[0].currency,
        donorId: donation[0].donorId
      })
    });

  } catch (error) {
    console.error('Error creating failed donation notification:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event: Stripe.Event;
    try {
      event = verifyStripeWebhook(body, signature);
    } catch (err: any) {
      console.error('❌ Stripe webhook verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
    }

    // Event is verified at this point

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      // Subscription events
      case 'invoice.payment_succeeded':
        await handleSubscriptionPaymentSuccess(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleSubscriptionPaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, event.type);
        break;
      
      default:
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const donationId = paymentIntent.metadata.donationId;
    
    if (!donationId) {
      return;
    }

    // Get donation to get campaignId
    const donation = await db
      .select({ campaignId: donations.campaignId })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length) {
      return;
    }

    await db
      .update(donations)
      .set({
        paymentStatus: 'completed',
        processedAt: new Date(),
      })
      .where(eq(donations.id, donationId));

    // Update campaign currentAmount
    await updateCampaignAmount(donation[0].campaignId);

    // Check if campaign should be closed due to goal reached
    const campaign = await db
      .select({
        id: campaigns.id,
        creatorId: campaigns.creatorId,
        title: campaigns.title,
        currentAmount: campaigns.currentAmount,
        goalAmount: campaigns.goalAmount,
        currency: campaigns.currency,
        status: campaigns.status
      })
      .from(campaigns)
      .where(eq(campaigns.id, donation[0].campaignId))
      .limit(1);

    if (campaign.length > 0 && campaign[0].status === 'active') {
      const currentAmount = parseFloat(campaign[0].currentAmount);
      const goalAmount = parseFloat(campaign[0].goalAmount);
      
      if (shouldCloseForGoalReached(currentAmount, goalAmount)) {
        await closeCampaign(campaign[0].id, 'goal_reached', campaign[0].creatorId);
      }
    }

    // Create notification for successful donation
    await createSuccessfulDonationNotification(donationId, donation[0].campaignId);

    // Send confirmation email to donor
    await sendDonorConfirmationEmailById(donationId);

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle subscription payment success
async function handleSubscriptionPaymentSuccess(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    // Find recurring donation by Stripe subscription ID
    const recurringDonation = await db.query.recurringDonations.findFirst({
      where: eq(recurringDonations.stripeSubscriptionId, subscriptionId),
    });

    if (!recurringDonation) return;

    // Process the recurring donation payment
    const { processRecurringDonationPayment, updateSubscriptionAfterPayment } = await import('@/lib/services/subscription-service');
    const result = await processRecurringDonationPayment(recurringDonation.id);

    if (result.success && result.donationId) {
      // Update donation status to completed
      await db
        .update(donations)
        .set({
          paymentStatus: 'completed',
          paymentIntentId: invoice.payment_intent as string,
          processedAt: new Date(),
        })
        .where(eq(donations.id, result.donationId));

      // Update campaign amount
      await updateCampaignAmount(recurringDonation.campaignId);

      // Update subscription after successful payment
      await updateSubscriptionAfterPayment(recurringDonation.id, result.donationId, true);

      // Create notification and send email
      await createSuccessfulDonationNotification(result.donationId, recurringDonation.campaignId);
      await sendDonorConfirmationEmailById(result.donationId);
    }
  } catch (error) {
    console.error('Error handling subscription payment success:', error);
  }
}

// Handle subscription payment failure
async function handleSubscriptionPaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const recurringDonation = await db.query.recurringDonations.findFirst({
      where: eq(recurringDonations.stripeSubscriptionId, subscriptionId),
    });

    if (!recurringDonation) return;

    // Find the pending payment for this invoice
    const payment = await db.query.recurringDonationPayments.findFirst({
      where: and(
        eq(recurringDonationPayments.recurringDonationId, recurringDonation.id),
        eq(recurringDonationPayments.stripeInvoiceId, invoice.id)
      ),
    });

    if (payment) {
      // Update payment status
      await db
        .update(recurringDonationPayments)
        .set({
          paymentStatus: 'failed',
        })
        .where(eq(recurringDonationPayments.id, payment.id));

      // Update donation status
      await db
        .update(donations)
        .set({
          paymentStatus: 'failed',
        })
        .where(eq(donations.id, payment.donationId));

      // Update subscription
      const { updateSubscriptionAfterPayment } = await import('@/lib/services/subscription-service');
      await updateSubscriptionAfterPayment(recurringDonation.id, payment.donationId, false);
    }
  } catch (error) {
    console.error('Error handling subscription payment failure:', error);
  }
}

// Handle subscription updates (cancelled, paused, etc.)
async function handleSubscriptionUpdate(subscription: Stripe.Subscription, eventType: string) {
  try {
    const recurringDonation = await db.query.recurringDonations.findFirst({
      where: eq(recurringDonations.stripeSubscriptionId, subscription.id),
    });

    if (!recurringDonation) return;

    let status = 'active';
    let isActive = true;

    if (eventType === 'customer.subscription.deleted' || subscription.status === 'canceled') {
      status = 'cancelled';
      isActive = false;
    } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      status = 'paused';
      isActive = false;
    }

    await db
      .update(recurringDonations)
      .set({
        status,
        isActive,
        cancelledAt: status === 'cancelled' ? new Date() : recurringDonation.cancelledAt,
        pausedAt: status === 'paused' ? new Date() : recurringDonation.pausedAt,
      })
      .where(eq(recurringDonations.id, recurringDonation.id));
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    const donationId = paymentIntent.metadata.donationId;
    
    if (!donationId) {
      return;
    }

    // Get donation to get campaignId
    const donation = await db
      .select({ campaignId: donations.campaignId })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length) {
      return;
    }

    await db
      .update(donations)
      .set({
        paymentStatus: 'failed',
      })
      .where(eq(donations.id, donationId));

    // Create notification for failed donation
    await createFailedDonationNotification(donationId, donation[0].campaignId);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
