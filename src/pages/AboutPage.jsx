import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import MapIcon from '@mui/icons-material/Map';

export default function AboutPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        About EVSU eMAP
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Eastern Visayas State University Campus Navigation and Mapping System
      </Typography>

      <Grid container spacing={3}>
        {/* Project Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <SchoolIcon color="primary" fontSize="large" />
              <Typography variant="h5">Project Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              <strong>EVSU eMAP</strong> is a comprehensive campus navigation and mapping system 
              designed to help students, faculty, and visitors navigate the Eastern Visayas State 
              University campus efficiently. The system provides both indoor and outdoor navigation 
              capabilities, building information, room locations, and pathway guidance.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Version: 1.0.0
            </Typography>
          </Paper>
        </Grid>

        {/* Technology Stack */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <CodeIcon color="primary" fontSize="large" />
              <Typography variant="h6">Technology Stack</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle2" fontWeight="bold">Frontend:</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip label="React 18" size="small" />
                <Chip label="Vite" size="small" />
                <Chip label="Material-UI" size="small" />
                <Chip label="React Query" size="small" />
                <Chip label="React Hook Form" size="small" />
                <Chip label="Leaflet Maps" size="small" />
              </Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>
                Backend:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip label="Supabase" size="small" />
                <Chip label="PostgreSQL" size="small" />
                <Chip label="PostGIS" size="small" />
              </Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2 }}>
                Mobile:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip label="React Native" size="small" />
                <Chip label="Expo" size="small" />
                <Chip label="React Navigation" size="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Features */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <MapIcon color="primary" fontSize="large" />
              <Typography variant="h6">Key Features</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>
                <Typography variant="body2">Interactive campus map with building locations</Typography>
              </li>
              <li>
                <Typography variant="body2">Indoor navigation with room-level precision</Typography>
              </li>
              <li>
                <Typography variant="body2">Pathway and route planning between buildings</Typography>
              </li>
              <li>
                <Typography variant="body2">Building and room search functionality</Typography>
              </li>
              <li>
                <Typography variant="body2">Admin panel for managing campus data</Typography>
              </li>
              <li>
                <Typography variant="body2">User feedback system</Typography>
              </li>
              <li>
                <Typography variant="body2">Audit trail for system actions</Typography>
              </li>
            </Box>
          </Paper>
        </Grid>

        {/* Security & Privacy */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <SecurityIcon color="primary" fontSize="large" />
              <Typography variant="h6">Security & Privacy</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" paragraph>
              The system implements robust security measures including:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>
                <Typography variant="body2">Row Level Security (RLS) policies</Typography>
              </li>
              <li>
                <Typography variant="body2">Role-based access control</Typography>
              </li>
              <li>
                <Typography variant="body2">Authentication and authorization</Typography>
              </li>
              <li>
                <Typography variant="body2">Audit logging for all actions</Typography>
              </li>
              <li>
                <Typography variant="body2">Secure data transmission</Typography>
              </li>
            </Box>
          </Paper>
        </Grid>

        {/* Database */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <StorageIcon color="primary" fontSize="large" />
              <Typography variant="h6">Database</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" paragraph>
              Built on PostgreSQL with PostGIS extension for geospatial capabilities:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>
                <Typography variant="body2">Geographic data storage and queries</Typography>
              </li>
              <li>
                <Typography variant="body2">Spatial indexing for performance</Typography>
              </li>
              <li>
                <Typography variant="body2">Normalized database schema</Typography>
              </li>
              <li>
                <Typography variant="body2">Triggers and functions for automation</Typography>
              </li>
              <li>
                <Typography variant="body2">Comprehensive indexing strategy</Typography>
              </li>
            </Box>
          </Paper>
        </Grid>

        {/* Development Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Development Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Institution
                </Typography>
                <Typography variant="body1">
                  Eastern Visayas State University (EVSU)
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Course
                </Typography>
                <Typography variant="body1">
                  IT 313 - Database Systems
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Project Type
                </Typography>
                <Typography variant="body1">
                  Final Project
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Presentation Date
                </Typography>
                <Typography variant="body1">
                  December 15-18, 2025
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* License & Copyright */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © 2025 Eastern Visayas State University. All rights reserved.
              <br />
              This software is developed for educational purposes as part of the IT 313 Database Systems course.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
