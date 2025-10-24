import { pgTable, uuid, varchar, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // User ID
  
  // Email Notifications
  emailNotificationsEnabled: boolean('email_notifications_enabled').default(true).notNull(),
  notificationEmail: varchar('notification_email', { length: 255 }), // Override default user email
  
  // Notification Preferences
  notifyOnCharityDonation: boolean('notify_on_charity_donation').default(false).notNull(), // When they donate to charity
  notifyOnCampaignDonation: boolean('notify_on_campaign_donation').default(true).notNull(), // When their campaign receives a donation
  notifyOnPayoutRequest: boolean('notify_on_payout_request').default(true).notNull(), // When payout is ready
  notifyOnLargeDonation: boolean('notify_on_large_donation').default(true).notNull(), // When receiving large donations
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

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

