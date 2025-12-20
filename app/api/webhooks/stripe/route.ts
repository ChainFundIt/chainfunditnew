import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyStripeWebhook } from '@/lib/payments/stripe';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { recurringDonations, recurringDonationPayments } from '@/lib/schema/recurring-donations';
import { campaigns } from '@/lib/schema/campaigns';
import { notifications } from '@/lib/schema/notifications';
import { charityDonations, charities } from '@/lib/schema/charities';
import { campaignPayouts, commissionPayouts } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';
import Stripe from 'stripe';
import { shouldCloseForGoalReached, closeCampaign } from '@/lib/utils/campaign-closure';
import { updateCampaignAmount } from '@/lib/utils/campaign-amount';
import { shouldNotifyUserOfDonation, formatDonationNotificationMessage } from '@/lib/utils/donation-notification-utils';
import { sendDonorConfirmationEmailById } from '@/lib/notifications/donor-confirmation-email';
import { notifyAdminsOfCharityDonation } from '@/lib/notifications/charity-donation-alerts';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/stripe
 * Unified Stripe webhook handler for:
 * - Campaign donations (payment_intent.succeeded, payment_intent.payment_failed)
 * - Charity donations (payment_intent.succeeded, payment_intent.payment_failed, payment_intent.canceled, charge.refunded)
 * - Recurring donations/subscriptions (invoice.payment_succeeded, invoice.payment_failed, customer.subscription.*)
 * - Payouts (transfer.created, transfer.reversed)
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
      console.error('❌ Stripe webhook verification failed:', err.message);
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

      // Transfer events (payouts)
      case 'transfer.created':
      case 'transfer.reversed':
      case 'transfer.updated': {
        const transfer = event.data.object as Stripe.Transfer;
        await handleTransfer(event.type, transfer);
        break;
      }
      
      // Payout events (for external account payouts)
      case 'payout.paid':
      case 'payout.failed':
      case 'payout.canceled': {
        const payout = event.data.object as Stripe.Payout;
        await handlePayout(event.type, payout);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
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
 * Handle successful payment - supports both campaign and charity donations
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const donationId = paymentIntent.metadata.donationId;

    if (!donationId) {
      console.error('❌ No donation ID found in payment intent metadata');
      return;
    }

    // First, try to find it as a campaign donation
    const campaignDonation = await db
      .select({ campaignId: donations.campaignId })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (campaignDonation.length > 0) {
      // Handle campaign donation
      await handleCampaignDonationSuccess(donationId, paymentIntent.id, campaignDonation[0].campaignId);
      return;
    }

    // If not found, try charity donation
    const charityDonation = await db
      .select({ charityId: charityDonations.charityId })
      .from(charityDonations)
      .where(eq(charityDonations.id, donationId))
      .limit(1);

    if (charityDonation.length > 0) {
      // Handle charity donation
      await handleCharityDonationSuccess(donationId, paymentIntent.id, charityDonation[0].charityId);
      return;
    }

    console.error('❌ Donation not found in either campaigns or charities:', donationId);
  } catch (error) {
    console.error('💥 Error handling payment success:', error);
  }
}

/**
 * Handle campaign donation success
 */
async function handleCampaignDonationSuccess(donationId: string, paymentIntentId: string, campaignId: string) {
  try {
    // Update donation status
    await db
      .update(donations)
      .set({
        paymentStatus: 'completed',
        processedAt: new Date(),
        paymentIntentId: paymentIntentId,
      })
      .where(eq(donations.id, donationId));

    // Update campaign currentAmount
    await updateCampaignAmount(campaignId);

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
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (campaign.length > 0 && campaign[0].status === 'active') {
      const currentAmount = parseFloat(campaign[0].currentAmount);
      const goalAmount = parseFloat(campaign[0].goalAmount);
      
      if (shouldCloseForGoalReached(currentAmount, goalAmount)) {
        await closeCampaign(campaign[0].id, 'goal_reached', campaign[0].creatorId);
      }
    }

    // Create notification for successful donation
    await createSuccessfulCampaignDonationNotification(donationId, campaignId);

    // Send confirmation email to donor
    await sendDonorConfirmationEmailById(donationId);

    console.log(`✅ Campaign donation ${donationId} processed successfully`);
  } catch (error) {
    console.error('💥 Error handling campaign donation success:', error);
  }
}

/**
 * Handle charity donation success
 */
async function handleCharityDonationSuccess(donationId: string, paymentIntentId: string, charityId: string) {
  try {
    // Update donation status
    const [donation] = await db
      .update(charityDonations)
      .set({
        paymentStatus: 'completed',
        transactionId: paymentIntentId,
        paymentIntentId: paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(charityDonations.id, donationId))
      .returning();

    if (!donation) {
      console.error('Charity donation not found:', donationId);
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
      .where(eq(charities.id, charityId));

    // Get charity details for notification
    const charity = await db.query.charities.findFirst({
      where: eq(charities.id, charityId),
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

    console.log(`✅ Charity donation ${donationId} processed successfully`);
  } catch (error) {
    console.error('💥 Error handling charity donation success:', error);
  }
}

/**
 * Handle failed payment - supports both campaign and charity donations
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const donationId = paymentIntent.metadata.donationId;

    if (!donationId) {
      console.error('❌ No donation ID found in failed payment intent metadata');
      return;
    }

    // First, try to find it as a campaign donation
    const campaignDonation = await db
      .select({ campaignId: donations.campaignId })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (campaignDonation.length > 0) {
      // Handle campaign donation failure
      await handleCampaignDonationFailed(donationId, campaignDonation[0].campaignId);
      return;
    }

    // If not found, try charity donation
    const charityDonation = await db
      .select({ charityId: charityDonations.charityId })
      .from(charityDonations)
      .where(eq(charityDonations.id, donationId))
      .limit(1);

    if (charityDonation.length > 0) {
      // Handle charity donation failure
      await handleCharityDonationFailed(donationId, charityDonation[0].charityId);
      return;
    }

    console.error('❌ Donation not found in either campaigns or charities:', donationId);
  } catch (error) {
    console.error('💥 Error handling payment failure:', error);
  }
}

/**
 * Handle campaign donation failure
 */
async function handleCampaignDonationFailed(donationId: string, campaignId: string) {
  try {
    await db
      .update(donations)
      .set({
        paymentStatus: 'failed',
      })
      .where(eq(donations.id, donationId));

    // Create notification for failed donation
    await createFailedCampaignDonationNotification(donationId, campaignId);
    console.log(`❌ Campaign donation ${donationId} marked as failed`);
  } catch (error) {
    console.error('💥 Error handling campaign donation failure:', error);
  }
}

/**
 * Handle charity donation failure
 */
async function handleCharityDonationFailed(donationId: string, charityId: string) {
  try {
    await db
      .update(charityDonations)
      .set({
        paymentStatus: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(charityDonations.id, donationId));

    // TODO: Send failure notification to donor
    console.log(`❌ Charity donation ${donationId} marked as failed`);
  } catch (error) {
    console.error('💥 Error handling charity donation failure:', error);
  }
}

/**
 * Handle canceled payment - typically for charity donations
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const donationId = paymentIntent.metadata.donationId;

    if (!donationId) {
      console.error('❌ No donation ID found in canceled payment intent metadata');
      return;
    }

    // Check if it's a charity donation (campaign donations typically don't get canceled)
    const charityDonation = await db
      .select({ charityId: charityDonations.charityId })
      .from(charityDonations)
      .where(eq(charityDonations.id, donationId))
      .limit(1);

    if (charityDonation.length > 0) {
      await db
        .update(charityDonations)
        .set({
          paymentStatus: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(charityDonations.id, donationId));

      console.log(`⚠️ Charity donation ${donationId} was canceled`);
    }
  } catch (error) {
    console.error('💥 Error handling payment cancellation:', error);
  }
}

/**
 * Handle refund - supports both campaign and charity donations
 */
async function handleRefund(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string;

    if (!paymentIntentId) {
      console.error('❌ No payment intent ID in refund charge');
      return;
    }

    // First, try to find it as a charity donation
    const charityDonation = await db.query.charityDonations.findFirst({
      where: eq(charityDonations.paymentIntentId, paymentIntentId),
    });

    if (charityDonation) {
      // Update charity donation status
      await db
        .update(charityDonations)
        .set({
          paymentStatus: 'refunded',
          updatedAt: new Date(),
        })
        .where(eq(charityDonations.id, charityDonation.id));

      // Update charity totals
      await db
        .update(charities)
        .set({
          totalReceived: sql`${charities.totalReceived} - ${charityDonation.amount}`,
          pendingAmount: sql`${charities.pendingAmount} - ${charityDonation.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(charities.id, charityDonation.charityId));

      console.log(`💰 Charity donation ${charityDonation.id} refunded`);
      return;
    }

    // If not found, try campaign donation
    const campaignDonation = await db.query.donations.findFirst({
      where: eq(donations.paymentIntentId, paymentIntentId),
    });

    if (campaignDonation) {
      // Update campaign donation status
      await db
        .update(donations)
        .set({
          paymentStatus: 'refunded',
        })
        .where(eq(donations.id, campaignDonation.id));

      // Update campaign amount (subtract refunded amount)
      await updateCampaignAmount(campaignDonation.campaignId);

      console.log(`💰 Campaign donation ${campaignDonation.id} refunded`);
      return;
    }

    console.error('❌ Donation not found for refund:', paymentIntentId);
  } catch (error) {
    console.error('💥 Error handling refund:', error);
  }
}

/**
 * Handle subscription payment success
 */
async function handleSubscriptionPaymentSuccess(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    // Find recurring donation by Stripe subscription ID
    const recurringDonation = await db.query.recurringDonations.findFirst({
      where: eq(recurringDonations.stripeSubscriptionId, subscriptionId),
    });

    if (!recurringDonation) {
      console.error('❌ Recurring donation not found for subscription:', subscriptionId);
      return;
    }

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
      await createSuccessfulCampaignDonationNotification(result.donationId, recurringDonation.campaignId);
      await sendDonorConfirmationEmailById(result.donationId);

      console.log(`✅ Recurring donation payment processed: ${result.donationId}`);
    }
  } catch (error) {
    console.error('💥 Error handling subscription payment success:', error);
  }
}

/**
 * Handle subscription payment failure
 */
async function handleSubscriptionPaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const recurringDonation = await db.query.recurringDonations.findFirst({
      where: eq(recurringDonations.stripeSubscriptionId, subscriptionId),
    });

    if (!recurringDonation) return;

    // Find the pending payment for this invoice
    const paymentResult = await db
      .select()
      .from(recurringDonationPayments)
      .where(and(
        eq(recurringDonationPayments.recurringDonationId, recurringDonation.id),
        eq(recurringDonationPayments.stripeInvoiceId, invoice.id)
      ))
      .limit(1);
    
    const payment = paymentResult[0] || null;

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

      console.log(`❌ Recurring donation payment failed: ${payment.donationId}`);
    }
  } catch (error) {
    console.error('💥 Error handling subscription payment failure:', error);
  }
}

/**
 * Handle subscription updates (cancelled, paused, etc.)
 */
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

    console.log(`🔄 Recurring donation ${recurringDonation.id} updated: ${status}`);
  } catch (error) {
    console.error('💥 Error handling subscription update:', error);
  }
}

/**
 * Handle transfer events (payouts)
 */
async function handleTransfer(eventType: string, transfer: Stripe.Transfer) {
  try {
    const payoutId = transfer.metadata?.payoutId;
    const payoutType = transfer.metadata?.type; // 'campaign' | 'commission'

    if (!payoutId) {
      return;
    }

    let status: string;
    let processedAt: Date | null = null;
    let failureReason: string | null = null;

    switch (eventType) {
      case 'transfer.created':
        status = 'processing';
        break;
      case 'transfer.updated':
        // Check if transfer has been reversed
        if (transfer.reversed) {
          status = 'failed';
          failureReason = 'Transfer reversed';
        } else {
          // Transfer updated but not reversed - assume it's processing or completed
          // In practice, you may want to check the transfer object for additional status indicators
          status = 'processing';
        }
        break;
      case 'transfer.reversed':
        status = 'failed';
        failureReason = 'Transfer reversed';
        break;
      default:
        status = 'processing';
    }

    if (payoutType === 'campaign') {
      const { logPayoutStatusChange } = await import('@/lib/payments/payout-audit');
      const { sendPayoutCompletionEmail, sendPayoutFailureEmail } = await import('@/lib/payments/payout-email');
      
      const payout = await db.query.campaignPayouts.findFirst({
        where: eq(campaignPayouts.id, payoutId),
        with: { user: true, campaign: true },
      });

      if (payout) {
        const oldStatus = payout.status;
        
        await db
          .update(campaignPayouts)
          .set({
            status,
            transactionId: transfer.id,
            processedAt,
            failureReason,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, payoutId));

        // Log audit trail
        await logPayoutStatusChange({
          payoutId,
          oldStatus,
          newStatus: status,
          changedBy: 'stripe_webhook',
          reason: failureReason || `Transfer ${eventType}`,
        });

        // Send email notifications
        if (status === 'completed' && payout.user) {
          try {
            await sendPayoutCompletionEmail({
              userEmail: payout.user.email!,
              userName: payout.user.fullName || payout.user.email!,
              campaignTitle: payout.campaign.title,
              payoutAmount: parseFloat(payout.requestedAmount),
              currency: payout.currency,
              netAmount: parseFloat(payout.netAmount),
              fees: parseFloat(payout.fees),
              payoutProvider: payout.payoutProvider,
              processingTime: '1-3 business days',
              payoutId,
              bankDetails: payout.accountName ? {
                accountName: payout.accountName,
                accountNumber: payout.accountNumber || '',
                bankName: payout.bankName || '',
              } : undefined,
              completionDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            });
          } catch (emailError) {
            console.error('Failed to send completion email:', emailError);
          }
        } else if (status === 'failed' && payout.user) {
          try {
            await sendPayoutFailureEmail({
              userEmail: payout.user.email!,
              userName: payout.user.fullName || payout.user.email!,
              campaignTitle: payout.campaign.title,
              payoutAmount: parseFloat(payout.requestedAmount),
              currency: payout.currency,
              failureReason: failureReason || 'Transfer failed',
              payoutId,
            });
          } catch (emailError) {
            console.error('Failed to send failure email:', emailError);
          }
        }
      }

      console.log(`✅ Campaign payout ${payoutId} ${status}`);
    } else if (payoutType === 'commission') {
      await db
        .update(commissionPayouts)
        .set({
          status,
          transactionId: transfer.id,
          processedAt,
        })
        .where(eq(commissionPayouts.id, payoutId));

      console.log(`✅ Commission payout ${payoutId} ${status}`);
    }
  } catch (error) {
    console.error('💥 Error handling transfer webhook:', error);
  }
}

/**
 * Handle payout events (for external bank account payouts)
 */
async function handlePayout(eventType: string, payout: Stripe.Payout) {
  try {
    // Try to find the payout by transaction ID
    const payoutId = payout.metadata?.payoutId;
    const payoutType = payout.metadata?.type; // 'campaign' | 'commission'

    if (!payoutId) {
      // If no metadata, try to find by transaction ID
      const campaignPayout = await db.query.campaignPayouts.findFirst({
        where: eq(campaignPayouts.transactionId, payout.id),
      });

      if (campaignPayout) {
        await updatePayoutStatus(campaignPayout.id, eventType, payout, 'campaign');
        return;
      }

      const commissionPayout = await db.query.commissionPayouts.findFirst({
        where: eq(commissionPayouts.transactionId, payout.id),
      });

      if (commissionPayout) {
        await updatePayoutStatus(commissionPayout.id, eventType, payout, 'commission');
        return;
      }

      console.log(`⚠️ Payout ${payout.id} not found in database`);
      return;
    }

    let status: string;
    let processedAt: Date | null = null;
    let failureReason: string | null = null;

    switch (eventType) {
      case 'payout.paid':
        status = 'completed';
        processedAt = new Date();
        break;
      case 'payout.failed':
        status = 'failed';
        failureReason = payout.failure_code || 'Payout failed';
        break;
      case 'payout.canceled':
        status = 'failed';
        failureReason = 'Payout canceled';
        break;
      default:
        status = 'processing';
    }

    if (payoutType === 'campaign') {
      const { logPayoutStatusChange } = await import('@/lib/payments/payout-audit');
      const { sendPayoutCompletionEmail, sendPayoutFailureEmail } = await import('@/lib/payments/payout-email');
      
      const campaignPayout = await db.query.campaignPayouts.findFirst({
        where: eq(campaignPayouts.id, payoutId),
        with: { user: true, campaign: true },
      });

      if (campaignPayout) {
        const oldStatus = campaignPayout.status;
        
        await db
          .update(campaignPayouts)
          .set({
            status,
            transactionId: payout.id,
            processedAt,
            failureReason,
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, payoutId));

        // Log audit trail
        await logPayoutStatusChange({
          payoutId,
          oldStatus,
          newStatus: status,
          changedBy: 'stripe_webhook',
          reason: failureReason || `Payout ${eventType}`,
        });

        // Send email notifications
        if (status === 'completed' && campaignPayout.user) {
          try {
            await sendPayoutCompletionEmail({
              userEmail: campaignPayout.user.email!,
              userName: campaignPayout.user.fullName || campaignPayout.user.email!,
              campaignTitle: campaignPayout.campaign.title,
              payoutAmount: parseFloat(campaignPayout.requestedAmount),
              currency: campaignPayout.currency,
              netAmount: parseFloat(campaignPayout.netAmount),
              fees: parseFloat(campaignPayout.fees),
              payoutProvider: campaignPayout.payoutProvider,
              processingTime: '1-3 business days',
              payoutId,
              bankDetails: campaignPayout.accountName ? {
                accountName: campaignPayout.accountName,
                accountNumber: campaignPayout.accountNumber || '',
                bankName: campaignPayout.bankName || '',
              } : undefined,
              completionDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            });
          } catch (emailError) {
            console.error('Failed to send completion email:', emailError);
          }
        } else if (status === 'failed' && campaignPayout.user) {
          try {
            await sendPayoutFailureEmail({
              userEmail: campaignPayout.user.email!,
              userName: campaignPayout.user.fullName || campaignPayout.user.email!,
              campaignTitle: campaignPayout.campaign.title,
              payoutAmount: parseFloat(campaignPayout.requestedAmount),
              currency: campaignPayout.currency,
              failureReason: failureReason || 'Payout failed',
              payoutId,
            });
          } catch (emailError) {
            console.error('Failed to send failure email:', emailError);
          }
        }
      }

      console.log(`✅ Campaign payout ${payoutId} ${status}`);
    } else if (payoutType === 'commission') {
      await db
        .update(commissionPayouts)
        .set({
          status,
          transactionId: payout.id,
          processedAt,
        })
        .where(eq(commissionPayouts.id, payoutId));

      console.log(`✅ Commission payout ${payoutId} ${status}`);
    }
  } catch (error) {
    console.error('💥 Error handling payout webhook:', error);
  }
}

/**
 * Update payout status by transaction ID (fallback when metadata is missing)
 */
async function updatePayoutStatus(
  payoutId: string,
  eventType: string,
  payout: Stripe.Payout,
  type: 'campaign' | 'commission'
) {
  try {
    let status: string;
    let processedAt: Date | null = null;
    let failureReason: string | null = null;

    switch (eventType) {
      case 'payout.paid':
        status = 'completed';
        processedAt = new Date();
        break;
      case 'payout.failed':
        status = 'failed';
        failureReason = payout.failure_code || 'Payout failed';
        break;
      case 'payout.canceled':
        status = 'failed';
        failureReason = 'Payout canceled';
        break;
      default:
        status = 'processing';
    }

    if (type === 'campaign') {
      await db
        .update(campaignPayouts)
        .set({
          status,
          transactionId: payout.id,
          processedAt,
          failureReason,
          updatedAt: new Date(),
        })
        .where(eq(campaignPayouts.id, payoutId));
    } else {
      await db
        .update(commissionPayouts)
        .set({
          status,
          transactionId: payout.id,
          processedAt,
        })
        .where(eq(commissionPayouts.id, payoutId));
    }
  } catch (error) {
    console.error('💥 Error updating payout status:', error);
  }
}

// ==================== Helper Functions for Campaign Donations ====================

/**
 * Create notification for successful campaign donation
 */
async function createSuccessfulCampaignDonationNotification(donationId: string, campaignId: string) {
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

    // Send email to campaign creator
    const { sendCampaignDonationEmailById } = await import('@/lib/notifications/campaign-donation-email');
    const emailResult = await sendCampaignDonationEmailById(
      donationId,
      campaign[0].creatorId,
      notificationCheck.isLargeDonation
    );

    if (emailResult.sent) {
      console.log(`✅ Campaign donation email sent to creator`);
    } else {
      console.warn(`⚠️ Failed to send campaign donation email: ${emailResult.reason}`);
    }

  } catch (error) {
    console.error('Error creating successful donation notification:', error);
  }
}

/**
 * Create notification for failed campaign donation
 */
async function createFailedCampaignDonationNotification(donationId: string, campaignId: string) {
  try {
    // Get campaign creator ID
    const campaign = await db
      .select({ creatorId: campaigns.creatorId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign.length) {
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
