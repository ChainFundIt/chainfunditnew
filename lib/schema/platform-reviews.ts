import {
  pgTable,
  uuid,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Platform-level reviews (one per user).
 * - Verified-only enforcement happens at the API layer (donation completed OR payout completed).
 * - Name is "live": public reads join to `users.fullName` unless `isAnonymous = true`.
 */
export const platformReviews = pgTable(
  "platform_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5
    headline: varchar("headline", { length: 120 }),
    body: text("body"),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userUnique: uniqueIndex("platform_reviews_user_id_unique").on(table.userId),
    createdAtIdx: index("platform_reviews_created_at_idx").on(table.createdAt),
  })
);

export type PlatformReview = typeof platformReviews.$inferSelect;
export type NewPlatformReview = typeof platformReviews.$inferInsert;

