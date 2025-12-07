-- Enable PostGIS for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Buildings table
CREATE TABLE buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  geom GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-calculate geography point from lat/lng
CREATE OR REPLACE FUNCTION update_building_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER building_geom_trigger
BEFORE INSERT OR UPDATE ON buildings
FOR EACH ROW
EXECUTE FUNCTION update_building_geom();

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

-- Points of Interest
CREATE TABLE points_of_interest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  geom GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes between buildings
CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_building_id UUID REFERENCES buildings(id),
  to_building_id UUID REFERENCES buildings(id),
  path_coordinates JSONB,
  distance_meters DECIMAL(10, 2),
  estimated_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_of_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read buildings" ON buildings FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read POI" ON points_of_interest FOR SELECT USING (true);
CREATE POLICY "Public read routes" ON routes FOR SELECT USING (true);

-- Admin write access (using service_role key)
-- Note: These policies check for service_role in JWT
-- When using service_role key, it bypasses RLS, so these are for additional security
CREATE POLICY "Service role all buildings" ON buildings FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all locations" ON locations FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service role all POI" ON points_of_interest FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes
CREATE INDEX buildings_geom_idx ON buildings USING GIST(geom);
CREATE INDEX buildings_category_idx ON buildings(category);
CREATE INDEX locations_building_id_idx ON locations(building_id);
CREATE INDEX poi_geom_idx ON points_of_interest USING GIST(geom);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER buildings_updated_at
BEFORE UPDATE ON buildings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Find nearby buildings function
CREATE OR REPLACE FUNCTION nearby_buildings(
  lat DECIMAL,
  lng DECIMAL,
  radius_meters DECIMAL DEFAULT 1000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  code TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  category TEXT,
  distance_meters DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.code,
    b.latitude,
    b.longitude,
    b.category,
    ST_Distance(
      b.geom,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) AS distance_meters
  FROM buildings b
  WHERE ST_DWithin(
    b.geom,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Sample EVSU data
INSERT INTO buildings (name, code, latitude, longitude, category, description) VALUES
  ('Main Building', 'MB', 11.2588, 125.0070, 'administrative', 'Main administrative building'),
  ('College of Engineering', 'COE', 11.2590, 125.0075, 'academic', 'Engineering college'),
  ('University Library', 'LIB', 11.2585, 125.0068, 'facility', 'Main library'),
  ('Gymnasium', 'GYM', 11.2592, 125.0072, 'sports', 'Sports facility'),
  ('Science Building', 'SCI', 11.2586, 125.0073, 'academic', 'Science labs');

INSERT INTO points_of_interest (name, latitude, longitude, category, description) VALUES
  ('Main Parking', 11.2587, 125.0069, 'parking', 'Main parking area'),
  ('Cafeteria', 11.2589, 125.0071, 'food', 'Student cafeteria'),
  ('ATM Machine', 11.2588, 125.0070, 'service', 'ATM services');
