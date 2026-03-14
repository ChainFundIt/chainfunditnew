#!/usr/bin/env tsx
/**
 * Legacy script for Stripe recurring donations. Stripe is no longer supported.
 * This script is kept for reference only.
 *
 * Previously: backfill missed Stripe invoice and cancel duplicate subscriptions.
 * Use API or DB tools for PayPal/Paystack recurring donations instead.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

console.error('Stripe is no longer supported. This script is deprecated.');
process.exit(1);
