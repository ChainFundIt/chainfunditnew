import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { favourites } from '@/lib/schema/favourites';
import { users } from '@/lib/schema/users';
import { campaigns } from '@/lib/schema/campaigns';
import { charities } from '@/lib/schema/charities';
import { eq, and, or, inArray } from 'drizzle-orm';
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

/**
 * GET /api/favourites
 * Get all favourites for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user ID
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all favourites for the user
    const userFavourites = await db
      .select()
      .from(favourites)
      .where(eq(favourites.userId, user.id));

    // Separate campaigns and charities
    const campaignIds = userFavourites
      .filter(f => f.itemType === 'campaign')
      .map(f => f.itemId);
    const charityIds = userFavourites
      .filter(f => f.itemType === 'charity')
      .map(f => f.itemId);

    // Fetch campaigns and charities
    const favouriteCampaigns = campaignIds.length > 0
      ? await db
          .select()
          .from(campaigns)
          .where(inArray(campaigns.id, campaignIds))
      : [];

    const favouriteCharities = charityIds.length > 0
      ? await db
          .select()
          .from(charities)
          .where(inArray(charities.id, charityIds))
      : [];

    // Combine and format results
    const items = [
      ...favouriteCampaigns.map(campaign => ({
        id: campaign.id,
        type: 'campaign' as const,
        slug: campaign.slug,
        title: campaign.title,
        description: campaign.description,
        coverImage: campaign.coverImageUrl,
        image: campaign.coverImageUrl,
        category: campaign.reason || 'Uncategorized',
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        goalAmount: Number(campaign.goalAmount),
        currentAmount: Number(campaign.currentAmount),
        currency: campaign.currency,
        status: campaign.status,
        isActive: campaign.isActive,
      })),
      ...favouriteCharities.map(charity => ({
        id: charity.id,
        type: 'charity' as const,
        slug: charity.slug,
        title: charity.name,
        description: charity.description || '',
        coverImage: charity.coverImage,
        image: charity.coverImage,
        category: charity.category || 'Uncategorized',
        createdAt: charity.createdAt,
        updatedAt: charity.updatedAt,
        isVerified: charity.isVerified,
        totalReceived: charity.totalReceived,
      })),
    ];

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching favourites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favourites' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favourites
 * Toggle favourite status for an item
 * Body: { itemType: 'campaign' | 'charity', itemId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemType, itemId } = body;

    if (!itemType || !itemId) {
      return NextResponse.json(
        { success: false, error: 'itemType and itemId are required' },
        { status: 400 }
      );
    }

    if (itemType !== 'campaign' && itemType !== 'charity') {
      return NextResponse.json(
        { success: false, error: 'itemType must be "campaign" or "charity"' },
        { status: 400 }
      );
    }

    // Get user ID
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify item exists
    if (itemType === 'campaign') {
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, itemId))
        .limit(1);

      if (!campaign) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }
    } else {
      const [charity] = await db
        .select()
        .from(charities)
        .where(eq(charities.id, itemId))
        .limit(1);

      if (!charity) {
        return NextResponse.json(
          { success: false, error: 'Charity not found' },
          { status: 404 }
        );
      }
    }

    // Check if already favourited
    const [existing] = await db
      .select()
      .from(favourites)
      .where(
        and(
          eq(favourites.userId, user.id),
          eq(favourites.itemType, itemType),
          eq(favourites.itemId, itemId)
        )
      )
      .limit(1);

    if (existing) {
      // Remove favourite
      await db
        .delete(favourites)
        .where(eq(favourites.id, existing.id));

      return NextResponse.json({
        success: true,
        data: { isFavourited: false },
      });
    } else {
      // Add favourite
      const [newFavourite] = await db
        .insert(favourites)
        .values({
          userId: user.id,
          itemType,
          itemId,
        })
        .returning();

      return NextResponse.json({
        success: true,
        data: { isFavourited: true, favourite: newFavourite },
      });
    }
  } catch (error) {
    console.error('Error toggling favourite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle favourite' },
      { status: 500 }
    );
  }
}

