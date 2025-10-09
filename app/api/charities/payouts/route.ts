import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  charityPayouts, 
  charityDonations, 
  charities,
  type NewCharityPayout 
} from '@/lib/schema/charities';
import { eq, and, sql } from 'drizzle-orm';

/**
 * GET /api/charities/payouts
 * Get all charity payouts (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const charityId = searchParams.get('charityId');

    // Build where conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(charityPayouts.status, status));
    }
    if (charityId) {
      conditions.push(eq(charityPayouts.charityId, charityId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const payouts = await db.query.charityPayouts.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (charityPayouts, { desc }) => [desc(charityPayouts.createdAt)],
      with: {
        charity: true,
      },
    });

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error('Error fetching charity payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/charities/payouts
 * Create a payout for a charity (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { charityId, amount, currency, donationIds } = body;

    // Verify charity exists and has banking information
    const charity = await db.query.charities.findFirst({
      where: eq(charities.id, charityId),
    });

    if (!charity) {
      return NextResponse.json(
        { error: 'Charity not found' },
        { status: 404 }
      );
    }

    if (!charity.bankName || !charity.accountNumber) {
      return NextResponse.json(
        { error: 'Charity banking information not configured' },
        { status: 400 }
      );
    }

    // Verify donations exist and are eligible for payout
    if (donationIds && donationIds.length > 0) {
      const donations = await db.query.charityDonations.findMany({
        where: and(
          eq(charityDonations.charityId, charityId),
          eq(charityDonations.paymentStatus, 'completed'),
          eq(charityDonations.payoutStatus, 'pending')
        ),
      });

      const validDonationIds = donations.map(d => d.id);
      const invalidIds = donationIds.filter((id: string) => !validDonationIds.includes(id));

      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: `Invalid or ineligible donation IDs: ${invalidIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Create payout record
    const newPayout: NewCharityPayout = {
      charityId,
      amount,
      currency: currency || 'USD',
      status: 'pending',
      paymentMethod: body.paymentMethod || 'bank_transfer',
      bankName: charity.bankName,
      accountNumber: charity.accountNumber,
      accountName: charity.accountName,
      donationIds: donationIds || [],
      reference: `PAYOUT-${Date.now()}-${charityId.substring(0, 8)}`,
    };

    const [payout] = await db
      .insert(charityPayouts)
      .values(newPayout)
      .returning();

    // Update donation payout status if donation IDs provided
    if (donationIds && donationIds.length > 0) {
      await db
        .update(charityDonations)
        .set({
          payoutStatus: 'processing',
          payoutReference: payout.reference,
        })
        .where(
          and(
            eq(charityDonations.charityId, charityId),
            sql`${charityDonations.id} = ANY(${donationIds})`
          )
        );
    }

    return NextResponse.json({
      message: 'Payout created successfully',
      payout,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating charity payout:', error);
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    );
  }
}

