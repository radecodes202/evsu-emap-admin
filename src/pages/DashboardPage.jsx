import { useQuery } from '@tanstack/react-query';
import { buildingsAPI, usersAPI, pathsAPI } from '../utils/api';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Map as MapIcon,
  Route as RouteIcon,
} from '@mui/icons-material';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const { data: buildingsData, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingsAPI.getAll(),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll(),
    retry: false, // Don't retry if endpoint doesn't exist
  });

  const { data: pathsData, isLoading: pathsLoading } = useQuery({
    queryKey: ['paths'],
    queryFn: () => pathsAPI.getAll(),
    retry: false, // Don't retry if endpoint doesn't exist
  });

  const buildings = buildingsData?.data?.data || [];
  const users = usersData?.data?.data || [];
  const paths = pathsData?.data?.data || [];

  if (buildingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of your EVSU eMAP administration
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Buildings"
            value={buildings.length}
            icon={<BusinessIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={users.length || 'N/A'}
            icon={<PeopleIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Sessions"
            value="N/A"
            icon={<TrendingUpIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paths & Walkways"
            value={paths.length || 'N/A'}
            icon={<RouteIcon />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Buildings
            </Typography>
            {buildings.length > 0 ? (
              <Box component="ul" sx={{ pl: 2 }}>
                {buildings.slice(0, 5).map((building) => (
                  <li key={building.building_id}>
                    <Typography variant="body2">
                      {building.building_name} ({building.building_code})
                    </Typography>
                  </li>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No buildings found
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>
                <Typography variant="body2">
                  Manage buildings and their locations
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Configure campus boundaries and settings
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Manage user accounts and permissions
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Update chatbot responses and knowledge base
                </Typography>
              </li>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

