import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chainers, users, campaigns, donations } from '@/lib/schema';
import { eq, like, and, desc, count, sum, sql } from 'drizzle-orm';

/**
 * GET /api/admin/chainers
 * Get paginated list of chainers with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const fraud = searchParams.get('fraud') || 'all';

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        sql`(${users.fullName} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`
      );
    }
    
    if (status !== 'all') {
      whereConditions.push(eq(chainers.status, status as any));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get chainers with user and campaign info
    const chainersList = await db
      .select({
        id: chainers.id,
        userId: chainers.userId,
        campaignId: chainers.campaignId,
        totalReferrals: chainers.totalReferrals,
        totalRaised: chainers.totalRaised,
        commissionEarned: chainers.commissionEarned,
        commissionRate: chainers.commissionRate,
        status: chainers.status,
        createdAt: chainers.createdAt,
        updatedAt: chainers.updatedAt,
        userName: users.fullName,
        userEmail: users.email,
        campaignTitle: campaigns.title,
        isVerified: users.isVerified,
      })
      .from(chainers)
      .leftJoin(users, eq(chainers.userId, users.id))
      .leftJoin(campaigns, eq(chainers.campaignId, campaigns.id))
      .where(whereClause)
      .orderBy(desc(chainers.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalCount] = await db
      .select({ count: count() })
      .from(chainers)
      .leftJoin(users, eq(chainers.userId, users.id))
      .where(whereClause);

    // Calculate fraud scores and suspicious activity
    const chainersWithFraudData = await Promise.all(
      chainersList.map(async (chainer) => {
        // Get recent activity for fraud detection
        const [recentDonations] = await db
          .select({ count: count() })
          .from(donations)
          .where(and(
            eq(donations.chainerId, chainer.id),
            sql`${donations.createdAt} >= NOW() - INTERVAL '7 days'`
          ));

        // Simple fraud score calculation (can be enhanced)
        let fraudScore = 0;
        let suspiciousActivity = false;

        // High referral count in short time
        if (chainer.totalReferrals > 50) fraudScore += 20;
        if (chainer.totalReferrals > 100) fraudScore += 30;

        // High commission earned
        if (chainer.commissionEarned > 1000) fraudScore += 15;
        if (chainer.commissionEarned > 5000) fraudScore += 25;

        // Recent activity spike
        if (recentDonations.count > 20) {
          fraudScore += 25;
          suspiciousActivity = true;
        }

        // Account age vs performance
        const accountAge = Date.now() - new Date(chainer.createdAt).getTime();
        const daysOld = accountAge / (1000 * 60 * 60 * 24);
        if (daysOld < 7 && chainer.totalReferrals > 10) {
          fraudScore += 30;
          suspiciousActivity = true;
        }

        return {
          ...chainer,
          fraudScore: Math.min(100, fraudScore),
          suspiciousActivity,
          lastActivity: chainer.updatedAt,
        };
      })
    );

    // Filter by fraud risk if specified
    let filteredChainers = chainersWithFraudData;
    if (fraud !== 'all') {
      filteredChainers = chainersWithFraudData.filter(chainer => {
        switch (fraud) {
          case 'high':
            return chainer.fraudScore >= 70;
          case 'medium':
            return chainer.fraudScore >= 40 && chainer.fraudScore < 70;
          case 'low':
            return chainer.fraudScore < 40;
          case 'suspicious':
            return chainer.suspiciousActivity;
          default:
            return true;
        }
      });
    }

    const totalPages = Math.ceil(totalCount.count / limit);

    return NextResponse.json({
      chainers: filteredChainers,
      totalPages,
      currentPage: page,
      totalCount: filteredChainers.length,
    });

  } catch (error) {
    console.error('Error fetching chainers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chainers' },
      { status: 500 }
    );
  }
}
