import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Helper to read DATABASE_URL even if commented out
function getDatabaseUrl(): string | null {
  // First try environment variable
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Try reading from .env.local file
  try {
    const envFile = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf-8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        // Match DATABASE_URL even if commented (but not DATABASE_URL_DEV)
        const match = line.match(/^#?\s*DATABASE_URL\s*=\s*(.+)$/);
        if (match && !line.includes('DATABASE_URL_DEV')) {
          let url = match[1].trim();
          // Remove quotes if present
          url = url.replace(/^["']|["']$/g, '');
          // Remove trailing comment if present
          url = url.split('#')[0].trim();
          return url;
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  return null;
}

/**
 * Compare production and development databases
 * 
 * Shows:
 * - Tables in production but not in development
 * - Tables in development but not in production
 * - Tables in both
 * 
 * Usage: npx tsx scripts/compare-databases.ts
 */

async function getTables(sql: any): Promise<string[]> {
  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  const result = await sql.query(query) as any[];
  return result.map((row: any) => row.table_name);
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  const databaseUrlDev = process.env.DATABASE_URL_DEV;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    console.error('   Please ensure DATABASE_URL (production) is set');
    console.error('   It can be commented out, but the value must be present');
    console.error('   Example: # DATABASE_URL=postgresql://...');
    process.exit(1);
  }

  if (!databaseUrlDev) {
    console.error('❌ DATABASE_URL_DEV is not set in .env.local');
    process.exit(1);
  }

  console.log('🔍 Comparing Production and Development databases...\n');

  try {
    // Connect to both databases
    const prodSql = neon(databaseUrl, {
      arrayMode: false,
      fullResults: false,
    });

    const devSql = neon(databaseUrlDev, {
      arrayMode: false,
      fullResults: false,
    });

    // Test connections
    console.log('1️⃣  Testing connections...');
    try {
      await Promise.race([
        prodSql.query(`SELECT 1 as test`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Production connection timeout')), 30000)
        ),
      ]);
      console.log('   ✅ Production: Connected');
    } catch (error: any) {
      console.error('   ❌ Production: Connection failed -', error.message);
      process.exit(1);
    }

    try {
      await Promise.race([
        devSql.query(`SELECT 1 as test`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Development connection timeout')), 30000)
        ),
      ]);
      console.log('   ✅ Development: Connected\n');
    } catch (error: any) {
      console.error('   ❌ Development: Connection failed -', error.message);
      process.exit(1);
    }

    // Get tables from both
    console.log('2️⃣  Getting table lists...');
    const prodTables = await getTables(prodSql);
    const devTables = await getTables(devSql);
    
    console.log(`   Production: ${prodTables.length} tables`);
    console.log(`   Development: ${devTables.length} tables\n`);

    // Compare
    const prodSet = new Set(prodTables);
    const devSet = new Set(devTables);

    const onlyInProd = prodTables.filter(t => !devSet.has(t));
    const onlyInDev = devTables.filter(t => !prodSet.has(t));
    const inBoth = prodTables.filter(t => devSet.has(t));

    // Display results
    console.log('='.repeat(60));
    console.log('📊 COMPARISON RESULTS');
    console.log('='.repeat(60));

    console.log(`\n✅ Tables in BOTH databases (${inBoth.length}):`);
    if (inBoth.length > 0) {
      inBoth.forEach(table => console.log(`   - ${table}`));
    } else {
      console.log('   (none)');
    }

    if (onlyInProd.length > 0) {
      console.log(`\n⚠️  Tables ONLY in PRODUCTION (${onlyInProd.length}):`);
      onlyInProd.forEach(table => console.log(`   - ${table}`));
      console.log('\n💡 These tables are missing from development!');
      console.log('   You may need to run migrations or create these tables manually.');
    }

    if (onlyInDev.length > 0) {
      console.log(`\n⚠️  Tables ONLY in DEVELOPMENT (${onlyInDev.length}):`);
      onlyInDev.forEach(table => console.log(`   - ${table}`));
      console.log('\n💡 These tables exist in development but not in production.');
      console.log('   This might indicate development has newer migrations.');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Production tables: ${prodTables.length}`);
    console.log(`   Development tables: ${devTables.length}`);
    console.log(`   Missing from development: ${onlyInProd.length}`);
    console.log(`   Extra in development: ${onlyInDev.length}`);
    console.log(`   Common tables: ${inBoth.length}`);

    if (onlyInProd.length > 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('   Development branch is missing tables from production.');
      console.log('\n💡 Solutions:');
      console.log('   1. Run migrations on development:');
      console.log('      npx tsx scripts/db-switch.ts migrate dev');
      console.log('   2. If migrations fail, check which migrations create these tables');
      console.log('   3. You may need to manually create missing tables');
      console.log('   4. Or reset the development branch and run all migrations fresh');
    } else if (onlyInDev.length > 0) {
      console.log('\nℹ️  NOTE:');
      console.log('   Development has some tables that production doesn\'t.');
      console.log('   This might be expected if you have newer migrations.');
    } else {
      console.log('\n✅ Both databases have the same tables!');
    }

    console.log('\n' + '='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Error comparing databases:', error.message);
    if (error.message?.includes('timeout') || error.message?.includes('fetch failed')) {
      console.error('\n💡 Connection timeout - try:');
      console.error('   1. Wake up the database branch in Neon dashboard');
      console.error('   2. Wait 10-30 seconds');
      console.error('   3. Try again');
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

