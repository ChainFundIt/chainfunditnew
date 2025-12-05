#!/usr/bin/env tsx

/**
 * Test script to check and fix undefined/ URLs
 * 
 * Usage: npx tsx scripts/test-fix-undefined-urls.ts
 */

import { db } from '../lib/db';
import { campaigns } from '../lib/schema';
import { sql } from 'drizzle-orm';

async function testFixUndefinedUrls() {
  try {
    console.log('🔍 Checking for campaigns with undefined/ in URLs...\n');
    
    // Check current state
    const affectedCampaigns = await db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        coverImageUrl: campaigns.coverImageUrl,
        galleryImages: campaigns.galleryImages,
        documents: campaigns.documents,
      })
      .from(campaigns)
      .where(
        sql`(
          ${campaigns.coverImageUrl} LIKE 'undefined/%' OR
          ${campaigns.galleryImages} LIKE '%undefined/%' OR
          ${campaigns.documents} LIKE '%undefined/%'
        )`
      );
    
    if (affectedCampaigns.length === 0) {
      console.log('✅ No campaigns found with undefined/ URLs');
      return;
    }
    
    console.log(`📋 Found ${affectedCampaigns.length} campaign(s) with undefined/ URLs:\n`);
    
    affectedCampaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.title} (${campaign.id})`);
      if (campaign.coverImageUrl?.startsWith('undefined/')) {
        console.log(`   - Cover Image: ${campaign.coverImageUrl}`);
      }
      if (campaign.galleryImages) {
        try {
          const galleryArray = JSON.parse(campaign.galleryImages);
          if (Array.isArray(galleryArray)) {
            const hasIssues = galleryArray.some(
              (url: string) => typeof url === 'string' && url.startsWith('undefined/')
            );
            if (hasIssues) {
              console.log(`   - Gallery Images: Has undefined/ URLs`);
            }
          }
        } catch {}
      }
      if (campaign.documents) {
        try {
          const documentsArray = JSON.parse(campaign.documents);
          if (Array.isArray(documentsArray)) {
            const hasIssues = documentsArray.some(
              (url: string) => typeof url === 'string' && url.startsWith('undefined/')
            );
            if (hasIssues) {
              console.log(`   - Documents: Has undefined/ URLs`);
            }
          }
        } catch {}
      }
      console.log('');
    });
    
    // Check environment variable
    const baseUrl = process.env.R2_PUBLIC_ACCESS_KEY;
    if (!baseUrl) {
      console.error('❌ R2_PUBLIC_ACCESS_KEY environment variable is not set');
      console.log('   Please set it in your .env.local file before running the fix.');
      return;
    }
    
    console.log(`✅ R2_PUBLIC_ACCESS_KEY is set: ${baseUrl}\n`);
    console.log('💡 To fix these URLs, run: npm run fix-undefined-urls');
    console.log('   Or call the API endpoint: POST /api/admin/fix-undefined-urls\n');
    
  } catch (error) {
    console.error('❌ Error checking undefined URLs:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  testFixUndefinedUrls()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export { testFixUndefinedUrls };


