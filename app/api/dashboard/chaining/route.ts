import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, campaigns, chainers, donations } from '@/lib/schema';
import { eq, and, desc, count, sum } from 'drizzle-orm';
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
    const email = await getUserFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Get user
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user.length) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const userId = user[0].id;

    // Get user's chaining activity
    const chainingActivity = await db
      .select({
        id: chainers.id,
        campaignId: chainers.campaignId,
        referralCode: chainers.referralCode,
        totalRaised: chainers.totalRaised,
        totalReferrals: chainers.totalReferrals,
        commissionEarned: chainers.commissionEarned,
        createdAt: chainers.createdAt,
        campaignTitle: campaigns.title,
        campaignCoverImage: campaigns.coverImageUrl,
        campaignGoal: campaigns.goalAmount,
        campaignCurrent: campaigns.currentAmount,
        campaignCurrency: campaigns.currency
      })
      .from(chainers)
      .leftJoin(campaigns, eq(chainers.campaignId, campaigns.id))
      .where(eq(chainers.userId, userId))
      .orderBy(desc(chainers.createdAt));

    // Get total chaining stats
    const totalStats = await db
      .select({
        totalChained: count(chainers.id),
        totalEarnings: sum(chainers.commissionEarned),
        totalDonations: sum(chainers.totalRaised)
      })
      .from(chainers)
      .where(eq(chainers.userId, userId));

    // Get recent donations through chaining
    const recentChainedDonations = await db
      .select({
        id: donations.id,
        amount: donations.amount,
        currency: donations.currency,
        message: donations.message,
        isAnonymous: donations.isAnonymous,
        createdAt: donations.createdAt,
        campaignTitle: campaigns.title,
        donorName: users.fullName
      })
      .from(donations)
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .leftJoin(users, eq(donations.donorId, users.id))
      .where(and(
        eq(donations.chainerId, userId),
        eq(donations.paymentStatus, 'completed')
      ))
      .orderBy(desc(donations.createdAt))
      .limit(10);

    const chainingWithStats = chainingActivity.map(chain => ({
      ...chain,
      totalEarnings: Number(chain.commissionEarned || 0),
      totalDonations: Number(chain.totalRaised || 0),
      campaignGoal: Number(chain.campaignGoal),
      campaignCurrent: Number(chain.campaignCurrent),
      progressPercentage: Math.min(100, Math.round((Number(chain.campaignCurrent) / Number(chain.campaignGoal)) * 100))
    }));

    const recentDonationsWithStats = recentChainedDonations.map(donation => ({
      ...donation,
      amount: Number(donation.amount),
      donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName
    }));

    return NextResponse.json({ 
      success: true, 
      chaining: chainingWithStats,
      recentDonations: recentDonationsWithStats,
      stats: {
        totalChained: Number(totalStats[0]?.totalChained || 0),
        totalEarnings: Number(totalStats[0]?.totalEarnings || 0),
        totalDonations: Number(totalStats[0]?.totalDonations || 0)
      }
    });
  } catch (error) {
    console.error('User chaining error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 