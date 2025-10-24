CREATE TABLE "admin_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'unread',
	"action_url" varchar(500),
	"action_label" varchar(100),
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "admin_notifications_type_idx" ON "admin_notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "admin_notifications_status_idx" ON "admin_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "admin_notifications_priority_idx" ON "admin_notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "admin_notifications_created_at_idx" ON "admin_notifications" USING btree ("created_at");