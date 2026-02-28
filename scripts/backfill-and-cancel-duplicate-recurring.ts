#!/usr/bin/env tsx
/**
 * One-off: backfill the missed donation for invoice in_1T4pweHI63fHdch8yY803UfN
 * and cancel the 3 duplicate Stripe subscriptions (so the donor is only charged once).
 *
 * Usage (env loaded first so DATABASE_URL and STRIPE_SECRET_KEY are set):
 *   npx tsx scripts/run-with-env.ts [--dry-run]
 *
 * Or with env already in shell: npx tsx scripts/backfill-and-cancel-duplicate-recurring.ts [--dry-run]
 *
 * With --dry-run, only prints what would be done; no DB or Stripe changes.
 *
 * Alternative: use the API instead:
 *   1. POST /api/admin/donations/backfill-stripe-subscription
 *      body: { "invoiceId": "in_1T4pweHI63fHdch8yY803UfN" }
 *   2. POST /api/admin/donations/disable-other-recurring
 *      body: { "recurringDonationId": "d679745c-4b3f-47e6-a768-01543825a1fc" }
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL must be set');
  process.exit(1);
}
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY must be set (e.g. in .env.local)');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');
const INVOICE_ID = 'in_1T4pweHI63fHdch8yY803UfN';
const DUPLICATE_RECURRING_IDS = [
  '4578fe4b-10b2-436e-a3c4-a99050dd532b', // 1st
  '85c8c574-828d-4815-a2c8-4d034a947966', // 2nd
  'b5313347-2635-442b-b3a8-91c1faecc879', // 3rd
];

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/schema';
import { recurringDonations, recurringDonationPayments } from '../lib/schema/recurring-donations';
import { donations } from '../lib/schema/donations';
import { campaigns } from '../lib/schema/campaigns';
import { notifications } from '../lib/schema/notifications';
import { eq, and, inArray } from 'drizzle-orm';
import { updateCampaignAmount } from '../lib/utils/campaign-amount';
import { shouldNotifyUserOfDonation, formatDonationNotificationMessage } from '../lib/utils/donation-notification-utils';
import { sendDonorConfirmationEmailById } from '../lib/notifications/donor-confirmation-email';

const sql = neon(process.env.DATABASE_URL!, { arrayMode: false, fullResults: false });
const db = drizzle(sql, { schema });

async function main() {
  console.log(DRY_RUN ? '\n--- DRY RUN (no changes) ---\n' : '\n--- Backfill + cancel duplicates ---\n');

  const { stripe } = await import('../lib/payments/stripe');
  const { cancelStripeSubscription } = await import('../lib/payments/stripe-subscriptions');

  // 1) Backfill donation for the paid invoice
  console.log('1) Backfilling donation for invoice', INVOICE_ID);
  const invoice = await stripe.invoices.retrieve(INVOICE_ID, {
    expand: ['subscription', 'payment_intent'],
  });
  const subId = typeof invoice.subscription === 'object' ? invoice.subscription?.id : invoice.subscription;
  if (!subId || invoice.status !== 'paid') {
    console.error('   Invoice not paid or no subscription:', invoice.status, subId);
    process.exit(1);
  }

  const existingPayment = await db
    .select()
    .from(recurringDonationPayments)
    .where(eq(recurringDonationPayments.stripeInvoiceId, INVOICE_ID))
    .limit(1);
  if (existingPayment.length > 0) {
    console.log('   Already processed (donation exists). Skipping backfill.');
  } else {
    const recurring = await db.query.recurringDonations.findFirst({
      where: eq(recurringDonations.stripeSubscriptionId, subId),
    });
    if (!recurring) {
      console.error('   Recurring donation not found for subscription', subId);
      process.exit(1);
    }
    if (!DRY_RUN) {
      const { processRecurringDonationPayment, updateSubscriptionAfterPayment } = await import(
        '../lib/services/subscription-service'
      );
      const result = await processRecurringDonationPayment(recurring.id);
      if (!result.success || !result.donationId) {
        console.error('   processRecurringDonationPayment failed:', result.error);
        process.exit(1);
      }
      const paymentIntentId =
        typeof invoice.payment_intent === 'object' && invoice.payment_intent
          ? (invoice.payment_intent as { id: string }).id
          : (invoice.payment_intent as string);
      await db
        .update(donations)
        .set({
          paymentStatus: 'completed',
          paymentIntentId: paymentIntentId ?? undefined,
          processedAt: new Date(),
        })
        .where(eq(donations.id, result.donationId));
      await updateCampaignAmount(recurring.campaignId);
      await updateSubscriptionAfterPayment(recurring.id, result.donationId, true);
      await db
        .update(recurringDonationPayments)
        .set({
          stripeInvoiceId: invoice.id,
          stripePaymentIntentId: paymentIntentId ?? null,
        })
        .where(
          and(
            eq(recurringDonationPayments.recurringDonationId, recurring.id),
            eq(recurringDonationPayments.donationId, result.donationId)
          )
        );
      const campaignRow = await db
        .select({ creatorId: campaigns.creatorId })
        .from(campaigns)
        .where(eq(campaigns.id, recurring.campaignId))
        .limit(1);
      const donationRow = await db
        .select({ amount: donations.amount, currency: donations.currency, donorId: donations.donorId })
        .from(donations)
        .where(eq(donations.id, result.donationId))
        .limit(1);
      if (campaignRow.length && donationRow.length) {
        const check = await shouldNotifyUserOfDonation(
          campaignRow[0].creatorId,
          donationRow[0].amount,
          donationRow[0].currency
        );
        if (check.shouldNotify) {
          const { title, message } = formatDonationNotificationMessage(
            donationRow[0].amount,
            donationRow[0].currency,
            check.isLargeDonation
          );
          await db.insert(notifications).values({
            userId: campaignRow[0].creatorId,
            type: check.isLargeDonation ? 'large_donation_received' : 'donation_received',
            title,
            message,
            metadata: JSON.stringify({
              donationId: result.donationId,
              campaignId: recurring.campaignId,
              amount: donationRow[0].amount,
              currency: donationRow[0].currency,
              donorId: donationRow[0].donorId,
              isLargeDonation: check.isLargeDonation,
            }),
          });
          const { sendCampaignDonationEmailById } = await import('../lib/notifications/campaign-donation-email');
          await sendCampaignDonationEmailById(result.donationId, campaignRow[0].creatorId, check.isLargeDonation);
        }
      }
      await sendDonorConfirmationEmailById(result.donationId);
      console.log('   Donation backfilled:', result.donationId);
    } else {
      console.log('   Would create donation and update campaign (dry run).');
    }
  }

  // 2) Cancel the 3 duplicate subscriptions in Stripe and mark cancelled in DB
  console.log('\n2) Cancelling 3 duplicate recurring donations in Stripe and DB');
  const toCancel = await db
    .select({ id: recurringDonations.id, stripeSubscriptionId: recurringDonations.stripeSubscriptionId })
    .from(recurringDonations)
    .where(inArray(recurringDonations.id, DUPLICATE_RECURRING_IDS));

  for (const row of toCancel) {
    if (DRY_RUN) {
      console.log('   Would cancel', row.id, row.stripeSubscriptionId ?? 'no Stripe sub');
      continue;
    }
    try {
      if (row.stripeSubscriptionId) {
        await cancelStripeSubscription(row.stripeSubscriptionId, true);
        console.log('   Cancelled in Stripe:', row.stripeSubscriptionId);
      }
      await db
        .update(recurringDonations)
        .set({
          status: 'cancelled',
          isActive: false,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(recurringDonations.id, row.id));
      console.log('   Marked cancelled in DB:', row.id);
    } catch (e: unknown) {
      console.error('   Error for', row.id, e instanceof Error ? e.message : e);
    }
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
