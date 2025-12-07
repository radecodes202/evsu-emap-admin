import { useState, useMemo } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useUsers, useCreateUser, useDeleteUser } from '../hooks/useUsers';

export default function UsersPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading, error } = useUsers();
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    setNewUser({ email: '', password: '', name: '', role: 'user' });
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id, {
        onSuccess: handleDeleteSuccess,
      });
    }
  };

  const handleCreateSubmit = () => {
    createMutation.mutate(newUser, {
      onSuccess: handleCreateSuccess,
    });
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((user) =>
      user.email?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      user.id?.toString().includes(query)
    );
  }, [users, searchQuery]);

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
          Users
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Users
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4">Users</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add User
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {users.length === 0
                      ? 'No users found. Click "Add User" to create one.'
                      : `No users match "${searchQuery}".`}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role || (user.isAdmin ? 'admin' : 'user')}
                      color={user.role === 'admin' || user.isAdmin ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(user)}
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

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{userToDelete?.email}"? This action cannot be
            undone.
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

