#!/usr/bin/env tsx

/**
 * Database switching utility
 * 
 * Makes it easy to work with different database environments (production, development branch, etc.)
 * 
 * Usage:
 *   npx tsx scripts/db-switch.ts [command] [options]
 * 
 * Commands:
 *   check          - Check which database is currently active
 *   use <env>      - Switch to a specific database (prod|dev)
 *   audit [env]    - Run audit on specified database (default: current)
 *   migrate [env]  - Run migrations on specified database (default: current)
 *   test [env]     - Test connection to specified database (default: current)
 * 
 * Examples:
 *   npx tsx scripts/db-switch.ts check
 *   npx tsx scripts/db-switch.ts use dev
 *   npx tsx scripts/db-switch.ts audit dev
 *   npx tsx scripts/db-switch.ts migrate dev
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config({ path: '.env.local' });

const ENV_FILE = path.join(process.cwd(), '.env.local');
const BACKUP_FILE = path.join(process.cwd(), '.env.local.backup');

interface DatabaseInfo {
  name: string;
  url: string;
  isActive: boolean;
}

function getDatabaseInfo(): { prod: DatabaseInfo; dev: DatabaseInfo | null } {
  const prodUrl = process.env.DATABASE_URL || '';
  const devUrl = process.env.DATABASE_URL_DEV || '';
  
  // Determine which is active
  const activeUrl = prodUrl || devUrl;
  const isProdActive = !!prodUrl;
  
  const prod: DatabaseInfo = {
    name: 'production',
    url: prodUrl,
    isActive: isProdActive,
  };
  
  const dev: DatabaseInfo | null = devUrl ? {
    name: 'development',
    url: devUrl,
    isActive: !isProdActive && !!devUrl,
  } : null;
  
  return { prod, dev };
}

function parseDatabaseUrl(url: string): { host: string; database: string; user: string } | null {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      database: parsed.pathname.replace('/', ''),
      user: parsed.username,
    };
  } catch {
    return null;
  }
}

async function checkDatabase() {
  const { prod, dev } = getDatabaseInfo();
  
  console.log('📊 Current Database Configuration\n');
  console.log('='.repeat(60));
  
  // Production
  console.log('\n🔴 PRODUCTION:');
  if (prod.url) {
    const info = parseDatabaseUrl(prod.url);
    console.log(`   Status: ${prod.isActive ? '✅ ACTIVE' : '⏸️  Inactive'}`);
    if (info) {
      console.log(`   Host: ${info.host}`);
      console.log(`   Database: ${info.database}`);
      console.log(`   User: ${info.user}`);
    }
    console.log(`   URL: ${prod.url.substring(0, 50)}...`);
  } else {
    console.log('   ❌ Not configured');
  }
  
  // Development
  console.log('\n🟢 DEVELOPMENT:');
  if (dev) {
    const info = parseDatabaseUrl(dev.url);
    console.log(`   Status: ${dev.isActive ? '✅ ACTIVE' : '⏸️  Inactive'}`);
    if (info) {
      console.log(`   Host: ${info.host}`);
      console.log(`   Database: ${info.database}`);
      console.log(`   User: ${info.user}`);
    }
    console.log(`   URL: ${dev.url.substring(0, 50)}...`);
  } else {
    console.log('   ❌ Not configured');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Tips:');
  console.log('   - Use "npx tsx scripts/db-switch.ts use dev" to switch to development');
  console.log('   - Use "npx tsx scripts/db-switch.ts use prod" to switch to production');
  console.log('   - Use "npx tsx scripts/db-switch.ts audit dev" to audit development branch');
}

async function switchDatabase(env: 'prod' | 'dev') {
  if (!fs.existsSync(ENV_FILE)) {
    console.error('❌ .env.local file not found');
    process.exit(1);
  }
  
  // Read current .env.local
  const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
  const lines = envContent.split('\n');
  
  // Create backup
  fs.writeFileSync(BACKUP_FILE, envContent);
  console.log('📦 Created backup: .env.local.backup');
  
  // Find DATABASE_URL line
  let hasDatabaseUrl = false;
  let hasDatabaseUrlDev = false;
  const newLines: string[] = [];
  
  for (const line of lines) {
    if (line.trim().startsWith('DATABASE_URL=') && !line.trim().startsWith('DATABASE_URL_DEV=')) {
      hasDatabaseUrl = true;
      if (env === 'dev') {
        // Comment out DATABASE_URL
        newLines.push(`# ${line.trim()} # Temporarily disabled - using DATABASE_URL_DEV`);
      } else {
        // Keep DATABASE_URL active
        newLines.push(line);
      }
    } else if (line.trim().startsWith('DATABASE_URL_DEV=')) {
      hasDatabaseUrlDev = true;
      newLines.push(line);
    } else {
      newLines.push(line);
    }
  }
  
  // Ensure DATABASE_URL_DEV exists if switching to dev
  if (env === 'dev' && !hasDatabaseUrlDev) {
    console.error('❌ DATABASE_URL_DEV is not set in .env.local');
    console.error('   Please add it first, then try again');
    process.exit(1);
  }
  
  // Write updated .env.local
  fs.writeFileSync(ENV_FILE, newLines.join('\n'));
  
  console.log(`\n✅ Switched to ${env === 'dev' ? 'DEVELOPMENT' : 'PRODUCTION'} database`);
  console.log('\n⚠️  Remember to restore your original .env.local when done!');
  console.log('   Or run: npx tsx scripts/db-switch.ts use prod');
}

async function runAudit(env?: 'prod' | 'dev') {
  const { prod, dev } = getDatabaseInfo();
  
  let targetEnv = env;
  if (!targetEnv) {
    // Use active database
    targetEnv = prod.isActive ? 'prod' : 'dev';
  }
  
  const target = targetEnv === 'dev' ? dev : prod;
  
  if (!target || !target.url) {
    console.error(`❌ ${targetEnv === 'dev' ? 'Development' : 'Production'} database is not configured`);
    process.exit(1);
  }
  
  console.log(`🔍 Running audit on ${targetEnv === 'dev' ? 'DEVELOPMENT' : 'PRODUCTION'} database...\n`);
  
  // Test connection first
  console.log('🔌 Testing connection...');
  try {
    await testConnection(env);
    console.log('');
  } catch (error: any) {
    console.error('\n❌ Connection test failed. Please check:');
    console.error('   1. The database URL is correct');
    console.error('   2. Your internet connection is working');
    console.error('   3. The database branch exists and is active');
    console.error('   4. Your IP is whitelisted (if required)');
    console.error('\nError:', error.message);
    process.exit(1);
  }
  
  // Temporarily set DATABASE_URL
  const originalUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = target.url;
  
  try {
    // Run audit script
    execSync('npx tsx scripts/audit-database-data.ts', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: target.url },
    });
  } catch (error: any) {
    console.error('\n❌ Audit failed. This might be due to:');
    console.error('   - Network connectivity issues');
    console.error('   - Database branch is paused or unavailable');
    console.error('   - Connection timeout (try again in a moment)');
    process.exit(1);
  } finally {
    // Restore original
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl;
    }
  }
}

async function runMigrations(env?: 'prod' | 'dev') {
  const { prod, dev } = getDatabaseInfo();
  
  let targetEnv = env;
  if (!targetEnv) {
    targetEnv = prod.isActive ? 'prod' : 'dev';
  }
  
  const target = targetEnv === 'dev' ? dev : prod;
  
  if (!target || !target.url) {
    console.error(`❌ ${targetEnv === 'dev' ? 'Development' : 'Production'} database is not configured`);
    process.exit(1);
  }
  
  console.log(`🚀 Running migrations on ${targetEnv === 'dev' ? 'DEVELOPMENT' : 'PRODUCTION'} database...\n`);
  console.log('⚠️  WARNING: This will modify the database schema!\n');
  
  try {
    execSync('npx tsx lib/migrate.ts', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: target.url },
    });
  } catch (error) {
    console.error('\n❌ Migration failed');
    process.exit(1);
  }
}

async function testConnection(env?: 'prod' | 'dev') {
  const { prod, dev } = getDatabaseInfo();
  
  let targetEnv = env;
  if (!targetEnv) {
    targetEnv = prod.isActive ? 'prod' : 'dev';
  }
  
  const target = targetEnv === 'dev' ? dev : prod;
  
  if (!target || !target.url) {
    console.error(`❌ ${targetEnv === 'dev' ? 'Development' : 'Production'} database is not configured`);
    process.exit(1);
  }
  
  console.log(`🔌 Testing connection to ${targetEnv === 'dev' ? 'DEVELOPMENT' : 'PRODUCTION'} database...\n`);
  
  try {
    const sql = neon(target.url, {
      arrayMode: false,
      fullResults: false,
    });
    
    // Set a longer timeout for connection test
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
    });
    
    const queryPromise = sql.query(`
      SELECT 
        current_database() as db_name,
        current_user as user_name,
        version() as version
    `) as Promise<any[]>;
    
    const result = await Promise.race([queryPromise, timeoutPromise]) as any[];
    
    const info = result[0] as any;
    
    console.log('✅ Connection successful!\n');
    console.log(`   Database: ${info.db_name}`);
    console.log(`   User: ${info.user_name}`);
    console.log(`   Version: ${info.version?.substring(0, 50)}...`);
  } catch (error: any) {
    if (error.message?.includes('timeout') || error.message?.includes('fetch failed')) {
      console.error('❌ Connection timeout. This might be due to:');
      console.error('   1. Network connectivity issues');
      console.error('   2. Database branch is paused (Neon pauses inactive branches)');
      console.error('   3. Firewall or VPN blocking the connection');
      console.error('   4. The database URL is incorrect');
      console.error('\n💡 Try:');
      console.error('   - Check your internet connection');
      console.error('   - Verify the database branch is active in Neon dashboard');
      console.error('   - Try again in a few moments (branches may need to wake up)');
    } else {
      console.error('❌ Connection failed:', error.message);
    }
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'check':
      await checkDatabase();
      break;
      
    case 'use':
      const env = args[1] as 'prod' | 'dev';
      if (!env || (env !== 'prod' && env !== 'dev')) {
        console.error('❌ Usage: npx tsx scripts/db-switch.ts use <prod|dev>');
        process.exit(1);
      }
      await switchDatabase(env);
      break;
      
    case 'audit':
      const auditEnv = args[1] as 'prod' | 'dev' | undefined;
      await runAudit(auditEnv);
      break;
      
    case 'migrate':
      const migrateEnv = args[1] as 'prod' | 'dev' | undefined;
      await runMigrations(migrateEnv);
      break;
      
    case 'test':
      const testEnv = args[1] as 'prod' | 'dev' | undefined;
      await testConnection(testEnv);
      break;
      
    default:
      console.log('📚 Database Switch Utility\n');
      console.log('Usage: npx tsx scripts/db-switch.ts [command] [options]\n');
      console.log('Commands:');
      console.log('  check          Check which database is currently active');
      console.log('  use <env>      Switch to a specific database (prod|dev)');
      console.log('  audit [env]    Run audit on specified database (default: current)');
      console.log('  migrate [env]  Run migrations on specified database (default: current)');
      console.log('  test [env]     Test connection to specified database (default: current)\n');
      console.log('Examples:');
      console.log('  npx tsx scripts/db-switch.ts check');
      console.log('  npx tsx scripts/db-switch.ts use dev');
      console.log('  npx tsx scripts/db-switch.ts audit dev');
      console.log('  npx tsx scripts/db-switch.ts migrate dev');
      console.log('  npx tsx scripts/db-switch.ts test dev');
      process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
