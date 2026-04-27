import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { careerOpenings } from "./careers";

export const careerApplications = pgTable("career_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  careerOpeningId: uuid("career_opening_id")
    .notNull()
    .references(() => careerOpenings.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  cityState: varchar("city_state", { length: 255 }),
  linkedInUrl: varchar("linkedin_url", { length: 500 }),
  portfolioUrl: varchar("portfolio_url", { length: 500 }),
  coverLetter: text("cover_letter").notNull(),
  additionalInfo: text("additional_info"),
  resumeFile: jsonb("resume_file"),
  consentToContact: boolean("consent_to_contact").default(true).notNull(),
  decision: varchar("decision", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CareerApplication = typeof careerApplications.$inferSelect;
export type NewCareerApplication = typeof careerApplications.$inferInsert;
