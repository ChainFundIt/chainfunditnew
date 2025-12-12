import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema/campaigns';
import { users } from '@/lib/schema/users';
import { favourites } from '@/lib/schema/favourites';
import { eq, and } from 'drizzle-orm';
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

// GET /api/campaigns/[id]/like - Check if user has liked the campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;

    // Get user ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user.length) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if campaign is in favourites
    const [favourite] = await db
      .select()
      .from(favourites)
      .where(
        and(
          eq(favourites.userId, user[0].id),
          eq(favourites.itemType, 'campaign'),
          eq(favourites.itemId, campaignId)
        )
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      data: { isLiked: !!favourite },
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/like - Toggle like status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;

    // Verify campaign exists
    const campaign = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign.length) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Get user ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user.length) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already favourited
    const [existing] = await db
      .select()
      .from(favourites)
      .where(
        and(
          eq(favourites.userId, user[0].id),
          eq(favourites.itemType, 'campaign'),
          eq(favourites.itemId, campaignId)
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
        data: { isLiked: false },
      });
    } else {
      // Add favourite
      const [newFavourite] = await db
        .insert(favourites)
        .values({
          userId: user[0].id,
          itemType: 'campaign',
          itemId: campaignId,
        })
        .returning();

      return NextResponse.json({
        success: true,
        data: { isLiked: true, favourite: newFavourite },
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
} 