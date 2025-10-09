import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  charityPayouts, 
  charityDonations,
  charities
} from '@/lib/schema/charities';
import { eq, and, sql } from 'drizzle-orm';

/**
 * GET /api/charities/payouts/[id]
 * Get a specific payout
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payout = await db.query.charityPayouts.findFirst({
      where: eq(charityPayouts.id, id),
      with: {
        charity: true,
      },
    });

    if (!payout) {
      return NextResponse.json(
        { error: 'Payout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ payout });
  } catch (error) {
    console.error('Error fetching payout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/charities/payouts/[id]
 * Update payout status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, failureReason } = body;

    const payout = await db.query.charityPayouts.findFirst({
      where: eq(charityPayouts.id, id),
    });

    if (!payout) {
      return NextResponse.json(
        { error: 'Payout not found' },
        { status: 404 }
      );
    }

    // Update payout
    const [updatedPayout] = await db
      .update(charityPayouts)
      .set({
        status,
        failureReason,
        processedAt: status === 'completed' ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(charityPayouts.id, id))
      .returning();

    // Update related donations and charity totals
    if (status === 'completed' && payout.donationIds && payout.donationIds.length > 0) {
      // Update donation statuses
      await db
        .update(charityDonations)
        .set({
          payoutStatus: 'completed',
          paidOutAt: new Date(),
        })
        .where(
          sql`${charityDonations.id} = ANY(${payout.donationIds})`
        );

      // Update charity totals
      await db
        .update(charities)
        .set({
          totalPaidOut: sql`CAST(${charities.totalPaidOut} AS NUMERIC) + CAST(${payout.amount} AS NUMERIC)`,
          pendingAmount: sql`CAST(${charities.pendingAmount} AS NUMERIC) - CAST(${payout.amount} AS NUMERIC)`,
          updatedAt: new Date(),
        })
        .where(eq(charities.id, payout.charityId));
    } else if (status === 'failed') {
      // Revert donation statuses on failure
      if (payout.donationIds && payout.donationIds.length > 0) {
        await db
          .update(charityDonations)
          .set({
            payoutStatus: 'pending',
            payoutReference: null,
          })
          .where(
            sql`${charityDonations.id} = ANY(${payout.donationIds})`
          );
      }
    }

    return NextResponse.json({
      message: 'Payout updated successfully',
      payout: updatedPayout,
    });
  } catch (error) {
    console.error('Error updating payout:', error);
    return NextResponse.json(
      { error: 'Failed to update payout' },
      { status: 500 }
    );
  }
}

