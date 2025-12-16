import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema/campaigns';
import { users } from '@/lib/schema/users';
import { eq } from 'drizzle-orm';
import { getSupportedProviders } from '@/lib/payments/config';
import { validateCampaignForDonations } from '@/lib/utils/campaign-validation';
import { normalizePeriod, isRecurringPeriod } from '@/lib/utils/recurring-donations';
import { createRecurringDonationSubscription } from '@/lib/services/subscription-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      amount,
      currency,
      paymentProvider,
      period,
      message,
      isAnonymous,
      donorName,
      donorPhone,
      authorizationCode, // For Paystack initial authorization
    } = body;

    // Validate required fields
    if (!campaignId || !amount || !currency || !paymentProvider || !period) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate period is recurring
    if (!isRecurringPeriod(period)) {
      return NextResponse.json(
        { success: false, error: 'Period must be monthly, quarterly, or yearly' },
        { status: 400 }
      );
    }

    // Validate payment provider is supported for currency
    const supportedProviders = getSupportedProviders(currency);
    if (!supportedProviders.includes(paymentProvider)) {
      return NextResponse.json(
        { success: false, error: `${paymentProvider} does not support ${currency}` },
        { status: 400 }
      );
    }

    const normalizedDonorName =
      (typeof donorName === "string" && donorName.trim()) ? donorName.trim() : undefined;

    // Get authenticated user or create guest user
    const userEmail = await getUserFromRequest(request);
    let user;
    
    if (userEmail) {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (!userResult.length) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      user = userResult[0];
    } else {
      // For recurring donations, we need a real user account
      return NextResponse.json(
        { success: false, error: 'You must be logged in to set up recurring donations' },
        { status: 401 }
      );
    }

    // Validate campaign can accept donations
    const campaignValidation = await validateCampaignForDonations(campaignId);
    
    if (!campaignValidation.canAcceptDonations) {
      return NextResponse.json(
        { 
          success: false, 
          error: campaignValidation.reason || 'Campaign cannot accept donations',
        },
        { status: 400 }
      );
    }

    const campaign = campaignValidation.campaign;

    // Check minimum donation amount
    const minDonation = parseFloat(campaign.minimumDonation);
    if (amount < minDonation) {
      return NextResponse.json(
        { success: false, error: `Minimum donation amount is ${campaign.currency} ${minDonation}` },
        { status: 400 }
      );
    }

    // Create subscription
    const result = await createRecurringDonationSubscription({
      campaignId,
      donorId: user.id,
      amount,
      currency,
      period,
      paymentMethod: paymentProvider,
      donorEmail: user.email!,
      donorName: (isAnonymous ? undefined : (normalizedDonorName || user.fullName || undefined)),
      message,
      isAnonymous: isAnonymous || false,
      authorizationCode,
    });

    return NextResponse.json({
      success: true,
      subscriptionId: result.subscription.id,
      clientSecret: result.clientSecret,
      authorizationUrl: result.authorizationUrl,
      provider: paymentProvider,
    });

  } catch (error: any) {
    console.error('Error initializing subscription:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

