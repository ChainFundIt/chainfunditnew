ALTER TABLE "collection_contributions" ADD COLUMN IF NOT EXISTS "support_chainfundit" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "collection_contributions" ADD COLUMN IF NOT EXISTS "total_charged" numeric(10, 2);
--> statement-breakpoint
ALTER TABLE "collection_contributions" ADD COLUMN IF NOT EXISTS "provider_fee_amount" numeric(10, 2);
--> statement-breakpoint
ALTER TABLE "collection_contributions" ADD COLUMN IF NOT EXISTS "platform_fee_amount" numeric(10, 2);