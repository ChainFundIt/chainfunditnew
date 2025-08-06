import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, campaignComments, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
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

// GET /api/campaigns/[id]/comments - Get campaign comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Verify campaign exists
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign.length) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Get comments with user details
    const comments = await db
      .select({
        id: campaignComments.id,
        campaignId: campaignComments.campaignId,
        userId: campaignComments.userId,
        content: campaignComments.content,
        createdAt: campaignComments.createdAt,
        updatedAt: campaignComments.updatedAt,
        userName: users.fullName,
        userAvatar: users.avatar,
      })
      .from(campaignComments)
      .leftJoin(users, eq(campaignComments.userId, users.id))
      .where(eq(campaignComments.campaignId, campaignId))
      .orderBy(desc(campaignComments.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: campaignComments.id })
      .from(campaignComments)
      .where(eq(campaignComments.campaignId, campaignId));

    return NextResponse.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching campaign comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign comments' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/comments - Create campaign comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Re-enable authentication later
    const { id: campaignId } = await params;
    const body = await request.json();

    // Verify campaign exists
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign.length) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Get or create mock user for comments
    const mockUserEmail = 'mock-user@example.com';
    const mockUserName = 'Mock User';
    
    let [existingUser] = await db.select().from(users).where(eq(users.email, mockUserEmail)).limit(1);
    let userId: string;
    
    if (!existingUser) {
      const [newUser] = await db.insert(users).values({
        email: mockUserEmail,
        fullName: mockUserName,
        hasCompletedProfile: true,
      }).returning();
      userId = newUser.id;
    } else {
      userId = existingUser.id;
    }

    const { content } = body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Comment too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Create comment
    const newComment = await db.insert(campaignComments).values({
      campaignId,
      userId: userId, // TODO: Use real user ID when authentication is re-enabled
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Get comment with user details
    const commentWithUser = await db
      .select({
        id: campaignComments.id,
        campaignId: campaignComments.campaignId,
        userId: campaignComments.userId,
        content: campaignComments.content,
        createdAt: campaignComments.createdAt,
        updatedAt: campaignComments.updatedAt,
        userName: users.fullName,
        userAvatar: users.avatar,
      })
      .from(campaignComments)
      .leftJoin(users, eq(campaignComments.userId, users.id))
      .where(eq(campaignComments.id, newComment[0].id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: commentWithUser[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign comment' },
      { status: 500 }
    );
  }
} 