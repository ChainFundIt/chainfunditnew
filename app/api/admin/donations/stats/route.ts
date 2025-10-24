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
    console.log('🌱 Phase 1: Adding basic stats queries');
    
    // Phase 1: Basic count queries - no complex aggregations
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

    // Basic amount queries
    const [totalAmount] = await db
      .select({ total: sum(donations.amount) })
      .from(donations);

    const [completedAmount] = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));

    const [pendingAmount] = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(eq(donations.paymentStatus, 'pending'));

    const [refundedAmount] = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(eq(donations.paymentStatus, 'refunded'));

    // Basic average query
    const [averageDonation] = await db
      .select({ average: sql<number>`AVG(${donations.amount})` })
      .from(donations)
      .where(eq(donations.paymentStatus, 'completed'));

   
    // Phase 2: Add recent donations with joins
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

    const stats = {
      totalDonations: totalDonations?.count || 0,
      completedDonations: completedDonations?.count || 0,
      pendingDonations: pendingDonations?.count || 0,
      failedDonations: failedDonations?.count || 0,
      refundedDonations: refundedDonations?.count || 0,
      totalAmount: Number(totalAmount?.total) || 0,
      completedAmount: Number(completedAmount?.total) || 0,
      pendingAmount: Number(pendingAmount?.total) || 0,
      refundedAmount: Number(refundedAmount?.total) || 0,
      averageDonation: Number(averageDonation?.average) || 0,
      // Phase 2: Add recent donations
      recentDonations: recentDonations || [],
      // Keep these empty for Phase 3
      donationGrowth: [],
      statusDistribution: [],
      currencyDistribution: [],
      paymentMethodDistribution: [],
      topDonors: [],
    };

    console.log(`✅ Phase 2: Stats calculated with joins - Total: ${stats.totalDonations}, Amount: $${stats.totalAmount}, Recent: ${recentDonations.length}`);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching donation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation statistics' },
      { status: 500 }
    );
  }
}
