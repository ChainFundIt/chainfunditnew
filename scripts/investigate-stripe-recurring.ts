#!/usr/bin/env tsx
/**
 * Investigate Stripe recurring donations – find subscriptions that may have
 * been paid in Stripe but did not record a donation (e.g. webhook missed).
 *
 * Usage:
 *   npx tsx scripts/investigate-stripe-recurring.ts [--days=2] [--campaign-id=<id>]
 *
 * Then:
 * 1. In Stripe Dashboard → Developers → Webhooks, check which URL is configured
 *    and recent delivery attempts for invoice.payment_succeeded.
 * 2. If an event failed, use POST /api/admin/donations/backfill-stripe-subscription
 *    with the invoice ID or subscription ID to create the missing donation.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/schema';
import { recurringDonations, recurringDonationPayments } from '../lib/schema/recurring-donations';
import { donations } from '../lib/schema/donations';
import { campaigns } from '../lib/schema/campaigns';
import { eq, and, gte, desc, inArray } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!, { arrayMode: false, fullResults: false });
const db = drizzle(sql, { schema });

function parseArgs() {
  const args = process.argv.slice(2);
  let days = 2;
  let campaignId: string | null = null;
  for (const a of args) {
    if (a.startsWith('--days=')) days = parseInt(a.slice(7), 10) || 2;
    if (a.startsWith('--campaign-id=')) campaignId = a.slice(14) || null;
  }
  return { days, campaignId };
}

async function main() {
  const { days, campaignId } = parseArgs();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  console.log('\n--- Stripe recurring donations (recent) ---\n');
  console.log(`Since: ${since.toISOString()} (last ${days} days)\n`);

  const conditions = [
    eq(recurringDonations.paymentMethod, 'stripe'),
    gte(recurringDonations.createdAt, since),
  ];
  if (campaignId) {
    conditions.push(eq(recurringDonations.campaignId, campaignId));
  }

  const subs = await db
    .select({
      id: recurringDonations.id,
      campaignId: recurringDonations.campaignId,
      donorId: recurringDonations.donorId,
      amount: recurringDonations.amount,
      currency: recurringDonations.currency,
      stripeSubscriptionId: recurringDonations.stripeSubscriptionId,
      totalDonations: recurringDonations.totalDonations,
      totalAmount: recurringDonations.totalAmount,
      status: recurringDonations.status,
      isActive: recurringDonations.isActive,
      createdAt: recurringDonations.createdAt,
    })
    .from(recurringDonations)
    .where(and(...conditions))
    .orderBy(desc(recurringDonations.createdAt))
    .limit(50);

  if (subs.length === 0) {
    console.log('No Stripe recurring donations found in the given period.');
    return;
  }

  const campaignIds = [...new Set(subs.map((s) => s.campaignId))];
  const campaignRows = await db
    .select({ id: campaigns.id, title: campaigns.title })
    .from(campaigns)
    .where(inArray(campaigns.id, campaignIds));
  const campaignMap = new Map(campaignRows.map((c) => [c.id, c.title]));

  for (const sub of subs) {
    const title = campaignMap.get(sub.campaignId) ?? sub.campaignId;
    const hasSubId = !!sub.stripeSubscriptionId;
    const zeroRecorded = Number(sub.totalDonations) === 0;
    const flag = hasSubId && zeroRecorded ? ' ⚠️ POSSIBLE MISSED' : '';
    console.log(`Subscription ${sub.id}${flag}`);
    console.log(`  Campaign: ${title} (${sub.campaignId})`);
    console.log(`  Donor: ${sub.donorId} | ${sub.amount} ${sub.currency}`);
    console.log(`  Stripe sub ID: ${sub.stripeSubscriptionId ?? 'null'}`);
    console.log(`  Recorded: totalDonations=${sub.totalDonations}, totalAmount=${sub.totalAmount}`);
    console.log(`  Status: ${sub.status}, active: ${sub.isActive}, created: ${sub.createdAt}`);
    console.log('');
  }

  console.log('--- Recurring donation payments (same period) ---\n');
  const subIds = subs.map((s) => s.id);
  const allPayments = await db
    .select()
    .from(recurringDonationPayments)
    .where(
      and(
        inArray(recurringDonationPayments.recurringDonationId, subIds),
        gte(recurringDonationPayments.createdAt, since)
      )
    )
    .orderBy(desc(recurringDonationPayments.createdAt))
    .limit(100);
  const bySub = new Map<string, typeof allPayments>();
  for (const p of allPayments) {
    const list = bySub.get(p.recurringDonationId) ?? [];
    list.push(p);
    bySub.set(p.recurringDonationId, list);
  }
  for (const sub of subs) {
    const list = bySub.get(sub.id) ?? [];
    if (list.length === 0) console.log(`  No payment rows for subscription ${sub.id}`);
    else
      list.forEach((p) => {
        console.log(`  Payment ${p.id} | donation ${p.donationId} | status ${p.paymentStatus} | invoice ${p.stripeInvoiceId ?? '—'}`);
      });
  }

  console.log('\n--- Next steps ---');
  console.log('1. Stripe Dashboard → Developers → Webhooks: check which endpoint is used and recent invoice.payment_succeeded deliveries.');
  console.log('2. For any subscription with stripeSubscriptionId set but totalDonations=0, check in Stripe Billing → Subscriptions whether the first invoice was paid.');
  console.log('3. To backfill a missed payment, call POST /api/admin/donations/backfill-stripe-subscription with body:');
  console.log('   { "invoiceId": "in_xxx" } or { "subscriptionId": "sub_xxx" }');
  console.log('4. After backfilling, disable the other (failed) subscriptions for the same donor+campaign:');
  console.log('   POST /api/admin/donations/disable-other-recurring with body:');
  console.log('   { "recurringDonationId": "<our-uuid>" } or { "stripeSubscriptionId": "sub_xxx" }');
  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
