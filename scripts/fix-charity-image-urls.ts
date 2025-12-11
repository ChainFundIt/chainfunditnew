import { db } from '../lib/db';
import { charities } from '../lib/schema/charities';
import { sql, eq } from 'drizzle-orm';

/**
 * Script to fix charity image URLs with "undefined/" prefix
 * Similar to the campaign image fix script
 */
async function fixCharityImageUrls() {
  try {
    console.log('🔍 Searching for charities with undefined/ in URLs...\n');
    
    // Find all charities with "undefined/" in logo or coverImage
    const affectedCharities = await db
      .select()
      .from(charities)
      .where(
        sql`(
          ${charities.logo} LIKE 'undefined/%' OR
          ${charities.coverImage} LIKE 'undefined/%'
        )`
      );
    
    if (affectedCharities.length === 0) {
      console.log('✅ No charities found with undefined/ URLs');
      return { fixed: 0, total: 0 };
    }
    
    console.log(`📋 Found ${affectedCharities.length} charity(ies) with undefined/ URLs\n`);
    
    const baseUrl = process.env.R2_PUBLIC_ACCESS_KEY;
    if (!baseUrl) {
      throw new Error('R2_PUBLIC_ACCESS_KEY environment variable is not set. Please set it before running this script.');
    }
    
    // Ensure baseUrl doesn't have a trailing slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    
    let fixedCount = 0;
    const fixedCharities: Array<{ id: string; name: string; fixes: string[] }> = [];
    
    for (const charity of affectedCharities) {
      const fixes: string[] = [];
      const updates: { logo?: string; coverImage?: string } = {};
      
      // Fix logo
      if (charity.logo && charity.logo.includes('undefined/')) {
        const fileName = charity.logo.replace('undefined/', '');
        const fixedUrl = `${cleanBaseUrl}/${fileName}`;
        updates.logo = fixedUrl;
        fixes.push(`logo: ${charity.logo} → ${fixedUrl}`);
      }
      
      // Fix coverImage
      if (charity.coverImage && charity.coverImage.includes('undefined/')) {
        const fileName = charity.coverImage.replace('undefined/', '');
        const fixedUrl = `${cleanBaseUrl}/${fileName}`;
        updates.coverImage = fixedUrl;
        fixes.push(`coverImage: ${charity.coverImage} → ${fixedUrl}`);
      }
      
      if (Object.keys(updates).length > 0) {
        await db
          .update(charities)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(charities.id, charity.id));
        
        fixedCount++;
        fixedCharities.push({
          id: charity.id,
          name: charity.name,
          fixes,
        });
        
        console.log(`✅ Fixed ${charity.name}:`);
        fixes.forEach(fix => console.log(`   ${fix}`));
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} charity(ies)`);
    
    return {
      fixed: fixedCount,
      total: affectedCharities.length,
      fixedCharities,
    };
    
  } catch (error) {
    console.error('❌ Error fixing charity image URLs:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixCharityImageUrls()
    .then((result) => {
      console.log('\n✅ Script complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { fixCharityImageUrls };
