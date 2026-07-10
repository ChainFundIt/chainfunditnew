ALTER TABLE "campaigns"
ADD COLUMN "platform_fee_override_enabled" boolean DEFAULT false NOT NULL;

ALTER TABLE "campaigns"
ADD COLUMN "platform_fee_override_percent" numeric(5, 2);
