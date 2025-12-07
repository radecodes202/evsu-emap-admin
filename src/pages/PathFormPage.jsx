import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { pathsAPI } from '../utils/api';
import { EVSU_CENTER, CAMPUS_BOUNDARIES } from '../config/api';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const schema = yup.object({
  path_name: yup.string().required('Path name is required').max(100),
  path_type: yup.string().required('Path type is required'),
  is_active: yup.boolean(),
});

function MapClickHandler({ onMapClick, disabled }) {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

export default function PathFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const [waypoints, setWaypoints] = useState([]);
  const [mapClickEnabled, setMapClickEnabled] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['path', id],
    queryFn: () => pathsAPI.getById(id),
    enabled: isEdit,
  });

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
      path_name: '',
      path_type: 'walkway',
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEdit && data?.data?.data) {
      const path = data.data.data;
      setValue('path_name', path.path_name);
      setValue('path_type', path.path_type || 'walkway');
      setValue('is_active', path.is_active !== false);
      if (path.waypoints && path.waypoints.length > 0) {
        const sortedWaypoints = [...path.waypoints].sort((a, b) => a.sequence - b.sequence);
        setWaypoints(
          sortedWaypoints.map((wp) => ({
            latitude: parseFloat(wp.latitude),
            longitude: parseFloat(wp.longitude),
            sequence: wp.sequence,
            is_accessible: wp.is_accessible !== false,
            notes: wp.notes || '',
            waypoint_id: wp.waypoint_id,
          }))
        );
      }
    }
  }, [data, isEdit, setValue]);

  const createMutation = useMutation({
    mutationFn: (data) => pathsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['paths']);
      navigate('/paths');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => pathsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['paths']);
      queryClient.invalidateQueries(['path', id]);
      navigate('/paths');
    },
  });

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      waypoints: waypoints.map((wp, index) => ({
        sequence: index,
        latitude: wp.latitude.toString(),
        longitude: wp.longitude.toString(),
        is_accessible: wp.is_accessible,
        notes: wp.notes || null,
      })),
    };

    if (isEdit) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleMapClick = (latlng) => {
    if (mapClickEnabled) {
      const newWaypoint = {
        latitude: latlng.lat,
        longitude: latlng.lng,
        sequence: waypoints.length,
        is_accessible: true,
        notes: '',
      };
      setWaypoints([...waypoints, newWaypoint]);
    }
  };

  const handleDeleteWaypoint = (index) => {
    const updated = waypoints.filter((_, i) => i !== index).map((wp, i) => ({
      ...wp,
      sequence: i,
    }));
    setWaypoints(updated);
  };

  const handleWaypointDrag = (index, latlng) => {
    const updated = [...waypoints];
    updated[index] = {
      ...updated[index],
      latitude: latlng.lat,
      longitude: latlng.lng,
    };
    setWaypoints(updated);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const mutation = isEdit ? updateMutation : createMutation;
  const mapCenter = waypoints.length > 0 
    ? [waypoints[0].latitude, waypoints[0].longitude]
    : [EVSU_CENTER.latitude, EVSU_CENTER.longitude];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Edit Path' : 'Create New Path'}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Path Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Path Name"
                    {...register('path_name')}
                    error={!!errors.path_name}
                    helperText={errors.path_name?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="path_type"
                    control={control}
                    defaultValue="walkway"
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.path_type}>
                        <InputLabel>Path Type</InputLabel>
                        <Select
                          value={field.value ?? 'walkway'}
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                          name={field.name}
                          label="Path Type"
                          displayEmpty
                        >
                          <MenuItem value="walkway">Walkway</MenuItem>
                          <MenuItem value="sidewalk">Sidewalk</MenuItem>
                          <MenuItem value="path">Path</MenuItem>
                          <MenuItem value="road">Road</MenuItem>
                          <MenuItem value="indoor">Indoor</MenuItem>
                          <MenuItem value="corridor">Corridor</MenuItem>
                          <MenuItem value="stairs">Stairs</MenuItem>
                          <MenuItem value="elevator">Elevator</MenuItem>
                          <MenuItem value="ramp">Ramp</MenuItem>
                          <MenuItem value="bridge">Bridge</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                        {errors.path_type && (
                          <FormHelperText error>{errors.path_type.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch {...register('is_active')} defaultChecked />}
                    label="Active"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Waypoints ({waypoints.length})</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setMapClickEnabled(!mapClickEnabled)}
                >
                  {mapClickEnabled ? 'Disable' : 'Enable'} Map Click
                </Button>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Click on the map to add waypoints. Drag markers to adjust positions.
              </Alert>
              {waypoints.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No waypoints added. Click on the map to add waypoints.
                </Typography>
              ) : (
                <List dense>
                  {waypoints.map((wp, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`Waypoint ${index + 1}`}
                        secondary={`${wp.latitude.toFixed(6)}, ${wp.longitude.toFixed(6)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteWaypoint(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Map - Click to Add Waypoints
              </Typography>
              <Box sx={{ height: 600, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {waypoints.map((wp, index) => (
                    <Marker
                      key={index}
                      position={[wp.latitude, wp.longitude]}
                      draggable
                      eventHandlers={{
                        dragend: (e) => handleWaypointDrag(index, e.target.getLatLng()),
                      }}
                    />
                  ))}
                  {waypoints.length > 1 && (
                    <Polyline
                      positions={waypoints.map((wp) => [wp.latitude, wp.longitude])}
                      color="blue"
                      weight={3}
                      opacity={0.7}
                    />
                  )}
                  <MapClickHandler onMapClick={handleMapClick} disabled={!mapClickEnabled} />
                </MapContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/paths')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isLoading || waypoints.length < 2}
              >
                {mutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : isEdit ? (
                  'Update Path'
                ) : (
                  'Create Path'
                )}
              </Button>
            </Box>
            {waypoints.length < 2 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                A path must have at least 2 waypoints to be created.
              </Alert>
            )}
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

