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
  Switch,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { usePaths, useDeletePath, useUpdatePath } from '../hooks/usePaths';

export default function PathsPage() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pathToDelete, setPathToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: paths = [], isLoading, error } = usePaths();
  const deleteMutation = useDeletePath();
  const updateMutation = useUpdatePath();

  const handleDeleteSuccess = () => {
      setDeleteDialogOpen(false);
      setPathToDelete(null);
  };

  const handleDeleteClick = (path) => {
    setPathToDelete(path);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (pathToDelete) {
      deleteMutation.mutate(pathToDelete.id, {
        onSuccess: handleDeleteSuccess,
      });
    }
  };

  const handleToggleActive = (path) => {
    updateMutation.mutate({
      id: path.id,
      updates: { is_active: !path.is_active },
    });
  };

  // Filter paths based on search query and type
  const filteredPaths = useMemo(() => {
    let filtered = paths;
    
    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(path => path.path_type === typeFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((path) =>
        path.path_name?.toLowerCase().includes(query) ||
        path.path_type?.toLowerCase().includes(query) ||
        path.id?.toString().includes(query)
      );
    }
    
    return filtered;
  }, [paths, searchQuery, typeFilter]);

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
          Paths & Walkways
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Paths
          </Typography>
          <Typography variant="body2">
            {error.message}
            <br />
            <br />
            Make sure you've run the <code>database-migration-users-paths.sql</code> script in Supabase.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <Typography variant="h4">Paths & Walkways</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/paths/new')}
          >
            Add Path
          </Button>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search paths..."
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
              <InputLabel>Path Type</InputLabel>
              <Select
                value={typeFilter}
                label="Path Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
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
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Waypoints</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPaths.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {paths.length === 0
                      ? 'No paths found. Click "Add Path" to create one.'
                      : `No paths match "${searchQuery}".`}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPaths.map((path) => (
                <TableRow key={path.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {path.path_name || 'Unnamed Path'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={path.path_type || 'walkway'} size="small" />
                  </TableCell>
                  <TableCell>
                    {path.waypoints?.length || 0} waypoint(s)
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={path.is_active !== false}
                      onChange={() => handleToggleActive(path)}
                      size="small"
                      disabled={updateMutation.isLoading}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/paths/edit/${path.id}`)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(path)}
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
        <DialogTitle>Delete Path</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{pathToDelete?.path_name || 'this path'}"? This action cannot be
            undone. All waypoints associated with this path will also be deleted.
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

