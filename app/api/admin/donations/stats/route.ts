import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations, users, campaigns, chainers } from '@/lib/schema';
import { eq, gte, count, sum, sql, desc } from 'drizzle-orm';

/**
 * GET /api/admin/donations/stats
 * Get donation statistics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Get basic donation counts
    const [totalDonations] = await db.select({ count: count() }).from(donations);
    
    const [completedDonations] = await db
      .select({ count: count() })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));

    const [pendingDonations] = await db
      .select({ count: count() })
      .from(donations)
      .where(eq(donations.paymentStatus, 'pending'));

    const [failedDonations] = await db
      .select({ count: count() })
      .from(donations)
      .where(eq(donations.paymentStatus, 'failed'));

    const [refundedDonations] = await db
      .select({ count: count() })
      .from(donations)
      .where(eq(donations.paymentStatus, 'refunded'));

    // Get total amounts
    const [totalAmount] = await db
      .select({
        total: sum(donations.amount),
      })
      .from(donations);

    const [completedAmount] = await db
      .select({
        total: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));

    const [pendingAmount] = await db
      .select({
        total: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'pending'));

    const [refundedAmount] = await db
      .select({
        total: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'refunded'));

    // Get average donation amount
    const [averageDonation] = await db
      .select({
        average: sql<number>`AVG(${donations.amount})`,
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));

    // Get fraud alerts (high amount donations)
    const [fraudAlerts] = await db
      .select({ count: count() })
      .from(donations)
      .where(
        sql`${donations.amount} > 1000 AND ${donations.paymentStatus} = 'completed'`
      );

    // Get recent donations
    const recentDonations = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
        donorId: donations.donorId,
        amount: donations.amount,
        currency: donations.currency,
        paymentStatus: donations.paymentStatus,
        createdAt: donations.createdAt,
        donorName: users.fullName,
        campaignTitle: campaigns.title,
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .orderBy(desc(donations.createdAt))
      .limit(10);

    // Get donation growth over time (last 12 months)
    const donationGrowth = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${donations.createdAt})`,
        count: count(),
        total: sum(donations.amount),
      })
      .from(donations)
      .where(gte(donations.createdAt, sql`NOW() - INTERVAL '12 months'`))
      .groupBy(sql`DATE_TRUNC('month', ${donations.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${donations.createdAt})`);

    // Get status distribution
    const statusDistribution = await db
      .select({
        status: donations.paymentStatus,
        count: count(),
      })
      .from(donations)
      .groupBy(donations.paymentStatus);

    // Get currency distribution
    const currencyDistribution = await db
      .select({
        currency: donations.currency,
        count: count(),
        total: sum(donations.amount),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'))
      .groupBy(donations.currency);

    // Get payment method distribution
    const paymentMethodDistribution = await db
      .select({
        method: donations.paymentMethod,
        count: count(),
      })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'))
      .groupBy(donations.paymentMethod);

    // Get top donors
    const topDonors = await db
      .select({
        donorId: donations.donorId,
        donorName: users.fullName,
        totalDonations: count(),
        totalAmount: sum(donations.amount),
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .where(eq(donations.paymentStatus, 'completed'))
      .groupBy(donations.donorId, users.fullName)
      .orderBy(desc(sum(donations.amount)))
      .limit(10);

    const stats = {
      totalDonations: totalDonations.count,
      completedDonations: completedDonations.count,
      pendingDonations: pendingDonations.count,
      failedDonations: failedDonations.count,
      refundedDonations: refundedDonations.count,
      totalAmount: Number(totalAmount?.total) || 0,
      completedAmount: Number(completedAmount?.total) || 0,
      pendingAmount: Number(pendingAmount?.total) || 0,
      refundedAmount: Number(refundedAmount?.total) || 0,
      averageDonation: Number(averageDonation?.average) || 0,
      fraudAlerts: fraudAlerts.count,
      recentDonations,
      donationGrowth,
      statusDistribution,
      currencyDistribution,
      paymentMethodDistribution,
      topDonors,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching donation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation statistics' },
      { status: 500 }
    );
  }
}
