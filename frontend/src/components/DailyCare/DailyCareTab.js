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
  Fade,
  Slide,
  Zoom,
  Avatar,
  alpha,
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
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { keyframes } from '@mui/system';
import api from '../../redux/api';

const customTheme = {
  primary: '#8d6e63',     // Warm Brown
  secondary: '#81c784',   // Soft Green
  success: '#4caf50',     // Fresh Green
  warning: '#ff9800',
  error: '#f44336',
  grey: '#f3e5ab',        // Warm Cream
  accent: '#ff8a65',      // Gentle Orange
  background: '#fff8e1',  // Soft Cream
};

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha(customTheme.accent, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0)}; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

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

  // Enhanced field styles
  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      minHeight: 56,
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: alpha(customTheme.primary, 0.3),
        borderWidth: 2,
      },
      '&:hover fieldset': {
        borderColor: customTheme.secondary,
        borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: customTheme.primary,
        borderWidth: 3,
        boxShadow: `0 0 0 3px ${alpha(customTheme.primary, 0.1)}`,
      },
    },
    '& .MuiInputLabel-root': {
      color: customTheme.primary,
      fontWeight: 600,
      fontSize: '1rem',
      '&.Mui-focused': {
        color: customTheme.primary,
      },
      '&.MuiInputLabel-shrink': {
        fontSize: '0.85rem',
        transform: 'translate(14px, -9px) scale(0.85)',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: customTheme.primary,
      fontWeight: 500,
      padding: '16px 14px',
    }
  };

  const selectStyles = {
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: customTheme.primary,
    fontWeight: 500,
    transition: 'all 0.3s ease',
    minHeight: 65,
    '& .MuiSelect-select': {
      padding: '18px 14px',
      minHeight: '24px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(customTheme.primary, 0.3),
      borderWidth: 2,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: customTheme.secondary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: customTheme.primary,
      borderWidth: 3,
      boxShadow: `0 0 0 3px ${alpha(customTheme.primary, 0.1)}`,
    },
  };

  if (!user || !['STAFF', 'SHELTER'].includes(user.user_type)) {
    return (
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 6,
            background: `
              radial-gradient(circle at center, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
              linear-gradient(135deg, ${alpha(customTheme.accent, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
            `,
            border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
            position: 'relative'
          }}
        >
          <Avatar
            sx={{
              bgcolor: customTheme.accent,
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`,
            }}
          >
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" sx={{ color: customTheme.accent, fontWeight: 700, mb: 2 }}>
            Staff Access Required
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 500 }}>
            Daily care logging is only available for staff members.
          </Typography>
        </Paper>
      </Fade>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.15)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.15)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.2)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
      p: 3
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '8%',
          left: '5%',
          animation: `${float} 10s ease-in-out infinite`,
          animationDelay: '0s',
          opacity: 0.6
        }}
      >
        <PetsIcon sx={{ fontSize: 35, color: customTheme.secondary, filter: 'blur(1px)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '8%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.4
        }}
      >
        <FavoriteIcon sx={{ fontSize: 45, color: customTheme.accent, transform: 'rotate(25deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          animation: `${float} 14s ease-in-out infinite`,
          animationDelay: '4s',
          opacity: 0.5
        }}
      >
        <StarIcon sx={{ fontSize: 30, color: customTheme.primary, transform: 'rotate(-15deg)' }} />
      </Box>

      {/* Header Section */}
      <Fade in timeout={800}>
        <Box sx={{ textAlign: 'center', mb: 5, position: 'relative', zIndex: 1 }}>
          {/* Floating sparkles */}
          <Box
            sx={{
              position: 'absolute',
              top: -15,
              left: '35%',
              animation: `${sparkle} 3s infinite`,
              animationDelay: '0s'
            }}
          >
            <StarIcon sx={{ color: customTheme.accent, fontSize: 18 }} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: '30%',
              animation: `${sparkle} 3s infinite`,
              animationDelay: '1.5s'
            }}
          >
            <StarIcon sx={{ color: customTheme.secondary, fontSize: 14 }} />
          </Box>
          
          <Slide direction="down" in timeout={1000}>
            <Avatar
              sx={{
                bgcolor: customTheme.primary,
                width: 70,
                height: 70,
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                animation: `${pulse} 3s infinite`
              }}
            >
              <TimeIcon sx={{ fontSize: 35 }} />
            </Avatar>
          </Slide>
          
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 800,
              background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${gradientShift} 4s ease infinite`,
              mb: 2,
              textShadow: '0 4px 8px rgba(0,0,0,0.1)',
              letterSpacing: '-0.02em'
            }}
          >
            Daily Care Management
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: alpha(customTheme.primary, 0.8),
              fontWeight: 400,
              lineHeight: 1.6,
              animation: `${slideInUp} 1s ease-out 0.3s both`
            }}
          >
            Track and monitor daily care activities for {animal?.name || 'this animal'}
          </Typography>
        </Box>
      </Fade>

      {/* Success/Error Messages */}
      {success && (
        <Slide direction="down" in timeout={600}>
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              fontSize: '1.1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: `2px solid ${customTheme.success}`,
              backdropFilter: 'blur(10px)',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem',
              }
            }} 
            onClose={() => setSuccess('')}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {success}
            </Typography>
          </Alert>
        </Slide>
      )}
      
      {error && (
        <Slide direction="down" in timeout={600}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              fontSize: '1.1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: `2px solid ${customTheme.error}`,
              backdropFilter: 'blur(10px)',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem',
              }
            }} 
            onClose={() => setError('')}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {error}
            </Typography>
          </Alert>
        </Slide>
      )}

      <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Left Column - Log New Care Activity */}
        <Grid item xs={12} lg={6}>
          <Slide direction="right" in timeout={1000}>
            <Card
              sx={{
                borderRadius: 6,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 35px 60px ${alpha(customTheme.primary, 0.2)}`,
                  border: `3px solid ${alpha(customTheme.primary, 0.3)}`,
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: customTheme.success,
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      mb: 2,
                      boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`,
                    }}
                  >
                    <AddIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ 
                    color: customTheme.primary, 
                    fontWeight: 700,
                    mb: 1
                  }}>
                    Log Care Activity
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.7),
                    fontWeight: 500
                  }}>
                    Record daily care and monitoring activities
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <FormControl fullWidth required>
                      <InputLabel
                        sx={{
                          color: customTheme.primary,
                          fontWeight: 600,
                          '&.Mui-focused': { color: customTheme.primary },
                        }}
                      >
                        Care Type
                      </InputLabel>
                      <Select
                        value={formData.care_type}
                        onChange={(e) => handleInputChange('care_type', e.target.value)}
                        label="Care Type"
                        sx={selectStyles}
                      >
                        <MenuItem value="FEEDING">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FeedingIcon sx={{ color: CARE_TYPE_COLORS.FEEDING }} />
                            Feeding
                          </Box>
                        </MenuItem>
                        <MenuItem value="EXERCISE">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ExerciseIcon sx={{ color: CARE_TYPE_COLORS.EXERCISE }} />
                            Exercise/Walk
                          </Box>
                        </MenuItem>
                        <MenuItem value="GROOMING">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroomingIcon sx={{ color: CARE_TYPE_COLORS.GROOMING }} />
                            Grooming
                          </Box>
                        </MenuItem>
                        <MenuItem value="OBSERVATION">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ObservationIcon sx={{ color: CARE_TYPE_COLORS.OBSERVATION }} />
                            Daily Observation
                          </Box>
                        </MenuItem>
                        <MenuItem value="CLEANING">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CleaningIcon sx={{ color: CARE_TYPE_COLORS.CLEANING }} />
                            Kennel/Area Cleaning
                          </Box>
                        </MenuItem>
                        <MenuItem value="MEDICATION">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MedicationIcon sx={{ color: CARE_TYPE_COLORS.MEDICATION }} />
                            Medication Administration
                          </Box>
                        </MenuItem>
                        <MenuItem value="SOCIALIZATION">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SocializationIcon sx={{ color: CARE_TYPE_COLORS.SOCIALIZATION }} />
                            Socialization Activity
                          </Box>
                        </MenuItem>
                        <MenuItem value="OTHER">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <OtherIcon sx={{ color: CARE_TYPE_COLORS.OTHER }} />
                            Other Care Activity
                          </Box>
                        </MenuItem>
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
                      sx={fieldStyles}
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
                          sx={{
                            ...fieldStyles,
                            '& .MuiFormHelperText-root': {
                              color: alpha(customTheme.primary, 0.7),
                              fontWeight: 500
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Amount"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          fullWidth
                          helperText="For feeding, medication, etc."
                          sx={{
                            ...fieldStyles,
                            '& .MuiFormHelperText-root': {
                              color: alpha(customTheme.primary, 0.7),
                              fontWeight: 500
                            }
                          }}
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
                      sx={fieldStyles}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                      sx={{
                        py: 2.5,
                        borderRadius: 4,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        background: submitting ? 
                          `linear-gradient(45deg, ${alpha(customTheme.success, 0.3)} 30%, ${alpha(customTheme.success, 0.2)} 90%)` :
                          `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                        boxShadow: !submitting ? 
                          `0 8px 30px ${alpha(customTheme.success, 0.4)}` : 
                          'none',
                        color: '#ffffff',
                        textTransform: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                          transition: 'left 0.6s ease',
                        },
                        '&:hover:not(:disabled)': {
                          background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                          transform: 'translateY(-3px)',
                          boxShadow: `0 12px 40px ${alpha(customTheme.success, 0.5)}`,
                          '&::before': {
                            left: '100%'
                          }
                        },
                        '&:disabled': {
                          color: alpha('#ffffff', 0.6),
                        }
                      }}
                    >
                      {submitting ? 'Logging Activity...' : 'Log Care Activity'}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Right Column - Care History */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            {/* Today's Care */}
            <Slide direction="left" in timeout={1200}>
              <Card
                sx={{
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.secondary, 0.15)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.secondary, 0.2)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.secondary,
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`,
                      }}
                    >
                      <TimeIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 700,
                      mb: 1
                    }}>
                      Today's Care
                    </Typography>
                    <Chip
                      label={`${getTodaysLogs().length} activities`}
                      sx={{
                        backgroundColor: alpha(customTheme.secondary, 0.15),
                        color: customTheme.secondary,
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    />
                  </Box>

                  {getTodaysLogs().length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.grey, 0.1)} 100%)`,
                        border: `2px dashed ${alpha(customTheme.primary, 0.3)}`
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 50, color: alpha(customTheme.primary, 0.4), mb: 2 }} />
                      <Typography variant="body1" sx={{ 
                        color: alpha(customTheme.primary, 0.7), 
                        fontStyle: 'italic',
                        fontWeight: 500
                      }}>
                        No care activities logged today
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {getTodaysLogs().map((log, index) => (
                        <Zoom in timeout={300 * (index + 1)} key={log.id}>
                          <Card sx={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            border: `2px solid ${getCareTypeColor(log.care_type)}`,
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${alpha(getCareTypeColor(log.care_type), 0.3)}`
                            }
                          }}>
                            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ 
                                    bgcolor: getCareTypeColor(log.care_type), 
                                    width: 40, 
                                    height: 40 
                                  }}>
                                    {React.cloneElement(getCareTypeIcon(log.care_type), { 
                                      sx: { fontSize: 20, color: '#ffffff' } 
                                    })}
                                  </Avatar>
                                  <Typography variant="h6" sx={{ fontWeight: 600, color: customTheme.primary }}>
                                    {log.care_type_display}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={new Date(log.date_time).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(getCareTypeColor(log.care_type), 0.1),
                                    color: getCareTypeColor(log.care_type),
                                    fontWeight: 600
                                  }}
                                />
                              </Box>
                              
                              {(log.duration_minutes || log.amount) && (
                                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                  {log.duration_minutes && (
                                    <Chip 
                                      label={`${log.duration_minutes} min`} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{
                                        borderColor: getCareTypeColor(log.care_type),
                                        color: getCareTypeColor(log.care_type),
                                        fontWeight: 500
                                      }}
                                    />
                                  )}
                                  {log.amount && (
                                    <Chip 
                                      label={log.amount} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{
                                        borderColor: getCareTypeColor(log.care_type),
                                        color: getCareTypeColor(log.care_type),
                                        fontWeight: 500
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                              
                              {log.notes && (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 2,
                                    backgroundColor: alpha(getCareTypeColor(log.care_type), 0.05),
                                    border: `1px solid ${alpha(getCareTypeColor(log.care_type), 0.2)}`
                                  }}
                                >
                                  <Typography variant="body2" sx={{ 
                                    fontStyle: 'italic', 
                                    color: customTheme.primary,
                                    fontWeight: 500
                                  }}>
                                    "{log.notes}"
                                  </Typography>
                                </Paper>
                              )}
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon sx={{ fontSize: 16, color: alpha(customTheme.primary, 0.6) }} />
                                <Typography variant="caption" sx={{ 
                                  color: alpha(customTheme.primary, 0.6),
                                  fontWeight: 500
                                }}>
                                  By {log.staff_member_name}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Zoom>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Slide>

            {/* Recent Care History */}
            <Slide direction="left" in timeout={1400}>
              <Card
                sx={{
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.accent, 0.15)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.accent, 0.2)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.accent,
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`,
                      }}
                    >
                      <TrendingIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 700
                    }}>
                      Recent History (7 Days)
                    </Typography>
                  </Box>

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress sx={{ color: customTheme.accent }} size={40} />
                    </Box>
                  ) : getRecentLogs().length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.grey, 0.1)} 100%)`,
                        border: `2px dashed ${alpha(customTheme.primary, 0.3)}`
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 50, color: alpha(customTheme.primary, 0.4), mb: 2 }} />
                      <Typography variant="body1" sx={{ 
                        color: alpha(customTheme.primary, 0.7), 
                        fontStyle: 'italic',
                        fontWeight: 500
                      }}>
                        No care activities in the last 7 days
                      </Typography>
                    </Paper>
                  ) : (
                    <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {getRecentLogs().slice(0, 10).map((log, index) => (
                        <React.Fragment key={log.id}>
                          <Fade in timeout={200 * (index + 1)}>
                            <ListItem
                              sx={{
                                borderRadius: 2,
                                mb: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: alpha(getCareTypeColor(log.care_type), 0.08),
                                  transform: 'translateX(5px)'
                                }
                              }}
                            >
                              <ListItemIcon sx={{ 
                                color: getCareTypeColor(log.care_type),
                                minWidth: 40
                              }}>
                                {getCareTypeIcon(log.care_type)}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                                      {log.care_type_display}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: alpha(customTheme.primary, 0.6),
                                      fontWeight: 500
                                    }}>
                                      {formatDistanceToNow(new Date(log.date_time), { addSuffix: true })}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    {log.notes && (
                                      <Typography variant="caption" sx={{ 
                                        display: 'block', 
                                        color: alpha(customTheme.primary, 0.7),
                                        fontWeight: 500,
                                        mb: 0.5
                                      }}>
                                        {log.notes.length > 50 ? `${log.notes.substring(0, 50)}...` : log.notes}
                                      </Typography>
                                    )}
                                    <Typography variant="caption" sx={{ 
                                      color: alpha(customTheme.primary, 0.5),
                                      fontWeight: 500
                                    }}>
                                      By {log.staff_member_name}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          </Fade>
                          {index < getRecentLogs().slice(0, 10).length - 1 && (
                            <Divider sx={{ 
                              backgroundColor: alpha(customTheme.primary, 0.1),
                              height: 1,
                              mx: 2
                            }} />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Slide>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DailyCareTab;