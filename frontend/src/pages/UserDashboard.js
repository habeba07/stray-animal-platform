import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Divider,
  Button,
  LinearProgress,
  Alert,
  Paper,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Stars as StarIcon,
  Timeline as ActivityIcon,
  Redeem as RedeemIcon,
  Block as BlockIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  Assignment as AssignmentIcon,
  StarBorder as StarBorderIcon,
  TrendingUp as TrendingIcon,
  Favorite as FavoriteIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  AutoAwesome as SparkleIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
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

function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [pointsSummary, setPointsSummary] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restrict access for STAFF and SHELTER users
  useEffect(() => {
    if (user && ['STAFF', 'SHELTER'].includes(user.user_type)) {
      // Don't allow staff or shelter users to access the gamification dashboard
      return;
    }
  }, [user]);

  useEffect(() => {
    // Only fetch data if user is not STAFF or SHELTER
    if (!user || ['STAFF', 'SHELTER'].includes(user.user_type)) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch activities and points
        const [activitiesRes, pointsRes, rewardsRes] = await Promise.all([
          api.get('/activities/my_activities/'),
          api.get('/activities/my_points/'),
          api.get('/rewards/')
        ]);

        setActivities(activitiesRes.data);
        setPointsSummary(pointsRes.data);
        setRewards(rewardsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'PROFILE_CREATED':
        return <PersonIcon sx={{ fontSize: '1.2rem', color: customTheme.primary }} />;
      case 'ADOPTION_APPLICATION':
        return <PetsIcon sx={{ fontSize: '1.2rem', color: customTheme.secondary }} />;
      case 'REPORT_ANIMAL':
        return <AssignmentIcon sx={{ fontSize: '1.2rem', color: customTheme.accent }} />;
      case 'FIRST_REPORT':
        return <StarIcon sx={{ fontSize: '1.2rem', color: customTheme.success }} />;
      default:
        return <StarBorderIcon sx={{ fontSize: '1.2rem', color: customTheme.primary }} />;
    }
  };

  const getActivityDescription = (activityType) => {
    const descriptions = {
      'PROFILE_CREATED': 'Created adopter profile',
      'ADOPTION_APPLICATION': 'Applied for animal adoption',
      'REPORT_ANIMAL': 'Reported stray animal',
      'FIRST_REPORT': 'First animal report',
    };
    return descriptions[activityType] || activityType.replace('_', ' ');
  };

  // If user is STAFF or SHELTER, show access restriction message
  if (user && ['STAFF', 'SHELTER'].includes(user.user_type)) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        py: 8,
        px: 2
      }}>
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            animation: `${float} 10s ease-in-out infinite`,
            animationDelay: '0s',
            opacity: 0.6
          }}
        >
          <BlockIcon sx={{ fontSize: 40, color: customTheme.accent, filter: 'blur(1px)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            animation: `${float} 12s ease-in-out infinite`,
            animationDelay: '2s',
            opacity: 0.4
          }}
        >
          <DashboardIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            left: '8%',
            animation: `${float} 14s ease-in-out infinite`,
            animationDelay: '4s',
            opacity: 0.5
          }}
        >
          <StarIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Paper sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.05)} 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.05)} 0%, transparent 50%)
                `,
                pointerEvents: 'none'
              }
            }}>
              {/* Floating sparkles */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  left: '30%',
                  animation: `${sparkle} 3s infinite`,
                  animationDelay: '0s'
                }}
              >
                <StarIcon sx={{ color: customTheme.accent, fontSize: 20 }} />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: '25%',
                  animation: `${sparkle} 3s infinite`,
                  animationDelay: '1s'
                }}
              >
                <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
              </Box>

              <Avatar
                sx={{
                  bgcolor: customTheme.primary,
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 4,
                  boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`,
                  animation: `${pulse} 3s infinite`
                }}
              >
                <BlockIcon sx={{ fontSize: 60 }} />
              </Avatar>
              
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 4s ease infinite`,
                  mb: 3,
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Staff Access Notice
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  mb: 5,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                This dashboard is designed for community members and volunteers to track their engagement points and achievements. 
                As a shelter staff member, you have access to specialized operational dashboards.
              </Typography>

              <Alert 
                severity="info" 
                sx={{ 
                  mb: 5,
                  borderRadius: 4,
                  fontSize: '1.1rem',
                  backgroundColor: alpha(customTheme.secondary, 0.1),
                  border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                  '& .MuiAlert-icon': {
                    color: customTheme.secondary,
                    fontSize: '1.5rem'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Staff Access Available
                </Typography>
                Staff members can access operational tools through the main navigation menu.
              </Alert>

              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/')}
                  sx={{
                    py: 3,
                    px: 5,
                    borderRadius: 4,
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                    color: '#ffffff',
                    textTransform: 'none',
                    boxShadow: `0 8px 30px ${alpha(customTheme.primary, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 12px 40px ${alpha(customTheme.primary, 0.5)}`
                    }
                  }}
                >
                  Go to Homepage
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="large"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    py: 3,
                    px: 5,
                    borderRadius: 4,
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    borderColor: customTheme.secondary,
                    borderWidth: 3,
                    color: customTheme.secondary,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: customTheme.secondary,
                      backgroundColor: alpha(customTheme.secondary, 0.1),
                      borderWidth: 3,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 12px 35px ${alpha(customTheme.secondary, 0.3)}`
                    }
                  }}
                >
                  Operational Dashboard
                </Button>
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  // If not logged in, show login prompt
  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        py: 8,
        px: 2
      }}>
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            animation: `${float} 10s ease-in-out infinite`,
            animationDelay: '0s',
            opacity: 0.6
          }}
        >
          <LoginIcon sx={{ fontSize: 40, color: customTheme.accent, filter: 'blur(1px)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            animation: `${float} 12s ease-in-out infinite`,
            animationDelay: '2s',
            opacity: 0.4
          }}
        >
          <PersonIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '25%',
            left: '8%',
            animation: `${float} 14s ease-in-out infinite`,
            animationDelay: '4s',
            opacity: 0.5
          }}
        >
          <StarIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Paper sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
              position: 'relative'
            }}>
              <Avatar
                sx={{
                  bgcolor: customTheme.accent,
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 4,
                  boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.4)}`,
                  animation: `${pulse} 3s infinite`
                }}
              >
                <LoginIcon sx={{ fontSize: 60 }} />
              </Avatar>
              
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 4s ease infinite`,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Please Log In
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  mb: 5,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                You need to be logged in to view your dashboard
              </Typography>
              
              <Button 
                variant="contained" 
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  py: 3,
                  px: 5,
                  borderRadius: 4,
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                  color: '#ffffff',
                  textTransform: 'none',
                  boxShadow: `0 8px 30px ${alpha(customTheme.accent, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 40px ${alpha(customTheme.accent, 0.5)}`
                  }
                }}
              >
                Log In to Continue
              </Button>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress 
            sx={{
              width: 300,
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(customTheme.grey, 0.3),
              mb: 3,
              '& .MuiLinearProgress-bar': {
                backgroundColor: customTheme.accent,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${customTheme.accent}, ${customTheme.secondary})`
              }
            }}
          />
          <Typography 
            variant="h4" 
            sx={{ 
              color: customTheme.primary, 
              fontWeight: 700,
              mb: 1
            }}
          >
            Loading Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Fetching your activity data...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
      py: 6,
      px: 2
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
        <TrophyIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
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
        <DashboardIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <StarIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          right: '5%',
          animation: `${float} 16s ease-in-out infinite`,
          animationDelay: '6s',
          opacity: 0.3
        }}
      >
        <ActivityIcon sx={{ fontSize: 25, color: customTheme.accent, transform: 'rotate(45deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Hero Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              {/* Floating sparkles */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  left: '30%',
                  animation: `${sparkle} 3s infinite`,
                  animationDelay: '0s'
                }}
              >
                <StarIcon sx={{ color: customTheme.accent, fontSize: 20 }} />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: '25%',
                  animation: `${sparkle} 3s infinite`,
                  animationDelay: '1s'
                }}
              >
                <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
              </Box>
              
              <Slide direction="down" in timeout={1000}>
                <Avatar
                  sx={{
                    bgcolor: customTheme.primary,
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 4,
                    boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 50 }} />
                </Avatar>
              </Slide>
              
              <Typography 
                variant="h2" 
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
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                My Dashboard
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Track your points, activities, and achievements in the animal rescue community
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {/* Points Summary Card */}
              <Grid item xs={12} md={4}>
                <Slide direction="right" in timeout={1200}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 6,
                    background: `linear-gradient(135deg, ${customTheme.accent} 0%, ${customTheme.secondary} 100%)`,
                    color: 'white',
                    border: `3px solid ${alpha(customTheme.accent, 0.3)}`,
                    boxShadow: `0 25px 50px ${alpha(customTheme.accent, 0.3)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `
                        radial-gradient(circle at 20% 20%, ${alpha('#ffffff', 0.3)} 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%)
                      `,
                      pointerEvents: 'none'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 5, position: 'relative', zIndex: 1 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 3,
                        boxShadow: `0 8px 25px ${alpha('#ffffff', 0.2)}`
                      }}>
                        <StarIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h1" sx={{ fontWeight: 800, mb: 2, textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                        {pointsSummary?.total_points || 0}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        Total Points
                      </Typography>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>

              {/* Quick Stats */}
              <Grid item xs={12} md={8}>
                <Slide direction="left" in timeout={1400}>
                  <Grid container spacing={3} sx={{ height: '100%' }}>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.15)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 12px 25px ${alpha(customTheme.primary, 0.2)}` }
                      }}>
                        <CardContent sx={{ py: 3, width: '100%' }}>
                          <ActivityIcon sx={{ fontSize: 32, color: customTheme.primary, mb: 1 }} />
                          <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                            {activities.length}
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                            Activities
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.15)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 12px 25px ${alpha(customTheme.secondary, 0.2)}` }
                      }}>
                        <CardContent sx={{ py: 3, width: '100%' }}>
                          <TrendingIcon sx={{ fontSize: 32, color: customTheme.secondary, mb: 1 }} />
                          <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                            {pointsSummary?.points_by_activity?.length || 0}
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                            Types
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.15)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 12px 25px ${alpha(customTheme.accent, 0.2)}` }
                      }}>
                        <CardContent sx={{ py: 3, width: '100%' }}>
                          <TrophyIcon sx={{ fontSize: 32, color: customTheme.accent, mb: 1 }} />
                          <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                            0
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                            Achievements
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.success, 0.2)}`,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 12px 25px ${alpha(customTheme.success, 0.2)}` }
                      }}>
                        <CardContent sx={{ py: 3, width: '100%' }}>
                          <RedeemIcon sx={{ fontSize: 32, color: customTheme.success, mb: 1 }} />
                          <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                            {rewards.length}
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                            Rewards
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Slide>
              </Grid>

              {/* Recent Activities */}
              <Grid item xs={12} md={8}>
                <Fade in timeout={1600}>
                  <Card sx={{ 
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                    boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <ActivityIcon sx={{ color: customTheme.primary, mr: 2, fontSize: 32 }} />
                        <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                          Recent Activities
                        </Typography>
                      </Box>
                      
                      {activities.length > 0 ? (
                        <List sx={{ p: 0 }}>
                          {activities.slice(0, 5).map((activity, index) => (
                            <React.Fragment key={activity.id}>
                              <Zoom in timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                                <ListItem sx={{ px: 0, py: 2 }}>
                                  <Box sx={{ 
                                    mr: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 50,
                                    height: 50,
                                    bgcolor: alpha(customTheme.grey, 0.4),
                                    borderRadius: '50%',
                                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`
                                  }}>
                                    {getActivityIcon(activity.activity_type)}
                                  </Box>
                                  <ListItemText
                                    primary={
                                      <Typography variant="h6" sx={{ fontWeight: 700, color: customTheme.primary, mb: 0.5 }}>
                                        {getActivityDescription(activity.activity_type)}
                                      </Typography>
                                    }
                                    secondary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TimeIcon sx={{ fontSize: 16, color: alpha(customTheme.primary, 0.6) }} />
                                        <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.6), fontWeight: 500 }}>
                                          {formatDate(activity.created_at)}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                  <Chip 
                                    label={`${activity.points_earned >= 0 ? '+' : ''}${activity.points_earned} pts`}
                                    sx={{
                                      bgcolor: activity.points_earned >= 0 ? alpha(customTheme.success, 0.15) : alpha('#f44336', 0.15),
                                      color: activity.points_earned >= 0 ? customTheme.success : '#f44336',
                                      fontWeight: 700,
                                      fontSize: '0.9rem',
                                      border: `2px solid ${activity.points_earned >= 0 ? alpha(customTheme.success, 0.3) : alpha('#f44336', 0.3)}`
                                    }}
                                  />
                                </ListItem>
                              </Zoom>
                              {index < Math.min(activities.length, 5) - 1 && (
                                <Divider sx={{ borderColor: alpha(customTheme.primary, 0.1), borderWidth: 1 }} />
                              )}
                            </React.Fragment>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <ActivityIcon sx={{ fontSize: 80, color: alpha(customTheme.primary, 0.3), mb: 2 }} />
                          <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 600, mb: 1 }}>
                            No activities yet
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                            Start by creating a profile or applying for adoption!
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Points Breakdown */}
              <Grid item xs={12} md={4}>
                <Fade in timeout={1800}>
                  <Card sx={{ 
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                    boxShadow: `0 25px 50px ${alpha(customTheme.secondary, 0.15)}`,
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 5 }}>
                      <Typography variant="h5" sx={{ color: customTheme.primary, mb: 4, fontWeight: 700, textAlign: 'center' }}>
                        Points by Activity
                      </Typography>
                      
                      {pointsSummary?.points_by_activity?.map((item, index) => (
                        <Slide direction="right" in timeout={800} style={{ transitionDelay: `${index * 200}ms` }} key={index}>
                          <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                                {getActivityDescription(item.activity_type)}
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 700, color: customTheme.accent }}>
                                {item.total} pts
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={pointsSummary.total_points > 0 ? (item.total / pointsSummary.total_points) * 100 : 0}
                              sx={{ 
                                height: 12, 
                                borderRadius: 6,
                                backgroundColor: alpha(customTheme.grey, 0.3),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: customTheme.secondary,
                                  borderRadius: 6,
                                  background: `linear-gradient(90deg, ${customTheme.secondary}, ${customTheme.success})`
                                }
                              }}
                            />
                          </Box>
                        </Slide>
                      )) || (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <StarIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.3), mb: 2 }} />
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 500 }}>
                            No point breakdown available
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Available Rewards */}
              <Grid item xs={12}>
                <Fade in timeout={2000}>
                  <Card sx={{ 
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
                    boxShadow: `0 25px 50px ${alpha(customTheme.accent, 0.15)}`
                  }}>
                    <CardContent sx={{ p: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <RedeemIcon sx={{ color: customTheme.accent, mr: 2, fontSize: 32 }} />
                        <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                          Available Rewards
                        </Typography>
                      </Box>
                      
                      {rewards.length > 0 ? (
                        <Grid container spacing={3}>
                          {rewards.map((reward, index) => (
                            <Grid item xs={12} sm={6} md={4} key={reward.id}>
                              <Zoom in timeout={800} style={{ transitionDelay: `${index * 150}ms` }}>
                                <Card 
                                  sx={{ 
                                    borderRadius: 4,
                                    border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                                    background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.08)} 0%, ${alpha(customTheme.accent, 0.03)} 100%)`,
                                    transition: 'transform 0.3s ease',
                                    '&:hover': { 
                                      transform: 'translateY(-5px)',
                                      boxShadow: `0 12px 25px ${alpha(customTheme.accent, 0.2)}`
                                    }
                                  }}
                                >
                                  <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: customTheme.primary }}>
                                      {reward.name}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 3, lineHeight: 1.6 }}>
                                      {reward.description}
                                    </Typography>
                                    <Chip 
                                      label={`${reward.points_required} points required`}
                                      sx={{
                                        bgcolor: (pointsSummary?.total_points || 0) >= reward.points_required ? 
                                          alpha(customTheme.success, 0.15) : alpha(customTheme.accent, 0.15),
                                        color: (pointsSummary?.total_points || 0) >= reward.points_required ? 
                                          customTheme.success : customTheme.accent,
                                        fontWeight: 700,
                                        mb: 3,
                                        border: `2px solid ${(pointsSummary?.total_points || 0) >= reward.points_required ? 
                                          alpha(customTheme.success, 0.3) : alpha(customTheme.accent, 0.3)}`
                                      }}
                                    />
                                    <Button 
                                      variant="contained"
                                      fullWidth
                                      disabled={(pointsSummary?.total_points || 0) < reward.points_required}
                                      sx={{ 
                                        py: 2,
                                        borderRadius: 3,
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        background: (pointsSummary?.total_points || 0) >= reward.points_required ?
                                          `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)` :
                                          alpha(customTheme.primary, 0.3),
                                        '&:hover:not(:disabled)': { 
                                          background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                                          transform: 'translateY(-2px)'
                                        }
                                      }}
                                    >
                                      {(pointsSummary?.total_points || 0) >= reward.points_required ? 'Redeem Now' : 'Insufficient Points'}
                                    </Button>
                                  </CardContent>
                                </Card>
                              </Zoom>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <RedeemIcon sx={{ fontSize: 80, color: alpha(customTheme.accent, 0.3), mb: 2 }} />
                          <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 600, mb: 1 }}>
                            No rewards available yet
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                            Rewards will be added soon. Keep earning points!
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default UserDashboard;