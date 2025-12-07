import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useCreateLocation, useUpdateLocation, useLocation } from '../hooks/useLocations';
import { useBuildings } from '../hooks/useBuildings';

const roomSchema = yup.object().shape({
  building_id: yup.string().required('Building is required'),
  name: yup.string().required('Room name is required'),
  room_number: yup.string(),
  floor: yup.number().nullable().transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || originalValue === undefined) {
      return null;
    }
    return value;
  }),
  type: yup.string(),
  capacity: yup.number().nullable().transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || originalValue === undefined) {
      return null;
    }
    return value;
  }).positive('Capacity must be a positive number'),
  description: yup.string(),
});

export default function RoomFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { data: buildings = [], isLoading: buildingsLoading, error: buildingsError } = useBuildings();
  const { data: room, isLoading: roomLoading } = useLocation(id);
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(roomSchema),
    defaultValues: {
      building_id: '',
      name: '',
      room_number: '',
      floor: null,
      type: '',
      capacity: null,
      description: '',
    },
  });

  useEffect(() => {
    if (isEditMode && room) {
      reset({
        building_id: room.building_id || '',
        name: room.name || '',
        room_number: room.room_number || '',
        floor: room.floor ?? null,
        type: room.type || '',
        capacity: room.capacity ?? null,
        description: room.description || '',
      });
    }
  }, [room, isEditMode, reset]);

  const onSubmit = async (data) => {
    try {
      const roomData = {
        building_id: data.building_id,
        name: data.name,
        room_number: data.room_number || null,
        floor: data.floor ?? null,
        type: data.type || null,
        capacity: data.capacity ?? null,
        description: data.description || null,
      };

      if (isEditMode) {
        await updateMutation.mutateAsync({
          id,
          updates: roomData,
        });
      } else {
        await createMutation.mutateAsync(roomData);
      }

      navigate('/rooms');
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  if (isEditMode && roomLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/rooms')}
        sx={{ mb: 2 }}
      >
        Back to Rooms
      </Button>

      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Room' : 'Add New Room'}
      </Typography>

      {buildingsError && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">
            Error loading buildings: {buildingsError.message}
            <br />
            Please make sure buildings exist before creating rooms.
          </Typography>
        </Alert>
      )}

      {!buildingsError && !buildingsLoading && buildings.length === 0 && (
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">
            <strong>No buildings found in the database.</strong>
            <br />
            Please create at least one building before adding rooms. Go to the <strong>Buildings</strong> page to create one.
          </Typography>
        </Alert>
      )}

      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="building_id"
                control={control}
                defaultValue=""
                rules={{ required: 'Building is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.building_id} disabled={buildingsLoading || buildings.length === 0}>
                    <InputLabel>Building *</InputLabel>
                    <Select
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      name={field.name}
                      label="Building *"
                      disabled={buildingsLoading}
                      displayEmpty
                    >
                      {buildingsLoading ? (
                        <MenuItem value="" disabled>
                          <em>Loading buildings...</em>
                        </MenuItem>
                      ) : buildings.length === 0 ? (
                        <MenuItem value="" disabled>
                          <em>No buildings available - Create a building first</em>
                        </MenuItem>
                      ) : (
                        <>
                          <MenuItem value="">
                            <em>Select a building</em>
                          </MenuItem>
                          {buildings.map((building) => (
                            <MenuItem key={building.id} value={building.id}>
                              {building.name} ({building.code})
                            </MenuItem>
                          ))}
                        </>
                      )}
                    </Select>
                    {errors.building_id && (
                      <FormHelperText>{errors.building_id.message}</FormHelperText>
                    )}
                    {!errors.building_id && (buildingsLoading || buildings.length === 0) && (
                      <FormHelperText>
                        {buildingsLoading ? 'Loading buildings...' : 'No buildings available. Create a building first.'}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Room Number"
                {...register('room_number')}
                error={!!errors.room_number}
                helperText={errors.room_number?.message || 'e.g., 101, 201-A'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Room Name *"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message || 'e.g., Computer Lab, Lecture Hall'}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Floor"
                type="number"
                {...register('floor', { valueAsNumber: true })}
                error={!!errors.floor}
                helperText={errors.floor?.message || 'Floor level (0 for ground floor)'}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="type"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Room Type</InputLabel>
                    <Select
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      name={field.name}
                      label="Room Type"
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>Select Type</em>
                      </MenuItem>
                      <MenuItem value="classroom">Classroom</MenuItem>
                      <MenuItem value="laboratory">Laboratory</MenuItem>
                      <MenuItem value="office">Office</MenuItem>
                      <MenuItem value="library">Library</MenuItem>
                      <MenuItem value="lecture-hall">Lecture Hall</MenuItem>
                      <MenuItem value="conference-room">Conference Room</MenuItem>
                      <MenuItem value="restroom">Restroom</MenuItem>
                      <MenuItem value="storage">Storage</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                    {errors.type && (
                      <FormHelperText>{errors.type.message}</FormHelperText>
                    )}
                    {!errors.type && (
                      <FormHelperText>Select the room type</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                error={!!errors.capacity}
                helperText={errors.capacity?.message || 'Maximum number of people'}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message || 'Additional information about the room'}
              />
            </Grid>

            {(createMutation.isError || updateMutation.isError) && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {createMutation.error?.message || updateMutation.error?.message || 'An error occurred while saving the room.'}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/rooms')}
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={createMutation.isLoading || updateMutation.isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {isEditMode ? 'Update Room' : 'Create Room'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
