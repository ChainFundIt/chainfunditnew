#!/usr/bin/env tsx
/**
 * Fix Payout Transaction ID
 * 
 * Usage: npx tsx scripts/fix-payout-transaction-id.ts <payoutId> <transferCode>
 * 
 * This script fixes the transactionId for a payout that has the wrong value.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function fixTransactionId(payoutId: string, transferCode: string) {
  const { db } = await import('../lib/db');
  const { campaignPayouts } = await import('../lib/schema');
  const { eq } = await import('drizzle-orm');

  console.log('\n🔧 Fixing Payout Transaction ID\n');
  console.log('=' .repeat(60));
  console.log(`Payout ID: ${payoutId}`);
  console.log(`Transfer Code: ${transferCode}`);
  console.log('=' .repeat(60));

  // Get current payout
  const payout = await db.query.campaignPayouts.findFirst({
    where: eq(campaignPayouts.id, payoutId),
  });

  if (!payout) {
    console.error('\n❌ Payout not found!');
    process.exit(1);
  }

  console.log('\n📋 Current Payout:');
  console.log(`   Reference: ${payout.reference}`);
  console.log(`   Status: ${payout.status}`);
  console.log(`   Current Transaction ID: ${payout.transactionId || 'NONE'}`);
  console.log(`   New Transaction ID: ${transferCode}`);

  // Update transaction ID
  const updated = await db
    .update(campaignPayouts)
    .set({
      transactionId: transferCode,
      updatedAt: new Date(),
    })
    .where(eq(campaignPayouts.id, payoutId))
    .returning();

  if (updated.length === 0) {
    console.error('\n❌ Update failed - no rows were updated!');
    process.exit(1);
  }

  // Verify the update
  const verifyPayout = await db.query.campaignPayouts.findFirst({
    where: eq(campaignPayouts.id, payoutId),
  });

  console.log('\n✅ Transaction ID updated successfully!');
  console.log(`   Verified: ${verifyPayout?.transactionId === transferCode ? 'YES' : 'NO'}`);
  console.log(`   Current value: ${verifyPayout?.transactionId || 'NULL'}`);
  
  if (verifyPayout?.transactionId !== transferCode) {
    console.error('\n⚠️  WARNING: Update may not have persisted correctly!');
    console.log('   Please check the database manually.');
  }

  console.log('\n💡 Next Steps:');
  console.log('   1. Check your Paystack dashboard for OTP verification');
  console.log('   2. Complete the OTP verification to process the transfer');
  console.log('   3. The webhook will update the payout status when complete');
}

const payoutId = process.argv[2];
const transferCode = process.argv[3];

if (!payoutId || !transferCode) {
  console.error('❌ Error: Both payout ID and transfer code are required');
  console.log('\nUsage: npx tsx scripts/fix-payout-transaction-id.ts <payoutId> <transferCode>');
  console.log('\nExample: npx tsx scripts/fix-payout-transaction-id.ts fec28601-68f3-418c-9fa6-0e4bb67abade TRF_bdhiyo1agxxri779');
  process.exit(1);
}

fixTransactionId(payoutId, transferCode).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

