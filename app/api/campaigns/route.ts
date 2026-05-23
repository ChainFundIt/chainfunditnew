import { NextRequest, NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';
import { campaigns, users, donations } from '@/lib/schema';
import { eq, and, or, inArray, count, sum, desc, ne, like, isNull, sql } from 'drizzle-orm';
import { parse } from 'cookie';
import { verifyUserJWT } from '@/lib/auth';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';
import { sendCampaignCreationEmail } from '@/lib/notifications/campaign-creation-email';
import { notifyAdminsOfCampaignCreated } from '@/lib/notifications/campaign-created-alerts';

const campaignIdempotentSelect = {
  id: campaigns.id,
  creatorId: campaigns.creatorId,
  title: campaigns.title,
  slug: campaigns.slug,
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
  createdAt: campaigns.createdAt,
  updatedAt: campaigns.updatedAt,
  closedAt: campaigns.closedAt,
};

function safeParseStringArray(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    // Gracefully handle legacy non-JSON values instead of failing the whole request.
    return [];
  }
}

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


    // Build query with filters (exclude campaigns moved to Recently Deleted)
    const conditions: any[] = [isNull(campaigns.deletedAt)];
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
    const campaignsWithDetails = await withRetry(() =>
      db
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
          isVerified: campaigns.isVerified,
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
        .offset(offset)
    );


    // Get donation stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaignsWithDetails.map(async (campaign) => {
        const donationStats = await withRetry(() =>
          db
            .select({
              totalDonations: count(donations.id),
              totalAmount: sum(donations.amount),
              uniqueDonors: count(donations.donorId),
            })
            .from(donations)
            .where(and(
              eq(donations.campaignId, campaign.id),
              eq(donations.paymentStatus, 'completed')
            ))
        );

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
          galleryImages: safeParseStringArray(campaign.galleryImages),
          documents: safeParseStringArray(campaign.documents),
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
    console.error('Error fetching campaigns:', error);
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
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        suspendedAt: users.suspendedAt,
      })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);
    if (!user.length) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user[0].id;

    if (user[0].suspendedAt) {
      return NextResponse.json(
        { success: false, error: 'Your account is suspended. Please contact support.' },
        { status: 403 }
      );
    }

    if (!user[0].phone) {
      return NextResponse.json(
        { success: false, error: 'A phone number is required before creating a campaign. Please update your profile settings.' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    // Extract campaign data
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
    if (!title || !description || !goalAmount || !currency || !minimumDonation) {
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
    if (isChainedBool && !chainerCommissionRate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Truncate string fields to schema limits to avoid DB overflow (causes 500 for some users)
    const L = {
      title: 255,
      subtitle: 255,
      reason: 100,
      fundraisingFor: 100,
      duration: 50,
      videoUrl: 255,
      coverImageUrl: 255,
      currency: 50,
      visibility: 20,
    };
    const safeStr = (s: string | null | undefined, max: number) =>
      s == null ? null : String(s).trim().slice(0, max) || null;
    const titleSafe = (title || '').trim().slice(0, L.title) || 'Campaign';
    const subtitleSafe = safeStr(subtitle, L.subtitle);
    const reasonSafe = safeStr(reason, L.reason);
    const fundraisingForSafe = safeStr(fundraisingFor, L.fundraisingFor);
    const durationSafe = safeStr(duration, L.duration);
    const videoUrlSafe = safeStr(videoUrl, L.videoUrl);
    const coverImageUrlSafe = safeStr(coverImageUrl, L.coverImageUrl);
    const currencySafe = (currency || 'USD').trim().slice(0, L.currency);
    const visibilitySafe = (visibility || 'public').trim().slice(0, L.visibility);

    // Generate unique slug; never allow empty (some titles become empty after slugify)
    let baseSlug = generateSlug(titleSafe);
    if (!baseSlug) baseSlug = `campaign-${Date.now()}`;

    const isUniqueViolation = (err: unknown) => {
      const e = err as any;
      return e?.code === '23505' || (typeof e?.message === 'string' && e.message.includes('duplicate key value violates unique constraint'));
    };

    let newCampaign: any[] = [];
    // Create campaign (retry on slug collisions)
    for (let attempt = 0; attempt < 4; attempt++) {
      // Check for existing slugs to ensure uniqueness (include baseSlug-# variants)
      const existingSlugs = await db
        .select({ slug: campaigns.slug })
        .from(campaigns)
        .where(like(campaigns.slug, `${baseSlug}%`));

      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs.map(c => c.slug));

      try {
        const insertedCampaign = await db.execute(sql`
          insert into "campaigns" (
            "creator_id",
            "title",
            "slug",
            "subtitle",
            "description",
            "reason",
            "fundraising_for",
            "duration",
            "video_url",
            "cover_image_url",
            "gallery_images",
            "documents",
            "goal_amount",
            "currency",
            "minimum_donation",
            "chainer_commission_rate",
            "is_chained",
            "current_amount",
            "status",
            "visibility",
            "is_active"
          ) values (
            ${userId},
            ${titleSafe},
            ${uniqueSlug},
            ${subtitleSafe},
            ${description},
            ${reasonSafe},
            ${fundraisingForSafe},
            ${durationSafe},
            ${videoUrlSafe},
            ${coverImageUrlSafe},
            ${galleryImages || null},
            ${documents || null},
            ${goalAmountNum.toString()},
            ${currencySafe},
            ${minimumDonationNum.toString()},
            ${isChainedBool ? commissionRateNum.toString() : '0'},
            ${isChainedBool},
            ${'0'},
            ${'active'},
            ${visibilitySafe},
            ${true}
          )
          returning
            "id" as "id",
            "creator_id" as "creatorId",
            "title" as "title",
            "slug" as "slug",
            "subtitle" as "subtitle",
            "description" as "description",
            "reason" as "reason",
            "fundraising_for" as "fundraisingFor",
            "duration" as "duration",
            "video_url" as "videoUrl",
            "cover_image_url" as "coverImageUrl",
            "gallery_images" as "galleryImages",
            "documents" as "documents",
            "goal_amount" as "goalAmount",
            "currency" as "currency",
            "minimum_donation" as "minimumDonation",
            "chainer_commission_rate" as "chainerCommissionRate",
            "is_chained" as "isChained",
            "current_amount" as "currentAmount",
            "status" as "status",
            "visibility" as "visibility",
            "is_active" as "isActive",
            "created_at" as "createdAt",
            "updated_at" as "updatedAt",
            "closed_at" as "closedAt"
        `);
        newCampaign = (insertedCampaign.rows ?? []) as any[];
        break;
      } catch (err) {
        // Otherwise: likely a slug collision, retry with new slug.
        if (attempt === 3 || !isUniqueViolation(err)) throw err;
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
        campaignTitle: titleSafe,
        campaignSlug: campaignSlug,
        goalAmount: goalAmountNum.toString(),
        currency: currencySafe,
        campaignUrl,
        visibility: visibilitySafe,
        isChained: isChainedBool,
      });
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send campaign creation email:', emailError);
    }

    // Notify admins about new campaign creation (non-blocking)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      (request.headers.get('origin') || 'https://chainfundit.com');
      const campaignSlug = newCampaign[0]?.slug;
      const campaignUrl = `${baseUrl}/campaign/${campaignSlug}`;

      await notifyAdminsOfCampaignCreated({
        campaignTitle: titleSafe,
        campaignSlug: campaignSlug,
        goalAmount: goalAmountNum.toString(),
        currency: currencySafe,
        campaignUrl,
        visibility: visibilitySafe,
        isChained: isChainedBool,
        creatorName: user[0].fullName || user[0].email?.split('@')[0] || 'Unknown',
        creatorEmail: user[0].email || 'Unknown',
      });
    } catch (adminEmailError) {
      console.error('Failed to notify admins of campaign creation:', adminEmailError);
    }

    return NextResponse.json({
      success: true,
      data: newCampaign[0],
    }, { status: 201 });

  } catch (error) {
    const err = error as { code?: string; message?: string; constraint?: string };
    console.error('Error creating campaign:', {
      code: err?.code,
      constraint: err?.constraint,
      message: err?.message,
      stack: err && typeof (err as any).stack === 'string' ? (err as any).stack : undefined,
    });
    // Return a user-friendly message; avoid exposing internal details
    const isConstraint = err?.code === '23505' || err?.constraint;
    const message = isConstraint
      ? 'A conflict occurred (e.g. duplicate title or link). Please try again with a different title or wait a moment.'
      : 'Something went wrong while creating your campaign. Please try again.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

