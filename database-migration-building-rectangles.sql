-- Migration script to add rectangle dimensions to buildings table
-- Run this in Supabase SQL Editor

-- Add width and height columns to buildings table (in meters)
-- These define the rectangular footprint of the building
DO $$ 
BEGIN
  -- Add width_meters if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='buildings' AND column_name='width_meters') THEN
    ALTER TABLE buildings ADD COLUMN width_meters DECIMAL(10, 2) DEFAULT 20.0;
  END IF;
  
  -- Add height_meters if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='buildings' AND column_name='height_meters') THEN
    ALTER TABLE buildings ADD COLUMN height_meters DECIMAL(10, 2) DEFAULT 20.0;
  END IF;
  
  -- Add rotation_degrees if it doesn't exist (for rotated rectangles)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='buildings' AND column_name='rotation_degrees') THEN
    ALTER TABLE buildings ADD COLUMN rotation_degrees DECIMAL(5, 2) DEFAULT 0.0;
  END IF;
END $$;

-- Update existing buildings to have default dimensions if they are null
UPDATE buildings 
SET 
  width_meters = COALESCE(width_meters, 20.0),
  height_meters = COALESCE(height_meters, 20.0),
  rotation_degrees = COALESCE(rotation_degrees, 0.0)
WHERE width_meters IS NULL OR height_meters IS NULL OR rotation_degrees IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN buildings.width_meters IS 'Width of building footprint in meters';
COMMENT ON COLUMN buildings.height_meters IS 'Height/length of building footprint in meters';
COMMENT ON COLUMN buildings.rotation_degrees IS 'Rotation angle in degrees (0-360)';
