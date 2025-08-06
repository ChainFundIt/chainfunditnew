import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
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

// GET /api/campaigns - Get all campaigns with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const creatorId = searchParams.get('creatorId');

    // Build query with filters
    let conditions = [];
    if (status) {
      conditions.push(eq(campaigns.status, status));
    }
    if (reason) {
      conditions.push(eq(campaigns.reason, reason));
    }
    if (creatorId) {
      conditions.push(eq(campaigns.creatorId, creatorId));
    }
    
    const allCampaigns = await db
      .select()
      .from(campaigns)
      .where(conditions.length > 0 ? conditions.reduce((acc, condition) => acc && condition) : undefined)
      .limit(limit)
      .offset(offset);
    
    return NextResponse.json({
      success: true,
      data: allCampaigns,
      pagination: {
        limit,
        offset,
        total: allCampaigns.length,
      },
    });
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
    // TODO: Re-enable authentication later
    // For now, use a mock user ID for testing
    const creatorId = 'mock-user-id-123';
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const reason = formData.get('reason') as string;
    const fundraisingFor = formData.get('fundraisingFor') as string;
    const duration = formData.get('duration') as string;
    const video = formData.get('video') as string;
    const story = formData.get('story') as string;
    const goalRaw = formData.get('goal') as string;
    const currency = formData.get('currency') as string;
    const visibility = formData.get('visibility') as string;

    const imageFiles = formData.getAll('images').filter((f): f is File => f instanceof File);
    const documentFiles = formData.getAll('documents').filter((f): f is File => f instanceof File);
    const coverImageFile = formData.get('coverImage') as File | null;

    // Validate required fields
    if (!title || !story || !goalRaw || !currency) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          required: ['title', 'story', 'goal', 'currency'],
          received: {
            title: !!title,
            story: !!story,
            goal: !!goalRaw,
            currency: !!currency
          }
        },
        { status: 400 }
      );
    }

    const goalAmount = parseFloat(goalRaw);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid goal amount' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxImageSize = 1024 * 1024; // 1MB
    const maxDocSize = 10 * 1024 * 1024; // 10MB

    const isValidImage = (file: File) => validImageTypes.includes(file.type) && file.size <= maxImageSize;
    const isValidDoc = (file: File) => validDocTypes.includes(file.type) && file.size <= maxDocSize;

    if (imageFiles.length > 0 && !imageFiles.every(isValidImage)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid image file type or size (max 1MB per image)' 
      }, { status: 400 });
    }

    if (documentFiles.length > 0 && !documentFiles.every(isValidDoc)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid document file type or size (max 10MB per document)' 
      }, { status: 400 });
    }

    if (imageFiles.length > 5) {
      return NextResponse.json({ 
        success: false, 
        error: 'Maximum 5 images allowed' 
      }, { status: 400 });
    }

    if (documentFiles.length > 3) {
      return NextResponse.json({ 
        success: false, 
        error: 'Maximum 3 documents allowed' 
      }, { status: 400 });
    }

    // TODO: In production, upload files to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll store file paths
    const imagePaths = imageFiles.map((file) => `/uploads/campaigns/${Date.now()}_${file.name}`);
    const documentPaths = documentFiles.map((file) => `/uploads/campaigns/${Date.now()}_${file.name}`);
    const coverImagePath = coverImageFile ? `/uploads/campaigns/${Date.now()}_${coverImageFile.name}` : null;

    // Log uploaded files for debugging
    console.log('Uploaded images:', imageFiles.map(f => f.name));
    console.log('Uploaded documents:', documentFiles.map(f => f.name));
    console.log('Cover image:', coverImageFile?.name);

    const newCampaign = await db.insert(campaigns).values({
      creatorId,
      title,
      subtitle: subtitle || null,
      description: story,
      reason: reason || null,
      fundraisingFor: fundraisingFor || null,
      duration: duration || null,
      videoUrl: video || null,
      coverImageUrl: coverImagePath,
      galleryImages: imagePaths.length > 0 ? JSON.stringify(imagePaths) : null,
      documents: documentPaths.length > 0 ? JSON.stringify(documentPaths) : null,
      goalAmount: goalAmount.toString(),
      currency,
      minimumDonation: '0',
      chainerCommissionRate: '5.0',
      currentAmount: '0',
      status: 'active',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      data: newCampaign[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}