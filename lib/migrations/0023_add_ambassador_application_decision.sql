ALTER TABLE "ambassador_applications"
ADD COLUMN "decision" varchar(20) NOT NULL DEFAULT 'pending';
