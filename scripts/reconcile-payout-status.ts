#!/usr/bin/env tsx
/**
 * Reconcile Payout Status
 * 
 * Usage: npx tsx scripts/reconcile-payout-status.ts <transactionId>
 * 
 * This script checks the Paystack transfer status and updates the database
 * if there's a mismatch (e.g., Paystack shows completed but DB shows processing).
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function reconcilePayout(transactionId: string) {
  const { db } = await import('../lib/db');
  const { campaignPayouts } = await import('../lib/schema');
  const { eq } = await import('drizzle-orm');
  const { verifyPaystackTransfer } = await import('../lib/payments/paystack');
  const { logPayoutStatusChange } = await import('../lib/payments/payout-audit');

  console.log('\n🔍 Reconciling Payout Status\n');
  console.log('=' .repeat(60));
  console.log(`Transaction ID: ${transactionId}`);
  console.log('=' .repeat(60));

  // Find payout by transactionId
  const payout = await db.query.campaignPayouts.findFirst({
    where: eq(campaignPayouts.transactionId, transactionId),
    with: {
      user: true,
      campaign: true,
    },
  });

  if (!payout) {
    console.error('\n❌ Payout not found with that transaction ID!');
    console.log('\n💡 Searching for payout by reference or ID...');
    
    // Try to find by searching all payouts (in case transactionId format changed)
    const allPayouts = await db.query.campaignPayouts.findMany({
      where: eq(campaignPayouts.status, 'processing'),
      limit: 50,
    });
    
    console.log(`\nFound ${allPayouts.length} payouts in processing status.`);
    console.log('Please provide the payout ID directly if you know it.');
    process.exit(1);
  }

  console.log('\n📋 Current Database Status:');
  console.log(`   Payout ID: ${payout.id}`);
  console.log(`   Reference: ${payout.reference}`);
  console.log(`   Status: ${payout.status}`);
  console.log(`   Amount: ${payout.currency} ${parseFloat(payout.netAmount).toLocaleString()}`);
  console.log(`   Transaction ID: ${payout.transactionId}`);

  // Check Paystack status
  console.log(`\n🔗 Checking Paystack Transfer Status...`);
  
  try {
    let transferStatus;
    
    // First try with the transaction ID directly
    try {
      transferStatus = await verifyPaystackTransfer(transactionId);
    } catch (directError: any) {
      // If direct lookup fails, try searching by reference
      console.log('   Direct lookup failed, searching by reference...');
      const { listPaystackTransfers } = await import('../lib/payments/paystack');
      
      // Search recent transfers
      const transfers = await listPaystackTransfers(100, 1);
      
      if (transfers.data && transfers.data.length > 0) {
        // Try to find by transfer_code
        let foundTransfer = transfers.data.find((t: any) => 
          t.transfer_code === transactionId || 
          t.reference === payout.reference ||
          t.id?.toString() === transactionId
        );
        
        if (!foundTransfer) {
          // Try searching in more pages
          for (let page = 2; page <= 5; page++) {
            const moreTransfers = await listPaystackTransfers(100, page);
            if (moreTransfers.data && moreTransfers.data.length > 0) {
              foundTransfer = moreTransfers.data.find((t: any) => 
                t.transfer_code === transactionId || 
                t.reference === payout.reference ||
                t.id?.toString() === transactionId
              );
              if (foundTransfer) break;
            } else {
              break;
            }
          }
        }
        
        if (foundTransfer) {
          console.log('   ✅ Found transfer by searching!');
          // Format it like the verifyPaystackTransfer response
          transferStatus = {
            status: true,
            data: foundTransfer,
          };
        } else {
          throw directError; // Re-throw original error if not found
        }
      } else {
        throw directError; // Re-throw original error
      }
    }

    console.log('\n✅ Paystack Transfer Details:');
    console.log(`   Transfer Code: ${transferStatus.data?.transfer_code || 'N/A'}`);
    console.log(`   Status: ${transferStatus.data?.status || 'N/A'}`);
    console.log(`   Amount: ${transferStatus.data?.amount ? (transferStatus.data.amount / 100).toLocaleString() : 'N/A'} ${transferStatus.data?.currency || 'NGN'}`);
    console.log(`   Created: ${transferStatus.data?.createdAt ? new Date(transferStatus.data.createdAt).toLocaleString() : 'N/A'}`);
    console.log(`   Updated: ${transferStatus.data?.updatedAt ? new Date(transferStatus.data.updatedAt).toLocaleString() : 'N/A'}`);

    const paystackStatus = transferStatus.data?.status;
    const dbStatus = payout.status;

    console.log('\n📈 Status Comparison:');
    console.log(`   Database: ${dbStatus}`);
    console.log(`   Paystack: ${paystackStatus}`);

    // Determine what the database status should be
    let targetStatus: string | null = null;
    let shouldUpdate = false;

    if (paystackStatus === 'success' && dbStatus !== 'completed') {
      targetStatus = 'completed';
      shouldUpdate = true;
      console.log('\n⚠️  MISMATCH DETECTED!');
      console.log('   Paystack shows transfer as SUCCESS, but database shows:', dbStatus);
      console.log('   The webhook may not have been received or processed correctly.');
    } else if (paystackStatus === 'failed' && dbStatus !== 'failed') {
      targetStatus = 'failed';
      shouldUpdate = true;
      console.log('\n⚠️  MISMATCH DETECTED!');
      console.log('   Paystack shows transfer as FAILED, but database shows:', dbStatus);
    } else if (paystackStatus === 'success' && dbStatus === 'completed') {
      console.log('\n✅ Status matches - payout is already marked as completed!');
    } else if (paystackStatus === 'pending' || paystackStatus === 'otp') {
      console.log('\n⚠️  Transfer is still pending in Paystack.');
      console.log(`   Status: ${paystackStatus}`);
      if (paystackStatus === 'otp') {
        console.log('   This transfer requires OTP verification in Paystack dashboard.');
      }
      console.log('   Database status is correct - waiting for Paystack to process.');
    } else {
      console.log('\n✅ Status is consistent between Paystack and database.');
    }

    if (shouldUpdate && targetStatus) {
      console.log(`\n🔄 Updating payout status to: ${targetStatus}`);
      
      const oldStatus = payout.status;
      
      await db
        .update(campaignPayouts)
        .set({
          status: targetStatus,
          processedAt: targetStatus === 'completed' ? new Date() : payout.processedAt,
          failureReason: targetStatus === 'failed' ? (transferStatus.data?.failures?.[0]?.message || 'Transfer failed') : payout.failureReason,
          updatedAt: new Date(),
        })
        .where(eq(campaignPayouts.id, payout.id));

      // Log audit trail
      await logPayoutStatusChange({
        payoutId: payout.id,
        oldStatus,
        newStatus: targetStatus,
        changedBy: 'reconciliation_script',
        reason: `Status reconciled with Paystack. Paystack status: ${paystackStatus}`,
      });

      console.log('\n✅ Payout status updated successfully!');
      console.log(`   Old Status: ${oldStatus}`);
      console.log(`   New Status: ${targetStatus}`);
      
      if (targetStatus === 'completed') {
        console.log(`   Processed At: ${new Date().toLocaleString()}`);
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error checking Paystack transfer:', error.message);
    
    if (error.response?.status === 404) {
      console.log('\n⚠️  Transfer NOT FOUND in Paystack API!');
      console.log('   This could mean:');
      console.log('   1. The transfer code format changed');
      console.log('   2. The transfer was archived');
      console.log('   3. The transfer ID is incorrect');
      console.log('\n💡 Since you confirmed the money was sent, we can manually mark it as completed.');
      console.log('\n❓ Do you want to mark this payout as completed? (This will update the database)');
      console.log('   Run with --force flag to automatically mark as completed:');
      console.log(`   npx tsx scripts/reconcile-payout-status.ts ${transactionId} --force`);
      
      // If --force flag is provided, mark as completed anyway
      if (process.argv.includes('--force')) {
        console.log('\n🔄 Force flag detected. Marking payout as completed...');
        
        const oldStatus = payout.status;
        
        await db
          .update(campaignPayouts)
          .set({
            status: 'completed',
            processedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(campaignPayouts.id, payout.id));

        await logPayoutStatusChange({
          payoutId: payout.id,
          oldStatus,
          newStatus: 'completed',
          changedBy: 'reconciliation_script_force',
          reason: 'Manually marked as completed - transfer verified as sent but not found in Paystack API',
        });

        console.log('\n✅ Payout marked as completed!');
        console.log(`   Old Status: ${oldStatus}`);
        console.log(`   New Status: completed`);
        console.log(`   Processed At: ${new Date().toLocaleString()}`);
      } else {
        process.exit(1);
      }
    } else {
      console.log('\n   Full error:', error.response?.data || error.message);
      process.exit(1);
    }
  }
}

const transactionId = process.argv[2];

if (!transactionId) {
  console.error('❌ Error: Transaction ID is required');
  console.log('\nUsage: npx tsx scripts/reconcile-payout-status.ts <transactionId>');
  console.log('\nExample: npx tsx scripts/reconcile-payout-status.ts TRF_x7qc09cqvwnm0uc5');
  process.exit(1);
}

reconcilePayout(transactionId).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

