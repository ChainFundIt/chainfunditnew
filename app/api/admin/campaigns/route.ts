import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, users, donations, chainers } from '@/lib/schema';
import { eq, like, and, desc, count, sum, sql } from 'drizzle-orm';

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

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        sql`(${campaigns.title} ILIKE ${`%${search}%`} OR ${campaigns.description} ILIKE ${`%${search}%`})`
      );
    }
    
    if (status !== 'all') {
      whereConditions.push(eq(campaigns.status, status as any));
    }
    
    // Category filtering not available in current schema
    // if (category !== 'all') {
    //   whereConditions.push(eq(campaigns.category, category));
    // }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get campaigns with creator info
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
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        isActive: campaigns.isActive,
        coverImageUrl: campaigns.coverImageUrl,
        creatorName: users.fullName,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.creatorId, users.id))
      .where(whereClause)
      .orderBy(desc(campaigns.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalCount] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(whereClause);

    // Get campaign stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaignsList.map(async (campaign) => {
        // Get donation count
        const [donationStats] = await db
          .select({
            count: count(),
          })
          .from(donations)
          .where(and(
            eq(donations.campaignId, campaign.id),
            eq(donations.paymentStatus, 'completed')
          ));

        // Get chainer count
        const [chainerStats] = await db
          .select({
            count: count(),
          })
          .from(chainers)
          .where(eq(chainers.campaignId, campaign.id));

        return {
          ...campaign,
          donationCount: donationStats?.count || 0,
          chainerCount: chainerStats?.count || 0,
          reportCount: 0,
          hasReports: false,
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
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
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
