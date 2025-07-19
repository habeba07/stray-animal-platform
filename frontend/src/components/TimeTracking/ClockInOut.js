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
  Avatar,
  Paper,
  Divider,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  PlayArrow as ClockInIcon,
  Stop as ClockOutIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  Today as TodayIcon,
  Assignment as NotesIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  WorkHistory as WorkHistoryIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
  warning: '#ff9800',
  error: '#f44336',
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

const clockTick = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const statusGlow = keyframes`
  0% { box-shadow: 0 0 5px ${alpha(customTheme.success, 0.5)}; }
  50% { box-shadow: 0 0 20px ${alpha(customTheme.success, 0.8)}, 0 0 30px ${alpha(customTheme.success, 0.5)}; }
  100% { box-shadow: 0 0 5px ${alpha(customTheme.success, 0.5)}; }
`;

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
      borderRadius: 4,
      background: `
        radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
      `,
      border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
      boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.15)}`,
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.08)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.08)} 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }
    }}>
      <CardContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ 
          p: 4, 
          pb: 2,
          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
          borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`,
          position: 'relative'
        }}>
          {/* Floating sparkles */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: '20%',
              animation: `${sparkle} 3s infinite`,
              animationDelay: '0s'
            }}
          >
            <StarIcon sx={{ color: customTheme.accent, fontSize: 16 }} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: '30%',
              animation: `${sparkle} 3s infinite`,
              animationDelay: '1s'
            }}
          >
            <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 12 }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: customTheme.primary,
                width: 48,
                height: 48,
                boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.3)}`,
                animation: `${clockTick} 60s linear infinite`
              }}
            >
              <ClockIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Time Tracking
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.7),
                  fontWeight: 500
                }}
              >
                Manage your work hours efficiently
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Loading Progress */}
        {loading && (
          <LinearProgress 
            sx={{ 
              height: 4,
              backgroundColor: alpha(customTheme.accent, 0.2),
              '& .MuiLinearProgress-bar': {
                backgroundColor: customTheme.accent,
                background: `linear-gradient(90deg, ${customTheme.accent}, ${customTheme.secondary})`
              }
            }}
          />
        )}

        {/* Message Alert */}
        {message && (
          <Fade in timeout={600}>
            <Alert 
              severity={message.includes('Successfully') ? 'success' : 'error'} 
              sx={{ 
                m: 3,
                mb: 2,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: message.includes('Successfully') 
                  ? alpha(customTheme.success, 0.1)
                  : alpha(customTheme.error, 0.1),
                border: `2px solid ${message.includes('Successfully') 
                  ? alpha(customTheme.success, 0.3)
                  : alpha(customTheme.error, 0.3)}`,
                '& .MuiAlert-icon': {
                  fontSize: '1.3rem'
                }
              }}
              onClose={() => setMessage('')}
            >
              {message}
            </Alert>
          </Fade>
        )}

        <Box sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Current Time & Status */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.primary, 0.08)} 0%, ${alpha(customTheme.primary, 0.03)} 100%)
                  `,
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Current Time Display */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 800,
                      mb: 1,
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      textShadow: `0 2px 8px ${alpha(customTheme.primary, 0.3)}`
                    }}
                  >
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}
                  >
                    <TodayIcon sx={{ fontSize: 18 }} />
                    {currentTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>

                {/* Status Indicator */}
                {shiftStatus?.is_clocked_in ? (
                  <Zoom in timeout={800}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        icon={<TimerIcon />}
                        label="CLOCKED IN" 
                        sx={{
                          backgroundColor: customTheme.success,
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '1rem',
                          height: 40,
                          px: 2,
                          mb: 3,
                          animation: `${statusGlow} 3s infinite`,
                          boxShadow: `0 4px 15px ${alpha(customTheme.success, 0.4)}`
                        }}
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: customTheme.primary,
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        Started: {formatTime(shiftStatus.clock_in_time)}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: customTheme.success,
                          fontWeight: 800,
                          fontFamily: 'monospace'
                        }}
                      >
                        {formatDuration(shiftStatus.duration_minutes)}
                      </Typography>
                    </Box>
                  </Zoom>
                ) : (
                  <Zoom in timeout={800}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip 
                        icon={<ScheduleIcon />}
                        label="CLOCKED OUT" 
                        sx={{
                          backgroundColor: alpha(customTheme.grey, 0.6),
                          color: customTheme.primary,
                          fontWeight: 800,
                          fontSize: '1rem',
                          height: 40,
                          px: 2,
                          mb: 3,
                          border: `2px solid ${alpha(customTheme.primary, 0.3)}`
                        }}
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: alpha(customTheme.primary, 0.8),
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                        Ready to start your shift
                      </Typography>
                    </Box>
                  </Zoom>
                )}
              </Paper>
            </Grid>

            {/* Actions & Notes */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.secondary, 0.08)} 0%, ${alpha(customTheme.secondary, 0.03)} 100%)
                  `,
                  border: `2px solid ${alpha(customTheme.secondary, 0.15)}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Notes Section */}
                <Box sx={{ mb: 3, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <NotesIcon sx={{ color: customTheme.secondary, fontSize: 20 }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600
                      }}
                    >
                      Add notes about your shift (optional)
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Fed all animals, cleaned kennels, assisted with adoption event"
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '& fieldset': {
                          borderColor: alpha(customTheme.secondary, 0.3),
                          borderWidth: 2,
                        },
                        '&:hover fieldset': {
                          borderColor: customTheme.secondary,
                          borderWidth: 2,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: customTheme.secondary,
                          borderWidth: 3,
                          boxShadow: `0 0 0 3px ${alpha(customTheme.secondary, 0.1)}`,
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        color: customTheme.primary,
                        fontWeight: 500,
                      },
                      '& .MuiInputBase-input::placeholder': {
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        color: alpha(customTheme.secondary, 0.7)
                      }
                    }}
                  />
                </Box>

                {/* Action Button */}
                <Slide direction="up" in timeout={1000}>
                  <Box>
                    {shiftStatus?.is_clocked_in ? (
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<ClockOutIcon />}
                        onClick={handleClockOut}
                        disabled={loading}
                        sx={{ 
                          py: 2,
                          borderRadius: 3,
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          background: `linear-gradient(45deg, ${customTheme.error} 30%, #d32f2f 90%)`,
                          color: '#ffffff',
                          textTransform: 'none',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          boxShadow: `0 8px 25px ${alpha(customTheme.error, 0.4)}`,
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
                            background: `linear-gradient(45deg, #d32f2f 30%, ${customTheme.error} 90%)`,
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.error, 0.5)}`,
                            '&::before': {
                              left: '100%'
                            }
                          },
                          '&:disabled': {
                            background: `linear-gradient(45deg, ${alpha(customTheme.error, 0.5)} 30%, ${alpha('#d32f2f', 0.5)} 90%)`,
                            color: alpha('#ffffff', 0.6)
                          }
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
                          py: 2,
                          borderRadius: 3,
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          background: `linear-gradient(45deg, ${customTheme.success} 30%, #388e3c 90%)`,
                          color: '#ffffff',
                          textTransform: 'none',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`,
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
                            background: `linear-gradient(45deg, #388e3c 30%, ${customTheme.success} 90%)`,
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.5)}`,
                            '&::before': {
                              left: '100%'
                            }
                          },
                          '&:disabled': {
                            background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.5)} 30%, ${alpha('#388e3c', 0.5)} 90%)`,
                            color: alpha('#ffffff', 0.6)
                          }
                        }}
                      >
                        Clock In
                      </Button>
                    )}
                  </Box>
                </Slide>
              </Paper>
            </Grid>
          </Grid>

          {/* Weekly Hours Summary */}
          {weeklyHours && (
            <Fade in timeout={1200}>
              <Paper
                elevation={0}
                sx={{ 
                  mt: 4, 
                  p: 4,
                  borderRadius: 4,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.accent, 0.08)} 0%, ${alpha(customTheme.accent, 0.03)} 100%)
                  `,
                  border: `2px solid ${alpha(customTheme.accent, 0.15)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${customTheme.accent}, ${customTheme.secondary}, ${customTheme.accent})`,
                    backgroundSize: '200% 100%',
                    animation: `${shimmer} 3s infinite linear`
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: customTheme.accent,
                      width: 40,
                      height: 40,
                      boxShadow: `0 4px 15px ${alpha(customTheme.accent, 0.3)}`
                    }}
                  >
                    <WorkHistoryIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 20 }} />
                      Weekly Progress
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.7),
                        fontWeight: 500
                      }}
                    >
                      Your time tracking summary
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: alpha(customTheme.accent, 0.2), borderWidth: 1 }} />

                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          color: customTheme.accent,
                          fontWeight: 800,
                          mb: 1,
                          fontFamily: 'monospace'
                        }}
                      >
                        {weeklyHours.total_hours}h
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: alpha(customTheme.primary, 0.8),
                          fontWeight: 600
                        }}
                      >
                        This Week
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ScheduleIcon sx={{ color: customTheme.accent, fontSize: 24 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: customTheme.primary,
                            fontWeight: 600,
                            mb: 1
                          }}
                        >
                          Weekly Goal: 40 hours
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (parseFloat(weeklyHours.total_hours) / 40) * 100)}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: alpha(customTheme.grey, 0.4),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              background: `linear-gradient(90deg, ${customTheme.accent}, ${customTheme.secondary})`
                            }
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: alpha(customTheme.primary, 0.7),
                            fontWeight: 500,
                            mt: 0.5,
                            display: 'block'
                          }}
                        >
                          {Math.round((parseFloat(weeklyHours.total_hours) / 40) * 100)}% complete
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default ClockInOut;