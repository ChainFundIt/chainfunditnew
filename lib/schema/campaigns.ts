import { pgTable, uuid, varchar, timestamp, text, decimal, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull(),
  // Client-provided idempotency key for campaign creation (prevents duplicate creation on retries/double-submits)
  creationRequestId: varchar('creation_request_id', { length: 64 }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  subtitle: varchar('subtitle', { length: 255 }),
  description: text('description').notNull(),
  reason: varchar('reason', { length: 100 }),
  fundraisingFor: varchar('fundraising_for', { length: 100 }),
  duration: varchar('duration', { length: 50 }),
  videoUrl: varchar('video_url', { length: 255 }),
  coverImageUrl: varchar('cover_image_url', { length: 255 }),
  galleryImages: text('gallery_images'), // JSON stringified array
  documents: text('documents'), // JSON stringified array
  goalAmount: decimal('goal_amount', { precision: 15, scale: 2 }).notNull(), // Increased precision for larger amounts
  currency: varchar('currency', { length: 50 }).notNull(), // Increased length for longer currency names
  minimumDonation: decimal('minimum_donation', { precision: 15, scale: 2 }).notNull(),
  chainerCommissionRate: decimal('chainer_commission_rate', { precision: 3, scale: 1 }).notNull(), // 1.0-10.0
  isChained: boolean('is_chained').default(false).notNull(), // Whether campaign allows chaining
  isVerified: boolean('is_verified').default(false).notNull(),
  /** Set when admin offers verified status; creator must accept rules before isVerified becomes true. */
  verifiedPendingAt: timestamp('verified_pending_at'),
  verifiedRulesAcceptedAt: timestamp('verified_rules_accepted_at'),
  currentAmount: decimal('current_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, paused, goal_reached, closed, expired
  visibility: varchar('visibility', { length: 20 }).default('public').notNull(), // public, private
  isActive: boolean('is_active').default(true).notNull(),
  complianceStatus: varchar('compliance_status', { length: 30 }).default('pending_screening').notNull(), // pending_screening, in_review, approved, blocked
  complianceSummary: text('compliance_summary'),
  complianceFlags: jsonb('compliance_flags'),
  riskScore: decimal('risk_score', { precision: 5, scale: 2 }).default('0').notNull(),
  reviewRequired: boolean('review_required').default(false).notNull(),
  lastScreenedAt: timestamp('last_screened_at'),
  blockedAt: timestamp('blocked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
  deletedAt: timestamp('deleted_at'), // When campaign was moved to "Recently Deleted" (admin soft delete)
  // Auto-close logic fields
  goalReachedAt: timestamp('goal_reached_at'), // When campaign first reached its goal
  autoCloseAt: timestamp('auto_close_at'), // When campaign should be auto-closed (4 weeks after goal reached)
  expiresAt: timestamp('expires_at'), // Campaign expiration date (if any)
  quickDonateCustomerCode: varchar('quick_donate_customer_code', { length: 100 }),
  quickDonateAccountNumber: varchar('quick_donate_account_number', { length: 20 }),
  quickDonateBankName: varchar('quick_donate_bank_name', { length: 100 }),
  quickDonateAccountName: varchar('quick_donate_account_name', { length: 255 }),
  // Optional campaign-level payout fee override managed by admin.
  // Percentage value is in percent points (e.g. 1.5 means 1.5%).
  platformFeeOverrideEnabled: boolean('platform_fee_override_enabled').default(false).notNull(),
  platformFeeOverridePercent: decimal('platform_fee_override_percent', { precision: 5, scale: 2 }),
});


// Relations will be defined later to avoid circular dependencies

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;