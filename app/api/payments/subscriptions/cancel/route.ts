import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema/users';
import { recurringDonations } from '@/lib/schema/recurring-donations';
import { eq } from 'drizzle-orm';
import { cancelPaystackSubscription } from '@/lib/payments/paystack-subscriptions';
import { cancelPayPalSubscription } from '@/lib/payments/paypal';

/**
 * POST /api/payments/subscriptions/cancel
 * Cancel the authenticated user's recurring donation.
 * Body: { recurringDonationId: string, cancelImmediately?: boolean }
 * - cancelImmediately: if true, cancel now; otherwise cancel at end of billing period (default).
 */
export async function POST(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { recurringDonationId, cancelImmediately = false } = body;
    if (!recurringDonationId) {
      return NextResponse.json(
        { success: false, error: 'recurringDonationId is required' },
        { status: 400 }
      );
    }

    const subscription = await db.query.recurringDonations.findFirst({
      where: eq(recurringDonations.id, recurringDonationId),
    });
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Recurring donation not found' },
        { status: 404 }
      );
    }
    if (subscription.donorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only cancel your own recurring donations' },
        { status: 403 }
      );
    }
    if (subscription.status === 'cancelled' || !subscription.isActive) {
      return NextResponse.json(
        { success: true, message: 'Subscription is already cancelled' }
      );
    }

    if (subscription.paymentMethod === 'stripe') {
      // Stripe no longer supported - just mark as cancelled in DB
    } else if (subscription.paymentMethod === 'paystack' && subscription.paystackSubscriptionId) {
      await cancelPaystackSubscription(subscription.paystackSubscriptionId);
    } else if (subscription.paymentMethod === 'paypal' && subscription.stripeSubscriptionId) {
      await cancelPayPalSubscription(subscription.stripeSubscriptionId);
    } else {
      return NextResponse.json(
        { success: false, error: 'No payment provider subscription to cancel' },
        { status: 400 }
      );
    }

    await db
      .update(recurringDonations)
      .set({
        status: 'cancelled',
        isActive: false,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(recurringDonations.id, recurringDonationId));

    return NextResponse.json({
      success: true,
      message: cancelImmediately
        ? 'Subscription cancelled. You will not be charged again.'
        : 'Subscription will cancel at the end of the current billing period. You will not be charged again.',
    });
  } catch (error: unknown) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
