import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recurringDonations } from '@/lib/schema/recurring-donations';
import { eq, and } from 'drizzle-orm';
import { isSubscriptionDueForBilling } from '@/lib/utils/recurring-donations';
import { processRecurringDonationPayment } from '@/lib/services/subscription-service';

export const runtime = 'nodejs';

/**
 * POST /api/cron/process-recurring-donations
 * Cron job to process recurring donations that are due for billing
 * Should be scheduled to run daily (e.g., at 2:00 AM UTC)
 * 
 * Setup Options:
 * - GitHub Actions: Add to cron workflow
 * - External Cron Service: Schedule daily
 * - Schedule: "0 2 * * *" (Every day at 2:00 AM UTC)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const vercelSignature = request.headers.get('x-vercel-signature');
    const netlifySignature = request.headers.get('x-netlify-signature');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}` && !vercelSignature && !netlifySignature) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Get all active recurring donations
    const activeSubscriptions = await db
      .select()
      .from(recurringDonations)
      .where(
        and(
          eq(recurringDonations.isActive, true),
          eq(recurringDonations.status, 'active')
        )
      );

    const today = new Date();

    // Process each subscription that's due for billing
    for (const subscription of activeSubscriptions) {
      try {
        if (!subscription.nextBillingDate) {
          results.skipped++;
          continue;
        }

        const nextBillingDate = new Date(subscription.nextBillingDate);

        // Check if subscription is due for billing
        if (isSubscriptionDueForBilling(nextBillingDate, today)) {
          // Process the recurring donation payment
          // Note: The actual payment will be processed by the payment provider
          // (Stripe subscription invoice or Paystack subscription charge)
          // This creates the donation record and payment tracking
          const result = await processRecurringDonationPayment(subscription.id);

          if (result.success) {
            results.processed++;
          } else {
            results.failed++;
            results.errors.push(`Subscription ${subscription.id}: ${result.error}`);
          }
        } else {
          results.skipped++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Subscription ${subscription.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Recurring donations processed',
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error processing recurring donations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process recurring donations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/process-recurring-donations
 * Allow manual triggering for testing (only in development)
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  // Call POST handler
  return POST(request);
}

