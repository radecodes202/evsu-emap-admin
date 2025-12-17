import { useMemo } from 'react';
import { useBuildings } from '../hooks/useBuildings';
import { useUsers } from '../hooks/useUsers';
import { usePaths } from '../hooks/usePaths';
import { useAllLocations } from '../hooks/useLocations';
import { useFavoriteStatistics, useLocationStatistics, useBuildingStatistics } from '../hooks/useFavorites';
import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '../lib/supabase';
import { auditService } from '../services/auditService';
import MapPreview from '../components/MapPreview';
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
  Route as RouteIcon,
  Room as RoomIcon,
  History as HistoryIcon,
  Favorite as FavoriteIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import { format, subDays, startOfDay } from 'date-fns';

export default function DashboardPage() {
  const { data: buildings = [], isLoading: buildingsLoading, error: buildingsError } = useBuildings();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: paths = [], isLoading: pathsLoading } = usePaths();
  const { data: rooms = [], isLoading: roomsLoading } = useAllLocations();
  const { data: favoriteStats = [], isLoading: favoritesLoading } = useFavoriteStatistics();
  const { data: locationStats = [], isLoading: locationStatsLoading } = useLocationStatistics();
  const { data: buildingStats = [], isLoading: buildingStatsLoading } = useBuildingStatistics();
  
  // Fetch audit logs for analytics (last 30 days)
  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ['audit_logs', 'dashboard'],
    queryFn: () => auditService.getAll({
      start_date: subDays(new Date(), 30).toISOString(),
      limit: 1000,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = buildingsLoading || usersLoading || pathsLoading || roomsLoading || auditLoading || favoritesLoading || locationStatsLoading || buildingStatsLoading;

  // Calculate statistics
  const stats = useMemo(() => {
    // Activity over time (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
      return {
        date: format(date, 'MMM dd'),
        fullDate: dateStr,
        count: 0,
      };
    });

    auditLogs.forEach((log) => {
      const logDate = format(startOfDay(new Date(log.created_at)), 'yyyy-MM-dd');
      const dayData = last7Days.find((d) => d.fullDate === logDate);
      if (dayData) {
        dayData.count += 1;
      }
    });

    // Action type breakdown
    const actionBreakdown = auditLogs.reduce((acc, log) => {
      const action = log.action_type || 'UNKNOWN';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {});

    const actionChartData = Object.entries(actionBreakdown).map(([name, value]) => ({
      name,
      value,
    }));

    // Entity type breakdown
    const entityBreakdown = auditLogs.reduce((acc, log) => {
      const entity = log.entity_type || 'unknown';
      acc[entity] = (acc[entity] || 0) + 1;
      return acc;
    }, {});

    const entityChartData = Object.entries(entityBreakdown)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: value,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Buildings by category
    const buildingsByCategory = buildings.reduce((acc, building) => {
      const category = building.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryChartData = Object.entries(buildingsByCategory).map(([name, value]) => ({
      name,
      count: value,
    }));

    // Rooms/Locations by type
    const roomsByType = rooms.reduce((acc, room) => {
      const type = room.type || 'Unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const roomsByTypeChartData = Object.entries(roomsByType)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: value,
      }))
      .sort((a, b) => b.count - a.count);

    // Rooms/Locations by floor
    const roomsByFloor = rooms.reduce((acc, room) => {
      const floor = room.floor !== null && room.floor !== undefined ? `Floor ${room.floor}` : 'No Floor';
      acc[floor] = (acc[floor] || 0) + 1;
      return acc;
    }, {});

    const roomsByFloorChartData = Object.entries(roomsByFloor)
      .map(([name, value]) => ({
        name,
        count: value,
      }))
      .sort((a, b) => {
        // Sort by floor number if available, otherwise put "No Floor" at the end
        const aNum = parseInt(a.name.replace('Floor ', '')) || 999;
        const bNum = parseInt(b.name.replace('Floor ', '')) || 999;
        return aNum - bNum;
      });

    // Rooms/Locations by building
    const roomsByBuilding = rooms.reduce((acc, room) => {
      const buildingName = room.building?.name || room.building?.code || 'Unknown Building';
      acc[buildingName] = (acc[buildingName] || 0) + 1;
      return acc;
    }, {});

    const roomsByBuildingChartData = Object.entries(roomsByBuilding)
      .map(([name, value]) => ({
        name,
        count: value,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 buildings with most rooms

    // Recent activity count (last 24 hours)
    const last24Hours = auditLogs.filter((log) => {
      const logDate = new Date(log.created_at);
      const dayAgo = subDays(new Date(), 1);
      return logDate >= dayAgo;
    }).length;

    return {
      activityOverTime: last7Days,
      actionBreakdown: actionChartData,
      entityBreakdown: entityChartData,
      buildingsByCategory: categoryChartData,
      roomsByType: roomsByTypeChartData,
      roomsByFloor: roomsByFloorChartData,
      roomsByBuilding: roomsByBuildingChartData,
      recentActivity: last24Hours,
      totalAuditLogs: auditLogs.length,
    };
  }, [auditLogs, buildings, rooms]);

  const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1', '#7b1fa2'];

  if (isLoading) {
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
        {/* Statistics Cards */}
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
            value={users.length}
            icon={<PeopleIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rooms & Locations"
            value={rooms.length}
            icon={<RoomIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paths & Walkways"
            value={paths.length}
            icon={<RouteIcon />}
            color="#9c27b0"
          />
        </Grid>

        {/* Additional Statistics */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recent Activity (24h)"
            value={stats.recentActivity}
            icon={<TrendingUpIcon />}
            color="#0288d1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Audit Logs"
            value={stats.totalAuditLogs}
            icon={<HistoryIcon />}
            color="#7b1fa2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Buildings"
            value={buildings.filter(b => b.is_active !== false).length}
            icon={<BusinessIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Paths"
            value={paths.filter(p => p.is_active !== false).length}
            icon={<RouteIcon />}
            color="#9c27b0"
          />
        </Grid>

        {/* Activity Over Time Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Activity Over Time (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.activityOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  name="Actions"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Action Type Breakdown */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Action Type Breakdown
            </Typography>
            {stats.actionBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.actionBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.actionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography variant="body2" color="text.secondary">
                  No activity data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Entity Type Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Entity Type Breakdown
            </Typography>
            {stats.entityBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.entityBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography variant="body2" color="text.secondary">
                  No entity data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Buildings by Category */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Buildings by Category
            </Typography>
            {stats.buildingsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.buildingsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ed6c02" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography variant="body2" color="text.secondary">
                  No buildings data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Rooms/Locations by Type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Rooms & Locations by Type
            </Typography>
            {stats.roomsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.roomsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.roomsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography variant="body2" color="text.secondary">
                  No room type data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Rooms/Locations by Floor */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Rooms & Locations by Floor
            </Typography>
            {stats.roomsByFloor.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.roomsByFloor}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0288d1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography variant="body2" color="text.secondary">
                  No floor data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Rooms/Locations by Building */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Buildings by Room Count
            </Typography>
            {stats.roomsByBuilding.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.roomsByBuilding}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7b1fa2" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography variant="body2" color="text.secondary">
                  No building data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Buildings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Buildings
            </Typography>
            {buildings.length > 0 ? (
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
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

        {/* Recent Activity Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Total Actions:</strong> {stats.totalAuditLogs}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Last 24 Hours:</strong> {stats.recentActivity} actions
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Most Active Entity:</strong>{' '}
                {stats.entityBreakdown.length > 0
                  ? stats.entityBreakdown[0].name
                  : 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Most Common Action:</strong>{' '}
                {stats.actionBreakdown.length > 0
                  ? stats.actionBreakdown.sort((a, b) => b.value - a.value)[0].name
                  : 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Most Favorited Buildings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <FavoriteIcon color="error" />
              <Typography variant="h6">
                Most Favorited Buildings
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.75rem' }}>
              Buildings users have favorited
            </Typography>
            {favoriteStats.length > 0 ? (
              <Box>
                {favoriteStats.slice(0, 10).map((item, index) => (
                  <Box
                    key={item.building.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: index < favoriteStats.slice(0, 10).length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {item.building.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.building.code}
                        {item.building.category && ` • ${item.building.category}`}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FavoriteIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                      <Typography variant="h6" color="error">
                        {item.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count === 1 ? 'user' : 'users'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No favorites yet. Buildings will appear here once users start favoriting them.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Most Popular Buildings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <BusinessIcon color="primary" />
              <Typography variant="h6">
                Most Popular Buildings
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.75rem' }}>
              Based on access activity (views, searches, etc.)
            </Typography>
            {buildingStats.length > 0 ? (
              <Box>
                {buildingStats.slice(0, 10).map((item, index) => (
                  <Box
                    key={item.building.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: index < buildingStats.slice(0, 10).length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {item.building.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.building.code}
                        {item.building.category && ` • ${item.building.category}`}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUpIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                      <Typography variant="h6" color="primary">
                        {item.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count === 1 ? 'access' : 'accesses'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No building activity yet. Popular buildings will appear here based on user access patterns.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Most Popular Rooms/Locations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <RoomIcon color="primary" />
              <Typography variant="h6">
                Most Popular Rooms & Locations
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.75rem' }}>
              Based on access activity (views, searches, etc.)
            </Typography>
            {locationStats.length > 0 ? (
              <Box>
                {locationStats.slice(0, 10).map((item, index) => (
                  <Box
                    key={item.location.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      borderBottom: index < locationStats.slice(0, 10).length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.location.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.location.room_number && `Room ${item.location.room_number}`}
                        {item.location.room_number && item.location.building && ' • '}
                        {item.location.building && `${item.location.building.name} (${item.location.building.code})`}
                        {item.location.type && ` • ${item.location.type}`}
                        {item.location.floor !== null && item.location.floor !== undefined && ` • Floor ${item.location.floor}`}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} sx={{ ml: 2 }}>
                      <TrendingUpIcon sx={{ color: '#0288d1', fontSize: 20 }} />
                      <Typography variant="h6" color="primary">
                        {item.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count === 1 ? 'access' : 'accesses'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No location activity yet. Popular rooms and locations will appear here based on user access patterns.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Map Preview - Client View */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <MapIcon color="primary" />
              <Typography variant="h6">
                Map Preview (Client View)
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This is how the map appears to users on the client app. All buildings and paths are displayed.
            </Typography>
            <Box sx={{ height: 600, width: '100%', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
              <MapPreview buildings={buildings} paths={paths} height={600} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

