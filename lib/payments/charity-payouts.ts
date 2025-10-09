import { db } from '@/lib/db';
import { 
  charities, 
  charityDonations, 
  charityPayouts,
  type NewCharityPayout
} from '@/lib/schema/charities';
import { eq, and, sql } from 'drizzle-orm';

/**
 * Service for managing charity payouts
 */

export interface PayoutOptions {
  charityId: string;
  minAmount?: number;
  includePendingOnly?: boolean;
}

export interface BatchPayoutResult {
  success: boolean;
  payoutId?: string;
  amount: number;
  donationCount: number;
  error?: string;
}

/**
 * Calculate pending payout amount for a charity
 */
export async function calculatePendingPayout(charityId: string): Promise<number> {
  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(CAST(${charityDonations.amount} AS NUMERIC)), 0)`,
    })
    .from(charityDonations)
    .where(
      and(
        eq(charityDonations.charityId, charityId),
        eq(charityDonations.paymentStatus, 'completed'),
        eq(charityDonations.payoutStatus, 'pending')
      )
    );

  return Number(result[0]?.total || 0);
}

/**
 * Get all pending donations for a charity
 */
export async function getPendingDonations(charityId: string) {
  return await db.query.charityDonations.findMany({
    where: and(
      eq(charityDonations.charityId, charityId),
      eq(charityDonations.paymentStatus, 'completed'),
      eq(charityDonations.payoutStatus, 'pending')
    ),
    orderBy: (charityDonations, { asc }) => [asc(charityDonations.createdAt)],
  });
}

/**
 * Create a batch payout for a charity
 */
export async function createCharityPayout(
  options: PayoutOptions
): Promise<BatchPayoutResult> {
  try {
    const { charityId, minAmount = 100 } = options;

    // Get charity details
    const charity = await db.query.charities.findFirst({
      where: eq(charities.id, charityId),
    });

    if (!charity) {
      return {
        success: false,
        amount: 0,
        donationCount: 0,
        error: 'Charity not found',
      };
    }

    if (!charity.isActive) {
      return {
        success: false,
        amount: 0,
        donationCount: 0,
        error: 'Charity is not active',
      };
    }

    // Verify banking information
    if (!charity.bankName || !charity.accountNumber || !charity.accountName) {
      return {
        success: false,
        amount: 0,
        donationCount: 0,
        error: 'Charity banking information is incomplete',
      };
    }

    // Get pending donations
    const pendingDonations = await getPendingDonations(charityId);

    if (pendingDonations.length === 0) {
      return {
        success: false,
        amount: 0,
        donationCount: 0,
        error: 'No pending donations found',
      };
    }

    // Calculate total amount
    const totalAmount = pendingDonations.reduce(
      (sum, donation) => sum + Number(donation.amount),
      0
    );

    if (totalAmount < minAmount) {
      return {
        success: false,
        amount: totalAmount,
        donationCount: pendingDonations.length,
        error: `Total amount (${totalAmount}) is below minimum payout threshold (${minAmount})`,
      };
    }

    // Create payout record
    const donationIds = pendingDonations.map(d => d.id);
    const reference = `PAYOUT-${Date.now()}-${charityId.substring(0, 8)}`;

    const newPayout: NewCharityPayout = {
      charityId,
      amount: totalAmount.toString(),
      currency: charity.country === 'Nigeria' ? 'NGN' : 'USD',
      status: 'pending',
      paymentMethod: 'bank_transfer',
      bankName: charity.bankName,
      accountNumber: charity.accountNumber,
      accountName: charity.accountName,
      donationIds,
      reference,
    };

    const [payout] = await db
      .insert(charityPayouts)
      .values(newPayout)
      .returning();

    // Update donations status
    await db
      .update(charityDonations)
      .set({
        payoutStatus: 'processing',
        payoutReference: reference,
        updatedAt: new Date(),
      })
      .where(
        sql`${charityDonations.id} = ANY(${donationIds})`
      );

    // Update charity pending amount
    await db
      .update(charities)
      .set({
        pendingAmount: sql`CAST(${charities.pendingAmount} AS NUMERIC) + CAST(${totalAmount} AS NUMERIC)`,
        updatedAt: new Date(),
      })
      .where(eq(charities.id, charityId));

    return {
      success: true,
      payoutId: payout.id,
      amount: totalAmount,
      donationCount: pendingDonations.length,
    };
  } catch (error) {
    console.error('Error creating charity payout:', error);
    return {
      success: false,
      amount: 0,
      donationCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process a payout (mark as completed or failed)
 */
export async function processCharityPayout(
  payoutId: string,
  status: 'completed' | 'failed',
  failureReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payout = await db.query.charityPayouts.findFirst({
      where: eq(charityPayouts.id, payoutId),
    });

    if (!payout) {
      return { success: false, error: 'Payout not found' };
    }

    if (payout.status !== 'pending' && payout.status !== 'processing') {
      return { success: false, error: 'Payout has already been processed' };
    }

    // Update payout status
    await db
      .update(charityPayouts)
      .set({
        status,
        failureReason,
        processedAt: status === 'completed' ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(charityPayouts.id, payoutId));

    if (status === 'completed') {
      // Update donations
      if (payout.donationIds && payout.donationIds.length > 0) {
        await db
          .update(charityDonations)
          .set({
            payoutStatus: 'completed',
            paidOutAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            sql`${charityDonations.id} = ANY(${payout.donationIds})`
          );
      }

      // Update charity totals
      await db
        .update(charities)
        .set({
          totalPaidOut: sql`CAST(${charities.totalPaidOut} AS NUMERIC) + CAST(${payout.amount} AS NUMERIC)`,
          pendingAmount: sql`CAST(${charities.pendingAmount} AS NUMERIC) - CAST(${payout.amount} AS NUMERIC)`,
          updatedAt: new Date(),
        })
        .where(eq(charities.id, payout.charityId));
    } else if (status === 'failed') {
      // Revert donations to pending
      if (payout.donationIds && payout.donationIds.length > 0) {
        await db
          .update(charityDonations)
          .set({
            payoutStatus: 'pending',
            payoutReference: null,
            updatedAt: new Date(),
          })
          .where(
            sql`${charityDonations.id} = ANY(${payout.donationIds})`
          );
      }

      // Revert charity pending amount
      await db
        .update(charities)
        .set({
          pendingAmount: sql`CAST(${charities.pendingAmount} AS NUMERIC) - CAST(${payout.amount} AS NUMERIC)`,
          updatedAt: new Date(),
        })
        .where(eq(charities.id, payout.charityId));
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing charity payout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get charities eligible for payout
 */
export async function getCharitiesEligibleForPayout(
  minAmount: number = 100
): Promise<Array<{ charity: any; pendingAmount: number; donationCount: number }>> {
  const eligibleCharities = [];

  // Get all active charities
  const activeCharities = await db.query.charities.findMany({
    where: and(
      eq(charities.isActive, true),
      sql`${charities.bankName} IS NOT NULL AND ${charities.accountNumber} IS NOT NULL`
    ),
  });

  for (const charity of activeCharities) {
    const pendingAmount = await calculatePendingPayout(charity.id);
    
    if (pendingAmount >= minAmount) {
      const donations = await getPendingDonations(charity.id);
      eligibleCharities.push({
        charity,
        pendingAmount,
        donationCount: donations.length,
      });
    }
  }

  return eligibleCharities;
}

/**
 * Batch process payouts for all eligible charities
 */
export async function processBatchPayouts(
  minAmount: number = 100
): Promise<Array<BatchPayoutResult & { charityName: string }>> {
  const eligible = await getCharitiesEligibleForPayout(minAmount);
  const results = [];

  for (const { charity } of eligible) {
    const result = await createCharityPayout({
      charityId: charity.id,
      minAmount,
    });

    results.push({
      ...result,
      charityName: charity.name,
    });
  }

  return results;
}

