-- Add idempotency key for campaign creation to prevent duplicate campaigns on double-submit/retry
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS creation_request_id VARCHAR(64);

-- Enforce uniqueness for non-null idempotency keys (multiple NULLs are allowed)
CREATE UNIQUE INDEX IF NOT EXISTS campaigns_creation_request_id_unique
  ON campaigns (creation_request_id);


