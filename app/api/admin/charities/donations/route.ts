import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charities, charityDonations } from '@/lib/schema/charities';
import { eq, desc, and } from 'drizzle-orm';

/**
 * GET /api/admin/charities/donations
 * Get all charity donations with charity information (admin only)
 * This is much more efficient than fetching donations per charity
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const charityId = searchParams.get('charityId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '1000');
    
    // Build where conditions
    const whereConditions = [];
    
    if (charityId && charityId !== 'all') {
      whereConditions.push(eq(charityDonations.charityId, charityId));
    }
    
    if (status && status !== 'all') {
      whereConditions.push(eq(charityDonations.paymentStatus, status));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Fetch all charity donations with charity info in a single query
    const donations = await db
      .select({
        id: charityDonations.id,
        charityId: charityDonations.charityId,
        amount: charityDonations.amount,
        currency: charityDonations.currency,
        donorName: charityDonations.donorName,
        donorEmail: charityDonations.donorEmail,
        paymentStatus: charityDonations.paymentStatus,
        paymentMethod: charityDonations.paymentMethod,
        payoutStatus: charityDonations.payoutStatus,
        message: charityDonations.message,
        isAnonymous: charityDonations.isAnonymous,
        createdAt: charityDonations.createdAt,
        charityName: charities.name,
        charitySlug: charities.slug,
      })
      .from(charityDonations)
      .leftJoin(charities, eq(charityDonations.charityId, charities.id))
      .where(whereClause)
      .orderBy(desc(charityDonations.createdAt))
      .limit(limit);

    // Format donations to match the expected structure
    const formattedDonations = donations.map((donation) => ({
      id: donation.id,
      charityId: donation.charityId,
      amount: donation.amount,
      currency: donation.currency,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      paymentStatus: donation.paymentStatus,
      paymentMethod: donation.paymentMethod,
      payoutStatus: donation.payoutStatus,
      message: donation.message,
      isAnonymous: donation.isAnonymous,
      createdAt: donation.createdAt,
      charity: {
        name: donation.charityName || 'Unknown Charity',
        slug: donation.charitySlug || '',
      },
    }));

    return NextResponse.json({ 
      donations: formattedDonations,
      total: formattedDonations.length,
    });
  } catch (error) {
    console.error('Error fetching charity donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch charity donations' },
      { status: 500 }
    );
  }
}

