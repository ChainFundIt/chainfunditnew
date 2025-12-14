import { NextResponse } from 'next/server';

/**
 * Returns a 503 response if cron jobs are disabled via env flag.
 *
 * Behavior:
 * - **Production**: enabled by default; set `CRON_JOBS_ENABLED=false` to disable.
 * - **Non-production (dev/preview)**: disabled by default; set `CRON_JOBS_ENABLED=true` to enable.
 */
export function getCronDisabledResponse(cronName: string) {
  const vercelEnv = process.env.VERCEL_ENV;
  const isProd = vercelEnv ? vercelEnv === 'production' : process.env.NODE_ENV === 'production';

  const flag = (process.env.CRON_JOBS_ENABLED ?? '').toLowerCase();
  const envInfo = {
    VERCEL_ENV: vercelEnv ?? null,
    NODE_ENV: process.env.NODE_ENV ?? null,
    CRON_JOBS_ENABLED: process.env.CRON_JOBS_ENABLED ?? null,
  };

  if (isProd) {
    if (flag === 'false') {
      return NextResponse.json(
        {
          success: false,
          status: 'disabled',
          error: `Cron job ${cronName} is disabled (CRON_JOBS_ENABLED=false)`,
          env: envInfo,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
    return null;
  }

  // Non-production: disabled unless explicitly enabled.
  if (flag === 'true') return null;

  return NextResponse.json(
    {
      success: false,
      status: 'disabled',
      error: `Cron job ${cronName} is temporarily disabled`,
      env: envInfo,
      timestamp: new Date().toISOString(),
    },
    { status: 503 }
  );
}


