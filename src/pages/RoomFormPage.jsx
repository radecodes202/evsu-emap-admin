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
  Grid,
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
                  <TextField
                    fullWidth
                    select
                    label="Building *"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={!!errors.building_id}
                    helperText={errors.building_id?.message || (buildingsLoading ? 'Loading buildings...' : buildings.length === 0 ? 'No buildings available. Create a building first.' : '')}
                    disabled={buildingsLoading || buildings.length === 0}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {buildingsLoading ? (
                      <option value="" disabled>Loading buildings...</option>
                    ) : buildings.length === 0 ? (
                      <option value="" disabled>No buildings available - Create a building first</option>
                    ) : (
                      <>
                        <option value="" disabled hidden></option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name} ({building.code})
                          </option>
                        ))}
                      </>
                    )}
                  </TextField>
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
                  <TextField
                    fullWidth
                    select
                    label="Room Type"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="" disabled hidden></option>
                    <option value="classroom">Classroom</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="office">Office</option>
                    <option value="library">Library</option>
                    <option value="lecture-hall">Lecture Hall</option>
                    <option value="conference-room">Conference Room</option>
                    <option value="restroom">Restroom</option>
                    <option value="storage">Storage</option>
                    <option value="other">Other</option>
                  </TextField>
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
