import { pgTable, uuid, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const campaignCreatorCheckins = pgTable(
  'campaign_creator_checkins',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id').notNull(),
    userId: uuid('user_id').notNull(),
    day: integer('day').notNull(),
    sentAt: timestamp('sent_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('campaign_creator_checkins_campaign_day_unique').on(
      table.campaignId,
      table.day
    ),
  ]
);

export type CampaignCreatorCheckin = typeof campaignCreatorCheckins.$inferSelect;
export type NewCampaignCreatorCheckin = typeof campaignCreatorCheckins.$inferInsert;

