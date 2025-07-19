// Enhanced InteractiveLearning.js with impressive styling

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Paper,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Grid,
  Divider,
  Fade,
  Slide,
  Zoom,
  Container,
  alpha,
  ButtonGroup,
} from '@mui/material';
import {
  School as SchoolIcon,
  Quiz as QuizIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  AutoAwesome as SparkleIcon,
  MenuBook as BookIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  LocalLibrary as LibraryIcon,
  Psychology as BrainIcon,
  Lightbulb as LightbulbIcon,
  Close as CloseIcon,
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

const InteractiveLearning = ({ resourceSlug, onComplete }) => {
  const [resource, setResource] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Content phase states
  const [currentPhase, setCurrentPhase] = useState('content');
  const [contentProgress, setContentProgress] = useState(0);
  const [readingStartTime, setReadingStartTime] = useState(null);
  
  // Quiz phase states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  
  // Checklist states
  const [checklistProgress, setChecklistProgress] = useState({});

  useEffect(() => {
    fetchResource();
  }, [resourceSlug]);

  useEffect(() => {
    if (currentPhase === 'content' && !readingStartTime) {
      setReadingStartTime(new Date());
    }
  }, [currentPhase]);

  const fetchResource = async () => {
    try {
      const response = await api.get(`/resources/${resourceSlug}/`);
      setResource(response.data);
      setProgress(response.data.user_progress);
      
      if (response.data.user_progress?.completion_percentage >= 100) {
        setCurrentPhase('quiz');
      } else {
        setCurrentPhase('content');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resource:', error);
      setLoading(false);
    }
  };

  const startLearning = async () => {
    try {
      const response = await api.post(`/resources/${resourceSlug}/start_learning/`);
      setProgress(response.data);
    } catch (error) {
      console.error('Error starting learning:', error);
    }
  };

  const completeContentReading = async () => {
    try {
      await api.post(`/resources/${resourceSlug}/update_progress/`, {
        completion_percentage: 100,
        time_spent: readingStartTime ? Math.round((new Date() - readingStartTime) / 60000) : 5
      });
      
      setProgress(prev => ({
        ...prev,
        completion_percentage: 100
      }));
      
      setCurrentPhase('quiz');
    } catch (error) {
      console.error('Error updating progress:', error);
      setCurrentPhase('quiz');
    }
  };

  const startQuiz = async () => {
    try {
      if (!progress) {
        await startLearning();
      }
      setQuizStartTime(new Date());
      setCurrentPhase('quiz');
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = async () => {
    try {
      const response = await api.post(`/resources/${resourceSlug}/submit_quiz/`, {
        answers: answers,
        started_at: quizStartTime.toISOString()
      });
      
      setQuizResults(response.data);
      setCurrentPhase('results');
      setProgress(response.data.progress);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const handleChecklistItemChange = (itemId, checked) => {
    const newProgress = {
      ...checklistProgress,
      [itemId]: checked
    };
    setChecklistProgress(newProgress);

    const totalItems = resource.interactive_module?.content_data?.checklist_items?.length || 0;
    const completedItems = Object.values(newProgress).filter(Boolean).length;
    const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    updateProgress(completionPercentage);
  };

  const updateProgress = async (completionPercentage) => {
    try {
      await api.post(`/resources/${resourceSlug}/update_progress/`, {
        completion_percentage: completionPercentage,
        time_spent: 5
      });
      
      setProgress(prev => ({
        ...prev,
        completion_percentage: completionPercentage
      }));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentPhase('quiz');
    setCurrentQuestion(0);
    setAnswers({});
    setQuizResults(null);
  };

  const backToContent = () => {
    setCurrentPhase('content');
    setCurrentQuestion(0);
    setAnswers({});
    setQuizResults(null);
  };

  // Enhanced Loading State
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
          <BookIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <LightbulbIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
            Loading Learning Module
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Preparing interactive content...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!resource) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Zoom in timeout={1000}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 8, 
              textAlign: 'center',
              borderRadius: 6,
              background: `
                radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
              `,
              border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
              position: 'relative'
            }}
          >
            <BookIcon 
              sx={{ 
                fontSize: 120, 
                color: alpha(customTheme.primary, 0.3), 
                mb: 3,
                animation: `${float} 4s ease-in-out infinite`
              }} 
            />
            <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
              Learning Module Not Found
            </Typography>
            <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7) }}>
              The requested learning content could not be loaded.
            </Typography>
          </Paper>
        </Zoom>
      </Container>
    );
  }

  // Enhanced Content Display Phase
  if (currentPhase === 'content') {
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
        py: 6
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
          <LibraryIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
          <LightbulbIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Enhanced Course Header */}
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
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
                {resource.title}
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  lineHeight: 1.6,
                  mb: 4,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                {resource.summary}
              </Typography>
              
              {/* Enhanced Progress Card */}
              {progress && (
                <Slide direction="up" in timeout={1200}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.accent, 0.1)} 100%)`,
                      border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                      backdropFilter: 'blur(10px)',
                      maxWidth: 500,
                      margin: '0 auto'
                    }}
                  >
                    <Typography variant="h6" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 700,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BrainIcon sx={{ mr: 1 }} />
                      Learning Progress
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {progress.completion_percentage || 0}%
                      </Typography>
                      <Chip 
                        label="In Progress"
                        sx={{
                          backgroundColor: alpha(customTheme.secondary, 0.15),
                          color: customTheme.secondary,
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={progress.completion_percentage || 0}
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        backgroundColor: alpha(customTheme.grey, 0.3),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: customTheme.success,
                          borderRadius: 6,
                          animation: progress.completion_percentage > 0 ? `${progressGlow} 2s infinite` : 'none'
                        }
                      }}
                    />
                  </Paper>
                </Slide>
              )}
            </Box>
          </Fade>

          {/* Enhanced Learning Content */}
          <Fade in timeout={1400}>
            <Card sx={{
              borderRadius: 6,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
              mb: 6,
              position: 'relative',
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
              <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
                {/* Enhanced Content Rendering */}
                <Box sx={{ 
                  fontSize: '1.1rem', 
                  lineHeight: 1.8, 
                  color: customTheme.primary,
                  mb: 6
                }}>
                  {resource.content.split('\n').map((line, index) => {
                    const trimmedLine = line.trim();
                    
                    // Headers
                    if (trimmedLine.startsWith('# ')) {
                      return (
                        <Typography
                          key={index}
                          variant="h3"
                          component="h1"
                          sx={{ 
                            fontWeight: 800,
                            color: customTheme.primary,
                            mt: 4,
                            mb: 3,
                            background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}
                        >
                          {trimmedLine.substring(2)}
                        </Typography>
                      );
                    }
                    
                    if (trimmedLine.startsWith('## ')) {
                      return (
                        <Typography
                          key={index}
                          variant="h4"
                          component="h2"
                          sx={{ 
                            fontWeight: 700,
                            color: customTheme.primary,
                            mt: 3,
                            mb: 2
                          }}
                        >
                          {trimmedLine.substring(3)}
                        </Typography>
                      );
                    }
                    
                    if (trimmedLine.startsWith('### ')) {
                      return (
                        <Typography
                          key={index}
                          variant="h5"
                          component="h3"
                          sx={{ 
                            fontWeight: 600,
                            color: alpha(customTheme.primary, 0.9),
                            mt: 3,
                            mb: 2
                          }}
                        >
                          {trimmedLine.substring(4)}
                        </Typography>
                      );
                    }
                    
                    // Bold text **text**
                    if (trimmedLine.includes('**')) {
                      const parts = trimmedLine.split('**');
                      return (
                        <Typography key={index} variant="body1" sx={{ mb: 2, fontSize: '1.1rem', lineHeight: 1.8 }}>
                          {parts.map((part, i) => 
                            i % 2 === 1 ? 
                              <Box component="strong" key={i} sx={{ 
                                fontWeight: 800, 
                                color: customTheme.primary,
                                background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                              }}>
                                {part}
                              </Box> : part
                          )}
                        </Typography>
                      );
                    }
                    
                    // List items
                    if (trimmedLine.startsWith('- ')) {
                      return (
                        <Box
                          key={index}
                          component="li"
                          sx={{ 
                            mb: 1.5,
                            ml: 3,
                            listStyleType: 'none',
                            position: 'relative',
                            fontSize: '1.1rem',
                            lineHeight: 1.8,
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: -20,
                              top: 12,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: customTheme.accent
                            }
                          }}
                        >
                          {trimmedLine.substring(2)}
                        </Box>
                      );
                    }
                    
                    // Numbered lists
                    if (/^\d+\./.test(trimmedLine)) {
                      return (
                        <Box
                          key={index}
                          component="li"
                          sx={{ 
                            mb: 1.5,
                            ml: 3,
                            listStyleType: 'decimal',
                            fontSize: '1.1rem',
                            lineHeight: 1.8,
                            color: customTheme.primary
                          }}
                        >
                          {trimmedLine.replace(/^\d+\.\s*/, '')}
                        </Box>
                      );
                    }
                    
                    // Regular paragraphs
                    if (trimmedLine && !trimmedLine.startsWith('#')) {
                      return (
                        <Typography 
                          key={index} 
                          variant="body1" 
                          sx={{ 
                            mb: 3,
                            textAlign: 'justify',
                            fontSize: '1.1rem',
                            lineHeight: 1.8,
                            color: customTheme.primary
                          }}
                        >
                          {trimmedLine}
                        </Typography>
                      );
                    }
                    
                    return <Box key={index} sx={{ mb: 2 }} />;
                  })}
                </Box>

                {/* Enhanced Call-to-Action */}
                <Paper
                  elevation={0}
                  sx={{ 
                    p: 6,
                    borderRadius: 5,
                    textAlign: 'center',
                    background: `
                      linear-gradient(135deg, 
                        ${alpha(customTheme.secondary, 0.15)} 0%, 
                        ${alpha(customTheme.success, 0.1)} 100%
                      )
                    `,
                    border: `3px solid ${alpha(customTheme.success, 0.3)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      left: -50,
                      width: 100,
                      height: 100,
                      background: `radial-gradient(circle, ${alpha(customTheme.success, 0.2)} 0%, transparent 70%)`,
                      animation: `${float} 6s ease-in-out infinite`
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.success,
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        animation: `${pulse} 2s infinite`
                      }}
                    >
                      <QuizIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    
                    <Typography variant="h4" sx={{ 
                      mb: 3, 
                      color: customTheme.primary,
                      fontWeight: 800
                    }}>
                      Ready to Test Your Knowledge?
                    </Typography>
                    
                    <Typography variant="h6" sx={{ 
                      mb: 4, 
                      color: alpha(customTheme.primary, 0.8),
                      lineHeight: 1.6
                    }}>
                      You've completed the training content. Time to prove your expertise with our assessment quiz!
                    </Typography>
                    
                    {resource.interactive_module?.module_type === 'QUIZ' && (
                      <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
                        <Grid item xs={4}>
                          <Paper
                            elevation={0}
                            sx={{ 
                              p: 3, 
                              borderRadius: 4,
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: `0 10px 25px ${alpha(customTheme.primary, 0.2)}`
                              }
                            }}
                          >
                            <Typography variant="h3" sx={{ 
                              color: customTheme.primary, 
                              fontWeight: 800,
                              mb: 1
                            }}>
                              {resource.interactive_module.quiz_questions?.length || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: alpha(customTheme.primary, 0.7),
                              fontWeight: 600
                            }}>
                              Questions
                            </Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Paper
                            elevation={0}
                            sx={{ 
                              p: 3, 
                              borderRadius: 4,
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: `0 10px 25px ${alpha(customTheme.secondary, 0.2)}`
                              }
                            }}
                          >
                            <Typography variant="h3" sx={{ 
                              color: customTheme.secondary, 
                              fontWeight: 800,
                              mb: 1
                            }}>
                              {resource.interactive_module.estimated_duration}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: alpha(customTheme.primary, 0.7),
                              fontWeight: 600
                            }}>
                              Minutes
                            </Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Paper
                            elevation={0}
                            sx={{ 
                              p: 3, 
                              borderRadius: 4,
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: `0 10px 25px ${alpha(customTheme.accent, 0.2)}`
                              }
                            }}
                          >
                            <Typography variant="h3" sx={{ 
                              color: customTheme.accent, 
                              fontWeight: 800,
                              mb: 1
                            }}>
                              {resource.interactive_module.passing_score}%
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: alpha(customTheme.primary, 0.7),
                              fontWeight: 600
                            }}>
                              To Pass
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    )}

                    <Button
                      onClick={completeContentReading}
                      variant="contained"
                      size="large"
                      startIcon={<QuizIcon />}
                      sx={{
                        py: 2,
                        px: 6,
                        borderRadius: 4,
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        textTransform: 'none',
                        background: `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                        boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`,
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
                          background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                          transform: 'translateY(-3px)',
                          boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.5)}`,
                          '&::before': {
                            left: '100%'
                          }
                        }
                      }}
                    >
                      Start Assessment Quiz
                    </Button>
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
    );
  }

  // Enhanced Quiz Results Phase
  if (currentPhase === 'results') {
    const attempt = quizResults.attempt;
    const passed = quizResults.passed;

    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(passed ? customTheme.success : customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 6
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
          <TrophyIcon sx={{ fontSize: 60, color: alpha(passed ? customTheme.success : customTheme.accent, 0.2) }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            animation: `${sparkle} 4s infinite`,
            animationDelay: '1s'
          }}
        >
          <StarIcon sx={{ fontSize: 40, color: alpha(customTheme.secondary, 0.3) }} />
        </Box>

        <Container maxWidth="md">
          <Zoom in timeout={1000}>
            <Card sx={{
              borderRadius: 6,
              overflow: 'hidden',
              background: passed ? 
                `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, rgba(255, 255, 255, 0.95) 100%)` :
                `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, rgba(255, 255, 255, 0.95) 100%)`,
              backdropFilter: 'blur(20px)',
              border: `3px solid ${passed ? customTheme.success : customTheme.accent}`,
              boxShadow: `0 25px 50px ${alpha(passed ? customTheme.success : customTheme.accent, 0.3)}`,
              position: 'relative',
              ...(passed && { animation: `${successPulse} 2s ease infinite` })
            }}>
              <CardContent sx={{ p: 6, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: passed ? customTheme.success : customTheme.accent,
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 4,
                    fontSize: '3rem',
                    animation: passed ? `${pulse} 2s infinite` : 'none'
                  }}
                >
                  {passed ? <TrophyIcon sx={{ fontSize: 60 }} /> : <BookIcon sx={{ fontSize: 60 }} />}
                </Avatar>
                
                <Typography variant="h2" sx={{ 
                  color: passed ? customTheme.success : customTheme.accent,
                  fontWeight: 800,
                  mb: 3,
                  background: passed ? 
                    `linear-gradient(45deg, ${customTheme.success}, ${customTheme.secondary})` :
                    `linear-gradient(45deg, ${customTheme.accent}, ${customTheme.primary})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {passed ? 'Congratulations!' : 'Good Effort!'}
                </Typography>
                
                <Typography variant="h3" sx={{ 
                  fontWeight: 800, 
                  mb: 4,
                  color: customTheme.primary
                }}>
                  You scored {attempt.score_percentage}%
                </Typography>
                
                {passed && (
                  <Fade in timeout={1500}>
                    <Paper
                      elevation={0}
                      sx={{ 
                        p: 4,
                        mb: 4,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.secondary, 0.1)} 100%)`,
                        border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                        animation: `${successPulse} 3s ease infinite`
                      }}
                    >
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: customTheme.success,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <TrophyIcon sx={{ mr: 2, fontSize: 28 }} />
                        Certification Earned!
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: alpha(customTheme.primary, 0.8),
                        fontWeight: 500
                      }}>
                        You've successfully completed {resource.title} and earned points for your achievement!
                      </Typography>
                    </Paper>
                  </Fade>
                )}
                
                {/* Enhanced Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  <Grid item xs={4}>
                    <Paper
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 10px 25px ${alpha(customTheme.success, 0.2)}`
                        }
                      }}
                    >
                      <Typography variant="h3" sx={{ 
                        color: customTheme.success, 
                        fontWeight: 800,
                        mb: 1
                      }}>
                        {attempt.correct_answers}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: alpha(customTheme.primary, 0.7),
                        fontWeight: 600
                      }}>
                        Correct
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Paper
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 10px 25px ${alpha(customTheme.primary, 0.2)}`
                        }
                      }}
                    >
                      <Typography variant="h3" sx={{ 
                        color: customTheme.primary, 
                        fontWeight: 800,
                        mb: 1
                      }}>
                        {attempt.total_questions}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: alpha(customTheme.primary, 0.7),
                        fontWeight: 600
                      }}>
                        Total
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Paper
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 10px 25px ${alpha(customTheme.accent, 0.2)}`
                        }
                      }}
                    >
                      <Typography variant="h3" sx={{ 
                        color: customTheme.accent, 
                        fontWeight: 800,
                        mb: 1
                      }}>
                        {attempt.time_spent_minutes}m
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: alpha(customTheme.primary, 0.7),
                        fontWeight: 600
                      }}>
                        Time
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Enhanced Action Buttons */}
                <ButtonGroup
                  variant="contained"
                  sx={{ 
                    '& .MuiButton-root': {
                      py: 2,
                      px: 4,
                      borderRadius: 3,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <Button
                    onClick={backToContent}
                    startIcon={<BookIcon />}
                    sx={{
                      background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    Review Content
                  </Button>
                  
                  {!passed && (
                    <Button
                      onClick={resetQuiz}
                      startIcon={<RefreshIcon />}
                      sx={{
                        background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${alpha(customTheme.accent, 0.8)} 90%)`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${customTheme.accent} 90%)`,
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      Try Quiz Again
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => window.location.reload()}
                    startIcon={<HomeIcon />}
                    sx={{
                      background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${alpha(customTheme.secondary, 0.8)} 90%)`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.secondary, 0.9)} 30%, ${customTheme.secondary} 90%)`,
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    Back to Training
                  </Button>
                </ButtonGroup>
              </CardContent>
            </Card>
          </Zoom>
        </Container>
      </Box>
    );
  }

  // Enhanced Quiz Phase
  if (currentPhase === 'quiz') {
    const questions = resource.interactive_module?.quiz_questions || [];
    
    // Quiz start screen
    if (!quizStartTime) {
      return (
        <Box sx={{ 
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
            linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          py: 6
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
            <BrainIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1) }} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              right: '10%',
              animation: `${sparkle} 4s infinite`,
              animationDelay: '1s'
            }}
          >
            <StarIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.3) }} />
          </Box>

          <Container maxWidth="md">
            <Fade in timeout={1000}>
              <Card sx={{
                borderRadius: 6,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`
              }}>
                <CardContent sx={{ p: 6, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: customTheme.primary,
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 4,
                      animation: `${pulse} 3s infinite`
                    }}
                  >
                    <BrainIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  
                  <Typography variant="h3" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 800,
                    mb: 2
                  }}>
                    Knowledge Assessment
                  </Typography>
                  
                  <Typography variant="h6" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    mb: 6,
                    lineHeight: 1.6
                  }}>
                    Test your understanding of the rescue protocols you just learned!
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{ 
                          p: 3, 
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: `0 10px 25px ${alpha(customTheme.primary, 0.2)}`
                          }
                        }}
                      >
                        <Typography variant="h3" sx={{ 
                          color: customTheme.primary, 
                          fontWeight: 800,
                          mb: 1
                        }}>
                          {questions.length}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: alpha(customTheme.primary, 0.7),
                          fontWeight: 600
                        }}>
                          Questions
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{ 
                          p: 3, 
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: `0 10px 25px ${alpha(customTheme.secondary, 0.2)}`
                          }
                        }}
                      >
                        <Typography variant="h3" sx={{ 
                          color: customTheme.secondary, 
                          fontWeight: 800,
                          mb: 1
                        }}>
                          {resource.interactive_module.estimated_duration}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: alpha(customTheme.primary, 0.7),
                          fontWeight: 600
                        }}>
                          Minutes
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{ 
                          p: 3, 
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: `0 10px 25px ${alpha(customTheme.accent, 0.2)}`
                          }
                        }}
                      >
                        <Typography variant="h3" sx={{ 
                          color: customTheme.accent, 
                          fontWeight: 800,
                          mb: 1
                        }}>
                          {resource.interactive_module.passing_score}%
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: alpha(customTheme.primary, 0.7),
                          fontWeight: 600
                        }}>
                          To Pass
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  {progress && progress.attempts_count > 0 && (
                    <Slide direction="up" in timeout={1200}>
                      <Paper
                        elevation={0}
                        sx={{ 
                          p: 3,
                          mb: 4,
                          borderRadius: 4,
                          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.6)} 100%)`,
                          border: `2px solid ${alpha(customTheme.primary, 0.2)}`
                        }}
                      >
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: customTheme.primary,
                          mb: 1
                        }}>
                          Your Previous Attempts
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: alpha(customTheme.primary, 0.8),
                          fontWeight: 500
                        }}>
                          Attempts: {progress.attempts_count}
                          {progress.best_score && ` • Best Score: ${progress.best_score}%`}
                        </Typography>
                      </Paper>
                    </Slide>
                  )}
                  
                  <ButtonGroup
                    variant="contained"
                    sx={{ 
                      '& .MuiButton-root': {
                        py: 2,
                        px: 4,
                        borderRadius: 3,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <Button
                      onClick={backToContent}
                      startIcon={<BackIcon />}
                      sx={{
                        background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.7)} 30%, ${alpha(customTheme.primary, 0.5)} 90%)`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.8)} 30%, ${alpha(customTheme.primary, 0.6)} 90%)`,
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      Review Content
                    </Button>
                    
                    <Button
                      onClick={startQuiz}
                      startIcon={<QuizIcon />}
                      sx={{
                        background: `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                        fontSize: '1.1rem',
                        px: 6,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      Begin Quiz
                    </Button>
                  </ButtonGroup>
                </CardContent>
              </Card>
            </Fade>
          </Container>
        </Box>
      );
    }

    // Quiz questions
    const question = questions[currentQuestion];
    if (!question) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h4" sx={{ color: customTheme.primary }}>
              No questions available
            </Typography>
          </Paper>
        </Container>
      );
    }

    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.15)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.15)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        py: 6
      }}>
        <Container maxWidth="md">
          {/* Enhanced Progress Bar */}
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: `2px solid ${alpha(customTheme.primary, 0.2)}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  color: customTheme.primary,
                  fontWeight: 700
                }}>
                  Question {currentQuestion + 1} of {questions.length}
                </Typography>
                <Chip
                  label={`${question.points} points`}
                  sx={{
                    backgroundColor: alpha(customTheme.accent, 0.15),
                    color: customTheme.accent,
                    fontWeight: 600
                  }}
                />
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={((currentQuestion + 1) / questions.length) * 100}
                sx={{ 
                  height: 12, 
                  borderRadius: 6,
                  backgroundColor: alpha(customTheme.grey, 0.3),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: customTheme.success,
                    borderRadius: 6,
                    animation: `${progressGlow} 2s infinite`
                  }
                }}
              />
            </Paper>
          </Fade>

          {/* Enhanced Question Card */}
          <Slide direction="up" in timeout={1000}>
            <Card sx={{
              borderRadius: 6,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
              mb: 4
            }}>
              <CardContent sx={{ p: 6 }}>
                <Typography variant="h4" sx={{ 
                  mb: 4,
                  color: customTheme.primary,
                  fontWeight: 700,
                  lineHeight: 1.6
                }}>
                  {question.question_text}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {question.question_type === 'MULTIPLE_CHOICE' && 
                    question.question_data.options?.map((option, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 0,
                          borderRadius: 4,
                          border: `3px solid ${answers[question.id] === index ? customTheme.success : alpha(customTheme.primary, 0.2)}`,
                          background: answers[question.id] === index ? 
                            `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)` :
                            'rgba(255, 255, 255, 0.8)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`,
                            border: `3px solid ${answers[question.id] === index ? customTheme.success : customTheme.primary}`
                          }
                        }}
                        onClick={() => handleAnswerChange(question.id, index)}
                      >
                        <FormControlLabel
                          control={
                            <Radio
                              checked={answers[question.id] === index}
                              onChange={() => handleAnswerChange(question.id, index)}
                              sx={{ 
                                color: customTheme.primary,
                                '&.Mui-checked': {
                                  color: customTheme.success
                                }
                              }}
                            />
                          }
                          label={
                            <Typography variant="h6" sx={{ 
                              color: customTheme.primary,
                              fontWeight: 600,
                              py: 2
                            }}>
                              {option}
                            </Typography>
                          }
                          sx={{ 
                            m: 0,
                            p: 3,
                            width: '100%',
                            '& .MuiFormControlLabel-label': {
                              width: '100%'
                            }
                          }}
                        />
                      </Paper>
                    ))
                  }

                  {question.question_type === 'TRUE_FALSE' && (
                    <>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 0,
                          borderRadius: 4,
                          border: `3px solid ${answers[question.id] === true ? customTheme.success : alpha(customTheme.primary, 0.2)}`,
                          background: answers[question.id] === true ? 
                            `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)` :
                            'rgba(255, 255, 255, 0.8)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.2)}`,
                            border: `3px solid ${customTheme.success}`
                          }
                        }}
                        onClick={() => handleAnswerChange(question.id, true)}
                      >
                        <FormControlLabel
                          control={
                            <Radio
                              checked={answers[question.id] === true}
                              onChange={() => handleAnswerChange(question.id, true)}
                              sx={{ 
                                color: customTheme.primary,
                                '&.Mui-checked': {
                                  color: customTheme.success
                                }
                              }}
                            />
                          }
                          label={
                            <Typography variant="h6" sx={{ 
                              color: customTheme.primary,
                              fontWeight: 600,
                              py: 2,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <CheckIcon sx={{ mr: 2, color: customTheme.success }} />
                              True
                            </Typography>
                          }
                          sx={{ 
                            m: 0,
                            p: 3,
                            width: '100%',
                            '& .MuiFormControlLabel-label': {
                              width: '100%'
                            }
                          }}
                        />
                      </Paper>
                      
                      <Paper
                        elevation={0}
                        sx={{
                          p: 0,
                          borderRadius: 4,
                          border: `3px solid ${answers[question.id] === false ? '#f44336' : alpha(customTheme.primary, 0.2)}`,
                          background: answers[question.id] === false ? 
                            `linear-gradient(135deg, ${alpha('#f44336', 0.1)} 0%, ${alpha('#f44336', 0.05)} 100%)` :
                            'rgba(255, 255, 255, 0.8)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha('#f44336', 0.2)}`,
                            border: `3px solid #f44336`
                          }
                        }}
                        onClick={() => handleAnswerChange(question.id, false)}
                      >
                        <FormControlLabel
                          control={
                            <Radio
                              checked={answers[question.id] === false}
                              onChange={() => handleAnswerChange(question.id, false)}
                              sx={{ 
                                color: customTheme.primary,
                                '&.Mui-checked': {
                                  color: '#f44336'
                                }
                              }}
                            />
                          }
                          label={
                            <Typography variant="h6" sx={{ 
                              color: customTheme.primary,
                              fontWeight: 600,
                              py: 2,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <CloseIcon sx={{ mr: 2, color: '#f44336' }} />
                              False
                            </Typography>
                          }
                          sx={{ 
                            m: 0,
                            p: 3,
                            width: '100%',
                            '& .MuiFormControlLabel-label': {
                              width: '100%'
                            }
                          }}
                        />
                      </Paper>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Slide>

          {/* Enhanced Navigation */}
          <Fade in timeout={1200}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: `2px solid ${alpha(customTheme.primary, 0.2)}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  startIcon={<BackIcon />}
                  variant="outlined"
                  sx={{
                    py: 2,
                    px: 4,
                    borderRadius: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderColor: currentQuestion === 0 ? alpha(customTheme.primary, 0.3) : customTheme.primary,
                    color: currentQuestion === 0 ? alpha(customTheme.primary, 0.5) : customTheme.primary,
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: customTheme.primary,
                      borderWidth: 2,
                      backgroundColor: alpha(customTheme.primary, 0.08),
                      transform: currentQuestion === 0 ? 'none' : 'translateY(-2px)'
                    }
                  }}
                >
                  Previous
                </Button>

                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    disabled={Object.keys(answers).length !== questions.length}
                    variant="contained"
                    startIcon={<SendIcon />}
                    sx={{
                      py: 2,
                      px: 6,
                      borderRadius: 3,
                      fontWeight: 800,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      background: Object.keys(answers).length !== questions.length ? 
                        alpha(customTheme.primary, 0.3) :
                        `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                      '&:hover:not(:disabled)': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.4)}`
                      }
                    }}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                    variant="contained"
                    endIcon={<ForwardIcon />}
                    sx={{
                      py: 2,
                      px: 4,
                      borderRadius: 3,
                      fontWeight: 700,
                      textTransform: 'none',
                      background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  // Enhanced Checklist Module
  if (resource.interactive_module?.module_type === 'CHECKLIST') {
    const items = resource.interactive_module.content_data?.checklist_items || [];

    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.success, 0.2)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        py: 6
      }}>
        <Container maxWidth="md">
          <Fade in timeout={1000}>
            <Card sx={{
              borderRadius: 6,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.secondary, 0.3)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.secondary, 0.15)}`
            }}>
              <CardContent sx={{ p: 6 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                  <Avatar
                    sx={{
                      bgcolor: customTheme.secondary,
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      animation: `${pulse} 3s infinite`
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  
                  <Typography variant="h3" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 800,
                    mb: 2
                  }}>
                    {resource.title}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    mb: 4
                  }}>
                    {resource.summary}
                  </Typography>
                  
                  <Typography variant="h5" sx={{ 
                    color: customTheme.secondary,
                    fontWeight: 700
                  }}>
                    Interactive Checklist
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.7),
                    mt: 1
                  }}>
                    Check off each item as you complete it
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {items.map((item) => (
                    <Paper
                      key={item.id}
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        background: checklistProgress[item.id] ? 
                          `linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.secondary, 0.1)} 100%)` :
                          'rgba(255, 255, 255, 0.8)',
                        border: `3px solid ${checklistProgress[item.id] ? customTheme.success : alpha(customTheme.primary, 0.2)}`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 10px 25px ${alpha(checklistProgress[item.id] ? customTheme.success : customTheme.primary, 0.2)}`
                        }
                      }}
                      onClick={() => handleChecklistItemChange(item.id, !checklistProgress[item.id])}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={checklistProgress[item.id] || false}
                            onChange={(e) => handleChecklistItemChange(item.id, e.target.checked)}
                            sx={{ 
                              color: customTheme.primary,
                              '&.Mui-checked': {
                                color: customTheme.success
                              },
                              transform: 'scale(1.2)'
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: customTheme.primary,
                              textDecoration: checklistProgress[item.id] ? 'line-through' : 'none',
                              mb: 1
                            }}>
                              {item.text}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: alpha(customTheme.primary, 0.8),
                              lineHeight: 1.6
                            }}>
                              {item.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          m: 0,
                          alignItems: 'flex-start',
                          '& .MuiFormControlLabel-label': {
                            ml: 2,
                            width: '100%'
                          }
                        }}
                      />
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Container>
      </Box>
    );
  }

  // Fallback
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Zoom in timeout={1000}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 8, 
            textAlign: 'center',
            borderRadius: 6,
            background: `
              radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
              linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
            `,
            border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
            position: 'relative'
          }}
        >
          <LibraryIcon 
            sx={{ 
              fontSize: 120, 
              color: alpha(customTheme.primary, 0.3), 
              mb: 3,
              animation: `${float} 4s ease-in-out infinite`
            }} 
          />
          <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
            Interactive Features Coming Soon!
          </Typography>
          <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            This course will have interactive features soon.
          </Typography>
        </Paper>
      </Zoom>
    </Container>
  );
};

export default InteractiveLearning;