import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const partnershipApplications = pgTable("partnership_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  cityState: varchar("city_state", { length: 255 }).notNull(),
  availability: varchar("availability", { length: 20 }).notNull(),
  startTimeline: varchar("start_timeline", { length: 30 }).notNull(),
  motivation: text("motivation").notNull(),
  targetsComfort: boolean("targets_comfort").notNull(),
  explainChainfundit: text("explain_chainfundit").notNull(),
  respondToCharity: text("respond_to_charity").notNull(),
  dmToCharity: text("dm_to_charity").notNull(),
  messageToFamily: text("message_to_family").notNull(),
  convincedBefore: text("convinced_before").notNull(),
  handleRejection: text("handle_rejection").notNull(),
  hoursPerWeek: integer("hours_per_week").notNull(),
  hasInternet: boolean("has_internet").notNull(),
  meaningOfDoingGood: text("meaning_of_doing_good").notNull(),
  additionalInfo: text("additional_info"),
  decision: varchar("decision", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PartnershipApplication = typeof partnershipApplications.$inferSelect;
export type NewPartnershipApplication = typeof partnershipApplications.$inferInsert;
