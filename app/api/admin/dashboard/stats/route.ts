import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, campaigns, donations, chainers, commissionPayouts } from '@/lib/schema';
import { eq, gte, lte, desc, count, sum, sql } from 'drizzle-orm';
import { getAdminUser } from '@/lib/admin-auth';

interface DashboardStats {
  totalUsers: number;
  totalCampaigns: number;
  totalDonations: number;
  totalRevenue: number;
  pendingPayouts: number;
  activeChainers: number;
  recentActivity: any[];
  topCampaigns: any[];
  topChainers: any[];
  revenueTrend: any[];
}

/**
 * GET /api/admin/dashboard/stats
 * Get comprehensive dashboard statistics for admin overview
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminUser = await getAdminUser(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get basic counts
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalCampaigns] = await db.select({ count: count() }).from(campaigns);
    const [totalDonations] = await db.select({ count: count() }).from(donations);
    
    // Get revenue data
    const revenueResult = await db
      .select({ 
        total: sum(donations.amount),
        count: count()
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));

    // Get pending payouts
    const [pendingPayouts] = await db
      .select({ count: count() })
      .from(commissionPayouts)
      .where(eq(commissionPayouts.status, 'pending'));

    // Get active chainers
    const [activeChainers] = await db
      .select({ count: count() })
      .from(chainers);

    // Get top campaigns by revenue
    const topCampaigns = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        goalAmount: campaigns.goalAmount,
        currentAmount: campaigns.currentAmount,
        status: campaigns.status,
        createdAt: campaigns.createdAt
      })
      .from(campaigns)
      .orderBy(desc(campaigns.currentAmount))
      .limit(5);

    // Get top chainers by referrals
    const topChainers = await db
      .select({
        id: chainers.id,
        userId: chainers.userId,
        totalReferrals: chainers.totalReferrals,
        totalRaised: chainers.totalRaised,
        commissionEarned: chainers.commissionEarned,
        createdAt: chainers.createdAt
      })
      .from(chainers)
      .orderBy(desc(chainers.totalReferrals))
      .limit(5);

    // Get recent activity (simplified for now)
    const recentActivity = await db
      .select({
        id: donations.id,
        type: sql<string>`'donation'`,
        amount: donations.amount,
        status: donations.paymentStatus,
        createdAt: donations.createdAt
      })
      .from(donations)
      .where(gte(donations.createdAt, startDate))
      .orderBy(desc(donations.createdAt))
      .limit(10);

    // Get revenue trend data
    const revenueTrend = await db
      .select({
        date: sql<string>`DATE(${donations.createdAt})`,
        amount: sum(donations.amount),
        count: count()
      })
      .from(donations)
      .where(
        sql`${donations.createdAt} >= ${startDate} AND ${donations.paymentStatus} = 'completed'`
      )
      .groupBy(sql`DATE(${donations.createdAt})`)
      .orderBy(sql`DATE(${donations.createdAt})`);

    const stats: DashboardStats = {
      totalUsers: totalUsers.count,
      totalCampaigns: totalCampaigns.count,
      totalDonations: totalDonations.count,
      totalRevenue: Number(revenueResult[0]?.total) || 0,
      pendingPayouts: pendingPayouts.count,
      activeChainers: activeChainers.count,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: `Donation of $${activity.amount}`,
        timestamp: activity.createdAt.toISOString(),
        amount: activity.amount,
        status: activity.status === 'completed' ? 'success' : 'pending'
      })),
      topCampaigns: topCampaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        raised: campaign.currentAmount,
        goal: campaign.goalAmount,
        percentage: Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100),
        status: campaign.status
      })),
      topChainers: topChainers.map(chainer => ({
        id: chainer.id,
        name: `Chainer ${chainer.id.slice(0, 8)}`,
        referrals: chainer.totalReferrals,
        raised: chainer.totalRaised,
        commission: chainer.commissionEarned,
        conversionRate: chainer.totalReferrals > 0 ? Math.round((chainer.totalReferrals / chainer.totalReferrals) * 100) : 0
      })),
      revenueTrend: revenueTrend.map(item => ({
        date: item.date,
        amount: item.amount || 0,
        donations: item.count
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
