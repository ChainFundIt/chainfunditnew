import { relations } from "drizzle-orm/relations";
import { users, refreshTokens, charities, charityDonations, charityPayouts } from "./schema";

export const refreshTokensRelations = relations(refreshTokens, ({one}) => ({
	user: one(users, {
		fields: [refreshTokens.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	refreshTokens: many(refreshTokens),
}));

export const charityDonationsRelations = relations(charityDonations, ({one}) => ({
	charity: one(charities, {
		fields: [charityDonations.charityId],
		references: [charities.id]
	}),
}));

export const charitiesRelations = relations(charities, ({many}) => ({
	charityDonations: many(charityDonations),
	charityPayouts: many(charityPayouts),
}));

export const charityPayoutsRelations = relations(charityPayouts, ({one}) => ({
	charity: one(charities, {
		fields: [charityPayouts.charityId],
		references: [charities.id]
	}),
}));