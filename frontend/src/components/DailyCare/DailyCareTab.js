// components/DailyCare/DailyCareTab.js

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Restaurant as FeedingIcon,
  DirectionsRun as ExerciseIcon,
  ContentCut as GroomingIcon,
  Visibility as ObservationIcon,
  CleaningServices as CleaningIcon,
  Medication as MedicationIcon,
  Group as SocializationIcon,
  MoreHoriz as OtherIcon,
  Person as PersonIcon,
  Schedule as TimeIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../../redux/api';

const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  grey: '#f3e5ab',
  accent: '#ff8a65',
  background: '#fff8e1',
};

const CARE_TYPE_ICONS = {
  'FEEDING': <FeedingIcon />,
  'EXERCISE': <ExerciseIcon />,
  'GROOMING': <GroomingIcon />,
  'OBSERVATION': <ObservationIcon />,
  'CLEANING': <CleaningIcon />,
  'MEDICATION': <MedicationIcon />,
  'SOCIALIZATION': <SocializationIcon />,
  'OTHER': <OtherIcon />,
};

const CARE_TYPE_COLORS = {
  'FEEDING': '#4caf50',
  'EXERCISE': '#2196f3',
  'GROOMING': '#9c27b0',
  'OBSERVATION': '#ff9800',
  'CLEANING': '#607d8b',
  'MEDICATION': '#f44336',
  'SOCIALIZATION': '#e91e63',
  'OTHER': '#795548',
};

function DailyCareTab({ animalId, animal }) {
  const { user } = useSelector((state) => state.auth);
  const [careLogs, setCareLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    care_type: '',
    date_time: new Date().toISOString().slice(0, 16),
    duration_minutes: '',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    fetchCareLogs();
  }, [animalId]);

  const fetchCareLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/daily-care-logs/?animal=${animalId}`);
      setCareLogs(response.data.results || response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching care logs:', err);
      setError('Failed to load care logs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.care_type) {
      setError('Please select a care type');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const payload = {
        animal: animalId,
        care_type: formData.care_type,
        date_time: formData.date_time,
        duration_minutes: formData.duration_minutes || null,
        amount: formData.amount || '',
        notes: formData.notes || '',
      };

      await api.post('/daily-care-logs/', payload);
      
      setSuccess('Care activity logged successfully!');
      setFormData({
        care_type: '',
        date_time: new Date().toISOString().slice(0, 16),
        duration_minutes: '',
        amount: '',
        notes: '',
      });
      
      // Refresh care logs
      await fetchCareLogs();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error creating care log:', err);
      setError(err.response?.data?.detail || 'Failed to log care activity');
    } finally {
      setSubmitting(false);
    }
  };

  const getCareTypeColor = (careType) => {
    return CARE_TYPE_COLORS[careType] || customTheme.primary;
  };

  const getCareTypeIcon = (careType) => {
    return CARE_TYPE_ICONS[careType] || <OtherIcon />;
  };

  const getTodaysLogs = () => {
    const today = new Date().toDateString();
    return careLogs.filter(log => 
      new Date(log.date_time).toDateString() === today
    );
  };

  const getRecentLogs = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return careLogs.filter(log => 
      new Date(log.date_time) >= sevenDaysAgo
    );
  };

  if (!user || !['STAFF', 'SHELTER'].includes(user.user_type)) {
    return (
      <Alert severity="info">
        Daily care logging is only available for staff members.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Log New Care Activity */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: customTheme.background,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
          }}>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: customTheme.primary, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}>
              <AddIcon sx={{ mr: 1 }} />
              Log Daily Care Activity
            </Typography>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <FormControl fullWidth required>
                  <InputLabel>Care Type</InputLabel>
                  <Select
                    value={formData.care_type}
                    onChange={(e) => handleInputChange('care_type', e.target.value)}
                    label="Care Type"
                  >
                    <MenuItem value="FEEDING">🍖 Feeding</MenuItem>
                    <MenuItem value="EXERCISE">🚶 Exercise/Walk</MenuItem>
                    <MenuItem value="GROOMING">✂️ Grooming</MenuItem>
                    <MenuItem value="OBSERVATION">👀 Daily Observation</MenuItem>
                    <MenuItem value="CLEANING">🧹 Kennel/Area Cleaning</MenuItem>
                    <MenuItem value="MEDICATION">💊 Medication Administration</MenuItem>
                    <MenuItem value="SOCIALIZATION">👥 Socialization Activity</MenuItem>
                    <MenuItem value="OTHER">➕ Other Care Activity</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Date & Time"
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={(e) => handleInputChange('date_time', e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Duration (minutes)"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                      fullWidth
                      helperText="For exercise, grooming, etc."
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Amount"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      fullWidth
                      helperText="For feeding, medication, etc."
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  fullWidth
                  placeholder="Detailed notes about the care activity..."
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{
                    backgroundColor: customTheme.success,
                    '&:hover': { backgroundColor: '#388e3c' },
                    borderRadius: 2,
                  }}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Log Care Activity'}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>

        {/* Right Column - Care History */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            {/* Today's Care */}
            <Paper sx={{ 
              p: 3, 
              backgroundColor: customTheme.background,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
            }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                color: customTheme.primary, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}>
                <TimeIcon sx={{ mr: 1 }} />
                Today's Care ({getTodaysLogs().length} activities)
              </Typography>

              {getTodaysLogs().length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  No care activities logged today
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {getTodaysLogs().map((log) => (
                    <Card key={log.id} sx={{ 
                      backgroundColor: 'white',
                      border: `2px solid ${getCareTypeColor(log.care_type)}`,
                      borderRadius: 1,
                    }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ color: getCareTypeColor(log.care_type), mr: 1 }}>
                              {getCareTypeIcon(log.care_type)}
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {log.care_type_display}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(log.date_time).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                        
                        {(log.duration_minutes || log.amount) && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            {log.duration_minutes && (
                              <Chip 
                                label={`${log.duration_minutes} min`} 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                            {log.amount && (
                              <Chip 
                                label={log.amount} 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        )}
                        
                        {log.notes && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            "{log.notes}"
                          </Typography>
                        )}
                        
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                          By {log.staff_member_name}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Recent Care History */}
            <Paper sx={{ 
              p: 3, 
              backgroundColor: customTheme.background,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
            }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                color: customTheme.primary, 
                fontWeight: 600 
              }}>
                Recent Care History (Last 7 Days)
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : getRecentLogs().length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  No care activities in the last 7 days
                </Typography>
              ) : (
                <List dense>
                  {getRecentLogs().slice(0, 10).map((log, index) => (
                    <React.Fragment key={log.id}>
                      <ListItem>
                        <ListItemIcon sx={{ color: getCareTypeColor(log.care_type) }}>
                          {getCareTypeIcon(log.care_type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {log.care_type_display}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {formatDistanceToNow(new Date(log.date_time), { addSuffix: true })}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              {log.notes && (
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                  {log.notes.length > 50 ? `${log.notes.substring(0, 50)}...` : log.notes}
                                </Typography>
                              )}
                              <Typography variant="caption" color="textSecondary">
                                By {log.staff_member_name}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < getRecentLogs().slice(0, 10).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DailyCareTab;