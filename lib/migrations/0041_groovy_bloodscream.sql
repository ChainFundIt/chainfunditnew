CREATE TABLE "collection_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"contributor_id" uuid,
	"contributor_name" varchar(255),
	"contributor_email" varchar(255),
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"payment_intent_id" varchar(255),
	"transaction_id" varchar(255),
	"message" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"organiser_name" varchar(255) NOT NULL,
	"cover_image" varchar(500),
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"target_amount" numeric(12, 2),
	"total_raised" numeric(12, 2) DEFAULT '0' NOT NULL,
	"due_at" timestamp,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "collection_contributions" ADD CONSTRAINT "collection_contributions_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;