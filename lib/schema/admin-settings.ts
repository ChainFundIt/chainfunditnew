import { pgTable, uuid, varchar, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const adminSettings = pgTable('admin_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // Admin user ID
  
  // Email Notifications
  emailNotificationsEnabled: boolean('email_notifications_enabled').default(true).notNull(),
  notificationEmail: varchar('notification_email', { length: 255 }), // Override default admin email
  
  // Notification Preferences
  notifyOnCharityDonation: boolean('notify_on_charity_donation').default(true).notNull(),
  notifyOnCampaignDonation: boolean('notify_on_campaign_donation').default(true).notNull(),
  notifyOnPayoutRequest: boolean('notify_on_payout_request').default(true).notNull(),
  notifyOnLargeDonation: boolean('notify_on_large_donation').default(true).notNull(),
  notifyOnAccountChangeRequest: boolean('notify_on_account_change_request').default(true).notNull(),
  largeDonationThreshold: varchar('large_donation_threshold', { length: 20 }).default('1000'), // Amount in USD
  
  // Push Notifications
  pushNotificationsEnabled: boolean('push_notifications_enabled').default(false).notNull(),
  pushSubscription: jsonb('push_subscription'), // Web Push subscription data
  
  // Daily/Weekly Summaries
  dailySummaryEnabled: boolean('daily_summary_enabled').default(false).notNull(),
  weeklySummaryEnabled: boolean('weekly_summary_enabled').default(true).notNull(),
  summaryTime: varchar('summary_time', { length: 10 }).default('09:00'), // HH:MM format
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AdminSettings = typeof adminSettings.$inferSelect;
export type NewAdminSettings = typeof adminSettings.$inferInsert;

