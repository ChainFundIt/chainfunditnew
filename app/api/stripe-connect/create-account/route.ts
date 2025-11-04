import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { createStripeConnectAccount, createStripeAccountLink } from '@/lib/payments/stripe';

export const runtime = 'nodejs';

/**
 * POST /api/stripe-connect/create-account
 * Create a Stripe Connect account for the user
 */
export async function POST(request: NextRequest) {
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

    // Check if user already has a Stripe account
    if (userData.stripeAccountId) {
      return NextResponse.json({
        success: true,
        accountId: userData.stripeAccountId,
        message: 'Stripe account already exists',
      });
    }

    // Create Stripe Connect account
    const account = await createStripeConnectAccount(
      userData.email,
      userData.countryCode || 'US',
      'express'
    );

    // Save account ID to user
    await db
      .update(users)
      .set({
        stripeAccountId: account.id,
        stripeAccountReady: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userData.id));

    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accountLink = await createStripeAccountLink(
      account.id,
      `${baseUrl}/settings?stripe_refresh=true`,
      `${baseUrl}/settings?stripe_success=true`
    );

    return NextResponse.json({
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}

