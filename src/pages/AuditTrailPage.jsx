import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Grid,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { auditService } from '../services/auditService';

export default function AuditTrailPage() {
  const [filters, setFilters] = useState({
    action_type: '',
    entity_type: '',
    user_email: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['audit_logs', filters],
    queryFn: () => auditService.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Filter logs based on search query (client-side filtering on description, user_email, etc.)
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter((log) =>
      log.description?.toLowerCase().includes(query) ||
      log.user_email?.toLowerCase().includes(query) ||
      log.entity_type?.toLowerCase().includes(query) ||
      log.action_type?.toLowerCase().includes(query) ||
      log.entity_id?.toString().includes(query)
    );
  }, [logs, searchQuery]);

  const actionColors = {
    CREATE: 'success',
    UPDATE: 'info',
    DELETE: 'error',
    LOGIN: 'primary',
    LOGOUT: 'default',
    VIEW: 'secondary',
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
        <Typography variant="h4" gutterBottom>
          Audit Trail
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Audit Logs
          </Typography>
          <Typography variant="body2">
            {error.message}
            <br />
            <br />
            Make sure you've run the <code>database-audit-trail-feedback.sql</code> script in Supabase.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Get statistics
  const stats = {
    total: logs.length,
    byAction: logs.reduce((acc, log) => {
      acc[log.action_type] = (acc[log.action_type] || 0) + 1;
      return acc;
    }, {}),
    byEntity: logs.reduce((acc, log) => {
      acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
      return acc;
    }, {}),
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Audit Trail
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track all user actions and system events
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Logs
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Creates
              </Typography>
              <Typography variant="h4">{stats.byAction.CREATE || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Updates
              </Typography>
              <Typography variant="h4">{stats.byAction.UPDATE || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Deletes
              </Typography>
              <Typography variant="h4">{stats.byAction.DELETE || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by description, user, entity..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              select
              label="Action Type"
              value={filters.action_type}
              onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="" disabled hidden></option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="VIEW">View</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              select
              label="Entity Type"
              value={filters.entity_type}
              onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="" disabled hidden></option>
              <option value="building">Building</option>
              <option value="location">Location/Room</option>
              <option value="route">Route/Path</option>
              <option value="user">User</option>
              <option value="auth">Authentication</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="User Email"
              value={filters.user_email}
              onChange={(e) => setFilters({ ...filters, user_email: e.target.value })}
              placeholder="Search by email..."
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Audit Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {logs.length === 0
                      ? 'No audit logs found.'
                      : `No logs match "${searchQuery}".`}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(log.created_at).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {log.user_email || log.user_id || 'System'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action_type}
                      color={actionColors[log.action_type] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {log.entity_type}
                      {log.entity_id && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ID: {log.entity_id.substring(0, 8)}...
                        </Typography>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {log.description || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
