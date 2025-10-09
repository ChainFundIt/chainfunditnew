/**
 * Complete Example: Using the Charity API System
 * 
 * This file demonstrates how to use all parts of the charity system:
 * - Scraping charities
 * - Managing charities via API
 * - Processing donations
 * - Handling payouts
 */

import { 
  GenericCharityScraper,
  CharityScraperFactory 
} from '@/lib/scrapers/charity-scraper';

import {
  createCharityPayout,
  processCharityPayout,
  getCharitiesEligibleForPayout,
  processBatchPayouts
} from '@/lib/payments/charity-payouts';

// ============================================
// EXAMPLE 1: Scraping Charities
// ============================================

async function exampleScrapeCharities() {
  console.log('Example 1: Scraping Charities\n');

  // Create a custom scraper
  const scraper = new GenericCharityScraper({
    name: 'Example Charity Directory',
    baseUrl: 'https://example-charities.org',
    urls: [
      'https://example-charities.org/list/page-1',
      'https://example-charities.org/list/page-2',
    ],
    selectors: {
      container: '.charity-card',
      name: 'h3.name',
      description: 'p.description',
      website: 'a.website',
      email: 'a.email',
      category: 'span.category',
    }
  });

  // Scrape and save
  const charities = await scraper.scrape();
  console.log(`Found ${charities.length} charities`);
  
  await scraper.saveToDatabase(charities);
  console.log('Saved to database!\n');
}

// ============================================
// EXAMPLE 2: Managing Charities via API
// ============================================

async function exampleManageCharities() {
  console.log('Example 2: Managing Charities via API\n');

  // Create a new charity
  const createResponse = await fetch('http://localhost:3000/api/charities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Tech for Good Foundation',
      description: 'Providing technology education to underserved communities',
      category: 'Education',
      email: 'info@techforgood.org',
      website: 'https://techforgood.org',
      country: 'United States',
      focusAreas: ['Technology', 'Education', 'Youth Development'],
      isVerified: true,
      isActive: true,
      // Banking info for payouts
      bankName: 'Bank of America',
      accountNumber: '1234567890',
      accountName: 'Tech for Good Foundation',
    })
  });

  const { charity } = await createResponse.json();
  console.log('Created charity:', charity.name, charity.id);

  // Get all charities with filters
  const listResponse = await fetch(
    'http://localhost:3000/api/charities?' + new URLSearchParams({
      category: 'Education',
      verified: 'true',
      page: '1',
      limit: '10',
      sortBy: 'donations',
      sortOrder: 'desc'
    })
  );

  const { charities, pagination } = await listResponse.json();
  console.log(`Found ${charities.length} education charities`);
  console.log(`Total: ${pagination.totalCount}\n`);

  // Update charity
  const updateResponse = await fetch(`http://localhost:3000/api/charities/${charity.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Updated description with more details',
      focusAreas: ['Technology', 'Education', 'Youth Development', 'Digital Literacy'],
    })
  });

  console.log('Updated charity successfully\n');
}

// ============================================
// EXAMPLE 3: Processing Donations
// ============================================

async function exampleProcessDonations() {
  console.log('Example 3: Processing Donations\n');

  const charityId = 'some-charity-id'; // Replace with actual ID

  // Create a donation
  const donationResponse = await fetch(
    `http://localhost:3000/api/charities/${charityId}/donate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100,
        currency: 'USD',
        donorName: 'Jane Smith',
        donorEmail: 'jane@example.com',
        message: 'Keep up the amazing work!',
        isAnonymous: false,
        paymentMethod: 'stripe',
      })
    }
  );

  const { donation } = await donationResponse.json();
  console.log('Donation created:', donation.id);
  console.log('Amount:', donation.amount, donation.currency);

  // Get all donations for a charity
  const donationsResponse = await fetch(
    `http://localhost:3000/api/charities/${charityId}/donate?page=1&limit=20`
  );

  const { donations } = await donationsResponse.json();
  console.log(`Charity has ${donations.length} donations\n`);
}

// ============================================
// EXAMPLE 4: Managing Payouts (Programmatic)
// ============================================

async function exampleManagePayouts() {
  console.log('Example 4: Managing Payouts (Programmatic)\n');

  const charityId = 'some-charity-id'; // Replace with actual ID

  // Check eligible charities
  const eligible = await getCharitiesEligibleForPayout(100); // min $100
  console.log(`Found ${eligible.length} charities eligible for payout`);

  eligible.forEach(({ charity, pendingAmount, donationCount }) => {
    console.log(`- ${charity.name}: $${pendingAmount} (${donationCount} donations)`);
  });

  // Create a payout for a specific charity
  const result = await createCharityPayout({
    charityId,
    minAmount: 50,
  });

  if (result.success) {
    console.log('\nPayout created successfully!');
    console.log(`Payout ID: ${result.payoutId}`);
    console.log(`Amount: $${result.amount}`);
    console.log(`Donations: ${result.donationCount}`);

    // Process the payout (mark as completed)
    const processResult = await processCharityPayout(
      result.payoutId!,
      'completed'
    );

    if (processResult.success) {
      console.log('Payout processed successfully!\n');
    }
  } else {
    console.log(`Failed to create payout: ${result.error}\n`);
  }
}

// ============================================
// EXAMPLE 5: Managing Payouts via API
// ============================================

async function examplePayoutsAPI() {
  console.log('Example 5: Managing Payouts via API\n');

  const charityId = 'some-charity-id';

  // Create a payout via API
  const createPayoutResponse = await fetch(
    'http://localhost:3000/api/charities/payouts',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        charityId,
        amount: 500,
        currency: 'USD',
        donationIds: ['donation-1', 'donation-2', 'donation-3'],
        paymentMethod: 'bank_transfer',
      })
    }
  );

  const { payout } = await createPayoutResponse.json();
  console.log('Payout created:', payout.reference);

  // List all payouts
  const listPayoutsResponse = await fetch(
    'http://localhost:3000/api/charities/payouts?' + new URLSearchParams({
      status: 'pending',
      limit: '20',
    })
  );

  const { payouts } = await listPayoutsResponse.json();
  console.log(`Found ${payouts.length} pending payouts`);

  // Update payout status
  const updatePayoutResponse = await fetch(
    `http://localhost:3000/api/charities/payouts/${payout.id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'completed',
      })
    }
  );

  console.log('Payout marked as completed\n');
}

// ============================================
// EXAMPLE 6: Batch Processing Payouts
// ============================================

async function exampleBatchPayouts() {
  console.log('Example 6: Batch Processing Payouts\n');

  // Process all eligible charities at once
  const results = await processBatchPayouts(100); // min $100

  console.log(`Processed ${results.length} charities`);
  console.log('\nResults:');

  results.forEach(result => {
    if (result.success) {
      console.log(`✓ ${result.charityName}: $${result.amount} (${result.donationCount} donations)`);
    } else {
      console.log(`✗ ${result.charityName}: ${result.error}`);
    }
  });

  const successful = results.filter(r => r.success).length;
  const totalAmount = results.reduce((sum, r) => sum + r.amount, 0);

  console.log(`\nSummary:`);
  console.log(`- Successful: ${successful}/${results.length}`);
  console.log(`- Total Amount: $${totalAmount}\n`);
}

// ============================================
// EXAMPLE 7: Using React Hooks in Components
// ============================================

// In a React component:
/*
import { useCharities, useCharity } from '@/hooks/use-charities';

function CharityList() {
  const { charities, pagination, loading } = useCharities({
    category: 'Education',
    verified: true,
    page: 1,
    limit: 12,
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {charities.map(charity => (
        <CharityCard key={charity.id} charity={charity} />
      ))}
    </div>
  );
}

function CharityDetail({ slug }: { slug: string }) {
  const { charity, stats, loading } = useCharity(slug);

  if (loading) return <div>Loading...</div>;
  if (!charity) return <div>Not found</div>;

  return (
    <div>
      <h1>{charity.name}</h1>
      <p>{charity.description}</p>
      <p>Total Raised: ${stats?.totalAmount}</p>
    </div>
  );
}
*/

// ============================================
// Run All Examples
// ============================================

async function runAllExamples() {
  try {
    // Uncomment to run specific examples:
    
    // await exampleScrapeCharities();
    // await exampleManageCharities();
    // await exampleProcessDonations();
    // await exampleManagePayouts();
    // await examplePayoutsAPI();
    // await exampleBatchPayouts();

    console.log('Examples completed!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export for use
export {
  exampleScrapeCharities,
  exampleManageCharities,
  exampleProcessDonations,
  exampleManagePayouts,
  examplePayoutsAPI,
  exampleBatchPayouts,
  runAllExamples,
};

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}

