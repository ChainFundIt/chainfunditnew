-- Add slug column to campaigns table
ALTER TABLE campaigns ADD COLUMN slug VARCHAR(255);

-- Create unique index on slug column
CREATE UNIQUE INDEX idx_campaigns_slug ON campaigns(slug);

-- Add NOT NULL constraint after populating slugs (will be done by script)
-- ALTER TABLE campaigns ALTER COLUMN slug SET NOT NULL;

