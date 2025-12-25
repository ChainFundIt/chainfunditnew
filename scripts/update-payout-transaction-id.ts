#!/usr/bin/env tsx
/**
 * Update Payout Transaction ID
 * 
 * Usage: npx tsx scripts/update-payout-transaction-id.ts <payoutId> <correctTransferCode>
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function updateTransactionId(payoutId: string, correctTransferCode: string) {
  const { db } = await import('../lib/db');
  const { campaignPayouts } = await import('../lib/schema');
  const { eq } = await import('drizzle-orm');
  const { logPayoutStatusChange } = await import('../lib/payments/payout-audit');

  console.log('\n🔄 Updating Payout Transaction ID\n');
  console.log('=' .repeat(60));
  console.log(`Payout ID: ${payoutId}`);
  console.log(`New Transfer Code: ${correctTransferCode}`);
  console.log('=' .repeat(60));

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
  console.log(`   New Transaction ID: ${correctTransferCode}`);

  const oldTransactionId = payout.transactionId;

  await db
    .update(campaignPayouts)
    .set({
      transactionId: correctTransferCode,
      updatedAt: new Date(),
    })
    .where(eq(campaignPayouts.id, payoutId));

  await logPayoutStatusChange({
    payoutId,
    oldStatus: payout.status,
    newStatus: payout.status,
    changedBy: 'transaction_id_update',
    reason: `Transaction ID updated from ${oldTransactionId || 'NONE'} to ${correctTransferCode}`,
  });

  console.log('\n✅ Transaction ID updated successfully!');
}

const payoutId = process.argv[2];
const transferCode = process.argv[3];

if (!payoutId || !transferCode) {
  console.error('❌ Error: Both payout ID and transfer code are required');
  console.log('\nUsage: npx tsx scripts/update-payout-transaction-id.ts <payoutId> <transferCode>');
  console.log('\nExample: npx tsx scripts/update-payout-transaction-id.ts 1347cfcd-4e8d-4019-beb3-a84158815469 TRF_crszi1a4k0omjbvf');
  process.exit(1);
}

updateTransactionId(payoutId, transferCode).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

