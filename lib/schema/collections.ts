import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 80 }),
  organiserName: varchar("organiser_name", { length: 255 }).notNull(),
  coverImage: varchar("cover_image", { length: 500 }),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }),
  totalRaised: decimal("total_raised", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  dueAt: timestamp("due_at"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collectionContributions = pgTable("collection_contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  contributorId: uuid("contributor_id"),
  contributorName: varchar("contributor_name", { length: 255 }),
  contributorEmail: varchar("contributor_email", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  totalCharged: decimal("total_charged", { precision: 10, scale: 2 }),
  providerFeeAmount: decimal("provider_fee_amount", { precision: 10, scale: 2 }),
  platformFeeAmount: decimal("platform_fee_amount", { precision: 10, scale: 2 }),
  supportChainfundit: boolean("support_chainfundit").default(false).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  paymentStatus: varchar("payment_status", { length: 20 })
    .default("pending")
    .notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collectionPayouts = pgTable("collection_payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  requestedAmount: decimal("requested_amount", { precision: 12, scale: 2 }).notNull(),
  grossAmount: decimal("gross_amount", { precision: 12, scale: 2 }).notNull(),
  fees: decimal("fees", { precision: 12, scale: 2 }).default("0").notNull(),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  payoutProvider: varchar("payout_provider", { length: 50 }).notNull(),
  reference: varchar("reference", { length: 255 }),
  bankName: varchar("bank_name", { length: 255 }),
  accountNumber: varchar("account_number", { length: 100 }),
  accountName: varchar("account_name", { length: 255 }),
  bankCode: varchar("bank_code", { length: 10 }),
  notes: text("notes"),
  rejectionReason: text("rejection_reason"),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),
  transactionId: varchar("transaction_id", { length: 255 }),
  failureReason: text("failure_reason"),
  retryAttempts: decimal("retry_attempts", { precision: 2, scale: 0 })
    .default("0")
    .notNull(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  creator: one(users, {
    fields: [collections.creatorId],
    references: [users.id],
  }),
  contributions: many(collectionContributions),
  payouts: many(collectionPayouts),
}));

export const collectionContributionsRelations = relations(
  collectionContributions,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionContributions.collectionId],
      references: [collections.id],
    }),
  })
);

export const collectionPayoutsRelations = relations(
  collectionPayouts,
  ({ one }) => ({
    user: one(users, {
      fields: [collectionPayouts.userId],
      references: [users.id],
    }),
    collection: one(collections, {
      fields: [collectionPayouts.collectionId],
      references: [collections.id],
    }),
  })
);

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CollectionContribution =
  typeof collectionContributions.$inferSelect;
export type NewCollectionContribution =
  typeof collectionContributions.$inferInsert;
export type CollectionPayout = typeof collectionPayouts.$inferSelect;
export type NewCollectionPayout = typeof collectionPayouts.$inferInsert;