import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import * as schema from '../lib/schema';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Script to audit database data and identify production vs development data
 * 
 * This helps you verify what data you're about to migrate
 * 
 * Usage: npx tsx scripts/audit-database-data.ts
 */

interface TableStats {
  tableName: string;
  rowCount: number;
  sampleData: any[];
  hasProductionIndicators: boolean;
  productionIndicators: string[];
}

// Common indicators of production data
const PRODUCTION_INDICATORS = {
  emails: [
    /@(gmail|yahoo|hotmail|outlook|icloud|protonmail)\./i, // Real email domains
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, // Valid email format (not test@test.com)
  ],
  domains: [
    /^https?:\/\/(?!localhost|127\.0\.0\.1|test|example|dev|staging)/i, // Real domains
  ],
  amounts: {
    minRealisticAmount: 100, // Minimum realistic donation/campaign amount
  },
  dates: {
    // Data older than 30 days might be production
    oldDataThreshold: 30,
  },
};

function checkProductionIndicators(tableName: string, sampleRows: any[]): {
  hasProductionIndicators: boolean;
  indicators: string[];
} {
  const indicators: string[] = [];
  let hasProduction = false;

  for (const row of sampleRows) {
    // Check emails
    if (row.email) {
      const email = String(row.email).toLowerCase();
      if (PRODUCTION_INDICATORS.emails.some(regex => regex.test(email))) {
        if (!indicators.includes('Real email addresses')) {
          indicators.push('Real email addresses');
          hasProduction = true;
        }
      }
      // Check for test/dev patterns
      if (email.includes('test@') || email.includes('dev@') || email.includes('example@')) {
        // This is likely test data
      } else if (email.includes('@') && !email.includes('test') && !email.includes('example')) {
        if (!indicators.includes('Non-test email addresses')) {
          indicators.push('Non-test email addresses');
          hasProduction = true;
        }
      }
    }

    // Check URLs/domains
    if (row.imageUrl || row.url || row.website) {
      const url = String(row.imageUrl || row.url || row.website);
      if (PRODUCTION_INDICATORS.domains.some(regex => regex.test(url))) {
        if (!indicators.includes('Real domain URLs')) {
          indicators.push('Real domain URLs');
          hasProduction = true;
        }
      }
    }

    // Check amounts (for donations, campaigns)
    if (row.amount && typeof row.amount === 'number') {
      if (row.amount >= PRODUCTION_INDICATORS.amounts.minRealisticAmount) {
        if (!indicators.includes('Realistic payment amounts')) {
          indicators.push('Realistic payment amounts');
          hasProduction = true;
        }
      }
    }

    // Check dates
    if (row.createdAt) {
      const createdAt = new Date(row.createdAt);
      const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld > PRODUCTION_INDICATORS.dates.oldDataThreshold) {
        if (!indicators.includes('Data older than 30 days')) {
          indicators.push('Data older than 30 days');
          hasProduction = true;
        }
      }
    }

    // Check for real names (not "Test User", "John Doe", etc.)
    if (row.fullName || row.name) {
      const name = String(row.fullName || row.name);
      const testNames = ['test', 'john doe', 'jane doe', 'admin', 'user'];
      if (!testNames.some(testName => name.toLowerCase().includes(testName))) {
        if (!indicators.includes('Real user names')) {
          indicators.push('Real user names');
          hasProduction = true;
        }
      }
    }

    // Check payment status
    if (row.paymentStatus === 'completed' && row.amount) {
      if (!indicators.includes('Completed payments')) {
        indicators.push('Completed payments');
        hasProduction = true;
      }
    }
  }

  return { hasProductionIndicators: hasProduction, indicators };
}

async function getTableStats(
  sql: any,
  db: ReturnType<typeof drizzle>,
  tableName: string
): Promise<TableStats> {
  // Get row count
  const countQuery = `SELECT COUNT(*) as count FROM "${tableName}";`;
  const countResult = await sql.query(countQuery) as any[];
  const rowCount = parseInt(countResult[0]?.count || '0', 10);

  // Get sample data (first 10 rows)
  const sampleQuery = `SELECT * FROM "${tableName}" LIMIT 10;`;
  const sampleResult = await sql.query(sampleQuery) as any[];
  const sampleData = sampleResult;

  // Check for production indicators
  const { hasProductionIndicators, indicators } = checkProductionIndicators(
    tableName,
    sampleData
  );

  return {
    tableName,
    rowCount,
    sampleData: sampleData.slice(0, 3), // Only show first 3 for display
    hasProductionIndicators,
    productionIndicators: indicators,
  };
}

async function getDatabaseInfo(sql: any): Promise<{
  databaseName: string;
  connectionInfo: string;
}> {
  const result = await sql.query(`SELECT current_database() as db_name, current_user as user_name;`) as any[];
  const row = result[0] as any;
  return {
    databaseName: row?.db_name || 'unknown',
    connectionInfo: `${row?.user_name || 'unknown'}@${row?.db_name || 'unknown'}`,
  };
}

async function main() {
  // Allow using DATABASE_URL_DEV if DATABASE_URL is not set
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_DEV;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or DATABASE_URL_DEV environment variable must be set');
  }
  
  const isUsingDev = !process.env.DATABASE_URL && !!process.env.DATABASE_URL_DEV;
  if (isUsingDev) {
    console.log('ℹ️  Using DATABASE_URL_DEV (development branch)\n');
  }

  console.log('🔍 Auditing database data...\n');
  console.log('Database URL:', databaseUrl.substring(0, 50) + '...\n');

  const sql = neon(databaseUrl, {
    arrayMode: false,
    fullResults: false,
  });
  const db = drizzle(sql, { schema });

  try {
    // Test connection first with timeout
    console.log('🔌 Testing database connection...');
    try {
      const testResult = await Promise.race([
        sql.query(`SELECT 1 as test`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
        ),
      ]) as any[];
      console.log('✅ Connection successful\n');
    } catch (error: any) {
      if (error.message?.includes('timeout') || error.message?.includes('fetch failed')) {
        console.error('\n❌ Connection timeout. This might be due to:');
        console.error('   1. Network connectivity issues');
        console.error('   2. Database branch is paused (Neon pauses inactive branches)');
        console.error('   3. Firewall or VPN blocking the connection');
        console.error('\n💡 Solutions:');
        console.error('   - Check your internet connection');
        console.error('   - Go to Neon dashboard and ensure the branch is active');
        console.error('   - Neon branches auto-pause after inactivity - they may need a moment to wake up');
        console.error('   - Try running: npx tsx scripts/db-switch.ts test dev');
        throw new Error('Database connection failed - see above for details');
      }
      throw error;
    }
    
    // Get database info
    const dbInfo = await getDatabaseInfo(sql);
    console.log('📊 Database Information:');
    console.log(`   Name: ${dbInfo.databaseName}`);
    console.log(`   Connection: ${dbInfo.connectionInfo}`);
    console.log('');

    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const tablesResult = await sql.query(tablesQuery);
    const tables = (tablesResult as any[]).map((row: any) => row.table_name);

    console.log(`📋 Found ${tables.length} tables\n`);

    const stats: TableStats[] = [];
    let totalRows = 0;
    let tablesWithProductionData = 0;

    // Analyze each table
    for (const tableName of tables) {
      try {
        const tableStats = await getTableStats(sql, db, tableName);
        stats.push(tableStats);
        totalRows += tableStats.rowCount;
        if (tableStats.hasProductionIndicators) {
          tablesWithProductionData++;
        }
      } catch (error: any) {
        console.warn(`⚠️  Could not analyze ${tableName}: ${error.message}`);
      }
    }

    // Display results
    console.log('='.repeat(80));
    console.log('📊 DATABASE AUDIT RESULTS');
    console.log('='.repeat(80));
    console.log(`\nTotal Tables: ${tables.length}`);
    console.log(`Total Rows: ${totalRows.toLocaleString()}`);
    console.log(`Tables with Production Indicators: ${tablesWithProductionData}\n`);

    // Show tables with production data
    const productionTables = stats.filter(s => s.hasProductionIndicators);
    if (productionTables.length > 0) {
      console.log('⚠️  TABLES WITH PRODUCTION DATA INDICATORS:');
      console.log('-'.repeat(80));
      for (const stat of productionTables) {
        console.log(`\n📦 ${stat.tableName}`);
        console.log(`   Rows: ${stat.rowCount.toLocaleString()}`);
        console.log(`   Indicators: ${stat.productionIndicators.join(', ')}`);
        if (stat.sampleData.length > 0) {
          console.log(`   Sample data:`);
          const sample = stat.sampleData[0];
          Object.keys(sample).slice(0, 5).forEach(key => {
            const value = sample[key];
            const displayValue =
              typeof value === 'string' && value.length > 50
                ? value.substring(0, 50) + '...'
                : value;
            console.log(`     ${key}: ${displayValue}`);
          });
        }
      }
      console.log('\n');
    }

    // Show tables with only test data
    const testTables = stats.filter(s => !s.hasProductionIndicators && s.rowCount > 0);
    if (testTables.length > 0) {
      console.log('✅ TABLES WITH TEST/DEVELOPMENT DATA ONLY:');
      console.log('-'.repeat(80));
      for (const stat of testTables) {
        console.log(`   ${stat.tableName}: ${stat.rowCount.toLocaleString()} rows`);
      }
      console.log('\n');
    }

    // Show empty tables
    const emptyTables = stats.filter(s => s.rowCount === 0);
    if (emptyTables.length > 0) {
      console.log('📭 EMPTY TABLES:');
      console.log('-'.repeat(80));
      for (const stat of emptyTables) {
        console.log(`   ${stat.tableName}`);
      }
      console.log('\n');
    }

    // Summary and recommendations
    console.log('='.repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('='.repeat(80));

    if (productionTables.length > 0) {
      console.log('\n⚠️  WARNING: This database appears to contain PRODUCTION data!');
      console.log('\nBefore migrating to development branch:');
      console.log('1. Verify this is the correct source database');
      console.log('2. Consider filtering out production data');
      console.log('3. Use the filter script to export only development data');
      console.log('4. Double-check the DATABASE_URL points to your development database');
      console.log('\nTo filter production data, use:');
      console.log('   npx tsx scripts/migrate-to-dev-branch-filtered.ts');
    } else if (totalRows === 0) {
      console.log('\n✅ Database is empty - safe to migrate');
    } else {
      console.log('\n✅ Database appears to contain only test/development data');
      console.log('   Safe to migrate to development branch');
    }

    console.log('\n' + '='.repeat(80));
  } catch (error) {
    console.error('\n❌ Audit failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
