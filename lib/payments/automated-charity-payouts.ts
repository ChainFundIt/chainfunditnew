import { db } from '@/lib/db';
import { charityPayouts, charities, charityDonations } from '@/lib/schema';
import { eq, and, sql } from 'drizzle-orm';
import { createCharityPayout, processCharityPayout } from './charity-payouts';
import { processPaystackPayout } from './payout-processor';

/**
 * Process automated charity payouts
 * Checks for charities with pending donations above threshold and creates payouts
 */
export async function processAutomatedCharityPayouts(
  minAmount: number = 100,
  autoProcess: boolean = false
) {
  try {
    const results = {
      checked: 0,
      created: 0,
      processed: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Get all active charities with pending donations
    const activeCharities = await db.query.charities.findMany({
      where: eq(charities.isActive, true),
    });

    results.checked = activeCharities.length;

    for (const charity of activeCharities) {
      try {
        // Check if charity has banking info
        if (!charity.bankName || !charity.accountNumber || !charity.accountName) {
          results.errors.push(`Charity ${charity.name} missing banking information`);
          continue;
        }

        // Check pending amount
        const pendingDonations = await db
          .select({
            total: sql<number>`COALESCE(SUM(CAST(${charityDonations.amount} AS NUMERIC)), 0)`,
            count: sql<number>`COUNT(*)`,
          })
          .from(charityDonations)
          .where(
            and(
              eq(charityDonations.charityId, charity.id),
              eq(charityDonations.paymentStatus, 'completed'),
              eq(charityDonations.payoutStatus, 'pending')
            )
          );

        const pendingAmount = parseFloat(pendingDonations[0]?.total?.toString() || '0');
        const donationCount = parseInt(pendingDonations[0]?.count?.toString() || '0');

        if (pendingAmount < minAmount || donationCount === 0) {
          continue; // Not enough for payout
        }

        // Check if there's already a pending payout for this charity
        const existingPayout = await db.query.charityPayouts.findFirst({
          where: and(
            eq(charityPayouts.charityId, charity.id),
            eq(charityPayouts.status, 'pending')
          ),
        });

        if (existingPayout) {
          // Skip if there's already a pending payout
          continue;
        }

        // Create payout
        const payoutResult = await createCharityPayout({
          charityId: charity.id,
          minAmount,
        });

        if (!payoutResult.success) {
          results.errors.push(
            `Failed to create payout for ${charity.name}: ${payoutResult.error}`
          );
          continue;
        }

        results.created++;

        // If autoProcess is enabled, process the payout immediately
        if (autoProcess && payoutResult.payoutId) {
          try {
            // Update status to processing first
            await db
              .update(charityPayouts)
              .set({
                status: 'processing',
              })
              .where(eq(charityPayouts.id, payoutResult.payoutId));

            // Attempt to process via Paystack
            const payout = await db.query.charityPayouts.findFirst({
              where: eq(charityPayouts.id, payoutResult.payoutId),
            });

            if (payout) {
              // Use Paystack to process the transfer
              // This would call the actual Paystack transfer API
              // For now, we'll mark it as processing
              // TODO: Implement actual Paystack transfer processing
              results.processed++;
            }
          } catch (processError) {
            // Mark as failed if processing error occurs
            await processCharityPayout(
              payoutResult.payoutId,
              'failed',
              processError instanceof Error ? processError.message : 'Unknown error'
            );
            results.failed++;
            results.errors.push(
              `Failed to process payout for ${charity.name}: ${processError instanceof Error ? processError.message : 'Unknown error'}`
            );
          }
        }
      } catch (charityError) {
        results.errors.push(
          `Error processing charity ${charity.name}: ${charityError instanceof Error ? charityError.message : 'Unknown error'}`
        );
      }
    }

    return {
      success: true,
      results,
      summary: {
        charitiesChecked: results.checked,
        payoutsCreated: results.created,
        payoutsProcessed: results.processed,
        payoutsFailed: results.failed,
        totalErrors: results.errors.length,
      },
    };
  } catch (error) {
    console.error('Error in processAutomatedCharityPayouts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

