import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaignComments } from '@/lib/schema/campaign-comments';
import { users } from '@/lib/schema/users';
import { donations } from '@/lib/schema/donations';
import { eq, and, desc } from 'drizzle-orm';
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

// GET /api/campaigns/[id]/comments - Get comments for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get comments with user and donation details
    const comments = await db
      .select({
        id: campaignComments.id,
        content: campaignComments.content,
        createdAt: campaignComments.createdAt,
        updatedAt: campaignComments.updatedAt,
        userId: campaignComments.userId,
        userName: users.fullName,
        userAvatar: users.avatar,
        donationAmount: donations.amount,
        donationCurrency: donations.currency,
        isAnonymous: donations.isAnonymous,
      })
      .from(campaignComments)
      .leftJoin(users, eq(campaignComments.userId, users.id))
      .leftJoin(donations, and(
        eq(campaignComments.userId, donations.donorId),
        eq(campaignComments.campaignId, donations.campaignId)
      ))
      .where(eq(campaignComments.campaignId, campaignId))
      .orderBy(desc(campaignComments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        limit,
        offset,
        total: comments.length,
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/comments - Create a new comment
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
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Get user ID from email
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

    const newComment = await db.insert(campaignComments).values({
      campaignId,
      userId: user[0].id,
      content: content.trim(),
    }).returning();

    return NextResponse.json({
      success: true,
      data: newComment[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 