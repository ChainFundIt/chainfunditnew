#!/usr/bin/env tsx

/**
 * Test script for guest donations (non-authenticated users)
 * 
 * This script tests that donations work for users who are not logged in
 */

import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testGuestDonation() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing guest donation flow...');
    
    // First, get a real campaign ID from the database or use a test one
    const campaignsResponse = await fetch(`${baseUrl}/api/campaigns`);
    const campaignsResult = await campaignsResponse.json();
    
    if (!campaignsResult.success || !campaignsResult.data || campaignsResult.data.length === 0) {
      console.error('❌ No campaigns found. Please create a campaign first.');
      return;
    }
    
    const campaign = campaignsResult.data[0];
    console.log(`📋 Using campaign: ${campaign.title} (ID: ${campaign.id})`);
    
    // Test donation data (without authentication)
    const testDonation = {
      campaignId: campaign.id,
      amount: campaign.minimumDonation || 10000, // Use campaign's minimum or default
      currency: campaign.currency || 'NGN', // Use campaign's currency
      paymentProvider: campaign.currency === 'NGN' ? 'paystack' : 'stripe', // Choose provider based on currency
      message: 'Test guest donation',
      isAnonymous: true,
      simulate: true, // Use simulation mode for testing
    };

    console.log('🚀 Initializing donation without authentication...');
    
    const initResponse = await fetch(`${baseUrl}/api/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: No authentication headers - this should work now
      },
      body: JSON.stringify(testDonation),
    });

    const initResult = await initResponse.json();
    console.log('📤 Initialization response:', initResult);

    if (!initResult.success) {
      console.error('❌ Failed to initialize donation:', initResult.error);
      return;
    }

    console.log('✅ Donation initialized successfully!');
    console.log(`   Donation ID: ${initResult.donationId}`);
    console.log(`   Provider: ${initResult.provider}`);
    
    if (initResult.provider === 'stripe') {
      console.log(`   Client Secret: ${initResult.clientSecret ? 'Present' : 'Missing'}`);
    } else if (initResult.provider === 'paystack') {
      console.log(`   Authorization URL: ${initResult.authorization_url ? 'Present' : 'Missing'}`);
    }

    // Simulate successful payment
    console.log('🎯 Simulating successful payment...');
    const simulateResponse = await fetch(`${baseUrl}/api/payments/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        donationId: initResult.donationId,
        success: true,
      }),
    });

    const simulateResult = await simulateResponse.json();
    console.log('📤 Simulation response:', simulateResult);

    if (!simulateResult.success) {
      console.error('❌ Failed to simulate payment:', simulateResult.error);
      return;
    }

    console.log('✅ Payment simulated successfully!');
    console.log(`   Status: ${simulateResult.status}`);
    console.log(`   Message: ${simulateResult.message}`);

    // Verify donation status
    console.log('🔍 Verifying donation status...');
    const verifyResponse = await fetch(`${baseUrl}/api/donations?donationId=${initResult.donationId}`);
    const verifyResult = await verifyResponse.json();

    if (verifyResult.success && verifyResult.data && verifyResult.data.length > 0) {
      const donation = verifyResult.data[0];
      console.log('✅ Donation verified successfully!');
      console.log(`   Amount: ${donation.currency} ${donation.amount}`);
      console.log(`   Status: ${donation.paymentStatus}`);
      console.log(`   Anonymous: ${donation.isAnonymous}`);
      console.log(`   Created: ${donation.createdAt}`);
    } else {
      console.error('❌ Failed to verify donation');
    }

    console.log('\n🎉 Guest donation test completed successfully!');
    console.log('💡 Donations now work for non-authenticated users.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Payment provider configuration test
async function testPaymentConfig() {
  console.log('\n🔧 Testing payment configuration...');
  
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'PAYSTACK_SECRET_KEY',
    'PAYSTACK_PUBLIC_KEY',
  ];

  let allConfigured = true;

  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Configured`);
    } else {
      console.log(`❌ ${envVar}: Missing`);
      allConfigured = false;
    }
  });

  if (allConfigured) {
    console.log('✅ All payment providers are configured');
  } else {
    console.log('⚠️  Some payment providers are not configured');
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting guest donation tests...\n');
  
  await testPaymentConfig();
  await testGuestDonation();
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testGuestDonation, testPaymentConfig };
