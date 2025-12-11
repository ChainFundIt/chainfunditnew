import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Quick script to check which database you're currently connected to
 * 
 * Usage: npx tsx scripts/check-database-connection.ts
 */

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_DEV;
  const databaseUrlDev = process.env.DATABASE_URL_DEV;

  console.log('🔍 Checking database connections...\n');

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL or DATABASE_URL_DEV is not set');
    return;
  }
  
  const isUsingDev = !process.env.DATABASE_URL && !!process.env.DATABASE_URL_DEV;
  if (isUsingDev) {
    console.log('ℹ️  Checking DATABASE_URL_DEV (development branch)\n');
  }

  // Parse connection string to extract info
  try {
    const url = new URL(databaseUrl);
    const dbName = url.pathname.replace('/', '');
    const host = url.hostname;
    
    console.log('📊 Current DATABASE_URL:');
    console.log(`   Host: ${host}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   User: ${url.username}`);
    console.log(`   Full URL: ${databaseUrl.substring(0, 60)}...`);
    
    // Try to connect and get more info
    try {
      const sql = neon(databaseUrl, {
        arrayMode: false,
        fullResults: false,
      });
      
      const result = await sql.query(`
        SELECT 
          current_database() as db_name,
          current_user as user_name,
          version() as version,
          pg_database_size(current_database()) as size_bytes
      `) as any[];
      
      const info = result[0] as any;
      const sizeMB = (parseInt(info.size_bytes) / (1024 * 1024)).toFixed(2);
      
      console.log('\n📈 Database Details:');
      console.log(`   Database Name: ${info.db_name}`);
      console.log(`   User: ${info.user_name}`);
      console.log(`   Size: ${sizeMB} MB`);
      console.log(`   PostgreSQL Version: ${info.version?.substring(0, 50)}...`);
      
      // Get table count
      const tableResult = await sql.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `) as any[];
      const tableCount = (tableResult[0] as any)?.count || 0;
      console.log(`   Tables: ${tableCount}`);
      
      // Check for production indicators
      const emailResult = await sql.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'email'
      `) as any[];
      const hasEmailColumn = parseInt((emailResult[0] as any)?.count || '0') > 0;
      
      if (hasEmailColumn) {
        try {
          const realEmailResult = await sql.query(`
            SELECT COUNT(*) as count
            FROM (
              SELECT DISTINCT email
              FROM users
              WHERE (email LIKE '%@gmail.com'
                OR email LIKE '%@yahoo.com'
                OR email LIKE '%@hotmail.com'
                OR email LIKE '%@outlook.com'
                OR email LIKE '%@icloud.com')
              AND email NOT LIKE '%test%'
              AND email NOT LIKE '%example%'
              AND email NOT LIKE '%dev%'
            ) as real_emails
          `) as any[];
          const realEmailCount = parseInt((realEmailResult[0] as any)?.count || '0');
          
          if (realEmailCount > 0) {
            console.log(`\n⚠️  WARNING: Found ${realEmailCount} real email addresses`);
            console.log('   This might be a PRODUCTION database!');
          }
        } catch (error) {
          // Table might not exist or have different structure
          // Silently continue
        }
      }
      
      // Check database name for production indicators
      const dbNameLower = info.db_name?.toLowerCase() || '';
      if (dbNameLower.includes('prod') || dbNameLower.includes('production') || dbNameLower.includes('main')) {
        console.log(`\n⚠️  WARNING: Database name "${info.db_name}" suggests this might be PRODUCTION!`);
      } else if (dbNameLower.includes('dev') || dbNameLower.includes('development') || dbNameLower.includes('test')) {
        console.log(`\n✅ Database name "${info.db_name}" suggests this is a DEVELOPMENT database`);
      }
      
    } catch (error: any) {
      console.log(`\n⚠️  Could not connect to database: ${error.message}`);
    }
    
  } catch (error: any) {
    console.log(`\n⚠️  Could not parse DATABASE_URL: ${error.message}`);
    console.log(`   URL: ${databaseUrl.substring(0, 50)}...`);
  }

  if (databaseUrlDev) {
    console.log('\n📊 DATABASE_URL_DEV (Development Branch):');
    try {
      const url = new URL(databaseUrlDev);
      const dbName = url.pathname.replace('/', '');
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Database: ${dbName}`);
      console.log(`   Full URL: ${databaseUrlDev.substring(0, 60)}...`);
    } catch (error) {
      console.log(`   URL: ${databaseUrlDev.substring(0, 50)}...`);
    }
  } else {
    console.log('\n📊 DATABASE_URL_DEV: Not set');
  }

  console.log('\n💡 Tips:');
  console.log('   - Run "npx tsx scripts/audit-database-data.ts" for detailed analysis');
  console.log('   - Verify the database name matches your intended environment');
  console.log('   - Check for production indicators (real emails, large amounts, etc.)');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
