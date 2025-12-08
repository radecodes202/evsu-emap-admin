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
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useBuildings, useDeleteBuilding } from '../hooks/useBuildings';

export default function BuildingsPage() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: buildings = [], isLoading, error } = useBuildings();
  const deleteMutation = useDeleteBuilding();

  const handleDeleteSuccess = () => {
      setDeleteDialogOpen(false);
      setBuildingToDelete(null);
  };

  const handleDeleteClick = (building) => {
    setBuildingToDelete(building);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (buildingToDelete) {
      deleteMutation.mutate(buildingToDelete.id, {
        onSuccess: handleDeleteSuccess,
      });
    }
  };

  // Filter buildings based on search query and category
  const filteredBuildings = useMemo(() => {
    let filtered = buildings;
    
    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(building => building.category === categoryFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((building) => 
        building.name?.toLowerCase().includes(query) ||
        building.code?.toLowerCase().includes(query) ||
        building.category?.toLowerCase().includes(query) ||
        building.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [buildings, searchQuery, categoryFilter]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading buildings: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h4">Buildings</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/buildings/new')}
        >
          Add Building
        </Button>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search buildings..."
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
            <TextField
              fullWidth
              size="small"
              select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="" disabled hidden></option>
              <option value="academic">Academic</option>
              <option value="administrative">Administrative</option>
              <option value="facility">Facility</option>
              <option value="sports">Sports</option>
              <option value="residential">Residential</option>
              <option value="other">Other</option>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Coordinates</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBuildings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {buildings.length === 0
                      ? 'No buildings found. Click "Add Building" to create one.'
                      : `No buildings match "${searchQuery}".`}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBuildings.map((building) => (
                <TableRow key={building.id} hover>
                  <TableCell>
                    <Chip label={building.code} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {building.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      Lat: {building.latitude}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Lng: {building.longitude}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={building.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {building.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/buildings/edit/${building.id}`)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(building)}
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
        <DialogTitle>Delete Building</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{buildingToDelete?.name}"? This action
            cannot be undone.
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

