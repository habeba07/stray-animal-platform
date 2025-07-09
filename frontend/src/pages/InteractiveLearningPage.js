// Enhanced InteractiveLearningPage.js - Replace your existing file

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
} from '@mui/icons-material';
import api from '../redux/api';
import InteractiveLearning from '../components/Resources/InteractiveLearning';

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
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading Training Center...</Typography>
        </Box>
      </Container>
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
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          ← Back to Training Center
        </Button>
        <InteractiveLearning 
          resourceSlug={selectedResource} 
          onComplete={() => {
            // Refresh progress when course is completed
            fetchTrainingData();
            setSelectedResource(null);
          }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ 
          fontWeight: 'bold', 
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}>
          🎓 Emergency Animal Rescue Training Center
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Professional training modules based on ASPCA, FEMA, and American Humane protocols
        </Typography>

        {/* Progress Summary */}
        {resources.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 4, 
            mb: 4,
            flexWrap: 'wrap'
          }}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {calculateOverallProgress()}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Progress
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                {getCompletedCertifications()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Certifications Earned
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                {resources.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Training Modules
              </Typography>
            </Box>
          </Box>
        )}

        {/* Overall Progress Bar */}
        {resources.length > 0 && (
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <LinearProgress 
              variant="determinate" 
              value={calculateOverallProgress()} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                }
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {calculateOverallProgress()}% Complete - {resources.length - getCompletedCertifications()} modules remaining
            </Typography>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Training Modules */}
      {resources.length === 0 ? (
        <Card sx={{ 
          textAlign: 'center', 
          p: 4, 
          background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
          border: '2px dashed #ddd'
        }}>
          <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Setting Up Training Center
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Training modules are being prepared. Run the management command to populate courses:
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            fontFamily: 'monospace',
            mb: 3
          }}>
            python manage.py create_rescue_training
          </Box>
          <Button 
            variant="contained" 
            onClick={fetchTrainingData}
            startIcon={<SchoolIcon />}
          >
            Check for Courses
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {resources.map((resource, index) => {
            const progress = getProgressInfo(resource);
            const difficultyLevel = getDifficultyLevel(resource.title);
            const prerequisiteMet = isPrerequisiteMet(resource);
            const isLocked = !prerequisiteMet;
            const isCompleted = progress?.status === 'COMPLETED' || progress?.status === 'PASSED';
            const isPassed = progress?.best_score >= 80;
            
            return (
              <Grid item xs={12} md={6} lg={4} key={resource.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  opacity: isLocked ? 0.7 : 1,
                  transform: isCompleted ? 'none' : 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: isLocked ? 'none' : 'translateY(-4px)',
                    boxShadow: isLocked ? 'none' : '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  ...(isCompleted && {
                    border: '2px solid #4caf50',
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)'
                  }),
                  ...(isLocked && {
                    border: '2px solid #ddd',
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)'
                  })
                }}>
                  
                  {/* Completion Badge */}
                  {isCompleted && (
                    <Fab
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        bgcolor: isPassed ? 'success.main' : 'warning.main',
                        color: 'white',
                        zIndex: 1,
                        '&:hover': { bgcolor: isPassed ? 'success.dark' : 'warning.dark' }
                      }}
                    >
                      {isPassed ? <TrophyIcon /> : <CheckIcon />}
                    </Fab>
                  )}

                  {/* Lock Icon for Prerequisites */}
                  {isLocked && (
                    <Box sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1
                    }}>
                      <LockIcon color="disabled" />
                    </Box>
                  )}

                  <CardContent sx={{ flex: 1, pb: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 2, color: isLocked ? 'text.disabled' : 'primary.main' }}>
                        {getModuleIcon(resource.title)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ 
                          fontWeight: 'bold',
                          color: isLocked ? 'text.disabled' : 'text.primary'
                        }}>
                          {resource.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={difficultyLevel} 
                            size="small" 
                            color={getDifficultyColor(difficultyLevel)}
                            variant={isLocked ? 'outlined' : 'filled'}
                          />
                          {resource.interactive_module && (
                            <Chip 
                              icon={<TimerIcon />}
                              label={`${resource.interactive_module.estimated_duration}min`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {resource.summary}
                    </Typography>

                    {/* Progress Bar */}
                    {progress && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {progress.completion_percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress.completion_percentage}
                          sx={{ borderRadius: 2, height: 6 }}
                        />
                        {progress.latest_score && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Latest Score: {progress.latest_score}%
                            {progress.best_score && progress.best_score !== progress.latest_score && 
                              ` (Best: ${progress.best_score}%)`
                            }
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Prerequisites Warning */}
                    {isLocked && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Complete "Animal Rescue Fundamentals" first
                      </Alert>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      variant={isCompleted ? "outlined" : "contained"}
                      color="primary"
                      onClick={() => setSelectedResource(resource.slug)}
                      startIcon={isCompleted ? <StarIcon /> : <PlayIcon />}
                      fullWidth
                      disabled={isLocked}
                      sx={{
                        fontWeight: 'bold',
                        ...(isCompleted && {
                          color: 'success.main',
                          borderColor: 'success.main',
                          '&:hover': {
                            backgroundColor: 'success.main',
                            color: 'white'
                          }
                        })
                      }}
                    >
                      {isLocked ? 'Locked' : 
                       isCompleted ? 'Review Course' : 
                       progress ? 'Continue Training' : 'Start Training'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Learning Objectives Accordion */}
      {resources.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            📋 Training Program Overview
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">🎯 Learning Objectives</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
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
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={objective} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
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
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrophyIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={benefit} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">📚 Training Standards</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                Our training program follows industry standards from leading animal rescue organizations:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <EmergencyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="subtitle2">ASPCA</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Field Investigations & Response
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <FirstAidIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="subtitle2">American Humane</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Emergency Services Training
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <TeamIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="subtitle2">FEMA</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Incident Command System
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <AnimalIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="subtitle2">RedRover</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Emergency Sheltering
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onClose={() => setShowWelcome(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="div">
            Welcome to Rescue Training!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            You're about to begin professional animal rescue training based on real protocols from 
            ASPCA, American Humane, FEMA, and other leading emergency response organizations.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Training Requirements:
            </Typography>
            <ul>
              <li>Complete all modules in order (prerequisites required)</li>
              <li>Achieve 80% or higher on quizzes for certification</li>
              <li>Estimated total time: 4-6 hours</li>
            </ul>
          </Alert>

          <Typography variant="body1">
            Upon completion, you'll be qualified for emergency rescue assignments and gain 
            recognition as a certified animal rescue volunteer in our community.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWelcome(false)}>
            Maybe Later
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowWelcome(false);
              if (resources.length > 0) {
                setSelectedResource(resources[0].slug);
              }
            }}
            startIcon={<PlayIcon />}
          >
            Start Training Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InteractiveLearningPage;