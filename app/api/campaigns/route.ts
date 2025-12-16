import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, users, donations } from '@/lib/schema';
import { eq, and, or, inArray, count, sum, desc, ne, like } from 'drizzle-orm';
import { parse } from 'cookie';
import { verifyUserJWT } from '@/lib/auth';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';
import { sendCampaignCreationEmail } from '@/lib/notifications/campaign-creation-email';

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
    const complianceStatus = searchParams.get('complianceStatus');
    const includePending = searchParams.get('includePending') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const creatorId = searchParams.get('creatorId');
    const excludeId = searchParams.get('excludeId');


    // Build query with filters
    const conditions: any[] = [];
    if (status) {
      conditions.push(eq(campaigns.status, status));
    }
    if (reason) {
      conditions.push(eq(campaigns.reason, reason));
    }
    if (creatorId) {
      conditions.push(eq(campaigns.creatorId, creatorId));
    }
    if (excludeId) {
      conditions.push(ne(campaigns.id, excludeId));
    }
    // Compliance status filter removed
    
    // Visibility logic:
    // - If creatorId is specified, show all campaigns for that creator (public and private)
    //   This is used for dashboard where users see their own campaigns
    // - Otherwise, only show public campaigns in listings
    //   Private campaigns are only accessible via direct link (when shared by creator)
    if (creatorId) {
      // When viewing a specific creator's campaigns (e.g., in dashboard),
      // show all campaigns (public and private) for that creator
    } else {
      // For public listing, only show public campaigns
      // Private campaigns are filtered out but can be accessed via direct link
      conditions.push(eq(campaigns.visibility, 'public'));
    }
    
    // Get campaigns with creator details and donation stats
    const campaignsWithDetails = await db
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
        coverImageUrl: campaigns.coverImageUrl,
        galleryImages: campaigns.galleryImages,
        documents: campaigns.documents,
        goalAmount: campaigns.goalAmount,
        currency: campaigns.currency,
        minimumDonation: campaigns.minimumDonation,
        chainerCommissionRate: campaigns.chainerCommissionRate,
        isChained: campaigns.isChained,
        currentAmount: campaigns.currentAmount,
        status: campaigns.status,
        visibility: campaigns.visibility,
        isActive: campaigns.isActive,
        complianceStatus: campaigns.complianceStatus,
        complianceSummary: campaigns.complianceSummary,
        complianceFlags: campaigns.complianceFlags,
        riskScore: campaigns.riskScore,
        reviewRequired: campaigns.reviewRequired,
        lastScreenedAt: campaigns.lastScreenedAt,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        closedAt: campaigns.closedAt,
        creatorId: campaigns.creatorId,
        creatorName: users.fullName,
        creatorAvatar: users.avatar,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.creatorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(campaigns.isActive), desc(campaigns.createdAt))
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

        const complianceFlags = Array.isArray(campaign.complianceFlags)
          ? (campaign.complianceFlags as string[])
          : [];

        return {
          ...campaign,
          goalAmount: Number(campaign.goalAmount),
          currentAmount: Number(campaign.currentAmount),
          minimumDonation: Number(campaign.minimumDonation),
          chainerCommissionRate: Number(campaign.chainerCommissionRate),
          galleryImages: campaign.galleryImages ? JSON.parse(campaign.galleryImages) : [],
          documents: campaign.documents ? JSON.parse(campaign.documents) : [],
          complianceFlags,
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

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details
    const user = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
    if (!user.length) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user[0].id;

    // Parse form data
    const formData = await request.formData();
    
    // Extract campaign data
    const creationRequestId = (formData.get('creationRequestId') as string) || null;
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const description = formData.get('description') as string;
    const reason = formData.get('reason') as string;
    const fundraisingFor = formData.get('fundraisingFor') as string;
    const duration = formData.get('duration') as string;
    const goalAmount = formData.get('goalAmount') as string;
    const currency = formData.get('currency') as string;
    const minimumDonation = formData.get('minimumDonation') as string;
    const chainerCommissionRate = formData.get('chainerCommissionRate') as string;
    const isChained = formData.get('isChained') as string;
    const visibility = formData.get('visibility') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const coverImageUrl = formData.get('coverImageUrl') as string;
    const galleryImages = formData.get('galleryImages') as string;
    const documents = formData.get('documents') as string;

    // Validate required fields
    if (!title || !description || !goalAmount || !currency || !minimumDonation || !chainerCommissionRate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate visibility field
    if (visibility && !['public', 'private'].includes(visibility)) {
      return NextResponse.json(
        { success: false, error: 'Invalid visibility value. Must be public or private' },
        { status: 400 }
      );
    }

    // Validate isChained field
    const isChainedBool = isChained === 'true';

    // Idempotency: if this exact creation request was already processed for this user,
    // return the existing campaign instead of creating a duplicate.
    if (creationRequestId) {
      const existingByRequestId = await db
        .select()
        .from(campaigns)
        .where(and(eq(campaigns.creatorId, userId), eq(campaigns.creationRequestId, creationRequestId)))
        .limit(1);

      if (existingByRequestId.length) {
        return NextResponse.json(
          { success: true, data: existingByRequestId[0], idempotent: true },
          { status: 200 }
        );
      }
    }

    // Validate numeric fields
    const goalAmountNum = parseFloat(goalAmount);
    const minimumDonationNum = parseFloat(minimumDonation);
    const commissionRateNum = parseFloat(chainerCommissionRate);

    if (isNaN(goalAmountNum) || goalAmountNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid goal amount' },
        { status: 400 }
      );
    }

    if (isNaN(minimumDonationNum) || minimumDonationNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid minimum donation amount' },
        { status: 400 }
      );
    }

    // Only validate commission rate if campaign is chained
    if (isChainedBool) {
      if (isNaN(commissionRateNum) || commissionRateNum < 1 || commissionRateNum > 10) {
        return NextResponse.json(
          { success: false, error: 'Commission rate must be between 1.0 and 10.0 when chaining is enabled' },
          { status: 400 }
        );
      }
    }

    // Generate unique slug for the campaign
    const baseSlug = generateSlug(title);
    
    const isUniqueViolation = (err: unknown) => {
      const e = err as any;
      return e?.code === '23505' || (typeof e?.message === 'string' && e.message.includes('duplicate key value violates unique constraint'));
    };

    let newCampaign: any[] = [];
    // Create campaign (retry on slug collisions; handle idempotency-key collisions)
    for (let attempt = 0; attempt < 3; attempt++) {
      // Check for existing slugs to ensure uniqueness (include baseSlug-# variants)
      const existingSlugs = await db
        .select({ slug: campaigns.slug })
        .from(campaigns)
        .where(like(campaigns.slug, `${baseSlug}%`));

      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs.map(c => c.slug));

      try {
        newCampaign = await db.insert(campaigns).values({
          creatorId: userId,
          creationRequestId,
          title,
          slug: uniqueSlug,
          subtitle: subtitle || null,
          description,
          reason: reason || null,
          fundraisingFor: fundraisingFor || null,
          duration: duration || null,
          videoUrl: videoUrl || null,
          coverImageUrl: coverImageUrl || null,
          galleryImages: galleryImages || null,
          documents: documents || null,
          goalAmount: goalAmountNum.toString(),
          currency,
          minimumDonation: minimumDonationNum.toString(),
          chainerCommissionRate: isChainedBool ? commissionRateNum.toString() : '0',
          isChained: isChainedBool,
          currentAmount: '0',
          status: 'active',
          visibility: visibility || 'public',
          isActive: true,
          complianceStatus: 'approved',
          complianceSummary: null,
          complianceFlags: null,
          riskScore: '0',
          reviewRequired: false,
          lastScreenedAt: null,
          blockedAt: null,
        }).returning();
        break;
      } catch (err) {
        // If the idempotency key already exists (race), return the previously created campaign.
        if (creationRequestId && isUniqueViolation(err)) {
          const existingByRequestId = await db
            .select()
            .from(campaigns)
            .where(and(eq(campaigns.creatorId, userId), eq(campaigns.creationRequestId, creationRequestId)))
            .limit(1);

          if (existingByRequestId.length) {
            return NextResponse.json(
              { success: true, data: existingByRequestId[0], idempotent: true },
              { status: 200 }
            );
          }
        }

        // Otherwise: likely a slug collision, retry a couple times.
        if (attempt === 2 || !isUniqueViolation(err)) throw err;
      }
    }

    // Send confirmation email to user (non-blocking - don't fail campaign creation if email fails)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      (request.headers.get('origin') || 'https://chainfundit.com');
      const campaignSlug = newCampaign[0]?.slug;
      const campaignUrl = `${baseUrl}/campaign/${campaignSlug}`;
      
      await sendCampaignCreationEmail({
        userEmail: userEmail,
        userName: user[0].fullName || user[0].email?.split('@')[0] || 'there',
        campaignTitle: title,
        campaignSlug: campaignSlug,
        goalAmount: goalAmountNum.toString(),
        currency,
        campaignUrl,
        visibility: visibility || 'public',
        isChained: isChainedBool,
      });
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send campaign creation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: newCampaign[0],
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

