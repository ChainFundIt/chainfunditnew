CREATE TABLE "career_openings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"department" varchar(255),
	"location" varchar(255),
	"employment_type" varchar(50),
	"summary" text,
	"responsibilities" jsonb,
	"requirements" jsonb,
	"apply_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
