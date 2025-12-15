-- ============================================================================
-- EVSU eMAP - FRESH DATABASE SETUP
-- ============================================================================
-- Run this on a NEW Supabase project (no drops needed)
-- Works for BOTH admin panel and mobile app
-- 
-- Features:
-- - Signup: email + password only (no username)
-- - Includes admin_users and audit_logs for admin panel
-- - Includes building dimensions for map visualization
-- ============================================================================

-- ============================================================================
-- STEP 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- STEP 2: HELPER FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create user profile when auth user signs up
-- Only requires email - no username needed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-calculate geography point from lat/lng
CREATE OR REPLACE FUNCTION update_building_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: CORE TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
-- Email + password only - NO username required for signup
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'guest')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Buildings table (with dimensions for map visualization)
CREATE TABLE buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  latitude DECIMAL(15, 12) NOT NULL,
  longitude DECIMAL(15, 12) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  width_meters DECIMAL(10, 2) DEFAULT 20.0,
  height_meters DECIMAL(10, 2) DEFAULT 20.0,
  rotation_degrees DECIMAL(5, 2) DEFAULT 0.0,
  geom GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER building_geom_trigger
  BEFORE INSERT OR UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_building_geom();

CREATE TRIGGER buildings_updated_at
  BEFORE UPDATE ON buildings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Locations/Rooms within buildings
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  room_number TEXT,
  name TEXT NOT NULL,
  floor INTEGER,
  description TEXT,
  type TEXT,
  capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes between buildings
CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  to_building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  path_name TEXT,
  path_type TEXT DEFAULT 'walkway',
  path_coordinates JSONB,
  distance_meters DECIMAL(10, 2),
  estimated_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paths (admin-defined walkways for navigation)
CREATE TABLE paths (
  path_id SERIAL PRIMARY KEY,
  path_name VARCHAR(255) NOT NULL,
  path_type VARCHAR(50) DEFAULT 'walkway' CHECK (path_type IN ('walkway', 'road', 'stairs', 'covered', 'outdoor', 'indoor', 'corridor', 'sidewalk', 'elevator', 'ramp', 'bridge', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER paths_updated_at
  BEFORE UPDATE ON paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Waypoints (points along a path)
CREATE TABLE waypoints (
  waypoint_id SERIAL PRIMARY KEY,
  path_id INTEGER REFERENCES paths(path_id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  latitude DECIMAL(15, 12) NOT NULL,
  longitude DECIMAL(15, 12) NOT NULL,
  is_accessible BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Path Connections (connections between different paths)
CREATE TABLE path_connections (
  connection_id SERIAL PRIMARY KEY,
  from_path_id INTEGER NOT NULL REFERENCES paths(path_id) ON DELETE CASCADE,
  from_waypoint_id INTEGER NOT NULL REFERENCES waypoints(waypoint_id) ON DELETE CASCADE,
  to_path_id INTEGER NOT NULL REFERENCES paths(path_id) ON DELETE CASCADE,
  to_waypoint_id INTEGER NOT NULL REFERENCES waypoints(waypoint_id) ON DELETE CASCADE,
  connection_type VARCHAR(50) DEFAULT 'walkway' CHECK (connection_type IN ('walkway', 'stairs', 'elevator', 'bridge', 'tunnel')),
  is_bidirectional BOOLEAN DEFAULT true,
  distance_meters DECIMAL(10, 2),
  is_accessible BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_paths CHECK (from_path_id != to_path_id),
  CONSTRAINT unique_connection UNIQUE (from_waypoint_id, to_waypoint_id)
);

CREATE TRIGGER path_connections_updated_at
  BEFORE UPDATE ON path_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Favorites (user saved buildings)
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, building_id)
);

-- ============================================================================
-- STEP 4: ADMIN PANEL TABLES
-- ============================================================================

-- Admin users (for admin web panel only)
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit logs (tracks all admin actions)
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback (from mobile app users)
CREATE TABLE user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_email TEXT,
  name TEXT,
  category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'suggestion', 'complaint', 'compliment')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed', 'pending', 'reviewed', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  admin_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER user_feedback_updated_at
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- STEP 5: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role all users" ON public.users FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Public read policies (for mobile app)
CREATE POLICY "Public read buildings" ON buildings FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read routes" ON routes FOR SELECT USING (true);
CREATE POLICY "Public read paths" ON paths FOR SELECT USING (is_active = true);
CREATE POLICY "Public read waypoints" ON waypoints FOR SELECT USING (true);
CREATE POLICY "Public read path_connections" ON path_connections FOR SELECT USING (is_accessible = true);
CREATE POLICY "Public read favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Public read admin_users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Public read audit_logs" ON audit_logs FOR SELECT USING (true);

-- Service role policies
CREATE POLICY "Service role all buildings" ON buildings FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all locations" ON locations FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all routes" ON routes FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all paths" ON paths FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all waypoints" ON waypoints FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all path_connections" ON path_connections FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all favorites" ON favorites FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all admin_users" ON admin_users FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all audit_logs" ON audit_logs FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all user_feedback" ON user_feedback FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated user policies (admin panel)
CREATE POLICY "Auth insert buildings" ON buildings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update buildings" ON buildings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete buildings" ON buildings FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert locations" ON locations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update locations" ON locations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete locations" ON locations FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert routes" ON routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update routes" ON routes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete routes" ON routes FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert paths" ON paths FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update paths" ON paths FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete paths" ON paths FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert waypoints" ON waypoints FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update waypoints" ON waypoints FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete waypoints" ON waypoints FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert path_connections" ON path_connections FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update path_connections" ON path_connections FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete path_connections" ON path_connections FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert admin_users" ON admin_users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update admin_users" ON admin_users FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete admin_users" ON admin_users FOR DELETE USING (auth.role() = 'authenticated');

-- Audit logs (public insert for logging)
CREATE POLICY "Public insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- User feedback policies
CREATE POLICY "Public insert user_feedback" ON user_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own feedback" ON user_feedback FOR SELECT USING (user_id = auth.uid() OR user_email = auth.email());
CREATE POLICY "Auth read all feedback" ON user_feedback FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth update feedback" ON user_feedback FOR UPDATE USING (auth.role() = 'authenticated');

-- Favorites policies
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: INDEXES
-- ============================================================================

CREATE INDEX users_email_idx ON public.users(email);
CREATE INDEX users_role_idx ON public.users(role);

CREATE INDEX buildings_geom_idx ON buildings USING GIST(geom);
CREATE INDEX buildings_category_idx ON buildings(category);
CREATE INDEX buildings_code_idx ON buildings(code);

CREATE INDEX locations_building_id_idx ON locations(building_id);
CREATE INDEX locations_type_idx ON locations(type);

CREATE INDEX routes_path_type_idx ON routes(path_type);
CREATE INDEX routes_is_active_idx ON routes(is_active);

CREATE INDEX paths_active_idx ON paths(is_active);
CREATE INDEX paths_type_idx ON paths(path_type);

CREATE INDEX waypoints_path_idx ON waypoints(path_id);
CREATE INDEX waypoints_path_seq_idx ON waypoints(path_id, sequence);

CREATE INDEX path_connections_from_path_idx ON path_connections(from_path_id);
CREATE INDEX path_connections_to_path_idx ON path_connections(to_path_id);

CREATE INDEX favorites_user_idx ON favorites(user_id);
CREATE INDEX favorites_building_idx ON favorites(building_id);

CREATE INDEX admin_users_email_idx ON admin_users(email);
CREATE INDEX admin_users_role_idx ON admin_users(role);

CREATE INDEX audit_logs_user_email_idx ON audit_logs(user_email);
CREATE INDEX audit_logs_action_type_idx ON audit_logs(action_type);
CREATE INDEX audit_logs_entity_type_idx ON audit_logs(entity_type);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at DESC);

CREATE INDEX user_feedback_category_idx ON user_feedback(category);
CREATE INDEX user_feedback_status_idx ON user_feedback(status);
CREATE INDEX user_feedback_created_at_idx ON user_feedback(created_at DESC);

-- ============================================================================
-- STEP 7: VIEWS
-- ============================================================================

CREATE VIEW building_statistics AS
SELECT category, COUNT(*) AS building_count
FROM buildings GROUP BY category;

CREATE VIEW user_activity_summary AS
SELECT u.id, u.email, u.role, u.is_active, u.created_at,
  COALESCE(f.favorite_count, 0) AS favorite_count
FROM public.users u
LEFT JOIN (SELECT user_id, COUNT(*) AS favorite_count FROM favorites GROUP BY user_id) f 
ON f.user_id = u.id;

-- ============================================================================
-- STEP 8: HELPER FUNCTIONS
-- ============================================================================

-- Find nearby buildings
CREATE OR REPLACE FUNCTION nearby_buildings(lat DECIMAL, lng DECIMAL, radius_meters DECIMAL DEFAULT 1000)
RETURNS TABLE (id UUID, name TEXT, code TEXT, latitude DECIMAL, longitude DECIMAL, category TEXT, distance_meters DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.name, b.code, b.latitude, b.longitude, b.category,
    ST_Distance(b.geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) AS distance_meters
  FROM buildings b
  WHERE ST_DWithin(b.geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID, p_user_email TEXT, p_action_type TEXT, p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL, p_old_values JSONB DEFAULT NULL, p_new_values JSONB DEFAULT NULL,
  p_description TEXT DEFAULT NULL, p_ip_address TEXT DEFAULT NULL, p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE v_audit_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, user_email, action_type, entity_type, entity_id, old_values, new_values, description, ip_address, user_agent)
  VALUES (p_user_id, p_user_email, UPPER(p_action_type), LOWER(p_entity_type), p_entity_id, p_old_values, p_new_values, p_description, p_ip_address, p_user_agent)
  RETURNING id INTO v_audit_id;
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 9: DEFAULT DATA
-- ============================================================================

INSERT INTO admin_users (email, name, role) VALUES ('admin@evsu.edu.ph', 'Administrator', 'admin');

-- ============================================================================
-- DONE!
-- ============================================================================

SELECT '✅ Database setup complete!' AS status;

