import { pgTable, uuid, varchar, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { campaigns } from './campaigns';
import { charities } from './charities';

export const favourites = pgTable('favourites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemType: varchar('item_type', { length: 20 }).notNull(), // 'campaign' or 'charity'
  itemId: uuid('item_id').notNull(), // ID of the campaign or charity
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Ensure a user can only favourite an item once
  uniqueUserItem: unique('favourites_user_item_unique').on(table.userId, table.itemType, table.itemId),
  userIdIdx: index('favourites_user_id_idx').on(table.userId),
  itemIdx: index('favourites_item_idx').on(table.itemType, table.itemId),
}));

// Relations
export const favouritesRelations = relations(favourites, ({ one }) => ({
  user: one(users, {
    fields: [favourites.userId],
    references: [users.id],
  }),
}));

export type Favourite = typeof favourites.$inferSelect;
export type NewFavourite = typeof favourites.$inferInsert;

