import { NextRequest, NextResponse } from 'next/server';

/**
 * Vercel Cron triggers are GET requests and include `x-vercel-cron: 1`.
 * In production we authorize cron execution if either:
 * - The request is coming from Vercel Cron (`x-vercel-cron: 1`), OR
 * - Authorization header matches `Bearer ${CRON_SECRET}`, OR
 * - A Netlify scheduled-functions signature header is present.
 *
 * In non-production environments, we allow execution to make local/testing easier.
 */
export function requireCronAuth(request: NextRequest) {
  const vercelEnv = process.env.VERCEL_ENV;
  const isProd = vercelEnv ? vercelEnv === 'production' : process.env.NODE_ENV === 'production';

  // Allow in dev/preview unless you explicitly want to lock it down.
  if (!isProd) return null;

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') ?? '';
  const isAuthorizedBySecret = Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;

  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const isNetlifyCron = Boolean(request.headers.get('x-netlify-signature'));

  if (isAuthorizedBySecret || isVercelCron || isNetlifyCron) {
    return null;
  }

  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}


