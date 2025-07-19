import React, { useState, useEffect, useRef } from 'react';
import { Typography, Box, Button, Grid, Container, Avatar, Fade, Card, CardContent, Chip, Paper, Divider } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReportIcon from '@mui/icons-material/Report';
import PetsIcon from '@mui/icons-material/Pets';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SparkleIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PolicyIcon from '@mui/icons-material/Policy';
import { keyframes } from '@mui/system';
import { alpha } from '@mui/material/styles';

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

function HomePage() {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const [visibleSections, setVisibleSections] = useState({});
  const sectionsRef = useRef({});
  const { user } = useSelector((state) => state.auth);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const location = useLocation();

  // ✅ useEffect hook must be called every time
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisibleSections(prev => ({
            ...prev,
            [entry.target.dataset.section]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.3 }
    );

    Object.values(sectionsRef.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (location.state?.showTrackingInfo) {
      setConfirmationData(location.state);
      setShowConfirmation(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ Other functions can be defined here
  const setSectionRef = (name) => (el) => {
    sectionsRef.current[name] = el;
  };

  const features = [
    {
      icon: <ReportIcon sx={{ fontSize: 40 }} />,
      title: "Real-Time Reporting",
      description: "Report stray animals with GPS tracking and instant notifications to rescue teams",
      gradient: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
      iconColor: customTheme.accent,
    },
    {
      icon: <PetsIcon sx={{ fontSize: 40 }} />,
      title: "AI Adoption Matching",
      description: "Advanced algorithms match animals with perfect families based on lifestyle compatibility",
      gradient: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
      iconColor: customTheme.primary,
    },
    {
      icon: <HealthAndSafetyIcon sx={{ fontSize: 40 }} />,
      title: "Health Monitoring",
      description: "Comprehensive vaccination tracking and medical record management for all rescued animals",
      gradient: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
      iconColor: customTheme.success,
    },
    {
      icon: <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
      title: "Community Engagement",
      description: "Volunteer coordination, donation tracking, and reward systems for active contributors",
      gradient: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
      iconColor: customTheme.secondary,
    },
    {
      icon: <TrackChangesIcon sx={{ fontSize: 40 }} />,
      title: "Resource Optimization",
      description: "Predictive analytics for shelter capacity planning and resource allocation",
      gradient: `linear-gradient(135deg, ${alpha('#9c27b0', 0.1)} 0%, ${alpha('#9c27b0', 0.05)} 100%)`,
      iconColor: '#9c27b0',
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
      title: "Virtual Adoptions",
      description: "Support animals financially without physical adoption through our virtual program",
      gradient: `linear-gradient(135deg, ${alpha('#ff9800', 0.1)} 0%, ${alpha('#ff9800', 0.05)} 100%)`,
      iconColor: '#ff9800',
    }
  ];

  // Shelter quick actions (Management focused)
  const shelterActions = [
    {
      icon: <DashboardIcon sx={{ fontSize: 30 }} />,
      title: "Operational Dashboard",
      description: "View comprehensive shelter analytics and insights",
      path: "/dashboard",
      color: customTheme.primary,
      urgent: false
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 30 }} />,
      title: "Staff Management",
      description: "Manage staff schedules, assignments, and performance",
      path: "/staff-management",
      color: customTheme.secondary,
      urgent: false
    },
    {
      icon: <VolunteerActivismIcon sx={{ fontSize: 30 }} />,
      title: "Volunteer Management",
      description: "Coordinate and manage volunteer activities",
      path: "/shelter/volunteer-management",
      color: customTheme.accent,
      urgent: false
    },
    {
      icon: <LocalHospitalIcon sx={{ fontSize: 30 }} />,
      title: "Medical Management",
      description: "Oversee medical protocols and health records",
      path: "/medical-management",
      color: '#f44336',
      urgent: true,
      badge: "1 Urgent"
    },
    {
      icon: <PolicyIcon sx={{ fontSize: 30 }} />,
      title: "Budget Management",
      description: "Monitor finances and resource allocation",
      path: "/budget-management",
      color: '#9c27b0',
      urgent: false
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 30 }} />,
      title: "Adoption Processing",
      description: "Review and approve adoption applications",
      path: "/adoption/applications",
      color: customTheme.success,
      urgent: false,
      badge: "8 Pending"
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 30 }} />,
      title: "Inventory Management",
      description: "Track supplies and equipment inventory",
      path: "/inventory/dashboard",
      color: '#ff9800',
      urgent: true,
      badge: "3 Critical"
    },
    {
      icon: <ReportIcon sx={{ fontSize: 30 }} />,
      title: "Reports Overview",
      description: "Monitor incoming animal reports and responses",
      path: "/reports",
      color: customTheme.primary,
      urgent: false
    }
  ];

  // Staff quick actions (Operational focused)
  const staffActions = [
    {
      icon: <DashboardIcon sx={{ fontSize: 30 }} />,
      title: "Operational Dashboard",
      description: "View daily operations and statistics",
      path: "/dashboard",
      color: customTheme.primary,
      urgent: false
    },
    {
      icon: <PetsIcon sx={{ fontSize: 30 }} />,
      title: "Animal Management",
      description: "Manage animal records and daily care",
      path: "/animals",
      color: customTheme.secondary,
      urgent: false
    },
    {
      icon: <LocalHospitalIcon sx={{ fontSize: 30 }} />,
      title: "Medical Care",
      description: "Handle medical treatments and health tracking",
      path: "/staff/medical-management",
      color: '#f44336',
      urgent: true,
      badge: "2 Critical"
    },
    {
      icon: <TransferWithinAStationIcon sx={{ fontSize: 30 }} />,
      title: "Animal Transfers",
      description: "Coordinate inter-shelter animal transfers",
      path: "/transfer-management",
      color: customTheme.accent,
      urgent: false
    },
    {
      icon: <ReportIcon sx={{ fontSize: 30 }} />,
      title: "Field Reports",
      description: "Process and respond to animal reports",
      path: "/reports",
      color: '#ff9800',
      urgent: true,
      badge: "12 Pending"
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 30 }} />,
      title: "Adoption Support",
      description: "Assist with adoption applications and matching",
      path: "/adoption/applications",
      color: customTheme.success,
      urgent: false
    },
    {
      icon: <InventoryIcon sx={{ fontSize: 30 }} />,
      title: "Supply Management",
      description: "Check and request supplies for daily operations",
      path: "/inventory/items",
      color: customTheme.primary,
      urgent: false
    },
    {
      icon: <HealthAndSafetyIcon sx={{ fontSize: 30 }} />,
      title: "Staff Wellness",
      description: "Access wellness resources and support",
      path: "/staff-wellness",
      color: customTheme.secondary,
      urgent: false
    }
  ];

  // Get current user's actions based on type
  const currentUserActions = user?.user_type === 'SHELTER' ? shelterActions : staffActions;

  // ✅ NOW we can do conditional rendering - AFTER all hooks are called
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
          <SparkleIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
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
          <PetsIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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

        <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
          {/* Hero Welcome Section */}
          <Fade in timeout={1000}>
            <Box sx={{ mb: 6, position: 'relative' }}>
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
                <SparkleIcon sx={{ color: customTheme.accent, fontSize: 20 }} />
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
              
              <Paper sx={{
                p: 4,
                borderRadius: 6,
                background: `
                  radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                  linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`,
                backdropFilter: 'blur(20px)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.background, 0.8)} 0%, transparent 50%),
                    radial-gradient(circle at top right, ${alpha(customTheme.accent, 0.1)} 0%, transparent 50%)
                  `,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                  zIndex: 1,
                  borderRadius: 6,
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `
                    0 30px 60px ${alpha(customTheme.primary, 0.2)},
                    0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  '&::before': {
                    opacity: 1
                  }
                },
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative', zIndex: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: customTheme.primary,
                      width: 80,
                      height: 80,
                      mr: 4,
                      boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                      animation: `${pulse} 3s infinite`,
                      border: `3px solid ${alpha('#ffffff', 0.3)}`
                    }}
                  >
                    <PetsIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
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
                        mb: 1,
                        textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {user?.user_type === 'SHELTER' ? 'Shelter Management Hub' : 'Field Operations Center'}
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.8),
                        fontWeight: 600,
                        mb: 1,
                        animation: `${slideInUp} 1s ease-out 0.2s both`
                      }}
                    >
                      Hello, {user.username}!
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.7),
                        fontWeight: 400,
                        lineHeight: 1.6,
                        animation: `${slideInUp} 1s ease-out 0.4s both`
                      }}
                    >
                      {user?.user_type === 'SHELTER' 
                        ? 'Your comprehensive management dashboard for shelter administration, staff coordination, and strategic oversight'
                        : 'Your operational command center for daily animal care, field responses, and hands-on rescue work'
                      }
                    </Typography>
                  </Box>
                </Box>

                {/* Quick Status Overview */}
                <Grid container spacing={2} sx={{ mt: 2, position: 'relative', zIndex: 2 }}>
                  {user?.user_type === 'SHELTER' ? (
                    // Shelter Manager Status
                    <>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                          border: `1px solid ${alpha(customTheme.primary, 0.2)}`,
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                          }
                        }}>
                          <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 'bold' }}>
                            24
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Staff Members
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha('#9c27b0', 0.1)} 0%, ${alpha('#9c27b0', 0.05)} 100%)`,
                          border: `1px solid ${alpha('#9c27b0', 0.2)}`,
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha('#9c27b0', 0.2)}`
                          }
                        }}>
                          <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                            87%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Budget Utilized
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                          border: `1px solid ${alpha(customTheme.secondary, 0.2)}`,
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.2)}`
                          }
                        }}>
                          <Typography variant="h4" sx={{ color: customTheme.secondary, fontWeight: 'bold' }}>
                            15
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Active Volunteers
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                          border: `1px solid ${alpha(customTheme.success, 0.2)}`,
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.2)}`
                          }
                        }}>
                          <Typography variant="h4" sx={{ color: customTheme.success, fontWeight: 'bold' }}>
                            92%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Adoption Rate
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  ) : (
                    // Staff Operations Status
                    <>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                          border: `1px solid ${alpha(customTheme.accent, 0.2)}`,
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.2)}`
                          }
                        }}>
                          <Typography variant="h4" sx={{ color: customTheme.accent, fontWeight: 'bold' }}>
                            12
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Pending Reports
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                          border: `1px solid ${alpha(customTheme.secondary, 0.2)}`,
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.2)}`
                          }
                        }}>
                          <Typography variant="h4" sx={{ color: customTheme.secondary, fontWeight: 'bold' }}>
                            45
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Animals in Care
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha('#f44336', 0.1)} 0%, ${alpha('#f44336', 0.05)} 100%)`,
                          border: `1px solid ${alpha('#f44336', 0.2)}`,
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha('#f44336', 0.2)}`
                          }
                        }}>
                          <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                            2
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Medical Urgents
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                          border: `1px solid ${alpha(customTheme.primary, 0.2)}`,
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                          }
                        }}>
                          <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 'bold' }}>
                            3
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Transfers Today
                          </Typography>
                        </Box>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Box>
          </Fade>

          {/* Quick Actions Section */}
          <Box 
            ref={setSectionRef('actions')}
            data-section="actions"
            sx={{ mb: 6 }}
          >
            <Fade in={visibleSections.actions} timeout={800}>
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    textAlign: 'center',
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 2,
                    background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                    backgroundSize: '200% 200%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: `${gradientShift} 4s ease infinite`,
                  }}
                >
                  {user?.user_type === 'SHELTER' ? 'Management Operations' : 'Field Operations'}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    textAlign: 'center',
                    color: alpha(customTheme.primary, 0.8),
                    mb: 6,
                    maxWidth: 600,
                    mx: 'auto',
                    animation: `${slideInUp} 1s ease-out 0.3s both`
                  }}
                >
                  {user?.user_type === 'SHELTER' 
                    ? 'Strategic management tools for shelter administration and oversight'
                    : 'Direct action tools for daily animal care and field operations'
                  }
                </Typography>
              </Box>
            </Fade>
            
            <Grid container spacing={3}>
              {currentUserActions.map((action, index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <Fade 
                    in={visibleSections.actions} 
                    timeout={1000} 
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Card
                      component={RouterLink}
                      to={action.path}
                      sx={{
                        textDecoration: 'none',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 5,
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `2px solid ${alpha(action.color, 0.2)}`,
                        position: 'relative',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `
                            linear-gradient(135deg, ${alpha(action.color, 0.1)} 0%, transparent 50%),
                            radial-gradient(circle at top right, ${alpha(action.color, 0.08)} 0%, transparent 50%)
                          `,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          pointerEvents: 'none',
                          zIndex: 1
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                          transition: 'left 0.6s ease',
                          pointerEvents: 'none',
                          zIndex: 2
                        },
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: `
                            0 25px 50px ${alpha(action.color, 0.25)},
                            0 0 0 1px ${alpha(action.color, 0.2)},
                            inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                          `,
                          border: `2px solid ${alpha(action.color, 0.4)}`,
                          '&::before': {
                            opacity: 1
                          },
                          '&::after': {
                            left: '100%'
                          }
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(action.color, 0.15),
                              color: action.color,
                              width: 60,
                              height: 60,
                              mr: 2,
                              border: `2px solid ${alpha(action.color, 0.3)}`,
                              boxShadow: `0 4px 12px ${alpha(action.color, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '.MuiCard-root:hover &': {
                                transform: 'scale(1.1)',
                                boxShadow: `0 6px 20px ${alpha(action.color, 0.3)}`
                              }
                            }}
                          >
                            {action.icon}
                          </Avatar>
                          {action.badge && (
                            <Chip
                              label={action.badge}
                              size="small"
                              color={action.urgent ? "error" : "warning"}
                              sx={{
                                fontWeight: 600,
                                animation: action.urgent ? `${pulse} 2s infinite` : 'none',
                                borderRadius: 2,
                                '.MuiChip-label': {
                                  fontSize: '0.75rem'
                                }
                              }}
                            />
                          )}
                        </Box>
                        
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: action.color,
                            mb: 1,
                            lineHeight: 1.3
                          }}
                        >
                          {action.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: alpha(customTheme.primary, 0.7),
                            lineHeight: 1.5,
                            fontWeight: 500
                          }}
                        >
                          {action.description}
                        </Typography>

                        {action.urgent && (
                          <Box sx={{ 
                            mt: 2, 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: alpha('#f44336', 0.1),
                            border: `1px solid ${alpha('#f44336', 0.2)}`
                          }}>
                            <NotificationsActiveIcon sx={{ 
                              fontSize: 16, 
                              color: '#f44336',
                              animation: `${pulse} 1.5s infinite`
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: '#f44336', 
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Attention Required
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Recent Activity & Insights */}
          <Box 
            ref={setSectionRef('insights')}
            data-section="insights"
            sx={{ mb: 6 }}
          >
            <Fade in={visibleSections.insights} timeout={1000}>
              <Paper sx={{
                p: 4,
                borderRadius: 6,
                background: `
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                backdropFilter: 'blur(20px)',
                boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.background, 0.8)} 0%, transparent 50%),
                    radial-gradient(circle at top right, ${alpha(customTheme.accent, 0.1)} 0%, transparent 50%)
                  `,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                  zIndex: 1,
                  borderRadius: 6,
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `
                    0 30px 60px ${alpha(customTheme.primary, 0.15)},
                    0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  '&::before': {
                    opacity: 1
                  }
                },
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <Typography variant="h5" sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 700,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  position: 'relative',
                  zIndex: 2
                }}>
                  <TrendingUpIcon />
                  {user?.user_type === 'SHELTER' ? "Strategic Insights" : "Daily Operations Update"}
                </Typography>
                
                <Grid container spacing={3} sx={{ position: 'relative', zIndex: 2 }}>
                  {user?.user_type === 'SHELTER' ? (
                    // Shelter Manager Insights
                    <>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" color={customTheme.primary} sx={{ fontWeight: 600, mb: 1 }}>
                          Financial Performance
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Monthly budget utilization at 87% - within target range. Donation revenue up 23% this quarter. Consider expanding fundraising initiatives.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" color={customTheme.primary} sx={{ fontWeight: 600, mb: 1 }}>
                          Staff & Volunteers
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Staff satisfaction ratings improved to 4.2/5. Volunteer retention increased 18% with new training program. Schedule staff wellness review.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" color={customTheme.primary} sx={{ fontWeight: 600, mb: 1 }}>
                          Strategic Planning
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Adoption rates exceed targets by 12%. Consider expanding facility capacity. Partner outreach program showing promising results.
                        </Typography>
                      </Grid>
                    </>
                  ) : (
                    // Staff Operations Insights
                    <>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" color={customTheme.primary} sx={{ fontWeight: 600, mb: 1 }}>
                          Priority Tasks
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          2 animals need immediate medical attention. 12 reports pending field response. 3 animals ready for transfer coordination.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" color={customTheme.primary} sx={{ fontWeight: 600, mb: 1 }}>
                          Daily Performance
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Response time averaging 1.2 hours - excellent work! Animal care protocols 100% compliant today. 5 successful rescues completed.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" color={customTheme.primary} sx={{ fontWeight: 600, mb: 1 }}>
                          Resource Status
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Medical supplies sufficient for 2 weeks. Transportation vehicles all operational. Check food inventory by Wednesday.
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Fade>
          </Box>
        </Container>
      </Box>
    );
  }

  // ✅ For public users, show the original homepage
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
        <SparkleIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
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
        <PetsIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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

      {showConfirmation && confirmationData && (
        <Box sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: '90%',
          maxWidth: 600,
          backgroundColor: '#e8f5e8',
          border: '2px solid #4caf50',
          borderRadius: 2,
          p: 3,
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)'
        }}>
          <Typography variant="h5" sx={{ color: '#1b5e20', fontWeight: 700, mb: 2 }}>
            Report Submitted Successfully!
          </Typography>
          <Typography variant="body1" sx={{ color: '#2e7d32', mb: 2 }}>
            {confirmationData.message}
          </Typography>
          <Box sx={{ backgroundColor: '#c8e6c9', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 600 }}>
              Your Tracking ID: {confirmationData.trackingId}
            </Typography>
            <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: '0.9rem' }}>
              Save this ID to track your report status anytime
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            onClick={() => setShowConfirmation(false)}
            sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#45a049' } }}
          >
            Got it!
          </Button>
        </Box>
      )}
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Fade in={true} timeout={1000}>
          <Box sx={{ 
            textAlign: 'center', 
            py: { xs: 6, md: 10 },
            px: 2,
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography 
              variant="h1" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '3rem', md: '4.5rem' },
                textShadow: `2px 2px 4px ${customTheme.primary}20`,
                background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientShift} 4s ease infinite`,
              }}
            >
              Welcome to PAWRescue
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 400,
                mb: 2,
                opacity: 0.9,
                fontSize: { xs: '1.5rem', md: '2rem' },
                animation: `${slideInUp} 1s ease-out 0.2s both`
              }}
            >
              Advanced Stray Animal Management Platform
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: customTheme.primary,
                opacity: 0.8,
                mb: 6,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                animation: `${slideInUp} 1s ease-out 0.4s both`
              }}
            >
              Transforming urban animal welfare through real-time tracking, AI-powered matching, 
              comprehensive health monitoring, and community-driven rescue operations
            </Typography>
            
            {/* CTA Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: `${slideInUp} 1s ease-out 0.6s both`
            }}>
              <Button 
                variant="contained" 
                size="large"
                component={RouterLink}
                to="/report-animal"
                sx={{ 
                  py: 2,
                  px: 5,
                  borderRadius: 4,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                  boxShadow: `0 6px 20px ${customTheme.accent}50`,
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
                  '&:hover': {
                    background: `linear-gradient(45deg, ${customTheme.accent}e0 30%, ${customTheme.secondary}e0 90%)`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 30px ${customTheme.accent}60`,
                    '&::before': {
                      left: '100%'
                    }
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Report a Stray Animal
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                component={RouterLink}
                to="/animals"
                sx={{ 
                  py: 2,
                  px: 5,
                  borderRadius: 4,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  borderColor: customTheme.primary,
                  color: customTheme.primary,
                  borderWidth: 2,
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    borderColor: customTheme.primary,
                    backgroundColor: customTheme.primary + '10',
                    transform: 'translateY(-2px)',
                    borderWidth: 2,
                    boxShadow: `0 6px 20px ${alpha(customTheme.primary, 0.3)}`
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                View Adoptable Animals
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Features Section */}
        <Box 
          ref={setSectionRef('features')}
          data-section="features"
          sx={{ py: { xs: 6, md: 10 } }}
        >
          <Fade in={visibleSections.features} timeout={800}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  textAlign: 'center',
                  color: customTheme.primary,
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 4s ease infinite`,
                }}
              >
                Platform Features
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  textAlign: 'center',
                  color: customTheme.primary,
                  opacity: 0.8,
                  mb: 8,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Comprehensive tools for modern stray animal management and community engagement
              </Typography>
            </Box>
          </Fade>
          
          <Grid container spacing={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Fade 
                  in={visibleSections.features} 
                  timeout={1000} 
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 3,
                      p: 4,
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${alpha(feature.iconColor, 0.2)}`,
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      cursor: 'pointer',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: feature.gradient,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                        zIndex: 1,
                        borderRadius: 6,
                      },
                      '&:hover': {
                        borderColor: feature.iconColor,
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `
                          0 20px 40px ${alpha(feature.iconColor, 0.25)},
                          0 0 0 1px ${alpha(feature.iconColor, 0.1)},
                          inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                        `,
                        '&::before': {
                          opacity: 1
                        }
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha(feature.iconColor, 0.15),
                        color: feature.iconColor,
                        width: 70,
                        height: 70,
                        flexShrink: 0,
                        boxShadow: `0 6px 20px ${alpha(feature.iconColor, 0.3)}`,
                        border: `2px solid ${alpha(feature.iconColor, 0.3)}`,
                        position: 'relative',
                        zIndex: 2,
                        transition: 'all 0.3s ease',
                        ':hover': {
                          transform: 'scale(1.1)',
                          boxShadow: `0 8px 25px ${alpha(feature.iconColor, 0.4)}`
                        }
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box sx={{ position: 'relative', zIndex: 2 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: feature.iconColor,
                          fontWeight: 700,
                          mb: 2,
                          lineHeight: 1.3
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: alpha(customTheme.primary, 0.8),
                          lineHeight: 1.6,
                          fontSize: '1.1rem',
                          fontWeight: 500
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stats Section */}
        <Box 
          ref={setSectionRef('stats')}
          data-section="stats"
          sx={{ py: { xs: 6, md: 8 } }}
        >
          <Fade in={visibleSections.stats} timeout={1000}>
            <Paper sx={{ 
              textAlign: 'center',
              py: 8,
              px: 4,
              borderRadius: 6,
              background: `
                linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
              `,
              border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.8)} 0%, transparent 50%),
                  radial-gradient(circle at top right, ${alpha(customTheme.accent, 0.1)} 0%, transparent 50%)
                `,
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: 1,
                borderRadius: 6,
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `
                  0 30px 60px ${alpha(customTheme.primary, 0.15)},
                  0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                  inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                `,
                '&::before': {
                  opacity: 1
                }
              },
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: customTheme.primary,
                  fontWeight: 700,
                  mb: 6,
                  background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 4s ease infinite`,
                  position: 'relative',
                  zIndex: 2
                }}
              >
                Making a Difference Together
              </Typography>
              <Grid container spacing={6} sx={{ position: 'relative', zIndex: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    }
                  }}>
                    <Typography 
                      variant="h1" 
                      sx={{ 
                        color: customTheme.accent,
                        fontWeight: 800,
                        fontSize: { xs: '3rem', md: '4rem' },
                        mb: 1,
                        textShadow: `0 4px 20px ${alpha(customTheme.accent, 0.3)}`
                      }}
                    >
                      500+
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600
                      }}
                    >
                      Animals Rescued
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    }
                  }}>
                    <Typography 
                      variant="h1" 
                      sx={{ 
                        color: customTheme.secondary,
                        fontWeight: 800,
                        fontSize: { xs: '3rem', md: '4rem' },
                        mb: 1,
                        textShadow: `0 4px 20px ${alpha(customTheme.secondary, 0.3)}`
                      }}
                    >
                      1,200+
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600
                      }}
                    >
                      Successful Adoptions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    }
                  }}>
                    <Typography 
                      variant="h1" 
                      sx={{ 
                        color: customTheme.success,
                        fontWeight: 800,
                        fontSize: { xs: '3rem', md: '4rem' },
                        mb: 1,
                        textShadow: `0 4px 20px ${alpha(customTheme.success, 0.3)}`
                      }}
                    >
                      300+
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600
                      }}
                    >
                      Active Volunteers
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;