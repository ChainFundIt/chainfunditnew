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
 * Script to add categories to charities that don't have one
 * Usage: npm run add-charity-categories
 * or: tsx scripts/add-charity-categories.ts
 */

// Valid charity categories
const VALID_CATEGORIES = [
  'Health',
  'Education',
  'Children',
  'Children & Youth',
  'Community',
  'Housing',
  'Housing & Shelter',
  'Environment',
  'Arts',
  'Disaster Relief',
  'Employment & Training',
  'Global',
  'Hunger & Poverty',
  'Water & Sanitation',
];

// Keyword mapping for category detection
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Health': [
    'health', 'medical', 'hospital', 'clinic', 'doctor', 'nurse', 'medicine', 'healthcare',
    'cancer', 'disease', 'treatment', 'wellness', 'mental health', 'therapy', 'surgery',
    'pediatric', 'maternal', 'reproductive', 'vaccine', 'immunization', 'stethoscope'
  ],
  'Education': [
    'education', 'school', 'university', 'college', 'learn', 'teach', 'student', 'teacher',
    'literacy', 'reading', 'writing', 'academic', 'scholarship', 'curriculum', 'classroom',
    'learning', 'training', 'knowledge', 'graduate', 'diploma', 'degree'
  ],
  'Children & Youth': [
    'children', 'child', 'youth', 'kid', 'teen', 'teenager', 'orphan', 'orphanage',
    'foster', 'adoption', 'pediatric', 'juvenile', 'young', 'minor', 'underage',
    'school age', 'playground', 'daycare', 'nursery'
  ],
  'Children': [
    'children', 'child', 'kid', 'orphan', 'orphanage', 'foster', 'adoption', 'pediatric',
    'young', 'minor', 'school age', 'playground', 'daycare', 'nursery'
  ],
  'Community': [
    'community', 'neighborhood', 'local', 'civic', 'social', 'society', 'public',
    'residents', 'citizens', 'town', 'village', 'district', 'area', 'region'
  ],
  'Housing & Shelter': [
    'housing', 'shelter', 'home', 'homeless', 'homelessness', 'affordable housing',
    'residential', 'accommodation', 'dwelling', 'habitat', 'housing project',
    'emergency shelter', 'transitional housing'
  ],
  'Housing': [
    'housing', 'shelter', 'home', 'homeless', 'affordable housing', 'residential',
    'accommodation', 'dwelling', 'habitat'
  ],
  'Environment': [
    'environment', 'environmental', 'nature', 'wildlife', 'conservation', 'climate',
    'green', 'sustainable', 'ecology', 'ecosystem', 'forest', 'ocean', 'water',
    'pollution', 'recycling', 'renewable', 'carbon', 'emission', 'biodiversity',
    'habitat', 'species', 'endangered', 'preservation', 'planet', 'earth'
  ],
  'Arts': [
    'art', 'arts', 'artistic', 'culture', 'cultural', 'music', 'musical', 'dance',
    'theater', 'theatre', 'performance', 'creative', 'creativity', 'artist', 'gallery',
    'museum', 'exhibition', 'show', 'concert', 'symphony', 'orchestra'
  ],
  'Disaster Relief': [
    'disaster', 'emergency', 'relief', 'crisis', 'catastrophe', 'calamity', 'flood',
    'earthquake', 'hurricane', 'tornado', 'tsunami', 'fire', 'wildfire', 'drought',
    'famine', 'refugee', 'evacuation', 'rescue', 'aid', 'humanitarian'
  ],
  'Employment & Training': [
    'employment', 'job', 'work', 'career', 'training', 'skill', 'vocational',
    'workforce', 'unemployment', 'job training', 'professional', 'employment services',
    'job placement', 'career development', 'workplace', 'entrepreneurship', 'business'
  ],
  'Global': [
    'global', 'international', 'worldwide', 'world', 'worldwide', 'cross-border',
    'multinational', 'universal', 'humanitarian', 'aid', 'development'
  ],
  'Hunger & Poverty': [
    'hunger', 'hungry', 'food', 'poverty', 'poor', 'impoverished', 'malnutrition',
    'starvation', 'famine', 'food security', 'food bank', 'feeding', 'meal',
    'nutrition', 'soup kitchen', 'food pantry', 'food assistance', 'food aid'
  ],
  'Water & Sanitation': [
    'water', 'sanitation', 'clean water', 'drinking water', 'well', 'aqua', 'hydrate',
    'irrigation', 'sewage', 'wastewater', 'toilet', 'latrine', 'hygiene', 'wash',
    'water project', 'water well', 'water access', 'water supply', 'water system'
  ],
};

/**
 * Detect category based on charity name, description, and mission
 */
function detectCategory(charity: any): string | null {
  const text = [
    charity.name || '',
    charity.description || '',
    charity.mission || '',
  ].join(' ').toLowerCase();

  // Score each category based on keyword matches
  const scores: Record<string, number> = {};
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > 0) {
      scores[category] = score;
    }
  }

  // Return the category with the highest score
  if (Object.keys(scores).length === 0) {
    return null;
  }

  const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  // If there's a clear winner (at least 2 points more than second place), use it
  if (sortedCategories.length > 0) {
    const [topCategory, topScore] = sortedCategories[0];
    if (sortedCategories.length === 1 || topScore > (sortedCategories[1]?.[1] || 0) + 1) {
      return topCategory;
    }
  }

  return null;
}

async function addCharityCategories() {
  try {
    // Dynamically import database modules after env vars are loaded
    const { db } = await import('@/lib/db');
    const { charities } = await import('@/lib/schema/charities');
    const { sql, isNull, or, eq } = await import('drizzle-orm');

    console.log('🔍 Fetching charities without categories...');

    // Fetch charities that don't have a category or have null category
    const charitiesWithoutCategory = await db
      .select()
      .from(charities)
      .where(or(isNull(charities.category), sql`${charities.category} = ''`))
      .limit(100); // Process in batches

    console.log(`📊 Found ${charitiesWithoutCategory.length} charities without categories`);

    if (charitiesWithoutCategory.length === 0) {
      console.log('✅ All charities already have categories!');
      return;
    }

    let updated = 0;
    let skipped = 0;

    for (const charity of charitiesWithoutCategory) {
      const detectedCategory = detectCategory(charity);

      if (detectedCategory) {
        try {
          await db
            .update(charities)
            .set({
              category: detectedCategory,
              updatedAt: new Date(),
            })
            .where(eq(charities.id, charity.id));

          console.log(`✅ Updated "${charity.name}" → ${detectedCategory}`);
          updated++;
        } catch (error) {
          console.error(`❌ Error updating "${charity.name}":`, error);
        }
      } else {
        // Assign a default category if we can't detect one
        const defaultCategory = 'Global';
        try {
          await db
            .update(charities)
            .set({
              category: defaultCategory,
              updatedAt: new Date(),
            })
            .where(eq(charities.id, charity.id));

          console.log(`⚠️  Assigned default category "${defaultCategory}" to "${charity.name}"`);
          updated++;
        } catch (error) {
          console.error(`❌ Error updating "${charity.name}":`, error);
        }
      }
    }

    console.log(`\n✨ Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`\n🎉 Done!`);

  } catch (error) {
    console.error('❌ Error adding charity categories:', error);
    process.exit(1);
  }
}

// Run the script
addCharityCategories()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

