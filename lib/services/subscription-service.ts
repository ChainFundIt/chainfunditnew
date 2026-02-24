import { db } from '@/lib/db';
import { recurringDonations, recurringDonationPayments } from '@/lib/schema/recurring-donations';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq, and } from 'drizzle-orm';
import { 
  createOrRetrieveStripeCustomer,
  createStripeSubscription,
} from '@/lib/payments/stripe-subscriptions';
import {
  createOrRetrievePaystackCustomer,
  createPaystackPlan,
  createPaystackSubscription,
} from '@/lib/payments/paystack-subscriptions';
import { initializePaystackPayment } from '@/lib/payments/paystack';
import {
  calculateNextBillingDate,
  getBillingDay,
  normalizePeriod,
  isRecurringPeriod,
} from '@/lib/utils/recurring-donations';
import type { SubscriptionPeriod } from '@/lib/payments/stripe-subscriptions';

/**
 * Create a recurring donation subscription
 */
export async function createRecurringDonationSubscription(data: {
  campaignId: string;
  donorId: string;
  chainerId?: string;
  amount: number;
  currency: string;
  period: string;
  paymentMethod: 'stripe' | 'paystack';
  donorEmail: string;
  donorName?: string;
  message?: string;
  isAnonymous?: boolean;
  authorizationCode?: string; // For Paystack
}): Promise<{ subscription: any; clientSecret?: string; authorizationUrl?: string }> {
  const normalizedPeriod = normalizePeriod(data.period) as SubscriptionPeriod;
  
  if (!isRecurringPeriod(data.period)) {
    throw new Error('Period must be recurring (monthly, quarterly, or yearly)');
  }

  // Create recurring donation record
  const nextBillingDate = calculateNextBillingDate(normalizedPeriod);
  const billingDay = getBillingDay();

  const isPaystackWithoutAuthorization =
    data.paymentMethod === 'paystack' && !data.authorizationCode;

  const subscriptionRecord = await db.insert(recurringDonations).values({
    campaignId: data.campaignId,
    donorId: data.donorId,
    chainerId: data.chainerId,
    amount: data.amount.toString(),
    currency: data.currency,
    period: normalizedPeriod,
    paymentMethod: data.paymentMethod,
    nextBillingDate: nextBillingDate.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
    billingDay: billingDay,
    message: data.message,
    isAnonymous: data.isAnonymous || false,
    status: isPaystackWithoutAuthorization ? 'pending' : 'active',
    isActive: !isPaystackWithoutAuthorization,
  }).returning();

  const subscription = subscriptionRecord[0];

  // Create subscription with payment provider
  if (data.paymentMethod === 'stripe') {
    // Create or retrieve Stripe customer
    const customer = await createOrRetrieveStripeCustomer(
      data.donorEmail,
      data.donorName,
      {
        recurringDonationId: subscription.id,
        campaignId: data.campaignId,
      }
    );

    // Create Stripe subscription
    const stripeSubscription = await createStripeSubscription(
      customer.id,
      data.amount,
      data.currency,
      normalizedPeriod,
      {
        recurringDonationId: subscription.id,
        campaignId: data.campaignId,
        donorId: data.donorId,
      }
    );

    // Update subscription record with Stripe IDs
    await db
      .update(recurringDonations)
      .set({
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customer.id,
      })
      .where(eq(recurringDonations.id, subscription.id));

    return {
      subscription,
      clientSecret: (stripeSubscription.latest_invoice as any)?.payment_intent?.client_secret,
    };
  } else if (data.paymentMethod === 'paystack') {
    // Fetch campaign details for metadata
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, data.campaignId),
    });

    // Prepare comprehensive campaign metadata with custom_fields for Paystack Dashboard display
    const campaignMetadata = {
      recurringDonationId: subscription.id,
      campaignId: data.campaignId,
      ...(campaign && {
        custom_fields: [
          {
            display_name: "Campaign Title",
            variable_name: "campaign_title",
            value: campaign.title,
          },
          {
            display_name: "Campaign Slug",
            variable_name: "campaign_slug",
            value: campaign.slug,
          },
          {
            display_name: "Campaign ID",
            variable_name: "campaign_id",
            value: data.campaignId,
          },
          {
            display_name: "Recurring Donation ID",
            variable_name: "recurring_donation_id",
            value: subscription.id,
          },
          ...(campaign.description ? [{
            display_name: "Campaign Description",
            variable_name: "campaign_description",
            value: campaign.description.length > 200 
              ? campaign.description.substring(0, 200) + "..."
              : campaign.description,
          }] : []),
          ...(campaign.goalAmount ? [{
            display_name: "Campaign Goal",
            variable_name: "campaign_goal",
            value: `${campaign.currency} ${campaign.goalAmount}`,
          }] : []),
        ],
      }),
    };

    // Create or retrieve Paystack customer
    const customer = await createOrRetrievePaystackCustomer(
      data.donorEmail,
      data.donorName?.split(' ')[0],
      data.donorName?.split(' ').slice(1).join(' '),
      undefined,
      campaignMetadata
    );

    // Create Paystack subscription (requires authorization code from first payment)
    if (data.authorizationCode) {
      const plan = await createPaystackPlan(
        `Recurring Donation - ${data.amount} ${data.currency}`,
        data.amount,
        data.currency,
        normalizedPeriod,
        campaignMetadata
      );

      const paystackSubscription = await createPaystackSubscription(
        customer.customer_code,
        plan.plan_code,
        data.authorizationCode,
        campaignMetadata
      );

      // Update subscription record with Paystack IDs
      await db
        .update(recurringDonations)
        .set({
          paystackSubscriptionId: paystackSubscription.subscription_code,
          paystackCustomerCode: customer.customer_code,
        })
        .where(eq(recurringDonations.id, subscription.id));

      return {
        subscription,
      };
    } else {
      // Start with a first charge to capture Paystack authorization_code for recurring billing
      const pendingDonation = await db.insert(donations).values({
        campaignId: data.campaignId,
        donorId: data.donorId,
        chainerId: data.chainerId,
        amount: data.amount.toString(),
        currency: data.currency,
        paymentMethod: 'paystack',
        paymentStatus: 'pending',
        message: data.message,
        isAnonymous: data.isAnonymous || false,
      }).returning();

      const pendingDonationId = pendingDonation[0].id;

      const billingPeriodStart = new Date();
      const billingPeriodEnd = calculateNextBillingDate(
        normalizedPeriod,
        billingPeriodStart
      );

      await db.insert(recurringDonationPayments).values({
        recurringDonationId: subscription.id,
        donationId: pendingDonationId,
        amount: data.amount.toString(),
        currency: data.currency,
        paymentStatus: 'pending',
        billingPeriodStart: billingPeriodStart.toISOString().split('T')[0],
        billingPeriodEnd: billingPeriodEnd.toISOString().split('T')[0],
        scheduledDate: billingPeriodStart.toISOString().split('T')[0],
      });

      const callbackUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/paystack/callback`
        : undefined;

      const paystackInit = await initializePaystackPayment(
        data.donorEmail,
        data.amount,
        data.currency,
        {
          donationId: pendingDonationId,
          recurringDonationId: subscription.id,
          recurringSetup: true,
          campaignId: data.campaignId,
        },
        callbackUrl
      );

      await db
        .update(donations)
        .set({ paymentIntentId: paystackInit.data.reference })
        .where(eq(donations.id, pendingDonationId));

      await db
        .update(recurringDonationPayments)
        .set({ paystackTransactionId: paystackInit.data.reference })
        .where(
          and(
            eq(recurringDonationPayments.recurringDonationId, subscription.id),
            eq(recurringDonationPayments.donationId, pendingDonationId)
          )
        );

      return {
        subscription,
        authorizationUrl: paystackInit.data.authorization_url,
      };
    }
  }

  throw new Error('Unsupported payment method');
}

/**
 * Process a recurring donation payment
 */
export async function processRecurringDonationPayment(
  recurringDonationId: string
): Promise<{ success: boolean; donationId?: string; error?: string }> {
  const subscription = await db.query.recurringDonations.findFirst({
    where: eq(recurringDonations.id, recurringDonationId),
  });

  if (!subscription) {
    return { success: false, error: 'Subscription not found' };
  }

  if (!subscription.isActive || subscription.status !== 'active') {
    return { success: false, error: 'Subscription is not active' };
  }

  // Create donation record for this payment
  const donation = await db.insert(donations).values({
    campaignId: subscription.campaignId,
    donorId: subscription.donorId,
    chainerId: subscription.chainerId,
    amount: subscription.amount,
    currency: subscription.currency,
    paymentMethod: subscription.paymentMethod,
    paymentStatus: 'pending',
    message: subscription.message,
    isAnonymous: subscription.isAnonymous,
  }).returning();

  const donationId = donation[0].id;

  // Create recurring donation payment record
  const billingPeriodStart = subscription.lastBillingDate 
    ? new Date(subscription.lastBillingDate)
    : new Date();
  const billingPeriodEnd = calculateNextBillingDate(
    subscription.period as SubscriptionPeriod,
    billingPeriodStart
  );

  await db.insert(recurringDonationPayments).values({
    recurringDonationId: subscription.id,
    donationId: donationId,
    amount: subscription.amount,
    currency: subscription.currency,
    paymentStatus: 'pending',
    billingPeriodStart: billingPeriodStart.toISOString().split('T')[0],
    billingPeriodEnd: billingPeriodEnd.toISOString().split('T')[0],
    scheduledDate: new Date().toISOString().split('T')[0],
  });

  // The actual payment will be processed by the payment provider
  // (Stripe subscription invoice or Paystack subscription charge)
  // This will be handled via webhooks

  return { success: true, donationId };
}

/**
 * Update subscription after successful payment
 */
export async function updateSubscriptionAfterPayment(
  recurringDonationId: string,
  donationId: string,
  success: boolean
): Promise<void> {
  const subscription = await db.query.recurringDonations.findFirst({
    where: eq(recurringDonations.id, recurringDonationId),
  });

  if (!subscription) return;

  if (success) {
    // Update subscription stats
    const nextBillingDate = calculateNextBillingDate(
      subscription.period as SubscriptionPeriod,
      new Date()
    );

    await db
      .update(recurringDonations)
      .set({
        lastBillingDate: new Date().toISOString().split('T')[0],
        nextBillingDate: nextBillingDate.toISOString().split('T')[0],
        totalDonations: subscription.totalDonations + 1,
        totalAmount: (parseFloat(subscription.totalAmount.toString()) + parseFloat(subscription.amount.toString())).toString(),
        failedAttempts: 0,
        lastFailureReason: null,
      })
      .where(eq(recurringDonations.id, recurringDonationId));

    // Update recurring donation payment record
    await db
      .update(recurringDonationPayments)
      .set({
        paymentStatus: 'completed',
        processedAt: new Date(),
      })
      .where(and(
        eq(recurringDonationPayments.recurringDonationId, recurringDonationId),
        eq(recurringDonationPayments.donationId, donationId)
      ));
  } else {
    // Increment failed attempts
    await db
      .update(recurringDonations)
      .set({
        failedAttempts: subscription.failedAttempts + 1,
      })
      .where(eq(recurringDonations.id, recurringDonationId));
  }
}
