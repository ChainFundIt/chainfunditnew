#!/usr/bin/env tsx
/**
 * Find Payout by Transfer Code or Amount
 * 
 * Usage: npx tsx scripts/find-payout-by-transfer.ts <transferCode> [amount]
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function findPayout(transferCode: string, amount?: string) {
  const { db } = await import('../lib/db');
  const { campaignPayouts } = await import('../lib/schema');
  const { eq, like, sql } = await import('drizzle-orm');

  console.log('\n🔍 Finding Payout\n');
  console.log('=' .repeat(60));
  console.log(`Transfer Code: ${transferCode}`);
  if (amount) console.log(`Amount: ${amount}`);
  console.log('=' .repeat(60));

  // Search by transactionId
  let payouts = await db.query.campaignPayouts.findMany({
    where: eq(campaignPayouts.transactionId, transferCode),
    with: {
      user: true,
      campaign: true,
    },
  });

  if (payouts.length > 0) {
    console.log(`\n✅ Found ${payouts.length} payout(s) with transactionId: ${transferCode}`);
    payouts.forEach((payout, index) => {
      console.log(`\n${index + 1}. Payout ID: ${payout.id}`);
      console.log(`   Reference: ${payout.reference}`);
      console.log(`   Status: ${payout.status}`);
      console.log(`   Amount: ${payout.currency} ${parseFloat(payout.netAmount).toLocaleString()}`);
      console.log(`   Transaction ID: ${payout.transactionId}`);
    });
    return payouts[0];
  }

  // Search by amount if provided
  if (amount) {
    const amountNum = parseFloat(amount.replace(/[^0-9.]/g, ''));
    console.log(`\n🔍 Searching by amount: ${amountNum.toLocaleString()}`);
    
    payouts = await db.query.campaignPayouts.findMany({
      where: sql`CAST(${campaignPayouts.netAmount} AS NUMERIC) BETWEEN ${amountNum - 1} AND ${amountNum + 1}`,
      with: {
        user: true,
        campaign: true,
      },
      orderBy: (campaignPayouts, { desc }) => [desc(campaignPayouts.createdAt)],
      limit: 10,
    });

    if (payouts.length > 0) {
      console.log(`\n✅ Found ${payouts.length} payout(s) with similar amount:`);
      payouts.forEach((payout, index) => {
        console.log(`\n${index + 1}. Payout ID: ${payout.id}`);
        console.log(`   Reference: ${payout.reference}`);
        console.log(`   Status: ${payout.status}`);
        console.log(`   Amount: ${payout.currency} ${parseFloat(payout.netAmount).toLocaleString()}`);
        console.log(`   Transaction ID: ${payout.transactionId || 'NONE'}`);
        console.log(`   Created: ${new Date(payout.createdAt).toLocaleString()}`);
      });
      
      // Check if any have wrong transactionId
      const wrongTransactionId = payouts.find(p => 
        !p.transactionId || 
        p.transactionId === p.reference ||
        p.transactionId !== transferCode
      );
      
      if (wrongTransactionId) {
        console.log(`\n⚠️  Found payout with wrong transactionId:`);
        console.log(`   Payout ID: ${wrongTransactionId.id}`);
        console.log(`   Current Transaction ID: ${wrongTransactionId.transactionId || 'NONE'}`);
        console.log(`   Should be: ${transferCode}`);
        return wrongTransactionId;
      }
    }
  }

  // Search all processing payouts
  console.log(`\n🔍 Searching all processing payouts...`);
  const processingPayouts = await db.query.campaignPayouts.findMany({
    where: eq(campaignPayouts.status, 'processing'),
    with: {
      user: true,
      campaign: true,
    },
    orderBy: (campaignPayouts, { desc }) => [desc(campaignPayouts.createdAt)],
    limit: 20,
  });

  if (processingPayouts.length > 0) {
    console.log(`\n📋 Found ${processingPayouts.length} processing payout(s):`);
    processingPayouts.forEach((payout, index) => {
      console.log(`\n${index + 1}. Payout ID: ${payout.id}`);
      console.log(`   Reference: ${payout.reference}`);
      console.log(`   Amount: ${payout.currency} ${parseFloat(payout.netAmount).toLocaleString()}`);
      console.log(`   Transaction ID: ${payout.transactionId || 'NONE'}`);
      console.log(`   Created: ${new Date(payout.createdAt).toLocaleString()}`);
    });
  }

  return null;
}

const transferCodeArg = process.argv[2];
const amountArg = process.argv[3];

if (!transferCodeArg) {
  console.error('❌ Error: Transfer code is required');
  console.log('\nUsage: npx tsx scripts/find-payout-by-transfer.ts <transferCode> [amount]');
  console.log('\nExample: npx tsx scripts/find-payout-by-transfer.ts TRF_crszi1a4k0omjbvf 102654');
  process.exit(1);
}

findPayout(transferCodeArg, amountArg).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

