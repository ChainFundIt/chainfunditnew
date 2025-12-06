import Stripe from 'stripe';
import { stripe } from './stripe';

export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'yearly';

/**
 * Convert period to Stripe interval
 */
function getStripeInterval(period: SubscriptionPeriod): Stripe.Price.Recurring.Interval {
  switch (period) {
    case 'monthly':
      return 'month';
    case 'quarterly':
      return 'month'; // 3 months
    case 'yearly':
      return 'year';
    default:
      return 'month';
  }
}

/**
 * Get interval count for period
 */
function getIntervalCount(period: SubscriptionPeriod): number {
  switch (period) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 3;
    case 'yearly':
      return 1;
    default:
      return 1;
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrRetrieveStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    // First, try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return customer;
  } catch (error) {
    console.error('Error creating/retrieving Stripe customer:', error);
    throw error;
  }
}

/**
 * Create a Stripe subscription for recurring donations
 */
export async function createStripeSubscription(
  customerId: string,
  amount: number,
  currency: string,
  period: SubscriptionPeriod,
  metadata: Record<string, string>
): Promise<Stripe.Subscription> {
  try {
    // Create a price for the subscription
    const price = await stripe.prices.create({
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      recurring: {
        interval: getStripeInterval(period),
        interval_count: getIntervalCount(period),
      },
      metadata,
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw error;
  }
}

/**
 * Get Stripe subscription details
 */
export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice.payment_intent'],
    });
    return subscription;
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error);
    throw error;
  }
}

/**
 * Cancel a Stripe subscription
 */
export async function cancelStripeSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  try {
    if (immediately) {
      // Cancel immediately
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancel at period end
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  } catch (error) {
    console.error('Error canceling Stripe subscription:', error);
    throw error;
  }
}

/**
 * Pause a Stripe subscription
 */
export async function pauseStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    // Stripe doesn't have a direct pause, so we cancel at period end
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } catch (error) {
    console.error('Error pausing Stripe subscription:', error);
    throw error;
  }
}

/**
 * Resume a paused Stripe subscription
 */
export async function resumeStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (error) {
    console.error('Error resuming Stripe subscription:', error);
    throw error;
  }
}

/**
 * Update subscription amount
 */
export async function updateStripeSubscriptionAmount(
  subscriptionId: string,
  newAmount: number,
  currency: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;

    if (!priceId) {
      throw new Error('No price found in subscription');
    }

    // Create new price
    const existingRecurring = subscription.items.data[0].price.recurring;
    const newPrice = await stripe.prices.create({
      unit_amount: Math.round(newAmount * 100),
      currency: currency.toLowerCase(),
      recurring: existingRecurring ? {
        interval: existingRecurring.interval,
        interval_count: existingRecurring.interval_count || undefined,
        trial_period_days: existingRecurring.trial_period_days || undefined,
        usage_type: existingRecurring.usage_type || undefined,
      } : undefined,
      metadata: subscription.items.data[0].price.metadata,
    });

    // Update subscription with new price
    return await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPrice.id,
      }],
      proration_behavior: 'create_prorations',
    });
  } catch (error) {
    console.error('Error updating Stripe subscription amount:', error);
    throw error;
  }
}

