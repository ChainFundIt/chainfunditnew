import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { charities, charityDonations, type NewCharityDonation } from '@/lib/schema/charities';
import { eq } from 'drizzle-orm';

/**
 * POST /api/charities/[id]/donate
 * Create a donation to a charity
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify charity exists and is active
    const charity = await db.query.charities.findFirst({
      where: eq(charities.id, id),
    });

    if (!charity) {
      return NextResponse.json(
        { error: 'Charity not found' },
        { status: 404 }
      );
    }

    if (!charity.isActive) {
      return NextResponse.json(
        { error: 'This charity is not currently accepting donations' },
        { status: 400 }
      );
    }

    if (charity.isPaused) {
      return NextResponse.json(
        { error: 'Donations to this charity are temporarily paused' },
        { status: 400 }
      );
    }

    // Create donation record
    const newDonation: NewCharityDonation = {
      charityId: charity.id,
      donorId: body.donorId,
      donorName: body.donorName,
      donorEmail: body.donorEmail,
      amount: body.amount,
      currency: body.currency || 'USD',
      paymentMethod: body.paymentMethod,
      message: body.message,
      isAnonymous: body.isAnonymous || false,
      paymentStatus: 'pending',
      payoutStatus: 'pending',
    };

    const [donation] = await db
      .insert(charityDonations)
      .values(newDonation)
      .returning();

    return NextResponse.json({
      message: 'Donation initiated successfully',
      donation,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating charity donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/charities/[id]/donate
 * Get donations for a specific charity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const donations = await db.query.charityDonations.findMany({
      where: eq(charityDonations.charityId, id),
      limit,
      offset,
      orderBy: (charityDonations, { desc }) => [desc(charityDonations.createdAt)],
    });

    return NextResponse.json({ donations });
  } catch (error) {
    console.error('Error fetching charity donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

