import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chainers, users, campaigns, donations } from '@/lib/schema';
import { eq, gte, count, sum, sql, desc } from 'drizzle-orm';

/**
 * GET /api/admin/chainers/stats
 * Get chainer statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Get basic chainer counts
    const [totalChainers] = await db.select({ count: count() }).from(chainers);
    
    const [activeChainers] = await db
      .select({ count: count() })
      .from(chainers)
      .where(eq(chainers.status, 'active'));

    const [suspendedChainers] = await db
      .select({ count: count() })
      .from(chainers)
      .where(eq(chainers.status, 'suspended'));

    const [bannedChainers] = await db
      .select({ count: count() })
      .from(chainers)
      .where(eq(chainers.status, 'banned'));

    // Get total commissions earned
    const [totalCommissions] = await db
      .select({
        total: sum(chainers.commissionEarned),
      })
      .from(chainers);

    // Get total raised through chainers
    const [totalRaised] = await db
      .select({
        total: sum(chainers.totalRaised),
      })
      .from(chainers);

    // Get average commission rate
    const [averageCommissionRate] = await db
      .select({
        average: sql<number>`AVG(${chainers.commissionRate})`,
      })
      .from(chainers);

    // Get fraud alerts (chainers with high fraud scores)
    const [fraudAlerts] = await db
      .select({ count: count() })
      .from(chainers)
      .where(
        sql`${chainers.commissionEarned} > 1000 AND ${chainers.totalReferrals} > 50`
      );

    // Get top performing chainers
    const topPerformers = await db
      .select({
        id: chainers.id,
        userId: chainers.userId,
        totalReferrals: chainers.totalReferrals,
        totalRaised: chainers.totalRaised,
        commissionEarned: chainers.commissionEarned,
        commissionRate: chainers.commissionRate,
        status: chainers.status,
        userName: users.fullName,
        campaignTitle: campaigns.title,
      })
      .from(chainers)
      .leftJoin(users, eq(chainers.userId, users.id))
      .leftJoin(campaigns, eq(chainers.campaignId, campaigns.id))
      .orderBy(desc(chainers.commissionEarned))
      .limit(10);

    // Get recent chainer activity
    const recentActivity = await db
      .select({
        id: chainers.id,
        userId: chainers.userId,
        campaignId: chainers.campaignId,
        totalReferrals: chainers.totalReferrals,
        commissionEarned: chainers.commissionEarned,
        status: chainers.status,
        createdAt: chainers.createdAt,
        userName: users.fullName,
        campaignTitle: campaigns.title,
      })
      .from(chainers)
      .leftJoin(users, eq(chainers.userId, users.id))
      .leftJoin(campaigns, eq(chainers.campaignId, campaigns.id))
      .orderBy(desc(chainers.createdAt))
      .limit(10);

    // Get chainer growth over time (last 12 months)
    const chainerGrowth = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${chainers.createdAt})`,
        count: count(),
      })
      .from(chainers)
      .where(gte(chainers.createdAt, sql`NOW() - INTERVAL '12 months'`))
      .groupBy(sql`DATE_TRUNC('month', ${chainers.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${chainers.createdAt})`);

    // Get status distribution
    const statusDistribution = await db
      .select({
        status: chainers.status,
        count: count(),
      })
      .from(chainers)
      .groupBy(chainers.status);

    // Get commission distribution
    const commissionDistribution = await db
      .select({
        range: sql<string>`CASE 
          WHEN ${chainers.commissionEarned} < 100 THEN '0-100'
          WHEN ${chainers.commissionEarned} < 500 THEN '100-500'
          WHEN ${chainers.commissionEarned} < 1000 THEN '500-1000'
          WHEN ${chainers.commissionEarned} < 5000 THEN '1000-5000'
          ELSE '5000+'
        END`,
        count: count(),
      })
      .from(chainers)
      .groupBy(sql`CASE 
        WHEN ${chainers.commissionEarned} < 100 THEN '0-100'
        WHEN ${chainers.commissionEarned} < 500 THEN '100-500'
        WHEN ${chainers.commissionEarned} < 1000 THEN '500-1000'
        WHEN ${chainers.commissionEarned} < 5000 THEN '1000-5000'
        ELSE '5000+'
      END`);

    const stats = {
      totalChainers: totalChainers.count,
      activeChainers: activeChainers.count,
      suspendedChainers: suspendedChainers.count,
      bannedChainers: bannedChainers.count,
      totalCommissions: Number(totalCommissions?.total) || 0,
      totalRaised: Number(totalRaised?.total) || 0,
      averageCommissionRate: Number(averageCommissionRate?.average) || 0,
      fraudAlerts: fraudAlerts.count,
      topPerformers,
      recentActivity,
      chainerGrowth,
      statusDistribution,
      commissionDistribution,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching chainer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chainer statistics' },
      { status: 500 }
    );
  }
}
