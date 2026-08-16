-- Backfill campaign expiration timestamps using the same duration rules
-- as lib/utils/campaign-closure.ts.
UPDATE campaigns
SET expires_at = CASE duration
  WHEN '1 week' THEN created_at + INTERVAL '7 days'
  WHEN '2 weeks' THEN created_at + INTERVAL '14 days'
  WHEN '1 month' THEN created_at + INTERVAL '1 month'
  WHEN '1 year' THEN created_at + INTERVAL '1 year'
  ELSE NULL
END
WHERE expires_at IS NULL
  AND duration IN ('1 week', '2 weeks', '1 month', '1 year');

-- Support the optimized campaign-closure queries.
CREATE INDEX IF NOT EXISTS campaigns_active_expires_at_idx
  ON campaigns (status, is_active, expires_at);

CREATE INDEX IF NOT EXISTS campaigns_active_goal_idx
  ON campaigns (status, is_active, current_amount);

CREATE INDEX IF NOT EXISTS impact_hangout_pending_reminder_idx
  ON impact_hangout_registrations (
    payment_status,
    created_at,
    reminder_5min_sent_at,
    reminder_1day_sent_at,
    reminder_5days_sent_at
  );

CREATE INDEX IF NOT EXISTS donations_pending_paystack_verification_idx
  ON donations (payment_status, payment_method, created_at);

CREATE INDEX IF NOT EXISTS donations_pending_cleanup_idx
  ON donations (payment_status, created_at);

CREATE INDEX IF NOT EXISTS campaign_screenings_pending_idx
  ON campaign_screenings (status, created_at);