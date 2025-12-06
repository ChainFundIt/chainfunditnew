/**
 * Script to resolve pending Paystack payments
 * 
 * This script:
 * 1. Finds all pending Paystack payments
 * 2. Verifies each payment with Paystack API
 * 3. Updates payment status based on verification result
 * 4. Updates campaign amounts for completed payments
 * 
 * Usage:
 *   npx tsx scripts/resolve-pending-paystack-payments.ts
 *   npx tsx scripts/resolve-pending-paystack-payments.ts --dry-run
 *   npx tsx scripts/resolve-pending-paystack-payments.ts --limit 50
 */

import { db } from '../lib/db';
import { donations } from '../lib/schema/donations';
import { campaigns } from '../lib/schema/campaigns';
import { eq, and, sum } from 'drizzle-orm';
import { verifyPaystackPayment } from '../lib/payments/paystack';
import { checkAndUpdateGoalReached } from '../lib/utils/campaign-validation';

interface ProcessingResult {
  donationId: string;
  reference: string | null;
  amount: string;
  currency: string;
  status: 'completed' | 'failed' | 'error' | 'skipped';
  error?: string;
  paystackStatus?: string;
}

// Helper function to update campaign currentAmount
async function updateCampaignAmount(campaignId: string) {
  try {
    const donationStats = await db
      .select({
        totalAmount: sum(donations.amount),
      })
      .from(donations)
      .where(and(
        eq(donations.campaignId, campaignId),
        eq(donations.paymentStatus, 'completed')
      ));

    const totalAmount = Number(donationStats[0]?.totalAmount || 0);

    await db
      .update(campaigns)
      .set({
        currentAmount: totalAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

    await checkAndUpdateGoalReached(campaignId);
  } catch (error) {
    console.error(`Error updating campaign ${campaignId}:`, error);
  }
}

async function resolvePendingPayments(options: { dryRun?: boolean; limit?: number } = {}) {
  const { dryRun = false, limit } = options;

  console.log('🔍 Finding pending Paystack payments...\n');

  // Get all pending Paystack donations
  let query = db
    .select()
    .from(donations)
    .where(and(
      eq(donations.paymentStatus, 'pending'),
      eq(donations.paymentMethod, 'paystack')
    ))
    .orderBy(donations.createdAt);

  const pendingDonations = await query;

  if (limit) {
    pendingDonations.splice(limit);
  }

  if (pendingDonations.length === 0) {
    console.log('✅ No pending Paystack payments found!');
    return;
  }

  console.log(`📊 Found ${pendingDonations.length} pending Paystack payment(s)\n`);

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
    console.log('Pending payments:');
    pendingDonations.forEach((donation, index) => {
      console.log(`  ${index + 1}. Donation ID: ${donation.id}`);
      console.log(`     Reference: ${donation.paymentIntentId || 'N/A'}`);
      console.log(`     Amount: ${donation.currency} ${donation.amount}`);
      console.log(`     Created: ${donation.createdAt}`);
      console.log('');
    });
    return;
  }

  const results: ProcessingResult[] = [];
  let completedCount = 0;
  let failedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  console.log('🔄 Processing payments...\n');

  for (let i = 0; i < pendingDonations.length; i++) {
    const donation = pendingDonations[i];
    const progress = `[${i + 1}/${pendingDonations.length}]`;

    console.log(`${progress} Processing donation ${donation.id}...`);

    // Skip if no payment reference
    if (!donation.paymentIntentId) {
      console.log(`  ⚠️  Skipped: No payment reference found`);
      results.push({
        donationId: donation.id,
        reference: null,
        amount: donation.amount,
        currency: donation.currency,
        status: 'skipped',
        error: 'No payment reference'
      });
      skippedCount++;
      continue;
    }

    try {
      // Verify payment with Paystack
      const verification = await verifyPaystackPayment(donation.paymentIntentId);

      if (verification.status && verification.data.status === 'success') {
        // Payment was successful
        await db
          .update(donations)
          .set({
            paymentStatus: 'completed',
            processedAt: new Date(),
            lastStatusUpdate: new Date(),
            providerStatus: 'success',
            providerError: null,
          })
          .where(eq(donations.id, donation.id));

        // Update campaign amount
        await updateCampaignAmount(donation.campaignId);

        console.log(`  ✅ Completed: Payment verified successfully`);
        results.push({
          donationId: donation.id,
          reference: donation.paymentIntentId,
          amount: donation.amount,
          currency: donation.currency,
          status: 'completed',
          paystackStatus: verification.data.status
        });
        completedCount++;
      } else {
        // Payment failed or is still pending
        const paystackStatus = verification.data?.status || 'unknown';
        const errorMessage = verification.message || 'Payment verification failed';

        await db
          .update(donations)
          .set({
            paymentStatus: 'failed',
            lastStatusUpdate: new Date(),
            providerStatus: 'failed',
            providerError: errorMessage,
          })
          .where(eq(donations.id, donation.id));

        console.log(`  ❌ Failed: ${errorMessage} (Paystack status: ${paystackStatus})`);
        results.push({
          donationId: donation.id,
          reference: donation.paymentIntentId,
          amount: donation.amount,
          currency: donation.currency,
          status: 'failed',
          paystackStatus,
          error: errorMessage
        });
        failedCount++;
      }

      // Add delay to avoid rate limiting
      if (i < pendingDonations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

    } catch (error) {
      console.error(`  💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.push({
        donationId: donation.id,
        reference: donation.paymentIntentId,
        amount: donation.amount,
        currency: donation.currency,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 PROCESSING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total processed: ${results.length}`);
  console.log(`✅ Completed: ${completedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`⚠️  Skipped: ${skippedCount}`);
  console.log(`💥 Errors: ${errorCount}`);
  console.log('='.repeat(60) + '\n');

  // Show failed payments for review
  const failedPayments = results.filter(r => r.status === 'failed' || r.status === 'error');
  if (failedPayments.length > 0) {
    console.log('⚠️  Failed/Error payments that may need manual review:');
    failedPayments.forEach((result, index) => {
      console.log(`  ${index + 1}. Donation ${result.donationId}`);
      console.log(`     Reference: ${result.reference || 'N/A'}`);
      console.log(`     Amount: ${result.currency} ${result.amount}`);
      console.log(`     Error: ${result.error || 'N/A'}`);
      console.log(`     Paystack Status: ${result.paystackStatus || 'N/A'}`);
      console.log('');
    });
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;

  try {
    await resolvePendingPayments({ dryRun, limit });
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { resolvePendingPayments };

