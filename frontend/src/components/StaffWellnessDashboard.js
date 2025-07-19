import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Fade,
  Slide,
  Zoom,
  alpha,
  Snackbar,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon,
  Spa as SpaIcon,
  SupportAgent as SupportIcon,
  LocalFireDepartment as FireIcon,
  NotificationImportant as UrgentIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Mood as MoodIcon,
  MoodBad as StressIcon,
  Schedule as ScheduleIcon,
  Assignment as NotesIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  Emergency as EmergencyIcon,
  Group as GroupIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  SentimentVeryDissatisfied as VeryStressedIcon,
  SentimentDissatisfied as StressedIcon,
  SentimentNeutral as NeutralIcon,
  SentimentSatisfied as HappyIcon,
  SentimentVerySatisfied as VeryHappyIcon,
} from '@mui/icons-material';
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

const heartbeat = keyframes`
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px ${alpha(customTheme.success, 0.5)}; }
  50% { box-shadow: 0 0 20px ${alpha(customTheme.success, 0.8)}, 0 0 30px ${alpha(customTheme.success, 0.5)}; }
  100% { box-shadow: 0 0 5px ${alpha(customTheme.success, 0.5)}; }
`;

const StaffWellnessDashboard = () => {
  const [mentalHealthCategories, setMentalHealthCategories] = useState([]);
  const [mentalHealthResources, setMentalHealthResources] = useState([]);
  const [selfCareReminders, setSelfCareReminders] = useState([]);
  const [stressLogs, setStressLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [stressDialogOpen, setStressDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [crisisDialogOpen, setCrisisDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Resource state
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Form states
  const [stressLevel, setStressLevel] = useState(3);
  const [stressNotes, setStressNotes] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState('DAILY');
  const [reminderTime, setReminderTime] = useState('09:00');

  // Mock user data - replace with actual auth
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchWellnessData();
  }, []);

  const fetchWellnessData = async () => {
    try {
      setLoading(true);
      

      const [categoriesRes, resourcesRes, remindersRes, stressRes] = await Promise.all([
        api.get('/mental-health-categories/'),
        api.get('/mental-health-resources/'),
        api.get('/self-care-reminders/'),
        api.get('/stress-logs/')
      ]);

      const categories = categoriesRes.data;
      const resources = resourcesRes.data;
      const reminders = remindersRes.data;
      const stress = stressRes.data;

      setMentalHealthCategories(categories);
      setMentalHealthResources(resources.slice(0, 6)); // Latest 6 resources
      setSelfCareReminders(reminders);
      setStressLogs(stress);
      
    } catch (err) {
      setError('Failed to load wellness data');
      console.error('Wellness data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStressSubmit = async (e) => {
    e.preventDefault();
    
    // Crisis intervention check BEFORE logging
    if (stressLevel >= 4) {
      setCrisisDialogOpen(true);
      return;
    }
    
    try {
     const response = await api.post('/stress-logs/', {

          date: new Date().toISOString().split('T')[0],
          stress_level: stressLevel,
          notes: stressNotes,
          factors: []

      });

        setStressDialogOpen(false);
        setStressNotes('');
        showMessage('Stress level logged successfully!');
        fetchWellnessData(); // Refresh data

    } catch (err) {
      setError('Failed to log stress level');
    }
  };

  const handleCrisisProceed = async () => {
   
    try {
      const response = await api.post('/stress-logs/', {

          date: new Date().toISOString().split('T')[0],
          stress_level: stressLevel,
          notes: stressNotes,
          factors: ['crisis_level_stress']
      });


        setCrisisDialogOpen(false);
        setStressDialogOpen(false);
        setStressNotes('');
        showMessage('Crisis support resources provided. Please reach out for help.');
        fetchWellnessData();

    } catch (err) {
      setError('Failed to log stress level');
    }
  };

  const handleReminderSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/self-care-reminders/', {
       
          title: reminderTitle,
          message: reminderMessage,
          frequency: reminderFrequency,
          time_of_day: reminderTime

      });


        setReminderDialogOpen(false);
        setReminderTitle('');
        setReminderMessage('');
        showMessage('Self-care reminder created!');
        fetchWellnessData(); // Refresh data

    } catch (err) {
      setError('Failed to create reminder');
    }
  };

  const showMessage = (message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const handleResourceClick = (resource) => {
    // For now, show resource content in a modal
    // Later this could navigate to a dedicated resource page
    setSelectedResource(resource);
    setResourceDialogOpen(true);
  };

  const getCategoryIcon = (iconName) => {
    const iconMap = {
      favorite: <FavoriteIcon sx={{ fontSize: 24, color: '#ffffff' }} />,
      psychology: <PsychologyIcon sx={{ fontSize: 24, color: '#ffffff' }} />,
      spa: <SpaIcon sx={{ fontSize: 24, color: '#ffffff' }} />,
      support_agent: <SupportIcon sx={{ fontSize: 24, color: '#ffffff' }} />,
      local_fire_department: <FireIcon sx={{ fontSize: 24, color: '#ffffff' }} />
    };
    return iconMap[iconName] || <FavoriteIcon sx={{ fontSize: 24, color: '#ffffff' }} />;
  };

  const getStressColor = (level) => {
    if (level <= 2) return customTheme.success;
    if (level <= 3) return customTheme.secondary;
    return customTheme.accent;
  };

  const getStressIcon = (level) => {
    const iconMap = {
      1: <VeryHappyIcon sx={{ fontSize: 64, color: customTheme.success }} />,
      2: <HappyIcon sx={{ fontSize: 64, color: customTheme.success }} />, 
      3: <NeutralIcon sx={{ fontSize: 64, color: customTheme.secondary }} />,
      4: <StressedIcon sx={{ fontSize: 64, color: customTheme.accent }} />,
      5: <VeryStressedIcon sx={{ fontSize: 64, color: customTheme.error }} />
    };
    return iconMap[level] || <NeutralIcon sx={{ fontSize: 64, color: customTheme.secondary }} />;
  };

  const getStressLabel = (level) => {
    const labelMap = {
      1: 'Very Low',
      2: 'Low',
      3: 'Moderate', 
      4: 'High',
      5: 'Very High'
    };
    return labelMap[level] || 'Moderate';
  };

  const calculateAverageStress = () => {
    if (stressLogs.length === 0) return 0;
    const sum = stressLogs.reduce((acc, log) => acc + log.stress_level, 0);
    return (sum / stressLogs.length).toFixed(1);
  };

  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
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
      '&.Mui-focused': {
        color: customTheme.primary,
      },
    },
    '& .MuiOutlinedInput-input': {
      color: customTheme.primary,
      fontWeight: 500,
    }
  };

  const selectStyles = {
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: customTheme.primary,
    fontWeight: 500,
    transition: 'all 0.3s ease',
    minHeight: 56,
    '& .MuiSelect-select': {
      padding: '16px 14px',
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
          <FavoriteIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <PsychologyIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
        </Box>
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                animation: `${heartbeat} 2s infinite`,
                boxShadow: `0 0 30px ${alpha(customTheme.primary, 0.4)}`
              }}
            >
              <FavoriteIcon sx={{ color: '#ffffff', fontSize: 40 }} />
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
            Loading Wellness Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Preparing your mental health resources...
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
        <FavoriteIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <PsychologyIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
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
                animation: `${heartbeat} 3s infinite`,
                background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`
              }}
            >
              <FavoriteIcon sx={{ fontSize: 40 }} />
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
              Staff Wellness Dashboard
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
              Your mental health and wellbeing matter. Take care of yourself so you can care for the animals.
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

        {/* Quick Actions Section */}
        <Slide direction="up" in timeout={1000}>
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {/* Daily Stress Check */}
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  borderRadius: 4,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.success, 0.05)} 100%)
                  `,
                  border: `3px solid ${alpha(customTheme.success, 0.2)}`,
                  backdropFilter: 'blur(20px)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha(customTheme.success, 0.2)}`,
                    border: `3px solid ${alpha(customTheme.success, 0.4)}`
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.success,
                        width: 56,
                        height: 56,
                        boxShadow: `0 4px 15px ${alpha(customTheme.success, 0.3)}`,
                        animation: `${pulse} 3s infinite`
                      }}
                    >
                      <MoodIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: customTheme.primary,
                          fontWeight: 700,
                          mb: 0.5
                        }}
                      >
                        Daily Stress Check
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: alpha(customTheme.primary, 0.7),
                          fontWeight: 500
                        }}
                      >
                        Track your stress levels to identify patterns
                      </Typography>
                    </Box>
                  </Box>
                  
                  {stressLogs.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: customTheme.primary,
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        Average stress this week: {calculateAverageStress()}/5
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={calculateAverageStress() * 20}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: alpha(customTheme.grey, 0.4),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            backgroundColor: getStressColor(calculateAverageStress()),
                            background: `linear-gradient(90deg, ${getStressColor(calculateAverageStress())}, ${alpha(getStressColor(calculateAverageStress()), 0.7)})`
                          }
                        }}
                      />
                      
                      {calculateAverageStress() <= 2 && (
                        <Paper
                          elevation={0}
                          sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                            border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                            textAlign: 'center'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: customTheme.success,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1
                            }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                            Great job managing your stress levels!
                          </Typography>
                        </Paper>
                      )}
                      
                      {calculateAverageStress() >= 4 && (
                        <Paper
                          elevation={0}
                          sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.warning, 0.1)} 0%, ${alpha(customTheme.warning, 0.05)} 100%)`,
                            border: `2px solid ${alpha(customTheme.warning, 0.3)}`,
                            textAlign: 'center'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: customTheme.warning,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1
                            }}
                          >
                            <WarningIcon sx={{ fontSize: 18 }} />
                            Consider talking to your supervisor about workload
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  )}
                  
                  <Button 
                    onClick={() => setStressDialogOpen(true)}
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<StressIcon />}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      background: `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
                      color: '#ffffff',
                      boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.5)}`
                      }
                    }}
                  >
                    Log Today's Stress
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Self-Care Reminders */}
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  borderRadius: 4,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.accent, 0.15)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)
                  `,
                  border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
                  backdropFilter: 'blur(20px)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 20px 40px ${alpha(customTheme.accent, 0.2)}`,
                    border: `3px solid ${alpha(customTheme.accent, 0.4)}`
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.accent,
                        width: 56,
                        height: 56,
                        boxShadow: `0 4px 15px ${alpha(customTheme.accent, 0.3)}`,
                        animation: `${pulse} 3s infinite`
                      }}
                    >
                      <ScheduleIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: customTheme.primary,
                          fontWeight: 700,
                          mb: 0.5
                        }}
                      >
                        Self-Care Reminders
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: alpha(customTheme.primary, 0.7),
                          fontWeight: 500
                        }}
                      >
                        Set personalized reminders to take breaks
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                      textAlign: 'center'
                    }}
                  >
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 800,
                        mb: 1
                      }}
                    >
                      {selfCareReminders.filter(r => r.is_active).length}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.8),
                        fontWeight: 600
                      }}
                    >
                      Active Reminders
                    </Typography>
                  </Paper>
                  
                  <Button 
                    onClick={() => setReminderDialogOpen(true)}
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<AddIcon />}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${alpha(customTheme.accent, 0.8)} 90%)`,
                      color: '#ffffff',
                      boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${customTheme.accent} 90%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.5)}`
                      }
                    }}
                  >
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Slide>

        {/* Mental Health Categories */}
        <Slide direction="up" in timeout={1200}>
          <Paper
            elevation={0}
            sx={{
              mb: 6,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 4,
                background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
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
                <PsychologyIcon sx={{ fontSize: '1.2em' }} />
                Mental Health Resources
              </Typography>
            </Box>
            
            <Box sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {mentalHealthCategories.map((category, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={category.id}>
                    <Fade in timeout={600 + (index * 100)}>
                      <Card 
                        sx={{
                          borderRadius: 4,
                          background: `
                            linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)
                          `,
                          border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          height: '100%',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.05)',
                            boxShadow: `0 15px 35px ${alpha(customTheme.secondary, 0.3)}`,
                            border: `2px solid ${alpha(customTheme.secondary, 0.4)}`
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Avatar
                            sx={{
                              bgcolor: customTheme.secondary,
                              width: 56,
                              height: 56,
                              mx: 'auto',
                              mb: 2,
                              boxShadow: `0 4px 15px ${alpha(customTheme.secondary, 0.3)}`,
                              animation: `${glow} 3s infinite`
                            }}
                          >
                            {getCategoryIcon(category.icon)}
                          </Avatar>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: customTheme.primary,
                              fontWeight: 700
                            }}
                          >
                            {category.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Slide>

        {/* Latest Wellness Resources */}
        <Slide direction="up" in timeout={1400}>
          <Paper
            elevation={0}
            sx={{
              mb: 6,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 4,
                background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                borderBottom: `2px solid ${alpha(customTheme.secondary, 0.1)}`
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
                <NotesIcon sx={{ fontSize: '1.2em' }} />
                Latest Wellness Resources
              </Typography>
            </Box>
            
            <Box sx={{ p: 4 }}>
              <Grid container spacing={3}>
                {mentalHealthResources.map((resource, index) => (
                  <Grid item xs={12} md={6} key={resource.id}>
                    <Fade in timeout={600 + (index * 100)}>
                      <Card 
                        sx={{
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                          transition: 'all 0.3s ease',
                          height: '100%',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: `0 15px 35px ${alpha(customTheme.primary, 0.2)}`,
                            border: `2px solid ${alpha(customTheme.primary, 0.3)}`
                          }
                        }}
                        onClick={() => handleResourceClick(resource)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Chip
                              label={resource.resource_type}
                              sx={{
                                backgroundColor: alpha(customTheme.grey, 0.6),
                                color: customTheme.primary,
                                fontWeight: 700,
                                fontSize: '0.8rem'
                              }}
                            />
                            {resource.is_featured && (
                              <Chip
                                label="Featured"
                                sx={{
                                  backgroundColor: customTheme.primary,
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  fontSize: '0.8rem'
                                }}
                              />
                            )}
                          </Box>
                          
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: customTheme.primary,
                              fontWeight: 700,
                              mb: 2,
                              lineHeight: 1.3
                            }}
                          >
                            {resource.title}
                          </Typography>
                          
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: alpha(customTheme.primary, 0.8),
                              mb: 2,
                              lineHeight: 1.5
                            }}
                          >
                            {resource.summary}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: alpha(customTheme.primary, 0.6),
                              fontWeight: 500,
                              mb: 2
                            }}
                          >
                            By {resource.author}
                          </Typography>
                          
                          <Button 
                            variant="outlined"
                            size="small"
                            sx={{
                              borderColor: customTheme.primary,
                              color: customTheme.primary,
                              fontWeight: 600,
                              borderWidth: 2,
                              borderRadius: 2,
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: customTheme.primary,
                                backgroundColor: alpha(customTheme.primary, 0.08),
                                borderWidth: 2
                              }
                            }}
                          >
                            Read More
                          </Button>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Slide>

        {/* Active Self-Care Reminders */}
        {selfCareReminders.length > 0 && (
          <Slide direction="up" in timeout={1600}>
            <Paper
              elevation={0}
              sx={{
                mb: 6,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                  borderBottom: `2px solid ${alpha(customTheme.accent, 0.1)}`
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
                  <ScheduleIcon sx={{ fontSize: '1.2em' }} />
                  Your Active Reminders
                </Typography>
              </Box>
              
              <Box sx={{ p: 0 }}>
                {selfCareReminders.filter(r => r.is_active).slice(0, 5).map((reminder, index) => (
                  <Box 
                    key={reminder.id}
                    sx={{
                      p: 3,
                      borderBottom: index < 4 ? `1px solid ${alpha(customTheme.primary, 0.1)}` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(customTheme.grey, 0.3)
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: customTheme.success,
                        width: 40,
                        height: 40,
                        mr: 3,
                        boxShadow: `0 4px 15px ${alpha(customTheme.success, 0.3)}`
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: customTheme.primary,
                          fontWeight: 700,
                          mb: 0.5
                        }}
                      >
                        {reminder.title}
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
                        <TimeIcon sx={{ fontSize: 16 }} />
                        {reminder.frequency} at {reminder.time_of_day}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Slide>
        )}

        {/* Floating Action Button */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <Button
            onClick={() => setStressDialogOpen(true)}
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${alpha(customTheme.secondary, 0.8)} 90%)`,
              color: '#ffffff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`,
              transition: 'all 0.3s ease',
              animation: `${pulse} 3s infinite`,
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: `0 12px 35px ${alpha(customTheme.secondary, 0.6)}`
              }
            }}
            title="Quick stress check"
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Button>
        </Box>
      </Container>

      {/* Enhanced Stress Logging Modal */}
      <Dialog 
        open={stressDialogOpen} 
        onClose={() => setStressDialogOpen(false)}
        maxWidth="sm" 
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
          p: 4,
          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
          borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: customTheme.primary,
                width: 48,
                height: 48,
                boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.3)}`
              }}
            >
              <MoodIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Typography 
              variant="h4" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 700
              }}
            >
              Log Your Stress Level
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 4,
          maxHeight: 'calc(90vh - 200px)',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(customTheme.grey, 0.3),
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(customTheme.primary, 0.5),
            borderRadius: 3,
            '&:hover': {
              background: alpha(customTheme.primary, 0.7),
            },
          },
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: customTheme.primary }}>
            How stressed do you feel right now?
          </Typography>
          
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3
            }}>
              <Box sx={{ mr: 3 }}>
                {getStressIcon(stressLevel)}
              </Box>
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: getStressColor(stressLevel),
                    textShadow: `0 2px 8px ${alpha(getStressColor(stressLevel), 0.3)}`
                  }}
                >
                  {stressLevel}/5
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: stressLevel >= 4 ? '#f44336' : customTheme.primary,
                    fontWeight: 600
                  }}
                >
                  {getStressLabel(stressLevel)}
                  {stressLevel >= 4 && ' ⚠️'}
                </Typography>
              </Box>
            </Box>
            
            {stressLevel >= 4 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha('#f44336', 0.1)} 0%, ${alpha('#f44336', 0.05)} 100%)`,
                  border: `2px solid ${alpha('#f44336', 0.3)}`
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#d32f2f',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <WarningIcon sx={{ fontSize: 20 }} />
                  <strong>High stress level detected.</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: '#d32f2f', mt: 1 }}>
                  Crisis support resources will be provided after logging.
                </Typography>
              </Paper>
            )}
            
            <Box sx={{ mb: 3 }}>
              <input
                type="range"
                min="1"
                max="5"
                value={stressLevel}
                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '12px',
                  borderRadius: '6px',
                  background: `linear-gradient(to right, ${customTheme.success} 0%, ${customTheme.secondary} 50%, ${customTheme.accent} 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none'
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.8rem',
                color: alpha(customTheme.primary, 0.7),
                mt: 1,
                px: 1
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <VeryHappyIcon sx={{ fontSize: 16, color: customTheme.success }} />
                  <span>Very Low</span>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <HappyIcon sx={{ fontSize: 16, color: customTheme.success }} />
                  <span>Low</span>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <NeutralIcon sx={{ fontSize: 16, color: customTheme.secondary }} />
                  <span>Moderate</span>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <StressedIcon sx={{ fontSize: 16, color: customTheme.accent }} />
                  <span>High</span>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <VeryStressedIcon sx={{ fontSize: 16, color: customTheme.error }} />
                  <span>Very High</span>
                </Box>
              </Box>
            </Box>
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="What's contributing to your stress level today? (optional)"
            value={stressNotes}
            onChange={(e) => setStressNotes(e.target.value)}
            sx={fieldStyles}
          />
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4,
          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
          borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`
        }}>
          <Button
            onClick={() => setStressDialogOpen(false)}
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
            onClick={handleStressSubmit}
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.5)}`
              }
            }}
          >
            Log Stress Level
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Self-Care Reminder Modal */}
      <Dialog 
        open={reminderDialogOpen} 
        onClose={() => setReminderDialogOpen(false)}
        maxWidth="sm" 
        fullWidth
        scroll="body"
        PaperProps={{
          sx: {
            borderRadius: 6,
            background: `
              radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
              linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
            `,
            backdropFilter: 'blur(20px)',
            border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
            boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.2)}`,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 4,
          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
          borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: customTheme.accent,
                width: 48,
                height: 48,
                boxShadow: `0 4px 15px ${alpha(customTheme.accent, 0.3)}`
              }}
            >
              <ScheduleIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Typography 
              variant="h4" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 700
              }}
            >
              Create Self-Care Reminder
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Reminder Title"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                placeholder="e.g., Take a 5-minute break"
                sx={fieldStyles}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Message"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="e.g., Step outside and take 5 deep breaths"
                sx={fieldStyles}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel 
                      sx={{
                        color: customTheme.primary,
                        fontWeight: 600,
                        fontSize: '1rem',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'unset',
                        width: 'auto',
                        maxWidth: 'none',
                        '&.Mui-focused': { 
                          color: customTheme.primary 
                        },
                        '&.MuiInputLabel-shrink': {
                          fontSize: '0.75rem',
                          transform: 'translate(14px, -9px) scale(0.85)',
                          width: 'auto',
                          maxWidth: 'none',
                          whiteSpace: 'nowrap'
                        }
                      }}
                    >
                      Frequency
                    </InputLabel>
                    <Select
                      value={reminderFrequency}
                      onChange={(e) => setReminderFrequency(e.target.value)}
                      label="Frequency"
                      sx={selectStyles}
                    >
                      <MenuItem value="DAILY">Daily</MenuItem>
                      <MenuItem value="WEEKLY">Weekly</MenuItem>
                      <MenuItem value="MONTHLY">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyles}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4,
          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
          borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`
        }}>
          <Button
            onClick={() => setReminderDialogOpen(false)}
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
            onClick={handleReminderSubmit}
            variant="contained"
            disabled={!reminderTitle || !reminderMessage}
            sx={{
              background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${alpha(customTheme.accent, 0.8)} 90%)`,
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`,
              '&:hover:not(:disabled)': {
                background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${customTheme.accent} 90%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.5)}`
              },
              '&:disabled': {
                background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.5)} 30%, ${alpha(customTheme.accent, 0.3)} 90%)`,
                color: alpha('#ffffff', 0.6)
              }
            }}
          >
            Create Reminder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Resource Detail Modal */}
      <Dialog 
        open={resourceDialogOpen} 
        onClose={() => setResourceDialogOpen(false)}
        maxWidth="md" 
        fullWidth
        scroll="body"
        PaperProps={{
          sx: {
            borderRadius: 6,
            background: `
              radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
              linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
            `,
            backdropFilter: 'blur(20px)',
            border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
            boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.2)}`,
            maxHeight: '90vh'
          }
        }}
      >
        {selectedResource && (
          <>
            <DialogTitle sx={{ 
              p: 4,
              background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
              borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip
                      label={selectedResource.resource_type}
                      sx={{
                        backgroundColor: alpha(customTheme.grey, 0.6),
                        color: customTheme.primary,
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}
                    />
                    {selectedResource.is_featured && (
                      <Chip
                        label="Featured"
                        sx={{
                          backgroundColor: customTheme.primary,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 700,
                      mb: 1,
                      lineHeight: 1.3
                    }}
                  >
                    {selectedResource.title}
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontStyle: 'italic',
                      mb: 1
                    }}
                  >
                    {selectedResource.summary}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: alpha(customTheme.primary, 0.6),
                      fontWeight: 500
                    }}
                  >
                    By {selectedResource.author}
                  </Typography>
                </Box>
                
                <Button
                  onClick={() => setResourceDialogOpen(false)}
                  sx={{
                    minWidth: 'auto',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    color: customTheme.primary,
                    '&:hover': {
                      backgroundColor: alpha(customTheme.primary, 0.1)
                    }
                  }}
                >
                  <CloseIcon />
                </Button>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ 
              p: 4,
              maxHeight: 'calc(90vh - 200px)',
              overflowY: 'auto'
            }}>
              <Typography 
                variant="body1" 
                sx={{
                  lineHeight: 1.7,
                  fontSize: '1rem',
                  color: customTheme.primary,
                  whiteSpace: 'pre-line'
                }}
              >
                {selectedResource.content}
              </Typography>
              
              <Paper
                elevation={0}
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                  border: `2px solid ${alpha(customTheme.success, 0.2)}`,
                  textAlign: 'center'
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <FavoriteIcon sx={{ color: customTheme.success }} />
                  Remember: Taking care of your mental health helps you provide better care for the animals.
                </Typography>
              </Paper>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Enhanced Crisis Intervention Dialog */}
      <Dialog 
        open={crisisDialogOpen} 
        onClose={() => setCrisisDialogOpen(false)}
        maxWidth="md" 
        fullWidth
        scroll="body"
        PaperProps={{
          sx: {
            borderRadius: 6,
            background: `
              radial-gradient(circle at center, ${alpha('#f44336', 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
              linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
            `,
            backdropFilter: 'blur(20px)',
            border: `3px solid ${alpha('#f44336', 0.3)}`,
            boxShadow: `0 25px 50px ${alpha('#f44336', 0.2)}`,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 4,
          background: `linear-gradient(135deg, ${alpha('#f44336', 0.1)} 0%, ${alpha('#f44336', 0.05)} 100%)`,
          borderBottom: `2px solid ${alpha('#f44336', 0.2)}`,
          textAlign: 'center'
        }}>
          <Avatar
            sx={{
              bgcolor: '#f44336',
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
              animation: `${pulse} 2s infinite`
            }}
          >
            <EmergencyIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography 
            variant="h3" 
            sx={{ 
              color: '#f44336',
              fontWeight: 800,
              mb: 1
            }}
          >
            High Stress Level Detected
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: alpha(customTheme.primary, 0.8)
            }}
          >
            Your wellbeing is our priority. Help is available.
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 4,
          maxHeight: 'calc(90vh - 300px)',
          overflowY: 'auto'
        }}>
          {/* Emergency Resources */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha('#f44336', 0.1)} 0%, ${alpha('#f44336', 0.05)} 100%)`,
              border: `2px solid ${alpha('#f44336', 0.3)}`
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#d32f2f',
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <UrgentIcon />
              Emergency Resources
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha('#f44336', 0.08)} 0%, ${alpha('#f44336', 0.03)} 100%)`,
                    border: `1px solid ${alpha('#f44336', 0.2)}`
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700, mb: 0.5 }}>
                    Crisis Hotline
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 800, mb: 0.5 }}>
                    988
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                    24/7 Suicide & Crisis Lifeline
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha('#f44336', 0.08)} 0%, ${alpha('#f44336', 0.03)} 100%)`,
                    border: `1px solid ${alpha('#f44336', 0.2)}`
                  }}
                >
                  <MessageIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700, mb: 0.5 }}>
                    Crisis Text
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#f44336', fontWeight: 700, mb: 0.5 }}>
                    Text HOME to 741741
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                    Free, 24/7 crisis counseling
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha('#f44336', 0.08)} 0%, ${alpha('#f44336', 0.03)} 100%)`,
                    border: `1px solid ${alpha('#f44336', 0.2)}`
                  }}
                >
                  <EmergencyIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700, mb: 0.5 }}>
                    Emergency
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 800, mb: 0.5 }}>
                    911
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                    If you're in immediate danger
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Workplace Support */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
              border: `2px solid ${alpha(customTheme.success, 0.2)}`
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <GroupIcon />
              Workplace Support
            </Typography>
            
            <Grid container spacing={2}>
              {[
                { icon: WorkIcon, title: 'Talk to your supervisor immediately', desc: 'They can adjust your workload and provide support' },
                { icon: HomeIcon, title: 'Contact HR or Employee Assistance Program', desc: 'Free confidential counseling may be available' },
                { icon: SchoolIcon, title: 'Request time off if needed', desc: 'Mental health days are valid and important' },
                { icon: GroupIcon, title: 'Connect with supportive colleagues', desc: 'You\'re not alone in this work' }
              ].map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.success,
                        width: 40,
                        height: 40
                      }}
                    >
                      <item.icon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: customTheme.primary, mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Immediate Self-Care */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
              border: `2px solid ${alpha(customTheme.accent, 0.2)}`
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SpaIcon />
              Immediate Self-Care
            </Typography>
            
            <Grid container spacing={1}>
              {[
                'Take 10 deep breaths right now',
                'Step away from your current task',
                'Drink water and sit down',
                'Call someone you trust',
                'Don\'t make any major decisions today'
              ].map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 16, color: customTheme.success }} />
                    {item}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Warning Signs */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(customTheme.warning, 0.1)} 0%, ${alpha(customTheme.warning, 0.05)} 100%)`,
              border: `2px solid ${alpha(customTheme.warning, 0.2)}`
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                color: customTheme.warning,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1
              }}
            >
              <WarningIcon />
              Seek immediate help if you experience:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                lineHeight: 1.5
              }}
            >
              Thoughts of self-harm, inability to function, panic attacks, substance abuse, or feeling completely hopeless.
            </Typography>
          </Paper>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 4,
          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
          borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`,
          justifyContent: 'center',
          gap: 2
        }}>
          <Button
            onClick={() => {
              setCrisisDialogOpen(false);
              setStressDialogOpen(false);
            }}
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
            I'll Seek Help
          </Button>
          <Button
            onClick={handleCrisisProceed}
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.5)}`
              }
            }}
          >
            Continue & Log Level
          </Button>
        </DialogActions>
        
        <Box sx={{ 
          textAlign: 'center', 
          p: 2,
          background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
          borderTop: `1px solid ${alpha(customTheme.success, 0.2)}`
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: alpha(customTheme.primary, 0.8),
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <FavoriteIcon sx={{ color: customTheme.success, fontSize: 18 }} />
            Your mental health matters. It's okay to ask for help.
          </Typography>
        </Box>
      </Dialog>

      {/* Enhanced Success Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            width: '100%',
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 3,
            backgroundColor: alpha(customTheme.success, 0.1),
            border: `2px solid ${customTheme.success}`,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            }
          }}
          onClose={() => setShowSnackbar(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffWellnessDashboard;