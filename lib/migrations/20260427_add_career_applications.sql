CREATE TABLE IF NOT EXISTS "career_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "career_opening_id" uuid NOT NULL,
  "full_name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(50) NOT NULL,
  "city_state" varchar(255),
  "linkedin_url" varchar(500),
  "portfolio_url" varchar(500),
  "cover_letter" text NOT NULL,
  "additional_info" text,
  "resume_file" jsonb,
  "consent_to_contact" boolean DEFAULT true NOT NULL,
  "decision" varchar(20) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "career_applications"
 ADD CONSTRAINT "career_applications_career_opening_id_career_openings_id_fk"
 FOREIGN KEY ("career_opening_id")
 REFERENCES "public"."career_openings"("id")
 ON DELETE cascade
 ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
