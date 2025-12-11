#!/usr/bin/env tsx
/**
 * Script to recalculate and fix all campaign current_amount values
 * 
 * This script:
 * 1. Recalculates current_amount for all campaigns based on completed donations
 * 2. Uses convertedAmount when available (for currency conversions)
 * 3. Only counts donations with paymentStatus = 'completed'
 * 4. Provides a report of changes
 * 
 * Usage:
 *   npx tsx scripts/fix-campaign-amounts.ts
 *   npx tsx scripts/fix-campaign-amounts.ts --campaign-id <id>  # Fix specific campaign
 *   npx tsx scripts/fix-campaign-amounts.ts --dry-run          # Show what would change without making changes
 *   npx tsx scripts/fix-campaign-amounts.ts --verify-payments   # Verify payments with Paystack/Stripe before fixing
 *   npx tsx scripts/fix-campaign-amounts.ts --verify-payments --skip-verification-failures  # Verify but proceed even if some fail
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST (before importing db)
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Check if DATABASE_URL is set after loading env files
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('\nPlease ensure you have a .env.local or .env file with DATABASE_URL configured.');
  console.error('\nExample .env.local:');
  console.error('  DATABASE_URL=postgresql://user:password@host:port/database');
  process.exit(1);
}

// Create database connection directly (avoid importing lib/db which checks env at module load)
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
import { eq, and, sum, sql as sqlFn, inArray } from 'drizzle-orm';

// Import payment verification functions
const getPaystackVerification = async () => {
  const { verifyPaystackPayment } = await import('../lib/payments/paystack');
  return verifyPaystackPayment;
};

const getStripeVerification = async () => {
  const { getStripePaymentIntent } = await import('../lib/payments/stripe');
  return getStripePaymentIntent;
};

// Helper function to update campaign amount (duplicated here to avoid importing lib/db)
async function updateCampaignAmount(campaignId: string): Promise<number | null> {
  try {
    const donationStats = await db
      .select({
        totalAmount: sum(
          sqlFn`COALESCE(${donations.convertedAmount}, ${donations.amount})`
        ),
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

    return totalAmount;
  } catch (error) {
    console.error('Error updating campaign amount:', error);
    return null;
  }
}

interface CampaignAmountFix {
  campaignId: string;
  campaignTitle: string;
  oldAmount: number;
  newAmount: number;
  difference: number;
  status: 'fixed' | 'unchanged' | 'error' | 'verification_failed';
  error?: string;
  verificationResults?: {
    totalDonations: number;
    verified: number;
    failed: number;
    skipped: number;
    details: Array<{
      donationId: string;
      amount: string;
      paymentMethod: string;
      verified: boolean;
      error?: string;
      warning?: string;
    }>;
  };
}

async function verifyDonationPayment(
  donation: { id: string; paymentMethod: string; paymentIntentId: string | null; amount: string }
): Promise<{ verified: boolean; error?: string; warning?: string }> {
  if (!donation.paymentIntentId) {
    return { verified: false, error: 'No payment reference found' };
  }

  // Check for test payment IDs
  const isTestPayment = donation.paymentIntentId.includes('_test_') || 
                        donation.paymentIntentId.startsWith('pi_test_') ||
                        donation.paymentIntentId.includes('test_completed');

  try {
    if (donation.paymentMethod === 'paystack') {
      const verifyPaystackPayment = await getPaystackVerification();
      const verification = await verifyPaystackPayment(donation.paymentIntentId);
      
      if (verification.status && verification.data.status === 'success') {
        return { verified: true, warning: isTestPayment ? 'Test payment' : undefined };
      } else {
        const status = verification.data?.status || 'unknown';
        if (status === 'abandoned') {
          return { verified: false, error: 'Payment was abandoned (never completed)' };
        }
        return { verified: false, error: `Paystack status: ${status}` };
      }
    } else if (donation.paymentMethod === 'stripe') {
      const getStripePaymentIntent = await getStripeVerification();
      const paymentIntent = await getStripePaymentIntent(donation.paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return { verified: true, warning: isTestPayment ? 'Test payment' : undefined };
      } else {
        return { verified: false, error: `Stripe status: ${paymentIntent.status}` };
      }
    } else {
      return { verified: false, error: `Unknown payment method: ${donation.paymentMethod}` };
    }
  } catch (error: any) {
    // Check if it's a test/live mode mismatch for Stripe
    const isTestLiveMismatch = error?.message?.includes('test mode') && 
                               error?.message?.includes('live mode key');
    
    if (isTestLiveMismatch) {
      return { 
        verified: false, 
        error: 'Test payment with live key (or vice versa) - payment may be valid but in different mode',
        warning: 'Mode mismatch - verify manually'
      };
    }

    // Check if it's a not found error for test payments
    if (error?.code === 'resource_missing' && isTestPayment) {
      return { 
        verified: false, 
        error: 'Test payment not found - may be using wrong API key mode',
        warning: 'Test payment ID detected'
      };
    }

    // Check if it's an authentication error
    const isAuthError = error?.response?.status === 401 || 
                        error?.response?.data?.code === 'invalid_Key' ||
                        error?.message?.includes('Invalid key') ||
                        error?.message?.includes('authentication failed');
    
    if (isAuthError) {
      return { verified: false, error: 'API authentication failed - check API keys' };
    }

    // Check for Paystack transaction not found
    if (error?.response?.data?.code === 'transaction_not_found' || 
        error?.response?.data?.message?.includes('Transaction reference not found')) {
      return { verified: false, error: 'Transaction not found in Paystack - may be from different account or deleted' };
    }
    
    // Extract cleaner error message
    let errorMessage = error?.response?.data?.message || error?.message || 'Unknown verification error';
    
    // Simplify Stripe error messages
    if (errorMessage.includes('No such payment_intent')) {
      errorMessage = 'Payment intent not found in Stripe';
    }
    
    return { verified: false, error: errorMessage };
  }
}

async function fixCampaignAmounts(options: {
  campaignId?: string;
  dryRun?: boolean;
  verifyPayments?: boolean;
  skipVerificationFailures?: boolean;
}): Promise<void> {
  console.log('🔧 Campaign Amount Fix Script');
  console.log('==============================\n');

  if (options.dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  if (options.verifyPayments) {
    console.log('🔍 PAYMENT VERIFICATION ENABLED - Verifying with Paystack/Stripe API\n');
  }

  try {
    // Get campaigns to fix
    let campaignIds: string[] | undefined;
    
    if (options.campaignId) {
      campaignIds = [options.campaignId];
      console.log(`📋 Fixing campaign: ${options.campaignId}\n`);
    } else {
      console.log('📋 Fixing all campaigns...\n');
    }

    if (options.dryRun) {
      // In dry run, calculate what would change without updating
      const allCampaigns = campaignIds
        ? await db.select({ id: campaigns.id, title: campaigns.title, currentAmount: campaigns.currentAmount })
            .from(campaigns)
            .where(inArray(campaigns.id, campaignIds))
        : await db.select({ id: campaigns.id, title: campaigns.title, currentAmount: campaigns.currentAmount })
            .from(campaigns);

      const fixes: CampaignAmountFix[] = [];

      for (const campaign of allCampaigns) {
        try {
          // Get all completed donations for this campaign
          const campaignDonations = await db
            .select({
              id: donations.id,
              amount: donations.amount,
              convertedAmount: donations.convertedAmount,
              paymentMethod: donations.paymentMethod,
              paymentIntentId: donations.paymentIntentId,
            })
            .from(donations)
            .where(and(
              eq(donations.campaignId, campaign.id),
              eq(donations.paymentStatus, 'completed')
            ));

          // Verify payments if requested
          let verificationResults;
          if (options.verifyPayments && campaignDonations.length > 0) {
            console.log(`   Verifying ${campaignDonations.length} donation(s) for campaign: ${campaign.title}...`);
            
            const verificationDetails: Array<{
              donationId: string;
              amount: string;
              paymentMethod: string;
              verified: boolean;
              error?: string;
              warning?: string;
            }> = [];
            
            let verifiedCount = 0;
            let failedCount = 0;
            let skippedCount = 0;

            for (const donation of campaignDonations) {
              const verification = await verifyDonationPayment({
                id: donation.id,
                paymentMethod: donation.paymentMethod,
                paymentIntentId: donation.paymentIntentId,
                amount: donation.amount,
              });

              verificationDetails.push({
                donationId: donation.id,
                amount: donation.convertedAmount || donation.amount,
                paymentMethod: donation.paymentMethod,
                verified: verification.verified,
                error: verification.error,
                warning: verification.warning,
              });

              if (verification.verified) {
                verifiedCount++;
              } else if (verification.error?.includes('No payment reference')) {
                skippedCount++;
              } else {
                failedCount++;
              }

              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 200));
            }

            verificationResults = {
              totalDonations: campaignDonations.length,
              verified: verifiedCount,
              failed: failedCount,
              skipped: skippedCount,
              details: verificationDetails,
            };
          }

          // Calculate what the new amount should be
          const donationStats = await db
            .select({
              totalAmount: sum(
                sqlFn`COALESCE(${donations.convertedAmount}, ${donations.amount})`
              ),
            })
            .from(donations)
            .where(and(
              eq(donations.campaignId, campaign.id),
              eq(donations.paymentStatus, 'completed')
            ));

          const newAmount = Number(donationStats[0]?.totalAmount || 0);
          const oldAmount = parseFloat(campaign.currentAmount || '0');
          const difference = newAmount - oldAmount;

          // Determine status
          let status: 'fixed' | 'unchanged' | 'error' | 'verification_failed' = 
            Math.abs(difference) > 0.01 ? 'fixed' : 'unchanged';
          
          if (verificationResults && verificationResults.failed > 0) {
            if (!options.skipVerificationFailures) {
              status = 'verification_failed';
            }
          }

          fixes.push({
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            oldAmount,
            newAmount,
            difference,
            status,
            verificationResults,
          });
        } catch (error) {
          fixes.push({
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            oldAmount: parseFloat(campaign.currentAmount || '0'),
            newAmount: 0,
            difference: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Display results
      console.log('📊 DRY RUN RESULTS:\n');
      console.log('Campaign ID'.padEnd(40), 'Title'.padEnd(30), 'Old Amount'.padEnd(15), 'New Amount'.padEnd(15), 'Difference'.padEnd(15), 'Status');
      console.log('-'.repeat(120));

      let totalFixed = 0;
      let totalUnchanged = 0;
      let totalErrors = 0;
      let totalDifference = 0;

      for (const fix of fixes) {
        const statusIcon = fix.status === 'fixed' ? '✅' : 
                          fix.status === 'unchanged' ? '➖' : 
                          fix.status === 'verification_failed' ? '⚠️' : '❌';
        console.log(
          fix.campaignId.substring(0, 38).padEnd(40),
          (fix.campaignTitle || 'N/A').substring(0, 28).padEnd(30),
          fix.oldAmount.toFixed(2).padEnd(15),
          fix.newAmount.toFixed(2).padEnd(15),
          fix.difference.toFixed(2).padEnd(15),
          `${statusIcon} ${fix.status}${fix.error ? ` (${fix.error})` : ''}`
        );

        // Show verification results if available
        if (fix.verificationResults) {
          const { verified, failed, skipped, totalDonations } = fix.verificationResults;
          console.log(`     Payment Verification: ${verified}/${totalDonations} verified, ${failed} failed, ${skipped} skipped`);
          
          if (failed > 0) {
            console.log(`     ⚠️  Failed verifications:`);
            for (const detail of fix.verificationResults.details.filter(d => !d.verified && d.error && !d.error.includes('No payment reference'))) {
              const warningText = detail.warning ? ` [${detail.warning}]` : '';
              console.log(`        - ${detail.donationId.substring(0, 8)}... (${detail.paymentMethod}): ${detail.error}${warningText}`);
            }
          }

          // Show warnings for test payments that were verified
          const testPayments = fix.verificationResults.details.filter(d => d.verified && d.warning);
          if (testPayments.length > 0) {
            console.log(`     ℹ️  Note: ${testPayments.length} test payment(s) verified (may not represent real money)`);
          }
        }

        if (fix.status === 'fixed') totalFixed++;
        else if (fix.status === 'unchanged') totalUnchanged++;
        else if (fix.status === 'verification_failed') totalErrors++;
        else totalErrors++;

        totalDifference += fix.difference;
      }

      console.log('\n📈 SUMMARY:');
      console.log(`   Fixed: ${totalFixed} campaigns`);
      console.log(`   Unchanged: ${totalUnchanged} campaigns`);
      console.log(`   Errors/Verification Failed: ${totalErrors} campaigns`);
      console.log(`   Total difference: ${totalDifference.toFixed(2)}`);
      
      if (options.verifyPayments) {
        console.log('\n💡 Payment verification was performed. Review any failed verifications above.');
        
        // Check for common issues
        const testModeIssues = fixes.some(f => 
          f.verificationResults?.details.some(d => 
            d.error?.includes('test mode') || d.error?.includes('live mode key')
          )
        );
        const notFoundIssues = fixes.some(f => 
          f.verificationResults?.details.some(d => 
            d.error?.includes('not found') || d.error?.includes('Transaction reference not found')
          )
        );
        const abandonedPayments = fixes.some(f => 
          f.verificationResults?.details.some(d => 
            d.error?.includes('abandoned')
          )
        );

        if (testModeIssues) {
          console.log('\n⚠️  COMMON ISSUE: Test/Live Mode Mismatch');
          console.log('   Some payments were created in test mode but you\'re using a live API key (or vice versa).');
          console.log('   These payments may be valid but exist in a different mode.');
          console.log('   Solution: Use --skip-verification-failures to proceed, or verify manually.');
        }

        if (notFoundIssues) {
          console.log('\n⚠️  COMMON ISSUE: Payment Not Found');
          console.log('   Some payment references were not found in Paystack/Stripe.');
          console.log('   Possible causes:');
          console.log('   - Payment was created on a different account');
          console.log('   - Payment was deleted');
          console.log('   - Payment reference is invalid');
          console.log('   Solution: Review these donations manually before fixing amounts.');
        }

        if (abandonedPayments) {
          console.log('\n⚠️  COMMON ISSUE: Abandoned Payments');
          console.log('   Some Paystack payments were abandoned (never completed).');
          console.log('   These should not be counted in campaign amounts.');
          console.log('   Solution: These donations should be marked as failed, not completed.');
        }
      }
      
      console.log('\n⚠️  This was a dry run. Run without --dry-run to apply changes.\n');

    } else {
      // Actually fix the amounts
      const allCampaigns = campaignIds
        ? await db.select({ id: campaigns.id, title: campaigns.title }).from(campaigns).where(inArray(campaigns.id, campaignIds))
        : await db.select({ id: campaigns.id, title: campaigns.title }).from(campaigns);

      const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [] as Array<{ campaignId: string; error: string }>,
      };

      for (const campaign of allCampaigns) {
        try {
          // Verify payments if requested
          if (options.verifyPayments) {
            const campaignDonations = await db
              .select({
                id: donations.id,
                paymentMethod: donations.paymentMethod,
                paymentIntentId: donations.paymentIntentId,
              })
              .from(donations)
              .where(and(
                eq(donations.campaignId, campaign.id),
                eq(donations.paymentStatus, 'completed')
              ));

            console.log(`\n🔍 Verifying ${campaignDonations.length} donation(s) for campaign: ${campaign.title}...`);

            let allVerified = true;
            let verificationErrors: string[] = [];

            for (const donation of campaignDonations) {
              const verification = await verifyDonationPayment({
                id: donation.id,
                paymentMethod: donation.paymentMethod,
                paymentIntentId: donation.paymentIntentId,
                amount: '0',
              });

              if (!verification.verified) {
                allVerified = false;
                if (verification.error && !verification.error.includes('No payment reference')) {
                  verificationErrors.push(`Donation ${donation.id.substring(0, 8)}...: ${verification.error}`);
                }
              }

              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 200));
            }

            if (!allVerified && !options.skipVerificationFailures) {
              console.log(`   ⚠️  Skipping campaign due to verification failures`);
              if (verificationErrors.length > 0) {
                verificationErrors.forEach(err => console.log(`      - ${err}`));
              }
              results.skipped++;
              results.errors.push({
                campaignId: campaign.id,
                error: 'Payment verification failed',
              });
              continue;
            } else if (!allVerified && options.skipVerificationFailures) {
              console.log(`   ⚠️  Some verifications failed, but proceeding anyway`);
              if (verificationErrors.length > 0) {
                verificationErrors.forEach(err => console.log(`      - ${err}`));
              }
            } else {
              console.log(`   ✅ All payments verified successfully`);
            }
          }

          const result = await updateCampaignAmount(campaign.id);
          if (result !== null) {
            results.success++;
            console.log(`   ✅ Updated campaign amount to ${result.toFixed(2)}`);
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

      console.log('\n✅ Campaign amounts recalculated!\n');
      console.log('📊 RESULTS:');
      console.log(`   ✅ Successfully updated: ${results.success} campaigns`);
      if (results.skipped > 0) {
        console.log(`   ⚠️  Skipped (verification failed): ${results.skipped} campaigns`);
      }
      console.log(`   ❌ Failed: ${results.failed} campaigns`);

      if (results.errors.length > 0) {
        console.log('\n❌ ERRORS:');
        for (const error of results.errors) {
          console.log(`   - Campaign ${error.campaignId}: ${error.error}`);
        }
      }

      console.log('\n✨ Done!\n');
    }

  } catch (error) {
    console.error('❌ Error fixing campaign amounts:', error);
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
  verifyPayments?: boolean;
  skipVerificationFailures?: boolean;
} = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--campaign-id' && args[i + 1]) {
    options.campaignId = args[i + 1];
    i++;
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  } else if (args[i] === '--verify-payments') {
    options.verifyPayments = true;
  } else if (args[i] === '--skip-verification-failures') {
    options.skipVerificationFailures = true;
  }
}

// Run the script
fixCampaignAmounts(options).catch(console.error);
