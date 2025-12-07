import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  Collapse,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      // Try to reach the API base URL
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
        timeout: 3000,
      });
      setConnectionStatus({ success: true, message: 'Server is reachable!' });
    } catch (err) {
      // Try the actual login endpoint
      try {
        const testResponse = await axios.post(
          `${API_BASE_URL}/auth/login`,
          { email: 'test', password: 'test' },
          { timeout: 3000, validateStatus: () => true }
        );
        if (testResponse.status === 200 || testResponse.status === 401) {
          setConnectionStatus({
            success: true,
            message: 'API endpoint is reachable (authentication failed, but server responded)',
          });
        } else {
          setConnectionStatus({
            success: false,
            message: `Server responded with status ${testResponse.status}`,
          });
        }
      } catch (loginErr) {
        if (loginErr.code === 'ECONNREFUSED' || loginErr.message.includes('Network Error')) {
          setConnectionStatus({
            success: false,
            message: `Cannot connect to ${API_BASE_URL}. Make sure the backend server is running.`,
          });
        } else if (loginErr.code === 'ETIMEDOUT') {
          setConnectionStatus({
            success: false,
            message: `Connection timeout. Server may be slow or unreachable at ${API_BASE_URL}`,
          });
        } else {
          setConnectionStatus({
            success: false,
            message: `Connection error: ${loginErr.message}`,
          });
        }
      }
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login with:', { email }); // Debug log

    const result = await login(email, password);
    
    console.log('Login result:', result); // Debug log

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed. Please check your credentials and try again.');
    }

    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            EVSU eMAP Admin
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage the application
          </Typography>

          <Alert severity="info" sx={{ mb: 2, fontSize: '0.75rem' }}>
            API: {API_BASE_URL}
            <br />
            <Link
              component="button"
              variant="body2"
              onClick={testConnection}
              sx={{ mt: 0.5, textDecoration: 'underline', cursor: 'pointer' }}
              disabled={testingConnection}
            >
              {testingConnection ? 'Testing connection...' : 'Test Connection'}
            </Link>
          </Alert>

          <Collapse in={connectionStatus !== null}>
            <Alert
              severity={connectionStatus?.success ? 'success' : 'warning'}
              sx={{ mb: 2 }}
            >
              {connectionStatus?.message}
            </Alert>
          </Collapse>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

