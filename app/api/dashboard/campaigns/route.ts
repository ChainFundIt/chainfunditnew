import { NextRequest, NextResponse } from 'next/server';
import { db, normalizeEmail } from '@/lib/db';
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
  let userId: string | undefined;
  try {
    const email = await getUserFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Get user with case-insensitive email lookup
    const normalizedEmail = normalizeEmail(email);
    const user = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${normalizedEmail})`)
      .limit(1);
    if (!user.length) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    userId = user[0].id;

    // Debug: Check if any campaigns exist for this user (simple query without joins)
    const debugCampaigns = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        status: campaigns.status,
        isActive: campaigns.isActive,
        creatorId: campaigns.creatorId,
      })
      .from(campaigns)
      .where(eq(campaigns.creatorId, userId));
    
    if (debugCampaigns.length > 0) {
    } else {
    }

    // Get user's campaigns with donation stats
    const userCampaigns = await db
      .select({
        id: campaigns.id,
        slug: campaigns.slug,
        title: campaigns.title,
        subtitle: campaigns.subtitle,
        description: campaigns.description,
        reason: campaigns.reason,
        fundraisingFor: campaigns.fundraisingFor,
        duration: campaigns.duration,
        videoUrl: campaigns.videoUrl,
        goalAmount: campaigns.goalAmount,
        currency: campaigns.currency,
        minimumDonation: campaigns.minimumDonation,
        chainerCommissionRate: campaigns.chainerCommissionRate,
        isChained: campaigns.isChained,
        currentAmount: campaigns.currentAmount,
        status: campaigns.status,
        visibility: campaigns.visibility,
        isActive: campaigns.isActive,
        coverImageUrl: campaigns.coverImageUrl,
        galleryImages: campaigns.galleryImages,
        documents: campaigns.documents,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        closedAt: campaigns.closedAt,
        creatorId: campaigns.creatorId,
        creatorName: users.fullName,
        creatorAvatar: users.avatar,
        donationCount: count(donations.id),
        totalRaised: sum(sql`COALESCE(${donations.convertedAmount}, ${donations.amount})`)
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.creatorId, users.id))
      .leftJoin(donations, and(
        eq(campaigns.id, donations.campaignId),
        eq(donations.paymentStatus, 'completed')
      ))
      .where(eq(campaigns.creatorId, userId))
      .groupBy(
        campaigns.id,
        campaigns.slug,
        campaigns.title,
        campaigns.subtitle,
        campaigns.description,
        campaigns.reason,
        campaigns.fundraisingFor,
        campaigns.duration,
        campaigns.videoUrl,
        campaigns.goalAmount,
        campaigns.currency,
        campaigns.minimumDonation,
        campaigns.chainerCommissionRate,
        campaigns.isChained,
        campaigns.currentAmount,
        campaigns.status,
        campaigns.visibility,
        campaigns.isActive,
        campaigns.coverImageUrl,
        campaigns.galleryImages,
        campaigns.documents,
        campaigns.createdAt,
        campaigns.updatedAt,
        campaigns.closedAt,
        campaigns.creatorId,
        users.fullName,
        users.avatar
      )
      .orderBy(desc(campaigns.createdAt));

    const campaignsWithStats = userCampaigns.map(campaign => {
      // Use currentAmount from database (source of truth) which is calculated using convertedAmount
      // totalRaised is kept for reference but currentAmount is the authoritative value
      const currentAmount = Number(campaign.currentAmount || 0);
      const goalAmount = Number(campaign.goalAmount);
      
      return {
        ...campaign,
        goalAmount,
        currentAmount,
        donationCount: Number(campaign.donationCount),
        totalRaised: Number(campaign.totalRaised || 0), // Calculated using convertedAmount for reference
        progressPercentage: Math.min(100, Math.round((currentAmount / goalAmount) * 100)),
        stats: {
          totalDonations: Number(campaign.donationCount),
          totalAmount: currentAmount,
          uniqueDonors: Number(campaign.donationCount), // This might need to be calculated differently
          progressPercentage: Math.min(100, Math.round((currentAmount / goalAmount) * 100))
        }
      };
    });

    return NextResponse.json({ success: true, campaigns: campaignsWithStats });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
} 