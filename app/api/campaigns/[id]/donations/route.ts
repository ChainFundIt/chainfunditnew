import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { users } from '@/lib/schema/users';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    // Default to a high limit (1000) to get all donations, or use specified limit
    const limit = limitParam ? parseInt(limitParam) : 1000;
    const status = searchParams.get('status') || 'completed';
    const paymentMethod = searchParams.get('paymentMethod'); // Optional filter: 'stripe' or 'paystack'

    // Build where conditions
    const whereConditions = [eq(donations.campaignId, campaignId)];
    
    // Filter by status in the database query (not after) - this ensures we get all completed donations
    if (status !== 'all') {
      whereConditions.push(eq(donations.paymentStatus, status));
    }
    
    if (paymentMethod && (paymentMethod === 'stripe' || paymentMethod === 'paystack')) {
      whereConditions.push(eq(donations.paymentMethod, paymentMethod));
    }

    // Build the base query
    const baseQuery = db
      .select({
        id: donations.id,
        amount: donations.amount,
        currency: donations.currency,
        paymentStatus: donations.paymentStatus,
        paymentMethod: donations.paymentMethod,
        message: donations.message,
        isAnonymous: donations.isAnonymous,
        createdAt: donations.createdAt,
        processedAt: donations.processedAt,
        donorName: donations.donorName,
        donorUserName: users.fullName,
        donorAvatar: users.avatar,
      })
      .from(donations)
      .leftJoin(users, eq(donations.donorId, users.id))
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
      .orderBy(desc(donations.createdAt)); // Order by date (newest first)
    
    // Apply limit
    const campaignDonations = await baseQuery.limit(limit);

    // Ensure we have valid data
    if (!campaignDonations || !Array.isArray(campaignDonations)) {
      console.error('Invalid campaign donations data:', campaignDonations);
      return NextResponse.json({
        success: true,
        donations: [],
        stats: {
          totalDonations: 0,
          totalAmount: 0,
          uniqueDonors: 0,
        },
      });
    }

    // No need to filter by status again since it's already in the WHERE clause
    const filteredDonations = campaignDonations;

    // Format donations for frontend with null safety
    const formattedDonations = filteredDonations.map(donation => ({
      id: donation.id || '',
      amount: donation.amount || '0',
      currency: donation.currency || 'NGN',
      paymentStatus: donation.paymentStatus || 'pending',
      paymentMethod: donation.paymentMethod || 'stripe',
      message: donation.message || '',
      isAnonymous: donation.isAnonymous || false,
      createdAt: donation.createdAt || new Date().toISOString(),
      processedAt: donation.processedAt || null,
      donorName: donation.isAnonymous 
        ? 'Anonymous' 
        : (donation.donorName || donation.donorUserName || 'Anonymous'),
      donorAvatar: donation.isAnonymous ? null : (donation.donorAvatar || null),
    }));

    // Calculate donation stats with null safety
    const completedDonations = campaignDonations.filter(d => d && d.paymentStatus === 'completed');
    const totalAmount = completedDonations.reduce((sum, d) => {
      const amount = d.amount;
      if (!amount || isNaN(parseFloat(amount))) return sum;
      return sum + parseFloat(amount);
    }, 0);
    const uniqueDonors = new Set(
      completedDonations
        .map(d => d.donorName)
        .filter(name => name && name !== 'Anonymous')
    ).size;

    return NextResponse.json({
      success: true,
      donations: formattedDonations,
      stats: {
        totalDonations: completedDonations.length,
        totalAmount,
        uniqueDonors,
      },
    });
  } catch (error) {
    console.error('Error fetching campaign donations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
