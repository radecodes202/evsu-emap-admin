-- Migration script to add Users and enhance Paths/Routes tables
-- Run this in Supabase SQL Editor after running database-setup.sql

-- Users table for admin panel user management
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT, -- For future password hashing if needed
  role TEXT NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Routes/Paths table (extending the existing routes table)
-- Add columns if they don't exist
DO $$ 
BEGIN
  -- Add path_name if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='routes' AND column_name='path_name') THEN
    ALTER TABLE routes ADD COLUMN path_name TEXT;
  END IF;
  
  -- Add path_type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='routes' AND column_name='path_type') THEN
    ALTER TABLE routes ADD COLUMN path_type TEXT DEFAULT 'walkway';
  END IF;
  
  -- Add is_active if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='routes' AND column_name='is_active') THEN
    ALTER TABLE routes ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  -- Add description if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='routes' AND column_name='description') THEN
    ALTER TABLE routes ADD COLUMN description TEXT;
  END IF;
END $$;

-- Waypoints table for path waypoints
CREATE TABLE IF NOT EXISTS waypoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waypoints ENABLE ROW LEVEL SECURITY;

-- Public read access for routes (already exists, but ensure it's there)
-- Admin users policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Public read admin_users') THEN
    CREATE POLICY "Public read admin_users" ON admin_users FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Service role all admin_users') THEN
    CREATE POLICY "Service role all admin_users" ON admin_users FOR ALL 
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Waypoints policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'waypoints' AND policyname = 'Public read waypoints') THEN
    CREATE POLICY "Public read waypoints" ON waypoints FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'waypoints' AND policyname = 'Service role all waypoints') THEN
    CREATE POLICY "Service role all waypoints" ON waypoints FOR ALL 
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Routes policies (ensure they exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'routes' AND policyname = 'Service role all routes') THEN
    CREATE POLICY "Service role all routes" ON routes FOR ALL 
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);
CREATE INDEX IF NOT EXISTS admin_users_role_idx ON admin_users(role);
CREATE INDEX IF NOT EXISTS waypoints_route_id_idx ON waypoints(route_id);
CREATE INDEX IF NOT EXISTS waypoints_sequence_idx ON waypoints(route_id, sequence_order);

-- Updated at trigger for admin_users
-- Ensure the function exists (CREATE OR REPLACE is safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists to avoid conflicts)
DROP TRIGGER IF EXISTS admin_users_updated_at ON admin_users;
CREATE TRIGGER admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Sample admin user (password: admin123 - in production, use proper password hashing)
-- Note: This is a simple example. In production, use Supabase Auth instead
INSERT INTO admin_users (email, name, role) 
VALUES ('admin@evsu.edu.ph', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;
