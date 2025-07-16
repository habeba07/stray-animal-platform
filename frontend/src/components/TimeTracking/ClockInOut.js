import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  TextField,
  Chip,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  PlayArrow as ClockInIcon,
  Stop as ClockOutIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  background: '#fff8e1',
};

function ClockInOut() {
  const { user } = useSelector((state) => state.auth);
  const [shiftStatus, setShiftStatus] = useState(null);
  const [weeklyHours, setWeeklyHours] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchShiftStatus();
    fetchWeeklyHours();
  }, []);

  const fetchShiftStatus = async () => {
    try {
      const response = await api.get('/users/shift_status/');
      setShiftStatus(response.data);
    } catch (error) {
      console.error('Error fetching shift status:', error);
    }
  };

  const fetchWeeklyHours = async () => {
    try {
      const response = await api.get('/users/weekly_hours/'); 
      setWeeklyHours(response.data);
    } catch (error) {
      console.error('Error fetching weekly hours:', error);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
     await api.post('/users/clock_in/', { notes });
      setMessage('Successfully clocked in!');
      setNotes('');
      await fetchShiftStatus();
      await fetchWeeklyHours();
    } catch (error) {
      setMessage(error.response?.data?.errors?.non_field_errors?.[0] || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await api.post('/users/clock_out/', { notes });
      setMessage('Successfully clocked out!');
      setNotes('');
      await fetchShiftStatus();
      await fetchWeeklyHours();
    } catch (error) {
      setMessage(error.response?.data?.errors?.non_field_errors?.[0] || 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!user || !['STAFF', 'SHELTER'].includes(user.user_type)) {
    return null;
  }

  return (
    <Card sx={{ 
      borderRadius: 3, 
      backgroundColor: customTheme.background,
      boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' 
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ClockIcon sx={{ color: customTheme.primary, mr: 2 }} />
          <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
            Time Tracking
          </Typography>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {message && (
          <Alert 
            severity={message.includes('Successfully') ? 'success' : 'error'} 
            sx={{ mb: 2 }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ color: customTheme.primary, mb: 1 }}>
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </Typography>
            </Box>

            {shiftStatus?.is_clocked_in ? (
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label="CLOCKED IN" 
                  color="success" 
                  size="large"
                  sx={{ mb: 2, fontWeight: 'bold' }}
                />
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Started: {formatTime(shiftStatus.clock_in_time)}
                </Typography>
                <Typography variant="h6" sx={{ color: customTheme.success }}>
                  {formatDuration(shiftStatus.duration_minutes)}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label="CLOCKED OUT" 
                  color="default" 
                  size="large"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body1" color="textSecondary">
                  Ready to start your shift
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your shift..."
                variant="outlined"
                size="small"
              />
            </Box>

            {shiftStatus?.is_clocked_in ? (
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ClockOutIcon />}
                onClick={handleClockOut}
                disabled={loading}
                sx={{ 
                  backgroundColor: customTheme.error,
                  '&:hover': { backgroundColor: '#d32f2f' },
                  mb: 2
                }}
              >
                Clock Out
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ClockInIcon />}
                onClick={handleClockIn}
                disabled={loading}
                sx={{ 
                  backgroundColor: customTheme.success,
                  '&:hover': { backgroundColor: '#388e3c' },
                  mb: 2
                }}
              >
                Clock In
              </Button>
            )}

            {weeklyHours && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(141, 110, 99, 0.1)', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon sx={{ mr: 1, fontSize: 18 }} />
                  This Week: {weeklyHours.total_hours}h
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ClockInOut;