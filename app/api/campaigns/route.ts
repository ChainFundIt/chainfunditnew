import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, users, donations } from '@/lib/schema';
import { eq, and, count, sum } from 'drizzle-orm';
import { parse } from 'cookie';
import { verifyUserJWT } from '@/lib/auth';

async function getUserFromRequest(request: NextRequest) {
  const cookie = request.headers.get('cookie') || '';
  const cookies = parse(cookie);
  const token = cookies['auth_token'];
  if (!token) return null;
  const userPayload = verifyUserJWT(token);
  if (!userPayload) return null;
  return userPayload.email;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const creatorId = searchParams.get('creatorId');


    // Build query with filters
    let conditions = [];
    if (status) {
      conditions.push(eq(campaigns.status, status));
    }
    if (reason) {
      conditions.push(eq(campaigns.reason, reason));
    }
    if (creatorId) {
      conditions.push(eq(campaigns.creatorId, creatorId));
    }
    
    
    // Get campaigns with creator details and donation stats
    const campaignsWithDetails = await db
      .select()
      .from(campaigns)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);


    // Get donation stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaignsWithDetails.map(async (campaign) => {
        const donationStats = await db
          .select({
            totalDonations: count(donations.id),
            totalAmount: sum(donations.amount),
            uniqueDonors: count(donations.donorId),
          })
          .from(donations)
          .where(and(
            eq(donations.campaignId, campaign.id),
            eq(donations.paymentStatus, 'completed')
          ));

        const stats = {
          totalDonations: Number(donationStats[0]?.totalDonations || 0),
          totalAmount: Number(donationStats[0]?.totalAmount || 0),
          uniqueDonors: Number(donationStats[0]?.uniqueDonors || 0),
          progressPercentage: Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100)),
        };

        return {
          ...campaign,
          goalAmount: Number(campaign.goalAmount),
          currentAmount: Number(campaign.currentAmount),
          minimumDonation: Number(campaign.minimumDonation),
          chainerCommissionRate: Number(campaign.chainerCommissionRate),
          galleryImages: campaign.galleryImages ? JSON.parse(campaign.galleryImages) : [],
          documents: campaign.documents ? JSON.parse(campaign.documents) : [],
          stats,
        };
      })
    );
    
    
    const response = NextResponse.json({
      success: true,
      data: campaignsWithStats,
      pagination: {
        limit,
        offset,
        total: campaignsWithStats.length,
      },
    });

    // Add performance headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    response.headers.set('CDN-Cache-Control', 'public, max-age=60');
    response.headers.set('Vary', 'Accept-Encoding');
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

