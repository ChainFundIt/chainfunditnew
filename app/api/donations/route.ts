import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq } from 'drizzle-orm';
import { validateCampaignForDonations, checkAndUpdateGoalReached } from '@/lib/utils/campaign-validation';
import { convertCurrency } from '@/lib/utils/currency-conversion';

// GET /api/donations - Get donations (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const donorId = searchParams.get('donorId');
    const donationId = searchParams.get('donationId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select().from(donations);

    // If specific donation ID is requested, get that donation
    if (donationId) {
      const donation = await db
        .select()
        .from(donations)
        .where(eq(donations.id, donationId))
        .limit(1);
      
      return NextResponse.json({
        success: true,
        data: donation,
      });
    }

    // For now, get all donations with basic pagination
    // TODO: Implement proper filtering with and() operator
    const allDonations = await query.limit(limit).offset(offset);
    
    return NextResponse.json({
      success: true,
      data: allDonations,
      pagination: {
        limit,
        offset,
        total: allDonations.length,
      },
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

// POST /api/donations - Create a new donation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      donorId,
      chainerId,
      amount,
      currency,
      paymentMethod,
      message,
      isAnonymous,
      donorName,
      donorEmail,
      donorPhone,
    } = body;

    // Validate required fields
    if (!campaignId || !donorId || !amount || !currency || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate campaign can accept donations
    const campaignValidation = await validateCampaignForDonations(campaignId);
    
    if (!campaignValidation.canAcceptDonations) {
      return NextResponse.json(
        { 
          success: false, 
          error: campaignValidation.reason || 'Campaign cannot accept donations',
          campaignStatus: campaignValidation.campaign?.status
        },
        { status: 400 }
      );
    }

    const campaign = campaignValidation.campaign;
    const campaignCurrency = campaign.currency;

    // Convert currency if needed
    let convertedAmount: number | undefined;
    let exchangeRate: number | undefined;
    let exchangeRateDate: string | undefined;

    if (currency.toUpperCase() !== campaignCurrency.toUpperCase()) {
      const conversionResult = await convertCurrency(
        parseFloat(amount.toString()),
        currency.toUpperCase(),
        campaignCurrency.toUpperCase()
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
      convertedAmount = parseFloat(amount.toString());
      exchangeRate = 1.0;
      exchangeRateDate = new Date().toISOString();
    }

    // Check minimum donation amount (use converted amount if available)
    const amountToCheck = convertedAmount || parseFloat(amount.toString());
    const minDonation = parseFloat(campaign.minimumDonation);
    if (amountToCheck < minDonation) {
      return NextResponse.json(
        { success: false, error: `Minimum donation amount is ${campaign.currency} ${minDonation}` },
        { status: 400 }
      );
    }

    const newDonation = await db.insert(donations).values({
      campaignId,
      donorId,
      chainerId,
      amount: amount.toString(),
      currency: currency.toUpperCase(),
      convertedAmount: convertedAmount ? convertedAmount.toString() : null,
      convertedCurrency: campaignCurrency.toUpperCase(),
      exchangeRate: exchangeRate ? exchangeRate.toString() : null,
      exchangeRateDate: exchangeRateDate ? new Date(exchangeRateDate) : null,
      paymentMethod,
      paymentStatus: 'pending',
      message,
      isAnonymous: isAnonymous || false,
      donorName: (isAnonymous ? null : (typeof donorName === 'string' ? donorName.trim() : null)),
      donorEmail: (typeof donorEmail === 'string' ? donorEmail.trim().toLowerCase() : null),
      donorPhone: (typeof donorPhone === 'string' ? donorPhone.trim() : null),
    }).returning();

    return NextResponse.json({
      success: true,
      data: newDonation[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create donation' },
      { status: 500 }
    );
  }
} 