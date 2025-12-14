import { NextRequest, NextResponse } from 'next/server';
import { processBatchPayouts } from '@/lib/payments/charity-payouts';
import { getCronDisabledResponse } from '@/lib/utils/cron-control';
import { requireCronAuth } from '@/lib/utils/cron-auth';

export const runtime = 'nodejs';

/**
 * GET /api/cron/process-charity-payouts
 * 
 * Automated cron job to process charity payouts
 * This should be called periodically (e.g., weekly) to process pending donations
 * 
 * Setup in Vercel:
 * 1. Go to Project Settings > Cron Jobs
 * 2. Add a new cron job with schedule: "0 0 * * *" (Everyday at midnight)
 * 3. URL: /api/cron/process-charity-payouts
 */
export async function GET(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('process-charity-payouts');
  if (disabledResponse) {
    return disabledResponse;
  }

  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    // Minimum payout amount (default: $100)
    const minAmount = parseFloat(process.env.MIN_CHARITY_PAYOUT_AMOUNT || '100');

    // Process batch payouts
    const results = await processBatchPayouts(minAmount);

    // Compile results
    const summary = {
      totalProcessed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalAmount: results.reduce((sum, r) => sum + r.amount, 0),
      totalDonations: results.reduce((sum, r) => sum + r.donationCount, 0),
      details: results.map(r => ({
        charityName: r.charityName,
        success: r.success,
        amount: r.amount,
        donationCount: r.donationCount,
        error: r.error,
        payoutId: r.payoutId,
      })),
    };

    return NextResponse.json({
      message: 'Charity payouts processed successfully',
      summary,
    });
  } catch (error) {
    console.error('[cron] process-charity-payouts failed', error);
    return NextResponse.json(
      { 
        error: 'Failed to process charity payouts: ' + error,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

