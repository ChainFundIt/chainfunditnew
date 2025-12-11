import { NextResponse } from 'next/server';

/**
 * Returns a 503 response if cron jobs are disabled via env flag.
 * Set CRON_JOBS_ENABLED=true to re-enable cron endpoints.
 */
export function getCronDisabledResponse(cronName: string) {
  if (process.env.CRON_JOBS_ENABLED === 'true') {
    return null;
  }

  return NextResponse.json(
    {
      success: false,
      status: 'disabled',
      error: `Cron job ${cronName} is temporarily disabled`,
      timestamp: new Date().toISOString(),
    },
    { status: 503 }
  );
}


