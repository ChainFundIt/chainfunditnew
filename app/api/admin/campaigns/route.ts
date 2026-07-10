import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, users, donations, chainers } from '@/lib/schema';
import { eq, like, and, desc, count, sql, or, isNull, inArray } from 'drizzle-orm';

/**
 * GET /api/admin/campaigns
 * Get paginated list of campaigns with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';

    const offset = (page - 1) * limit;

    // Build where conditions (exclude campaigns moved to Recently Deleted)
    const whereConditions = [isNull(campaigns.deletedAt)];
    
    if (search) {
      whereConditions.push(
        sql`(${campaigns.title} ILIKE ${`%${search}%`} OR ${campaigns.description} ILIKE ${`%${search}%`})`
      );
    }
    
    if (status !== 'all') {
      if (status === 'under_review') {
        const underReviewCond = or(
          eq(campaigns.status, 'under_review'),
          eq(campaigns.complianceStatus, 'in_review')
        );
        if (underReviewCond) whereConditions.push(underReviewCond);
      } else {
        whereConditions.push(eq(campaigns.status, status as any));
      }
    }
    
    // Category filtering not available in current schema
    // if (category !== 'all') {
    //   whereConditions.push(eq(campaigns.category, category));
    // }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get campaigns with creator info.
    // Some staging databases may temporarily lag migrations for newly added fee override columns,
    // so we fallback to a legacy projection when those columns are unavailable.
    let campaignsList: Array<{
      id: string;
      slug: string;
      title: string;
      description: string;
      creatorId: string;
      goalAmount: string | number;
      currentAmount: string | number;
      currency: string;
      status: string;
      isVerified: boolean;
      verifiedPendingAt: Date | null;
      complianceStatus: string;
      createdAt: Date;
      updatedAt: Date;
      isActive: boolean;
      coverImageUrl: string | null;
      isChained: boolean;
      chainerCommissionRate: string | number;
      platformFeeOverrideEnabled: boolean;
      platformFeeOverridePercent: string | number | null;
      creatorName: string | null;
    }>;

    try {
      campaignsList = await db
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
          isVerified: campaigns.isVerified,
          verifiedPendingAt: campaigns.verifiedPendingAt,
          complianceStatus: campaigns.complianceStatus,
          createdAt: campaigns.createdAt,
          updatedAt: campaigns.updatedAt,
          isActive: campaigns.isActive,
          coverImageUrl: campaigns.coverImageUrl,
          isChained: campaigns.isChained,
          chainerCommissionRate: campaigns.chainerCommissionRate,
          platformFeeOverrideEnabled: campaigns.platformFeeOverrideEnabled,
          platformFeeOverridePercent: campaigns.platformFeeOverridePercent,
          creatorName: users.fullName,
        })
        .from(campaigns)
        .leftJoin(users, eq(campaigns.creatorId, users.id))
        .where(whereClause)
        .orderBy(desc(campaigns.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (queryError) {
      const err = queryError as Error & { code?: string };
      const isMissingColumn =
        err.code === '42703' ||
        err.message.includes('column') ||
        err.message.includes('does not exist');

      if (!isMissingColumn) {
        throw queryError;
      }

      console.warn('Falling back to legacy admin campaigns select due to missing columns:', {
        message: err.message,
        code: err.code,
      });

      const legacyRows = await db
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
          isVerified: campaigns.isVerified,
          verifiedPendingAt: campaigns.verifiedPendingAt,
          complianceStatus: campaigns.complianceStatus,
          createdAt: campaigns.createdAt,
          updatedAt: campaigns.updatedAt,
          isActive: campaigns.isActive,
          coverImageUrl: campaigns.coverImageUrl,
          isChained: campaigns.isChained,
          chainerCommissionRate: campaigns.chainerCommissionRate,
          creatorName: users.fullName,
        })
        .from(campaigns)
        .leftJoin(users, eq(campaigns.creatorId, users.id))
        .where(whereClause)
        .orderBy(desc(campaigns.createdAt))
        .limit(limit)
        .offset(offset);

      campaignsList = legacyRows.map((row) => ({
        ...row,
        platformFeeOverrideEnabled: false,
        platformFeeOverridePercent: null,
      }));
    }

    // Get total count for pagination
    const [totalCount] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(whereClause);

    const campaignIds = campaignsList.map((campaign) => campaign.id);

    const donationCounts = campaignIds.length
      ? await db
          .select({
            campaignId: donations.campaignId,
            count: count(),
          })
          .from(donations)
          .where(
            and(
              inArray(donations.campaignId, campaignIds),
              eq(donations.paymentStatus, 'completed')
            )
          )
          .groupBy(donations.campaignId)
      : [];

    const chainerCounts = campaignIds.length
      ? await db
          .select({
            campaignId: chainers.campaignId,
            count: count(),
          })
          .from(chainers)
          .where(inArray(chainers.campaignId, campaignIds))
          .groupBy(chainers.campaignId)
      : [];

    const donationCountMap = new Map(
      donationCounts.map((row) => [row.campaignId, Number(row.count || 0)])
    );
    const chainerCountMap = new Map(
      chainerCounts.map((row) => [row.campaignId, Number(row.count || 0)])
    );

    const campaignsWithStats = campaignsList.map((campaign) => {
      const effectiveStatus =
        campaign.complianceStatus === 'in_review'
          ? 'under_review'
          : campaign.status;

      return {
        ...campaign,
        // Normalize numeric fields that may come back as strings (decimals)
        goalAmount: Number(campaign.goalAmount),
        currentAmount: Number(campaign.currentAmount),
        chainerCommissionRate: Number(campaign.chainerCommissionRate || 0),
        platformFeeOverridePercent:
          campaign.platformFeeOverridePercent != null
            ? Number(campaign.platformFeeOverridePercent)
            : null,
        status: effectiveStatus,
        donationCount: donationCountMap.get(campaign.id) || 0,
        chainerCount: chainerCountMap.get(campaign.id) || 0,
        reportCount: 0,
        hasReports: false,
      };
    });

    const totalPages = Math.ceil(totalCount.count / limit);

    return NextResponse.json({
      campaigns: campaignsWithStats,
      totalPages,
      currentPage: page,
      totalCount: totalCount.count,
    });

  } catch (error) {
    const err = error as Error & { code?: string };
    console.error('Error fetching campaigns:', error);
    const isProd = process.env.VERCEL_ENV === 'production';
    return NextResponse.json(
      {
        error: 'Failed to fetch campaigns',
        details: !isProd ? err.message : undefined,
        code: !isProd ? err.code : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/campaigns
 * Create a new campaign (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      creatorId, 
      goalAmount, 
      currency = 'USD',
      coverImageUrl 
    } = body;

    // Validate required fields
    if (!title || !description || !creatorId || !goalAmount) {
      return NextResponse.json(
        { error: 'Title, description, creator ID, and goal amount are required' },
        { status: 400 }
      );
    }

    // Check if creator exists
    const creator = await db.query.users.findFirst({
      where: eq(users.id, creatorId),
    });

    if (!creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Create new campaign
    const newCampaign = await db
      .insert(campaigns)
      .values({
        creatorId,
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description,
        goalAmount,
        currency,
        minimumDonation: 1,
        chainerCommissionRate: 0.05,
        coverImageUrl,
        status: 'active',
        isActive: true,
        isChained: false,
        visibility: 'public',
      } as any)
      .returning();

    return NextResponse.json({
      message: 'Campaign created successfully',
      campaign: newCampaign[0],
    });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
