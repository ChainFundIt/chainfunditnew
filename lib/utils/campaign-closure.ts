import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema/campaigns';
import { notifications } from '@/lib/schema/notifications';
import { eq, and, lt, gte, isNotNull, count } from 'drizzle-orm';

export interface CampaignClosureResult {
  campaignId: string;
  reason: 'goal_reached' | 'expired' | 'manual';
  closedAt: Date;
  success: boolean;
  error?: string;
}

export function parseDurationToEndDate(duration: string, createdAt: Date): Date | null {
  if (!duration || duration === 'Not applicable') {
    return null;
  }

  const endDate = new Date(createdAt);

  switch (duration) {
    case '1 week':
      endDate.setDate(endDate.getDate() + 7);
      break;
    case '2 weeks':
      endDate.setDate(endDate.getDate() + 14);
      break;
    case '1 month':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case '1 year':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return endDate;
}

export function shouldCloseForGoalReached(currentAmount: number, goalAmount: number): boolean {
  return currentAmount >= goalAmount;
}

export function shouldCloseForExpiration(duration: string, createdAt: Date): boolean {
  const endDate = parseDurationToEndDate(duration, createdAt);
  if (!endDate) return false;

  return new Date() > endDate;
}

export async function closeCampaign(
  campaignId: string,
  reason: 'goal_reached' | 'expired' | 'manual',
  userId?: string
): Promise<CampaignClosureResult> {
  try {
    const now = new Date();

    const updateResult = await db
      .update(campaigns)
      .set({
        status: 'closed',
        isActive: false,
        closedAt: now,
        updatedAt: now,
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    if (!updateResult.length) {
      return {
        campaignId,
        reason,
        closedAt: now,
        success: false,
        error: 'Campaign not found or already closed'
      };
    }

    const campaign = updateResult[0];

    if (userId) {
      await db.insert(notifications).values({
        userId,
        type: 'campaign_closed',
        title: reason === 'goal_reached' ? 'Campaign Goal Reached!' : 'Campaign Closed',
        message: reason === 'goal_reached'
          ? `Congratulations! Your campaign "${campaign.title}" has reached its goal of ${campaign.currency} ${campaign.goalAmount}.`
          : `Your campaign "${campaign.title}" has been closed.`,
        metadata: JSON.stringify({
          campaignId,
          reason,
          closedAt: now.toISOString(),
          goalAmount: campaign.goalAmount,
          currentAmount: campaign.currentAmount,
          currency: campaign.currency
        })
      });
    }

    return {
      campaignId,
      reason,
      closedAt: now,
      success: true
    };

  } catch (error) {
    console.error(`❌ Error closing campaign ${campaignId}:`, error);
    return {
      campaignId,
      reason,
      closedAt: new Date(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getCampaignsToClose(): Promise<{
  goalReached: Array<{ id: string; creatorId: string; title: string; currentAmount: string; goalAmount: string; currency: string }>;
  expired: Array<{ id: string; creatorId: string; title: string; currency: string; goalAmount: string; currentAmount: string }>;
}> {
  try {
    const goalReachedCampaigns = await db
      .select({
        id: campaigns.id,
        creatorId: campaigns.creatorId,
        title: campaigns.title,
        currentAmount: campaigns.currentAmount,
        goalAmount: campaigns.goalAmount,
        currency: campaigns.currency,
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.status, 'active'),
          eq(campaigns.isActive, true),
          gte(campaigns.currentAmount, campaigns.goalAmount)
        )
      );

    const now = new Date();
    const expiredCampaigns = await db
      .select({
        id: campaigns.id,
        creatorId: campaigns.creatorId,
        title: campaigns.title,
        currency: campaigns.currency,
        goalAmount: campaigns.goalAmount,
        currentAmount: campaigns.currentAmount,
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.status, 'active'),
          eq(campaigns.isActive, true),
          isNotNull(campaigns.expiresAt),
          lt(campaigns.expiresAt, now)
        )
      );

    return {
      goalReached: goalReachedCampaigns,
      expired: expiredCampaigns
    };

  } catch (error) {
    console.error('❌ Error getting campaigns to close:', error);
    return {
      goalReached: [],
      expired: []
    };
  }
}

export async function closeEligibleCampaigns(): Promise<{
  closed: CampaignClosureResult[];
  errors: CampaignClosureResult[];
}> {
  try {
    const { goalReached, expired } = await getCampaignsToClose();

    const results: CampaignClosureResult[] = [];
    const errors: CampaignClosureResult[] = [];

    for (const campaign of goalReached) {
      const result = await closeCampaign(campaign.id, 'goal_reached', campaign.creatorId);
      if (result.success) {
        results.push(result);
      } else {
        errors.push(result);
      }
    }

    for (const campaign of expired) {
      const result = await closeCampaign(campaign.id, 'expired', campaign.creatorId);
      if (result.success) {
        results.push(result);
      } else {
        errors.push(result);
      }
    }

    return { closed: results, errors };

  } catch (error) {
    console.error('❌ Error closing eligible campaigns:', error);
    return { closed: [], errors: [] };
  }
}

export async function getCampaignClosureStats(): Promise<{
  totalActive: number;
  goalReached: number;
  expired: number;
  totalClosed: number;
}> {
  try {
    const now = new Date();

    const [totalActiveResult, goalReachedResult, expiredResult, totalClosedResult] = await Promise.all([
      db
        .select({ count: count() })
        .from(campaigns)
        .where(
          and(
            eq(campaigns.status, 'active'),
            eq(campaigns.isActive, true)
          )
        ),
      db
        .select({ count: count() })
        .from(campaigns)
        .where(
          and(
            eq(campaigns.status, 'active'),
            eq(campaigns.isActive, true),
            gte(campaigns.currentAmount, campaigns.goalAmount)
          )
        ),
      db
        .select({ count: count() })
        .from(campaigns)
        .where(
          and(
            eq(campaigns.status, 'active'),
            eq(campaigns.isActive, true),
            isNotNull(campaigns.expiresAt),
            lt(campaigns.expiresAt, now)
          )
        ),
      db
        .select({ count: count() })
        .from(campaigns)
        .where(eq(campaigns.status, 'closed')),
    ]);

    return {
      totalActive: totalActiveResult[0]?.count ?? 0,
      goalReached: goalReachedResult[0]?.count ?? 0,
      expired: expiredResult[0]?.count ?? 0,
      totalClosed: totalClosedResult[0]?.count ?? 0,
    };

  } catch (error) {
    console.error('❌ Error getting campaign closure stats:', error);
    return {
      totalActive: 0,
      goalReached: 0,
      expired: 0,
      totalClosed: 0
    };
  }
}
