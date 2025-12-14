import { NextRequest, NextResponse } from 'next/server';
import { closeEligibleCampaigns, getCampaignClosureStats } from '@/lib/utils/campaign-closure';
import { getCronDisabledResponse } from '@/lib/utils/cron-control';
import { requireCronAuth } from '@/lib/utils/cron-auth';

async function runCloseCampaigns(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('close-campaigns');
  if (disabledResponse) {
    return disabledResponse;
  }

  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const startTime = Date.now();
    const result = await closeEligibleCampaigns();
    const endTime = Date.now();
    
    const stats = await getCampaignClosureStats();
    
    return NextResponse.json({
      success: true,
      message: 'Campaign closure job completed',
      data: {
        executionTime: endTime - startTime,
        closed: result.closed,
        errors: result.errors,
        stats,
        summary: {
          totalClosed: result.closed.length,
          totalErrors: result.errors.length,
          goalReached: result.closed.filter(r => r.reason === 'goal_reached').length,
          expired: result.closed.filter(r => r.reason === 'expired').length
        }
      }
    });

  } catch (error) {
    console.error('[cron] close-campaigns failed', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Campaign closure job failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/close-campaigns - Get information about the campaign closure job
 */
export async function GET(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('close-campaigns');
  if (disabledResponse) {
    return disabledResponse;
  }

  const authError = requireCronAuth(request);
  if (authError) return authError;

  const info = request.nextUrl.searchParams.get('info');
  if (info === '1' || info === 'true') {
    try {
      const stats = await getCampaignClosureStats();
      return NextResponse.json({
        success: true,
        message: 'Campaign closure job information',
        data: {
          stats,
          description: 'This endpoint automatically closes campaigns that have reached their goal or expired',
          schedule: 'Vercel Cron runs this via GET',
          lastRun: 'Not tracked - implement logging if needed',
        },
      });
    } catch (error) {
      console.error('[cron] close-campaigns info failed', error);
      return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
  }

  // Default behavior: execute the job (Vercel Cron calls GET)
  return runCloseCampaigns(request);
}

export async function POST(request: NextRequest) {
  return runCloseCampaigns(request);
}
