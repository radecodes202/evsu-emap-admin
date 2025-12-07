import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  MenuItem,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildingsAPI } from '../utils/api';
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
    .min(CAMPUS_BOUNDARIES.southWest.latitude, 'Latitude is outside campus boundaries')
    .max(CAMPUS_BOUNDARIES.northEast.latitude, 'Latitude is outside campus boundaries'),
  longitude: yup
    .number()
    .required('Longitude is required')
    .min(CAMPUS_BOUNDARIES.southWest.longitude, 'Longitude is outside campus boundaries')
    .max(CAMPUS_BOUNDARIES.northEast.longitude, 'Longitude is outside campus boundaries'),
  floors: yup
    .number()
    .required('Number of floors is required')
    .positive('Floors must be a positive number')
    .integer('Floors must be an integer'),
  description: yup.string().max(500, 'Description must be less than 500 characters'),
});

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
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const [markerPosition, setMarkerPosition] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['building', id],
    queryFn: () => buildingsAPI.getById(id),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
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
      floors: 1,
      description: '',
    },
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');

  useEffect(() => {
    if (isEdit && data?.data?.data) {
      const building = data.data.data;
      setValue('building_name', building.building_name);
      setValue('building_code', building.building_code);
      setValue('latitude', parseFloat(building.latitude));
      setValue('longitude', parseFloat(building.longitude));
      setValue('floors', building.floors);
      setValue('description', building.description || '');
      setMarkerPosition([parseFloat(building.latitude), parseFloat(building.longitude)]);
    } else {
      setMarkerPosition([EVSU_CENTER.latitude, EVSU_CENTER.longitude]);
    }
  }, [data, isEdit, setValue]);

  useEffect(() => {
    if (markerPosition) {
      setValue('latitude', markerPosition[0]);
      setValue('longitude', markerPosition[1]);
    }
  }, [markerPosition, setValue]);

  const createMutation = useMutation({
    mutationFn: (data) => buildingsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buildings']);
      navigate('/buildings');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => buildingsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buildings']);
      queryClient.invalidateQueries(['building', id]);
      navigate('/buildings');
    },
  });

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      latitude: formData.latitude.toString(),
      longitude: formData.longitude.toString(),
    };

    if (isEdit) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
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
                  <TextField
                    fullWidth
                    label="Number of Floors"
                    type="number"
                    {...register('floors')}
                    error={!!errors.floors}
                    helperText={errors.floors?.message}
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
                    step="any"
                    {...register('latitude')}
                    error={!!errors.latitude}
                    helperText={errors.latitude?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    step="any"
                    {...register('longitude')}
                    error={!!errors.longitude}
                    helperText={errors.longitude?.message}
                  />
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mb: 2 }}>
                Click on the map below to set the building location, or enter coordinates manually.
              </Alert>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Map - Click to Set Location
              </Typography>
              <Box sx={{ height: 400, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                <MapContainer
                  center={markerPosition || [EVSU_CENTER.latitude, EVSU_CENTER.longitude]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {markerPosition && (
                    <Marker position={markerPosition} draggable onDragEnd={(e) => handleMapClick(e.target.getLatLng())} />
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

      {mutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {mutation.error?.response?.data?.message || 'An error occurred. Please try again.'}
        </Alert>
      )}
    </Box>
  );
}

