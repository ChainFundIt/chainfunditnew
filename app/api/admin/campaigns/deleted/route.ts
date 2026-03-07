import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, users, donations, chainers } from '@/lib/schema';
import { eq, and, desc, count, isNotNull } from 'drizzle-orm';

/**
 * GET /api/admin/campaigns/deleted
 * List campaigns that have been moved to "Recently Deleted" (deletedAt set)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const campaignsList = await db
      .select({
        id: campaigns.id,
        slug: campaigns.slug,
        title: campaigns.title,
        description: campaigns.description,
        creatorId: campaigns.creatorId,
        goalAmount: campaigns.goalAmount,
        currentAmount: campaigns.currentAmount,
        currency: campaigns.currency,
        status: campaigns.status,
        isActive: campaigns.isActive,
        coverImageUrl: campaigns.coverImageUrl,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        deletedAt: campaigns.deletedAt,
        creatorName: users.fullName,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.creatorId, users.id))
      .where(isNotNull(campaigns.deletedAt))
      .orderBy(desc(campaigns.deletedAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(isNotNull(campaigns.deletedAt));

    const campaignsWithStats = await Promise.all(
      campaignsList.map(async (campaign) => {
        const [donationStats] = await db
          .select({ count: count() })
          .from(donations)
          .where(and(
            eq(donations.campaignId, campaign.id),
            eq(donations.paymentStatus, 'completed')
          ));
        const [chainerStats] = await db
          .select({ count: count() })
          .from(chainers)
          .where(eq(chainers.campaignId, campaign.id));
        return {
          ...campaign,
          goalAmount: Number(campaign.goalAmount),
          currentAmount: Number(campaign.currentAmount),
          donationCount: donationStats?.count || 0,
          chainerCount: chainerStats?.count || 0,
        };
      })
    );

    const totalPages = Math.ceil(totalCount.count / limit);

    return NextResponse.json({
      campaigns: campaignsWithStats,
      totalPages,
      currentPage: page,
      totalCount: totalCount.count,
    });
  } catch (error) {
    console.error('Error fetching deleted campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deleted campaigns' },
      { status: 500 }
    );
  }
}
