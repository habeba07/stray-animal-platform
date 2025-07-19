// Enhanced InteractiveLearningPage.js with impressive styling

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
  Badge,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar,
  Fade,
  Slide,
  Zoom,
  Divider,
  alpha,
} from '@mui/material';
import {
  School as SchoolIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  Emergency as EmergencyIcon,
  LocalHospital as FirstAidIcon,
  Psychology as BehaviorIcon,
  Group as TeamIcon,
  Pets as AnimalIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Lock as LockIcon,
  AutoAwesome as SparkleIcon,
  Favorite as FavoriteIcon,
  MenuBook as BookIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  VerifiedUser as CertifiedIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../redux/api';
import InteractiveLearning from '../components/Resources/InteractiveLearning';

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

const successPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const progressGlow = keyframes`
  0% { box-shadow: 0 0 5px ${alpha(customTheme.success, 0.3)}; }
  50% { box-shadow: 0 0 20px ${alpha(customTheme.success, 0.6)}; }
  100% { box-shadow: 0 0 5px ${alpha(customTheme.success, 0.3)}; }
`;

const InteractiveLearningPage = () => {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProgress, setUserProgress] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch training resources
      const response = await api.get('/resources/', {
        params: {
          category__slug: 'rescue-training',
          limit: 50
        }
      });

      console.log('API Response:', response.data);
      console.log('Response length:', response.data.length);
      console.log('Resources set to:', response.data);
      
      const trainingResources = response.data.results || response.data || [];
      setResources(trainingResources);

      // Fetch user's training progress
      try {
        const progressResponse = await api.get('/volunteers/learning-progress/my_progress/');
        const progressData = progressResponse.data || [];
        
        // Convert to lookup object
        const progressLookup = {};
        progressData.forEach(progress => {
          if (progress.module) {
            progressLookup[progress.module] = progress;
          }
        });
        setUserProgress(progressLookup);
      } catch (err) {
        console.log('No progress data available yet');
      }

      // Show welcome dialog for first-time users
      if (trainingResources.length > 0 && Object.keys(userProgress).length === 0) {
        setShowWelcome(true);
      }

    } catch (err) {
      console.error('Error fetching training data:', err);
      setError('Failed to load training courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (title) => {
    if (title.includes('Fundamentals')) return <EmergencyIcon />;
    if (title.includes('First Aid')) return <FirstAidIcon />;
    if (title.includes('Large Animal')) return <AnimalIcon />;
    if (title.includes('Behavior')) return <BehaviorIcon />;
    if (title.includes('Scene Management')) return <TeamIcon />;
    return <SchoolIcon />;
  };

  const getProgressInfo = (resource) => {
    if (!resource.interactive_module) return null;
    
    const progress = userProgress[resource.interactive_module.id];
    return progress || null;
  };

  const getDifficultyLevel = (title) => {
    if (title.includes('Fundamentals')) return 'Beginner';
    if (title.includes('First Aid')) return 'Intermediate';
    if (title.includes('Large Animal')) return 'Advanced';
    if (title.includes('Behavior')) return 'Intermediate';
    if (title.includes('Scene Management')) return 'Advanced';
    return 'Beginner';
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  const isPrerequisiteMet = (resource) => {
    // Simple prerequisite logic - Fundamentals should be completed first
    if (resource.title.includes('Fundamentals')) return true;
    
    const fundamentalsCompleted = resources.some(r => 
      r.title.includes('Fundamentals') && 
      (getProgressInfo(r)?.status === 'COMPLETED' || getProgressInfo(r)?.status === 'PASSED')
    );
    
    // Intermediate courses require Fundamentals
    if (resource.title.includes('First Aid') || resource.title.includes('Behavior')) {
      return fundamentalsCompleted;
    }
    
    // Advanced courses require at least one Intermediate completed
    if (resource.title.includes('Large Animal') || resource.title.includes('Scene Management')) {
      const intermediateCompleted = resources.some(r => 
        (r.title.includes('First Aid') || r.title.includes('Behavior')) &&
        (getProgressInfo(r)?.status === 'COMPLETED' || getProgressInfo(r)?.status === 'PASSED')
      );
      return fundamentalsCompleted && intermediateCompleted;
    }
    
    return fundamentalsCompleted;
  };

  const handleTrainingCompletion = async (resourceSlug, completionData) => {
    console.log('Training completed:', resourceSlug, completionData);
  
    try {
      // Wait a moment for backend signal to process
      setTimeout(async () => {
        try {
          // Refresh volunteer qualifications
          await api.post('/volunteers/rescue-assignments/refresh_qualifications/');
        
          // Show success message with qualification update
          setError(`Training completed! Your rescue qualifications have been updated. You can now access new rescue opportunities!`);
        
          // Refresh training data to show completion
          fetchTrainingData();
        
          // Optional: Navigate back to volunteer hub to see new opportunities
          setTimeout(() => {
            if (window.confirm('Training completed! Would you like to check for new rescue opportunities?')) {
              window.location.href = '/volunteer/hub';
            }
          }, 3000);
        
        } catch (refreshError) {
          console.warn('Could not refresh qualifications immediately:', refreshError);
          setError(`Training completed! Please refresh the page to see updated qualifications.`);
        }
      }, 2000); // Give backend signal time to process
    
    } catch (error) {
      console.error('Error handling training completion:', error);
    }
  };

  const calculateOverallProgress = () => {
    if (resources.length === 0) return 0;
    
    const completedCount = resources.filter(resource => {
      const progress = getProgressInfo(resource);
      return progress?.status === 'COMPLETED' || progress?.status === 'PASSED';
    }).length;
    
    return Math.round((completedCount / resources.length) * 100);
  };

  const getCompletedCertifications = () => {
    return resources.filter(resource => {
      const progress = getProgressInfo(resource);
      return progress?.status === 'PASSED' && progress?.best_score >= 80;
    }).length;
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
          <SchoolIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <BookIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
            Loading Training Center
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Preparing your learning modules...
          </Typography>
        </Box>
      </Box>
    );
  }

  // If a course is selected, show only that course
  if (selectedResource) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Button 
          onClick={() => setSelectedResource(null)}
          startIcon={<PlayIcon />}
          sx={{ 
            mb: 3, 
            bgcolor: customTheme.primary, 
            color: 'white',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': { 
              bgcolor: alpha(customTheme.primary, 0.9),
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
            }
          }}
        >
          Back to Training Center
        </Button>
        <InteractiveLearning 
          resourceSlug={selectedResource} 
          onComplete={(completionData) => {
            handleTrainingCompletion(selectedResource, completionData);
            fetchTrainingData();
            setSelectedResource(null);
          }}
        />
      </Container>
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
      pb: 6
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
        <SchoolIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <TrophyIcon sx={{ fontSize: 25, color: customTheme.accent, transform: 'rotate(45deg)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header Section */}
        <Fade in timeout={1000}>
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
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                  animation: `${pulse} 3s infinite`
                }}
              >
                <SchoolIcon sx={{ fontSize: 40 }} />
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
                letterSpacing: '-0.02em'
              }}
            >
              Emergency Animal Rescue Training Center
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 400,
                lineHeight: 1.6,
                animation: `${slideInUp} 1s ease-out 0.3s both`,
                mb: 4
              }}
            >
              Professional training modules based on ASPCA, FEMA, and American Humane protocols
            </Typography>

            {/* Enhanced Progress Summary */}
            {resources.length > 0 && (
              <Fade in timeout={1200}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 4, 
                  mb: 4,
                  flexWrap: 'wrap'
                }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                      textAlign: 'center',
                      minWidth: 120,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.2)}`
                      }
                    }}
                  >
                    <Typography variant="h3" sx={{ 
                      color: customTheme.primary,
                      fontWeight: 800,
                      mb: 1
                    }}>
                      {calculateOverallProgress()}%
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: alpha(customTheme.primary, 0.8),
                      fontWeight: 600
                    }}>
                      Overall Progress
                    </Typography>
                  </Paper>
                  
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                      textAlign: 'center',
                      minWidth: 120,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.2)}`
                      }
                    }}
                  >
                    <Typography variant="h3" sx={{ 
                      color: customTheme.success,
                      fontWeight: 800,
                      mb: 1
                    }}>
                      {getCompletedCertifications()}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: alpha(customTheme.success, 0.9),
                      fontWeight: 600
                    }}>
                      Certifications Earned
                    </Typography>
                  </Paper>
                  
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.15)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
                      textAlign: 'center',
                      minWidth: 120,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.2)}`
                      }
                    }}
                  >
                    <Typography variant="h3" sx={{ 
                      color: customTheme.accent,
                      fontWeight: 800,
                      mb: 1
                    }}>
                      {resources.length}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: alpha(customTheme.accent, 0.9),
                      fontWeight: 600
                    }}>
                      Training Modules
                    </Typography>
                  </Paper>
                </Box>
              </Fade>
            )}

            {/* Enhanced Overall Progress Bar */}
            {resources.length > 0 && (
              <Fade in timeout={1400}>
                <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateOverallProgress()} 
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      bgcolor: alpha(customTheme.grey, 0.3),
                      boxShadow: `inset 0 2px 4px ${alpha('#000000', 0.1)}`,
                      animation: calculateOverallProgress() > 0 ? `${progressGlow} 2s infinite` : 'none',
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                        borderRadius: 6,
                        boxShadow: `0 2px 8px ${alpha(customTheme.success, 0.3)}`
                      }
                    }}
                  />
                  <Typography variant="body1" sx={{ 
                    mt: 2,
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 600
                  }}>
                    {calculateOverallProgress()}% Complete • {resources.length - getCompletedCertifications()} modules remaining
                  </Typography>
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>

        {error && (
          <Slide direction="down" in timeout={800}>
            <Alert 
              severity={error.includes('completed') ? 'success' : 'error'} 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: `2px solid ${error.includes('completed') ? customTheme.success : '#f44336'}`,
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

        {/* Training Modules */}
        {resources.length === 0 ? (
          <Zoom in timeout={1000}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 8, 
              borderRadius: 6,
              background: `
                radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
              `,
              border: `3px dashed ${alpha(customTheme.primary, 0.3)}`,
              position: 'relative'
            }}>
              <SchoolIcon 
                sx={{ 
                  fontSize: 120, 
                  color: alpha(customTheme.primary, 0.3), 
                  mb: 3,
                  animation: `${float} 4s ease-in-out infinite`
                }} 
              />
              <Typography variant="h3" sx={{ 
                color: customTheme.primary, 
                fontWeight: 700, 
                mb: 2 
              }}>
                Setting Up Training Center
              </Typography>
              <Typography variant="h6" sx={{ 
                color: alpha(customTheme.primary, 0.7), 
                mb: 4,
                maxWidth: 600,
                mx: 'auto'
              }}>
                Training modules are being prepared. Run the management command to populate courses:
              </Typography>
              <Paper sx={{ 
                bgcolor: alpha(customTheme.grey, 0.4), 
                p: 3, 
                borderRadius: 3, 
                fontFamily: 'monospace',
                mb: 4,
                fontSize: '1.1rem',
                color: customTheme.primary,
                fontWeight: 600,
                border: `2px solid ${alpha(customTheme.primary, 0.2)}`
              }}>
                python manage.py create_rescue_training
              </Paper>
              <Button 
                variant="contained" 
                onClick={fetchTrainingData}
                startIcon={<SchoolIcon />}
                sx={{
                  py: 2,
                  px: 4,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`
                  }
                }}
              >
                Check for Courses
              </Button>
            </Card>
          </Zoom>
        ) : (
          <Grid container spacing={4}>
            {resources.map((resource, index) => {
              const progress = getProgressInfo(resource);
              const difficultyLevel = getDifficultyLevel(resource.title);
              const prerequisiteMet = isPrerequisiteMet(resource);
              const isLocked = !prerequisiteMet;
              const isCompleted = progress?.status === 'COMPLETED' || progress?.status === 'PASSED';
              const isPassed = progress?.best_score >= 80;
              
              return (
                <Grid item xs={12} md={6} lg={4} key={resource.id}>
                  <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 5,
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      position: 'relative',
                      opacity: isLocked ? 0.7 : 1,
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      ...(isCompleted && {
                        border: `3px solid ${customTheme.success}`,
                        background: `
                          linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, rgba(255, 255, 255, 0.95) 100%)
                        `,
                        animation: `${successPulse} 3s infinite`
                      }),
                      ...(isLocked && {
                        border: `2px dashed ${alpha(customTheme.primary, 0.3)}`,
                        background: `
                          linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, rgba(255, 255, 255, 0.8) 100%)
                        `
                      }),
                      ...(!isLocked && !isCompleted && {
                        border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.2)}`,
                          border: `2px solid ${alpha(customTheme.primary, 0.4)}`,
                          '& .module-action-btn': {
                            transform: 'translateY(-3px)'
                          }
                        }
                      }),
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.03)} 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.03)} 0%, transparent 50%)
                        `,
                        pointerEvents: 'none'
                      }
                    }}>
                      
                      {/* Enhanced Completion Badge */}
                      {isCompleted && (
                        <Zoom in timeout={1000}>
                          <Fab
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -10,
                              right: -10,
                              bgcolor: isPassed ? customTheme.success : customTheme.accent,
                              color: 'white',
                              zIndex: 2,
                              animation: `${sparkle} 3s infinite`,
                              '&:hover': { 
                                bgcolor: isPassed ? alpha(customTheme.success, 0.9) : alpha(customTheme.accent, 0.9),
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            {isPassed ? <TrophyIcon /> : <CheckIcon />}
                          </Fab>
                        </Zoom>
                      )}

                      {/* Enhanced Lock Icon */}
                      {isLocked && (
                        <Box sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          zIndex: 2,
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: alpha(customTheme.primary, 0.1),
                          border: `1px solid ${alpha(customTheme.primary, 0.3)}`
                        }}>
                          <LockIcon sx={{ color: alpha(customTheme.primary, 0.6), fontSize: 20 }} />
                        </Box>
                      )}

                      <CardContent sx={{ flex: 1, p: 4, position: 'relative', zIndex: 1 }}>
                        {/* Enhanced Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar
                            sx={{
                              bgcolor: isLocked ? alpha(customTheme.primary, 0.3) : 
                                      isCompleted ? customTheme.success : customTheme.primary,
                              width: 56,
                              height: 56,
                              mr: 2,
                              transition: 'all 0.3s ease',
                              ...(isCompleted && {
                                animation: `${pulse} 2s infinite`
                              })
                            }}
                          >
                            {getModuleIcon(resource.title)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" component="h3" sx={{ 
                              fontWeight: 800,
                              color: isLocked ? alpha(customTheme.primary, 0.6) : customTheme.primary,
                              letterSpacing: '-0.01em',
                              mb: 1
                            }}>
                              {resource.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={difficultyLevel} 
                                size="small" 
                                color={getDifficultyColor(difficultyLevel)}
                                variant={isLocked ? 'outlined' : 'filled'}
                                sx={{ fontWeight: 600 }}
                              />
                              {resource.interactive_module && (
                                <Chip 
                                  icon={<TimerIcon />}
                                  label={`${resource.interactive_module.estimated_duration}min`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    color: alpha(customTheme.primary, 0.8),
                                    borderColor: alpha(customTheme.primary, 0.3),
                                    fontWeight: 500
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Enhanced Description */}
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.6)} 100%)`,
                            border: `1px solid ${alpha(customTheme.primary, 0.1)}`
                          }}
                        >
                          <Typography variant="body1" sx={{ 
                            color: customTheme.primary,
                            fontWeight: 500,
                            lineHeight: 1.6
                          }}>
                            {resource.summary}
                          </Typography>
                        </Paper>

                        {/* Enhanced Progress Section */}
                        {progress && (
                          <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 700, 
                                color: customTheme.primary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <AssignmentIcon sx={{ color: customTheme.accent, fontSize: 20 }} />
                                Progress
                              </Typography>
                              <Typography variant="h6" sx={{ 
                                color: customTheme.success,
                                fontWeight: 700
                              }}>
                                {progress.completion_percentage}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress.completion_percentage}
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                bgcolor: alpha(customTheme.grey, 0.3),
                                animation: progress.completion_percentage > 0 ? `${progressGlow} 3s infinite` : 'none',
                                '& .MuiLinearProgress-bar': {
                                  background: `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                                  borderRadius: 5,
                                  boxShadow: `0 2px 8px ${alpha(customTheme.success, 0.3)}`
                                }
                              }}
                            />
                            {progress.latest_score && (
                              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Chip
                                  label={`Latest: ${progress.latest_score}%`}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(customTheme.accent, 0.15),
                                    color: customTheme.accent,
                                    fontWeight: 600,
                                    border: `1px solid ${alpha(customTheme.accent, 0.3)}`
                                  }}
                                />
                                {progress.best_score && progress.best_score !== progress.latest_score && (
                                  <Chip
                                    label={`Best: ${progress.best_score}%`}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(customTheme.success, 0.15),
                                      color: customTheme.success,
                                      fontWeight: 600,
                                      border: `1px solid ${alpha(customTheme.success, 0.3)}`
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* Enhanced Prerequisites Warning */}
                        {isLocked && (
                          <Alert 
                            severity="info" 
                            sx={{ 
                              mt: 2,
                              borderRadius: 3,
                              backgroundColor: alpha(customTheme.secondary, 0.1),
                              border: `1px solid ${alpha(customTheme.secondary, 0.3)}`,
                              '& .MuiAlert-icon': {
                                color: customTheme.secondary
                              }
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {resource.title.includes('Large Animal') || resource.title.includes('Scene Management') 
                                ? 'Complete intermediate training (First Aid or Behavior) first'
                                : 'Complete "Animal Rescue Fundamentals" first'
                              }
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                      
                      <CardActions sx={{ p: 4, pt: 0 }}>
                        <Button
                          className="module-action-btn"
                          variant={isCompleted ? "outlined" : "contained"}
                          color={isCompleted ? "success" : "primary"}
                          onClick={() => setSelectedResource(resource.slug)}
                          startIcon={
                            isLocked ? <LockIcon /> :
                            isCompleted ? <StarIcon /> : 
                            <PlayIcon />
                          }
                          fullWidth
                          disabled={isLocked}
                          sx={{
                            py: 2.5,
                            borderRadius: 3,
                            fontSize: '1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            ...(isCompleted && {
                              color: customTheme.success,
                              borderColor: customTheme.success,
                              borderWidth: 2,
                              backgroundColor: alpha(customTheme.success, 0.05),
                              '&:hover': {
                                backgroundColor: alpha(customTheme.success, 0.1),
                                borderColor: customTheme.success,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.3)}`
                              }
                            }),
                            ...(isLocked && {
                              backgroundColor: `${alpha(customTheme.primary, 0.1)} !important`,
                              color: alpha(customTheme.primary, 0.5),
                              cursor: 'not-allowed',
                              '&:hover': {
                                backgroundColor: `${alpha(customTheme.primary, 0.1)} !important`
                              }
                            }),
                            ...(!isLocked && !isCompleted && {
                              background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                                transition: 'left 0.6s ease',
                              },
                              '&:hover:not(:disabled)': {
                                background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`,
                                '&::before': {
                                  left: '100%'
                                }
                              }
                            })
                          }}
                        >
                          {isLocked ? 'LOCKED - Complete Prerequisites' : 
                           isCompleted ? 'Review Course' : 
                           progress ? 'Continue Training' : 'Start Training'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Enhanced Learning Objectives Section */}
        {resources.length > 0 && (
          <Fade in timeout={2000}>
            <Box sx={{ mt: 8 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  color: customTheme.primary,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2
                }}
              >
                <BookIcon sx={{ fontSize: 32, color: customTheme.accent }} />
                Training Program Overview
              </Typography>
              
              <Accordion
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                  mb: 2,
                  '&::before': {
                    display: 'none'
                  }
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon sx={{ color: customTheme.primary }} />}
                  sx={{
                    backgroundColor: alpha(customTheme.primary, 0.05),
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center'
                    }
                  }}
                >
                  <AssignmentIcon sx={{ mr: 2, color: customTheme.accent }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: customTheme.primary }}>
                    Learning Objectives
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 4 }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: customTheme.primary,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <SecurityIcon sx={{ color: customTheme.success }} />
                        Core Competencies:
                      </Typography>
                      <List dense>
                        {[
                          'Safe animal approach and handling techniques',
                          'Emergency first aid and medical stabilization',
                          'Species-specific behavior and psychology',
                          'Large animal rescue operations',
                          'Incident command and team coordination'
                        ].map((objective, index) => (
                          <ListItem key={index} sx={{ py: 1 }}>
                            <ListItemIcon>
                              <CheckIcon sx={{ color: customTheme.success, fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={objective}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontWeight: 500,
                                  color: customTheme.primary
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: customTheme.primary,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <TrophyIcon sx={{ color: customTheme.accent }} />
                        Certification Benefits:
                      </Typography>
                      <List dense>
                        {[
                          'Access to emergency rescue assignments',
                          'Priority volunteer opportunities',
                          'Enhanced community recognition',
                          'Professional development credentials',
                          'Specialized rescue team eligibility'
                        ].map((benefit, index) => (
                          <ListItem key={index} sx={{ py: 1 }}>
                            <ListItemIcon>
                              <TrophyIcon sx={{ color: customTheme.accent, fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={benefit}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontWeight: 500,
                                  color: customTheme.primary
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                  '&::before': {
                    display: 'none'
                  }
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon sx={{ color: customTheme.primary }} />}
                  sx={{
                    backgroundColor: alpha(customTheme.secondary, 0.05),
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center'
                    }
                  }}
                >
                  <CertifiedIcon sx={{ mr: 2, color: customTheme.secondary }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: customTheme.primary }}>
                    Training Standards
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 4 }}>
                  <Typography variant="body1" sx={{ 
                    mb: 4,
                    color: customTheme.primary,
                    fontWeight: 500,
                    fontSize: '1.1rem'
                  }}>
                    Our training program follows industry standards from leading animal rescue organizations:
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      { icon: EmergencyIcon, org: 'ASPCA', desc: 'Field Investigations & Response', color: customTheme.primary },
                      { icon: FirstAidIcon, org: 'American Humane', desc: 'Emergency Services Training', color: customTheme.success },
                      { icon: TeamIcon, org: 'FEMA', desc: 'Incident Command System', color: customTheme.accent },
                      { icon: AnimalIcon, org: 'RedRover', desc: 'Emergency Sheltering', color: customTheme.secondary }
                    ].map((standard, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                          elevation={0}
                          sx={{ 
                            textAlign: 'center', 
                            p: 3,
                            borderRadius: 4,
                            background: `linear-gradient(135deg, ${alpha(standard.color, 0.1)} 0%, ${alpha(standard.color, 0.05)} 100%)`,
                            border: `2px solid ${alpha(standard.color, 0.2)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: `0 12px 35px ${alpha(standard.color, 0.2)}`
                            }
                          }}
                        >
                          <standard.icon sx={{ 
                            fontSize: 48, 
                            color: standard.color, 
                            mb: 2,
                            animation: `${float} 4s ease-in-out infinite`,
                            animationDelay: `${index * 0.5}s`
                          }} />
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: customTheme.primary,
                            mb: 1
                          }}>
                            {standard.org}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: alpha(customTheme.primary, 0.8),
                            fontWeight: 500
                          }}>
                            {standard.desc}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Fade>
        )}

        {/* Enhanced Welcome Dialog */}
        <Dialog 
          open={showWelcome} 
          onClose={() => setShowWelcome(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              position: 'relative'
            }
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
              p: 2,
              position: 'relative'
            }}
          >
            <Button
              onClick={() => setShowWelcome(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                minWidth: 40,
                height: 40,
                borderRadius: 2,
                color: alpha(customTheme.primary, 0.7),
                '&:hover': {
                  backgroundColor: alpha(customTheme.primary, 0.1),
                  color: customTheme.primary
                }
              }}
            >
              <CloseIcon />
            </Button>
          </Box>
          
          <DialogTitle sx={{ textAlign: 'center', pb: 2, pt: 4 }}>
            <Avatar
              sx={{
                bgcolor: customTheme.primary,
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                animation: `${pulse} 2s infinite`
              }}
            >
              <SchoolIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography 
              variant="h3" 
              component="div"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome to Rescue Training!
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ px: 4 }}>
            <Typography variant="h6" sx={{ 
              mb: 3,
              color: customTheme.primary,
              fontWeight: 500,
              lineHeight: 1.6
            }}>
              You're about to begin professional animal rescue training based on real protocols from 
              ASPCA, American Humane, FEMA, and other leading emergency response organizations.
            </Typography>
            
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                backgroundColor: alpha(customTheme.secondary, 0.1),
                border: `2px solid ${alpha(customTheme.secondary, 0.3)}`
              }}
            >
              <Typography variant="h6" sx={{ 
                fontWeight: 700,
                color: customTheme.primary,
                mb: 2
              }}>
                Training Requirements:
              </Typography>
              <Box component="ul" sx={{ 
                pl: 2, 
                color: customTheme.primary,
                fontWeight: 500,
                '& li': { mb: 1 }
              }}>
                <li>Complete all modules in order (prerequisites required)</li>
                <li>Achieve 80% or higher on quizzes for certification</li>
                <li>Estimated total time: 4-6 hours</li>
              </Box>
            </Alert>

            <Typography variant="h6" sx={{ 
              color: customTheme.primary,
              fontWeight: 500,
              lineHeight: 1.6
            }}>
              Upon completion, you'll be qualified for emergency rescue assignments and gain 
              recognition as a certified animal rescue volunteer in our community.
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ p: 4, justifyContent: 'space-between' }}>
            <Button 
              onClick={() => setShowWelcome(false)}
              sx={{
                color: alpha(customTheme.primary, 0.7),
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                borderRadius: 3
              }}
            >
              Maybe Later
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setShowWelcome(false);
                if (resources.length > 0) {
                  // Find the first module that meets prerequisites (should be Fundamentals)
                  const startingModule = resources.find(resource => 
                    resource.title.includes('Fundamentals') || isPrerequisiteMet(resource)
                  );
                  if (startingModule) {
                    setSelectedResource(startingModule.slug);
                  } else {
                    setSelectedResource(resources[0].slug); // Fallback
                  }
                }
              }}
              startIcon={<PlayIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`
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

export default InteractiveLearningPage;