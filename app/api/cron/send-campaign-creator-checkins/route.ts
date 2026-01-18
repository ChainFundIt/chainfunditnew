import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, users, userPreferences } from '@/lib/schema';
import { campaignCreatorCheckins } from '@/lib/schema/campaign-creator-checkins';
import { and, eq, gte, inArray, lt } from 'drizzle-orm';
import { sendCampaignCreatorCheckinEmail } from '@/lib/notifications/campaign-creator-checkin-email';
import { getCronDisabledResponse } from '@/lib/utils/cron-control';
import { requireCronAuth } from '@/lib/utils/cron-auth';

export const runtime = 'nodejs';

const CHECKIN_DAYS = [2, 5, 7] as const;

function getUtcDayRange(daysAgo: number) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - daysAgo);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

async function runCampaignCreatorCheckins(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('send-campaign-creator-checkins');
  if (disabledResponse) {
    return disabledResponse;
  }

  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'https://chainfundit.com';

    for (const day of CHECKIN_DAYS) {
      const { start, end } = getUtcDayRange(day);

      const campaignRows = await db
        .select({
          campaignId: campaigns.id,
          campaignTitle: campaigns.title,
          campaignSlug: campaigns.slug,
          creatorId: campaigns.creatorId,
          creatorEmail: users.email,
          creatorName: users.fullName,
        })
        .from(campaigns)
        .innerJoin(users, eq(campaigns.creatorId, users.id))
        .where(
          and(
            gte(campaigns.createdAt, start),
            lt(campaigns.createdAt, end),
            eq(campaigns.isActive, true)
          )
        );

      if (campaignRows.length === 0) {
        continue;
      }

      const campaignIds = campaignRows.map((row) => row.campaignId);
      const creatorIds = campaignRows.map((row) => row.creatorId);

      const existingCheckins = await db.query.campaignCreatorCheckins.findMany({
        where: and(
          inArray(campaignCreatorCheckins.campaignId, campaignIds),
          eq(campaignCreatorCheckins.day, day)
        ),
      });
      const existingSet = new Set(
        existingCheckins.map((checkin) => checkin.campaignId)
      );

      const preferences = await db.query.userPreferences.findMany({
        where: inArray(userPreferences.userId, creatorIds),
      });
      const preferencesMap = new Map(
        preferences.map((prefs) => [prefs.userId, prefs])
      );

      for (const row of campaignRows) {
        if (existingSet.has(row.campaignId)) {
          results.skipped++;
          continue;
        }

        if (!row.creatorEmail) {
          results.skipped++;
          continue;
        }

        const prefs = preferencesMap.get(row.creatorId);
        const emailEnabled = prefs ? prefs.emailNotificationsEnabled : true;
        if (!emailEnabled) {
          results.skipped++;
          continue;
        }

        const campaignUrl = `${baseUrl}/campaign/${row.campaignSlug}`;
        const result = await sendCampaignCreatorCheckinEmail({
          userEmail: row.creatorEmail,
          userName: row.creatorName || row.creatorEmail.split('@')[0] || 'there',
          campaignTitle: row.campaignTitle,
          campaignUrl,
          day,
        });

        if (result.sent) {
          await db.insert(campaignCreatorCheckins).values({
            campaignId: row.campaignId,
            userId: row.creatorId,
            day,
          });
          results.sent++;
        } else {
          results.failed++;
          if (result.reason) {
            results.errors.push(
              `Campaign ${row.campaignId} day ${day}: ${result.reason}`
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign creator check-ins processed',
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error in campaign creator check-ins cron job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process campaign creator check-ins',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return runCampaignCreatorCheckins(request);
}

/**
 * GET /api/cron/send-campaign-creator-checkins
 * Vercel Cron calls GET.
 */
export async function GET(request: NextRequest) {
  const disabledResponse = getCronDisabledResponse('send-campaign-creator-checkins');
  if (disabledResponse) {
    return disabledResponse;
  }
  return runCampaignCreatorCheckins(request);
}

