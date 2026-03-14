import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recurringDonations } from '@/lib/schema/recurring-donations';
import { eq, and, ne } from 'drizzle-orm';
/**
 * POST /api/admin/donations/disable-other-recurring
 *
 * Legacy endpoint for Stripe recurring donations. Stripe is no longer supported.
 * Mark duplicate recurring donations (same campaign + donor) as cancelled in DB only.
 *
 * Body: { recurringDonationId?: string, stripeSubscriptionId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { recurringDonationId, stripeSubscriptionId } = body;

    if (!recurringDonationId && !stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Provide recurringDonationId or stripeSubscriptionId (the successful one to keep)' },
        { status: 400 }
      );
    }

    let keeper = recurringDonationId
      ? await db.query.recurringDonations.findFirst({
          where: eq(recurringDonations.id, recurringDonationId),
        })
      : await db.query.recurringDonations.findFirst({
          where: eq(recurringDonations.stripeSubscriptionId, stripeSubscriptionId),
        });

    if (!keeper) {
      return NextResponse.json(
        { success: false, error: 'Recurring donation not found for the given id/subscription' },
        { status: 404 }
      );
    }

    if (keeper.paymentMethod !== 'stripe') {
      return NextResponse.json(
        { success: false, error: 'This endpoint only applies to Stripe recurring donations (legacy)' },
        { status: 400 }
      );
    }

    const others = await db
      .select({
        id: recurringDonations.id,
        stripeSubscriptionId: recurringDonations.stripeSubscriptionId,
        status: recurringDonations.status,
      })
      .from(recurringDonations)
      .where(
        and(
          eq(recurringDonations.campaignId, keeper.campaignId),
          eq(recurringDonations.donorId, keeper.donorId),
          eq(recurringDonations.paymentMethod, 'stripe'),
          ne(recurringDonations.id, keeper.id)
        )
      );

    const disabled: string[] = [];
    for (const other of others) {
      await db
        .update(recurringDonations)
        .set({
          status: 'cancelled',
          isActive: false,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(recurringDonations.id, other.id));
      disabled.push(other.id);
    }

    return NextResponse.json({
      success: true,
      kept: { id: keeper.id, stripeSubscriptionId: keeper.stripeSubscriptionId },
      disabledCount: disabled.length,
      disabledIds: disabled,
      message:
        disabled.length > 0
          ? `Marked ${disabled.length} other Stripe recurring donation(s) as cancelled. Kept ${keeper.id}. (Stripe API no longer called.)`
          : others.length === 0
            ? 'No other recurring donations found for this campaign + donor.'
            : 'No subscriptions were disabled.',
    });
  } catch (error: any) {
    console.error('Disable other recurring error:', error);
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Request failed' },
      { status: 500 }
    );
  }
}
