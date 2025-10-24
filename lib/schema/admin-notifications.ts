import { pgTable, uuid, varchar, text, timestamp, boolean, index, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const adminNotifications = pgTable('admin_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'system', 'user', 'campaign', 'donation', 'payout', 'security'
  priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'urgent'
  status: varchar('status', { length: 20 }).default('unread'), // 'unread', 'read', 'archived'
  actionUrl: varchar('action_url', { length: 500 }),
  actionLabel: varchar('action_label', { length: 100 }),
  metadata: json('metadata'), // Additional data like user_id, campaign_id, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
  archivedAt: timestamp('archived_at'),
}, (table) => ({
  typeIdx: index('admin_notifications_type_idx').on(table.type),
  statusIdx: index('admin_notifications_status_idx').on(table.status),
  priorityIdx: index('admin_notifications_priority_idx').on(table.priority),
  createdAtIdx: index('admin_notifications_created_at_idx').on(table.createdAt),
}));

export type AdminNotification = typeof adminNotifications.$inferSelect;
export type NewAdminNotification = typeof adminNotifications.$inferInsert;
