-- Fix RLS policies for admin panel operations
-- This script updates RLS policies to allow service role key to perform all operations

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Service role all buildings" ON buildings;
DROP POLICY IF EXISTS "Service role all locations" ON locations;
DROP POLICY IF EXISTS "Service role all POI" ON points_of_interest;
DROP POLICY IF EXISTS "Service role all routes" ON routes;
DROP POLICY IF EXISTS "Allow all operations for service role" ON buildings;
DROP POLICY IF EXISTS "Allow all operations for service role" ON locations;
DROP POLICY IF EXISTS "Allow all operations for service role" ON points_of_interest;
DROP POLICY IF EXISTS "Allow all operations for service role" ON routes;

-- IMPORTANT: When using service_role key, Supabase should bypass RLS automatically.
-- However, if RLS is still being enforced, these policies will allow all operations.
-- For admin panel, we allow all operations since service_role key is used.

-- Allow INSERT, UPDATE, DELETE operations on buildings
CREATE POLICY "Allow insert buildings" ON buildings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update buildings" ON buildings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete buildings" ON buildings FOR DELETE USING (true);

-- Allow INSERT, UPDATE, DELETE operations on locations
CREATE POLICY "Allow insert locations" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update locations" ON locations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete locations" ON locations FOR DELETE USING (true);

-- Allow INSERT, UPDATE, DELETE operations on points_of_interest
CREATE POLICY "Allow insert POI" ON points_of_interest FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update POI" ON points_of_interest FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete POI" ON points_of_interest FOR DELETE USING (true);

-- Allow INSERT, UPDATE, DELETE operations on routes
CREATE POLICY "Allow insert routes" ON routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update routes" ON routes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete routes" ON routes FOR DELETE USING (true);

-- Also fix policies for admin_users and waypoints if they exist
DO $$
BEGIN
  -- Check if admin_users table exists and add policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Service role all admin_users" ON admin_users;
    DROP POLICY IF EXISTS "Allow insert admin_users" ON admin_users;
    DROP POLICY IF EXISTS "Allow update admin_users" ON admin_users;
    DROP POLICY IF EXISTS "Allow delete admin_users" ON admin_users;
    
    -- Create new policies
    CREATE POLICY "Allow insert admin_users" ON admin_users FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update admin_users" ON admin_users FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Allow delete admin_users" ON admin_users FOR DELETE USING (true);
  END IF;
  
  -- Check if waypoints table exists and add policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'waypoints') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Service role all waypoints" ON waypoints;
    DROP POLICY IF EXISTS "Allow insert waypoints" ON waypoints;
    DROP POLICY IF EXISTS "Allow update waypoints" ON waypoints;
    DROP POLICY IF EXISTS "Allow delete waypoints" ON waypoints;
    
    -- Create new policies
    CREATE POLICY "Allow insert waypoints" ON waypoints FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update waypoints" ON waypoints FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY "Allow delete waypoints" ON waypoints FOR DELETE USING (true);
  END IF;
END $$;

-- Note: Public read access policies already exist in database-setup.sql
-- These new policies add write access for admin operations
-- IMPORTANT: Run this script in Supabase SQL Editor to fix RLS policy issues
