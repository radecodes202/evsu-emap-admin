import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RoomIcon from '@mui/icons-material/Room';
import SearchIcon from '@mui/icons-material/Search';
import { useAllLocations, useDeleteLocation } from '../hooks/useLocations';
import { useBuildings } from '../hooks/useBuildings';

export default function RoomsPage() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: rooms = [], isLoading, error } = useAllLocations();
  const { data: buildings = [] } = useBuildings();
  const deleteMutation = useDeleteLocation();

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setRoomToDelete(null);
  };

  const handleDeleteClick = (room) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (roomToDelete) {
      deleteMutation.mutate(roomToDelete.id, {
        onSuccess: handleDeleteSuccess,
      });
    }
  };

  const handleAddRoom = () => {
    navigate('/rooms/new');
  };

  const handleEditRoom = (room) => {
    navigate(`/rooms/edit/${room.id}`);
  };

  // Filter rooms by building, type, and search query
  const filteredRooms = useMemo(() => {
    let filtered = rooms;
    
    // Filter by building
    if (buildingFilter !== 'all') {
      filtered = filtered.filter(room => room.building_id === buildingFilter);
    }
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(room => room.type === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((room) =>
        room.name?.toLowerCase().includes(query) ||
        room.room_number?.toLowerCase().includes(query) ||
        room.type?.toLowerCase().includes(query) ||
        room.building?.name?.toLowerCase().includes(query) ||
        room.building?.code?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [rooms, buildingFilter, typeFilter, searchQuery]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Rooms & Locations
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Rooms
          </Typography>
          <Typography variant="body2">
            {error.message}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <Typography variant="h4">Rooms & Locations</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRoom}
          >
            Add Room
          </Button>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Building</InputLabel>
              <Select
                value={buildingFilter}
                label="Building"
                onChange={(e) => setBuildingFilter(e.target.value)}
              >
                <MenuItem value="all">All Buildings</MenuItem>
                {buildings.map((building) => (
                  <MenuItem key={building.id} value={building.id}>
                    {building.name} ({building.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Room Type</InputLabel>
              <Select
                value={typeFilter}
                label="Room Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
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
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Building</TableCell>
              <TableCell>Room Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {rooms.length === 0
                      ? 'No rooms found. Click "Add Room" to create one.'
                      : buildingFilter !== 'all' && !searchQuery
                        ? 'No rooms found in this building.'
                        : searchQuery && buildingFilter !== 'all'
                          ? `No rooms match "${searchQuery}" in the selected building.`
                          : `No rooms match "${searchQuery}".`}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => (
                <TableRow key={room.id} hover>
                  <TableCell>
                    {room.building ? (
                      <Chip 
                        label={`${room.building.name} (${room.building.code})`} 
                        size="small" 
                        icon={<RoomIcon />}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unknown Building
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {room.room_number || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {room.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {room.floor !== null && room.floor !== undefined ? (
                      <Chip label={`Floor ${room.floor}`} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {room.type ? (
                      <Chip label={room.type} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {room.capacity ? (
                      <Typography variant="body2">{room.capacity} people</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditRoom(room)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(room)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{roomToDelete?.name || 'this room'}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
