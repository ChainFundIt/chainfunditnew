import { db } from '../lib/db';
import { campaigns } from '../lib/schema';
import { like, sql } from 'drizzle-orm';

/**
 * Script to fix campaigns with "undefined/" in their image URLs
 * This fixes coverImageUrl, galleryImages, and documents fields
 */
async function fixUndefinedImageUrls() {
  try {
    console.log('🔍 Searching for campaigns with undefined/ in URLs...');
    
    // Find all campaigns with "undefined/" in any of the image URL fields
    const affectedCampaigns = await db
      .select()
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
      return { fixed: 0, total: 0 };
    }
    
    console.log(`📋 Found ${affectedCampaigns.length} campaign(s) with undefined/ URLs`);
    
    const baseUrl = process.env.R2_PUBLIC_ACCESS_KEY;
    if (!baseUrl) {
      throw new Error('R2_PUBLIC_ACCESS_KEY environment variable is not set. Please set it before running this script.');
    }
    
    // Ensure baseUrl doesn't have a trailing slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    
    let fixedCount = 0;
    
    for (const campaign of affectedCampaigns) {
      const updates: any = {
        updatedAt: new Date(),
      };
      
      // Fix coverImageUrl
      if (campaign.coverImageUrl && campaign.coverImageUrl.startsWith('undefined/')) {
        const fileName = campaign.coverImageUrl.replace('undefined/', '');
        updates.coverImageUrl = `${cleanBaseUrl}/${fileName}`;
        console.log(`  ✓ Fixed coverImageUrl for campaign "${campaign.title}" (${campaign.id})`);
        console.log(`    Old: ${campaign.coverImageUrl}`);
        console.log(`    New: ${updates.coverImageUrl}`);
      }
      
      // Fix galleryImages (JSON stringified array)
      if (campaign.galleryImages) {
        try {
          const galleryArray = JSON.parse(campaign.galleryImages);
          if (Array.isArray(galleryArray)) {
            const fixedGallery = galleryArray.map((url: string) => {
              if (typeof url === 'string' && url.startsWith('undefined/')) {
                const fileName = url.replace('undefined/', '');
                return `${cleanBaseUrl}/${fileName}`;
              }
              return url;
            });
            
            // Only update if something changed
            if (JSON.stringify(fixedGallery) !== JSON.stringify(galleryArray)) {
              updates.galleryImages = JSON.stringify(fixedGallery);
              console.log(`  ✓ Fixed galleryImages for campaign "${campaign.title}" (${campaign.id})`);
            }
          }
        } catch (e) {
          console.warn(`  ⚠ Could not parse galleryImages for campaign "${campaign.title}": ${e}`);
        }
      }
      
      // Fix documents (JSON stringified array)
      if (campaign.documents) {
        try {
          const documentsArray = JSON.parse(campaign.documents);
          if (Array.isArray(documentsArray)) {
            const fixedDocuments = documentsArray.map((url: string) => {
              if (typeof url === 'string' && url.startsWith('undefined/')) {
                const fileName = url.replace('undefined/', '');
                return `${cleanBaseUrl}/${fileName}`;
              }
              return url;
            });
            
            // Only update if something changed
            if (JSON.stringify(fixedDocuments) !== JSON.stringify(documentsArray)) {
              updates.documents = JSON.stringify(fixedDocuments);
              console.log(`  ✓ Fixed documents for campaign "${campaign.title}" (${campaign.id})`);
            }
          }
        } catch (e) {
          console.warn(`  ⚠ Could not parse documents for campaign "${campaign.title}": ${e}`);
        }
      }
      
      // Update the campaign if there are any changes
      if (Object.keys(updates).length > 1) { // More than just updatedAt
        await db
          .update(campaigns)
          .set(updates)
          .where(sql`${campaigns.id} = ${campaign.id}`);
        
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Successfully fixed ${fixedCount} out of ${affectedCampaigns.length} campaign(s)`);
    
    return { fixed: fixedCount, total: affectedCampaigns.length };
    
  } catch (error) {
    console.error('❌ Error fixing undefined image URLs:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixUndefinedImageUrls()
    .then((result) => {
      console.log(`\n🎉 Script completed: ${result.fixed}/${result.total} campaigns fixed`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { fixUndefinedImageUrls };

