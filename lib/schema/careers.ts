import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const careerOpenings = pgTable("career_openings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }),
  location: varchar("location", { length: 255 }),
  employmentType: varchar("employment_type", { length: 50 }),
  summary: text("summary"),
  responsibilities: jsonb("responsibilities"),
  requirements: jsonb("requirements"),
  customFields: jsonb("custom_fields"),
  applyUrl: varchar("apply_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CareerOpening = typeof careerOpenings.$inferSelect;
export type NewCareerOpening = typeof careerOpenings.$inferInsert;
