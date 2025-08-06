import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, campaignUpdates, users } from '@/lib/schema';
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

// GET /api/campaigns/[id]/updates - Get campaign updates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    // Verify campaign exists
    const campaign = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    if (!campaign.length) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Get updates
    const updates = await db
      .select({
        id: campaignUpdates.id,
        campaignId: campaignUpdates.campaignId,
        title: campaignUpdates.title,
        content: campaignUpdates.content,
        isPublic: campaignUpdates.isPublic,
        createdAt: campaignUpdates.createdAt,
        updatedAt: campaignUpdates.updatedAt,
      })
      .from(campaignUpdates)
      .where(eq(campaignUpdates.campaignId, campaignId))
      .orderBy(desc(campaignUpdates.createdAt));

    return NextResponse.json({
      success: true,
      data: updates,
    });
  } catch (error) {
    console.error('Error fetching campaign updates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign updates' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/updates - Create campaign update
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

    const { title, content } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create update
    const newUpdate = await db.insert(campaignUpdates).values({
      campaignId,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      data: newUpdate[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign update' },
      { status: 500 }
    );
  }
} 