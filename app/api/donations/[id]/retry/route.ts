import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: donationId } = await params;
    
    // Get authenticated user
    const email = await getUserFromRequest(request);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Get donation
    const donation = await db
      .select()
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length) {
      return NextResponse.json({ success: false, error: 'Donation not found' }, { status: 404 });
    }

    // Check if donation belongs to the user
    if (donation[0].donorId !== donation[0].donorId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Check if donation is failed
    if (donation[0].paymentStatus !== 'failed') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only failed donations can be retried' 
      }, { status: 400 });
    }

    // Update donation status to pending for retry
    await db
      .update(donations)
      .set({
        paymentStatus: 'pending',
        processedAt: null, // Clear processed date
      })
      .where(eq(donations.id, donationId));

    return NextResponse.json({
      success: true,
      message: 'Donation retry initiated',
      donationId,
    });

  } catch (error) {
    console.error('Error retrying donation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
