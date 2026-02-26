import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { chainers } from '@/lib/schema/chainers';
import { campaigns } from '@/lib/schema/campaigns';
import { commissionPayouts } from '@/lib/schema/commission-payouts';
import { referrals } from '@/lib/schema/referrals';
import { users } from '@/lib/schema/users';
import { sendChainerDonationEmail } from '@/lib/notifications/chainer-donation-email';
import { eq, and } from 'drizzle-orm';

/**
 * Calculate and distribute commissions for a completed donation
 * This handles both direct referrals and multi-level referrals
 */
export async function calculateAndDistributeCommissions(donationId: string) {
  try {
    // Get donation details
    const donation = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
        donorId: donations.donorId,
        chainerId: donations.chainerId,
        amount: donations.amount,
        currency: donations.currency,
        donorName: donations.donorName,
        isAnonymous: donations.isAnonymous,
      })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation.length) {
      console.error('❌ Donation not found:', donationId);
      return;
    }

    const donationData = donation[0];

    // Get campaign commission rate
    const campaign = await db
      .select({
        id: campaigns.id,
        chainerCommissionRate: campaigns.chainerCommissionRate,
        creatorId: campaigns.creatorId,
        title: campaigns.title,
        slug: campaigns.slug,
      })
      .from(campaigns)
      .where(eq(campaigns.id, donationData.campaignId))
      .limit(1);

    if (!campaign.length) {
      console.error('Campaign not found:', donationData.campaignId);
      return;
    }

    const campaignData = campaign[0];
    const campaignCommissionRate = Number(campaignData.chainerCommissionRate) / 100; // Convert percentage to decimal
    const donationAmount = Number(donationData.amount);

    // If donation came through a referral (chainerId exists), use that chainer's locked-in rate
    let directReferralCommission = 0;
    if (donationData.chainerId) {
      directReferralCommission = await handleDirectReferralCommission(
        donationData.chainerId,
        donationData.campaignId,
        donationAmount,
        campaignCommissionRate,
        donationData.donorId,
        donationData.id,
        donationData.currency,
        campaignData.title,
        campaignData.slug,
        donationData.donorName,
        donationData.isAnonymous
      );
    }

    // Handle multi-level referrals (if the donor is also a chainer) — use their locked-in rate
    await handleMultiLevelReferrals(
      donationData.donorId,
      donationData.campaignId,
      donationAmount,
      campaignCommissionRate,
      donationData.id,
      donationData.currency
    );

  } catch (error) {
    console.error('💥 Error calculating commissions:', error);
  }
}

/**
 * Handle direct referral commission (the chainer who referred the donor).
 * Uses the chainer's locked-in commission rate (at chain time); fallback to campaign rate for legacy chainers.
 */
async function handleDirectReferralCommission(
  chainerId: string,
  campaignId: string,
  donationAmount: number,
  campaignCommissionRate: number,
  donorId: string,
  donationId: string,
  currency: string,
  campaignTitle: string,
  campaignSlug?: string | null,
  donorName?: string | null,
  donorIsAnonymous?: boolean
): Promise<number> {
  try {

    // Get chainer details (including their locked-in commission rate)
    const chainer = await db
      .select({
        id: chainers.id,
        userId: chainers.userId,
        commissionRate: chainers.commissionRate,
        commissionDestination: chainers.commissionDestination,
        totalRaised: chainers.totalRaised,
        totalReferrals: chainers.totalReferrals,
        commissionEarned: chainers.commissionEarned,
        referralCode: chainers.referralCode,
        userEmail: users.email,
        userName: users.fullName,
      })
      .from(chainers)
      .leftJoin(users, eq(chainers.userId, users.id))
      .where(eq(chainers.id, chainerId))
      .limit(1);

    if (!chainer.length) {
      console.error('❌ Chainer not found:', chainerId);
      return 0;
    }

    const chainerData = chainer[0];
    // Use chainer's locked-in rate (percentage at chain time); fallback to campaign rate for legacy chainers
    const chainerRateDecimal = chainerData.commissionRate != null && Number(chainerData.commissionRate) > 0
      ? Number(chainerData.commissionRate) / 100
      : campaignCommissionRate;
    const totalCommission = donationAmount * chainerRateDecimal;

    // Update chainer stats
    const newTotalRaised = Number(chainerData.totalRaised) + donationAmount;
    const newTotalReferrals = chainerData.totalReferrals + 1;
    const newCommissionEarned = Number(chainerData.commissionEarned) + totalCommission;

    await db
      .update(chainers)
      .set({
        totalRaised: newTotalRaised.toString(),
        totalReferrals: newTotalReferrals,
        commissionEarned: newCommissionEarned.toString(),
        updatedAt: new Date(),
      })
      .where(eq(chainers.id, chainerId));

    // Create commission payout record
    await db.insert(commissionPayouts).values({
      chainerId: chainerId,
      campaignId: campaignId,
      amount: totalCommission.toString(),
      currency: currency || 'USD', 
      destination: chainerData.commissionDestination,
      status: 'pending',
      notes: `Commission from donation ${donationId} via direct referral`,
    });

    // Create referral record
    await db.insert(referrals).values({
      referrerId: chainerData.userId,
      referredId: donorId,
      campaignId: campaignId,
      referralCode: chainerData.referralCode || '',
      isConverted: true,
    });

    if (chainerData.userEmail) {
      await sendChainerDonationEmail({
        chainerEmail: chainerData.userEmail,
        chainerName: chainerData.userName || 'Chain Ambassador',
        campaignTitle,
        campaignSlug: campaignSlug || undefined,
        donationAmount,
        donationCurrency: currency || 'USD',
        donorName: donorIsAnonymous ? null : donorName,
        referralCode: chainerData.referralCode,
      });
    }

    return totalCommission;
  } catch (error) {
    console.error('💥 Error processing direct referral commission:', error);
    return 0;
  }
}

/**
 * Handle multi-level referrals (if the donor is also a chainer).
 * Uses the donor chainer's locked-in commission rate for their self-referral commission.
 */
async function handleMultiLevelReferrals(
  donorId: string,
  campaignId: string,
  donationAmount: number,
  campaignCommissionRate: number,
  donationId: string,
  currency: string
) {
  try {

    // Check if the donor is also a chainer for this campaign
    const donorChainer = await db
      .select({
        id: chainers.id,
        userId: chainers.userId,
        commissionRate: chainers.commissionRate,
        commissionDestination: chainers.commissionDestination,
        totalRaised: chainers.totalRaised,
        totalReferrals: chainers.totalReferrals,
        commissionEarned: chainers.commissionEarned,
      })
      .from(chainers)
      .where(and(
        eq(chainers.userId, donorId),
        eq(chainers.campaignId, campaignId)
      ))
      .limit(1);

    if (!donorChainer.length) {
      return;
    }

    const donorChainerData = donorChainer[0];
    // Use donor chainer's locked-in rate; fallback to campaign rate for legacy
    const chainerRateDecimal = donorChainerData.commissionRate != null && Number(donorChainerData.commissionRate) > 0
      ? Number(donorChainerData.commissionRate) / 100
      : campaignCommissionRate;
    const selfReferralCommission = donationAmount * chainerRateDecimal;

    // Update donor's chainer stats
    const newTotalRaised = Number(donorChainerData.totalRaised) + donationAmount;
    const newCommissionEarned = Number(donorChainerData.commissionEarned) + selfReferralCommission;

    await db
      .update(chainers)
      .set({
        totalRaised: newTotalRaised.toString(),
        commissionEarned: newCommissionEarned.toString(),
        updatedAt: new Date(),
      })
      .where(eq(chainers.id, donorChainerData.id));

    // Create commission payout record for self-referral commission
    await db.insert(commissionPayouts).values({
      chainerId: donorChainerData.id,
      campaignId: campaignId,
      amount: selfReferralCommission.toString(),
      currency: currency || 'USD', // Include currency from donation
      destination: donorChainerData.commissionDestination,
      status: 'pending',
      notes: `Self-referral commission from donation ${donationId} (donor chained this campaign)`,
    });

  } catch (error) {
    console.error('💥 Error processing self-referral commission:', error);
  }
}

/**
 * Get commission statistics for a user
 */
export async function getUserCommissionStats(userId: string) {
  try {
    // Get all chainers for this user
    const userChainers = await db
      .select({
        id: chainers.id,
        campaignId: chainers.campaignId,
        referralCode: chainers.referralCode,
        totalRaised: chainers.totalRaised,
        totalReferrals: chainers.totalReferrals,
        commissionEarned: chainers.commissionEarned,
        commissionPaid: chainers.commissionPaid,
        createdAt: chainers.createdAt,
        campaignTitle: campaigns.title,
        campaignCoverImage: campaigns.coverImageUrl,
        campaignGoal: campaigns.goalAmount,
        campaignCurrent: campaigns.currentAmount,
        campaignCurrency: campaigns.currency,
        campaignStatus: campaigns.status,
      })
      .from(chainers)
      .leftJoin(campaigns, eq(chainers.campaignId, campaigns.id))
      .where(eq(chainers.userId, userId))
      .orderBy(chainers.createdAt);

    // Calculate totals
    const totalStats = userChainers.reduce(
      (acc, chainer) => ({
        totalChained: acc.totalChained + 1,
        totalEarnings: acc.totalEarnings + Number(chainer.commissionEarned || 0),
        totalDonations: acc.totalDonations + Number(chainer.totalRaised || 0),
        totalReferrals: acc.totalReferrals + chainer.totalReferrals,
      }),
      {
        totalChained: 0,
        totalEarnings: 0,
        totalDonations: 0,
        totalReferrals: 0,
      }
    );

    return {
      chainers: userChainers.map(chainer => ({
        ...chainer,
        totalEarnings: Number(chainer.commissionEarned || 0),
        totalDonations: Number(chainer.totalRaised || 0),
        campaignGoal: Number(chainer.campaignGoal),
        campaignCurrent: Number(chainer.campaignCurrent),
        progressPercentage: Math.min(
          100,
          Math.round((Number(chainer.campaignCurrent) / Number(chainer.campaignGoal)) * 100)
        ),
      })),
      stats: totalStats,
    };
  } catch (error) {
    console.error('💥 Error getting user commission stats:', error);
    return {
      chainers: [],
      stats: {
        totalChained: 0,
        totalEarnings: 0,
        totalDonations: 0,
        totalReferrals: 0,
      },
    };
  }
}
