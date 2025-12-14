import { NextRequest, NextResponse } from 'next/server';
import { retryFailedPayouts } from '@/lib/payments/payout-retry';
import { processAutomatedCharityPayouts } from '@/lib/payments/automated-charity-payouts';
import { getCronDisabledResponse } from '@/lib/utils/cron-control';
import { requireCronAuth } from '@/lib/utils/cron-auth';

export const runtime = 'nodejs';

/**
 * GET/POST /api/cron/payouts
 * Vercel Cron calls GET. We keep POST for manual/external schedulers.
 */
async function runPayoutCron(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('payouts');
  if (disabledResponse) return disabledResponse;

  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const results = {
      retry: null as any,
      charityPayouts: null as any,
    };

    // 1. Retry failed payouts
    try {
      results.retry = await retryFailedPayouts({
        maxRetries: 3,
        retryDelayMinutes: 60,
      });
    } catch (error) {
      console.error('[cron] payouts: retryFailedPayouts failed', error);
      results.retry = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error: ' + error,
      };
    }

    // 2. Process automated charity payouts (create, don't auto-process)
    try {
      results.charityPayouts = await processAutomatedCharityPayouts(100, false);
    } catch (error) {
      console.error('[cron] payouts: processAutomatedCharityPayouts failed', error);
      results.charityPayouts = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error: ' + error,
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('[cron] payouts endpoint failed', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error: ' + error,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return runPayoutCron(request);
}

/**
 * GET /api/cron/payouts
 * Executes payout cron by default (Vercel Cron calls GET).
 * Use `?health=1` for a lightweight health response.
 */
export async function GET(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('payouts');
  if (disabledResponse) return disabledResponse;

  const authError = requireCronAuth(request);
  if (authError) return authError;

  const health = request.nextUrl.searchParams.get('health');
  if (health === '1' || health === 'true') {
    return NextResponse.json({
      status: 'ok',
      service: 'payout-cron',
      timestamp: new Date().toISOString(),
    });
  }

  return runPayoutCron(request);
}

