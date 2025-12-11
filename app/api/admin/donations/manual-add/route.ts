import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq } from 'drizzle-orm';
import { getStripePaymentIntent } from '@/lib/payments/stripe';
import { convertCurrency } from '@/lib/utils/currency-conversion';
import { updateCampaignAmount } from '@/lib/utils/campaign-amount';
import { checkAndUpdateGoalReached } from '@/lib/utils/campaign-validation';

/**
 * POST /api/admin/donations/manual-add
 * Manually add a donation (e.g., to restore a deleted donation)
 * This endpoint allows admins to add donations with Stripe payment intent IDs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentIntentId,
      campaignId,
      donorId,
      amount,
      currency,
      createdAt,
      chainerId,
      message,
      isAnonymous,
    } = body;

    // Validate required fields
    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: paymentIntentId' },
        { status: 400 }
      );
    }

    // Verify payment intent exists in Stripe first
    let paymentIntent;
    try {
      paymentIntent = await getStripePaymentIntent(paymentIntentId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: `Failed to verify payment intent: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Verify payment was successful
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: `Payment intent status is ${paymentIntent.status}, expected 'succeeded'` },
        { status: 400 }
      );
    }

    // Extract amount and currency from payment intent if not provided
    const finalAmount = amount || (paymentIntent.amount / 100); // Stripe amounts are in cents
    const finalCurrency = currency || paymentIntent.currency.toUpperCase();
    
    // Extract campaignId from metadata if not provided
    const finalCampaignId = campaignId || paymentIntent.metadata?.campaignId;
    if (!finalCampaignId) {
      return NextResponse.json(
        { success: false, error: 'campaignId is required (not found in payment intent metadata)' },
        { status: 400 }
      );
    }

    // Check if donation already exists
    const existingDonation = await db
      .select()
      .from(donations)
      .where(eq(donations.paymentIntentId, paymentIntentId))
      .limit(1);

    if (existingDonation.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Donation with this payment intent ID already exists' },
        { status: 400 }
      );
    }

    // Use final values
    const finalDonorId = donorId || paymentIntent.metadata?.donorId;
    
    // Validate donorId is available
    if (!finalDonorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: donorId (not found in payment intent metadata)' },
        { status: 400 }
      );
    }
    
    // Get campaign to determine currency conversion
    const campaign = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, finalCampaignId))
      .limit(1);

    if (!campaign.length) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaignData = campaign[0];
    const campaignCurrency = campaignData.currency;

    // Convert currency if needed
    let convertedAmount: number | undefined;
    let exchangeRate: number | undefined;
    let exchangeRateDate: string | undefined;

    if (finalCurrency.toUpperCase() !== campaignCurrency.toUpperCase()) {
      const conversionDate = createdAt ? new Date(createdAt) : new Date(paymentIntent.created * 1000);
      const conversionResult = await convertCurrency(
        parseFloat(finalAmount.toString()),
        finalCurrency.toUpperCase(),
        campaignCurrency.toUpperCase(),
        conversionDate
      );

      if (conversionResult.success && conversionResult.convertedAmount && conversionResult.rate) {
        convertedAmount = conversionResult.convertedAmount;
        exchangeRate = conversionResult.rate;
        exchangeRateDate = conversionResult.date;
      } else {
        console.warn(`Failed to convert currency: ${conversionResult.error}`);
        // Continue without conversion - we'll store the original amount
      }
    } else {
      // Same currency, no conversion needed
      convertedAmount = parseFloat(finalAmount.toString());
      exchangeRate = 1.0;
      exchangeRateDate = new Date().toISOString();
    }

    // Create donation record
    const donationDate = createdAt ? new Date(createdAt) : new Date(paymentIntent.created * 1000);
    const processedDate = new Date(paymentIntent.created * 1000);

    const newDonation = await db
      .insert(donations)
      .values({
        campaignId: finalCampaignId,
        donorId: finalDonorId,
        chainerId: chainerId || paymentIntent.metadata?.chainerId || null,
        amount: finalAmount.toString(),
        currency: finalCurrency.toUpperCase(),
        convertedAmount: convertedAmount ? convertedAmount.toString() : null,
        convertedCurrency: campaignCurrency.toUpperCase(),
        exchangeRate: exchangeRate ? exchangeRate.toString() : null,
        exchangeRateDate: exchangeRateDate ? new Date(exchangeRateDate) : null,
        paymentStatus: 'completed',
        paymentMethod: 'stripe',
        paymentIntentId,
        message: message || null,
        isAnonymous: isAnonymous || false,
        createdAt: donationDate,
        processedAt: processedDate,
        providerStatus: paymentIntent.status,
      })
      .returning();

    // Update campaign amount
    await updateCampaignAmount(finalCampaignId);

    // Check if campaign goal was reached
    await checkAndUpdateGoalReached(finalCampaignId);

    return NextResponse.json({
      success: true,
      donation: newDonation[0],
      message: 'Donation added successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error manually adding donation:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add donation' },
      { status: 500 }
    );
  }
}
