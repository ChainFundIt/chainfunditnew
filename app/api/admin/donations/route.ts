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
        paymentIntentId: donations.paymentIntentId,
        donorName: users.fullName,
        donorEmail: users.email,
        campaignTitle: campaigns.title,
        chainerName: chainers.userId,
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .leftJoin(chainers, eq(donations.chainerId, chainers.id))
      .orderBy(desc(donations.createdAt))
      .limit(limit)
      .offset(offset);

    // Basic count query
    const [totalCount] = await db
      .select({ count: count() })
      .from(donations);

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
