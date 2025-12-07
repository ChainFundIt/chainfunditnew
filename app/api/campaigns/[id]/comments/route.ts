import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaignComments, campaigns, users } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/campaigns/[id]/comments - Get all comments for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    
    // Get campaign comments with user details
    const comments = await db
      .select({
        id: campaignComments.id,
        content: campaignComments.content,
        isPublic: campaignComments.isPublic,
        createdAt: campaignComments.createdAt,
        updatedAt: campaignComments.updatedAt,
        userId: campaignComments.userId,
        userName: users.fullName,
        userEmail: users.email,
        userAvatar: users.avatar,
      })
      .from(campaignComments)
      .innerJoin(users, eq(campaignComments.userId, users.id))
      .where(eq(campaignComments.campaignId, campaignId))
      .orderBy(desc(campaignComments.createdAt));

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching campaign comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign comments' },
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
    const { id: campaignId } = await params;
    
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
    const body = await request.json();

    // Check if campaign exists
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign.length) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Validate required fields
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Create the comment
    const newComment = await db
      .insert(campaignComments)
      .values({
        campaignId,
        userId,
        content: body.content.trim(),
        isPublic: body.isPublic !== undefined ? body.isPublic : true,
      })
      .returning();

    // Get the created comment with user details
    const commentWithUser = await db
      .select({
        id: campaignComments.id,
        content: campaignComments.content,
        isPublic: campaignComments.isPublic,
        createdAt: campaignComments.createdAt,
        updatedAt: campaignComments.updatedAt,
        userId: campaignComments.userId,
        userName: users.fullName,
        userEmail: users.email,
        userAvatar: users.avatar,
      })
      .from(campaignComments)
      .innerJoin(users, eq(campaignComments.userId, users.id))
      .where(eq(campaignComments.id, newComment[0].id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: commentWithUser[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 