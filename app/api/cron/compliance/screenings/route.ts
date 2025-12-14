import { NextRequest, NextResponse } from 'next/server';
import { processPendingScreenings } from '@/lib/compliance/screening-service';
import { getCronDisabledResponse } from '@/lib/utils/cron-control';
import { requireCronAuth } from '@/lib/utils/cron-auth';

export async function POST(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('compliance-screenings');
  if (disabledResponse) {
    return disabledResponse;
  }

  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const payload = await request.json().catch(() => ({}));
    const limit = Number(payload?.limit ?? 5);

    const result = await processPendingScreenings(limit);

    return NextResponse.json({
      success: true,
      processed: result.completed,
      failed: result.failed,
      claimed: result.claimed,
      results: result.results,
    });
  } catch (error) {
    console.error('[cron] compliance screening failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process compliance screenings',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('compliance-screenings');
  if (disabledResponse) {
    return disabledResponse;
  }

  const authError = requireCronAuth(request);
  if (authError) return authError;

  const health = request.nextUrl.searchParams.get('health');
  if (health === '1' || health === 'true') {
    return NextResponse.json({
      success: true,
      message: 'Compliance screening cron alive',
      note: 'Call without ?health=1 to process queued screenings',
    });
  }

  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Number(limitParam ?? 5);

  try {
    const result = await processPendingScreenings(limit);
    return NextResponse.json({
      success: true,
      processed: result.completed,
      failed: result.failed,
      claimed: result.claimed,
      results: result.results,
    });
  } catch (error) {
    console.error('[cron] compliance screening failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process compliance screenings',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

