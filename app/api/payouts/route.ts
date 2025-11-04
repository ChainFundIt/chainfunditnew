import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';
import { campaigns, donations, users, chainers, campaignPayouts } from '@/lib/schema';
import { eq, and, sum, count, inArray, isNotNull } from 'drizzle-orm';
import { getPayoutProvider, getPayoutConfig, isPayoutSupported } from '@/lib/payments/payout-config';
import { getCurrencyCode } from '@/lib/utils/currency';
import { convertToNaira, convertFromNaira } from '@/lib/utils/currency-conversion';
import { sendPayoutConfirmationEmail } from '@/lib/payments/payout-email';
import { notifyPayoutRequest } from '@/lib/notifications/payout-request-alerts';

export async function GET(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userCampaigns = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        currency: campaigns.currency,
        targetAmount: campaigns.goalAmount,
        currentAmount: campaigns.currentAmount,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
      })
      .from(campaigns)
      .where(eq(campaigns.creatorId, user[0].id));

    const campaignIds = userCampaigns.map(c => c.id);
    const userChainerDonations = campaignIds.length > 0 ? await db
      .select({
        id: donations.id,
        amount: donations.amount,
        currency: donations.currency,
        paymentStatus: donations.paymentStatus,
        campaignId: donations.campaignId,
        campaignTitle: campaigns.title,
        campaignCurrency: campaigns.currency,
        createdAt: donations.createdAt,
        chainerId: donations.chainerId,
        chainerCommissionEarned: chainers.commissionEarned,
      })
      .from(donations)
      .leftJoin(campaigns, eq(donations.campaignId, campaigns.id))
      .leftJoin(chainers, eq(donations.chainerId, chainers.id))
      .where(and(
        inArray(donations.campaignId, campaignIds),
        eq(donations.paymentStatus, 'completed'),
        isNotNull(donations.chainerId)
      )) : [];

    const campaignsWithPayouts = await Promise.all(
      userCampaigns.map(async (campaign) => {
        // Get donations with their currencies for proper conversion
        const donationsWithCurrency = await db
          .select({
            amount: donations.amount,
            currency: donations.currency,
            paymentStatus: donations.paymentStatus,
          })
          .from(donations)
          .where(eq(donations.campaignId, campaign.id));

        const currencyCode = getCurrencyCode(campaign.currency);
        
        // Convert each donation individually to campaign currency and NGN
        let totalRaised = 0; // Total in campaign currency
        let totalRaisedInNGN = 0; // Total in NGN
        const currencyBreakdownByStatus: Record<string, { [status: string]: { amount: number; count: number } }> = {};

        donationsWithCurrency.forEach(donation => {
          const amount = parseFloat(donation.amount || '0');
          const donationCurrency = getCurrencyCode(donation.currency || 'USD');
          const status = donation.paymentStatus || 'pending';

          // Convert to NGN first (used for both calculations)
          const amountInNGN = convertToNaira(amount, donationCurrency);
          totalRaisedInNGN += amountInNGN;

          // Convert to campaign currency
          if (donationCurrency === currencyCode) {
            totalRaised += amount;
          } else {
            // Convert from NGN to campaign currency
            const amountInCampaignCurrency = convertFromNaira(amountInNGN, currencyCode);
            totalRaised += amountInCampaignCurrency;
          }

          // Track by status and currency
          if (!currencyBreakdownByStatus[donationCurrency]) {
            currencyBreakdownByStatus[donationCurrency] = {};
          }
          if (!currencyBreakdownByStatus[donationCurrency][status]) {
            currencyBreakdownByStatus[donationCurrency][status] = { amount: 0, count: 0 };
          }
          currencyBreakdownByStatus[donationCurrency][status].amount += amount;
          currencyBreakdownByStatus[donationCurrency][status].count += 1;
        });

        // Format donationsByStatus for backward compatibility
        const donationsByStatus = Object.entries(currencyBreakdownByStatus).flatMap(([currency, statuses]) =>
          Object.entries(statuses).map(([status, data]) => ({
            status,
            currency,
            total: data.amount.toString(),
            count: data.count,
          }))
        );
        
        const payoutSupported = isPayoutSupported(currencyCode);
        const payoutProvider = payoutSupported ? getPayoutProvider(currencyCode) : null;
        const payoutConfig = payoutProvider ? getPayoutConfig(payoutProvider) : null;
        
        const targetAmount = parseFloat(campaign.targetAmount);
        const goalProgress = targetAmount > 0 ? (totalRaised / targetAmount) * 100 : 0;

        const activePayouts = await db
          .select({
            id: campaignPayouts.id,
            status: campaignPayouts.status,
            requestedAmount: campaignPayouts.requestedAmount,
            createdAt: campaignPayouts.createdAt,
          })
          .from(campaignPayouts)
          .where(
            and(
              eq(campaignPayouts.campaignId, campaign.id),
              inArray(campaignPayouts.status, ['pending', 'approved', 'processing'])
            )
          )
          .limit(1);

        const hasActivePayout = activePayouts.length > 0;
        const activePayout = hasActivePayout ? activePayouts[0] : null;

        return {
          ...campaign,
          totalRaised,
          totalRaisedInNGN,
          currencyCode,
          payoutSupported,
          payoutProvider,
          payoutConfig,
          goalProgress,
          hasReached50Percent: goalProgress >= 50,
          availableForPayout: payoutSupported && totalRaised > 0 && !hasActivePayout,
          hasActivePayout,
          activePayout: activePayout ? {
            id: activePayout.id,
            status: activePayout.status,
            requestedAmount: activePayout.requestedAmount,
            createdAt: activePayout.createdAt,
          } : null,
          donationsByStatus,
        };
      })
    );

    let totalAvailableForPayout = 0;
    let totalAvailableForPayoutInNGN = 0;
    let totalRaisedInNGN = 0;
    const currencyBreakdown: { [key: string]: number } = {};

    campaignsWithPayouts.forEach(campaign => {
      if (!currencyBreakdown[campaign.currencyCode]) {
        currencyBreakdown[campaign.currencyCode] = 0;
      }
      currencyBreakdown[campaign.currencyCode] += campaign.totalRaised;
      
      totalRaisedInNGN += campaign.totalRaisedInNGN;
      
      if (campaign.availableForPayout) {
        totalAvailableForPayout += campaign.totalRaised;
        totalAvailableForPayoutInNGN += campaign.totalRaisedInNGN;
      }
    });

    const chainerDonationsTotal = userChainerDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const chainerDonationsInNGN = userChainerDonations.reduce((sum, d) => {
      const currencyCode = getCurrencyCode(d.currency);
      return sum + convertToNaira(parseFloat(d.amount), currencyCode);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaignsWithPayouts,
        chainerDonations: userChainerDonations,
        totalAvailableForPayout,
        totalAvailableForPayoutInNGN,
        totalRaisedInNGN,
        chainerDonationsTotal,
        chainerDonationsInNGN,
        currencyBreakdown,
        summary: {
          totalCampaigns: campaignsWithPayouts.length,
          campaignsWithPayouts: campaignsWithPayouts.filter(c => c.availableForPayout).length,
          totalRaised: campaignsWithPayouts.reduce((sum, c) => sum + c.totalRaised, 0),
          totalRaisedInNGN,
          chainerDonationsCount: userChainerDonations.length,
          chainerDonationsTotal,
          chainerDonationsInNGN,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching payout data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = await getUserFromRequest(request);
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db
      .select({ 
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        accountNumber: users.accountNumber,
        bankCode: users.bankCode,
        bankName: users.bankName,
        accountName: users.accountName,
        accountVerified: users.accountVerified
      })
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { campaignId, amount, currency, payoutProvider } = body;

    if (!campaignId || !amount || !currency || !payoutProvider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const campaign = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, campaignId), eq(campaigns.creatorId, user[0].id)))
      .limit(1);

    if (!campaign.length) {
      return NextResponse.json(
        { error: 'Campaign not found or unauthorized' },
        { status: 404 }
      );
    }

    // Enforce bank account verification for Paystack payouts
    if (payoutProvider === 'paystack') {
      if (!user[0].accountVerified) {
        return NextResponse.json(
          {
            error: 'Bank account verification required',
            message: 'Please verify your bank account in settings before requesting a payout via Paystack.',
          },
          { status: 400 }
        );
      }

      if (!user[0].accountNumber || !user[0].bankCode || !user[0].accountName) {
        return NextResponse.json(
          {
            error: 'Bank account details incomplete',
            message: 'Please complete your bank account information in settings.',
          },
          { status: 400 }
        );
      }
    }

    // Enforce Stripe Connect account for Stripe payouts
    if (payoutProvider === 'stripe') {
      const userWithStripe = await db
        .select({
          stripeAccountId: users.stripeAccountId,
          stripeAccountReady: users.stripeAccountReady,
        })
        .from(users)
        .where(eq(users.id, user[0].id))
        .limit(1);

      if (!userWithStripe[0]?.stripeAccountId || !userWithStripe[0]?.stripeAccountReady) {
        return NextResponse.json(
          {
            error: 'Stripe Connect account required',
            message: 'Please link and complete your Stripe Connect account setup before requesting a payout.',
          },
          { status: 400 }
        );
      }
    }

    const existingPayouts = await db
      .select({
        id: campaignPayouts.id,
        status: campaignPayouts.status,
        requestedAmount: campaignPayouts.requestedAmount,
        createdAt: campaignPayouts.createdAt,
      })
      .from(campaignPayouts)
      .where(
        and(
          eq(campaignPayouts.campaignId, campaignId),
          inArray(campaignPayouts.status, ['pending', 'approved', 'processing'])
        )
      )
      .limit(1);

    if (existingPayouts.length > 0) {
      const existingPayout = existingPayouts[0];
      const statusMessages = {
        pending: 'A payout request is already pending approval for this campaign.',
        approved: 'A payout request has already been approved and is awaiting processing for this campaign.',
        processing: 'A payout request is currently being processed for this campaign.',
      };
      
      return NextResponse.json(
        { 
          error: statusMessages[existingPayout.status as keyof typeof statusMessages] || 
                 'An active payout request already exists for this campaign. Please wait for it to be completed or rejected before requesting another payout.',
          existingPayout: {
            id: existingPayout.id,
            status: existingPayout.status,
            requestedAmount: existingPayout.requestedAmount,
            createdAt: existingPayout.createdAt,
          }
        },
        { status: 409 } // 409 Conflict
      );
    }

    const totalDonations = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(eq(donations.campaignId, campaignId));

    const totalRaised = parseFloat(totalDonations[0]?.total || '0');
    const targetAmount = parseFloat(campaign[0].goalAmount);
    
    const goalProgress = targetAmount > 0 ? (totalRaised / targetAmount) * 100 : 0;
    
    if (totalRaised === 0) {
      return NextResponse.json(
        { error: 'Campaign has no donations - payout not available' },
        { status: 400 }
      );
    }
    
    if (amount > totalRaised) {
      return NextResponse.json(
        { error: 'Payout amount exceeds available funds' },
        { status: 400 }
      );
    }

    const currencyCode = getCurrencyCode(currency);
    const recommendedProvider = getPayoutProvider(currencyCode);
    
    if (payoutProvider !== recommendedProvider) {
      return NextResponse.json(
        { error: `Recommended payout provider for ${currencyCode} is ${recommendedProvider}` },
        { status: 400 }
      );
    }

    const calculateFees = () => {
      const baseAmount = amount;
      let feePercentage = 0;
      let fixedFee = 0;

      switch (payoutProvider) {
        case 'stripe':
          feePercentage = 0.025; // 2.5%
          fixedFee = 0.30; // $0.30
          break;
        case 'paystack':
          feePercentage = 0.015; // 1.5%
          fixedFee = 0;
          break;
        default:
          feePercentage = 0.02; // 2%
          fixedFee = 0;
      }

      const percentageFee = baseAmount * feePercentage;
      const totalFees = percentageFee + fixedFee;
      const netAmount = baseAmount - totalFees;

      return {
        totalFees,
        netAmount
      };
    };

    const fees = calculateFees();
    const payoutId = `payout_${Date.now()}`;
    const reference = `CP-${Date.now()}-${campaign[0].id.substring(0, 8)}`;
    
    console.log('Processing payout request:', {
      userId: user[0].id,
      campaignId: campaign[0].id,
      amount,
      currency: currencyCode,
      payoutProvider
    });
    
    let bankName = user[0].bankName || '';
    if (!bankName && user[0].bankCode) {
      bankName = 'Bank (Code: ' + user[0].bankCode + ')';
    }

    let savedPayout;
    try {
      const [payout] = await db
        .insert(campaignPayouts)
        .values({
          userId: user[0].id,
          campaignId: campaign[0].id,
          requestedAmount: amount.toString(),
          grossAmount: amount.toString(),
          fees: fees.totalFees.toString(),
          netAmount: fees.netAmount.toString(),
          currency: currencyCode,
          status: 'pending',
          payoutProvider,
          reference,
          bankName: user[0].bankName || null,
          accountNumber: user[0].accountNumber || null,
          accountName: user[0].accountName || null,
          bankCode: user[0].bankCode || null,
        })
        .returning();

      savedPayout = payout;
      console.log('✅ Payout request saved to database:', savedPayout.id);
    } catch (dbError) {
      console.error('❌ Failed to save payout request to database:', dbError);
      return NextResponse.json(
        { error: 'Failed to save payout request' },
        { status: 500 }
      );
    }
    
    const responseData = {
      success: true,
      data: {
        payoutId: String(savedPayout.id),
        payoutReference: String(savedPayout.reference || ''),
        amount: Number(amount),
        currency: String(currencyCode),
        provider: String(payoutProvider),
        status: String(savedPayout.status),
        estimatedDelivery: payoutProvider === 'stripe' ? '2-7 business days' : '1-3 business days',
        netAmount: Number(fees.netAmount),
        fees: Number(fees.totalFees),
        message: `Payout of ${currencyCode} ${amount} initiated via ${payoutProvider}. You will receive a confirmation email shortly.`
      }
    };
    
    try {
      JSON.stringify(responseData);
      console.log('📤 Response data is valid JSON, returning immediately');
    } catch (jsonError) {
      console.error('❌ Response data is not serializable:', jsonError);
      return NextResponse.json(
        { error: 'Failed to serialize response data' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(responseData, { 
      status: 200
    });

  } catch (error) {
    console.error('Error processing payout:', error);
    return NextResponse.json(
      { error: 'Failed to process payout' },
      { status: 500 }
    );
  }
}
