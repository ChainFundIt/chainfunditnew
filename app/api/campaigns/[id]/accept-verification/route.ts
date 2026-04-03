import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';
import { db } from '@/lib/db';
import { campaigns, users } from '@/lib/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { verifyUserJWT } from '@/lib/auth';
import { sendCampaignVerifiedEmail } from '@/lib/notifications/campaign-status-emails';

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function getUserIdFromRequest(request: NextRequest): string | null {
  const cookie = request.headers.get('cookie') || '';
  const cookies = parse(cookie);
  const token = cookies['auth_token'];
  if (!token) return null;
  const payload = verifyUserJWT(token);
  return payload?.sub ?? null;
}

/**
 * POST /api/campaigns/[id]/accept-verification
 * Creator accepts verified-campaign rules after admin marked verification as pending.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: campaignIdOrSlug } = await params;
    const isUUID = isValidUUID(campaignIdOrSlug);
    const whereCondition = and(
      isUUID
        ? eq(campaigns.id, campaignIdOrSlug)
        : eq(campaigns.slug, campaignIdOrSlug),
      isNull(campaigns.deletedAt)
    );

    const [row] = await db
      .select({
        id: campaigns.id,
        slug: campaigns.slug,
        title: campaigns.title,
        creatorId: campaigns.creatorId,
        isVerified: campaigns.isVerified,
        verifiedPendingAt: campaigns.verifiedPendingAt,
      })
      .from(campaigns)
      .where(whereCondition)
      .limit(1);

    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (row.creatorId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (row.isVerified) {
      return NextResponse.json(
        { success: true, message: 'Campaign is already verified' },
        { status: 200 }
      );
    }

    if (!row.verifiedPendingAt) {
      return NextResponse.json(
        {
          success: false,
          error: 'This campaign is not awaiting verification acceptance',
        },
        { status: 400 }
      );
    }

    const now = new Date();
    await db
      .update(campaigns)
      .set({
        isVerified: true,
        verifiedPendingAt: null,
        verifiedRulesAcceptedAt: now,
        updatedAt: now,
      })
      .where(eq(campaigns.id, row.id));

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'https://chainfundit.com';
    const campaignUrl = row.slug ? `${baseUrl}/campaign/${row.slug}` : baseUrl;

    const [creator] = await db
      .select({ email: users.email, fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const creatorEmail = creator?.email;
    const creatorName =
      creator?.fullName || creatorEmail?.split('@')[0] || 'there';

    if (creatorEmail) {
      try {
        await sendCampaignVerifiedEmail({
          userEmail: creatorEmail,
          userName: creatorName,
          campaignTitle: row.title,
          campaignUrl,
        });
      } catch (e) {
        console.error('Failed to send campaign verified email:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verified campaign agreement accepted',
    });
  } catch (error) {
    console.error('accept-verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to accept verification' },
      { status: 500 }
    );
  }
}
