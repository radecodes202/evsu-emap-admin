import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EVSU_CENTER, CAMPUS_BOUNDARIES } from '../config/api';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const schema = yup.object({
  centerLatitude: yup.number().required('Latitude is required'),
  centerLongitude: yup.number().required('Longitude is required'),
  latitudeDelta: yup.number().positive().required('Latitude delta is required'),
  longitudeDelta: yup.number().positive().required('Longitude delta is required'),
  northEastLat: yup.number().required('North-east latitude is required'),
  northEastLng: yup.number().required('North-east longitude is required'),
  southWestLat: yup.number().required('South-west latitude is required'),
  southWestLng: yup.number().required('South-west longitude is required'),
});

export default function CampusConfigPage() {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      centerLatitude: EVSU_CENTER.latitude,
      centerLongitude: EVSU_CENTER.longitude,
      latitudeDelta: EVSU_CENTER.latitudeDelta,
      longitudeDelta: EVSU_CENTER.longitudeDelta,
      northEastLat: CAMPUS_BOUNDARIES.northEast.latitude,
      northEastLng: CAMPUS_BOUNDARIES.northEast.longitude,
      southWestLat: CAMPUS_BOUNDARIES.southWest.latitude,
      southWestLng: CAMPUS_BOUNDARIES.southWest.longitude,
    },
  });

  // Load saved configuration from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('campusConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setValue('centerLatitude', parsed.centerLatitude ?? EVSU_CENTER.latitude);
        setValue('centerLongitude', parsed.centerLongitude ?? EVSU_CENTER.longitude);
        setValue('latitudeDelta', parsed.latitudeDelta ?? EVSU_CENTER.latitudeDelta);
        setValue('longitudeDelta', parsed.longitudeDelta ?? EVSU_CENTER.longitudeDelta);
        setValue('northEastLat', parsed.northEastLat ?? CAMPUS_BOUNDARIES.northEast.latitude);
        setValue('northEastLng', parsed.northEastLng ?? CAMPUS_BOUNDARIES.northEast.longitude);
        setValue('southWestLat', parsed.southWestLat ?? CAMPUS_BOUNDARIES.southWest.latitude);
        setValue('southWestLng', parsed.southWestLng ?? CAMPUS_BOUNDARIES.southWest.longitude);
      } catch (e) {
        console.warn('Failed to parse saved campus config', e);
      }
    }
  }, [setValue]);

  const centerLat = watch('centerLatitude');
  const centerLng = watch('centerLongitude');
  const neLat = watch('northEastLat');
  const neLng = watch('northEastLng');
  const swLat = watch('southWestLat');
  const swLng = watch('southWestLng');

  const onSubmit = async (data) => {
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      // Persist locally so the configuration sticks between sessions
      localStorage.setItem('campusConfig', JSON.stringify(data));
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to save campus configuration', e);
      setSaving(false);
    }
  };

  // Calculate center for map display
  const mapCenter = [centerLat || EVSU_CENTER.latitude, centerLng || EVSU_CENTER.longitude];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Campus Configuration
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure campus center coordinates, boundaries, and map settings
      </Typography>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Campus configuration saved successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Campus Center
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The default center point of the campus map
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="text"
                    inputMode="decimal"
                    {...register('centerLatitude')}
                    error={!!errors.centerLatitude}
                    helperText={errors.centerLatitude?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="text"
                    inputMode="decimal"
                    {...register('centerLongitude')}
                    error={!!errors.centerLongitude}
                    helperText={errors.centerLongitude?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitude Delta"
                    type="text"
                    inputMode="decimal"
                    {...register('latitudeDelta')}
                    error={!!errors.latitudeDelta}
                    helperText={errors.latitudeDelta?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude Delta"
                    type="text"
                    inputMode="decimal"
                    {...register('longitudeDelta')}
                    error={!!errors.longitudeDelta}
                    helperText={errors.longitudeDelta?.message}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Campus Boundaries
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Define the geographic boundaries of the campus
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    North-East Corner
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="text"
                    inputMode="decimal"
                    {...register('northEastLat')}
                    error={!!errors.northEastLat}
                    helperText={errors.northEastLat?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="text"
                    inputMode="decimal"
                    {...register('northEastLng')}
                    error={!!errors.northEastLng}
                    helperText={errors.northEastLng?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                    South-West Corner
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="text"
                    inputMode="decimal"
                    {...register('southWestLat')}
                    error={!!errors.southWestLat}
                    helperText={errors.southWestLat?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="text"
                    inputMode="decimal"
                    {...register('southWestLng')}
                    error={!!errors.southWestLng}
                    helperText={errors.southWestLng?.message}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Campus Map Preview
              </Typography>
              <Box sx={{ height: 400, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {centerLat && centerLng && (
                    <Circle
                      center={[centerLat, centerLng]}
                      radius={100}
                      pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                    />
                  )}
                </MapContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Configuration'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

