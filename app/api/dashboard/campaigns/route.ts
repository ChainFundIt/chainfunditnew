import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, campaigns, donations } from '@/lib/schema';
import { eq, and, sql, desc, count, sum } from 'drizzle-orm';
import { parse } from 'cookie';
import { verifyUserJWT } from '@/lib/auth';

async function getUserFromRequest(request: NextRequest) {
  const cookie = request.headers.get('cookie') || '';
  const cookies = parse(cookie);
  const token = cookies['auth_token'];
  if (!token) return null;
  const userPayload = verifyUserJWT(token);
  if (!userPayload || !userPayload.email) return null;
  return userPayload.email;
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-enable authentication later
    // For now, use a mock user ID for testing
    const userId = 'mock-user-id-123';

    // Get user's campaigns with donation stats
    const userCampaigns = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        subtitle: campaigns.subtitle,
        description: campaigns.description,
        goalAmount: campaigns.goalAmount,
        currentAmount: campaigns.currentAmount,
        currency: campaigns.currency,
        status: campaigns.status,
        isActive: campaigns.isActive,
        coverImageUrl: campaigns.coverImageUrl,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        closedAt: campaigns.closedAt,
        donationCount: count(donations.id),
        totalRaised: sum(donations.amount)
      })
      .from(campaigns)
      .leftJoin(donations, and(
        eq(campaigns.id, donations.campaignId),
        eq(donations.paymentStatus, 'completed')
      ))
      .where(eq(campaigns.creatorId, userId))
      .groupBy(campaigns.id)
      .orderBy(desc(campaigns.createdAt));

    const campaignsWithStats = userCampaigns.map(campaign => ({
      ...campaign,
      goalAmount: Number(campaign.goalAmount),
      currentAmount: Number(campaign.currentAmount),
      donationCount: Number(campaign.donationCount),
      totalRaised: Number(campaign.totalRaised || 0),
      progressPercentage: Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100))
    }));

    return NextResponse.json({ success: true, campaigns: campaignsWithStats });
  } catch (error) {
    console.error('User campaigns error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 