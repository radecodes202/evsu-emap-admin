import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Square as SquareIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { EVSU_CENTER } from '../config/api';
import { loadCampusConfig } from '../utils/campusConfig';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function metersToDegrees(meters, latitude) {
  const latDegrees = meters / 111320;
  const lngDegrees = meters / (111320 * Math.cos(latitude * Math.PI / 180));
  return { lat: latDegrees, lng: lngDegrees };
}

function calculateRotatedRectangle(centerLat, centerLng, widthMeters, heightMeters, rotationDeg = 0) {
  const halfLat = metersToDegrees(heightMeters, centerLat).lat / 2;
  const halfLng = metersToDegrees(widthMeters, centerLat).lng / 2;

  const corners = [
    [halfLng, halfLat],
    [-halfLng, halfLat],
    [-halfLng, -halfLat],
    [halfLng, -halfLat],
  ];

  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  return corners.map(([dx, dy]) => {
    const x = dx * cos - dy * sin;
    const y = dx * sin + dy * cos;
    return [centerLat + y, centerLng + x];
  });
}

export default function MapPreview({ buildings = [], paths = [], height = 500 }) {
  const campus = loadCampusConfig();
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);

  // Calculate map center and bounds
  const mapCenter = useMemo(() => {
    if (buildings.length === 0) {
      return [campus.center.latitude || EVSU_CENTER.latitude, campus.center.longitude || EVSU_CENTER.longitude];
    }
    
    // Calculate center from all buildings
    const avgLat = buildings.reduce((sum, b) => sum + parseFloat(b.latitude || 0), 0) / buildings.length;
    const avgLng = buildings.reduce((sum, b) => sum + parseFloat(b.longitude || 0), 0) / buildings.length;
    return [avgLat, avgLng];
  }, [buildings, campus]);

  // Prepare building footprints
  const buildingFootprints = useMemo(() => {
    return buildings
      .filter(b => b.latitude && b.longitude)
      .map(building => {
        const lat = parseFloat(building.latitude);
        const lng = parseFloat(building.longitude);
        const width = parseFloat(building.width_meters) || 20;
        const height = parseFloat(building.height_meters) || 20;
        const rotation = parseFloat(building.rotation_degrees) || 0;
        
        return {
          id: building.id,
          name: building.name,
          code: building.code,
          category: building.category,
          center: [lat, lng],
          polygon: calculateRotatedRectangle(lat, lng, width, height, rotation),
        };
      });
  }, [buildings]);

  // Prepare path polylines
  const pathPolylines = useMemo(() => {
    return paths
      .filter(path => path.waypoints && Array.isArray(path.waypoints) && path.waypoints.length > 0)
      .map(path => ({
        id: path.path_id,
        name: path.path_name,
        type: path.path_type,
        positions: path.waypoints
          .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
          .map(wp => [parseFloat(wp.latitude), parseFloat(wp.longitude)])
          .filter(pos => !isNaN(pos[0]) && !isNaN(pos[1])),
      }))
      .filter(path => path.positions.length > 0);
  }, [paths]);

  const handleShowBoxesOnly = () => {
    setShowPolygons(true);
    setShowMarkers(false);
  };

  const handleShowMarkersOnly = () => {
    setShowMarkers(true);
    setShowPolygons(false);
  };

  const handleShowBoth = () => {
    setShowMarkers(true);
    setShowPolygons(true);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Filter Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 2,
          p: 1,
        }}
      >
        <ButtonGroup size="small" orientation="vertical" variant="outlined">
          <Button
            startIcon={<VisibilityIcon />}
            onClick={handleShowBoth}
            variant={showMarkers && showPolygons ? 'contained' : 'outlined'}
            size="small"
          >
            Show Both
          </Button>
          <Button
            startIcon={<SquareIcon />}
            onClick={handleShowBoxesOnly}
            variant={showPolygons && !showMarkers ? 'contained' : 'outlined'}
            size="small"
          >
            Boxes Only
          </Button>
          <Button
            startIcon={<LocationOnIcon />}
            onClick={handleShowMarkersOnly}
            variant={showMarkers && !showPolygons ? 'contained' : 'outlined'}
            size="small"
          >
            Markers Only
          </Button>
        </ButtonGroup>
      </Box>

      <MapContainer
        center={mapCenter}
        zoom={buildings.length > 0 ? 16 : 15}
        style={{ height: height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render building footprints (boxes) */}
        {showPolygons && buildingFootprints.map((footprint) => (
          <Polygon
            key={footprint.id}
            positions={footprint.polygon}
            pathOptions={{
              color: '#1976d2',
              fillColor: '#1976d2',
              fillOpacity: 0.4,
              weight: 2,
            }}
          >
            <Popup>
              <div>
                <strong>{footprint.name}</strong>
                <br />
                {footprint.code}
                {footprint.category && (
                  <>
                    <br />
                    <small>{footprint.category}</small>
                  </>
                )}
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* Render building center markers */}
        {showMarkers && buildingFootprints.map((footprint) => (
          <Marker
            key={`marker-${footprint.id}`}
            position={footprint.center}
          >
            <Popup>
              <div>
                <strong>{footprint.name}</strong>
                <br />
                {footprint.code}
              </div>
            </Popup>
          </Marker>
        ))}

      {/* Render path polylines */}
      {pathPolylines.map((path) => (
        <Polyline
          key={path.id}
          positions={path.positions}
          pathOptions={{
            color: '#9c27b0',
            weight: 3,
            opacity: 0.7,
          }}
        >
          <Popup>
            <div>
              <strong>{path.name}</strong>
              <br />
              <small>Type: {path.type}</small>
            </div>
          </Popup>
        </Polyline>
      ))}
      </MapContainer>
    </Box>
  );
}

