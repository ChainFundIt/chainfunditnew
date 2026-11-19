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

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  creator: one(users, {
    fields: [collections.creatorId],
    references: [users.id],
  }),
  contributions: many(collectionContributions),
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

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CollectionContribution =
  typeof collectionContributions.$inferSelect;
export type NewCollectionContribution =
  typeof collectionContributions.$inferInsert;