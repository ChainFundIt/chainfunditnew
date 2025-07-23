import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const phoneOtps = pgTable('phone_otps', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).notNull(),
  otp: varchar('otp', { length: 10 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 