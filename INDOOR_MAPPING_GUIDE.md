# Indoor Mapping Guide: Buildings and Pathways

This guide explains how to properly work with buildings and pathways for indoor mapping in the EVSUeMAP Admin Panel.

## Understanding Coordinates for Indoor Mapping

### Coordinate Precision

For indoor mapping, you need **high-precision coordinates** to accurately map:
- Building entrances
- Individual rooms
- Indoor pathways
- Floor-specific locations

**Example coordinates:**
- `11.238602547245419` (latitude) - ✅ **This level of precision is fully supported**
- `125.002345678901234` (longitude) - ✅ **Up to 15 decimal places supported**

### Database Precision

The database supports:
- **Latitude**: DECIMAL(10, 8) - 8 decimal places (~1.1mm precision)
- **Longitude**: DECIMAL(11, 8) - 8 decimal places (~1.1mm precision)

**Note**: While you can enter coordinates with more decimal places in the form, the database stores up to 8 decimal places, which is sufficient for indoor mapping (1.1mm accuracy).

### Why High Precision Matters

1. **Indoor Navigation**: Small differences in coordinates matter when navigating inside buildings
2. **Multi-Floor Mapping**: Different floors may have slightly different coordinates
3. **Room-Level Accuracy**: Precise coordinates help users find specific rooms

## Working with Buildings

### Step 1: Adding a Building

1. Navigate to **Buildings** page
2. Click **"Add Building"**
3. Fill in the form:
   - **Building Name**: e.g., "Main Building"
   - **Building Code**: e.g., "MB" (uppercase, alphanumeric)
   - **Category**: Select appropriate category
   - **Description**: Optional details

### Step 2: Setting Building Location

#### Method 1: Using the Map (Recommended)
1. **Drag the map** to pan around the campus
2. **Click on the map** to place the marker at the building's main entrance
3. The coordinates will automatically update

#### Method 2: Manual Entry
1. Enter coordinates manually in the Latitude/Longitude fields
2. Supports high precision (up to 15 decimal places)
3. Example: `11.238602547245419`

#### Method 3: Drag the Marker
1. Click and drag the red marker on the map
2. Coordinates update in real-time

### Step 3: Coordinate Best Practices

**For Building Entrances:**
- Use the main entrance coordinates
- Mark the center of the entrance door
- Example: `11.2443, 125.0023`

**For Indoor Locations:**
- Use precise coordinates from GPS or mapping tools
- Consider floor elevation (z-coordinate can be stored in description)
- Example: `11.238602547245419, 125.002345678901234`

### Step 4: Adding Rooms/Locations

After creating a building:
1. Go to the building details (future feature)
2. Add rooms/locations within the building
3. Each room can have:
   - Room number
   - Floor level
   - Precise coordinates
   - Description

## Working with Pathways

### Step 1: Understanding Pathways

Pathways connect buildings and define walkable routes:
- **Outdoor paths**: Between buildings
- **Indoor paths**: Within buildings
- **Waypoints**: Points along the path

### Step 2: Creating a Pathway

1. Navigate to **Paths & Walkways** page
2. Click **"Add Path"**
3. Fill in:
   - **Path Name**: e.g., "Main Walkway to Library"
   - **Path Type**: walkway, road, indoor, etc.
   - **From Building**: Starting building (optional)
   - **To Building**: Destination building (optional)
   - **Description**: Path details

### Step 3: Adding Waypoints

Waypoints define the exact route:

1. **Click on the map** to add waypoints in sequence
2. Each waypoint represents a point along the path
3. Waypoints are ordered automatically
4. You can add as many waypoints as needed

**For Indoor Pathways:**
- Add waypoints at:
  - Building entrances
  - Stairwells
  - Elevators
  - Corridor turns
  - Room entrances

**Example Waypoint Sequence:**
```
Waypoint 1: Building A Entrance (11.2443, 125.0023)
Waypoint 2: First Floor Corridor (11.2444, 125.0024)
Waypoint 3: Stairwell (11.2445, 125.0025)
Waypoint 4: Second Floor Landing (11.2446, 125.0026)
Waypoint 5: Building B Entrance (11.2447, 125.0027)
```

### Step 4: Editing Pathways

1. Click **Edit** on a pathway
2. Modify waypoints:
   - **Add**: Click on map to add new waypoint
   - **Remove**: Delete waypoint button
   - **Reorder**: Waypoints are automatically ordered by sequence

## Coordinate Validation

### Current Boundaries

The system validates coordinates to ensure they're within the campus area:

- **Latitude Range**: `11.2300` to `11.2600`
- **Longitude Range**: `124.9900` to `125.0200`

### If Your Coordinates Are Rejected

1. **Check the boundaries**: Go to **Campus Config** page
2. **Expand boundaries** if needed for your campus
3. **Verify coordinates**: Make sure they're valid decimal numbers

### Bypassing Validation (If Needed)

For indoor mapping, if you need coordinates outside the default boundaries:
1. Update boundaries in **Campus Config** page
2. Or modify `CAMPUS_BOUNDARIES` in `src/config/api.js`

## Best Practices

### For Buildings

1. **Start with Main Buildings**: Map major buildings first
2. **Use Consistent Naming**: Follow a naming convention (e.g., "Main Building", "Science Building")
3. **Unique Codes**: Each building code must be unique
4. **Accurate Coordinates**: Use GPS or mapping tools for precise locations
5. **Add Descriptions**: Include helpful information for users

### For Pathways

1. **Plan the Route**: Think about the actual walking path
2. **Add Enough Waypoints**: More waypoints = more accurate navigation
3. **Consider Obstacles**: Add waypoints around obstacles
4. **Test the Path**: Walk the path to verify waypoints
5. **Update Regularly**: Keep paths updated as campus changes

### For Indoor Mapping

1. **Floor-by-Floor**: Map each floor separately
2. **Use Precise Coordinates**: Indoor mapping requires high precision
3. **Mark Key Points**: Entrances, elevators, stairs, rooms
4. **Document Floor Numbers**: Use the description field for floor info
5. **Consider Elevation**: Note elevation differences in descriptions

## Troubleshooting

### Coordinates Not Saving

- **Check validation**: Ensure coordinates are within boundaries
- **Check format**: Must be valid decimal numbers
- **Check precision**: System supports up to 15 decimal places

### Map Not Dragging

- **Refresh the page**: Sometimes the map needs a refresh
- **Check browser console**: Look for JavaScript errors
- **Try clicking first**: Click on the map, then try dragging

### Waypoints Not Appearing

- **Check path creation**: Make sure the path was created successfully
- **Verify waypoint service**: Check browser console for errors
- **Refresh the page**: Waypoints should appear after refresh

### Validation Errors

- **"Latitude is outside campus boundaries"**: 
  - Update boundaries in Campus Config
  - Or verify your coordinates are correct
  
- **"Longitude is outside campus boundaries"**:
  - Same as above

## Advanced Tips

### Using GPS Coordinates

1. **Get coordinates from GPS device** or mapping app
2. **Copy exact coordinates** (with full precision)
3. **Paste into the form** - system will validate automatically

### Batch Import (Future Feature)

For importing multiple buildings/paths:
1. Prepare CSV file with coordinates
2. Use import feature (when available)
3. Verify all entries after import

### Coordinate Reference Systems

- **WGS84 (GPS)**: Standard coordinate system used
- **Decimal Degrees**: Format used in the system
- **Precision**: 1 meter ≈ 0.00001 degrees

## Example Workflow

### Creating a Complete Building Entry

1. **Add Building**:
   - Name: "Main Building"
   - Code: "MB"
   - Category: "Administrative"
   - Coordinates: `11.2443, 125.0023` (main entrance)

2. **Add Rooms** (using Locations table):
   - Room 101: `11.24431, 125.00231` (first floor)
   - Room 201: `11.24432, 125.00232` (second floor)
   - Office: `11.24433, 125.00233` (second floor)

3. **Create Indoor Path**:
   - From: Main Entrance
   - To: Room 201
   - Waypoints: Entrance → Stairs → Second Floor → Room 201

## Database Schema Reference

### Buildings Table
- `latitude`: DECIMAL(10, 8) - Supports 8 decimal places
- `longitude`: DECIMAL(11, 8) - Supports 8 decimal places
- For higher precision, coordinates are stored as full decimals

### Waypoints Table
- `latitude`: DECIMAL(10, 8)
- `longitude`: DECIMAL(11, 8)
- `sequence_order`: Order in the path

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Check database tables exist
4. Review this guide for best practices
