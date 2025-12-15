# User-Side Navigation Guide (Using Admin Data)

This guide helps the user/mobile/web client build navigation on top of data created in the admin panel (buildings, rooms/locations, routes/paths, waypoints).

## Data to consume (Supabase)
- `buildings`: `id`, `name`, `code`, `latitude`, `longitude`, `width_meters`, `height_meters`, `rotation_degrees`, `category`, `is_active`
- `locations` (rooms): `id`, `building_id`, `name`, `room_number`, `floor`, `latitude` (if any), `longitude` (if any), `type`
- `routes`: `id`, `path_name`, `path_type`, `is_active`
- `waypoints`: `id`, `route_id`, `sequence_order`, `latitude`, `longitude`, `name`, `description`
- Optional config: campus center/bounds stored in localStorage as `campusConfig` (see `src/utils/campusConfig.js` for shape)

## Pathfinding approach (suggested)
1) **Fetch routes + waypoints**
   - Query `routes` where `is_active = true`
   - For each route, fetch its `waypoints` ordered by `sequence_order`

2) **Build a graph**
   - Each waypoint = node
   - Connect consecutive waypoints in a route with edges
   - Edge weight = geodesic distance (haversine) between waypoints
   - Optionally increase cost based on `path_type` (e.g., indoor/corridor/stairs vs road)

3) **Include POIs (buildings/rooms)**
   - For navigation to a building: snap to nearest waypoint (within a tolerance, e.g., 50–100m)
   - For rooms without coordinates: use building coords as fallback, optionally adjust by floor in UI, not in routing

4) **Run shortest-path**
   - Use Dijkstra/A* over the waypoint graph
   - Start: nearest waypoint to origin (user location or selected building/room)
   - Goal: nearest waypoint to destination building/room
   - If no waypoint is within tolerance, fall back to direct straight-line path (optional)

5) **Return a route polyline**
   - The sequence of waypoint coords from the pathfinding result
   - Include summary: total distance (sum of edge weights), estimated time (distance / assumed speed)

## Query snippets (Supabase client)
```javascript
// Routes + waypoints (two queries)
const { data: routes } = await supabase.from('routes').select('*').eq('is_active', true);

const { data: waypoints } = await supabase
  .from('waypoints')
  .select('*')
  .order('route_id', { ascending: true })
  .order('sequence_order', { ascending: true });
```

```javascript
// Buildings
const { data: buildings } = await supabase.from('buildings').select('*');
```

## Haversine helper (edge weight)
```javascript
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

## Edge costs (optional)
- Base cost = distance meters
- Adjust multiplier by `path_type`:
  - indoor/corridor/stairs: 1.1–1.3
  - ramp: 1.05
  - road: 1.0
  - other: 1.0

## Snapping POIs to graph
```javascript
function nearestWaypoint(waypoints, lat, lng, maxMeters = 100) {
  let best = null;
  for (const wp of waypoints) {
    const d = haversine(lat, lng, wp.latitude, wp.longitude);
    if (d <= maxMeters && (!best || d < best.d)) best = { wp, d };
  }
  return best?.wp || null;
}
```

## Campus center
- Use `loadCampusConfig()` shape:
  - `center.latitude`, `center.longitude`
  - Fallback to `EVSU_CENTER` if none saved

## Delivery format to UI
- Polyline: array of `[lat, lng]`
- Summary: `{ distance_m, eta_min }`
- Steps (optional): waypoint labels/names if provided

## Limits / assumptions
- No turn restrictions or vertical (floor) routing; floor info is for display.
- If no nearby waypoint, routing may fail; handle gracefully with a fallback.
- Data quality matters: ensure routes have ordered waypoints and are marked active.

## Minimal checklist for the user-side agent
- Fetch active routes and ordered waypoints.
- Build graph (nodes = waypoints, edges = consecutive segments).
- Snap origin/destination to nearest waypoint (within tolerance).
- Run Dijkstra/A* (distance-weighted).
- Return polyline + distance/ETA.
- Use campus center for initial map view; fallback to defaults.

