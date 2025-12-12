import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { favourites } from '@/lib/schema/favourites';
import { users } from '@/lib/schema/users';
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

/**
 * GET /api/favourites/check?itemType=campaign&itemId=xxx
 * Check if an item is favourited by the authenticated user
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

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('itemType');
    const itemId = searchParams.get('itemId');

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

    // Check if favourited
    const [favourite] = await db
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

    return NextResponse.json({
      success: true,
      data: { isFavourited: !!favourite },
    });
  } catch (error) {
    console.error('Error checking favourite status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check favourite status' },
      { status: 500 }
    );
  }
}

