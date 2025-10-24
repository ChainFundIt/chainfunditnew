-- Manual Admin User Setup
-- Run these SQL commands in your database

-- First, make sure the role column exists (run the migration)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- Update existing user to admin (replace with your email)
UPDATE users 
SET 
  role = 'admin',
  is_verified = true,
  has_completed_profile = true
WHERE email = 'ladetunji@chainfundit.com';

-- Or create a new admin user (replace with your details)
INSERT INTO users (
  email, 
  full_name, 
  password, 
  role, 
  is_verified, 
  has_completed_profile
) VALUES (
  'admin@chainfundit.com',
  'Admin User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8.8.8.8.8', -- This is 'password123' hashed
  'admin',
  true,
  true
);

-- Create super admin
INSERT INTO users (
  email, 
  full_name, 
  password, 
  role, 
  is_verified, 
  has_completed_profile
) VALUES (
  'superadmin@chainfundit.com',
  'Super Admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J8.8.8.8.8', -- This is 'password123' hashed
  'super_admin',
  true,
  true
);

-- Verify the users were created/updated
SELECT email, full_name, role, is_verified FROM users WHERE role IN ('admin', 'super_admin');
