import { db } from '@/lib/db';
import { donations } from '@/lib/schema/donations';
import { campaigns } from '@/lib/schema/campaigns';
import { eq, and, sum, sql } from 'drizzle-orm';
import { checkAndUpdateGoalReached } from './campaign-validation';

/**
 * Updates the campaign's current_amount by recalculating from all completed donations.
 * This function ensures consistency by:
 * 1. Using convertedAmount when available (for currency conversions), otherwise using amount
 * 2. Only counting donations with paymentStatus = 'completed'
 * 3. Recalculating from scratch to avoid double-counting or race conditions
 * 
 * @param campaignId - The ID of the campaign to update
 * @param options - Optional configuration
 * @returns The updated current amount, or null if update failed
 */
export async function updateCampaignAmount(
  campaignId: string,
  options?: {
    checkGoalReached?: boolean; // Whether to check and update goal reached status (default: true)
  }
): Promise<number | null> {
  try {
    // Calculate total amount from completed donations
    // Use convertedAmount if available (for currency conversions), otherwise use amount
    // This ensures we always use the campaign's currency
    const donationStats = await db
      .select({
        totalAmount: sum(
          sql`COALESCE(${donations.convertedAmount}, ${donations.amount})`
        ),
      })
      .from(donations)
      .where(and(
        eq(donations.campaignId, campaignId),
        eq(donations.paymentStatus, 'completed')
      ));

    const totalAmount = Number(donationStats[0]?.totalAmount || 0);

    // Update campaign currentAmount
    await db
      .update(campaigns)
      .set({
        currentAmount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

    // Check if campaign reached its goal and update status (default: true)
    if (options?.checkGoalReached !== false) {
      await checkAndUpdateGoalReached(campaignId);
    }

    return totalAmount;
  } catch (error) {
    console.error('Error updating campaign amount:', error);
    return null;
  }
}

/**
 * Recalculates and updates the current_amount for all campaigns.
 * Useful for fixing data inconsistencies or after migrations.
 * 
 * @param campaignIds - Optional array of campaign IDs to update. If not provided, updates all campaigns.
 * @returns Object with success count, failure count, and errors
 */
export async function recalculateAllCampaignAmounts(
  campaignIds?: string[]
): Promise<{
  success: number;
  failed: number;
  errors: Array<{ campaignId: string; error: string }>;
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ campaignId: string; error: string }>,
  };

  try {
    // Get all campaigns or specific ones
    let allCampaigns;
    
    if (campaignIds && campaignIds.length > 0) {
      const { inArray } = await import('drizzle-orm');
      allCampaigns = await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(inArray(campaigns.id, campaignIds));
    } else {
      allCampaigns = await db.select({ id: campaigns.id }).from(campaigns);
    }


    for (const campaign of allCampaigns) {
      try {
        const result = await updateCampaignAmount(campaign.id, { checkGoalReached: false });
        if (result !== null) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            campaignId: campaign.id,
            error: 'Update returned null',
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          campaignId: campaign.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Now check goal reached for all campaigns (batch operation)
    if (campaignIds && campaignIds.length > 0) {
      for (const campaignId of campaignIds) {
        try {
          await checkAndUpdateGoalReached(campaignId);
        } catch (error) {
          console.error(`Error checking goal reached for campaign ${campaignId}:`, error);
        }
      }
    } else {
      // For all campaigns, we'll let the individual updateCampaignAmount calls handle it
      // since we set checkGoalReached: false above, we need to do it separately
      const allCampaignsForGoalCheck = await db.select({ id: campaigns.id }).from(campaigns);
      for (const campaign of allCampaignsForGoalCheck) {
        try {
          await checkAndUpdateGoalReached(campaign.id);
        } catch (error) {
          console.error(`Error checking goal reached for campaign ${campaign.id}:`, error);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error recalculating campaign amounts:', error);
    throw error;
  }
}
