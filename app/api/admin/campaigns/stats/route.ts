import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, donations, chainers } from '@/lib/schema';
import { eq, gte, count, sum, sql, desc } from 'drizzle-orm';

/**
 * GET /api/admin/campaigns/stats
 * Get campaign statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Get basic campaign counts
    const [totalCampaigns] = await db.select({ count: count() }).from(campaigns);
    
    const [activeCampaigns] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(eq(campaigns.status, 'active'));

    const [completedCampaigns] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(eq(campaigns.status, 'completed'));

    const [pendingReview] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(eq(campaigns.isActive, false));

    const reportedCampaigns = { count: 0 };

    // Get total raised amount
    const [totalRaised] = await db
      .select({
        total: sum(campaigns.currentAmount),
      })
      .from(campaigns)
      .where(eq(campaigns.status, 'active'));

    // Get total donations
    const [totalDonations] = await db
      .select({
        count: count(),
        total: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));

    // Get average goal amount
    const [averageGoal] = await db
      .select({
        average: sql<number>`AVG(${campaigns.goalAmount})`,
      })
      .from(campaigns);

    // Calculate success rate (campaigns that reached their goal)
    const [successfulCampaigns] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(
        sql`${campaigns.currentAmount} >= ${campaigns.goalAmount}`
      );

    const successRate = totalCampaigns.count > 0 
      ? Math.round((successfulCampaigns.count / totalCampaigns.count) * 100)
      : 0;

    // Get campaign growth over time (last 12 months)
    const campaignGrowth = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${campaigns.createdAt})`,
        count: count(),
      })
      .from(campaigns)
      .where(gte(campaigns.createdAt, sql`NOW() - INTERVAL '12 months'`))
      .groupBy(sql`DATE_TRUNC('month', ${campaigns.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${campaigns.createdAt})`);

    // Category distribution not available in current schema
    const categoryDistribution: { category: string; count: number }[] = [];

    // Get status distribution
    const statusDistribution = await db
      .select({
        status: campaigns.status,
        count: count(),
      })
      .from(campaigns)
      .groupBy(campaigns.status);

    // Get top performing campaigns
    const topCampaigns = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        currentAmount: campaigns.currentAmount,
        goalAmount: campaigns.goalAmount,
        donationCount: sql<number>`(
          SELECT COUNT(*) FROM ${donations} 
          WHERE ${donations.campaignId} = ${campaigns.id} 
          AND ${donations.paymentStatus} = 'completed'
        )`,
      })
      .from(campaigns)
      .orderBy(desc(campaigns.currentAmount))
      .limit(10);

    // Reports not available in current schema
    const reportedCampaignsList: any[] = [];

    // Get recent campaign activity
    const recentActivity = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        currentAmount: campaigns.currentAmount,
      })
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt))
      .limit(10);

    const stats = {
      totalCampaigns: totalCampaigns.count,
      activeCampaigns: activeCampaigns.count,
      completedCampaigns: completedCampaigns.count,
      pendingReview: pendingReview.count,
      reportedCampaigns: reportedCampaigns.count,
      totalRaised: totalRaised?.total || 0,
      totalDonations: totalDonations?.count || 0,
      totalDonationAmount: totalDonations?.total || 0,
      averageGoal: averageGoal?.average || 0,
      successRate,
      campaignGrowth,
      categoryDistribution,
      statusDistribution,
      topCampaigns,
      recentActivity,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign statistics' },
      { status: 500 }
    );
  }
}
