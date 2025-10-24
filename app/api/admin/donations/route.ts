import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations, users, campaigns, chainers } from '@/lib/schema';
import { eq, like, and, desc, count, sum, sql } from 'drizzle-orm';

/**
 * GET /api/admin/donations
 * Get paginated list of donations with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const currency = searchParams.get('currency') || 'all';
    const fraud = searchParams.get('fraud') || 'all';

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        sql`(${users.fullName} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`} OR ${campaigns.title} ILIKE ${`%${search}%`})`
      );
    }
    
    if (status !== 'all') {
      whereConditions.push(eq(donations.paymentStatus, status as any));
    }

    if (currency !== 'all') {
      whereConditions.push(eq(donations.currency, currency as any));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get donations with donor, campaign, and chainer info
    const donationsList = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
        donorId: donations.donorId,
        amount: donations.amount,
        currency: donations.currency,
        paymentStatus: donations.paymentStatus,
        paymentMethod: donations.paymentMethod,
        chainerId: donations.chainerId,
        createdAt: donations.createdAt,
        processedAt: donations.processedAt,
        refundedAt: donations.refundedAt,
        refundReason: donations.refundReason,
        transactionId: donations.transactionId,
        donorName: users.fullName,
        donorEmail: users.email,
        campaignTitle: campaigns.title,
        chainerName: chainers.userId, // We'll need to join with users table for chainer name
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .leftJoin(chainers, eq(donations.chainerId, chainers.id))
      .where(whereClause)
      .orderBy(desc(donations.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [totalCount] = await db
      .select({ count: count() })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .where(whereClause);

    // Get chainer names for donations that have chainers
    const donationsWithChainerNames = await Promise.all(
      donationsList.map(async (donation) => {
        let chainerName = null;
        if (donation.chainerId) {
          const [chainerUser] = await db
            .select({ fullName: users.fullName })
            .from(chainers)
            .leftJoin(users, eq(chainers.userId, users.id))
            .where(eq(chainers.id, donation.chainerId))
            .limit(1);
          
          chainerName = chainerUser?.fullName || null;
        }

        return {
          ...donation,
          chainerName,
        };
      })
    );

    // Calculate fraud scores and suspicious activity
    const donationsWithFraudData = await Promise.all(
      donationsWithChainerNames.map(async (donation) => {
        // Simple fraud score calculation
        let fraudScore = 0;
        let suspiciousActivity = false;

        // High amount donations
        if (donation.amount > 1000) fraudScore += 20;
        if (donation.amount > 5000) fraudScore += 30;

        // Multiple donations from same donor
        const [donationCount] = await db
          .select({ count: count() })
          .from(donations)
          .where(and(
            eq(donations.donorId, donation.donorId),
            sql`${donations.createdAt} >= NOW() - INTERVAL '24 hours'`
          ));

        if (donationCount.count > 5) {
          fraudScore += 25;
          suspiciousActivity = true;
        }

        // Failed payment attempts
        const [failedCount] = await db
          .select({ count: count() })
          .from(donations)
          .where(and(
            eq(donations.donorId, donation.donorId),
            eq(donations.paymentStatus, 'failed')
          ));

        if (failedCount.count > 3) {
          fraudScore += 20;
          suspiciousActivity = true;
        }

        // Recent account creation
        const [donorAccount] = await db
          .select({ createdAt: users.createdAt })
          .from(users)
          .where(eq(users.id, donation.donorId))
          .limit(1);

        if (donorAccount) {
          const accountAge = Date.now() - new Date(donorAccount.createdAt).getTime();
          const hoursOld = accountAge / (1000 * 60 * 60);
          if (hoursOld < 24 && donation.amount > 100) {
            fraudScore += 30;
            suspiciousActivity = true;
          }
        }

        return {
          ...donation,
          fraudScore: Math.min(100, fraudScore),
          suspiciousActivity,
        };
      })
    );

    // Filter by fraud risk if specified
    let filteredDonations = donationsWithFraudData;
    if (fraud !== 'all') {
      filteredDonations = donationsWithFraudData.filter(donation => {
        switch (fraud) {
          case 'high':
            return donation.fraudScore >= 70;
          case 'medium':
            return donation.fraudScore >= 40 && donation.fraudScore < 70;
          case 'low':
            return donation.fraudScore < 40;
          case 'suspicious':
            return donation.suspiciousActivity;
          default:
            return true;
        }
      });
    }

    const totalPages = Math.ceil(totalCount.count / limit);

    return NextResponse.json({
      donations: filteredDonations,
      totalPages,
      currentPage: page,
      totalCount: filteredDonations.length,
    });

  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
