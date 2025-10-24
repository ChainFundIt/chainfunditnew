-- Add role field to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Create index for role field
CREATE INDEX users_role_idx ON users(role);

-- Update existing users to have 'user' role (this is already the default, but being explicit)
UPDATE users SET role = 'user' WHERE role IS NULL;
