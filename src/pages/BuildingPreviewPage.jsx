import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import { MapContainer, TileLayer, Polygon, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBuilding } from '../hooks/useBuildings';
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

export default function BuildingPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: building, isLoading, error } = useBuilding(id);
  const campus = loadCampusConfig();

  const footprint = useMemo(() => {
    if (!building) return null;
    const lat = parseFloat(building.latitude) || campus.center.latitude || EVSU_CENTER.latitude;
    const lng = parseFloat(building.longitude) || campus.center.longitude || EVSU_CENTER.longitude;
    const width = parseFloat(building.width_meters) || 20;
    const height = parseFloat(building.height_meters) || 20;
    const rotation = parseFloat(building.rotation_degrees) || 0;
    return {
      center: [lat, lng],
      polygon: calculateRotatedRectangle(lat, lng, width, height, rotation),
    };
  }, [building]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !building) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error?.message || 'Building not found.'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h4" gutterBottom>
          {building.name} ({building.code})
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/buildings')}>
          Back to Buildings
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Category: <Chip label={building.category || 'N/A'} size="small" sx={{ ml: 1 }} />
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Width x Height: {(building.width_meters || 20)}m x {(building.height_meters || 20)}m
            </Typography>
            <Typography variant="body2">
              Rotation: {building.rotation_degrees || 0}°
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Lat/Lng: {building.latitude}, {building.longitude}
            </Typography>
            {building.description && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {building.description}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Map Preview
            </Typography>
            <Box sx={{ height: 400, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
              <MapContainer
                center={footprint?.center || [campus.center.latitude, campus.center.longitude]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {footprint && (
                  <>
                    <Polygon
                      positions={footprint.polygon}
                      pathOptions={{
                        color: '#800000',
                        fillColor: '#800000',
                        fillOpacity: 0.3,
                        weight: 2,
                      }}
                    />
                    <Marker position={footprint.center} />
                  </>
                )}
              </MapContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

