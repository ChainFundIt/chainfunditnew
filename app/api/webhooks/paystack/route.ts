import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyPaystackWebhook, verifyPaystackPayment } from '@/lib/payments/paystack';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { recurringDonations, recurringDonationPayments } from '@/lib/schema/recurring-donations';
import { campaigns } from '@/lib/schema/campaigns';
import { notifications } from '@/lib/schema/notifications';
import { charityDonations, charities } from '@/lib/schema/charities';
import { campaignPayouts, commissionPayouts } from '@/lib/schema';
import { users } from '@/lib/schema/users';
import { eq, sql, and } from 'drizzle-orm';
import { createPaystackPlan, createPaystackSubscription } from '@/lib/payments/paystack-subscriptions';
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
    const donationId = await resolveDonationIdFromCharge(data);
    const fallbackCampaignId = await resolveCampaignIdFromCharge(data);
    const reference = data.reference;
    const recurringDonationId = extractRecurringDonationId(data.metadata);

    if (recurringDonationId) {
      await handleRecurringChargeSuccess(data, recurringDonationId, donationId ?? undefined, reference);
      return;
    }

    if (!donationId) {
      if (fallbackCampaignId) {
        const syntheticDonationId = await resolveOrCreateQuickDonateDonationRecord(
          data,
          fallbackCampaignId,
          reference
        );
        if (syntheticDonationId) {
          await handleCampaignDonationSuccess(syntheticDonationId, reference, fallbackCampaignId);
          return;
        }
      }
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
    const existingDonation = await db
      .select({ paymentStatus: donations.paymentStatus })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!existingDonation.length) {
      console.error('❌ Donation not found:', donationId);
      return;
    }

    if (existingDonation[0].paymentStatus === 'completed') {
      return;
    }

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
    const donationId = await resolveDonationIdFromCharge(data);
    const reference = data.reference;
    const recurringDonationId = extractRecurringDonationId(data.metadata);

    if (recurringDonationId) {
      await handleRecurringChargeFailed(data, recurringDonationId, donationId ?? undefined, reference);
      return;
    }

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
    const donationId = await resolveDonationIdFromCharge(data);
    
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

async function resolveDonationIdFromCharge(data: any): Promise<string | null> {
  const metadataDonationId = data?.metadata?.donationId;
  if (typeof metadataDonationId === 'string' && metadataDonationId) {
    return metadataDonationId;
  }

  const customerMetadataDonationId = data?.customer?.metadata?.donationId;
  if (typeof customerMetadataDonationId === 'string' && customerMetadataDonationId) {
    return customerMetadataDonationId;
  }

  const customerCode = data?.customer?.customer_code;
  if (typeof customerCode === 'string' && customerCode) {
    const [matchedDonation] = await db
      .select({ id: donations.id })
      .from(donations)
      .where(eq(donations.paystackCustomerCode, customerCode))
      .limit(1);
    if (matchedDonation?.id) {
      return matchedDonation.id;
    }
  }

  return null;
}

async function resolveCampaignIdFromCharge(data: any): Promise<string | null> {
  const metadataCampaignId = data?.metadata?.campaignId;
  if (typeof metadataCampaignId === 'string' && metadataCampaignId) {
    return metadataCampaignId;
  }

  const customerMetadataCampaignId = data?.customer?.metadata?.campaignId;
  if (typeof customerMetadataCampaignId === 'string' && customerMetadataCampaignId) {
    return customerMetadataCampaignId;
  }

  const customerCode = data?.customer?.customer_code;
  if (typeof customerCode === 'string' && customerCode) {
    const [campaignMatch] = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(eq(campaigns.quickDonateCustomerCode, customerCode))
      .limit(1);
    if (campaignMatch?.id) {
      return campaignMatch.id;
    }
  }

  return null;
}

async function createQuickDonateDonationRecord(
  data: any,
  campaignId: string,
  reference: string
): Promise<string | null> {
  const amountKobo = Number(data?.amount || 0);
  const amount = Number.isFinite(amountKobo) ? amountKobo / 100 : 0;
  if (amount <= 0) {
    return null;
  }

  const [existing] = await db
    .select({ id: donations.id })
    .from(donations)
    .where(eq(donations.paymentIntentId, reference))
    .limit(1);
  if (existing?.id) {
    return existing.id;
  }

  const donorEmail =
    (typeof data?.customer?.email === 'string' && data.customer.email.trim()) ||
    'quickdonor@chainfundit.app';
  const donorName =
    (typeof data?.customer?.first_name === 'string' && data.customer.first_name.trim()) ||
    (typeof data?.customer?.last_name === 'string' && data.customer.last_name.trim())
      ? `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim()
      : 'Quick Donor';

  let donorId: string | null = null;
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, donorEmail))
    .limit(1);

  if (existingUser?.id) {
    donorId = existingUser.id;
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        email: donorEmail,
        fullName: donorName,
        isVerified: false,
        hasCompletedProfile: false,
      })
      .returning({ id: users.id });
    donorId = newUser?.id ?? null;
  }

  if (!donorId) return null;

  const [newDonation] = await db
    .insert(donations)
    .values({
      campaignId,
      donorId,
      amount: amount.toString(),
      currency: 'NGN',
      paymentMethod: 'paystack',
      paymentStatus: 'pending',
      message: 'Quick Donate',
      isAnonymous: true,
      donorName,
      donorEmail,
      quickDonate: true,
      paymentIntentId: reference,
    })
    .returning({ id: donations.id });

  return newDonation?.id ?? null;
}

async function resolveOrCreateQuickDonateDonationRecord(
  data: any,
  campaignId: string,
  reference: string
): Promise<string | null> {
  const amountKobo = Number(data?.amount || 0);
  const amount = Number.isFinite(amountKobo) ? amountKobo / 100 : 0;
  if (amount <= 0) return null;

  const amountStr =
    Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

  // Prefer matching an existing pending quick-donate attempt for this campaign+amount
  const [pendingMatch] = await db
    .select({ id: donations.id })
    .from(donations)
    .where(
      and(
        eq(donations.campaignId, campaignId),
        eq(donations.quickDonate, true),
        eq(donations.paymentStatus, 'pending'),
        eq(donations.amount, amountStr)
      )
    )
    .orderBy(sql`${donations.createdAt} desc`)
    .limit(1);

  if (pendingMatch?.id) {
    const donorEmail =
      (typeof data?.customer?.email === 'string' && data.customer.email.trim()) ||
      null;
    const donorName =
      (typeof data?.customer?.first_name === 'string' && data.customer.first_name.trim()) ||
      (typeof data?.customer?.last_name === 'string' && data.customer.last_name.trim())
        ? `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim()
        : null;

    await db
      .update(donations)
      .set({
        paymentIntentId: reference,
        donorEmail: donorEmail ?? undefined,
        donorName: donorName ?? undefined,
      })
      .where(eq(donations.id, pendingMatch.id));

    return pendingMatch.id;
  }

  // Fallback: create a synthetic donation if no attempt exists (e.g. webhook arrives without UI flow)
  return await createQuickDonateDonationRecord(data, campaignId, reference);
}

function extractRecurringDonationId(metadata: any): string | null {
  if (!metadata) return null;

  if (typeof metadata.recurringDonationId === 'string' && metadata.recurringDonationId) {
    return metadata.recurringDonationId;
  }

  const customField = Array.isArray(metadata.custom_fields)
    ? metadata.custom_fields.find(
        (field: any) =>
          field?.variable_name === 'recurring_donation_id' && typeof field?.value === 'string'
      )
    : null;

  if (customField?.value) {
    return customField.value;
  }

  return null;
}

async function handleRecurringChargeSuccess(
  data: any,
  recurringDonationId: string,
  donationIdFromMetadata: string | undefined,
  reference: string
) {
  const recurringDonation = await db.query.recurringDonations.findFirst({
    where: eq(recurringDonations.id, recurringDonationId),
  });

  if (!recurringDonation) {
    console.error('Recurring donation not found:', recurringDonationId);
    return;
  }

  const { updateSubscriptionAfterPayment, processRecurringDonationPayment } = await import('@/lib/services/subscription-service');

  let donationId = donationIdFromMetadata;

  if (!donationId) {
    const created = await processRecurringDonationPayment(recurringDonationId);
    if (!created.success || !created.donationId) {
      console.error('Failed to create recurring donation payment:', created.error);
      return;
    }
    donationId = created.donationId;
  }

  await handleCampaignDonationSuccess(
    donationId,
    reference,
    recurringDonation.campaignId
  );

  await db
    .update(recurringDonationPayments)
    .set({ paystackTransactionId: reference })
    .where(
      and(
        eq(recurringDonationPayments.recurringDonationId, recurringDonationId),
        eq(recurringDonationPayments.donationId, donationId)
      )
    );

  await updateSubscriptionAfterPayment(recurringDonationId, donationId, true);

  if (!recurringDonation.paystackSubscriptionId) {
    const authorizationCode = data.authorization?.authorization_code;
    const customerCode =
      data.customer?.customer_code || recurringDonation.paystackCustomerCode;

    if (!authorizationCode || !customerCode) {
      console.error(
        `Missing authorization/customer code for recurring setup ${recurringDonationId}`
      );
      return;
    }

    const plan = await createPaystackPlan(
      `Recurring Donation - ${recurringDonation.amount} ${recurringDonation.currency}`,
      parseFloat(recurringDonation.amount),
      recurringDonation.currency,
      recurringDonation.period as 'monthly' | 'quarterly' | 'yearly',
      {
        recurringDonationId,
        campaignId: recurringDonation.campaignId,
      }
    );

    const paystackSubscription = await createPaystackSubscription(
      customerCode,
      plan.plan_code,
      authorizationCode,
      {
        recurringDonationId,
        campaignId: recurringDonation.campaignId,
      }
    );

    await db
      .update(recurringDonations)
      .set({
        paystackSubscriptionId: paystackSubscription.subscription_code,
        paystackCustomerCode: customerCode,
        status: 'active',
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(recurringDonations.id, recurringDonationId));
  }
}

async function handleRecurringChargeFailed(
  data: any,
  recurringDonationId: string,
  donationIdFromMetadata: string | undefined,
  reference: string
) {
  const recurringDonation = await db.query.recurringDonations.findFirst({
    where: eq(recurringDonations.id, recurringDonationId),
  });

  if (!recurringDonation) {
    console.error('Recurring donation not found:', recurringDonationId);
    return;
  }

  const failureReason = getFailureReason(
    'paystack',
    'failed',
    data.gateway_response || data.status || 'Recurring charge failed'
  );

  if (donationIdFromMetadata) {
    await handleCampaignDonationFailed(
      donationIdFromMetadata,
      reference,
      recurringDonation.campaignId,
      data
    );

    const { updateSubscriptionAfterPayment } = await import('@/lib/services/subscription-service');
    await updateSubscriptionAfterPayment(recurringDonationId, donationIdFromMetadata, false);
  } else {
    await db
      .update(recurringDonations)
      .set({
        failedAttempts: (recurringDonation.failedAttempts || 0) + 1,
        lastFailureReason: failureReason,
        updatedAt: new Date(),
      })
      .where(eq(recurringDonations.id, recurringDonationId));
  }
}

/**
 * Handle successful transfer (payout)
 */
async function resolvePayoutTarget(data: {
  reference?: string;
  transferCode?: string;
  metadata?: {
    payoutId?: string;
    type?: 'campaign' | 'commission';
  };
}): Promise<{ payoutId: string; payoutType: 'campaign' | 'commission' } | null> {
  const metadataPayoutId = data.metadata?.payoutId;
  const metadataPayoutType = data.metadata?.type;

  if (
    metadataPayoutId &&
    (metadataPayoutType === 'campaign' || metadataPayoutType === 'commission')
  ) {
    return {
      payoutId: metadataPayoutId,
      payoutType: metadataPayoutType,
    };
  }

  if (data.transferCode) {
    const [campaignMatch] = await db
      .select({ id: campaignPayouts.id })
      .from(campaignPayouts)
      .where(eq(campaignPayouts.transactionId, data.transferCode))
      .limit(1);

    if (campaignMatch) {
      return { payoutId: campaignMatch.id, payoutType: 'campaign' };
    }

    const [commissionMatch] = await db
      .select({ id: commissionPayouts.id })
      .from(commissionPayouts)
      .where(eq(commissionPayouts.transactionId, data.transferCode))
      .limit(1);

    if (commissionMatch) {
      return { payoutId: commissionMatch.id, payoutType: 'commission' };
    }
  }

  if (data.reference) {
    const [campaignMatch] = await db
      .select({ id: campaignPayouts.id })
      .from(campaignPayouts)
      .where(eq(campaignPayouts.reference, data.reference))
      .limit(1);

    if (campaignMatch) {
      return { payoutId: campaignMatch.id, payoutType: 'campaign' };
    }

    const [commissionMatch] = await db
      .select({ id: commissionPayouts.id })
      .from(commissionPayouts)
      .where(eq(commissionPayouts.id, data.reference))
      .limit(1);

    if (commissionMatch) {
      return { payoutId: commissionMatch.id, payoutType: 'commission' };
    }
  }

  return null;
}

async function handleTransferSuccess(data: any) {
  try {
    const reference = data.reference; // Our payout reference
    const transferCode = data.transfer_code; // Paystack transfer code (the actual transfer ID)
    const resolvedPayout = await resolvePayoutTarget({
      reference,
      transferCode,
      metadata: data.metadata,
    });

    if (!resolvedPayout) {
      console.warn('Unable to resolve payout for Paystack transfer success', {
        reference,
        transferCode,
      });
      return;
    }

    const { payoutId, payoutType } = resolvedPayout;

    // Use transfer_code (the actual Paystack transfer ID) instead of reference
    // transfer_code is what we need to verify the transfer later
    // reference is just the reference we sent to Paystack (our payout reference)
    const transactionId = transferCode || reference;

    if (payoutType === 'campaign') {
      // Update campaign payout
      await db
        .update(campaignPayouts)
        .set({
          status: 'completed',
          transactionId: transactionId, // Use transfer_code, not reference!
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(campaignPayouts.id, payoutId));

      console.log(`✅ Campaign payout ${payoutId} completed with transfer code: ${transferCode || reference}`);
    } else if (payoutType === 'commission') {
      // Update commission payout
      await db
        .update(commissionPayouts)
        .set({
          status: 'completed',
          transactionId: transactionId, // Use transfer_code, not reference!
          processedAt: new Date(),
        })
        .where(eq(commissionPayouts.id, payoutId));

      console.log(`✅ Commission payout ${payoutId} completed with transfer code: ${transferCode || reference}`);
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
    const reference = data.reference; // Our payout reference
    const transferCode = data.transfer_code; // Paystack transfer code (the actual transfer ID)
    const resolvedPayout = await resolvePayoutTarget({
      reference,
      transferCode,
      metadata: data.metadata,
    });
    const failureReason = data.failure_reason || data.reason || 'Transfer failed';

    if (!resolvedPayout) {
      console.warn('Unable to resolve payout for Paystack transfer failure', {
        reference,
        transferCode,
      });
      return;
    }

    const { payoutId, payoutType } = resolvedPayout;

    // Use transfer_code (the actual Paystack transfer ID) instead of reference
    const transactionId = transferCode || reference;

    if (payoutType === 'campaign') {
      await db
        .update(campaignPayouts)
        .set({
          status: 'failed',
          transactionId: transactionId, // Use transfer_code, not reference!
          failureReason,
          updatedAt: new Date(),
        })
        .where(eq(campaignPayouts.id, payoutId));

      console.log(`❌ Campaign payout ${payoutId} failed: ${failureReason}`);
    } else if (payoutType === 'commission') {
      await db
        .update(commissionPayouts)
        .set({
          status: 'failed',
          transactionId: transactionId, // Use transfer_code, not reference!
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
    const reference = data.reference; // Our payout reference
    const transferCode = data.transfer_code; // Paystack transfer code (the actual transfer ID)
    const resolvedPayout = await resolvePayoutTarget({
      reference,
      transferCode,
      metadata: data.metadata,
    });

    if (!resolvedPayout) {
      console.warn('Unable to resolve payout for Paystack transfer reversal', {
        reference,
        transferCode,
      });
      return;
    }

    const { payoutId, payoutType } = resolvedPayout;

    // Use transfer_code (the actual Paystack transfer ID) instead of reference
    const transactionId = transferCode || reference;

    if (payoutType === 'campaign') {
      await db
        .update(campaignPayouts)
        .set({
          status: 'failed',
          transactionId: transactionId, // Use transfer_code, not reference!
          failureReason: 'Transfer reversed',
          updatedAt: new Date(),
        })
        .where(eq(campaignPayouts.id, payoutId));

      console.log(`⚠️ Campaign payout ${payoutId} reversed`);
    } else if (payoutType === 'commission') {
      await db
        .update(commissionPayouts)
        .set({
          status: 'failed',
          transactionId: transactionId, // Use transfer_code, not reference!
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
