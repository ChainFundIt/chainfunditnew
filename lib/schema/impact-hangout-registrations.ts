import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const KICKSTART_AMOUNTS_NGN = [5_000, 10_000, 20_000] as const;

export const impactHangoutRegistrations = pgTable(
  "impact_hangout_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    hostType: varchar("host_type", { length: 100 }),
    plannedWhen: varchar("planned_when", { length: 100 }),
    cause: varchar("cause", { length: 100 }),
    receiveUpdates: boolean("receive_updates").default(true).notNull(),
    eventType: varchar("event_type", { length: 100 }),
    hangoutName: varchar("hangout_name", { length: 255 }),
    slug: varchar("slug", { length: 255 }),
    fundraisingGoalNgn: integer("fundraising_goal_ngn"),
    shortPitch: text("short_pitch"),
    story: text("story"),
    eventDate: timestamp("event_date"),
    eventEndDate: timestamp("event_end_date"),
    timezone: varchar("timezone", { length: 100 }),
    locationType: varchar("location_type", { length: 20 }),
    venueName: varchar("venue_name", { length: 255 }),
    venueAddress: text("venue_address"),
    meetingLink: text("meeting_link"),
    impactTiersJson: text("impact_tiers_json"),
    faqsJson: text("faqs_json"),
    paymentStatus: varchar("payment_status", { length: 20 }).default("pending").notNull(),
    paymentReference: varchar("payment_reference", { length: 100 }),
    commitmentAmountNgn: integer("commitment_amount_ngn"),
    /** Total raised (host kickstart + donor donations). Used for progress. */
    totalRaisedNgn: integer("total_raised_ngn"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Milestone emails (25%, 50%, 75%, 100%)
    milestone25SentAt: timestamp("milestone_25_sent_at"),
    milestone50SentAt: timestamp("milestone_50_sent_at"),
    milestone75SentAt: timestamp("milestone_75_sent_at"),
    milestone100SentAt: timestamp("milestone_100_sent_at"),
    // Abandoned registration reminders
    reminder5minSentAt: timestamp("reminder_5min_sent_at"),
    reminder1daySentAt: timestamp("reminder_1day_sent_at"),
    reminder5daysSentAt: timestamp("reminder_5days_sent_at"),
  }
);

export type ImpactHangoutRegistration =
  typeof impactHangoutRegistrations.$inferSelect;
export type NewImpactHangoutRegistration =
  typeof impactHangoutRegistrations.$inferInsert;
