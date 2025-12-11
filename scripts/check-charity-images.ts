import { db } from '../lib/db';
import { charities } from '../lib/schema/charities';
import { sql } from 'drizzle-orm';

/**
 * Script to check charity image URLs and identify issues
 */
async function checkCharityImages() {
  try {
    console.log('🔍 Checking charity images...\n');
    
    // Get all charities
    const allCharities = await db.select().from(charities);
    
    console.log(`📊 Total charities: ${allCharities.length}\n`);
    
    const issues = {
      noLogo: [] as any[],
      noCoverImage: [] as any[],
      invalidLogo: [] as any[],
      invalidCoverImage: [] as any[],
      undefinedPrefix: [] as any[],
      validImages: [] as any[],
    };
    
    for (const charity of allCharities) {
      const problems: string[] = [];
      
      // Check logo
      if (!charity.logo || charity.logo.trim() === '') {
        issues.noLogo.push(charity);
        problems.push('no logo');
      } else if (charity.logo.includes('undefined/')) {
        issues.undefinedPrefix.push({ ...charity, field: 'logo', url: charity.logo });
        problems.push('logo has undefined/ prefix');
      } else if (!charity.logo.startsWith('http://') && !charity.logo.startsWith('https://') && !charity.logo.startsWith('/')) {
        issues.invalidLogo.push({ ...charity, url: charity.logo });
        problems.push('invalid logo format');
      }
      
      // Check coverImage
      if (!charity.coverImage || charity.coverImage.trim() === '') {
        issues.noCoverImage.push(charity);
        problems.push('no cover image');
      } else if (charity.coverImage.includes('undefined/')) {
        issues.undefinedPrefix.push({ ...charity, field: 'coverImage', url: charity.coverImage });
        problems.push('coverImage has undefined/ prefix');
      } else if (!charity.coverImage.startsWith('http://') && !charity.coverImage.startsWith('https://') && !charity.coverImage.startsWith('/')) {
        issues.invalidCoverImage.push({ ...charity, url: charity.coverImage });
        problems.push('invalid coverImage format');
      }
      
      if (problems.length === 0) {
        issues.validImages.push(charity);
      }
    }
    
    // Print summary
    console.log('📋 Summary:\n');
    console.log(`✅ Valid images: ${issues.validImages.length}`);
    console.log(`❌ No logo: ${issues.noLogo.length}`);
    console.log(`❌ No cover image: ${issues.noCoverImage.length}`);
    console.log(`⚠️  Invalid logo format: ${issues.invalidLogo.length}`);
    console.log(`⚠️  Invalid coverImage format: ${issues.invalidCoverImage.length}`);
    console.log(`🔧 Undefined prefix issues: ${issues.undefinedPrefix.length}\n`);
    
    // Show examples of problematic URLs
    if (issues.undefinedPrefix.length > 0) {
      console.log('🔧 Charities with undefined/ prefix:');
      issues.undefinedPrefix.slice(0, 5).forEach((charity: any) => {
        console.log(`  - ${charity.name} (${charity.field}): ${charity.url}`);
      });
      if (issues.undefinedPrefix.length > 5) {
        console.log(`  ... and ${issues.undefinedPrefix.length - 5} more`);
      }
      console.log('');
    }
    
    if (issues.invalidLogo.length > 0) {
      console.log('⚠️  Invalid logo URLs:');
      issues.invalidLogo.slice(0, 5).forEach((charity: any) => {
        console.log(`  - ${charity.name}: ${charity.url}`);
      });
      if (issues.invalidLogo.length > 5) {
        console.log(`  ... and ${issues.invalidLogo.length - 5} more`);
      }
      console.log('');
    }
    
    if (issues.invalidCoverImage.length > 0) {
      console.log('⚠️  Invalid coverImage URLs:');
      issues.invalidCoverImage.slice(0, 5).forEach((charity: any) => {
        console.log(`  - ${charity.name}: ${charity.url}`);
      });
      if (issues.invalidCoverImage.length > 5) {
        console.log(`  ... and ${issues.invalidCoverImage.length - 5} more`);
      }
      console.log('');
    }
    
    // Show some valid examples
    if (issues.validImages.length > 0) {
      console.log('✅ Example valid image URLs:');
      const example = issues.validImages[0];
      if (example.logo) {
        console.log(`  Logo: ${example.logo}`);
      }
      if (example.coverImage) {
        console.log(`  Cover: ${example.coverImage}`);
      }
      console.log('');
    }
    
    return {
      total: allCharities.length,
      valid: issues.validImages.length,
      issues: {
        noLogo: issues.noLogo.length,
        noCoverImage: issues.noCoverImage.length,
        invalidLogo: issues.invalidLogo.length,
        invalidCoverImage: issues.invalidCoverImage.length,
        undefinedPrefix: issues.undefinedPrefix.length,
      },
      details: issues,
    };
    
  } catch (error) {
    console.error('❌ Error checking charity images:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  checkCharityImages()
    .then((result) => {
      console.log('\n✅ Check complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { checkCharityImages };
