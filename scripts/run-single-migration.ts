/**
 * Script to run a single migration SQL file
 * Usage: tsx scripts/run-single-migration.ts
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  // Read the migration file
  const migrationFile = resolve(process.cwd(), 'lib/migrations/0014_greedy_harry_osborn.sql');
  console.log('Reading migration file:', migrationFile);
  
  const migrationSQL = readFileSync(migrationFile, 'utf-8');
  
  // Split by statement breakpoint
  const statements = migrationSQL
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`Executing statement ${i + 1}/${statements.length}:`);
    console.log(statement.substring(0, 100) + '...\n');
    
    try {
      // Use sql.query for raw SQL statements
      await sql.query(statement);
      console.log(`✅ Statement ${i + 1} executed successfully\n`);
    } catch (error: any) {
      // Check if it's a "already exists" error - that's okay
      if (error?.code === '42701' || error?.message?.includes('already exists') || error?.message?.includes('duplicate column')) {
        console.log(`⚠️  Statement ${i + 1} skipped (column already exists): ${error.message}\n`);
      } else {
        console.error(`❌ Statement ${i + 1} failed:`, error.message);
        throw error;
      }
    }
  }

  console.log('✅ Migration completed!');
}

runMigration().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
