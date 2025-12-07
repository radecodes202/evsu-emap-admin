import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { pathsAPI } from '../utils/api';

export default function PathsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pathToDelete, setPathToDelete] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['paths'],
    queryFn: () => pathsAPI.getAll(),
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => pathsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['paths']);
      setDeleteDialogOpen(false);
      setPathToDelete(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => pathsAPI.update(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries(['paths']);
    },
  });

  const paths = data?.data?.data || [];

  const handleDeleteClick = (path) => {
    setPathToDelete(path);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (pathToDelete) {
      deleteMutation.mutate(pathToDelete.path_id);
    }
  };

  const handleToggleActive = (path) => {
    toggleActiveMutation.mutate({
      id: path.path_id,
      isActive: !path.is_active,
    });
  };

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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Paths & Walkways</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/paths/new')}
          >
            Add Path
          </Button>
        </Box>
        <Alert severity="warning">
          Paths API endpoint may not be available. Error: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Paths & Walkways</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/paths/new')}
        >
          Add Path
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Waypoints</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paths.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No paths found. Click "Add Path" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paths.map((path) => (
                <TableRow key={path.path_id} hover>
                  <TableCell>{path.path_id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {path.path_name}
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
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/paths/edit/${path.path_id}`)}
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
            Are you sure you want to delete "{pathToDelete?.path_name}"? This action cannot be
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

