import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { createStripeAccountLink, isStripeAccountReadyForPayouts } from '@/lib/payments/stripe';

export const runtime = 'nodejs';

/**
 * GET /api/stripe-connect/account-link
 * Get or create an account link for Stripe Connect onboarding
 */
export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = user[0];

    if (!userData.stripeAccountId) {
      return NextResponse.json(
        { error: 'No Stripe account found. Please create one first.' },
        { status: 400 }
      );
    }

    // Check if account is already ready
    const isReady = await isStripeAccountReadyForPayouts(userData.stripeAccountId);
    
    if (isReady) {
      // Update user record
      await db
        .update(users)
        .set({
          stripeAccountReady: true,
          stripeAccountOnboardedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id));

      return NextResponse.json({
        success: true,
        ready: true,
        message: 'Account is ready for payouts',
      });
    }

    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accountLink = await createStripeAccountLink(
      userData.stripeAccountId,
      `${baseUrl}/dashboard/settings?stripe_refresh=true`,
      `${baseUrl}/dashboard/settings?stripe_success=true`
    );

    return NextResponse.json({
      success: true,
      ready: false,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Error getting Stripe account link:', error);
    return NextResponse.json(
      { error: 'Failed to get account link' },
      { status: 500 }
    );
  }
}

