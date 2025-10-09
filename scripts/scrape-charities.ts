#!/usr/bin/env tsx

import { CharityScraperFactory, GenericCharityScraper } from '@/lib/scrapers/charity-scraper';

/**
 * Script to scrape charity directories
 * Usage: npm run scrape-charities
 */

async function main() {
  console.log('Starting charity scraping...\n');

  const factory = new CharityScraperFactory();

  // Example: Add a custom scraper for a charity directory
  // You can customize these for actual charity websites
  
  // Example 1: UK Charity Commission
  factory.addScraper(new GenericCharityScraper({
    name: 'Sample Charity Directory',
    baseUrl: 'https://example-charity-directory.org',
    urls: [
      'https://example-charity-directory.org/charities/page/1',
      // Add more URLs as needed
    ],
    selectors: {
      container: '.charity-item', // CSS selector for charity container
      name: '.charity-name',
      description: '.charity-description',
      website: 'a.website',
      category: '.category',
    }
  }));

  // Example 2: Add more scrapers for different directories
  // factory.addScraper(new AnotherCustomScraper());

  try {
    await factory.scrapeAndSave();
    console.log('\n✅ Scraping completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during scraping:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);

