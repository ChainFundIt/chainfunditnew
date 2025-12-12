CREATE TABLE "favourites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"item_type" varchar(20) NOT NULL,
	"item_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "favourites_user_item_unique" ON "favourites" ("user_id","item_type","item_id");--> statement-breakpoint
CREATE INDEX "favourites_user_id_idx" ON "favourites" ("user_id");--> statement-breakpoint
CREATE INDEX "favourites_item_idx" ON "favourites" ("item_type","item_id");--> statement-breakpoint
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

