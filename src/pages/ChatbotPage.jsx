import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { chatbotAPI } from '../utils/api';

export default function ChatbotPage() {
  const queryClient = useQueryClient();
  const [newQuestion, setNewQuestion] = useState('');
  const [newResponse, setNewResponse] = useState({ keyword: '', response: '' });

  const { data: responsesData, isLoading: responsesLoading } = useQuery({
    queryKey: ['chatbot-responses'],
    queryFn: () => chatbotAPI.getResponses(),
    retry: false,
  });

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['chatbot-questions'],
    queryFn: () => chatbotAPI.getSuggestedQuestions(),
    retry: false,
  });

  const updateResponsesMutation = useMutation({
    mutationFn: (data) => chatbotAPI.updateResponses(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['chatbot-responses']);
    },
  });

  const updateQuestionsMutation = useMutation({
    mutationFn: (data) => chatbotAPI.updateSuggestedQuestions(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['chatbot-questions']);
    },
  });

  const responses = responsesData?.data?.data || [];
  const questions = questionsData?.data?.data || [];

  const handleAddResponse = () => {
    if (newResponse.keyword && newResponse.response) {
      const updated = [...responses, newResponse];
      updateResponsesMutation.mutate(updated);
      setNewResponse({ keyword: '', response: '' });
    }
  };

  const handleDeleteResponse = (index) => {
    const updated = responses.filter((_, i) => i !== index);
    updateResponsesMutation.mutate(updated);
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      const updated = [...questions, newQuestion];
      updateQuestionsMutation.mutate(updated);
      setNewQuestion('');
    }
  };

  const handleDeleteQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    updateQuestionsMutation.mutate(updated);
  };

  if (responsesLoading || questionsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Chatbot Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage chatbot responses and suggested questions
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Keyword Responses
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Define keyword-based responses for the chatbot
            </Typography>

            {responsesData?.error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Chatbot responses API may not be available. This is a demo interface.
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Keyword"
                value={newResponse.keyword}
                onChange={(e) => setNewResponse({ ...newResponse, keyword: e.target.value })}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="Response"
                multiline
                rows={2}
                value={newResponse.response}
                onChange={(e) => setNewResponse({ ...newResponse, response: e.target.value })}
                margin="normal"
                size="small"
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddResponse}
                disabled={!newResponse.keyword || !newResponse.response}
                sx={{ mt: 1 }}
              >
                Add Response
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List>
              {responses.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No responses configured. Add one above.
                </Typography>
              ) : (
                responses.map((item, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteResponse(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item.keyword}
                      secondary={item.response}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Suggested Questions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Questions shown to users as suggestions in the chatbot
            </Typography>

            {questionsData?.error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Suggested questions API may not be available. This is a demo interface.
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                margin="normal"
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddQuestion();
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
                disabled={!newQuestion.trim()}
                sx={{ mt: 1 }}
              >
                Add Question
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List>
              {questions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No suggested questions. Add one above.
                </Typography>
              ) : (
                questions.map((question, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteQuestion(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={question} />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

