#!/usr/bin/env tsx

import { db } from '@/lib/db';
import { charityDonations, charities } from '@/lib/schema/charities';
import { eq, sql } from 'drizzle-orm';

/**
 * Script to update test donations to completed status
 * Usage: npm run update-test-donations
 */

async function updateTestDonations() {
  try {
    console.log('🔍 Finding pending charity donations...\n');

    // Get all pending donations
    const pendingDonations = await db.query.charityDonations.findMany({
      where: eq(charityDonations.paymentStatus, 'pending'),
      orderBy: (charityDonations, { desc }) => [desc(charityDonations.createdAt)],
    });

    if (pendingDonations.length === 0) {
      console.log('No pending donations found.');
      return;
    }

    console.log(`Found ${pendingDonations.length} pending donations:\n`);

    pendingDonations.forEach((donation, index) => {
      console.log(`${index + 1}. Donation ID: ${donation.id}`);
      console.log(`   Amount: ${donation.amount} ${donation.currency}`);
      console.log(`   Donor: ${donation.donorEmail}`);
      console.log(`   Payment Method: ${donation.paymentMethod}`);
      console.log(`   Created: ${donation.createdAt}`);
      console.log('');
    });

    console.log('📝 Updating donations to completed status...\n');

    for (const donation of pendingDonations) {
      // Update donation to completed
      await db
        .update(charityDonations)
        .set({
          paymentStatus: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(charityDonations.id, donation.id));

      // Update charity totals
      await db
        .update(charities)
        .set({
          totalReceived: sql`CAST(${charities.totalReceived} AS NUMERIC) + CAST(${donation.amount} AS NUMERIC)`,
          pendingAmount: sql`CAST(${charities.pendingAmount} AS NUMERIC) + CAST(${donation.amount} AS NUMERIC)`,
          updatedAt: new Date(),
        })
        .where(eq(charities.id, donation.charityId));

      console.log(`✅ Updated donation ${donation.id.substring(0, 8)}...`);
    }

    console.log(`\n🎉 Successfully updated ${pendingDonations.length} donations!`);
    console.log('\nUpdated charity totals. Check your admin dashboard to see the donations.\n');

  } catch (error) {
    console.error('❌ Error updating donations:', error);
    process.exit(1);
  }
}

updateTestDonations();

