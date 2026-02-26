import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recurringDonations } from '@/lib/schema/recurring-donations';
import { eq, and, ne } from 'drizzle-orm';
import { cancelStripeSubscription } from '@/lib/payments/stripe-subscriptions';

/**
 * POST /api/admin/donations/disable-other-recurring
 *
 * After identifying the successful recurring donation (e.g. the one that was
 * backfilled or has totalDonations > 0), call this to cancel the other
 * duplicate attempts (same campaign + donor, Stripe).
 *
 * Body: { recurringDonationId?: string, stripeSubscriptionId?: string }
 * - recurringDonationId: our DB id of the recurring donation to KEEP (successful one).
 * - stripeSubscriptionId: Stripe subscription id of the one to KEEP (sub_xxx).
 *
 * All other recurring donations for the same campaign + donor (Stripe) will be:
 * 1. Cancelled in Stripe (immediately).
 * 2. Marked as cancelled in our DB (status=cancelled, isActive=false).
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

    // Resolve the "keeper" recurring donation to get campaignId + donorId
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
        { success: false, error: 'This endpoint only disables other Stripe recurring donations' },
        { status: 400 }
      );
    }

    // All other recurring donations: same campaign, same donor, Stripe, different id
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
    const errors: string[] = [];

    for (const other of others) {
      try {
        if (other.stripeSubscriptionId) {
          await cancelStripeSubscription(other.stripeSubscriptionId, true);
        }
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
      } catch (e: any) {
        errors.push(`${other.id}: ${e?.message ?? 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      kept: { id: keeper.id, stripeSubscriptionId: keeper.stripeSubscriptionId },
      disabledCount: disabled.length,
      disabledIds: disabled,
      errors: errors.length ? errors : undefined,
      message:
        disabled.length > 0
          ? `Disabled ${disabled.length} other recurring donation(s). Kept ${keeper.id}.`
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
