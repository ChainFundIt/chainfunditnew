ALTER TABLE "users" ADD COLUMN "role" varchar(20) DEFAULT 'user';--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");