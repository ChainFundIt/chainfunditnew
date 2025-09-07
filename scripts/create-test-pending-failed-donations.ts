#!/usr/bin/env tsx

import { db } from '../lib/db';
import { donations, campaigns, users } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function createTestPendingFailedDonations() {
  console.log('🧪 Creating test pending and failed donations...\n');

  try {
    // Get a test campaign
    const testCampaigns = await db
      .select()
      .from(campaigns)
      .limit(3);

    if (testCampaigns.length === 0) {
      console.log('❌ No campaigns found. Please create a campaign first.');
      return;
    }

    // Get a test user
    const testUsers = await db
      .select()
      .from(users)
      .limit(3);

    if (testUsers.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const campaign = testCampaigns[0];
    const user = testUsers[0];

    console.log(`📋 Using campaign: ${campaign.title}`);
    console.log(`👤 Using user: ${user.email}`);
    console.log(`💰 Campaign currency: ${campaign.currency}\n`);

    // Create test pending donations
    const pendingDonations = [
      {
        campaignId: campaign.id,
        donorId: user.id,
        amount: '50.00',
        currency: campaign.currency,
        paymentMethod: 'stripe',
        paymentStatus: 'pending',
        message: 'Test pending donation - waiting for payment',
        isAnonymous: false,
      },
      {
        campaignId: campaign.id,
        donorId: user.id,
        amount: '25.00',
        currency: campaign.currency,
        paymentMethod: 'paystack',
        paymentStatus: 'pending',
        message: 'Another pending donation',
        isAnonymous: true,
      },
      {
        campaignId: campaign.id,
        donorId: user.id,
        amount: '100.00',
        currency: campaign.currency,
        paymentMethod: 'stripe',
        paymentStatus: 'pending',
        message: 'Large pending donation',
        isAnonymous: false,
      },
    ];

    // Create test failed donations
    const failedDonations = [
      {
        campaignId: campaign.id,
        donorId: user.id,
        amount: '30.00',
        currency: campaign.currency,
        paymentMethod: 'stripe',
        paymentStatus: 'failed',
        message: 'Test failed donation - payment declined',
        isAnonymous: false,
      },
      {
        campaignId: campaign.id,
        donorId: user.id,
        amount: '75.00',
        currency: campaign.currency,
        paymentMethod: 'paystack',
        paymentStatus: 'failed',
        message: 'Another failed donation',
        isAnonymous: true,
      },
    ];

    // Insert pending donations
    console.log('⏳ Creating pending donations...');
    for (const donation of pendingDonations) {
      const result = await db.insert(donations).values(donation).returning();
      console.log(`   ✅ Created pending donation: ${donation.amount} ${donation.currency} (ID: ${result[0].id})`);
    }

    // Insert failed donations
    console.log('\n❌ Creating failed donations...');
    for (const donation of failedDonations) {
      const result = await db.insert(donations).values(donation).returning();
      console.log(`   ✅ Created failed donation: ${donation.amount} ${donation.currency} (ID: ${result[0].id})`);
    }

    console.log('\n🎉 Test donations created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${pendingDonations.length} pending donations`);
    console.log(`   • ${failedDonations.length} failed donations`);
    console.log(`   • Campaign: ${campaign.title}`);
    console.log(`   • Currency: ${campaign.currency}`);
    console.log('\n💡 You can now view these donations in the dashboard under:');
    console.log('   • Donations → Pending tab');
    console.log('   • Donations → Failed tab');

  } catch (error) {
    console.error('❌ Error creating test donations:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createTestPendingFailedDonations();
