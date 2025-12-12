import { pgTable, uuid, varchar, timestamp, decimal, text, boolean, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Recurring donation subscriptions table
 * Tracks active subscriptions for recurring donations
 */
export const recurringDonations = pgTable('recurring_donations', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull(),
  donorId: uuid('donor_id').notNull(),
  chainerId: uuid('chainer_id'), // nullable - only if referred by chainer
  
  // Subscription details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(), // USD, GBP, NGN
  period: varchar('period', { length: 20 }).notNull(), // monthly, quarterly, yearly
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // stripe, paystack
  
  // Provider subscription IDs
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  paystackSubscriptionId: varchar('paystack_subscription_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  paystackCustomerCode: varchar('paystack_customer_code', { length: 255 }),
  
  // Subscription status
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, paused, cancelled, expired
  isActive: boolean('is_active').default(true).notNull(),
  
  // Billing details
  nextBillingDate: date('next_billing_date').notNull(),
  lastBillingDate: date('last_billing_date'),
  billingDay: integer('billing_day'), // Day of month (1-31) for monthly, day of quarter for quarterly, etc.
  
  // Donor preferences
  message: text('message'), // optional donor message
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  
  // Statistics
  totalDonations: integer('total_donations').default(0).notNull(), // Number of successful donations
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).default('0').notNull(), // Total amount donated
  failedAttempts: integer('failed_attempts').default(0).notNull(),
  lastFailureReason: text('last_failure_reason'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  cancelledAt: timestamp('cancelled_at'),
  pausedAt: timestamp('paused_at'),
});

/**
 * Individual donation records from recurring subscriptions
 * Links each payment in a subscription to a donation record
 */
export const recurringDonationPayments = pgTable('recurring_donation_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  recurringDonationId: uuid('recurring_donation_id').notNull(),
  donationId: uuid('donation_id').notNull(), // Reference to the donations table
  
  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending').notNull(), // pending, completed, failed
  
  // Provider payment IDs
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  paystackTransactionId: varchar('paystack_transaction_id', { length: 255 }),
  
  // Billing period
  billingPeriodStart: date('billing_period_start').notNull(),
  billingPeriodEnd: date('billing_period_end').notNull(),
  
  // Timestamps
  scheduledDate: date('scheduled_date').notNull(), // When this payment was scheduled
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type RecurringDonation = typeof recurringDonations.$inferSelect;
export type NewRecurringDonation = typeof recurringDonations.$inferInsert;
export type RecurringDonationPayment = typeof recurringDonationPayments.$inferSelect;
export type NewRecurringDonationPayment = typeof recurringDonationPayments.$inferInsert;

