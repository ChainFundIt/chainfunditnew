import { addMonths, addYears, addDays, startOfDay, isBefore, isAfter } from 'date-fns';
import type { SubscriptionPeriod } from '@/lib/payments/stripe-subscriptions';

/**
 * Calculate next billing date based on period
 */
export function calculateNextBillingDate(
  period: SubscriptionPeriod,
  startDate: Date = new Date()
): Date {
  const today = startOfDay(startDate);
  
  switch (period) {
    case 'monthly':
      return startOfDay(addMonths(today, 1));
    case 'quarterly':
      return startOfDay(addMonths(today, 3));
    case 'yearly':
      return startOfDay(addYears(today, 1));
    default:
      return startOfDay(addMonths(today, 1));
  }
}

/**
 * Calculate billing period end date
 */
export function calculateBillingPeriodEnd(
  period: SubscriptionPeriod,
  startDate: Date
): Date {
  return calculateNextBillingDate(period, startDate);
}

/**
 * Get billing day of month (1-31)
 */
export function getBillingDay(date: Date = new Date()): number {
  return date.getDate();
}

/**
 * Check if a subscription is due for billing
 */
export function isSubscriptionDueForBilling(
  nextBillingDate: Date,
  currentDate: Date = new Date()
): boolean {
  const billingDate = startOfDay(nextBillingDate);
  const today = startOfDay(currentDate);
  
  // Due if today is the billing date or past it
  return !isAfter(billingDate, today);
}

/**
 * Get period display name
 */
export function getPeriodDisplayName(period: SubscriptionPeriod): string {
  switch (period) {
    case 'monthly':
      return 'Monthly';
    case 'quarterly':
      return 'Quarterly';
    case 'yearly':
      return 'Yearly';
    default:
      return 'Monthly';
  }
}

/**
 * Get period description
 */
export function getPeriodDescription(period: SubscriptionPeriod): string {
  switch (period) {
    case 'monthly':
      return 'Every month';
    case 'quarterly':
      return 'Every 3 months';
    case 'yearly':
      return 'Every year';
    default:
      return 'Every month';
  }
}

/**
 * Normalize period string (handles variations like "one-time", "monthly", etc.)
 */
export function normalizePeriod(period: string): SubscriptionPeriod | 'one-time' {
  const normalized = period.toLowerCase().trim();
  
  if (normalized === 'one-time' || normalized === 'onetime') {
    return 'one-time';
  }
  
  if (normalized === 'monthly' || normalized === 'month') {
    return 'monthly';
  }
  
  if (normalized === 'quarterly' || normalized === 'quarter') {
    return 'quarterly';
  }
  
  if (normalized === 'yearly' || normalized === 'year' || normalized === 'annually') {
    return 'yearly';
  }
  
  // Default to monthly if unrecognized
  return 'monthly';
}

/**
 * Check if period is recurring
 */
export function isRecurringPeriod(period: string): boolean {
  const normalized = normalizePeriod(period);
  return normalized !== 'one-time';
}

