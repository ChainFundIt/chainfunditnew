-- Add slug column to campaigns table
ALTER TABLE campaigns ADD COLUMN slug VARCHAR(255);

-- Create unique index on slug column
CREATE UNIQUE INDEX idx_campaigns_slug ON campaigns(slug);
