CREATE TABLE "ambassador_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"state_of_residence" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"mass_comms" boolean NOT NULL,
	"creates_content" boolean NOT NULL,
	"handles" text,
	"interest" text NOT NULL,
	"helped_before" boolean NOT NULL,
	"helped_description" text,
	"cv_file" jsonb,
	"intro_video_file" jsonb,
	"intro_video_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
