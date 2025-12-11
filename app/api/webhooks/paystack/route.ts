import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyPaystackWebhook, verifyPaystackPayment } from '@/lib/payments/paystack';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { notifications } from '@/lib/schema/notifications';
import { charityDonations, charities } from '@/lib/schema/charities';
import { campaignPayouts, commissionPayouts } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';
import { 
  DONATION_STATUS_CONFIG, 
  getFailureReason
} from '@/lib/utils/donation-status';
import { shouldCloseForGoalReached, closeCampaign } from '@/lib/utils/campaign-closure';
import { calculateAndDistributeCommissions } from '@/lib/utils/commission-calculation';
import { updateCampaignAmount } from '@/lib/utils/campaign-amount';
import { shouldNotifyUserOfDonation, formatDonationNotificationMessage } from '@/lib/utils/donation-notification-utils';
import { sendDonorConfirmationEmailById } from '@/lib/notifications/donor-confirmation-email';
import { notifyAdminsOfCharityDonation } from '@/lib/notifications/charity-donation-alerts';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/paystack
 * Unified Paystack webhook handler for:
 * - Campaign donations (charge.success, charge.failed, charge.pending)
 * - Charity donations (charge.success, charge.failed)
 * - Payouts (transfer.success, transfer.failed, transfer.reversed)
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

      case 'charge.pending':
        await handleChargePending(event.data);
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
        console.log(`Unhandled Paystack event: ${event.event}`);
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
 * Handle successful charge - supports both campaign and charity donations
 */
async function handleChargeSuccess(data: any) {
  try {
    const donationId = data.metadata?.donationId;
    const reference = data.reference;

    if (!donationId) {
      console.error('❌ No donation ID found in charge metadata');
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
      await handleCampaignDonationSuccess(donationId, reference, campaignDonation[0].campaignId);
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
      await handleCharityDonationSuccess(donationId, reference, charityDonation[0].charityId);
      return;
    }

    console.error('❌ Donation not found in either campaigns or charities:', donationId);
  } catch (error) {
    console.error('💥 Error handling charge success:', error);
  }
}

/**
 * Handle campaign donation success
 */
async function handleCampaignDonationSuccess(donationId: string, reference: string, campaignId: string) {
  try {
    // Verify the transaction
    const verification = await verifyPaystackPayment(reference);
    
    if (verification.status && verification.data.status === 'success') {
      // Update donation status
      await db
        .update(donations)
        .set({
          paymentStatus: 'completed',
          processedAt: new Date(),
          lastStatusUpdate: new Date(),
          providerStatus: 'success',
          providerError: null,
          paymentIntentId: reference,
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

      // Calculate and distribute commissions
      await calculateAndDistributeCommissions(donationId);

      // Create notification for successful donation
      await createSuccessfulCampaignDonationNotification(donationId, campaignId);

      // Send confirmation email to donor
      await sendDonorConfirmationEmailById(donationId);

      console.log(`✅ Campaign donation ${donationId} processed successfully`);
    } else {
      console.error('❌ Transaction verification failed:', verification.message);
    }
  } catch (error) {
    console.error('💥 Error handling campaign donation success:', error);
  }
}

/**
 * Handle charity donation success
 */
async function handleCharityDonationSuccess(donationId: string, reference: string, charityId: string) {
  try {
    // Update donation status
    const [donation] = await db
      .update(charityDonations)
      .set({
        paymentStatus: 'completed',
        transactionId: reference,
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
 * Handle failed charge - supports both campaign and charity donations
 */
async function handleChargeFailed(data: any) {
  try {
    const donationId = data.metadata?.donationId;
    const reference = data.reference;

    if (!donationId) {
      console.error('❌ No donation ID found in failed charge metadata');
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
      await handleCampaignDonationFailed(donationId, reference, campaignDonation[0].campaignId, data);
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
    console.error('💥 Error handling charge failure:', error);
  }
}

/**
 * Handle campaign donation failure
 */
async function handleCampaignDonationFailed(
  donationId: string, 
  reference: string, 
  campaignId: string,
  chargeData: any
) {
  try {
    // Get current donation to check retry attempts
    const currentDonation = await db
      .select({ retryAttempts: donations.retryAttempts })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    const retryAttempts = (currentDonation[0]?.retryAttempts || 0) + 1;
    const failureReason = getFailureReason('paystack', 'failed', chargeData.gateway_response);
    
    // Update donation status to failed with enhanced tracking
    await db
      .update(donations)
      .set({
        paymentStatus: 'failed',
        retryAttempts: retryAttempts,
        failureReason: retryAttempts >= DONATION_STATUS_CONFIG.MAX_RETRY_ATTEMPTS 
          ? DONATION_STATUS_CONFIG.FAILURE_REASONS.MAX_RETRIES 
          : failureReason,
        lastStatusUpdate: new Date(),
        providerStatus: 'failed',
        providerError: chargeData.gateway_response || 'Payment failed',
        paymentIntentId: reference,
      })
      .where(eq(donations.id, donationId));

    // Create notification for failed donation
    await createFailedCampaignDonationNotification(donationId, campaignId);
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
 * Handle pending charge - typically for campaign donations
 */
async function handleChargePending(data: any) {
  try {
    const donationId = data.metadata?.donationId;
    
    if (!donationId) {
      return;
    }

    // Check if it's a campaign donation
    const campaignDonation = await db
      .select({ campaignId: donations.campaignId })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (campaignDonation.length > 0) {
      // Update donation status to pending with enhanced tracking
      await db
        .update(donations)
        .set({
          paymentStatus: 'pending',
          lastStatusUpdate: new Date(),
          providerStatus: 'pending',
          providerError: null,
        })
        .where(eq(donations.id, donationId));

      // Create notification for pending donation
      await createPendingCampaignDonationNotification(donationId, campaignDonation[0].campaignId);
    }
  } catch (error) {
    console.error('💥 Error handling pending charge:', error);
  }
}

/**
 * Handle successful transfer (payout)
 */
async function handleTransferSuccess(data: any) {
  try {
    const reference = data.reference;
    const payoutId = data.metadata?.payoutId;
    const payoutType = data.metadata?.type; // 'campaign' | 'commission'

    if (!payoutId) {
      return;
    }

    if (payoutType === 'campaign') {
      // Update campaign payout
      await db
        .update(campaignPayouts)
        .set({
          status: 'completed',
          transactionId: reference,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(campaignPayouts.reference, reference));

      console.log(`✅ Campaign payout ${payoutId} completed`);
    } else if (payoutType === 'commission') {
      // Update commission payout
      await db
        .update(commissionPayouts)
        .set({
          status: 'completed',
          transactionId: reference,
          processedAt: new Date(),
        })
        .where(eq(commissionPayouts.id, payoutId));

      console.log(`✅ Commission payout ${payoutId} completed`);
    }
  } catch (error) {
    console.error('💥 Error handling Paystack transfer success:', error);
  }
}

/**
 * Handle failed transfer
 */
async function handleTransferFailed(data: any) {
  try {
    const reference = data.reference;
    const payoutId = data.metadata?.payoutId;
    const payoutType = data.metadata?.type;
    const failureReason = data.failure_reason || data.reason || 'Transfer failed';

    if (!payoutId) {
      return;
    }

    if (payoutType === 'campaign') {
      await db
        .update(campaignPayouts)
        .set({
          status: 'failed',
          transactionId: reference,
          failureReason,
          updatedAt: new Date(),
        })
        .where(eq(campaignPayouts.reference, reference));

      console.log(`❌ Campaign payout ${payoutId} failed: ${failureReason}`);
    } else if (payoutType === 'commission') {
      await db
        .update(commissionPayouts)
        .set({
          status: 'failed',
          transactionId: reference,
        })
        .where(eq(commissionPayouts.id, payoutId));

      console.log(`❌ Commission payout ${payoutId} failed`);
    }

    // TODO: Notify admin of failed payout
  } catch (error) {
    console.error('💥 Error handling Paystack transfer failure:', error);
  }
}

/**
 * Handle reversed transfer
 */
async function handleTransferReversed(data: any) {
  try {
    const reference = data.reference;
    const payoutId = data.metadata?.payoutId;
    const payoutType = data.metadata?.type;

    if (!payoutId) {
      return;
    }

    if (payoutType === 'campaign') {
      await db
        .update(campaignPayouts)
        .set({
          status: 'failed',
          transactionId: reference,
          failureReason: 'Transfer reversed',
          updatedAt: new Date(),
        })
        .where(eq(campaignPayouts.reference, reference));

      console.log(`⚠️ Campaign payout ${payoutId} reversed`);
    } else if (payoutType === 'commission') {
      await db
        .update(commissionPayouts)
        .set({
          status: 'failed',
          transactionId: reference,
        })
        .where(eq(commissionPayouts.id, payoutId));

      console.log(`⚠️ Commission payout ${payoutId} reversed`);
    }

    // TODO: Credit back to charity pending amount if applicable
  } catch (error) {
    console.error('💥 Error handling Paystack transfer reversal:', error);
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

/**
 * Create notification for pending campaign donation
 */
async function createPendingCampaignDonationNotification(donationId: string, campaignId: string) {
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
      console.error('Donation not found:', donationId);
      return;
    }

    // Create notification for campaign creator
    await db.insert(notifications).values({
      userId: campaign[0].creatorId,
      type: 'donation_pending',
      title: 'Donation Pending',
      message: `A donation of ${donation[0].currency} ${donation[0].amount} is pending verification. You'll be notified once it's confirmed.`,
      metadata: JSON.stringify({
        donationId,
        campaignId,
        amount: donation[0].amount,
        currency: donation[0].currency,
        donorId: donation[0].donorId
      })
    });

  } catch (error) {
    console.error('Error creating pending donation notification:', error);
  }
}
