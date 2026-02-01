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
import { eq, sql } from 'drizzle-orm';

/**
 * Script to replace Clearbit logo URLs with favicon-based URLs.
 * Clearbit often 403s, and the UI hides clearbit URLs by design.
 */

const logoOverrides: Record<string, string> = {
  'mentally-aware-nigeria-initiative': '/images/MANI.png',
  'education-as-a-vaccine': '/images/EV.png',
};

function isClearbitLogo(url?: string | null): boolean {
  return Boolean(url && url.includes('logo.clearbit.com'));
}

function safeDomainFromWebsite(website?: string | null): string | null {
  if (!website) return null;
  try {
    const u = new URL(website);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function getFaviconUrlForDomain(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
}

async function fixCharityLogos() {
  try {
    console.log('🔧 Fixing charity logos...\n');

    const clearbitCharities = await db
      .select()
      .from(charities)
      .where(sql`${charities.logo} LIKE '%logo.clearbit.com%'`);

    if (clearbitCharities.length === 0) {
      console.log('✅ No charities found with Clearbit logos.');
      return;
    }

    let fixed = 0;
    let skipped = 0;

    for (const charity of clearbitCharities) {
      const overrideLogo = logoOverrides[charity.slug];
      const domain = safeDomainFromWebsite(charity.website);
      const fallbackLogo = domain ? getFaviconUrlForDomain(domain) : null;
      const nextLogo = overrideLogo || fallbackLogo;

      if (nextLogo && isClearbitLogo(charity.logo)) {
        await db.update(charities)
          .set({ 
            logo: nextLogo,
            updatedAt: new Date(),
          })
          .where(eq(charities.id, charity.id));
        
        console.log(`✅ Replaced logo for ${charity.name}: ${nextLogo}`);
        fixed++;
      } else if (nextLogo) {
        console.log(`⏭️  Skipped ${charity.name} (current logo is not clearbit)`);
        skipped++;
      } else {
        console.log(`⚠️  No fallback logo for ${charity.name} (slug: ${charity.slug})`);
      }
    }

    console.log(`\n✨ Done! Replaced ${fixed} logos, skipped ${skipped} charities.`);
  } catch (error) {
    console.error('❌ Error fixing logos:', error);
    process.exit(1);
  }
}

fixCharityLogos();

