import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function HelpPage() {
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <HelpOutlineIcon color="primary" fontSize="large" />
        <Typography variant="h4">User Manual & Help</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive guide to using the EVSU eMAP Admin Panel
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This is the user manual for the Admin Panel. For the mobile app user manual, please refer to the mobile application documentation.
      </Alert>

      <Grid container spacing={3}>
        {/* Getting Started */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Getting Started</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Welcome to the EVSU eMAP Admin Panel. This system allows you to manage campus buildings, 
                  rooms, pathways, users, and system settings.
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  First Steps:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Login"
                      secondary="Use your admin credentials to log in to the system"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. Explore the Dashboard"
                      secondary="Check the dashboard for system statistics and quick overview"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Configure Campus"
                      secondary="Set up campus boundaries and basic settings in Campus Config"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Managing Buildings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Managing Buildings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Adding a Building:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Navigate to Buildings"
                      secondary="Click 'Buildings' in the sidebar menu"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. Click 'Add Building'"
                      secondary="Click the button in the top right corner"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Fill in Building Information"
                      secondary="Enter name, code, category, and description"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="4. Set Location"
                      secondary="Drag the map or click to set the building's location, or enter coordinates manually"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="5. Save"
                      secondary="Click 'Create Building' to save"
                    />
                  </ListItem>
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Editing/Deleting Buildings:
                </Typography>
                <Typography variant="body2" paragraph>
                  Use the Edit or Delete icons in the buildings table to modify or remove buildings.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Managing Rooms */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Managing Rooms & Locations</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Adding a Room:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Go to Rooms & Locations"
                      secondary="Navigate from the sidebar menu"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. Select Building"
                      secondary="Choose which building the room belongs to"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Enter Room Details"
                      secondary="Room number, name, floor, type, and capacity"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="4. Save Room"
                      secondary="Click 'Create Room' to save"
                    />
                  </ListItem>
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  You can filter rooms by building using the dropdown filter at the top of the rooms page.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Managing Paths */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Managing Pathways</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Creating Pathways:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Navigate to Paths & Walkways"
                      secondary="Access from the sidebar menu"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. Add Path"
                      secondary="Click 'Add Path' button"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Configure Path"
                      secondary="Set path name, type, start/end buildings, and description"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="4. Add Waypoints"
                      secondary="Click on the map to add waypoints that define the route"
                    />
                  </ListItem>
                </List>
                <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                  Pathways help users navigate between buildings. Waypoints define the exact route to follow.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* User Management */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">User Management</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Adding Users:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="1. Go to Users Page"
                      secondary="Access from the sidebar"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. Click 'Add User'"
                      secondary="Fill in name, email, password, and role"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Assign Role"
                      secondary="Set as 'admin' or 'user' based on permissions needed"
                    />
                  </ListItem>
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  <strong>Roles:</strong>
                </Typography>
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Chip label="Admin" color="primary" size="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" component="span">
                    Full access to all features
                  </Typography>
                </Box>
                <Box>
                  <Chip label="User" size="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" component="span">
                    Limited access (if implemented)
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Indoor Mapping */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Indoor Mapping Guide</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  For detailed information on indoor mapping, coordinate precision, and best practices, 
                  please refer to the <strong>INDOOR_MAPPING_GUIDE.md</strong> documentation file.
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Key Points:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="High Precision Coordinates"
                      secondary="The system supports coordinates with up to 15 decimal places for indoor accuracy"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Coordinate Boundaries"
                      secondary="Ensure coordinates are within the campus boundaries defined in Campus Config"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Map Interaction"
                      secondary="You can drag the map or click to set precise locations"
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Troubleshooting */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Troubleshooting</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Common Issues:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Login Issues"
                      secondary="Verify your credentials match the configured admin email/password in .env file"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Data Not Loading"
                      secondary="Check Supabase connection and verify database tables exist. Run migration scripts if needed."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Coordinates Rejected"
                      secondary="Ensure coordinates are within campus boundaries. Update boundaries in Campus Config if needed."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Map Not Dragging"
                      secondary="Try refreshing the page. Ensure JavaScript is enabled in your browser."
                    />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Support */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              Need More Help?
            </Typography>
            <Typography variant="body2" paragraph>
              For additional support or questions:
            </Typography>
            <List dense>
              <ListItem sx={{ color: 'inherit' }}>
                <ListItemText 
                  primary="Check Documentation"
                  secondary="Review SUPABASE_SETUP.md, MIGRATION_USERS_PATHS.md, and INDOOR_MAPPING_GUIDE.md"
                />
              </ListItem>
              <ListItem sx={{ color: 'inherit' }}>
                <ListItemText 
                  primary="Review Audit Trail"
                  secondary="Check the audit trail to see system activity and troubleshoot issues"
                />
              </ListItem>
              <ListItem sx={{ color: 'inherit' }}>
                <ListItemText 
                  primary="Contact Support"
                  secondary="Reach out to the development team or your system administrator"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
