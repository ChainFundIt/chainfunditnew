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
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const currency = searchParams.get('currency') || 'all';

    // Build where conditions
    const whereConditions = [];
    
    if (status !== 'all') {
      whereConditions.push(eq(donations.paymentStatus, status));
    }
    
    if (currency !== 'all') {
      whereConditions.push(eq(donations.currency, currency));
    }
    
    if (search) {
      whereConditions.push(
        sql`(
          ${users.fullName} ILIKE ${`%${search}%`} OR
          ${users.email} ILIKE ${`%${search}%`} OR
          ${campaigns.title} ILIKE ${`%${search}%`} OR
          ${donations.paymentIntentId} ILIKE ${`%${search}%`}
        )`
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const donationsList = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
        donorId: donations.donorId,
        amount: donations.amount,
        currency: donations.currency,
        convertedAmount: donations.convertedAmount,
        convertedCurrency: donations.convertedCurrency,
        exchangeRate: donations.exchangeRate,
        paymentStatus: donations.paymentStatus,
        paymentMethod: donations.paymentMethod,
        chainerId: donations.chainerId,
        createdAt: donations.createdAt,
        processedAt: donations.processedAt,
        paymentIntentId: donations.paymentIntentId,
        donorName: users.fullName,
        donorEmail: users.email,
        campaignTitle: campaigns.title,
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .where(whereClause)
      .orderBy(desc(donations.createdAt))
      .limit(limit)
      .offset(offset);

    // Deduplicate by donation ID to prevent duplicates from joins
    const uniqueDonationsMap = new Map();
    donationsList.forEach(donation => {
      if (!uniqueDonationsMap.has(donation.id)) {
        uniqueDonationsMap.set(donation.id, donation);
      }
    });
    const uniqueDonationsList = Array.from(uniqueDonationsMap.values());

    // Count query with same filters (count distinct donations to avoid duplicates from joins)
    const [totalCount] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${donations.id})` })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .where(whereClause);

    const donationsWithChainerNames = await Promise.all(
      uniqueDonationsList.map(async (donation) => {
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
          amount: Number(donation.amount) || 0,
          convertedAmount: donation.convertedAmount ? Number(donation.convertedAmount) : null,
          exchangeRate: donation.exchangeRate ? Number(donation.exchangeRate) : null,
          chainerName,
        };
      })
    );

    const totalCountValue = totalCount?.count || 0;
    const totalPages = Math.ceil(totalCountValue / limit);

    return NextResponse.json({
      donations: donationsWithChainerNames,
      totalPages,
      currentPage: page,
      totalCount: totalCountValue,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch donations';
    console.error('Error fetching donations:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
