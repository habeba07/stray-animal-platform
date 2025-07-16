import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import api from '../../redux/api';

const TeamMessageDialog = ({ open, onClose, assignment }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/volunteers/rescue-assignments/send_team_message/', {
        report_id: assignment?.report_details?.id || assignment?.report?.id || assignment?.id,
        message: message.trim()
      });

      if (response.data.success) {
        setSuccess(true);
        setMessage('');
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending team message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!assignment) return null;

  // Extract animal type and location for display
  const animalType = assignment.report_details?.animal_type || 
                    assignment.opportunity_details?.title || 
                    'Animal';
  const location = assignment.report_details?.location_details || 
                  assignment.opportunity_details?.location || 
                  'Unknown location';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <MessageIcon sx={{ mr: 1 }} />
        Message Coordinators
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Send a message to rescue coordinators for guidance or status updates:
        </Typography>
        
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          📍 {animalType} - {location}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Message sent to team members!
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Message to Coordinators"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Request guidance, report complications, provide status updates..."
          disabled={isLoading || success}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSendMessage}
          variant="contained"
          disabled={isLoading || success || !message.trim()}
          startIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          {isLoading ? 'Sending...' : 'Send Message'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamMessageDialog;