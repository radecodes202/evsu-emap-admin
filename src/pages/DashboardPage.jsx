import { useBuildings } from '../hooks/useBuildings';
import { isSupabaseConfigured } from '../lib/supabase';
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
  const { data: buildings = [], isLoading: buildingsLoading, error: buildingsError } = useBuildings();
  
  // Note: Users and Paths features are not yet migrated to Supabase
  // These will show N/A until those features are implemented
  const users = [];
  const paths = [];

  if (buildingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Supabase Not Configured
          </Typography>
          <Typography variant="body2">
            Please configure your Supabase credentials in the .env file:
            <br />
            <code>VITE_SUPABASE_URL=your-project-url</code>
            <br />
            <code>VITE_SUPABASE_SERVICE_KEY=your-service-role-key</code>
            <br />
            <br />
            See <code>SUPABASE_SETUP.md</code> for detailed instructions.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (buildingsError) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Buildings
          </Typography>
          <Typography variant="body2">
            {buildingsError.message}
            <br />
            <br />
            Possible causes:
            <ul>
              <li>Invalid Supabase credentials</li>
              <li>Database tables not created (run database-setup.sql)</li>
              <li>Network connection issue</li>
            </ul>
            Check the browser console for more details.
          </Typography>
        </Alert>
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
                  <li key={building.id}>
                    <Typography variant="body2">
                      {building.name} ({building.code})
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

