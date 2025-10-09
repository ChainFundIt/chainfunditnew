import { pgTable, uuid, varchar, timestamp, text, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const charities = pgTable('charities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  mission: text('mission'),
  
  // Contact Information
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  website: varchar('website', { length: 500 }),
  
  // Location
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  
  // Registration Details
  registrationNumber: varchar('registration_number', { length: 100 }),
  taxId: varchar('tax_id', { length: 100 }),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at'),
  
  // Categories and Focus Areas
  category: varchar('category', { length: 100 }), // Education, Health, Environment, etc.
  focusAreas: jsonb('focus_areas').$type<string[]>(), // Array of focus areas
  
  // Media
  logo: varchar('logo', { length: 500 }),
  coverImage: varchar('cover_image', { length: 500 }),
  images: jsonb('images').$type<string[]>(), // Additional images
  
  // Banking Information (for payouts)
  bankName: varchar('bank_name', { length: 255 }),
  accountNumber: varchar('account_number', { length: 100 }),
  accountName: varchar('account_name', { length: 255 }),
  bankCode: varchar('bank_code', { length: 20 }),
  swiftCode: varchar('swift_code', { length: 20 }),
  iban: varchar('iban', { length: 50 }),
  
  // Financial Transparency
  totalReceived: decimal('total_received', { precision: 12, scale: 2 }).default('0').notNull(),
  totalPaidOut: decimal('total_paid_out', { precision: 12, scale: 2 }).default('0').notNull(),
  pendingAmount: decimal('pending_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  
  // Scraping Metadata
  sourceUrl: varchar('source_url', { length: 500 }), // Where we scraped this from
  scrapedAt: timestamp('scraped_at'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isPaused: boolean('is_paused').default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Charity Donations - tracks donations to specific charities
export const charityDonations = pgTable('charity_donations', {
  id: uuid('id').primaryKey().defaultRandom(),
  charityId: uuid('charity_id').notNull().references(() => charities.id, { onDelete: 'cascade' }),
  donorId: uuid('donor_id'), // nullable for anonymous donations
  donorName: varchar('donor_name', { length: 255 }),
  donorEmail: varchar('donor_email', { length: 255 }),
  
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  
  // Payment Information
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  paymentIntentId: varchar('payment_intent_id', { length: 255 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  
  // Donor Message
  message: text('message'),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  
  // Payout Status
  payoutStatus: varchar('payout_status', { length: 20 }).default('pending').notNull(), // pending, processing, completed, failed
  payoutReference: varchar('payout_reference', { length: 255 }),
  paidOutAt: timestamp('paid_out_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Charity Payouts - tracks payouts to charities
export const charityPayouts = pgTable('charity_payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  charityId: uuid('charity_id').notNull().references(() => charities.id, { onDelete: 'cascade' }),
  
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  
  // Payout Details
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, processing, completed, failed
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // bank_transfer, paypal, etc.
  reference: varchar('reference', { length: 255 }),
  
  // Banking Details Used
  bankName: varchar('bank_name', { length: 255 }),
  accountNumber: varchar('account_number', { length: 100 }),
  accountName: varchar('account_name', { length: 255 }),
  
  // Related Donations
  donationIds: jsonb('donation_ids').$type<string[]>(), // Array of donation IDs included in this payout
  
  // Error Tracking
  failureReason: text('failure_reason'),
  retryAttempts: decimal('retry_attempts', { precision: 2, scale: 0 }).default('0').notNull(),
  
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const charitiesRelations = relations(charities, ({ many }) => ({
  donations: many(charityDonations),
  payouts: many(charityPayouts),
}));

export const charityDonationsRelations = relations(charityDonations, ({ one }) => ({
  charity: one(charities, {
    fields: [charityDonations.charityId],
    references: [charities.id],
  }),
}));

export const charityPayoutsRelations = relations(charityPayouts, ({ one }) => ({
  charity: one(charities, {
    fields: [charityPayouts.charityId],
    references: [charities.id],
  }),
}));

export type Charity = typeof charities.$inferSelect;
export type NewCharity = typeof charities.$inferInsert;
export type CharityDonation = typeof charityDonations.$inferSelect;
export type NewCharityDonation = typeof charityDonations.$inferInsert;
export type CharityPayout = typeof charityPayouts.$inferSelect;
export type NewCharityPayout = typeof charityPayouts.$inferInsert;

