import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, donations, campaigns, chainers } from '@/lib/schema';
import { eq, gte, count, sum, sql, desc } from 'drizzle-orm';

/**
 * GET /api/admin/users/stats
 * Get user statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Get basic user counts
    const [totalUsers] = await db.select({ count: count() }).from(users);
    
    const [activeUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isVerified, true));

    const [suspendedUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.accountLocked, true));

    const [verifiedUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isVerified, true));

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [newUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startOfMonth));

    // Get donation stats
    const [donationStats] = await db
      .select({
        totalDonations: count(),
        totalRevenue: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));

    // Get campaign stats
    const [campaignStats] = await db
      .select({ count: count() })
      .from(campaigns);

    // Get chainer stats
    const [chainerStats] = await db
      .select({ count: count() })
      .from(chainers);

    // Get user growth over time (last 12 months)
    const userGrowth = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, sql`NOW() - INTERVAL '12 months'`))
      .groupBy(sql`DATE_TRUNC('month', ${users.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${users.createdAt})`);

    // Get user activity stats (using createdAt as proxy since lastActive doesn't exist)
    const [activeThisWeek] = await db
      .select({ count: count() })
      .from(users)
      .where(
        sql`${users.createdAt} >= NOW() - INTERVAL '7 days'`
      );

    const [activeThisMonth] = await db
      .select({ count: count() })
      .from(users)
      .where(
        sql`${users.createdAt} >= NOW() - INTERVAL '30 days'`
      );

    // Role distribution not available in current schema
    const roleDistribution: { role: string; count: number }[] = [];

    // Get user status distribution (using accountLocked as status indicator)
    const statusDistribution = await db
      .select({
        status: sql<string>`CASE WHEN ${users.accountLocked} THEN 'locked' ELSE 'active' END`,
        count: count(),
      })
      .from(users)
      .groupBy(sql`CASE WHEN ${users.accountLocked} THEN 'locked' ELSE 'active' END`);

    // Get top users by donations
    const topDonors = await db
      .select({
        userId: donations.donorId,
        totalDonations: count(),
        totalAmount: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'))
      .groupBy(donations.donorId)
      .orderBy(desc(sum(donations.amount)))
      .limit(10);

    // Get top users by campaigns created
    const topCreators = await db
      .select({
        creatorId: campaigns.creatorId,
        campaignCount: count(),
        totalRaised: sum(campaigns.currentAmount),
      })
      .from(campaigns)
      .groupBy(campaigns.creatorId)
      .orderBy(desc(count()))
      .limit(10);

    const stats = {
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      suspendedUsers: suspendedUsers.count,
      newUsers: newUsers.count,
      verifiedUsers: verifiedUsers.count,
      totalDonations: donationStats?.totalDonations || 0,
      totalRevenue: donationStats?.totalRevenue || 0,
      totalCampaigns: campaignStats?.count || 0,
      totalChainers: chainerStats?.count || 0,
      activeThisWeek: activeThisWeek.count,
      activeThisMonth: activeThisMonth.count,
      userGrowth,
      roleDistribution,
      statusDistribution,
      topDonors,
      topCreators,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
