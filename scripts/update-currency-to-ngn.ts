#!/usr/bin/env tsx

import { db } from '../lib/db';
import { donations, campaigns } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function updateDonationsCurrency() {
  console.log('🔄 Updating donations currency from USD to NGN...\n');

  try {
    // Get all donations with USD currency
    const usdDonations = await db
      .select()
      .from(donations)
      .where(eq(donations.currency, 'USD'));

    console.log(`📊 Found ${usdDonations.length} donations with USD currency`);

    if (usdDonations.length === 0) {
      console.log('✅ No USD donations found. All donations are already using the correct currency.');
      return;
    }

    // Update all USD donations to NGN
    console.log('🔄 Converting USD donations to NGN...');
    
    // Convert amounts from USD to NGN (assuming 1 USD = 1500 NGN)
    const exchangeRate = 1500;
    
    for (const donation of usdDonations) {
      const usdAmount = parseFloat(donation.amount);
      const ngnAmount = (usdAmount * exchangeRate).toFixed(2);
      
      await db
        .update(donations)
        .set({
          currency: 'NGN',
          amount: ngnAmount,
        })
        .where(eq(donations.id, donation.id));
      
      console.log(`   ✅ Updated donation ${donation.id}: $${usdAmount} → ₦${ngnAmount}`);
    }

    // Also update campaigns that might have USD currency
    console.log('\n🔄 Checking campaigns currency...');
    const usdCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.currency, 'USD'));

    console.log(`📊 Found ${usdCampaigns.length} campaigns with USD currency`);

    for (const campaign of usdCampaigns) {
      const usdGoalAmount = parseFloat(campaign.goalAmount);
      const usdCurrentAmount = parseFloat(campaign.currentAmount);
      const usdMinDonation = parseFloat(campaign.minimumDonation);
      
      const ngnGoalAmount = (usdGoalAmount * exchangeRate).toFixed(2);
      const ngnCurrentAmount = (usdCurrentAmount * exchangeRate).toFixed(2);
      const ngnMinDonation = (usdMinDonation * exchangeRate).toFixed(2);
      
      await db
        .update(campaigns)
        .set({
          currency: 'NGN',
          goalAmount: ngnGoalAmount,
          currentAmount: ngnCurrentAmount,
          minimumDonation: ngnMinDonation,
        })
        .where(eq(campaigns.id, campaign.id));
      
      console.log(`   ✅ Updated campaign ${campaign.title}:`);
      console.log(`      Goal: $${usdGoalAmount} → ₦${ngnGoalAmount}`);
      console.log(`      Current: $${usdCurrentAmount} → ₦${ngnCurrentAmount}`);
      console.log(`      Min Donation: $${usdMinDonation} → ₦${ngnMinDonation}`);
    }

    console.log('\n🎉 Currency conversion completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${usdDonations.length} donations converted from USD to NGN`);
    console.log(`   • ${usdCampaigns.length} campaigns converted from USD to NGN`);
    console.log(`   • Exchange rate used: 1 USD = ${exchangeRate} NGN`);
    console.log('\n💡 All amounts are now displayed in Nigerian Naira (₦)');

  } catch (error) {
    console.error('❌ Error updating currency:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
updateDonationsCurrency();
