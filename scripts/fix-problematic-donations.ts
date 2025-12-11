#!/usr/bin/env tsx
/**
 * Script to fix problematic donations before recalculating campaign amounts
 * 
 * This script:
 * 1. Finds donations with verification issues (abandoned, not found, test/live mismatches)
 * 2. Marks abandoned payments as 'failed'
 * 3. Marks payments not found as 'failed' (or flags them for review)
 * 4. Provides a report of changes
 * 
 * Usage:
 *   npx tsx scripts/fix-problematic-donations.ts --dry-run          # Show what would change
 *   npx tsx scripts/fix-problematic-donations.ts                    # Actually fix donations
 *   npx tsx scripts/fix-problematic-donations.ts --campaign-id <id>  # Fix specific campaign
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create database connection
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/schema';

const sql = neon(process.env.DATABASE_URL, {
  arrayMode: false,
  fullResults: false,
});

const db = drizzle(sql, { schema });

import { campaigns } from '../lib/schema/campaigns';
import { donations } from '../lib/schema/donations';
import { eq, and, inArray } from 'drizzle-orm';

// Import payment verification functions
const getPaystackVerification = async () => {
  const { verifyPaystackPayment } = await import('../lib/payments/paystack');
  return verifyPaystackPayment;
};

const getStripeVerification = async () => {
  const { getStripePaymentIntent } = await import('../lib/payments/stripe');
  return getStripePaymentIntent;
};

interface ProblematicDonation {
  donationId: string;
  campaignId: string;
  campaignTitle: string;
  amount: string;
  paymentMethod: string;
  paymentIntentId: string | null;
  issue: 'abandoned' | 'not_found' | 'test_live_mismatch' | 'test_not_found';
  error: string;
  action: 'mark_failed' | 'review_required';
}

async function verifyDonationPayment(
  donation: { id: string; paymentMethod: string; paymentIntentId: string | null }
): Promise<{ verified: boolean; error?: string; issue?: 'abandoned' | 'not_found' | 'test_live_mismatch' | 'test_not_found' }> {
  if (!donation.paymentIntentId) {
    return { verified: false, error: 'No payment reference found', issue: 'not_found' };
  }

  const isTestPayment = donation.paymentIntentId.includes('_test_') || 
                        donation.paymentIntentId.startsWith('pi_test_') ||
                        donation.paymentIntentId.includes('test_completed');

  try {
    if (donation.paymentMethod === 'paystack') {
      const verifyPaystackPayment = await getPaystackVerification();
      const verification = await verifyPaystackPayment(donation.paymentIntentId);
      
      if (verification.status && verification.data.status === 'success') {
        return { verified: true };
      } else {
        const status = verification.data?.status || 'unknown';
        if (status === 'abandoned') {
          return { verified: false, error: 'Payment was abandoned (never completed)', issue: 'abandoned' };
        }
        return { verified: false, error: `Paystack status: ${status}`, issue: 'not_found' };
      }
    } else if (donation.paymentMethod === 'stripe') {
      const getStripePaymentIntent = await getStripeVerification();
      const paymentIntent = await getStripePaymentIntent(donation.paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return { verified: true };
      } else {
        return { verified: false, error: `Stripe status: ${paymentIntent.status}`, issue: 'not_found' };
      }
    } else {
      return { verified: false, error: `Unknown payment method: ${donation.paymentMethod}`, issue: 'not_found' };
    }
  } catch (error: any) {
    // Check if it's a test/live mode mismatch
    const isTestLiveMismatch = error?.message?.includes('test mode') && 
                               error?.message?.includes('live mode key');
    
    if (isTestLiveMismatch) {
      return { 
        verified: false, 
        error: 'Test payment with live key (or vice versa)',
        issue: 'test_live_mismatch'
      };
    }

    // Check if it's a not found error for test payments
    if (error?.code === 'resource_missing' && isTestPayment) {
      return { 
        verified: false, 
        error: 'Test payment not found',
        issue: 'test_not_found'
      };
    }

    // Check for Paystack transaction not found
    if (error?.response?.data?.code === 'transaction_not_found' || 
        error?.response?.data?.message?.includes('Transaction reference not found')) {
      return { verified: false, error: 'Transaction not found', issue: 'not_found' };
    }
    
    // Check if payment intent not found
    if (error?.message?.includes('No such payment_intent')) {
      return { verified: false, error: 'Payment intent not found', issue: isTestPayment ? 'test_not_found' : 'not_found' };
    }
    
    return { verified: false, error: error?.message || 'Unknown error', issue: 'not_found' };
  }
}

async function fixProblematicDonations(options: {
  campaignId?: string;
  dryRun?: boolean;
}): Promise<void> {
  console.log('🔧 Fix Problematic Donations Script');
  console.log('====================================\n');

  if (options.dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  try {
    // Get all completed donations
    const whereConditions = options.campaignId
      ? and(
          eq(donations.paymentStatus, 'completed'),
          eq(donations.campaignId, options.campaignId)
        )
      : eq(donations.paymentStatus, 'completed');

    if (options.campaignId) {
      console.log(`📋 Checking donations for campaign: ${options.campaignId}\n`);
    } else {
      console.log('📋 Checking all completed donations...\n');
    }

    const allDonations = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
        amount: donations.amount,
        convertedAmount: donations.convertedAmount,
        paymentMethod: donations.paymentMethod,
        paymentIntentId: donations.paymentIntentId,
        paymentStatus: donations.paymentStatus,
      })
      .from(donations)
      .where(whereConditions);

    console.log(`Found ${allDonations.length} completed donation(s) to verify...\n`);

    const problematic: ProblematicDonation[] = [];

    // Verify each donation
    for (let i = 0; i < allDonations.length; i++) {
      const donation = allDonations[i];
      const progress = `[${i + 1}/${allDonations.length}]`;
      
      try {
        const verification = await verifyDonationPayment({
          id: donation.id,
          paymentMethod: donation.paymentMethod,
          paymentIntentId: donation.paymentIntentId,
        });

        if (!verification.verified && verification.issue) {
          // Get campaign title
          const campaign = await db
            .select({ title: campaigns.title })
            .from(campaigns)
            .where(eq(campaigns.id, donation.campaignId))
            .limit(1);

          const action = verification.issue === 'abandoned' || 
                        verification.issue === 'not_found' || 
                        verification.issue === 'test_not_found'
                        ? 'mark_failed'
                        : 'review_required';

          problematic.push({
            donationId: donation.id,
            campaignId: donation.campaignId,
            campaignTitle: campaign[0]?.title || 'Unknown',
            amount: donation.convertedAmount || donation.amount,
            paymentMethod: donation.paymentMethod,
            paymentIntentId: donation.paymentIntentId,
            issue: verification.issue,
            error: verification.error || 'Unknown error',
            action,
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`${progress} Error verifying donation ${donation.id}:`, error);
      }
    }

    if (problematic.length === 0) {
      console.log('✅ No problematic donations found! All donations are valid.\n');
      return;
    }

    // Display problematic donations
    console.log(`\n⚠️  Found ${problematic.length} problematic donation(s):\n`);
    console.log('Donation ID'.padEnd(40), 'Campaign'.padEnd(30), 'Amount'.padEnd(15), 'Issue'.padEnd(20), 'Action');
    console.log('-'.repeat(120));

    const toMarkFailed: ProblematicDonation[] = [];
    const toReview: ProblematicDonation[] = [];

    for (const donation of problematic) {
      const actionIcon = donation.action === 'mark_failed' ? '❌' : '⚠️';
      console.log(
        donation.donationId.substring(0, 38).padEnd(40),
        (donation.campaignTitle || 'N/A').substring(0, 28).padEnd(30),
        donation.amount.padEnd(15),
        donation.issue.padEnd(20),
        `${actionIcon} ${donation.action}`
      );

      if (donation.action === 'mark_failed') {
        toMarkFailed.push(donation);
      } else {
        toReview.push(donation);
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log(`   ❌ Will mark as failed: ${toMarkFailed.length} donation(s)`);
    console.log(`   ⚠️  Requires review: ${toReview.length} donation(s)`);

    if (toMarkFailed.length > 0) {
      console.log('\n❌ Donations to mark as failed:');
      for (const donation of toMarkFailed) {
        console.log(`   - ${donation.donationId} (${donation.campaignTitle}): ${donation.error}`);
      }
    }

    if (toReview.length > 0) {
      console.log('\n⚠️  Donations requiring review:');
      for (const donation of toReview) {
        console.log(`   - ${donation.donationId} (${donation.campaignTitle}): ${donation.error}`);
        console.log(`     Issue: ${donation.issue} - May be valid but in different mode`);
      }
    }

    if (!options.dryRun && toMarkFailed.length > 0) {
      console.log('\n🔧 Marking donations as failed...\n');

      for (const donation of toMarkFailed) {
        try {
          await db
            .update(donations)
            .set({
              paymentStatus: 'failed',
              lastStatusUpdate: new Date(),
              failureReason: donation.error,
            })
            .where(eq(donations.id, donation.donationId));

          console.log(`   ✅ Marked ${donation.donationId.substring(0, 8)}... as failed: ${donation.error}`);
        } catch (error) {
          console.error(`   ❌ Error marking ${donation.donationId}:`, error);
        }
      }

      console.log(`\n✅ Successfully marked ${toMarkFailed.length} donation(s) as failed.`);
      console.log('\n💡 Next step: Run the campaign amount fix script to recalculate amounts.');
      console.log('   npx tsx scripts/fix-campaign-amounts.ts --verify-payments\n');
    } else if (options.dryRun) {
      console.log('\n⚠️  This was a dry run. Run without --dry-run to apply changes.\n');
    } else {
      console.log('\n✅ No donations need to be marked as failed.\n');
    }

  } catch (error) {
    console.error('❌ Error fixing problematic donations:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: {
  campaignId?: string;
  dryRun?: boolean;
} = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--campaign-id' && args[i + 1]) {
    options.campaignId = args[i + 1];
    i++;
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  }
}

// Run the script
fixProblematicDonations(options).catch(console.error);
