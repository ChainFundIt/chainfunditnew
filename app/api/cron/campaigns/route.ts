import { NextRequest, NextResponse } from 'next/server';
import { autoCloseExpiredCampaigns, markExpiredCampaigns } from '@/lib/utils/campaign-validation';
import { getCronDisabledResponse } from '@/lib/utils/cron-control';
import { requireCronAuth } from '@/lib/utils/cron-auth';

/**
 * Cron job endpoint to handle campaign auto-closing and expiration
 * This should be called periodically (e.g., daily) to:
 * 1. Auto-close campaigns that reached goal 4 weeks ago
 * 2. Mark campaigns as expired if they passed their expiration date
 */
async function runCampaignCron(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('campaigns');
  if (disabledResponse) {
    return disabledResponse;
  }

  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const startTime = Date.now();

    // Auto-close campaigns that reached goal 4 weeks ago
    const autoClosedCount = await autoCloseExpiredCampaigns();

    // Mark expired campaigns
    const expiredCount = await markExpiredCampaigns();

    const endTime = Date.now();
    const duration = endTime - startTime;

    return NextResponse.json({
      success: true,
      data: {
        autoClosedCount,
        expiredCount,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[cron] campaigns failed', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process campaign auto-close: ' + error,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return runCampaignCron(request);
}

// Vercel Cron calls GET
export async function GET(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('campaigns');
  if (disabledResponse) {
    return disabledResponse;
  }

  return runCampaignCron(request);
}
