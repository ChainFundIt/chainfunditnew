import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const ambassadorApplications = pgTable("ambassador_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  stateOfResidence: varchar("state_of_residence", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  massComms: boolean("mass_comms").notNull(),
  createsContent: boolean("creates_content").notNull(),
  handles: text("handles"),
  interest: text("interest").notNull(),
  helpedBefore: boolean("helped_before").notNull(),
  helpedDescription: text("helped_description"),
  cvFile: jsonb("cv_file"),
  introVideoFile: jsonb("intro_video_file"),
  introVideoLink: text("intro_video_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AmbassadorApplication = typeof ambassadorApplications.$inferSelect;
export type NewAmbassadorApplication = typeof ambassadorApplications.$inferInsert;
