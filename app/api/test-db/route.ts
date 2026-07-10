import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const databaseUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.NEON_DATABASE_URL ||
      '';

    const databaseHost = databaseUrl ? new URL(databaseUrl).hostname : null;

    // Query 1: basic connectivity (independent of app tables)
    const connectivityResult = await db.execute(sql`
      select current_database() as db_name, current_user as db_user
    `);

    // Query 2: verify campaigns table exists (without selecting app columns)
    const campaignsTableResult = await db.execute(sql`
      select exists (
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = 'campaigns'
      ) as campaigns_table_exists
    `);

    // Query 3: run a minimal campaigns query
    const campaignsResult = await db.select({ id: campaigns.id }).from(campaigns).limit(1);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      databaseHost,
      databaseName: (connectivityResult.rows?.[0] as { db_name?: string })?.db_name ?? null,
      databaseUser: (connectivityResult.rows?.[0] as { db_user?: string })?.db_user ?? null,
      campaignsTableExists:
        (campaignsTableResult.rows?.[0] as { campaigns_table_exists?: boolean })
          ?.campaigns_table_exists ?? null,
      sampleCampaignRows: campaignsResult.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const err = error as Error & {
      code?: string;
      cause?: unknown;
      detail?: string;
      hint?: string;
      severity?: string;
    };

    const cause = err.cause as
      | { message?: string; code?: string; cause?: unknown }
      | undefined;

    console.error('Database connection test failed:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      severity: err.severity,
      causeMessage:
        cause?.message ||
        (typeof cause === 'object' && cause && 'cause' in cause && typeof cause.cause === 'string'
          ? cause.cause
          : undefined),
      causeCode: cause?.code,
    });
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: err.message || 'Unknown error',
      code: err.code || null,
      causeMessage:
        cause?.message ||
        (typeof cause === 'object' && cause && 'cause' in cause && typeof cause.cause === 'string'
          ? cause.cause
          : null),
      causeCode: cause?.code || null,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
