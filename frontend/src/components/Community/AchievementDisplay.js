import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Fade,
  Slide,
  Zoom,
  alpha,
  Divider,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../../redux/api';
import AchievementBadge from './AchievementBadge';

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

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 4 }}>{children}</Box>}
    </div>
  );
}

function AchievementDisplay() {
  const [myAchievements, setMyAchievements] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [myRes, availableRes] = await Promise.all([
        api.get('/achievements/my_achievements/'),
        api.get('/achievements/available/')
      ]);
      
      setMyAchievements(myRes.data);
      setAvailableAchievements(availableRes.data);
    } catch (err) {
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalPoints = myAchievements.reduce((sum, achievement) => 
    sum + (achievement.achievement_points || 0), 0);
  const completionRate = availableAchievements.length > 0 ? 
    Math.round((myAchievements.length / (myAchievements.length + availableAchievements.length)) * 100) : 0;

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
          <CircularProgress 
            size={80} 
            thickness={3}
            sx={{ 
              color: customTheme.primary,
              animation: `${pulse} 2s infinite`,
              mb: 3
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
            Loading Achievements
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Fetching your accomplishments...
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
        <StarIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <PetsIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
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
                <TrophyIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
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
                  <TrophyIcon sx={{ fontSize: 50 }} />
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
                Your Achievements
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
                Celebrate your rescue milestones and unlock new rewards
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Slide direction="down" in timeout={800}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: `2px solid #f44336`,
                    backdropFilter: 'blur(10px)',
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem',
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {error}
                  </Typography>
                </Alert>
              </Slide>
            )}

            {/* Statistics Cards */}
            <Slide direction="up" in timeout={1200}>
              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.15)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                      borderRadius: 4,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <TrophyIcon sx={{ fontSize: 40, color: customTheme.primary, mb: 1 }} />
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {myAchievements.length}
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                        Earned
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.15)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
                      borderRadius: 4,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <StarIcon sx={{ fontSize: 40, color: customTheme.accent, mb: 1 }} />
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {totalPoints}
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                        Total Points
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.15)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                      borderRadius: 4,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <TrendingIcon sx={{ fontSize: 40, color: customTheme.secondary, mb: 1 }} />
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {completionRate}%
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                        Completion Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                      borderRadius: 4,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <LockIcon sx={{ fontSize: 40, color: customTheme.success, mb: 1 }} />
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {availableAchievements.length}
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                        Available
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Slide>

            {/* Progress Bar */}
            {(myAchievements.length > 0 || availableAchievements.length > 0) && (
              <Fade in timeout={1400}>
                <Card
                  sx={{
                    mb: 6,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.grey, 0.15)} 100%)`,
                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 700,
                        mb: 3,
                        textAlign: 'center'
                      }}
                    >
                      Achievement Progress
                    </Typography>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={completionRate} 
                        sx={{ 
                          height: 20, 
                          borderRadius: 10,
                          backgroundColor: alpha(customTheme.grey, 0.3),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: customTheme.accent,
                            borderRadius: 10,
                            background: `linear-gradient(90deg, ${customTheme.accent}, ${customTheme.secondary})`
                          }
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '1rem',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        {completionRate}%
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.8),
                        textAlign: 'center',
                        fontWeight: 500
                      }}
                    >
                      {myAchievements.length} of {myAchievements.length + availableAchievements.length} achievements unlocked
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            )}

            {/* Main Achievements Card */}
            <Card
              sx={{
                borderRadius: 6,
                overflow: 'hidden',
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
              }}
            >
              <CardContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
                {/* Tabs Header */}
                <Box sx={{ 
                  background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.08)} 0%, ${alpha(customTheme.primary, 0.03)} 100%)`,
                  borderBottom: `3px solid ${alpha(customTheme.primary, 0.2)}`
                }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={{
                      '& .MuiTabs-indicator': {
                        backgroundColor: customTheme.accent,
                        height: 4,
                        borderRadius: 2
                      },
                      '& .MuiTab-root': {
                        color: alpha(customTheme.primary, 0.7),
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        py: 3,
                        '&.Mui-selected': {
                          color: customTheme.primary,
                          fontWeight: 800
                        }
                      }
                    }}
                  >
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CheckIcon />
                          Earned ({myAchievements.length})
                        </Box>
                      } 
                    />
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LockIcon />
                          Available ({availableAchievements.length})
                        </Box>
                      } 
                    />
                  </Tabs>
                </Box>

                {/* Tab Panels */}
                <TabPanel value={tabValue} index={0}>
                  {myAchievements.length === 0 ? (
                    <Zoom in timeout={1000}>
                      <Box sx={{ py: 8, textAlign: 'center' }}>
                        <TrophyIcon 
                          sx={{ 
                            fontSize: 120, 
                            color: alpha(customTheme.primary, 0.3), 
                            mb: 3,
                            animation: `${float} 4s ease-in-out infinite`
                          }} 
                        />
                        <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                          No achievements yet
                        </Typography>
                        <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto' }}>
                          Start contributing to animal rescue to earn your first achievement!
                        </Typography>
                      </Box>
                    </Zoom>
                  ) : (
                    <Grid container spacing={3}>
                      {myAchievements.map((userAchievement, index) => (
                        <Grid item xs={6} sm={4} md={3} lg={2.4} key={userAchievement.id}>
                          <Fade in timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                            <Box>
                              <AchievementBadge 
                                achievement={{
                                  name: userAchievement.achievement_name,
                                  description: userAchievement.achievement_description,
                                  icon: userAchievement.achievement_icon,
                                  points_reward: userAchievement.achievement_points || 0
                                }} 
                                earned={true} 
                              />
                            </Box>
                          </Fade>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {availableAchievements.length === 0 ? (
                    <Zoom in timeout={1000}>
                      <Box sx={{ py: 8, textAlign: 'center' }}>
                        <StarIcon 
                          sx={{ 
                            fontSize: 120, 
                            color: alpha(customTheme.accent, 0.3), 
                            mb: 3,
                            animation: `${sparkle} 4s ease-in-out infinite`
                          }} 
                        />
                        <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                          All achievements unlocked!
                        </Typography>
                        <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto' }}>
                          Congratulations! You've earned every available achievement. Check back for new ones!
                        </Typography>
                      </Box>
                    </Zoom>
                  ) : (
                    <Grid container spacing={3}>
                      {availableAchievements.map((achievement, index) => (
                        <Grid item xs={6} sm={4} md={3} lg={2.4} key={achievement.id}>
                          <Fade in timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                            <Box>
                              <AchievementBadge 
                                achievement={achievement} 
                                earned={false} 
                              />
                            </Box>
                          </Fade>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </TabPanel>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default AchievementDisplay;