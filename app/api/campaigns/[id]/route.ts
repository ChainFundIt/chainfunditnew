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
  if (!userPayload || !userPayload.email) return null;
  return userPayload.email;
}

// GET /api/campaigns/[id] - Get campaign by ID with detailed stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Get campaign with creator details
    const campaignData = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        subtitle: campaigns.subtitle,
        description: campaigns.description,
        reason: campaigns.reason,
        fundraisingFor: campaigns.fundraisingFor,
        duration: campaigns.duration,
        videoUrl: campaigns.videoUrl,
        coverImageUrl: campaigns.coverImageUrl,
        galleryImages: campaigns.galleryImages,
        documents: campaigns.documents,
        goalAmount: campaigns.goalAmount,
        currency: campaigns.currency,
        minimumDonation: campaigns.minimumDonation,
        chainerCommissionRate: campaigns.chainerCommissionRate,
        currentAmount: campaigns.currentAmount,
        status: campaigns.status,
        isActive: campaigns.isActive,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        closedAt: campaigns.closedAt,
        creatorId: campaigns.creatorId,
        creatorName: users.fullName,
        creatorAvatar: users.avatar,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.creatorId, users.id))
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaignData.length) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaignData[0];

    // Get donation statistics
    const donationStats = await db
      .select({
        totalDonations: count(donations.id),
        totalAmount: sum(donations.amount),
        uniqueDonors: count(donations.donorId),
      })
      .from(donations)
      .where(and(
        eq(donations.campaignId, campaignId),
        eq(donations.paymentStatus, 'completed')
      ));

    const stats = {
      totalDonations: Number(donationStats[0]?.totalDonations || 0),
      totalAmount: Number(donationStats[0]?.totalAmount || 0),
      uniqueDonors: Number(donationStats[0]?.uniqueDonors || 0),
      progressPercentage: Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100)),
    };

    // Parse JSON fields
    const campaignWithStats = {
      ...campaign,
      goalAmount: Number(campaign.goalAmount),
      currentAmount: Number(campaign.currentAmount),
      minimumDonation: Number(campaign.minimumDonation),
      chainerCommissionRate: Number(campaign.chainerCommissionRate),
      galleryImages: campaign.galleryImages ? JSON.parse(campaign.galleryImages) : [],
      documents: campaign.documents ? JSON.parse(campaign.documents) : [],
      stats,
    };

    return NextResponse.json({
      success: true,
      data: campaignWithStats,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Re-enable authentication later
    const { id: campaignId } = await params;
    const body = await request.json();

    // Check if campaign exists
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign.length) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Update campaign
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only allow updating certain fields
    const allowedFields = ['title', 'subtitle', 'description', 'videoUrl', 'status', 'isActive'];
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const updatedCampaign = await db
      .update(campaigns)
      .set(updateData)
      .where(eq(campaigns.id, campaignId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedCampaign[0],
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete campaign (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Re-enable authentication later
    const { id: campaignId } = await params;

    // Check if campaign exists
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign.length) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    const deletedCampaign = await db
      .update(campaigns)
      .set({
        isActive: false,
        status: 'closed',
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    return NextResponse.json({
      success: true,
      data: deletedCampaign[0],
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
} 