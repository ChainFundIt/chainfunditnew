import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { users } from '@/lib/schema/users';
import { campaigns } from '@/lib/schema/campaigns';
import { chainers } from '@/lib/schema/chainers';
import { eq, desc, and } from 'drizzle-orm';

/**
 * GET /api/admin/campaigns/[id]/donations
 * Get all donations for a specific campaign with admin-level details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '1000');

    // First verify the campaign exists
    const [campaign] = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        description: campaigns.description,
        goalAmount: campaigns.goalAmount,
        currentAmount: campaigns.currentAmount,
        currency: campaigns.currency,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        coverImageUrl: campaigns.coverImageUrl,
      })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Build where conditions
    const whereConditions = [eq(donations.campaignId, campaignId)];
    if (status !== 'all') {
      whereConditions.push(eq(donations.paymentStatus, status));
    }
    const whereClause = and(...whereConditions);

    // Get donations with donor and chainer information
    const campaignDonations = await db
      .select({
        id: donations.id,
        amount: donations.amount,
        currency: donations.currency,
        convertedAmount: donations.convertedAmount,
        convertedCurrency: donations.convertedCurrency,
        exchangeRate: donations.exchangeRate,
        paymentStatus: donations.paymentStatus,
        paymentMethod: donations.paymentMethod,
        paymentIntentId: donations.paymentIntentId,
        message: donations.message,
        isAnonymous: donations.isAnonymous,
        createdAt: donations.createdAt,
        processedAt: donations.processedAt,
        donorId: donations.donorId,
        donorName: donations.donorName,
        donorEmail: donations.donorEmail,
        donorUserName: users.fullName,
        donorUserEmail: users.email,
        chainerId: donations.chainerId,
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .where(whereClause)
      .orderBy(desc(donations.createdAt))
      .limit(limit);

    // Get chainer names for donations that have chainers
    const donationsWithChainerNames = await Promise.all(
      campaignDonations.map(async (donation) => {
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
          donorName: donation.isAnonymous ? 'Anonymous' : (donation.donorName || donation.donorUserName || 'Unknown'),
          donorEmail: donation.isAnonymous ? null : (donation.donorEmail || donation.donorUserEmail || null),
          chainerName,
        };
      })
    );

    // Calculate stats
    const allDonations = await db
      .select()
      .from(donations)
      .where(eq(donations.campaignId, campaignId));

    const completedDonations = allDonations.filter(d => d.paymentStatus === 'completed');
    const pendingDonations = allDonations.filter(d => d.paymentStatus === 'pending');
    const failedDonations = allDonations.filter(d => d.paymentStatus === 'failed');

    const totalAmount = completedDonations.reduce((sum, d) => {
      const amount = Number(d.amount) || 0;
      return sum + amount;
    }, 0);

    const uniqueDonors = new Set(
      completedDonations
        .map(d => d.donorId)
        .filter(id => id)
    ).size;

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        goalAmount: Number(campaign.goalAmount),
        currentAmount: Number(campaign.currentAmount),
      },
      donations: donationsWithChainerNames,
      stats: {
        totalDonations: allDonations.length,
        completedDonations: completedDonations.length,
        pendingDonations: pendingDonations.length,
        failedDonations: failedDonations.length,
        totalAmount,
        uniqueDonors,
        averageDonation: completedDonations.length > 0 ? totalAmount / completedDonations.length : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching campaign donations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign donations' },
      { status: 500 }
    );
  }
}
