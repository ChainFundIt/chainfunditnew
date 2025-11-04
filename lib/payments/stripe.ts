import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

/**
 * Create a payment intent for Stripe payments
 */
export async function createStripePaymentIntent(
  amount: number,
  currency: string,
  metadata: Record<string, string>
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    throw error;
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmStripePayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error confirming Stripe payment:', error);
    throw error;
  }
}

/**
 * Retrieve a payment intent
 */
export async function getStripePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving Stripe payment intent:', error);
    throw error;
  }
}

/**
 * Create a refund for a payment
 */
export async function createStripeRefund(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return refund;
  } catch (error) {
    console.error('Error creating Stripe refund:', error);
    throw error;
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('Error verifying Stripe webhook:', error);
    throw error;
  }
}

/**
 * Create a Stripe Connect account for payouts
 */
export async function createStripeConnectAccount(
  email: string,
  country: string = 'US',
  type: 'express' | 'standard' = 'express'
) {
  try {
    const account = await stripe.accounts.create({
      type,
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    throw error;
  }
}

/**
 * Create account link for Stripe Connect onboarding
 */
export async function createStripeAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating Stripe account link:', error);
    throw error;
  }
}

/**
 * Create a payout to a Stripe Connect account
 */
export async function createStripePayout(
  amount: number,
  currency: string,
  destinationAccountId: string,
  description: string,
  metadata?: Record<string, string>
) {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      destination: destinationAccountId,
      description,
      metadata,
    });

    return transfer;
  } catch (error) {
    console.error('Error creating Stripe payout:', error);
    throw error;
  }
}

/**
 * Get Stripe Connect account details
 */
export async function getStripeConnectAccount(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch (error) {
    console.error('Error retrieving Stripe Connect account:', error);
    throw error;
  }
}

/**
 * Check if Stripe Connect account is ready for payouts
 */
export async function isStripeAccountReadyForPayouts(accountId: string): Promise<boolean> {
  try {
    const account = await getStripeConnectAccount(accountId);
    
    return (
      account.charges_enabled &&
      account.payouts_enabled &&
      account.details_submitted &&
      !account.requirements?.disabled_reason
    );
  } catch (error) {
    console.error('Error checking Stripe account readiness:', error);
    return false;
  }
}
