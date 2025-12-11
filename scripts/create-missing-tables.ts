import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Create missing tables in development branch
 * 
 * This script creates the 7 missing tables from production:
 * - admin_notifications
 * - campaign_payouts
 * - campaign_screenings
 * - favourites
 * - recurring_donation_payments
 * - recurring_donations
 * - user_kyc_verifications
 * 
 * Usage: npx tsx scripts/create-missing-tables.ts
 */

const MISSING_TABLES_SQL = {
  admin_notifications: `
    CREATE TABLE IF NOT EXISTS "admin_notifications" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "type" varchar(50) NOT NULL,
      "title" varchar(255) NOT NULL,
      "message" text NOT NULL,
      "status" varchar(20) DEFAULT 'unread' NOT NULL,
      "priority" varchar(20) DEFAULT 'normal' NOT NULL,
      "metadata" jsonb,
      "read_at" timestamp,
      "read_by" uuid,
      "action_url" text,
      "action_label" varchar(100),
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS "admin_notifications_type_idx" ON "admin_notifications" USING btree ("type");
    CREATE INDEX IF NOT EXISTS "admin_notifications_status_idx" ON "admin_notifications" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "admin_notifications_priority_idx" ON "admin_notifications" USING btree ("priority");
    CREATE INDEX IF NOT EXISTS "admin_notifications_created_at_idx" ON "admin_notifications" USING btree ("created_at");
  `,
  
  campaign_screenings: `
    CREATE TABLE IF NOT EXISTS "campaign_screenings" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "campaign_id" uuid NOT NULL,
      "job_type" varchar(30) DEFAULT 'initial' NOT NULL,
      "status" varchar(20) DEFAULT 'pending' NOT NULL,
      "sync_findings" jsonb,
      "async_findings" jsonb,
      "decision" varchar(20),
      "risk_score" numeric(5, 2) DEFAULT '0' NOT NULL,
      "failure_reason" text,
      "locked_at" timestamp,
      "locked_by" varchar(100),
      "started_at" timestamp,
      "completed_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "campaign_screenings_campaign_id_campaigns_id_fk" 
        FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") 
        ON DELETE cascade ON UPDATE no action
    );
  `,
  
  user_kyc_verifications: `
    CREATE TABLE IF NOT EXISTS "user_kyc_verifications" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "provider" varchar(50) DEFAULT 'persona' NOT NULL,
      "status" varchar(30) DEFAULT 'pending' NOT NULL,
      "reference_id" varchar(255),
      "external_inquiry_id" varchar(255),
      "session_token" varchar(255),
      "risk_score" numeric(5, 2),
      "payload" jsonb,
      "failure_reason" text,
      "completed_at" timestamp,
      "expires_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "user_kyc_verifications_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
        ON DELETE cascade ON UPDATE no action
    );
  `,
  
  recurring_donations: `
    CREATE TABLE IF NOT EXISTS "recurring_donations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "campaign_id" uuid NOT NULL,
      "donor_id" uuid NOT NULL,
      "chainer_id" uuid,
      "amount" numeric(10, 2) NOT NULL,
      "currency" varchar(3) NOT NULL,
      "period" varchar(20) NOT NULL,
      "payment_method" varchar(50) NOT NULL,
      "stripe_subscription_id" varchar(255),
      "paystack_subscription_id" varchar(255),
      "stripe_customer_id" varchar(255),
      "paystack_customer_code" varchar(255),
      "status" varchar(20) DEFAULT 'active' NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "next_billing_date" date NOT NULL,
      "last_billing_date" date,
      "billing_day" integer,
      "message" text,
      "is_anonymous" boolean DEFAULT false NOT NULL,
      "total_donations" integer DEFAULT 0 NOT NULL,
      "total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
      "failed_attempts" integer DEFAULT 0 NOT NULL,
      "last_failure_reason" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      "cancelled_at" timestamp,
      "paused_at" timestamp
    );
  `,
  
  recurring_donation_payments: `
    CREATE TABLE IF NOT EXISTS "recurring_donation_payments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "recurring_donation_id" uuid NOT NULL,
      "donation_id" uuid NOT NULL,
      "amount" numeric(10, 2) NOT NULL,
      "currency" varchar(3) NOT NULL,
      "payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
      "stripe_invoice_id" varchar(255),
      "stripe_payment_intent_id" varchar(255),
      "paystack_transaction_id" varchar(255),
      "billing_period_start" date NOT NULL,
      "billing_period_end" date NOT NULL,
      "scheduled_date" date NOT NULL,
      "processed_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `,
  
  favourites: `
    CREATE TABLE IF NOT EXISTS "favourites" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "item_type" varchar(50) NOT NULL,
      "item_id" uuid NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "favourites_user_item_unique" UNIQUE("user_id","item_type","item_id"),
      CONSTRAINT "favourites_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
        ON DELETE cascade ON UPDATE no action
    );
    
    CREATE INDEX IF NOT EXISTS "favourites_user_id_idx" ON "favourites" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "favourites_item_idx" ON "favourites" USING btree ("item_type","item_id");
  `,
  
  campaign_payouts: `
    CREATE TABLE IF NOT EXISTS "campaign_payouts" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "campaign_id" uuid NOT NULL,
      "user_id" uuid NOT NULL,
      "amount" numeric(10, 2) NOT NULL,
      "currency" varchar(3) NOT NULL,
      "status" varchar(20) DEFAULT 'pending' NOT NULL,
      "payment_method" varchar(50),
      "bank_account_id" uuid,
      "stripe_transfer_id" varchar(255),
      "paystack_transfer_id" varchar(255),
      "requested_at" timestamp DEFAULT now() NOT NULL,
      "processed_at" timestamp,
      "completed_at" timestamp,
      "failure_reason" text,
      "metadata" jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "campaign_payouts_campaign_id_campaigns_id_fk" 
        FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") 
        ON DELETE cascade ON UPDATE no action,
      CONSTRAINT "campaign_payouts_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
        ON DELETE cascade ON UPDATE no action
    );
  `,
};

async function main() {
  const databaseUrlDev = process.env.DATABASE_URL_DEV;

  if (!databaseUrlDev) {
    console.error('❌ DATABASE_URL_DEV is not set in .env.local');
    process.exit(1);
  }

  console.log('🔧 Creating missing tables in development branch...\n');
  console.log('Database:', databaseUrlDev.substring(0, 50) + '...\n');

  try {
    const sql = neon(databaseUrlDev, {
      arrayMode: false,
      fullResults: false,
    });

    // Test connection
    console.log('1️⃣  Testing connection...');
    try {
      await Promise.race([
        sql.query(`SELECT 1 as test`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        ),
      ]);
      console.log('   ✅ Connected\n');
    } catch (error: any) {
      console.error('   ❌ Connection failed:', error.message);
      process.exit(1);
    }

    // Check which tables already exist
    console.log('2️⃣  Checking existing tables...');
    const existingTablesResult = await sql.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN (
        'admin_notifications',
        'campaign_payouts',
        'campaign_screenings',
        'favourites',
        'recurring_donation_payments',
        'recurring_donations',
        'user_kyc_verifications'
      );
    `) as any[];
    
    const existingTables = new Set(existingTablesResult.map((row: any) => row.table_name));
    const missingTables = Object.keys(MISSING_TABLES_SQL).filter(
      table => !existingTables.has(table)
    );

    if (missingTables.length === 0) {
      console.log('   ✅ All tables already exist!\n');
      console.log('   No action needed.');
      return;
    }

    console.log(`   Found ${existingTables.size} existing, ${missingTables.length} missing\n`);

    // Create missing tables
    console.log('3️⃣  Creating missing tables...\n');
    let created = 0;
    let failed = 0;

    for (const tableName of missingTables) {
      try {
        console.log(`   Creating ${tableName}...`);
        const sqlStatements = MISSING_TABLES_SQL[tableName as keyof typeof MISSING_TABLES_SQL]
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of sqlStatements) {
          await sql.query(statement);
        }
        
        console.log(`   ✅ ${tableName} created successfully\n`);
        created++;
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log(`   ⚠️  ${tableName} already exists (skipping)\n`);
        } else {
          console.error(`   ❌ Failed to create ${tableName}:`, error.message);
          console.error(`   ${error.stack?.split('\n').slice(0, 3).join('\n')}\n`);
          failed++;
        }
      }
    }

    // Summary
    console.log('='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Created: ${created}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Already existed: ${existingTables.size}`);

    if (created > 0) {
      console.log('\n✅ Successfully created missing tables!');
      console.log('\n💡 Next steps:');
      console.log('   - Verify tables: npx tsx scripts/compare-databases.ts');
      console.log('   - Check status: npx tsx scripts/check-dev-branch-status.ts');
    } else if (failed > 0) {
      console.log('\n⚠️  Some tables failed to create. Check errors above.');
    }

    console.log('\n' + '='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

