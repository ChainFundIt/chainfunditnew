import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Check if the development branch is ready to use
 * 
 * This script checks:
 * - Connection to development branch
 * - What tables exist
 * - If migrations are needed
 * - If the schema is complete
 * 
 * Usage: npx tsx scripts/check-dev-branch-status.ts
 */

async function main() {
  const databaseUrlDev = process.env.DATABASE_URL_DEV;

  if (!databaseUrlDev) {
    console.error('❌ DATABASE_URL_DEV is not set in .env.local');
    console.error('   Please add your development branch connection string');
    process.exit(1);
  }

  console.log('🔍 Checking development branch status...\n');
  console.log('Database URL:', databaseUrlDev.substring(0, 50) + '...\n');

  try {
    const sql = neon(databaseUrlDev, {
      arrayMode: false,
      fullResults: false,
    });

    // Test connection
    console.log('1️⃣  Testing connection...');
    try {
      const testResult = await Promise.race([
        sql.query(`SELECT 1 as test`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        ),
      ]) as any[];
      console.log('   ✅ Connection successful\n');
    } catch (error: any) {
      if (error.message?.includes('timeout') || error.message?.includes('fetch failed')) {
        console.error('   ❌ Connection timeout - branch may be paused');
        console.error('   💡 Go to Neon dashboard and wake up the branch, then try again');
        process.exit(1);
      }
      throw error;
    }

    // Get database info
    console.log('2️⃣  Getting database information...');
    const dbInfoResult = await sql.query(`
      SELECT 
        current_database() as db_name,
        current_user as user_name,
        version() as version
    `) as any[];
    const dbInfo = dbInfoResult[0] as any;
    console.log(`   Database: ${dbInfo.db_name}`);
    console.log(`   User: ${dbInfo.user_name}`);
    console.log(`   PostgreSQL: ${dbInfo.version?.substring(0, 40)}...\n`);

    // Get all tables
    console.log('3️⃣  Checking tables...');
    const tablesResult = await sql.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' 
         AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `) as any[];
    
    const tables = tablesResult.map((row: any) => ({
      name: row.table_name,
      columns: parseInt(row.column_count || '0', 10),
    }));

    console.log(`   Found ${tables.length} tables:`);
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found - database is empty');
      console.log('   💡 You need to run migrations first');
    } else {
      // Show first 10 tables
      tables.slice(0, 10).forEach(table => {
        console.log(`      - ${table.name} (${table.columns} columns)`);
      });
      if (tables.length > 10) {
        console.log(`      ... and ${tables.length - 10} more tables`);
      }
    }
    console.log('');

    // Check for key tables (common in most apps)
    const keyTables = ['users', 'campaigns', 'donations', 'refresh_tokens'];
    const existingKeyTables = keyTables.filter(keyTable => 
      tables.some(t => t.name === keyTable)
    );
    
    console.log('4️⃣  Checking key tables...');
    if (existingKeyTables.length > 0) {
      console.log(`   ✅ Found ${existingKeyTables.length}/${keyTables.length} key tables: ${existingKeyTables.join(', ')}`);
    } else {
      console.log('   ⚠️  No key tables found');
    }
    console.log('');

    // Check migration tracking (if using Drizzle)
    console.log('5️⃣  Checking migration status...');
    try {
      const migrationTableResult = await sql.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '__drizzle_migrations'
        ) as exists;
      `) as any[];
      
      const hasMigrationTable = migrationTableResult[0]?.exists;
      
      if (hasMigrationTable) {
        const migrationsResult = await sql.query(`
          SELECT hash, created_at 
          FROM __drizzle_migrations 
          ORDER BY created_at DESC 
          LIMIT 5;
        `) as any[];
        
        console.log(`   ✅ Migration tracking table exists`);
        console.log(`   Found ${migrationsResult.length} recent migrations:`);
        migrationsResult.forEach((m: any, i: number) => {
          console.log(`      ${i + 1}. ${m.hash?.substring(0, 8)}... (${m.created_at})`);
        });
      } else {
        console.log('   ⚠️  No migration tracking table found');
        console.log('   💡 This might be a fresh database or using a different migration system');
      }
    } catch (error: any) {
      console.log('   ⚠️  Could not check migration status:', error.message);
    }
    console.log('');

    // Check for data
    console.log('6️⃣  Checking for data...');
    if (tables.length > 0) {
      const sampleTable = tables[0].name;
      try {
        const countResult = await sql.query(`
          SELECT COUNT(*) as count FROM "${sampleTable}";
        `) as any[];
        const totalRows = parseInt(countResult[0]?.count || '0', 10);
        
        if (totalRows > 0) {
          console.log(`   ✅ Database contains data (${totalRows} rows in ${sampleTable} table)`);
        } else {
          console.log(`   📭 Database is empty (no data in tables)`);
        }
      } catch (error) {
        console.log('   ⚠️  Could not check data count');
      }
    }
    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    
    if (tables.length === 0) {
      console.log('\n❌ Development branch is NOT ready');
      console.log('   - No tables found');
      console.log('   - You need to run migrations first');
      console.log('\n💡 Next steps:');
      console.log('   1. Run: npx tsx scripts/db-switch.ts migrate dev');
      console.log('   2. If migrations fail due to existing tables, you may need to:');
      console.log('      - Drop and recreate the branch, OR');
      console.log('      - Manually fix migration conflicts');
    } else if (existingKeyTables.length >= keyTables.length / 2) {
      console.log('\n✅ Development branch appears READY');
      console.log(`   - ${tables.length} tables exist`);
      console.log(`   - Key tables are present`);
      console.log('\n💡 You can now:');
      console.log('   - Use the development branch for testing');
      console.log('   - Run your application: npm run dev');
      console.log('   - Add test data as needed');
    } else {
      console.log('\n⚠️  Development branch is PARTIALLY ready');
      console.log(`   - ${tables.length} tables exist`);
      console.log(`   - Some key tables may be missing`);
      console.log('\n💡 Next steps:');
      console.log('   - Check if migrations completed successfully');
      console.log('   - Run: npx tsx scripts/db-switch.ts migrate dev');
      console.log('   - If migrations fail, check the error messages');
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error: any) {
    console.error('\n❌ Error checking development branch:', error.message);
    if (error.message?.includes('timeout') || error.message?.includes('fetch failed')) {
      console.error('\n💡 This might be a connection issue:');
      console.error('   1. Check your internet connection');
      console.error('   2. Go to Neon dashboard and wake up the branch');
      console.error('   3. Try again in a few moments');
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});









