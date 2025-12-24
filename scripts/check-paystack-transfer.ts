#!/usr/bin/env tsx
/**
 * Check Paystack Transfer Status
 * 
 * Usage: npx tsx scripts/check-paystack-transfer.ts <payoutId>
 * 
 * This script checks if a payout transfer actually reached Paystack
 * and what its current status is.
 */

// Load environment variables FIRST
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function checkPaystackTransfer(payoutId: string) {
  // Dynamic imports
  const { db } = await import('../lib/db');
  const { campaignPayouts } = await import('../lib/schema');
  const { eq } = await import('drizzle-orm');
  const { verifyPaystackTransfer } = await import('../lib/payments/paystack');

  console.log('\n🔍 Checking Paystack Transfer Status\n');
  console.log('=' .repeat(60));
  console.log(`Payout ID: ${payoutId}`);
  console.log('=' .repeat(60));

  // Get payout from database
  const payout = await db.query.campaignPayouts.findFirst({
    where: eq(campaignPayouts.id, payoutId),
    with: {
      user: true,
      campaign: true,
    },
  });

  if (!payout) {
    console.error('\n❌ Payout not found!');
    process.exit(1);
  }

  console.log('\n📋 Payout Details:');
  console.log(`   Reference: ${payout.reference}`);
  console.log(`   Status: ${payout.status}`);
  console.log(`   Amount: ${payout.currency} ${parseFloat(payout.netAmount).toLocaleString()}`);
  console.log(`   Provider: ${payout.payoutProvider}`);
  console.log(`   Transaction ID: ${payout.transactionId || 'NONE'}`);

  // Check if it's a Paystack payout
  if (payout.payoutProvider !== 'paystack') {
    console.log('\n⚠️  This payout is not using Paystack. Provider:', payout.payoutProvider);
    process.exit(0);
  }

  // Check if transactionId looks like a Paystack transfer code
  // Paystack transfer codes are usually numeric or have a specific format
  // If it's the same as the payout reference, the transfer was never created
  const isPayoutReference = payout.transactionId === payout.reference;
  
  if (!payout.transactionId || isPayoutReference) {
    console.log('\n❌ TRANSFER NEVER REACHED PAYSTACK!');
    console.log(`   Transaction ID: ${payout.transactionId || 'NONE'}`);
    console.log(`   Payout Reference: ${payout.reference}`);
    
    if (isPayoutReference) {
      console.log('\n⚠️  The transactionId is the same as the payout reference.');
      console.log('   This means the Paystack transfer API was never called successfully.');
      console.log('   The payout is stuck in "processing" but no transfer was created.');
    } else {
      console.log('\n⚠️  No transaction ID found.');
      console.log('   The transfer was never initiated with Paystack.');
    }
    
    console.log('\n💡 Solution: Use the "retry" action in the admin panel to re-process this payout.');
    
    // Try to find the transfer by listing all transfers and matching by reference
    console.log('\n🔍 Searching Paystack transfers by reference...');
    try {
      const { listPaystackTransfers } = await import('../lib/payments/paystack');
      const transfers = await listPaystackTransfers(50, 1);
      
      if (transfers.data && transfers.data.length > 0) {
        const matchingTransfer = transfers.data.find((t: any) => 
          t.reference === payout.reference || 
          t.metadata?.payoutId === payout.id ||
          t.metadata?.reference === payout.reference
        );
        
        if (matchingTransfer) {
          console.log('\n✅ Found matching transfer in Paystack!');
          console.log(`   Transfer Code: ${matchingTransfer.transfer_code}`);
          console.log(`   Status: ${matchingTransfer.status}`);
          console.log(`   Reference: ${matchingTransfer.reference}`);
          console.log('\n💡 The transfer exists but transactionId was not saved correctly.');
          console.log('   You can manually update the transactionId to:', matchingTransfer.transfer_code);
        } else {
          console.log('   No matching transfer found in recent Paystack transfers.');
        }
      }
    } catch (error) {
      console.log('   Could not search Paystack transfers:', (error as Error).message);
    }
    
    process.exit(1);
  }

  console.log(`\n🔗 Checking Paystack Transfer: ${payout.transactionId}`);

  try {
    // Verify transfer with Paystack
    const transferStatus = await verifyPaystackTransfer(payout.transactionId);

    console.log('\n✅ Paystack Transfer Found!\n');
    console.log('📊 Transfer Details:');
    console.log(`   Transfer Code: ${transferStatus.data?.transfer_code || 'N/A'}`);
    console.log(`   Status: ${transferStatus.data?.status || 'N/A'}`);
    console.log(`   Amount: ${transferStatus.data?.amount ? (transferStatus.data.amount / 100).toLocaleString() : 'N/A'} ${transferStatus.data?.currency || 'NGN'}`);
    console.log(`   Recipient: ${transferStatus.data?.recipient?.name || 'N/A'}`);
    console.log(`   Account: ${transferStatus.data?.recipient?.details?.account_number || 'N/A'}`);
    console.log(`   Bank: ${transferStatus.data?.recipient?.details?.bank_name || 'N/A'}`);
    console.log(`   Created: ${transferStatus.data?.createdAt ? new Date(transferStatus.data.createdAt).toLocaleString() : 'N/A'}`);
    console.log(`   Updated: ${transferStatus.data?.updatedAt ? new Date(transferStatus.data.updatedAt).toLocaleString() : 'N/A'}`);

    if (transferStatus.data?.reason) {
      console.log(`   Reason: ${transferStatus.data.reason}`);
    }

    // Status analysis
    const paystackStatus = transferStatus.data?.status;
    const dbStatus = payout.status;

    console.log('\n📈 Status Comparison:');
    console.log(`   Database Status: ${dbStatus}`);
    console.log(`   Paystack Status: ${paystackStatus}`);

    if (paystackStatus === 'success' && dbStatus !== 'completed') {
      console.log('\n⚠️  MISMATCH DETECTED!');
      console.log('   Paystack shows transfer as SUCCESS, but database shows:', dbStatus);
      console.log('   The webhook may not have been received or processed correctly.');
      console.log('\n💡 Solution: Manually update the payout status to "completed" or wait for webhook.');
    } else if (paystackStatus === 'failed' && dbStatus !== 'failed') {
      console.log('\n⚠️  MISMATCH DETECTED!');
      console.log('   Paystack shows transfer as FAILED, but database shows:', dbStatus);
      console.log('   The webhook may not have been received or processed correctly.');
      console.log('\n💡 Solution: Manually update the payout status to "failed".');
    } else if (paystackStatus === 'pending' && dbStatus === 'processing') {
      console.log('\n✅ Status matches - transfer is pending with Paystack');
      console.log('   This is normal. The transfer will complete when Paystack processes it.');
    } else if (paystackStatus === 'success' && dbStatus === 'completed') {
      console.log('\n✅ Status matches - transfer completed successfully!');
    } else if (paystackStatus === 'failed' && dbStatus === 'failed') {
      console.log('\n✅ Status matches - transfer failed');
    } else {
      console.log('\n⚠️  Status comparison shows:', {
        paystack: paystackStatus,
        database: dbStatus,
      });
    }

    // Check for failure reasons
    if (transferStatus.data?.failures && transferStatus.data.failures.length > 0) {
      console.log('\n❌ Transfer Failures:');
      transferStatus.data.failures.forEach((failure: any, index: number) => {
        console.log(`   ${index + 1}. ${failure.message || 'Unknown error'}`);
      });
    }

  } catch (error: any) {
    console.error('\n❌ Error checking Paystack transfer:', error.message);
    
    if (error.response?.status === 404) {
      console.log('\n⚠️  Transfer NOT FOUND in Paystack!');
      console.log('   This means:');
      console.log('   1. The transfer was never created, OR');
      console.log('   2. The transaction ID is incorrect');
      console.log('\n💡 Solution: Use the "retry" action to re-initiate the transfer.');
    } else if (error.response?.status === 401) {
      console.log('\n❌ Authentication failed with Paystack');
      console.log('   Please check your PAYSTACK_SECRET_KEY environment variable.');
    } else {
      console.log('\n   Full error:', error.response?.data || error.message);
    }
    
    process.exit(1);
  }
}

// Get payout ID from command line
const payoutId = process.argv[2];

if (!payoutId) {
  console.error('❌ Error: Payout ID is required');
  console.log('\nUsage: npx tsx scripts/check-paystack-transfer.ts <payoutId>');
  console.log('\nExample: npx tsx scripts/check-paystack-transfer.ts fec28601-68f3-418c-9fa6-0e4bb67abade');
  process.exit(1);
}

checkPaystackTransfer(payoutId).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

