#!/usr/bin/env tsx
/**
 * Loads .env.local and .env before running the backfill script.
 * Use this so lib/db and lib/payments/stripe see DATABASE_URL and STRIPE_SECRET_KEY.
 *
 * Usage: npx tsx scripts/run-with-env.ts [--dry-run]
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

import('../scripts/backfill-and-cancel-duplicate-recurring').catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
