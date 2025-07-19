// Create: frontend/src/pages/VolunteerDashboard.js - Main landing page for volunteers

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  CircularProgress,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Divider,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  Emergency as EmergencyIcon,
  School as TrainingIcon,
  Assignment as AssignmentIcon,
  TrendingUp as StatsIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Timer as TimerIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  EmojiEvents as AchievementIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Speed as SpeedIcon,
  Group as TeamIcon,
  Pets as AnimalIcon,
  Close as CloseIcon,
  AutoAwesome as SparkleIcon,
  Timeline as TimelineIcon,
  Favorite as FavoriteIcon,
  LocalFireDepartment as FireIcon,
  Security as ShieldIcon,
  AccessTime as ClockIcon,
  TrendingDown as TrendingDownIcon,
  MedicalServices as MedicalServicesIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format, formatDistanceToNow } from 'date-fns';
import { keyframes } from '@mui/system';
import api from '../redux/api';

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
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.error, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha(customTheme.error, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.error, 0)}; }
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

const emergencyFlash = keyframes`
  0% { background-color: ${alpha(customTheme.error, 0.1)}; }
  50% { background-color: ${alpha(customTheme.error, 0.3)}; }
  100% { background-color: ${alpha(customTheme.error, 0.1)}; }
`;

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [emergencyRescues, setEmergencyRescues] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [trainingProgress, setTrainingProgress] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  
  // UI states
  const [selectedRescue, setSelectedRescue] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user?.user_type !== 'VOLUNTEER') {
      navigate('/');
      return;
    }
    
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds for emergency updates
    const interval = setInterval(() => {
      fetchEmergencyRescues();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEmergencyRescues(),
        fetchMyAssignments(),
        fetchTrainingProgress(),
        fetchRecentActivity(),
        fetchUserStats(),
        fetchVolunteerProfile()
      ]);
      
      // Show welcome dialog for new users
      checkWelcomeStatus();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyRescues = async () => {
    try {
      const response = await api.get('/volunteers/rescue-assignments/available_rescues/');
      // Filter for high priority rescues for dashboard
      const emergencyOnly = (response.data || []).filter(rescue => 
        rescue.urgency === 'EMERGENCY' || rescue.urgency === 'HIGH'
      );
      setEmergencyRescues(emergencyOnly.slice(0, 3)); // Show top 3
    } catch (error) {
      console.error('Error fetching emergency rescues:', error);
    }
  };

  const fetchMyAssignments = async () => {
    try {
      const response = await api.get('/volunteers/rescue-assignments/my_rescue_assignments/');
      setMyAssignments(response.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchTrainingProgress = async () => {
    try {
      const response = await api.get('/volunteers/learning-progress/my_progress/');
      setTrainingProgress(response.data?.slice(0, 4) || []);
    } catch (error) {
      console.error('Error fetching training progress:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/activities/activities/', {
        params: { limit: 10, user: user.id }
      });
      setRecentActivity(response.data?.results?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/volunteers/rescue-assignments/activity_dashboard/');
      setUserStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchVolunteerProfile = async () => {
    try {
      const response = await api.get('/volunteer-profiles/my_profile/');
      setVolunteerProfile(response.data);
    } catch (error) {
      console.error('Error fetching volunteer profile:', error);
    }
  };

  const checkWelcomeStatus = () => {
    // Show welcome if user is new (no rescues completed and no training progress)
    const isNewUser = (!userStats?.user_profile?.total_rescues_completed || userStats.user_profile.total_rescues_completed === 0) &&
                      (!trainingProgress?.length || trainingProgress.length === 0);
    
    if (isNewUser && !localStorage.getItem('volunteer_welcome_shown')) {
      setShowWelcome(true);
      localStorage.setItem('volunteer_welcome_shown', 'true');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleAcceptRescue = async (rescue) => {
    try {
      await api.post('/volunteers/rescue-assignments/accept_rescue/', {
        report_id: rescue.id,
        assignment_type: 'PRIMARY',
        volunteer_notes: 'Accepting emergency rescue from dashboard'
      });
      
      // Refresh data
      await fetchDashboardData();
      setSelectedRescue(null);
      
      // Navigate to volunteer hub
      navigate('/volunteer/hub');
    } catch (error) {
      console.error('Error accepting rescue:', error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toUpperCase()) {
      case 'EMERGENCY': return customTheme.error;
      case 'HIGH': return customTheme.accent;
      default: return customTheme.secondary;
    }
  };

  const formatTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const calculateTrainingCompletion = () => {
    if (!trainingProgress.length) return 0;
    const completed = trainingProgress.filter(p => p.status === 'COMPLETED' || p.status === 'PASSED').length;
    return Math.round((completed / trainingProgress.length) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.error, 0.3)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.3)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            animation: `${float} 6s ease-in-out infinite`,
            animationDelay: '0s'
          }}
        >
          <EmergencyIcon sx={{ fontSize: 60, color: alpha(customTheme.error, 0.1), transform: 'rotate(15deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '2s'
          }}
        >
          <ShieldIcon sx={{ fontSize: 40, color: alpha(customTheme.secondary, 0.15), transform: 'rotate(-20deg)' }} />
        </Box>
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${customTheme.error}, ${customTheme.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                animation: `${pulse} 2s infinite`,
                boxShadow: `0 0 30px ${alpha(customTheme.error, 0.4)}`
              }}
            >
              <EmergencyIcon sx={{ color: '#ffffff', fontSize: 40 }} />
            </Box>
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              color: customTheme.error, 
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(45deg, ${customTheme.error}, ${customTheme.accent})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Loading Emergency Operations
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Preparing rescue operations dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.error, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          animation: `${float} 10s ease-in-out infinite`,
          animationDelay: '0s',
          opacity: 0.6
        }}
      >
        <StarIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.4
        }}
      >
        <EmergencyIcon sx={{ fontSize: 50, color: customTheme.error, transform: 'rotate(25deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          animation: `${float} 14s ease-in-out infinite`,
          animationDelay: '4s',
          opacity: 0.5
        }}
      >
        <AnimalIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ pt: 4, pb: 4, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header */}
        <Fade in timeout={1000}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            position: 'relative'
          }}>
            {/* Floating sparkles */}
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                left: '20%',
                animation: `${sparkle} 3s infinite`,
                animationDelay: '0s'
              }}
            >
              <StarIcon sx={{ color: customTheme.accent, fontSize: 16 }} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: '30%',
                animation: `${sparkle} 3s infinite`,
                animationDelay: '1s'
              }}
            >
              <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 12 }} />
            </Box>

            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${customTheme.error} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 4s ease infinite`,
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: customTheme.error,
                    width: 56,
                    height: 56,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  <EmergencyIcon sx={{ fontSize: 32 }} />
                </Avatar>
                Emergency Rescue Operations
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 500,
                  mt: 1,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                Welcome back, {user?.username}! Ready to save lives today?
              </Typography>
            </Box>
            
            <Fab
              color="primary"
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ 
                position: 'relative',
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                width: 64,
                height: 64,
                boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.6)}`
                }
              }}
            >
              {refreshing ? (
                <CircularProgress size={28} sx={{ color: '#ffffff' }} />
              ) : (
                <RefreshIcon sx={{ fontSize: 28 }} />
              )}
            </Fab>
          </Box>
        </Fade>

        {/* Quick Stats Row */}
        {userStats && (
          <Slide direction="up" in timeout={1000}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={3}>
                <Card 
                  sx={{ 
                    textAlign: 'center',
                    borderRadius: 4,
                    background: `
                      linear-gradient(135deg, ${alpha(customTheme.secondary, 0.15)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)
                    `,
                    border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.05)',
                      boxShadow: `0 20px 40px ${alpha(customTheme.secondary, 0.3)}`,
                      border: `3px solid ${alpha(customTheme.secondary, 0.4)}`
                    }
                  }}
                >
                  <CardContent sx={{ py: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.secondary,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 4px 15px ${alpha(customTheme.secondary, 0.3)}`
                      }}
                    >
                      <StarIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800, 
                        color: customTheme.secondary,
                        mb: 1,
                        textShadow: `0 2px 8px ${alpha(customTheme.secondary, 0.3)}`
                      }}
                    >
                      {userStats.total_points || 0}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.8),
                        fontWeight: 600
                      }}
                    >
                      Total Points
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card 
                  sx={{ 
                    textAlign: 'center',
                    borderRadius: 4,
                    background: `
                      linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.success, 0.05)} 100%)
                    `,
                    border: `3px solid ${alpha(customTheme.success, 0.2)}`,
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.05)',
                      boxShadow: `0 20px 40px ${alpha(customTheme.success, 0.3)}`,
                      border: `3px solid ${alpha(customTheme.success, 0.4)}`
                    }
                  }}
                >
                  <CardContent sx={{ py: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.success,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 4px 15px ${alpha(customTheme.success, 0.3)}`
                      }}
                    >
                      <FavoriteIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800, 
                        color: customTheme.success,
                        mb: 1,
                        textShadow: `0 2px 8px ${alpha(customTheme.success, 0.3)}`
                      }}
                    >
                      {userStats.user_profile?.total_rescues_completed || 0}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.8),
                        fontWeight: 600
                      }}
                    >
                      Lives Saved
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card 
                  sx={{ 
                    textAlign: 'center',
                    borderRadius: 4,
                    background: `
                      linear-gradient(135deg, ${alpha(customTheme.accent, 0.15)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)
                    `,
                    border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.05)',
                      boxShadow: `0 20px 40px ${alpha(customTheme.accent, 0.3)}`,
                      border: `3px solid ${alpha(customTheme.accent, 0.4)}`
                    }
                  }}
                >
                  <CardContent sx={{ py: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.accent,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 4px 15px ${alpha(customTheme.accent, 0.3)}`
                      }}
                    >
                      <SpeedIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800, 
                        color: customTheme.accent,
                        mb: 1,
                        textShadow: `0 2px 8px ${alpha(customTheme.accent, 0.3)}`
                      }}
                    >
                      {userStats.user_profile?.average_response_time_minutes ? 
                        `${Math.round(userStats.user_profile.average_response_time_minutes)}m` : 'N/A'
                      }
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.8),
                        fontWeight: 600
                      }}
                    >
                      Avg Response
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card 
                  sx={{ 
                    textAlign: 'center',
                    borderRadius: 4,
                    background: `
                      linear-gradient(135deg, ${alpha(customTheme.primary, 0.15)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)
                    `,
                    border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.05)',
                      boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.3)}`,
                      border: `3px solid ${alpha(customTheme.primary, 0.4)}`
                    }
                  }}
                >
                  <CardContent sx={{ py: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.primary,
                        width: 48,
                        height: 48,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.3)}`
                      }}
                    >
                      <AchievementIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800, 
                        color: customTheme.primary,
                        mb: 1,
                        textShadow: `0 2px 8px ${alpha(customTheme.primary, 0.3)}`
                      }}
                    >
                      {userStats.leaderboard_position?.rescue_rank || 'N/A'}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.8),
                        fontWeight: 600
                      }}
                    >
                      Rescue Rank
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Slide>
        )}

        <Grid container spacing={3}>
          {/* Emergency Rescues - Priority Column */}
          <Grid item xs={12} lg={8}>
            <Slide direction="right" in timeout={1200}>
              <Card 
                sx={{ 
                  mb: 3, 
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: emergencyRescues.length > 0 
                    ? `3px solid ${customTheme.error}` 
                    : `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  boxShadow: emergencyRescues.length > 0
                    ? `0 20px 40px ${alpha(customTheme.error, 0.3)}`
                    : `0 8px 25px ${alpha(customTheme.primary, 0.1)}`,
                  overflow: 'hidden',
                  position: 'relative',
                  animation: emergencyRescues.length > 0 ? `${emergencyFlash} 3s infinite` : 'none'
                }}
              >
                {/* Emergency Alert Header */}
                <Box
                  sx={{
                    p: 3,
                    background: emergencyRescues.length > 0
                      ? `linear-gradient(135deg, ${alpha(customTheme.error, 0.15)} 0%, ${alpha(customTheme.error, 0.05)} 100%)`
                      : `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                    borderBottom: `2px solid ${emergencyRescues.length > 0 ? alpha(customTheme.error, 0.2) : alpha(customTheme.success, 0.2)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: emergencyRescues.length > 0 ? customTheme.error : customTheme.success,
                        width: 56,
                        height: 56,
                        animation: emergencyRescues.length > 0 ? `${pulse} 2s infinite` : 'none',
                        boxShadow: `0 4px 15px ${alpha(emergencyRescues.length > 0 ? customTheme.error : customTheme.success, 0.3)}`
                      }}
                    >
                      {emergencyRescues.length > 0 ? (
                        <EmergencyIcon sx={{ fontSize: 28 }} />
                      ) : (
                        <CheckIcon sx={{ fontSize: 28 }} />
                      )}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          color: emergencyRescues.length > 0 ? customTheme.error : customTheme.success,
                          mb: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        {emergencyRescues.length > 0 ? (
                          <>
                            <FireIcon sx={{ fontSize: '1.2em' }} />
                            URGENT RESCUES NEEDED
                          </>
                        ) : (
                          <>
                            <CheckIcon sx={{ fontSize: '1.2em' }} />
                            ALL CLEAR
                          </>
                        )}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: alpha(customTheme.primary, 0.8),
                          fontWeight: 500
                        }}
                      >
                        {emergencyRescues.length > 0 ? (
                          `${emergencyRescues.length} emergency rescue${emergencyRescues.length > 1 ? 's' : ''} requiring immediate attention`
                        ) : (
                          'No emergency rescues at the moment. Great job, team!'
                        )}
                      </Typography>
                    </Box>
                    {emergencyRescues.length > 0 && (
                      <Badge 
                        badgeContent={emergencyRescues.length} 
                        color="error" 
                        sx={{ 
                          '& .MuiBadge-badge': {
                            fontSize: '1rem',
                            fontWeight: 800,
                            animation: `${pulse} 2s infinite`
                          }
                        }}
                      />
                    )}
                  </Box>
                </Box>
                
                <CardContent sx={{ p: 0 }}>
                  {emergencyRescues.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                      <Zoom in timeout={1000}>
                        <Box>
                          <Avatar
                            sx={{
                              bgcolor: alpha(customTheme.success, 0.1),
                              width: 120,
                              height: 120,
                              mx: 'auto',
                              mb: 3,
                              border: `3px solid ${alpha(customTheme.success, 0.2)}`,
                              animation: `${float} 4s ease-in-out infinite`
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 64, color: customTheme.success }} />
                          </Avatar>
                          <Typography variant="h4" sx={{ color: customTheme.success, fontWeight: 700, mb: 2 }}>
                            All Operations Up to Date!
                          </Typography>
                          <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto' }}>
                            No urgent activities at this time. The system will notify you of new animal intakes, medical procedures, and alerts as they occur.
                          </Typography>
                        </Box>
                      </Zoom>
                    </Box>
                  ) : (
                    <Box sx={{ p: 3 }}>
                      {emergencyRescues.map((rescue, index) => (
                        <Fade in timeout={600 + (index * 200)} key={rescue.id}>
                          <Card 
                            sx={{ 
                              mb: 2, 
                              borderRadius: 4,
                              border: `3px solid ${getUrgencyColor(rescue.urgency)}`,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              background: `
                                linear-gradient(135deg, ${alpha(getUrgencyColor(rescue.urgency), 0.1)} 0%, ${alpha(getUrgencyColor(rescue.urgency), 0.05)} 100%)
                              `,
                              animation: rescue.urgency === 'EMERGENCY' ? `${pulse} 3s infinite` : 'none',
                              '&:hover': {
                                transform: 'translateY(-8px) scale(1.02)',
                                boxShadow: `0 20px 40px ${alpha(getUrgencyColor(rescue.urgency), 0.4)}`,
                                border: `3px solid ${alpha(getUrgencyColor(rescue.urgency), 0.8)}`
                              }
                            }}
                            onClick={() => setSelectedRescue(rescue)}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    sx={{
                                      bgcolor: getUrgencyColor(rescue.urgency),
                                      width: 48,
                                      height: 48,
                                      boxShadow: `0 4px 15px ${alpha(getUrgencyColor(rescue.urgency), 0.3)}`
                                    }}
                                  >
                                    <AnimalIcon sx={{ fontSize: 24 }} />
                                  </Avatar>
                                  <Box>
                                    <Typography 
                                      variant="h5" 
                                      sx={{ 
                                        fontWeight: 800,
                                        color: customTheme.primary,
                                        mb: 0.5
                                      }}
                                    >
                                      {rescue.animal_type}
                                    </Typography>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: alpha(customTheme.primary, 0.7),
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }}
                                    >
                                      <LocationIcon sx={{ fontSize: 16 }} />
                                      {rescue.location_details || 'Location provided'}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                <Chip 
                                  label={rescue.urgency} 
                                  sx={{ 
                                    bgcolor: getUrgencyColor(rescue.urgency),
                                    color: '#ffffff',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    px: 2,
                                    boxShadow: `0 4px 15px ${alpha(getUrgencyColor(rescue.urgency), 0.4)}`,
                                    animation: rescue.urgency === 'EMERGENCY' ? `${pulse} 2s infinite` : 'none'
                                  }}
                                />
                              </Box>
                              
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  mb: 2,
                                  color: alpha(customTheme.primary, 0.8),
                                  fontWeight: 500,
                                  lineHeight: 1.5
                                }}
                              >
                                {rescue.description?.substring(0, 120)}...
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <ClockIcon sx={{ fontSize: 16, color: alpha(customTheme.primary, 0.6) }} />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: alpha(customTheme.primary, 0.6),
                                    fontWeight: 500
                                  }}
                                >
                                  Reported {rescue.time_since_reported}
                                </Typography>
                              </Box>
                              
                              <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<EmergencyIcon />}
                                sx={{
                                  py: 2,
                                  borderRadius: 3,
                                  fontSize: '1.1rem',
                                  fontWeight: 800,
                                  textTransform: 'none',
                                  background: `linear-gradient(45deg, ${getUrgencyColor(rescue.urgency)} 30%, ${alpha(getUrgencyColor(rescue.urgency), 0.8)} 90%)`,
                                  color: '#ffffff',
                                  boxShadow: `0 8px 25px ${alpha(getUrgencyColor(rescue.urgency), 0.4)}`,
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: `linear-gradient(45deg, ${alpha(getUrgencyColor(rescue.urgency), 0.9)} 30%, ${getUrgencyColor(rescue.urgency)} 90%)`,
                                    transform: 'translateY(-3px)',
                                    boxShadow: `0 12px 35px ${alpha(getUrgencyColor(rescue.urgency), 0.5)}`
                                  }
                                }}
                              >
                                {rescue.urgency === 'EMERGENCY' ? 'RESPOND NOW' : 'ACCEPT RESCUE'}
                              </Button>
                            </CardContent>
                          </Card>
                        </Fade>
                      ))}
                      
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/volunteer/hub')}
                        sx={{
                          mt: 2,
                          py: 2,
                          borderRadius: 3,
                          fontSize: '1rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderColor: customTheme.primary,
                          color: customTheme.primary,
                          borderWidth: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: customTheme.primary,
                            backgroundColor: alpha(customTheme.primary, 0.08),
                            borderWidth: 2,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                          }
                        }}
                      >
                        View All Available Rescues
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Slide>

            {/* My Active Assignments */}
            <Slide direction="right" in timeout={1400}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.1)}`,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                    borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
                  }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: '1.2em' }} />
                    My Active Assignments
                  </Typography>
                </Box>
                
                <CardContent sx={{ p: 0 }}>
                  {myAssignments.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(customTheme.secondary, 0.1),
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
                        }}
                      >
                        <AssignmentIcon sx={{ fontSize: 40, color: customTheme.secondary }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 1 }}>
                        No Active Assignments
                      </Typography>
                      <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                        Check available rescues above!
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {myAssignments.map((assignment, index) => (
                        <ListItem 
                          key={assignment.id} 
                          sx={{ 
                            py: 2,
                            px: 3,
                            borderBottom: index < myAssignments.length - 1 ? `1px solid ${alpha(customTheme.primary, 0.1)}` : 'none',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: alpha(customTheme.grey, 0.3)
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              sx={{ 
                                bgcolor: customTheme.success,
                                boxShadow: `0 4px 15px ${alpha(customTheme.success, 0.3)}`
                              }}
                            >
                              <AnimalIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: customTheme.primary,
                                  fontWeight: 700,
                                  mb: 0.5
                                }}
                              >
                                {assignment.report_details?.animal_type || 'Animal'} Rescue
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: alpha(customTheme.primary, 0.8),
                                    mb: 0.5,
                                    fontWeight: 500
                                  }}
                                >
                                  Status: {assignment.status} • {formatTimeAgo(assignment.assigned_at)}
                                </Typography>
                                {assignment.estimated_arrival && (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: alpha(customTheme.primary, 0.6),
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}
                                  >
                                    <ClockIcon sx={{ fontSize: 14 }} />
                                    ETA: {format(new Date(assignment.estimated_arrival), 'MMM d, h:mm a')}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Chip 
                            label={assignment.status} 
                            color={assignment.status === 'COMPLETED' ? 'success' : 'primary'}
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.8rem'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Right Column - Training & Activity */}
          <Grid item xs={12} lg={4}>
            {/* Training Progress */}
            <Slide direction="left" in timeout={1000}>
              <Card 
                sx={{ 
                  mb: 3,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.1)}`,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                    borderBottom: `2px solid ${alpha(customTheme.accent, 0.1)}`
                  }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <TrainingIcon sx={{ fontSize: '1.2em' }} />
                    Training Progress
                  </Typography>
                </Box>
                
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: customTheme.primary,
                          fontWeight: 600
                        }}
                      >
                        Overall Completion
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: customTheme.accent,
                          fontWeight: 800
                        }}
                      >
                        {calculateTrainingCompletion()}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateTrainingCompletion()}
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        backgroundColor: alpha(customTheme.grey, 0.4),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: customTheme.accent,
                          borderRadius: 6,
                          background: `linear-gradient(90deg, ${customTheme.accent}, ${alpha(customTheme.accent, 0.7)})`
                        }
                      }}
                    />
                  </Box>
                  
                  {trainingProgress.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.warning, 0.1)} 0%, ${alpha(customTheme.warning, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.warning, 0.2)}`,
                        textAlign: 'center'
                      }}
                    >
                      <WarningIcon sx={{ fontSize: 40, color: customTheme.warning, mb: 2 }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: customTheme.primary,
                          fontWeight: 700,
                          mb: 1
                        }}
                      >
                        Complete Training Required
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: alpha(customTheme.primary, 0.7),
                          mb: 2
                        }}
                      >
                        Complete training to qualify for rescue assignments!
                      </Typography>
                      <Button 
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/interactive-learning')}
                        sx={{
                          background: `linear-gradient(45deg, ${customTheme.warning} 30%, ${alpha(customTheme.warning, 0.8)} 90%)`,
                          color: '#ffffff',
                          fontWeight: 700,
                          textTransform: 'none',
                          borderRadius: 2
                        }}
                      >
                        Start Training
                      </Button>
                    </Paper>
                  ) : (
                    <List dense sx={{ p: 0 }}>
                      {trainingProgress.slice(0, 3).map((progress, index) => (
                        <ListItem key={progress.id} sx={{ px: 0, py: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: progress.status === 'COMPLETED' ? customTheme.success : customTheme.accent,
                              width: 36,
                              height: 36
                            }}>
                              {progress.status === 'COMPLETED' ? 
                                <CheckIcon sx={{ fontSize: 18 }} /> : 
                                <PlayIcon sx={{ fontSize: 18 }} />
                              }
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: customTheme.primary,
                                  fontSize: '0.9rem'
                                }}
                              >
                                {progress.module_title}
                              </Typography>
                            }
                            secondary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: alpha(customTheme.primary, 0.7),
                                  fontSize: '0.8rem'
                                }}
                              >
                                {progress.completion_percentage}% complete
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TrainingIcon />}
                    onClick={() => navigate('/interactive-learning')}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderColor: customTheme.accent,
                      color: customTheme.accent,
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: customTheme.accent,
                        backgroundColor: alpha(customTheme.accent, 0.08),
                        borderWidth: 2
                      }
                    }}
                  >
                    Continue Training
                  </Button>
                </CardContent>
              </Card>
            </Slide>

            {/* Recent Activity */}
            <Slide direction="left" in timeout={1200}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.1)}`,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                    borderBottom: `2px solid ${alpha(customTheme.secondary, 0.1)}`
                  }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <StatsIcon sx={{ fontSize: '1.2em' }} />
                    Recent Activity
                  </Typography>
                </Box>
                
                <CardContent sx={{ p: 0 }}>
                  {recentActivity.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(customTheme.secondary, 0.1),
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
                        }}
                      >
                        <StatsIcon sx={{ fontSize: 40, color: customTheme.secondary }} />
                      </Avatar>
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 1 }}>
                        No Recent Activity
                      </Typography>
                      <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                        Start your rescue journey!
                      </Typography>
                    </Box>
                  ) : (
                    <List dense sx={{ p: 0 }}>
                      {recentActivity.map((activity, index) => (
                        <ListItem 
                          key={activity.id} 
                          sx={{ 
                            px: 3,
                            py: 2,
                            borderBottom: index < recentActivity.length - 1 ? `1px solid ${alpha(customTheme.primary, 0.1)}` : 'none',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: alpha(customTheme.grey, 0.3)
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              sx={{ 
                                bgcolor: customTheme.secondary, 
                                width: 36, 
                                height: 36,
                                boxShadow: `0 4px 15px ${alpha(customTheme.secondary, 0.3)}`
                              }}
                            >
                              <StarIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: customTheme.primary,
                                  fontWeight: 600,
                                  fontSize: '0.9rem',
                                  mb: 0.5
                                }}
                              >
                                {activity.description}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: customTheme.success,
                                    fontWeight: 700
                                  }}
                                >
                                  +{activity.points_earned} points
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: alpha(customTheme.primary, 0.6),
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {formatTimeAgo(activity.created_at)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  
                  <Box sx={{ p: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/activities')}
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 700,
                        textTransform: 'none',
                        borderColor: customTheme.secondary,
                        color: customTheme.secondary,
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: customTheme.secondary,
                          backgroundColor: alpha(customTheme.secondary, 0.08),
                          borderWidth: 2
                        }
                      }}
                    >
                      View All Activity
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        </Grid>

        {/* Quick Actions FAB */}
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Fab
            color="error"
            size="large"
            onClick={() => navigate('/report-animal')}
            sx={{ 
              background: `linear-gradient(45deg, ${customTheme.error} 30%, ${customTheme.accent} 90%)`,
              width: 72,
              height: 72,
              boxShadow: `0 12px 30px ${alpha(customTheme.error, 0.4)}`,
              transition: 'all 0.3s ease',
              animation: `${pulse} 4s infinite`,
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(customTheme.error, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`,
                transform: 'scale(1.1)',
                boxShadow: `0 16px 40px ${alpha(customTheme.error, 0.6)}`
              }
            }}
          >
            <AddIcon sx={{ fontSize: 32 }} />
          </Fab>
        </Box>

        {/* Enhanced Rescue Detail Dialog */}
        <Dialog
          open={Boolean(selectedRescue)}
          onClose={() => setSelectedRescue(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: `
                radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
              `,
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.error, 0.3)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.error, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ 
            p: 4,
            background: `linear-gradient(135deg, ${alpha(customTheme.error, 0.1)} 0%, ${alpha(customTheme.error, 0.05)} 100%)`,
            borderBottom: `2px solid ${alpha(customTheme.error, 0.2)}`
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: customTheme.error,
                    width: 56,
                    height: 56,
                    animation: `${pulse} 2s infinite`
                  }}
                >
                  <EmergencyIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: customTheme.error,
                      fontWeight: 800,
                      mb: 0.5
                    }}
                  >
                    Emergency Rescue Details
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500
                    }}
                  >
                    Immediate action required
                  </Typography>
                </Box>
              </Box>
              <IconButton 
                onClick={() => setSelectedRescue(null)}
                sx={{
                  color: customTheme.primary,
                  '&:hover': {
                    backgroundColor: alpha(customTheme.primary, 0.1)
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            {selectedRescue && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <EmergencyIcon sx={{ color: getUrgencyColor(selectedRescue.urgency), mr: 1 }} />
                  <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                    {selectedRescue.animal_type}
                  </Typography>
                  <Chip 
                    label={selectedRescue.urgency}
                    sx={{ 
                      bgcolor: getUrgencyColor(selectedRescue.urgency),
                      color: '#ffffff',
                      ml: 2,
                      fontWeight: 800,
                      fontSize: '1rem',
                      px: 2
                    }}
                  />
                </Box>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
                      }}
                    >
                      <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, mb: 1 }}>
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 18 }} />
                        {selectedRescue.location_details || 'Coordinates provided'}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.accent, 0.2)}`
                      }}
                    >
                      <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, mb: 1 }}>
                        Reported
                      </Typography>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ClockIcon sx={{ fontSize: 18 }} />
                        {selectedRescue.time_since_reported}
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  {selectedRescue.animal_condition && (
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.warning, 0.1)} 0%, ${alpha(customTheme.warning, 0.05)} 100%)`,
                          border: `2px solid ${alpha(customTheme.warning, 0.2)}`
                        }}
                      >
                        <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, mb: 1 }}>
                          Animal Condition
                        </Typography>
                        <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MedicalServicesIcon sx={{ fontSize: 18 }} />
                          {selectedRescue.animal_condition}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                    mb: 3
                  }}
                >
                  <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ color: customTheme.primary, lineHeight: 1.6 }}>
                    {selectedRescue.description}
                  </Typography>
                </Paper>
                
                {selectedRescue.distance_km && (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 3,
                      backgroundColor: alpha(customTheme.secondary, 0.1),
                      border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                      '& .MuiAlert-icon': {
                        color: customTheme.secondary
                      }
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Approximately {selectedRescue.distance_km} km from your location
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 4,
            background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
            borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Button 
              onClick={() => setSelectedRescue(null)}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{
                borderColor: customTheme.primary,
                color: customTheme.primary,
                fontWeight: 600,
                borderWidth: 2,
                borderRadius: 3,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: customTheme.primary,
                  backgroundColor: alpha(customTheme.primary, 0.08),
                  borderWidth: 2
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleAcceptRescue(selectedRescue)}
              startIcon={<EmergencyIcon />}
              sx={{
                background: `linear-gradient(45deg, ${customTheme.error} 30%, ${customTheme.accent} 90%)`,
                color: '#ffffff',
                fontWeight: 800,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: `0 8px 25px ${alpha(customTheme.error, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.error, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 35px ${alpha(customTheme.error, 0.5)}`
                }
              }}
            >
              Accept Rescue Assignment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Welcome Dialog */}
        <Dialog 
          open={showWelcome} 
          onClose={() => setShowWelcome(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: `
                radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
              `,
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            p: 4,
            background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
            borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Avatar
              sx={{
                bgcolor: customTheme.error,
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                animation: `${pulse} 3s infinite`,
                boxShadow: `0 8px 25px ${alpha(customTheme.error, 0.4)}`
              }}
            >
              <EmergencyIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography 
              variant="h3" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 800,
                mb: 1
              }}
            >
              Welcome to Rescue Operations!
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: alpha(customTheme.primary, 0.7),
                fontWeight: 500
              }}
            >
              You're now part of our emergency animal rescue team!
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: customTheme.primary, lineHeight: 1.6 }}>
              You're now part of our emergency animal rescue team! This dashboard is your mission control 
              for life-saving operations.
            </Typography>
            
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                backgroundColor: alpha(customTheme.warning, 0.1),
                border: `2px solid ${alpha(customTheme.warning, 0.3)}`,
                '& .MuiAlert-icon': {
                  color: customTheme.warning
                }
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Before accepting rescue assignments:
              </Typography>
              <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
                <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
                  Complete mandatory training modules
                </Typography>
                <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
                  Set up your enhanced volunteer profile
                </Typography>
                <Typography component="li" variant="body1">
                  Ensure GPS tracking consent is enabled
                </Typography>
              </Box>
            </Alert>
            
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                border: `2px solid ${alpha(customTheme.success, 0.2)}`,
                textAlign: 'center'
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: customTheme.success,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <EmergencyIcon />
                Emergency rescues appear in real-time. Be ready to save lives!
              </Typography>
            </Paper>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 4,
            background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
            borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Button 
              onClick={() => setShowWelcome(false)}
              variant="outlined"
              sx={{
                borderColor: customTheme.primary,
                color: customTheme.primary,
                fontWeight: 600,
                borderWidth: 2,
                borderRadius: 3,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: customTheme.primary,
                  backgroundColor: alpha(customTheme.primary, 0.08),
                  borderWidth: 2
                }
              }}
            >
              I'm Ready!
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                setShowWelcome(false);
                navigate('/interactive-learning');
              }}
              startIcon={<TrainingIcon />}
              sx={{
                background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${alpha(customTheme.accent, 0.8)} 90%)`,
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${customTheme.accent} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.5)}`
                }
              }}
            >
              Start Training Now
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default VolunteerDashboard;