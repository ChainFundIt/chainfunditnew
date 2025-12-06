#!/usr/bin/env tsx

// Load environment variables FIRST before any other imports
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Try to load .env.local first, then .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Verify DATABASE_URL is set before proceeding
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('   Please ensure .env.local or .env file contains DATABASE_URL');
  process.exit(1);
}

/**
 * Script to update about 5 charities to "Global" category
 * This makes them appear in charity-related campaigns
 * Usage: npm run update-charities-to-global
 * or: tsx scripts/update-charities-to-global.ts
 */

async function updateCharitiesToGlobal() {
  try {
    // Dynamically import database modules after env vars are loaded
    const { db } = await import('@/lib/db');
    const { charities } = await import('@/lib/schema/charities');
    const { eq, sql, ne, and } = await import('drizzle-orm');

    console.log('🔍 Fetching charities to update to "Global" category...');

    // Fetch active, verified charities that are NOT already "Global"
    // Limit to 5-10 to give us options
    const charitiesToUpdate = await db
      .select()
      .from(charities)
      .where(
        and(
          eq(charities.isActive, true),
          eq(charities.isVerified, true),
          ne(charities.category, 'Global'),
          sql`${charities.category} IS NOT NULL`
        )
      )
      .limit(10);

    console.log(`📊 Found ${charitiesToUpdate.length} charities that can be updated`);

    if (charitiesToUpdate.length === 0) {
      console.log('⚠️  No charities found to update. All charities might already be "Global" or not active/verified.');
      return;
    }

    // Update the first 5 charities to "Global" category
    const charitiesToUpdateNow = charitiesToUpdate.slice(0, 5);
    
    console.log(`\n🔄 Updating ${charitiesToUpdateNow.length} charities to "Global" category...\n`);

    let updated = 0;
    let failed = 0;

    for (const charity of charitiesToUpdateNow) {
      try {
        const oldCategory = charity.category || 'None';
        
        await db
          .update(charities)
          .set({
            category: 'Global',
            updatedAt: new Date(),
          })
          .where(eq(charities.id, charity.id));

        console.log(`✅ Updated "${charity.name}"`);
        console.log(`   ${oldCategory} → Global`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating "${charity.name}":`, error);
        failed++;
      }
    }

    console.log(`\n✨ Summary:`);
    console.log(`   ✅ Successfully updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`\n🎉 Done! These charities will now appear in charity-related campaigns.`);

  } catch (error) {
    console.error('❌ Error updating charities:', error);
    process.exit(1);
  }
}

// Run the script
updateCharitiesToGlobal()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

