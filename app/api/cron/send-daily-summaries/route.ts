import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/schema/user-preferences';
import { adminSettings } from '@/lib/schema/admin-settings';
import { users } from '@/lib/schema';
import { or, eq, and } from 'drizzle-orm';
import { sendUserDailySummary, sendAdminDailySummary } from '@/lib/notifications/summary-reports';
import { getCronDisabledResponse } from '@/lib/utils/cron-control';

export const runtime = 'nodejs';

/**
 * POST /api/cron/send-daily-summaries
 * Cron job to send daily summary emails to users and admins
 * Should be scheduled to run daily (e.g., at 9:00 AM based on user preferences)
 * 
 * Setup Options:
 * - Netlify Scheduled Functions: Configured in netlify.toml (requires Pro plan)
 * - External Cron Service: Use EasyCron, Cron-job.org, etc.
 * - Schedule: "0 9 * * *" (Every day at 9:00 AM UTC)
 */
export async function POST(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('send-daily-summaries');
  if (disabledResponse) {
    return disabledResponse;
  }

  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const vercelSignature = request.headers.get('x-vercel-signature');
    const netlifySignature = request.headers.get('x-netlify-signature');
    const cronSecret = process.env.CRON_SECRET;
    const isDevelopment = process.env.NODE_ENV !== 'production';

    // In production, require authentication
    // In development, allow without auth for easier testing
    if (!isDevelopment && cronSecret) {
      // Allow if:
      // 1. Authorization header matches CRON_SECRET, OR
      // 2. Vercel signature is present (Vercel Cron), OR
      // 3. Netlify signature is present (Netlify Scheduled Functions)
      if (authHeader !== `Bearer ${cronSecret}` && !vercelSignature && !netlifySignature) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const results = {
      users: { sent: 0, failed: 0, skipped: 0 },
      admins: { sent: 0, failed: 0, skipped: 0 },
      errors: [] as string[],
    };

    // Get all users with daily summary enabled
    const userPreferencesList = await db.query.userPreferences.findMany({
      where: and(
        eq(userPreferences.dailySummaryEnabled, true),
        eq(userPreferences.emailNotificationsEnabled, true)
      ),
    });

    // Send daily summaries to users
    for (const prefs of userPreferencesList) {
      try {
        const result = await sendUserDailySummary(prefs.userId);
        if (result.sent) {
          results.users.sent++;
        } else {
          results.users.skipped++;
          if (result.reason) {
            results.errors.push(`User ${prefs.userId}: ${result.reason}`);
          }
        }
      } catch (error) {
        results.users.failed++;
        results.errors.push(`User ${prefs.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Get all admins with daily summary enabled
    const adminSettingsList = await db.query.adminSettings.findMany({
      where: and(
        eq(adminSettings.dailySummaryEnabled, true),
        eq(adminSettings.emailNotificationsEnabled, true)
      ),
    });

    // Get admin users
    const adminUsers = await db.query.users.findMany({
      where: or(
        eq(users.role, 'admin'),
        eq(users.role, 'super_admin')
      ),
    });

    // Send daily summaries to admins
    for (const settings of adminSettingsList) {
      try {
        // Verify this admin user exists
        const adminUser = adminUsers.find(u => u.id === settings.userId);
        if (!adminUser) {
          results.admins.skipped++;
          continue;
        }

        const result = await sendAdminDailySummary(settings.userId);
        if (result.sent) {
          results.admins.sent++;
        } else {
          results.admins.skipped++;
          if (result.reason) {
            results.errors.push(`Admin ${settings.userId}: ${result.reason}`);
          }
        }
      } catch (error) {
        results.admins.failed++;
        results.errors.push(`Admin ${settings.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Daily summaries processed',
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error in daily summaries cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process daily summaries',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/send-daily-summaries
 * Allow manual triggering for testing (only in development)
 */
export async function GET(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('send-daily-summaries');
  if (disabledResponse) {
    return disabledResponse;
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  // Call POST handler (authentication is skipped in development)
  return POST(request);
}

