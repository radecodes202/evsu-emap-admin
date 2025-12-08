import { Box, Paper, Typography, Alert } from '@mui/material';

// Legacy chatbot admin UI was tied to the old REST API.
// This stub keeps the route alive but disables calls to the removed endpoints.
export default function ChatbotPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Chatbot Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Chatbot admin controls are disabled in this Supabase build.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          The previous chatbot management relied on the legacy REST API. This feature is paused until a
          Supabase-backed implementation is added. Other features remain fully functional.
        </Alert>
      </Paper>
    </Box>
  );
}

