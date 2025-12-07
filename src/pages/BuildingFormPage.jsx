import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { MapContainer, TileLayer, Rectangle, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBuilding, useCreateBuilding, useUpdateBuilding } from '../hooks/useBuildings';
import { EVSU_CENTER, CAMPUS_BOUNDARIES } from '../config/api';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const schema = yup.object({
  building_name: yup.string().required('Building name is required').max(100),
  building_code: yup
    .string()
    .required('Building code is required')
    .max(10)
    .matches(/^[A-Z0-9]+$/, 'Code must be uppercase letters and numbers only'),
  latitude: yup
    .number()
    .required('Latitude is required')
    .typeError('Latitude must be a valid number')
    .transform((value, originalValue) => {
      // Handle string to number conversion for high precision
      if (typeof originalValue === 'string') {
        const parsed = parseFloat(originalValue);
        return isNaN(parsed) ? originalValue : parsed;
      }
      return value;
    })
    .min(CAMPUS_BOUNDARIES.southWest.latitude, `Latitude must be at least ${CAMPUS_BOUNDARIES.southWest.latitude}`)
    .max(CAMPUS_BOUNDARIES.northEast.latitude, `Latitude must be at most ${CAMPUS_BOUNDARIES.northEast.latitude}`),
  longitude: yup
    .number()
    .required('Longitude is required')
    .typeError('Longitude must be a valid number')
    .transform((value, originalValue) => {
      // Handle string to number conversion for high precision
      if (typeof originalValue === 'string') {
        const parsed = parseFloat(originalValue);
        return isNaN(parsed) ? originalValue : parsed;
      }
      return value;
    })
    .min(CAMPUS_BOUNDARIES.southWest.longitude, `Longitude must be at least ${CAMPUS_BOUNDARIES.southWest.longitude}`)
    .max(CAMPUS_BOUNDARIES.northEast.longitude, `Longitude must be at most ${CAMPUS_BOUNDARIES.northEast.longitude}`),
  width_meters: yup
    .number()
    .required('Width is required')
    .typeError('Width must be a valid number')
    .min(1, 'Width must be at least 1 meter')
    .max(1000, 'Width must be at most 1000 meters'),
  height_meters: yup
    .number()
    .required('Height is required')
    .typeError('Height must be a valid number')
    .min(1, 'Height must be at least 1 meter')
    .max(1000, 'Height must be at most 1000 meters'),
  rotation_degrees: yup
    .number()
    .typeError('Rotation must be a valid number')
    .min(0, 'Rotation must be at least 0 degrees')
    .max(360, 'Rotation must be at most 360 degrees')
    .default(0),
  category: yup
    .string()
    .required('Category is required')
    .oneOf(['academic', 'administrative', 'facility', 'sports', 'residential', 'other'], 'Invalid category'),
  description: yup.string().max(500, 'Description must be less than 500 characters'),
});

// Helper function to convert meters to degrees (approximate)
// At the equator: 1 degree latitude ≈ 111,320 meters
// Longitude varies by latitude, but we'll use an approximation
function metersToDegrees(meters, latitude) {
  const latDegrees = meters / 111320;
  const lngDegrees = meters / (111320 * Math.cos(latitude * Math.PI / 180));
  return { lat: latDegrees, lng: lngDegrees };
}

// Helper function to calculate rectangle bounds from center, width, height, and rotation
function calculateRectangleBounds(centerLat, centerLng, widthMeters, heightMeters, rotationDeg = 0) {
  const latDeg = metersToDegrees(heightMeters, centerLat).lat / 2;
  const lngDeg = metersToDegrees(widthMeters, centerLat).lng / 2;
  
  // For simplicity, we'll create an axis-aligned bounding box
  // More complex rotation can be added later if needed
  const northEast = [centerLat + latDeg, centerLng + lngDeg];
  const southWest = [centerLat - latDeg, centerLng - lngDeg];
  
  return [southWest, northEast];
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}


export default function BuildingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [markerPosition, setMarkerPosition] = useState(null);

  const { data: building, isLoading } = useBuilding(id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      building_name: '',
      building_code: '',
      latitude: EVSU_CENTER.latitude,
      longitude: EVSU_CENTER.longitude,
      width_meters: 20,
      height_meters: 20,
      rotation_degrees: 0,
      category: 'academic',
      description: '',
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const widthMeters = watch('width_meters') || 20;
  const heightMeters = watch('height_meters') || 20;
  const rotationDegrees = watch('rotation_degrees') || 0;

  useEffect(() => {
    if (isEdit && building) {
      setValue('building_name', building.name);
      setValue('building_code', building.code);
      setValue('latitude', parseFloat(building.latitude));
      setValue('longitude', parseFloat(building.longitude));
      setValue('width_meters', parseFloat(building.width_meters) || 20);
      setValue('height_meters', parseFloat(building.height_meters) || 20);
      setValue('rotation_degrees', parseFloat(building.rotation_degrees) || 0);
      setValue('category', building.category || 'academic');
      setValue('description', building.description || '');
      setMarkerPosition([parseFloat(building.latitude), parseFloat(building.longitude)]);
    } else {
      setMarkerPosition([EVSU_CENTER.latitude, EVSU_CENTER.longitude]);
    }
  }, [building, isEdit, setValue]);

  useEffect(() => {
    if (markerPosition) {
      setValue('latitude', markerPosition[0]);
      setValue('longitude', markerPosition[1]);
    }
  }, [markerPosition, setValue]);

  const createMutation = useCreateBuilding();
  const updateMutation = useUpdateBuilding();

  const onSubmit = (formData) => {
    // Ensure all required fields are present and validated
    if (!formData.building_name || !formData.building_code || 
        formData.latitude === undefined || formData.longitude === undefined) {
      console.error('Missing required fields in form submission:', formData);
      return; // Form validation should prevent this, but fail safely
    }

    const payload = {
      building_name: formData.building_name.trim(), // Ensure non-empty after trim
      building_code: formData.building_code.trim(),
      latitude: formData.latitude.toString(),
      longitude: formData.longitude.toString(),
      width_meters: formData.width_meters?.toString() || '20',
      height_meters: formData.height_meters?.toString() || '20',
      rotation_degrees: formData.rotation_degrees?.toString() || '0',
      category: formData.category || 'academic', // Category is required, but fallback to academic
      description: formData.description || '',
      image_url: formData.image_url || null,
    };

    // Validate required fields are not empty after processing
    if (!payload.building_name || !payload.building_code) {
      console.error('Required fields are empty after processing:', payload);
      return;
    }

    if (isEdit) {
      updateMutation.mutate(
        { id, updates: payload },
        {
          onSuccess: () => {
            navigate('/buildings');
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          navigate('/buildings');
        },
      });
    }
  };

  const handleMapClick = (latlng) => {
    setMarkerPosition([latlng.lat, latlng.lng]);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const mutation = isEdit ? updateMutation : createMutation;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Building' : 'Create New Building'}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Building Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Building Name"
                    {...register('building_name')}
                    error={!!errors.building_name}
                    helperText={errors.building_name?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Building Code"
                    {...register('building_code')}
                    error={!!errors.building_code}
                    helperText={errors.building_code?.message}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="category"
                    control={control}
                    defaultValue="academic"
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.category}>
                        <InputLabel>Category *</InputLabel>
                        <Select
                          value={field.value ?? 'academic'}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          name={field.name}
                          label="Category *"
                        >
                          <MenuItem value="academic">Academic</MenuItem>
                          <MenuItem value="administrative">Administrative</MenuItem>
                          <MenuItem value="facility">Facility</MenuItem>
                          <MenuItem value="sports">Sports</MenuItem>
                          <MenuItem value="residential">Residential</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                        {errors.category && (
                          <FormHelperText>{errors.category.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Location Coordinates
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    step="0.0000000001"
                    inputProps={{ 
                      step: 'any',
                      min: CAMPUS_BOUNDARIES.southWest.latitude,
                      max: CAMPUS_BOUNDARIES.northEast.latitude
                    }}
                    {...register('latitude', {
                      valueAsNumber: true
                    })}
                    error={!!errors.latitude}
                    helperText={errors.latitude?.message || 'Supports high precision for indoor mapping'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    step="0.0000000001"
                    inputProps={{ 
                      step: 'any',
                      min: CAMPUS_BOUNDARIES.southWest.longitude,
                      max: CAMPUS_BOUNDARIES.northEast.longitude
                    }}
                    {...register('longitude', {
                      valueAsNumber: true
                    })}
                    error={!!errors.longitude}
                    helperText={errors.longitude?.message || 'Supports high precision for indoor mapping'}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Width (meters)"
                    type="number"
                    inputProps={{ min: 1, max: 1000, step: 0.1 }}
                    {...register('width_meters', { valueAsNumber: true })}
                    error={!!errors.width_meters}
                    helperText={errors.width_meters?.message || 'Building width'}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Height (meters)"
                    type="number"
                    inputProps={{ min: 1, max: 1000, step: 0.1 }}
                    {...register('height_meters', { valueAsNumber: true })}
                    error={!!errors.height_meters}
                    helperText={errors.height_meters?.message || 'Building height/length'}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Rotation (degrees)"
                    type="number"
                    inputProps={{ min: 0, max: 360, step: 1 }}
                    {...register('rotation_degrees', { valueAsNumber: true })}
                    error={!!errors.rotation_degrees}
                    helperText={errors.rotation_degrees?.message || '0-360 degrees'}
                  />
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mb: 2 }}>
                Drag the map to pan, click to set the building center location, or enter coordinates manually.
                <br />
                <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                  Buildings are displayed as rectangles. Set width and height to define the building footprint.
                </Typography>
              </Alert>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Map - Drag to Pan, Click to Set Building Center
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The rectangle represents the building footprint. Adjust width and height to change the rectangle size.
              </Typography>
              <Box sx={{ height: 400, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                <MapContainer
                  center={markerPosition || [EVSU_CENTER.latitude, EVSU_CENTER.longitude]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                  dragging={true}
                  scrollWheelZoom={true}
                  doubleClickZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {markerPosition && (
                    <>
                      <Rectangle
                        bounds={calculateRectangleBounds(markerPosition[0], markerPosition[1], widthMeters, heightMeters, rotationDegrees)}
                        pathOptions={{
                          color: '#800000',
                          fillColor: '#800000',
                          fillOpacity: 0.3,
                          weight: 2,
                        }}
                      />
                      <Marker 
                        position={markerPosition} 
                        draggable 
                        onDragEnd={(e) => handleMapClick(e.target.getLatLng())}
                        icon={L.divIcon({
                          className: 'building-center-marker',
                          html: '<div style="background-color: #800000; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #800000;"></div>',
                          iconSize: [12, 12],
                        })}
                      />
                    </>
                  )}
                  <MapClickHandler onMapClick={handleMapClick} />
                </MapContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/buildings')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : isEdit ? (
                  'Update Building'
                ) : (
                  'Create Building'
                )}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {(createMutation.isError || updateMutation.isError) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {(createMutation.error || updateMutation.error)?.message || 'An error occurred. Please try again.'}
        </Alert>
      )}
    </Box>
  );
}

