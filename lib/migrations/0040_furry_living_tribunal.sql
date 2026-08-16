CREATE INDEX "campaign_screenings_pending_idx" ON "campaign_screenings" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "campaigns_active_expires_at_idx" ON "campaigns" USING btree ("status","is_active","expires_at");--> statement-breakpoint
CREATE INDEX "campaigns_active_goal_idx" ON "campaigns" USING btree ("status","is_active","current_amount");--> statement-breakpoint
CREATE INDEX "donations_pending_paystack_verification_idx" ON "donations" USING btree ("payment_status","payment_method","created_at");--> statement-breakpoint
CREATE INDEX "impact_hangout_pending_reminder_idx" ON "impact_hangout_registrations" USING btree ("payment_status","created_at","reminder_5min_sent_at","reminder_1day_sent_at","reminder_5days_sent_at");