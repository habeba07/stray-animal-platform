// ShelterVolunteerManagement.js - Enhanced volunteer management system for SHELTER users

import React, { useState, useEffect } from 'react';
import api from '../../redux/api'; 

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
  IconButton,
  Fab,
  Avatar,
  Stack,
  Divider,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  VolunteerActivism as VolunteerIcon, 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  Emergency as EmergencyIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { format } from 'date-fns';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63', // Warm Brown
  secondary: '#81c784', // Soft Green
  success: '#4caf50', // Fresh Green
  grey: '#f3e5ab', // Warm Cream
  accent: '#ff8a65', // Gentle Orange
  background: '#fff8e1', // Soft Cream
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

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`volunteer-mgmt-tabpanel-${index}`}
      aria-labelledby={`volunteer-mgmt-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function ShelterVolunteerManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [opportunities, setOpportunities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [rescueAssignments, setRescueAssignments] = useState([]);
  const [analytics, setAnalytics] = useState({});
  
  // Dialog states
  const [createOpportunityOpen, setCreateOpportunityOpen] = useState(false);
  const [editOpportunityOpen, setEditOpportunityOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for creating opportunities
  const [opportunityForm, setOpportunityForm] = useState({
    title: '',
    description: '',
    category: 'ANIMAL_CARE',
    location: '',
    start_time: '',
    end_time: '',
    min_volunteers: 1,
    max_volunteers: 5,
    skills_required: [],
    requires_transportation: false,
    minimum_experience: 'BEGINNER',
    is_emergency: false,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [
        opportunitiesResponse,
        assignmentsResponse,
        volunteersResponse,
        rescueAssignmentsResponse
      ] = await Promise.all([
        api.get('/volunteer-opportunities/'),
        api.get('/volunteer-assignments/'),
        api.get('/volunteer-profiles/'),
        api.get('/rescue-assignments/'),
      ]);

      
     setOpportunities(opportunitiesResponse.data);
     setAssignments(assignmentsResponse.data);
     setVolunteers(volunteersResponse.data);
     setRescueAssignments(rescueAssignmentsResponse.data);

     // Calculate analytics
      calculateAnalytics(opportunitiesResponse.data, assignmentsResponse.data, volunteersResponse.data);
      
    } catch (err) {
      setError('Failed to load volunteer management data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (opps, assigns, vols) => {
    console.log('🔍 ANALYTICS INPUT:', assigns); 

    const stats = {
      totalVolunteers: vols.length,
      activeOpportunities: opps.filter(o => o.status === 'OPEN').length,
      pendingAssignments: assigns.filter(a => 
        a.status === 'ASSIGNED' || a.status === 'CONFIRMED'  // Include both statuses
      ).length,
      completedAssignments: assigns.filter(a => a.status === 'COMPLETED').length,
      totalVolunteerHours: assigns.reduce((sum, a) => sum + (a.hours_logged || 0), 0),
      averageResponseTime: '15 min', // Would calculate from rescue assignments
    };

    console.log('🔍 CALCULATED ANALYTICS:', stats);
    setAnalytics(stats);
  };

  const handleCreateOpportunity = async () => {
    try {
      setSubmitting(true);
      await api.post('/volunteer-opportunities/', opportunityForm);
      setCreateOpportunityOpen(false);
      setOpportunityForm({
        title: '',
        description: '',
        category: 'ANIMAL_CARE',
        location: '',
        start_time: '',
        end_time: '',
        min_volunteers: 1,
        max_volunteers: 5,
        skills_required: [],
        requires_transportation: false,
        minimum_experience: 'BEGINNER',
        is_emergency: false,
      });
      fetchAllData();
    } catch (err) {
      setError('Failed to create opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    try {
      await api.delete(`/volunteer-opportunities/${opportunityId}/`);
      fetchAllData();
    } catch (err) {
      setError('Failed to delete opportunity');
    }
  };

  const formatDateTime = (dateTimeStr) => {
    return format(new Date(dateTimeStr), 'PPP p');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'CONFIRMED': return 'primary';
      case 'ASSIGNED': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
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
        }}
      >
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
          <VolunteerIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <PeopleIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
            Loading Volunteer Management
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Organizing volunteer coordination data...
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
        <VolunteerIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <AssignmentIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, position: 'relative', zIndex: 1 }}>
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

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Slide direction="right" in timeout={1200}>
                <Avatar
                  sx={{
                    bgcolor: customTheme.secondary,
                    width: 60,
                    height: 60,
                    mr: 3,
                    boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  <VolunteerIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Slide>
              
              <Box>
                <Typography 
                  variant="h3" 
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
                  Volunteer Management
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 400,
                    lineHeight: 1.6,
                    animation: `${slideInUp} 1s ease-out 0.3s both`
                  }}
                >
                  Manage volunteer opportunities, assignments, and coordination
                </Typography>
              </Box>
            </Box>
            
            <Slide direction="left" in timeout={1400}>
              <Fab 
                color="primary" 
                aria-label="add opportunity"
                onClick={() => setCreateOpportunityOpen(true)}
                sx={{
                  background: `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
                  color: '#ffffff',
                  width: 64,
                  height: 64,
                  boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                    transform: 'scale(1.1) translateY(-3px)',
                    boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.5)}`
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <AddIcon sx={{ fontSize: 28 }} />
              </Fab>
            </Slide>
          </Box>
        </Fade>

        {/* Enhanced Error Alert */}
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
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
              onClose={() => setError('')}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Enhanced Analytics Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={800} style={{ transitionDelay: '100ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha(customTheme.primary, 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha(customTheme.primary, 0.2)},
                    0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <PeopleIcon sx={{ 
                    fontSize: 50, 
                    color: customTheme.primary, 
                    mb: 2,
                    animation: `${pulse} 3s infinite`,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 800,
                    mb: 1,
                    background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {analytics.totalVolunteers}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha(customTheme.primary, 0.7),
                    fontWeight: 600
                  }}>
                    Active Volunteers
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={800} style={{ transitionDelay: '200ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha(customTheme.success, 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.success, 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha(customTheme.success, 0.2)},
                    0 0 0 1px ${alpha(customTheme.success, 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <EventIcon sx={{ 
                    fontSize: 50, 
                    color: customTheme.success, 
                    mb: 2,
                    animation: `${pulse} 3s infinite`,
                    animationDelay: '1s',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    color: customTheme.success,
                    fontWeight: 800,
                    mb: 1
                  }}>
                    {analytics.activeOpportunities}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha(customTheme.success, 0.8),
                    fontWeight: 600
                  }}>
                    Open Opportunities
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={800} style={{ transitionDelay: '300ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha('#ff9800', 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha('#ff9800', 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha('#ff9800', 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha('#ff9800', 0.2)},
                    0 0 0 1px ${alpha('#ff9800', 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha('#ff9800', 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <AssignmentIcon sx={{ 
                    fontSize: 50, 
                    color: '#ff9800', 
                    mb: 2,
                    animation: `${pulse} 3s infinite`,
                    animationDelay: '2s',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    color: '#ff9800',
                    fontWeight: 800,
                    mb: 1
                  }}>
                    {analytics.pendingAssignments}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha('#ff9800', 0.8),
                    fontWeight: 600
                  }}>
                    Pending Assignments
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={800} style={{ transitionDelay: '400ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha(customTheme.success, 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.success, 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha(customTheme.success, 0.2)},
                    0 0 0 1px ${alpha(customTheme.success, 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <CheckIcon sx={{ 
                    fontSize: 50, 
                    color: customTheme.success, 
                    mb: 2,
                    animation: `${pulse} 3s infinite`,
                    animationDelay: '3s',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    color: customTheme.success,
                    fontWeight: 800,
                    mb: 1
                  }}>
                    {analytics.completedAssignments}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha(customTheme.success, 0.8),
                    fontWeight: 600
                  }}>
                    Completed This Month
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={800} style={{ transitionDelay: '500ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha('#2196f3', 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha('#2196f3', 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha('#2196f3', 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha('#2196f3', 0.2)},
                    0 0 0 1px ${alpha('#2196f3', 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha('#2196f3', 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <AnalyticsIcon sx={{ 
                    fontSize: 50, 
                    color: '#2196f3', 
                    mb: 2,
                    animation: `${pulse} 3s infinite`,
                    animationDelay: '4s',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    color: '#2196f3',
                    fontWeight: 800,
                    mb: 1
                  }}>
                    {analytics.totalVolunteerHours}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha('#2196f3', 0.8),
                    fontWeight: 600
                  }}>
                    Total Hours Logged
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Zoom in timeout={800} style={{ transitionDelay: '600ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha('#f44336', 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha('#f44336', 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha('#f44336', 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha('#f44336', 0.2)},
                    0 0 0 1px ${alpha('#f44336', 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha('#f44336', 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <EmergencyIcon sx={{ 
                    fontSize: 50, 
                    color: '#f44336', 
                    mb: 2,
                    animation: `${pulse} 3s infinite`,
                    animationDelay: '5s',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }} />
                  <Typography variant="h3" sx={{ 
                    color: '#f44336',
                    fontWeight: 800,
                    mb: 1
                  }}>
                    {analytics.averageResponseTime}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha('#f44336', 0.8),
                    fontWeight: 600
                  }}>
                    Avg Response Time
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Enhanced Navigation Tabs */}
        <Slide direction="up" in timeout={1600}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: `
                linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
              `,
              border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
              backdropFilter: 'blur(20px)',
              mb: 4
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: customTheme.primary,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  minHeight: 80,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(customTheme.primary, 0.08),
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-selected': {
                    color: customTheme.primary,
                    backgroundColor: alpha(customTheme.primary, 0.1),
                    fontWeight: 800
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: customTheme.primary,
                  height: 4,
                  borderRadius: 2
                }
              }}
            >
              <Tab 
                label={
                  <Badge badgeContent={opportunities.length} color="primary">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon sx={{ mr: 1 }} />
                      Opportunities
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={assignments.length} color="warning">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1 }} />
                      Assignments
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={volunteers.length} color="success">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 1 }} />
                      Volunteers
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={rescueAssignments.length} color="error">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmergencyIcon sx={{ mr: 1 }} />
                      Rescue Coordination
                    </Box>
                  </Badge>
                } 
              />
            </Tabs>
          </Paper>
        </Slide>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <Fade in timeout={1000}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ 
                color: customTheme.primary, 
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <EventIcon sx={{ fontSize: '1.2em' }} />
                Volunteer Opportunities Management
              </Typography>
              
              <Paper sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`
              }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(customTheme.primary, 0.05) }}>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Date/Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Volunteers</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {opportunities.map((opportunity, index) => (
                        <TableRow 
                          key={opportunity.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(customTheme.primary, 0.02),
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            },
                            '&:nth-of-type(even)': {
                              backgroundColor: alpha(customTheme.grey, 0.1)
                            }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: customTheme.primary }}>
                            {opportunity.title}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={opportunity.category} 
                              size="small" 
                              sx={{
                                backgroundColor: alpha(customTheme.secondary, 0.15),
                                color: customTheme.secondary,
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {formatDateTime(opportunity.start_time)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {opportunity.assigned_count || 0} / {opportunity.max_volunteers}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={opportunity.status} 
                              color={opportunity.status === 'OPEN' ? 'success' : 'default'}
                              size="small" 
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  setSelectedOpportunity(opportunity);
                                  setEditOpportunityOpen(true);
                                }}
                                sx={{
                                  color: customTheme.primary,
                                  '&:hover': {
                                    backgroundColor: alpha(customTheme.primary, 0.1),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                size="small"
                                sx={{
                                  color: customTheme.secondary,
                                  '&:hover': {
                                    backgroundColor: alpha(customTheme.secondary, 0.1),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteOpportunity(opportunity.id)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: alpha('#f44336', 0.1),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Fade in timeout={1000}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ 
                color: customTheme.primary, 
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <AssignmentIcon sx={{ fontSize: '1.2em' }} />
                Volunteer Assignments
              </Typography>
              
              <Paper sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`
              }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(customTheme.primary, 0.05) }}>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Volunteer</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Opportunity</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Assigned Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Hours Logged</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.map((assignment, index) => (
                        <TableRow 
                          key={assignment.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha(customTheme.primary, 0.02),
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            },
                            '&:nth-of-type(even)': {
                              backgroundColor: alpha(customTheme.grey, 0.1)
                            }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: customTheme.primary }}>
                            {assignment.volunteer_details?.username || 'Unknown'}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {assignment.opportunity_details?.title || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={assignment.status} 
                              color={getStatusColor(assignment.status)}
                              size="small" 
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {formatDateTime(assignment.assigned_at)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {assignment.hours_logged || '-'}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton 
                                size="small"
                                sx={{
                                  color: customTheme.secondary,
                                  '&:hover': {
                                    backgroundColor: alpha(customTheme.secondary, 0.1),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                              {assignment.status === 'ASSIGNED' && (
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: alpha(customTheme.success, 0.1),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <CheckIcon />
                                </IconButton>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Fade in timeout={1000}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ 
                color: customTheme.primary, 
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <PeopleIcon sx={{ fontSize: '1.2em' }} />
                Volunteer Directory
              </Typography>
              
              <Grid container spacing={3}>
                {volunteers.map((volunteer, index) => (
                  <Grid item xs={12} md={6} lg={4} key={volunteer.id}>
                    <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                      <Card sx={{
                        height: '100%',
                        borderRadius: 5,
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `2px solid ${alpha(customTheme.secondary, 0.1)}`,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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
                            radial-gradient(circle at top right, ${alpha(customTheme.secondary, 0.1)} 0%, transparent 50%)
                          `,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          pointerEvents: 'none',
                          zIndex: 1
                        },
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: `
                            0 25px 50px ${alpha(customTheme.secondary, 0.25)},
                            0 0 0 1px ${alpha(customTheme.secondary, 0.1)},
                            inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                          `,
                          border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                          '&::before': {
                            opacity: 1
                          }
                        }
                      }}>
                        <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar sx={{ 
                              mr: 3, 
                              bgcolor: customTheme.secondary,
                              width: 56,
                              height: 56,
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.3)}`
                            }}>
                              {volunteer.user_details?.first_name?.charAt(0)?.toUpperCase() || 'V'}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 700,
                                color: customTheme.primary,
                                mb: 0.5
                              }}>
                                {volunteer.user_details?.first_name} {volunteer.user_details?.last_name}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: alpha(customTheme.primary, 0.7),
                                fontWeight: 600
                              }}>
                                {volunteer.user_details?.username}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                              Experience: {volunteer.experience_level}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                              Total Hours: {volunteer.total_hours || 0}
                            </Typography>
                          </Box>
                          
                          {volunteer.skills && volunteer.skills.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, mb: 1 }}>
                                Skills:
                              </Typography>
                              <Box>
                                {volunteer.skills.slice(0, 3).map((skill, index) => (
                                  <Chip 
                                    key={index} 
                                    label={skill} 
                                    size="small" 
                                    sx={{ 
                                      mr: 0.5, 
                                      mb: 0.5,
                                      backgroundColor: alpha(customTheme.secondary, 0.15),
                                      color: customTheme.secondary,
                                      fontWeight: 600
                                    }} 
                                  />
                                ))}
                                {volunteer.skills.length > 3 && (
                                  <Chip 
                                    label={`+${volunteer.skills.length - 3} more`} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{
                                      borderColor: customTheme.secondary,
                                      color: customTheme.secondary,
                                      fontWeight: 600
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                        <CardActions sx={{ p: 3, pt: 0, position: 'relative', zIndex: 2 }}>
                          <Button 
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: customTheme.secondary,
                              color: customTheme.secondary,
                              fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: customTheme.secondary,
                                backgroundColor: alpha(customTheme.secondary, 0.1),
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            View Profile
                          </Button>
                          <Button 
                            size="small"
                            variant="contained"
                            sx={{
                              background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${alpha(customTheme.secondary, 0.8)} 90%)`,
                              color: '#ffffff',
                              fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': {
                                background: `linear-gradient(45deg, ${alpha(customTheme.secondary, 0.9)} 30%, ${customTheme.secondary} 90%)`,
                                transform: 'translateY(-1px)',
                                boxShadow: `0 4px 12px ${alpha(customTheme.secondary, 0.3)}`
                              }
                            }}
                          >
                            Contact
                          </Button>
                        </CardActions>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Fade in timeout={1000}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#f44336', 
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <EmergencyIcon sx={{ fontSize: '1.2em' }} />
                Emergency Rescue Coordination
              </Typography>
              
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  fontSize: '1rem',
                  backgroundColor: alpha(customTheme.primary, 0.1),
                  border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                  '& .MuiAlert-icon': {
                    fontSize: '1.3rem',
                    color: customTheme.primary
                  }
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                  Coordinate volunteer responses to emergency animal rescues. Monitor real-time status and GPS tracking.
                </Typography>
              </Alert>
              
              <Paper sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha('#f44336', 0.1)}`,
                boxShadow: `0 20px 40px ${alpha('#f44336', 0.1)}`
              }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha('#f44336', 0.05) }}>
                        <TableCell sx={{ fontWeight: 700, color: '#f44336', fontSize: '1rem' }}>Report</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#f44336', fontSize: '1rem' }}>Volunteer</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#f44336', fontSize: '1rem' }}>Assignment Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#f44336', fontSize: '1rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#f44336', fontSize: '1rem' }}>Response Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#f44336', fontSize: '1rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rescueAssignments.map((assignment, index) => (
                        <TableRow 
                          key={assignment.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha('#f44336', 0.02),
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            },
                            '&:nth-of-type(even)': {
                              backgroundColor: alpha(customTheme.grey, 0.1)
                            }
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: customTheme.primary }}>
                                {assignment.report_details?.animal_type} Rescue
                              </Typography>
                              <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 500 }}>
                                ID: {assignment.report}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: customTheme.primary }}>
                            {assignment.volunteer_details?.username}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={assignment.assignment_type} 
                              size="small" 
                              sx={{
                                backgroundColor: alpha('#f44336', 0.15),
                                color: '#f44336',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={assignment.status} 
                              color={getStatusColor(assignment.status)}
                              size="small" 
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {assignment.response_time_minutes || '-'} min
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton 
                                size="small"
                                sx={{
                                  color: customTheme.secondary,
                                  '&:hover': {
                                    backgroundColor: alpha(customTheme.secondary, 0.1),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="primary"
                                sx={{
                                  '&:hover': {
                                    backgroundColor: alpha(customTheme.primary, 0.1),
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <LocationIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Fade>
        </TabPanel>

        {/* Enhanced Create Opportunity Dialog */}
        <Dialog 
          open={createOpportunityOpen} 
          onClose={() => setCreateOpportunityOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: customTheme.background,
              border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ 
            color: customTheme.primary, 
            fontWeight: 700, 
            fontSize: '1.5rem',
            borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`,
            pb: 2
          }}>
            Create New Volunteer Opportunity
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={opportunityForm.title}
                  onChange={(e) => setOpportunityForm({...opportunityForm, title: e.target.value})}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={opportunityForm.description}
                  onChange={(e) => setOpportunityForm({...opportunityForm, description: e.target.value})}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>Category</InputLabel>
                  <Select
                    value={opportunityForm.category}
                    onChange={(e) => setOpportunityForm({...opportunityForm, category: e.target.value})}
                    label="Category"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.primary
                      }
                    }}
                  >
                    <MenuItem value="ANIMAL_CARE">Animal Care</MenuItem>
                    <MenuItem value="ADOPTION_EVENT">Adoption Event</MenuItem>
                    <MenuItem value="FUNDRAISING">Fundraising</MenuItem>
                    <MenuItem value="TRANSPORT">Transportation</MenuItem>
                    <MenuItem value="ADMIN">Administrative</MenuItem>
                    <MenuItem value="MAINTENANCE">Facility Maintenance</MenuItem>
                    <MenuItem value="RESCUE_TRAINING">Rescue Training</MenuItem>
                    <MenuItem value="EMERGENCY_RESPONSE">Emergency Response</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={opportunityForm.location}
                  onChange={(e) => setOpportunityForm({...opportunityForm, location: e.target.value})}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Start Time"
                  value={opportunityForm.start_time}
                  onChange={(e) => setOpportunityForm({...opportunityForm, start_time: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="End Time"
                  value={opportunityForm.end_time}
                  onChange={(e) => setOpportunityForm({...opportunityForm, end_time: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Volunteers"
                  value={opportunityForm.min_volunteers}
                  onChange={(e) => setOpportunityForm({...opportunityForm, min_volunteers: parseInt(e.target.value)})}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Volunteers"
                  value={opportunityForm.max_volunteers}
                  onChange={(e) => setOpportunityForm({...opportunityForm, max_volunteers: parseInt(e.target.value)})}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      fontWeight: 600
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={() => setCreateOpportunityOpen(false)}
              sx={{ 
                color: alpha(customTheme.primary, 0.7), 
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: alpha(customTheme.primary, 0.1)
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOpportunity} 
              variant="contained" 
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              sx={{
                background: `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
                color: '#ffffff',
                fontWeight: 700,
                px: 4,
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 20px ${alpha(customTheme.success, 0.3)}`
                },
                '&:disabled': {
                  background: alpha(customTheme.success, 0.3),
                  color: alpha('#ffffff', 0.5)
                }
              }}
            >
              {submitting ? 'Creating...' : 'Create Opportunity'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default ShelterVolunteerManagement;