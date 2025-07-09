import React, { useState, useEffect, useRef } from 'react';
import { Typography, Box, Button, Grid, Container, Avatar, Fade } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReportIcon from '@mui/icons-material/Report';
import PetsIcon from '@mui/icons-material/Pets';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green 
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

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
    },
    {
      icon: <PetsIcon sx={{ fontSize: 40 }} />,
      title: "AI Adoption Matching",
      description: "Advanced algorithms match animals with perfect families based on lifestyle compatibility",
    },
    {
      icon: <HealthAndSafetyIcon sx={{ fontSize: 40 }} />,
      title: "Health Monitoring",
      description: "Comprehensive vaccination tracking and medical record management for all rescued animals",
    },
    {
      icon: <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
      title: "Community Engagement",
      description: "Volunteer coordination, donation tracking, and reward systems for active contributors",
    },
    {
      icon: <TrackChangesIcon sx={{ fontSize: 40 }} />,
      title: "Resource Optimization",
      description: "Predictive analytics for shelter capacity planning and resource allocation",
    },
    {
      icon: <SmartToyIcon sx={{ fontSize: 40 }} />,
      title: "Virtual Adoptions",
      description: "Support animals financially without physical adoption through our virtual program",
    }
  ];

  // ✅ NOW we can do conditional rendering - AFTER all hooks are called
  if (user && ['STAFF', 'SHELTER'].includes(user.user_type)) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          textAlign: 'center', 
          py: { xs: 4, md: 6 },
          px: 2,
          backgroundColor: customTheme.background,
          borderRadius: 4,
          boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
        }}>
          <Typography 
            variant="h3" 
            sx={{ 
              color: customTheme.primary,
              fontWeight: 700,
              mb: 3
            }}
          >
            Staff Operations Dashboard
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: customTheme.primary,
              opacity: 0.8,
              mb: 4
            }}
          >
            Welcome back, {user.username}! Here's your operational overview.
          </Typography>
          
          {/* Quick Action Buttons for Staff */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            flexWrap: 'wrap',
            mb: 4
          }}>
            <Button 
              variant="contained" 
              component={RouterLink}
              to="/reports"
              sx={{ 
                backgroundColor: customTheme.primary,
                '&:hover': { backgroundColor: customTheme.primary + 'dd' }
              }}
            >
              Process Reports
            </Button>
            <Button 
              variant="contained" 
              component={RouterLink}
              to="/animals"
              sx={{ 
                backgroundColor: customTheme.secondary,
                '&:hover': { backgroundColor: customTheme.secondary + 'dd' }
              }}
            >
              Manage Animals
            </Button>
            <Button 
              variant="contained" 
              component={RouterLink}
              to="/adoption/applications"
              sx={{ 
                backgroundColor: customTheme.accent,
                '&:hover': { backgroundColor: customTheme.accent + 'dd' }
              }}
            >
              Review Applications
            </Button>
            <Button 
              variant="contained" 
              component={RouterLink}
              to="/inventory/dashboard"
              sx={{ 
                backgroundColor: customTheme.success,
                '&:hover': { backgroundColor: customTheme.success + 'dd' }
              }}
            >
              Check Inventory
            </Button>
          </Box>

          {/* Staff Quick Stats */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                p: 3, 
                backgroundColor: 'white', 
                borderRadius: 2,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 'bold' }}>
                  12
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending Reports
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                p: 3, 
                backgroundColor: 'white', 
                borderRadius: 2,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h4" sx={{ color: customTheme.secondary, fontWeight: 'bold' }}>
                  45
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Animals in Care
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                p: 3, 
                backgroundColor: 'white', 
                borderRadius: 2,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h4" sx={{ color: customTheme.accent, fontWeight: 'bold' }}>
                  8
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Applications to Review
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ 
                p: 3, 
                backgroundColor: 'white', 
                borderRadius: 2,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                  3
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Critical Supplies
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography 
            variant="body1" 
            sx={{ 
              color: customTheme.primary,
              mt: 4,
              fontStyle: 'italic'
            }}
          >
            💡 This is a temporary staff dashboard. Full operational dashboard coming soon!
          </Typography>
        </Box>
      </Container>
    );
  }

  // ✅ For public users, show the original homepage
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${customTheme.background} 0%, ${customTheme.grey} 100%)`,
      overflow: 'hidden'
    }}>
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
            🎉 Report Submitted Successfully!
          </Typography>
          <Typography variant="body1" sx={{ color: '#2e7d32', mb: 2 }}>
            {confirmationData.message}
          </Typography>
          <Box sx={{ backgroundColor: '#c8e6c9', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 600 }}>
              📋 Your Tracking ID: {confirmationData.trackingId}
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
                textShadow: `2px 2px 4px ${customTheme.primary}20`
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
                fontSize: { xs: '1.5rem', md: '2rem' }
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
                fontSize: { xs: '1.1rem', md: '1.3rem' }
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
                  '&:hover': {
                    background: `linear-gradient(45deg, ${customTheme.accent}e0 30%, ${customTheme.secondary}e0 90%)`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 30px ${customTheme.accent}60`,
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
                  '&:hover': {
                    borderColor: customTheme.primary,
                    backgroundColor: customTheme.primary + '10',
                    transform: 'translateY(-2px)',
                    borderWidth: 2,
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
                  mb: 2
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
                      borderRadius: 4,
                      backgroundColor: 'transparent',
                      border: `2px solid ${customTheme.primary}20`,
                      '&:hover': {
                        borderColor: customTheme.secondary,
                        transform: 'translateY(-5px)',
                        boxShadow: `0 12px 40px ${customTheme.primary}15`,
                      },
                      transition: 'all 0.4s ease-in-out',
                      cursor: 'pointer',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: customTheme.primary,
                        width: 70,
                        height: 70,
                        flexShrink: 0,
                        boxShadow: `0 6px 20px ${customTheme.primary}30`
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: customTheme.primary,
                          fontWeight: 600,
                          mb: 2
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: customTheme.primary,
                          opacity: 0.8,
                          lineHeight: 1.6,
                          fontSize: '1.1rem'
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
            <Box sx={{ 
              textAlign: 'center',
              py: 8,
              borderRadius: 4,
              backgroundColor: customTheme.primary + '08',
              border: `1px solid ${customTheme.primary}15`
            }}>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: customTheme.primary,
                  fontWeight: 700,
                  mb: 6
                }}
              >
                Making a Difference Together
              </Typography>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      color: customTheme.accent,
                      fontWeight: 800,
                      fontSize: { xs: '3rem', md: '4rem' }
                    }}
                  >
                    500+
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 500
                    }}
                  >
                    Animals Rescued
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      color: customTheme.secondary,
                      fontWeight: 800,
                      fontSize: { xs: '3rem', md: '4rem' }
                    }}
                  >
                    1,200+
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 500
                    }}
                  >
                    Successful Adoptions
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      color: customTheme.success,
                      fontWeight: 800,
                      fontSize: { xs: '3rem', md: '4rem' }
                    }}
                  >
                    300+
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 500
                    }}
                  >
                    Active Volunteers
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;