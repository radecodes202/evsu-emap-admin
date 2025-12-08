import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Grid,
  Rating,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { feedbackService } from '../services/feedbackService';

export default function FeedbackPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: feedbacks = [], isLoading, error } = useQuery({
    queryKey: ['user_feedback', filters],
    queryFn: () => feedbackService.getAll(filters),
    staleTime: 30 * 1000, // 30 seconds
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => feedbackService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_feedback'] });
      setEditDialogOpen(false);
      setSelectedFeedback(null);
      setAdminNotes('');
    },
  });

  const handleEditClick = (feedback) => {
    setSelectedFeedback(feedback);
    setAdminNotes(feedback.admin_notes || '');
    setEditDialogOpen(true);
  };

  const handleSaveFeedback = () => {
    if (selectedFeedback) {
      updateMutation.mutate({
        id: selectedFeedback.id,
        updates: {
          status: selectedFeedback.status,
          priority: selectedFeedback.priority,
          admin_notes: adminNotes,
        },
      });
    }
  };

  const statusColors = {
    new: 'info',
    in_progress: 'warning',
    resolved: 'success',
    closed: 'default',
  };

  const priorityColors = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    urgent: 'error',
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
          User Feedback
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Feedback
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Feedback
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage user feedback and suggestions
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="" disabled hidden></option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              select
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="" disabled hidden></option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="suggestion">Suggestion</option>
              <option value="complaint">Complaint</option>
              <option value="compliment">Compliment</option>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Feedback Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No feedback found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((feedback) => (
                <TableRow key={feedback.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(feedback.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {feedback.name || feedback.user_email || 'Anonymous'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={feedback.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {feedback.subject}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {feedback.rating ? (
                      <Rating value={feedback.rating} readOnly size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={feedback.status}
                      color={statusColors[feedback.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={feedback.priority}
                      color={priorityColors[feedback.priority] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditClick(feedback)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedFeedback?.subject || 'Feedback Details'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                From:
              </Typography>
              <Typography variant="body1">
                {selectedFeedback?.name || selectedFeedback?.user_email || 'Anonymous'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Category:
              </Typography>
              <Chip label={selectedFeedback?.category} size="small" sx={{ mt: 0.5 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Message:
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {selectedFeedback?.message}
              </Typography>
            </Grid>
            {selectedFeedback?.rating && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Rating:
                </Typography>
                <Rating value={selectedFeedback.rating} readOnly sx={{ mt: 0.5 }} />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                select
                label="Status"
                value={selectedFeedback?.status || 'new'}
                onChange={(e) =>
                  setSelectedFeedback({ ...selectedFeedback, status: e.target.value })
                }
                SelectProps={{
                  native: true,
                }}
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                select
                label="Priority"
                value={selectedFeedback?.priority || 'medium'}
                onChange={(e) =>
                  setSelectedFeedback({ ...selectedFeedback, priority: e.target.value })
                }
                SelectProps={{
                  native: true,
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this feedback..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Close</Button>
          <Button
            onClick={handleSaveFeedback}
            variant="contained"
            disabled={updateMutation.isLoading}
          >
            {updateMutation.isLoading ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
