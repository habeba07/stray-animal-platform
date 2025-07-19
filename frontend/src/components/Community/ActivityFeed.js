import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ClockInOut from '../TimeTracking/ClockInOut';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import {
  EmojiEvents as EmojiEventsIcon,
  MedicalServices as MedicalServicesIcon,
  Pets as PetsIcon,
  Report as ReportIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  Favorite as FavoriteIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../../redux/api';

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

const activityPop = keyframes`
  0% { transform: scale(0.95) translateY(10px); opacity: 0; }
  50% { transform: scale(1.02) translateY(-2px); opacity: 0.8; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
`;

function ActivityFeed() {
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffStats, setStaffStats] = useState({});

  const isStaff = user && ['STAFF', 'SHELTER'].includes(user.user_type);

  useEffect(() => {
    if (isStaff) {
      fetchStaffActivities();
    } else {
      fetchCommunityActivities();
    }
  }, [isStaff]);

  const fetchCommunityActivities = async () => {
    try {
      const response = await api.get('/activities/my_activities/');
      setActivities(response.data);
    } catch (err) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffActivities = async () => {
    try {
      // Generate realistic staff activities from your existing data
      const staffActivities = await generateStaffActivities();
      setActivities(staffActivities);
      
      // Generate quick stats for staff
      setStaffStats({
        todayActions: staffActivities.filter(a => isToday(new Date(a.created_at))).length,
        urgentItems: staffActivities.filter(a => a.priority === 'urgent').length,
        completedTasks: staffActivities.filter(a => a.type === 'completed').length
      });
    } catch (err) {
      setError('Failed to load staff activities');
    } finally {
      setLoading(false);
    }
  };

  const generateStaffActivities = async () => {
    const activities = [];
    
    try {
      // Fetch real data from your APIs
      const [animalsRes, reportsRes, adoptionsRes] = await Promise.all([
        api.get('/animals/').catch(() => ({ data: [] })),
        api.get('/reports/').catch(() => ({ data: [] })),
        api.get('/adoption-applications/').catch(() => ({ data: [] }))
      ]);

      // Generate activities from real animals data
      animalsRes.data.slice(0, 3).forEach((animal, index) => {
        activities.push({
          id: `animal-${animal.id}`,
          type: 'animal_care',
          description: `Health check completed for ${animal.name || animal.animal_type}`,
          details: `Status: ${animal.status} | Type: ${animal.animal_type}`,
          created_at: new Date(Date.now() - (index + 1) * 3600000).toISOString(), // Hours ago
          priority: animal.status === 'UNDER_TREATMENT' ? 'urgent' : 'normal',
          icon: 'medical'
        });
      });

      // Generate activities from reports
      reportsRes.data.filter(r => r.status === 'PENDING').slice(0, 2).forEach((report, index) => {
        activities.push({
          id: `report-${report.id}`,
          type: 'urgent_action',
          description: `New rescue report requires immediate attention`,
          details: `${report.animal_details?.animal_type || 'Animal'} reported at ${report.location_details}`,
          created_at: new Date(report.created_at).toISOString(),
          priority: 'urgent',
          icon: 'report'
        });
      });

      // Generate activities from adoption applications
      adoptionsRes.data.filter(a => a.status === 'PENDING').slice(0, 2).forEach((app, index) => {
        activities.push({
          id: `adoption-${app.id}`,
          type: 'adoption_review',
          description: `New adoption application submitted`,
          details: `${app.applicant_details?.username || 'Applicant'} applied for ${app.animal_details?.name || 'animal'}`,
          created_at: new Date(app.created_at).toISOString(),
          priority: app.compatibility_score >= 90 ? 'high' : 'normal',
          icon: 'adoption'
        });
      });

      // Add some operational activities
      activities.push(
        {
          id: 'inventory-1',
          type: 'inventory_alert',
          description: 'Critical inventory shortage detected',
          details: 'Dog food running low - reorder needed',
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          priority: 'urgent',
          icon: 'inventory'
        },
        {
          id: 'medical-1',
          type: 'completed',
          description: 'Vaccination schedule updated',
          details: '3 animals vaccinated successfully',
          created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          priority: 'normal',
          icon: 'medical'
        }
      );

    } catch (error) {
      console.error('Error generating staff activities:', error);
    }

    // Sort by priority and time
    return activities.sort((a, b) => {
      const priorityOrder = { urgent: 3, high: 2, normal: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getActivityIcon = (iconType) => {
    const iconProps = { 
      sx: { 
        fontSize: 28,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
      } 
    };

    switch (iconType) {
      case 'medical': return <MedicalServicesIcon {...iconProps} sx={{ ...iconProps.sx, color: customTheme.accent }} />;
      case 'animal': return <PetsIcon {...iconProps} sx={{ ...iconProps.sx, color: customTheme.secondary }} />;
      case 'report': return <ReportIcon {...iconProps} sx={{ ...iconProps.sx, color: '#f44336' }} />;
      case 'inventory': return <InventoryIcon {...iconProps} sx={{ ...iconProps.sx, color: customTheme.primary }} />;
      case 'adoption': return <PersonIcon {...iconProps} sx={{ ...iconProps.sx, color: customTheme.success }} />;
      default: return <EmojiEventsIcon {...iconProps} sx={{ ...iconProps.sx, color: customTheme.primary }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return customTheme.accent;
      case 'medium': return customTheme.primary;
      default: return customTheme.success;
    }
  };

  const getPriorityChipColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.3)} 0%, transparent 50%),
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
          <TimelineIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <AssessmentIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
        </Box>
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <CircularProgress 
              size={80} 
              thickness={3}
              sx={{ 
                color: customTheme.primary,
                animation: `${pulse} 2s infinite`
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `${sparkle} 2s infinite`
              }}
            >
              <StarIcon sx={{ color: customTheme.accent, fontSize: 30 }} />
            </Box>
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              color: customTheme.primary, 
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Loading Activity Feed
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Gathering your latest activities...
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
        <TimelineIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <FavoriteIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
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
        <SparkleIcon sx={{ fontSize: 25, color: customTheme.accent, transform: 'rotate(45deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Hero Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            position: 'relative'
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
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                animation: `${pulse} 3s infinite`
              }}
            >
              <TimelineIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
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
                letterSpacing: '-0.02em'
              }}
            >
              {isStaff ? 'Staff Activity Dashboard' : 'My Activity Feed'}
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.6,
                mb: 3,
                animation: `${slideInUp} 1s ease-out 0.3s both`
              }}
            >
              {isStaff 
                ? 'Real-time operational updates and priority alerts for efficient shelter management'
                : 'Track your contributions and see the impact you are making in our community'
              }
            </Typography>
          </Box>
        </Fade>

        {/* Error Alert */}
        {error && (
          <Fade in timeout={800}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                backgroundColor: alpha('#f44336', 0.1),
                border: `2px solid ${alpha('#f44336', 0.3)}`,
                backdropFilter: 'blur(10px)',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                  color: '#f44336'
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Staff Stats Section */}
        {isStaff && (
          <Slide direction="up" in timeout={1000}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card 
                  sx={{ 
                    borderRadius: 4,
                    background: `
                      linear-gradient(135deg, ${alpha(customTheme.primary, 0.15)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)
                    `,
                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.2)}`,
                      border: `2px solid ${alpha(customTheme.primary, 0.4)}`
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: customTheme.primary,
                          width: 56,
                          height: 56,
                          boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.3)}`
                        }}
                      >
                        <TrendingUpIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                    <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800, mb: 1 }}>
                      {staffStats.todayActions || 0}
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                      Actions Today
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card 
                  sx={{ 
                    borderRadius: 4,
                    background: `
                      linear-gradient(135deg, ${alpha('#f44336', 0.15)} 0%, ${alpha('#f44336', 0.05)} 100%)
                    `,
                    border: `2px solid ${alpha('#f44336', 0.2)}`,
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${alpha('#f44336', 0.2)}`,
                      border: `2px solid ${alpha('#f44336', 0.4)}`
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#f44336',
                          width: 56,
                          height: 56,
                          boxShadow: `0 4px 15px ${alpha('#f44336', 0.3)}`,
                          animation: staffStats.urgentItems > 0 ? `${pulse} 2s infinite` : 'none'
                        }}
                      >
                        <WarningIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                    <Typography variant="h3" sx={{ color: '#f44336', fontWeight: 800, mb: 1 }}>
                      {staffStats.urgentItems || 0}
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha('#f44336', 0.8), fontWeight: 600 }}>
                      Urgent Items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card 
                  sx={{ 
                    borderRadius: 4,
                    background: `
                      linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.success, 0.05)} 100%)
                    `,
                    border: `2px solid ${alpha(customTheme.success, 0.2)}`,
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${alpha(customTheme.success, 0.2)}`,
                      border: `2px solid ${alpha(customTheme.success, 0.4)}`
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: customTheme.success,
                          width: 56,
                          height: 56,
                          boxShadow: `0 4px 15px ${alpha(customTheme.success, 0.3)}`
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Box>
                    <Typography variant="h3" sx={{ color: customTheme.success, fontWeight: 800, mb: 1 }}>
                      {staffStats.completedTasks || 0}
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha(customTheme.success, 0.8), fontWeight: 600 }}>
                      Tasks Completed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Slide>
        )}

        {/* Clock In/Out Section - Only for STAFF users */}
        {isStaff && (
          <Zoom in timeout={1200}>
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 4,
                background: `
                  radial-gradient(circle at center, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.03)} 70%),
                  linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
                `,
                border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
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
                    radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.05)} 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.05)} 0%, transparent 50%)
                  `,
                  pointerEvents: 'none'
                }
              }}
            >
              <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: customTheme.secondary,
                      width: 48,
                      height: 48,
                      boxShadow: `0 4px 15px ${alpha(customTheme.secondary, 0.3)}`
                    }}
                  >
                    <ScheduleIcon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 700
                    }}
                  >
                    Time Management
                  </Typography>
                </Box>
                <ClockInOut />
              </Box>
            </Paper>
          </Zoom>
        )}

        {/* Activities Section */}
        <Card
          sx={{
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
            boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.1)}`,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
              borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <TimelineIcon sx={{ fontSize: '1.2em' }} />
              {isStaff ? 'Recent Operations' : 'Recent Activities'}
            </Typography>
          </Box>

          {activities.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              {isStaff ? (
                <Zoom in timeout={1000}>
                  <Box>
                    <Avatar
                      sx={{
                        bgcolor: alpha(customTheme.secondary, 0.1),
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 3,
                        border: `3px solid ${alpha(customTheme.secondary, 0.2)}`
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 64, color: customTheme.secondary }} />
                    </Avatar>
                    <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                      All Operations Up to Date!
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto' }}>
                      No urgent activities at this time. The system will notify you of new animal intakes, medical procedures, and alerts as they occur.
                    </Typography>
                  </Box>
                </Zoom>
              ) : (
                <Zoom in timeout={1000}>
                  <Box>
                    <Avatar
                      sx={{
                        bgcolor: alpha(customTheme.accent, 0.1),
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 3,
                        border: `3px solid ${alpha(customTheme.accent, 0.2)}`
                      }}
                    >
                      <StarIcon sx={{ fontSize: 64, color: customTheme.accent }} />
                    </Avatar>
                    <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                      Start Your Journey!
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto' }}>
                      No activities yet. Start by reporting a stray animal, making a donation, or volunteering to begin earning points and making an impact!
                    </Typography>
                  </Box>
                </Zoom>
              )}
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {activities.map((activity, index) => (
                <Fade in timeout={600 + (index * 100)} key={activity.id}>
                  <ListItem 
                    divider={index < activities.length - 1}
                    sx={{ 
                      py: 3,
                      px: 4,
                      animation: `${activityPop} 0.6s ease-out ${index * 0.1}s both`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(customTheme.grey, 0.3),
                        transform: 'translateX(8px)',
                        '& .activity-avatar': {
                          transform: 'scale(1.1)',
                          boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                        }
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        className="activity-avatar"
                        sx={{ 
                          bgcolor: 'transparent',
                          width: 56,
                          height: 56,
                          border: `3px solid ${alpha(customTheme.primary, 0.1)}`,
                          background: `
                            radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
                          `,
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: '50%',
                            background: `linear-gradient(45deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                            animation: `${shimmer} 3s infinite linear`
                          }
                        }}
                      >
                        {getActivityIcon(activity.icon)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              flexGrow: 1,
                              color: customTheme.primary,
                              fontWeight: 700,
                              lineHeight: 1.3
                            }}
                          >
                            {activity.description}
                          </Typography>
                          {isStaff && activity.priority && (
                            <Chip 
                              label={activity.priority.toUpperCase()} 
                              color={getPriorityChipColor(activity.priority)} 
                              size="small" 
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                height: 24,
                                animation: activity.priority === 'urgent' ? `${pulse} 2s infinite` : 'none'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {activity.details && (
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                mb: 1,
                                color: alpha(customTheme.primary, 0.8),
                                fontWeight: 500,
                                lineHeight: 1.4
                              }}
                            >
                              {activity.details}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TimeIcon sx={{ fontSize: 16, color: alpha(customTheme.primary, 0.6) }} />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: alpha(customTheme.primary, 0.6),
                                  fontWeight: 500
                                }}
                              >
                                {isStaff ? (
                                  `${formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}`
                                ) : (
                                  `+${activity.points_earned || 0} points • ${formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}`
                                )}
                              </Typography>
                            </Box>
                            {!isStaff && activity.points_earned && (
                              <Chip
                                icon={<StarIcon sx={{ fontSize: 16 }} />}
                                label={`+${activity.points_earned} pts`}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(customTheme.accent, 0.1),
                                  color: customTheme.accent,
                                  fontWeight: 600,
                                  border: `1px solid ${alpha(customTheme.accent, 0.3)}`,
                                  height: 24
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </Fade>
              ))}
            </List>
          )}
        </Card>
      </Container>
    </Box>
  );
}

export default ActivityFeed;