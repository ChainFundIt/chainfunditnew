#!/usr/bin/env tsx

// Load environment variables FIRST, before any other imports
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config(); // Fallback to .env

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('   Please ensure .env.local or .env file contains DATABASE_URL');
  process.exit(1);
}

import { db } from '@/lib/db';
import { charities } from '@/lib/schema/charities';
import { eq, isNull, or } from 'drizzle-orm';

/**
 * Script to fix charity logos that may have been lost
 * This restores logos from the seed data without attempting R2 uploads
 */

const charityLogos: Record<string, string> = {
  'save-the-children': 'https://logo.clearbit.com/savethechildren.org',
  'doctors-without-borders': 'https://logo.clearbit.com/doctorswithoutborders.org',
  'world-wildlife-fund': 'https://logo.clearbit.com/worldwildlife.org',
  'unicef': 'https://logo.clearbit.com/unicef.org',
  'oxfam-international': 'https://logo.clearbit.com/oxfam.org',
  'care-international': 'https://logo.clearbit.com/care.org',
  'plan-international': 'https://logo.clearbit.com/plan-international.org',
  'water-org': 'https://logo.clearbit.com/water.org',
  'islamic-relief-worldwide': 'https://logo.clearbit.com/islamic-relief.org',
  'nigerian-red-cross-society': 'https://www.google.com/s2/favicons?domain=redcrossnigeria.org&sz=256',
  'tony-elumelu-foundation': 'https://logo.clearbit.com/tonyelumelufoundation.org',
  'slum2school-africa': 'https://logo.clearbit.com/slum2school.org',
  'fate-foundation': 'https://logo.clearbit.com/fatefoundation.org',
  'project-pink-blue': 'https://logo.clearbit.com/projectpinkblue.org',
  'mentally-aware-nigeria-initiative': '/images/MANI.png',
  'she-writes-woman': 'https://logo.clearbit.com/shewriteswoman.org',
  'the-bloom-foundation': 'https://logo.clearbit.com/thebloomfoundation.org',
  'african-leadership-academy': 'https://logo.clearbit.com/africanleadershipacademy.org',
  'education-as-a-vaccine': '/images/EV.png',
  'feeding-america': 'https://logo.clearbit.com/feedingamerica.org',
  'habitat-for-humanity': 'https://logo.clearbit.com/habitat.org',
  'american-red-cross': 'https://logo.clearbit.com/redcross.org',
  'the-nature-conservancy': 'https://logo.clearbit.com/nature.org',
  'direct-relief': 'https://logo.clearbit.com/directrelief.org',
  'goodwill-industries': 'https://logo.clearbit.com/goodwill.org',
  'room-to-read': 'https://logo.clearbit.com/roomtoread.org',
  'kiva': 'https://logo.clearbit.com/kiva.org',
  'charity-water': 'https://logo.clearbit.com/charitywater.org',
  'heifer-international': 'https://logo.clearbit.com/heifer.org',
  'fomwan-orphanage': 'https://www.google.com/s2/favicons?domain=fomwanofficial.org&sz=256',
};

async function fixCharityLogos() {
  try {
    console.log('🔧 Fixing charity logos...\n');

    const allCharities = await db.query.charities.findMany();

    let fixed = 0;
    let skipped = 0;

    for (const charity of allCharities) {
      const expectedLogo = charityLogos[charity.slug];
      
      // Only update if:
      // 1. We have an expected logo for this charity
      // 2. The current logo is missing, empty, or null
      const needsUpdate = expectedLogo && (!charity.logo || charity.logo.trim() === '');

      if (needsUpdate) {
        await db.update(charities)
          .set({ 
            logo: expectedLogo,
            updatedAt: new Date(),
          })
          .where(eq(charities.id, charity.id));
        
        console.log(`✅ Fixed logo for ${charity.name}: ${expectedLogo}`);
        fixed++;
      } else if (expectedLogo) {
        console.log(`⏭️  Skipped ${charity.name} (already has logo: ${charity.logo?.substring(0, 50)}...)`);
        skipped++;
      } else {
        console.log(`⚠️  No logo mapping for ${charity.name} (slug: ${charity.slug})`);
      }
    }

    console.log(`\n✨ Done! Fixed ${fixed} logos, skipped ${skipped} charities.`);
  } catch (error) {
    console.error('❌ Error fixing logos:', error);
    process.exit(1);
  }
}

fixCharityLogos();

