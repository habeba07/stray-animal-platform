// Enhanced VolunteerHub.js with impressive styling

import React, { useState, useEffect } from 'react';
import TeamMessageDialog from './TeamMessageDialog';
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
  Badge,
  Snackbar,
  Alert as MuiAlert,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Paper,
  Avatar,
  Fade,
  Slide,
  Zoom,
  Divider,
  alpha,
} from '@mui/material';
import {
  Emergency as EmergencyIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  AccessTime as TimerIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  DriveEta as CarIcon, 
  Warning as WarningIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Message as MessageIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  LocalHospital as MedicalIcon,
  DirectionsCar as TransportIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { format } from 'date-fns';
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

const emergencyPulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
  70% { transform: scale(1.03); box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
`;

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`volunteer-tabpanel-${index}`}
      aria-labelledby={`volunteer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function VolunteerHub() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [rescues, setRescues] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [rescueAssignments, setRescueAssignments] = useState([]);
  const [regularAssignments, setRegularAssignments] = useState([]);
  
  // Dialog states
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [assignmentType, setAssignmentType] = useState('PRIMARY');
  const [volunteerNotes, setVolunteerNotes] = useState('');
  const [accepting, setAccepting] = useState(false);

  // Completion states
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completionOutcome, setCompletionOutcome] = useState('SUCCESS');
  const [completionNotes, setCompletionNotes] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [qualificationRefreshTime, setQualificationRefreshTime] = useState(null);
  // Team messaging states
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedAssignmentForMessage, setSelectedAssignmentForMessage] = useState(null);

  useEffect(() => {
    fetchAllData();
    // Set up real-time updates every 30 seconds for emergency rescues
    const interval = setInterval(fetchRescues, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keep all existing API functions unchanged
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await refreshVolunteerQualifications();
      await Promise.all([
        fetchRescues(),
        fetchOpportunities(), 
        fetchAssignments()
      ]);
    } catch (err) {
      console.error('Error fetching volunteer data:', err);
      setError('Failed to load volunteer data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRescues = async () => {
    try {
      const response = await api.get('/volunteers/rescue-assignments/available_rescues/');
      setRescues(response.data || []);
    } catch (err) {
      console.error('Error fetching rescue assignments:', err);
      try {
        const reportsResponse = await api.get('/reports/', {
          params: {
            status__in: 'PENDING,INVESTIGATING,ASSIGNED',
            urgency_level__in: 'HIGH,EMERGENCY',
            limit: 20
          }
        });
        
        const urgentReports = (reportsResponse.data.results || reportsResponse.data || []).map(report => ({
          id: report.id,
          type: 'rescue',
          animal_type: report.animal?.breed || 'Unknown Animal',
          urgency: report.urgency_level || 'NORMAL',
          location: report.location || 
            (report.geo_location ? { 
              lat: report.geo_location.coordinates[1], 
              lng: report.geo_location.coordinates[0] 
            } : null),
          location_details: report.location_details,
          description: report.description,
          animal_condition: report.animal_condition || report.animal_condition_choice,
          created_at: report.created_at,
          time_since_reported: calculateTimeSince(report.created_at),
          distance_km: null,
          photos: report.photos || []
        }));
        
        setRescues(urgentReports);
      } catch (fallbackErr) {
        console.error('Error fetching reports as fallback:', fallbackErr);
        setRescues([]);
      }
    }
  };

  const fetchOpportunities = async () => {
    try {
      const response = await api.get('/volunteers/opportunities/upcoming/');
      setOpportunities(response.data || []);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setOpportunities([]);
    }
  };

  const fetchAssignments = async () => {
    try {
      const rescueResponse = await api.get('/volunteers/rescue-assignments/my_rescue_assignments/');
      setRescueAssignments(rescueResponse.data || []);
      
      const regularResponse = await api.get('/volunteers/assignments/my_assignments/');
      setRegularAssignments(regularResponse.data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setRescueAssignments([]);
      setRegularAssignments([]);
    }
  };

  const refreshVolunteerQualifications = async () => {
    try {
      console.log('Refreshing volunteer qualifications...');
      const response = await api.post('/volunteers/rescue-assignments/refresh_qualifications/');
      
      if (response.data.success) {
        console.log('Qualifications refreshed:', response.data);
        setQualificationRefreshTime(new Date());
        await fetchRescues(); 
        setError(`${response.data.message}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error refreshing qualifications:', error);
      setError('Could not refresh qualifications. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const extractAnimalTypeFromDescription = (description) => {
    if (!description) return null;
    const lower = description.toLowerCase();
    if (lower.includes('dog')) return 'Dog Rescue';
    if (lower.includes('cat')) return 'Cat Rescue';
    if (lower.includes('bird')) return 'Bird Rescue';
    return null;
  };

  const calculateTimeSince = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    }
    return `${diffMinutes}m ago`;
  };

  const handleAcceptRescue = async () => {
    if (!selectedItem) return;
  
    setAccepting(true);
    try {
      if (selectedItem.type === 'rescue') {
        const assignmentData = {
          report_id: selectedItem.id,
          assignment_type: assignmentType,
          volunteer_notes: volunteerNotes
        };
      
        await api.post('/rescue-assignments/accept_rescue/', assignmentData);
        setError('');
        setError('Successfully accepted rescue assignment! Check "My Assignments" tab for details.');
        setTimeout(() => setError(''), 5000);
      
      } else {
        await api.post(`/volunteer-opportunities/${selectedItem.id}/volunteer/`, {
          notes: volunteerNotes
        });
      }
    
      await fetchAllData();
      setAcceptDialogOpen(false);
      resetDialog();
    
    } catch (err) {
      console.error('Error accepting assignment:', err);
      setError(`Failed to accept assignment: ${err.response?.data?.detail || err.message}`);
    } finally {
      setAccepting(false);
    }
  };

  const handleCompleteAssignment = (assignment, isRescue) => {
    setSelectedAssignment({ ...assignment, isRescue });
    setCompleteDialogOpen(true);
    setCompletionOutcome('SUCCESS');
    setCompletionNotes('');
  };

  const submitCompletion = async () => {
    if (!selectedAssignment) return;

    setCompleting(true);
    try {
      if (selectedAssignment.isRescue) {
        await api.post(`/volunteers/rescue-assignments/${selectedAssignment.id}/complete_rescue/`, {
          completion_notes: completionNotes,
          rescue_outcome: completionOutcome
        });
        setSnackbarMessage('Rescue completed successfully! Points awarded.');
      } else {
        await api.patch(`/volunteers/assignments/${selectedAssignment.id}/`, {
          status: 'COMPLETED',
          completion_notes: completionNotes,
          completed_at: new Date().toISOString()
        });
        setSnackbarMessage('Assignment completed successfully!');
      }

      await fetchAssignments();
      setCompleteDialogOpen(false);
      setSnackbarOpen(true);
      
    } catch (err) {
      console.error('Error completing assignment:', err);
      setError('Failed to complete assignment. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const resetDialog = () => {
    setSelectedItem(null);
    setAssignmentType('PRIMARY');
    setVolunteerNotes('');
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const formatTimeAgo = (dateString) => {
    return calculateTimeSince(dateString);
  };

  const renderLocation = (location) => {
    if (!location) return 'Location not specified';
    
    if (typeof location === 'string') return location;
    
    if (location.lat && location.lng) {
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    }
    
    return 'Location available';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toUpperCase()) {
      case 'EMERGENCY': return 'error';
      case 'HIGH': return 'warning';
      case 'NORMAL': return 'info';
      case 'LOW': return 'default';
      default: return 'info';
    }
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency?.toUpperCase()) {
      case 'EMERGENCY': 
        return {
          border: `3px solid #f44336`,
          boxShadow: `0 8px 30px rgba(244, 67, 54, 0.4)`,
          background: `
            linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)
          `,
          animation: `${emergencyPulse} 2s infinite`
        };
      case 'HIGH': 
        return {
          border: `3px solid #ff9800`,
          boxShadow: `0 8px 25px rgba(255, 152, 0, 0.3)`,
          background: `
            linear-gradient(135deg, rgba(255, 248, 225, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)
          `
        };
      default: 
        return {
          border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
          background: 'rgba(255, 255, 255, 0.95)'
        };
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toUpperCase()) {
      case 'EMERGENCY': return <EmergencyIcon />;
      case 'HIGH': return <WarningIcon />;
      default: return <LocationIcon />;
    }
  };

  const getAssignmentTypeIcon = (type) => {
    switch (type) {
      case 'MEDICAL': return <MedicalIcon />;
      case 'TRANSPORT': return <TransportIcon />;
      case 'BACKUP': return <SupportIcon />;
      default: return <EmergencyIcon />;
    }
  };

  const handleSendTeamMessage = (assignment) => {
    setSelectedAssignmentForMessage(assignment);
    setMessageDialogOpen(true);
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
    setSelectedAssignmentForMessage(null);
  };

  const renderRescueCard = (rescue) => (
    <Grid item xs={12} md={6} lg={4} key={rescue.id}>
      <Fade in timeout={800} style={{ transitionDelay: `${rescue.id * 100}ms` }}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 5,
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          ...getUrgencyStyle(rescue.urgency),
          '&:hover': {
            transform: 'translateY(-12px) scale(1.02)',
            boxShadow: rescue.urgency === 'EMERGENCY' ? 
              `0 25px 50px rgba(244, 67, 54, 0.4)` :
              `0 25px 50px ${alpha(customTheme.primary, 0.2)}`,
            '& .rescue-action-btn': {
              transform: 'translateY(-3px)'
            }
          },
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
          <CardContent sx={{ flex: 1, p: 4, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h3" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 800,
                color: customTheme.primary,
                letterSpacing: '-0.01em'
              }}>
                {getUrgencyIcon(rescue.urgency)}
                <Box sx={{ ml: 1 }}>{rescue.animal_type}</Box>
              </Typography>
              <Chip 
                label={rescue.urgency || 'NORMAL'} 
                color={getUrgencyColor(rescue.urgency)}
                size="small"
                sx={{ 
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  height: 32,
                  backdropFilter: 'blur(10px)',
                  ...(rescue.urgency === 'EMERGENCY' && { 
                    animation: `${pulse} 2s infinite`,
                    background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
                    color: '#ffffff'
                  })
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 1, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500,
                color: alpha(customTheme.primary, 0.8)
              }}>
                <LocationIcon fontSize="small" sx={{ mr: 1, color: customTheme.accent }} />
                {renderLocation(rescue.location)}
                {rescue.location_details && ` - ${rescue.location_details}`}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 1, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500,
                color: alpha(customTheme.primary, 0.8)
              }}>
                <TimerIcon fontSize="small" sx={{ mr: 1, color: customTheme.secondary }} />
                Reported {rescue.time_since_reported || formatTimeAgo(rescue.created_at)}
              </Typography>
              
              {rescue.distance_km && (
                <Typography variant="body1" color="text.secondary" sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 500,
                  color: alpha(customTheme.primary, 0.8)
                }}>
                  <CarIcon fontSize="small" sx={{ mr: 1, color: customTheme.primary }} />
                  ~{rescue.distance_km}km away
                </Typography>
              )}
            </Box>
            
            <Paper
              elevation={0}
              sx={{
                p: 2,
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
                {rescue.description}
              </Typography>
            </Paper>
            
            {rescue.animal_condition && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600, 
                  color: customTheme.primary,
                  mb: 1
                }}>
                  Animal Condition:
                </Typography>
                <Chip 
                  label={rescue.animal_condition}
                  size="small"
                  sx={{
                    backgroundColor: rescue.animal_condition.includes('Injured') ? alpha('#f44336', 0.1) :
                                   rescue.animal_condition.includes('Aggressive') ? alpha('#ff9800', 0.1) : 
                                   alpha(customTheme.success, 0.1),
                    color: rescue.animal_condition.includes('Injured') ? '#f44336' :
                           rescue.animal_condition.includes('Aggressive') ? '#ff9800' : 
                           customTheme.success,
                    border: `1px solid ${rescue.animal_condition.includes('Injured') ? '#f44336' :
                                        rescue.animal_condition.includes('Aggressive') ? '#ff9800' : 
                                        customTheme.success}`,
                    fontWeight: 600
                  }}
                />
              </Box>
            )}

            {rescue.training_requirements && rescue.training_requirements.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600, 
                  color: customTheme.primary,
                  mb: 2
                }}>
                  Training Requirements:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {rescue.training_requirements.map((training, index) => (
                    <Paper 
                      key={index}
                      elevation={0}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        p: 2, 
                        borderRadius: 3,
                        backgroundColor: training.required ? alpha('#ff9800', 0.1) : alpha('#2196f3', 0.1),
                        border: `2px solid ${training.required ? '#ff9800' : '#2196f3'}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(training.required ? '#ff9800' : '#2196f3', 0.2)}`
                        }
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 700, 
                          color: training.required ? '#ef6c00' : '#1565c0',
                          mb: 0.5
                        }}>
                          {training.required ? 'Required: ' : 'Recommended: '}{training.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {training.level} • {training.duration}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        color={training.required ? 'warning' : 'primary'}
                        onClick={() => {
                          window.open(`/interactive-learning`, '_blank');
                        }}
                        sx={{ 
                          ml: 2, 
                          minWidth: 'auto',
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none'
                        }}
                      >
                        Start Training
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {rescue.skill_badges && rescue.skill_badges.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600, 
                  color: customTheme.primary,
                  mb: 2
                }}>
                  Qualifications:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {rescue.skill_badges.map((badge, index) => (
                    <Chip
                      key={index}
                      label={badge.text}
                      size="small"
                      icon={
                        badge.type === 'training_completed' ? <CheckIcon fontSize="small" /> :
                        badge.type === 'training_required' ? <WarningIcon fontSize="small" /> :
                        badge.type === 'urgency' ? <EmergencyIcon fontSize="small" /> : null
                      }
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 
                        badge.color === 'green' ? alpha(customTheme.success, 0.15) :
                        badge.color === 'orange' ? alpha('#ff9800', 0.15) :
                        badge.color === 'blue' ? alpha('#2196f3', 0.15) :
                        badge.color === 'red' ? alpha('#f44336', 0.15) : alpha(customTheme.grey, 0.3),
                      color:
                        badge.color === 'green' ? customTheme.success :
                        badge.color === 'orange' ? '#ef6c00' :
                        badge.color === 'blue' ? '#1565c0' :
                        badge.color === 'red' ? '#c62828' : customTheme.primary,
                      border: `2px solid ${
                        badge.color === 'green' ? customTheme.success :
                        badge.color === 'orange' ? '#ff9800' :
                        badge.color === 'blue' ? '#2196f3' :
                        badge.color === 'red' ? '#f44336' : customTheme.primary
                      }`
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {rescue.qualification_message && (
            <Alert 
              severity={
              rescue.skill_match === 'perfect' ? 'success' :
              rescue.skill_match === 'good' ? 'info' :
              rescue.skill_match === 'caution' ? 'warning' : 'error'
            } 
            sx={{ 
              mt: 1, 
              mb: 2, 
              borderRadius: 3,
              fontWeight: 500,
              '& .MuiAlert-icon': {
                fontSize: '1.2rem'
              }
            }}
          >
            {rescue.qualification_message}
          </Alert>
        )}
        </CardContent>
        
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            className="rescue-action-btn"
            variant="contained"
            color={
              rescue.skill_match === 'not_recommended' ? 'error' :
              rescue.urgency === 'EMERGENCY' ? 'error' : 'primary'
            }
            onClick={() => {
              if (rescue.skill_match === 'not_recommended') {
                setError(`Training required: ${rescue.required_trainings?.map(t => 
                  rescue.training_requirements?.find(tr => tr.slug === t)?.name || t
                ).join(', ')}`);
                setTimeout(() => setError(''), 5000);
                return;
              }
              setSelectedItem(rescue);
              setAcceptDialogOpen(true);
            }}
            startIcon={rescue.skill_match === 'not_recommended' ? <WarningIcon /> : <EmergencyIcon />}
            fullWidth
            disabled={rescue.skill_match === 'not_recommended'}
            sx={{
              py: 2,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'none',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              ...(rescue.urgency === 'EMERGENCY' && rescue.skill_match !== 'not_recommended' && {
                background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 35px rgba(244, 67, 54, 0.4)`
                }
              }),
              ...(rescue.skill_match === 'not_recommended' && {
                backgroundColor: `${alpha('#f44336', 0.1)} !important`,
                color: '#c62828 !important',
                cursor: 'not-allowed',
                '&:hover': {
                  backgroundColor: `${alpha('#f44336', 0.1)} !important`,
                }
              }),
              ...(rescue.urgency !== 'EMERGENCY' && rescue.skill_match !== 'not_recommended' && {
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`
                }
              }),
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
              '&:hover:not(:disabled)::before': {
                left: '100%'
              }
            }}
          >
            {rescue.skill_match === 'not_recommended' ? 'COMPLETE TRAINING/PROFILE SETUP FIRST' :
             rescue.urgency === 'EMERGENCY' ? 'RESPOND NOW' : 'ACCEPT RESCUE'}
          </Button>
        </CardActions>
      </Card>
    </Fade>
  </Grid>
);

const renderOpportunityCard = (opportunity) => (
  <Grid item xs={12} md={6} lg={4} key={opportunity.id}>
    <Fade in timeout={800} style={{ transitionDelay: `${opportunity.id * 100}ms` }}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 5,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-12px) scale(1.02)',
          boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.2)}`,
          border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
          '& .opportunity-action-btn': {
            transform: 'translateY(-3px)'
          }
        },
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
        <CardContent sx={{ flex: 1, p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h3" sx={{
              fontWeight: 800,
              color: customTheme.primary,
              letterSpacing: '-0.01em'
            }}>
              {opportunity.title}
            </Typography>
            <Chip 
              label={opportunity.category} 
              sx={{
                backgroundColor: alpha(customTheme.secondary, 0.15),
                color: customTheme.secondary,
                fontWeight: 600,
                border: `1px solid ${alpha(customTheme.secondary, 0.3)}`
              }}
              size="small" 
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary" sx={{ 
              mb: 1, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 500,
              color: alpha(customTheme.primary, 0.8)
            }}>
              <LocationIcon fontSize="small" sx={{ mr: 1, color: customTheme.accent }} />
              {opportunity.location}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ 
              mb: 1, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 500,
              color: alpha(customTheme.primary, 0.8)
            }}>
              <TimerIcon fontSize="small" sx={{ mr: 1, color: customTheme.secondary }} />
              {formatDateTime(opportunity.start_time)}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ 
              mb: 1, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 500,
              color: alpha(customTheme.primary, 0.8)
            }}>
              <PeopleIcon fontSize="small" sx={{ mr: 1, color: customTheme.primary }} />
              Volunteers: {opportunity.assigned_count || 0} / {opportunity.max_volunteers}
            </Typography>
          </Box>
          
          <Paper
            elevation={0}
            sx={{
              p: 2,
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
              {opportunity.description}
            </Typography>
          </Paper>
          
          {opportunity.skills_required && opportunity.skills_required.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                color: customTheme.primary,
                mb: 1
              }}>
                Skills needed:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {opportunity.skills_required.map((skill, index) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    size="small" 
                    sx={{
                      backgroundColor: alpha(customTheme.accent, 0.15),
                      color: customTheme.accent,
                      fontWeight: 600,
                      border: `1px solid ${alpha(customTheme.accent, 0.3)}`
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            className="opportunity-action-btn"
            variant="contained"
            onClick={() => {
              setSelectedItem(opportunity);
              setAcceptDialogOpen(true);
            }}
            startIcon={<CheckIcon />}
            fullWidth
            sx={{
              py: 2,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'none',
              background: `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                transform: 'translateY(-3px)',
                boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.4)}`
              },
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
              '&:hover::before': {
                left: '100%'
              }
            }}
          >
            SIGN UP
          </Button>
        </CardActions>
      </Card>
    </Fade>
  </Grid>
);

const renderAssignmentCard = (assignment, isRescue = false) => {
  const canComplete = assignment.status === 'ACCEPTED' || assignment.status === 'IN_PROGRESS';
  const isCompleted = assignment.status === 'COMPLETED';

  return (
    <Grid item xs={12} md={6} lg={4} key={assignment.id}>
      <Fade in timeout={800} style={{ transitionDelay: `${assignment.id * 100}ms` }}>
        <Card sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 5,
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${isCompleted ? customTheme.success : alpha(customTheme.primary, 0.2)}`,
          background: isCompleted ? 
            `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, rgba(255, 255, 255, 0.95) 100%)` :
            'rgba(255, 255, 255, 0.95)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-12px) scale(1.02)',
            boxShadow: `0 25px 50px ${alpha(isCompleted ? customTheme.success : customTheme.primary, 0.2)}`,
            '& .assignment-action-btn': {
              transform: 'translateY(-3px)'
            }
          }
        }}>
          <CardContent sx={{ flex: 1, p: 4 }}>
            <Typography variant="h5" component="h3" sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 800,
              color: customTheme.primary,
              letterSpacing: '-0.01em',
              mb: 2
            }}>
              {isRescue ? 
                getAssignmentTypeIcon(assignment.assignment_type) : 
                <EventIcon sx={{ mr: 1 }} />
              }
              <Box sx={{ ml: 1 }}>
                {isRescue ? 
                 (assignment.report_details?.animal_type !== 'Unknown' 
                   ? assignment.report_details?.animal_type 
                   : extractAnimalTypeFromDescription(assignment.report_details?.description) || 'Animal Rescue'
                 ) : 
                 assignment.opportunity_details?.title
               }
              </Box>
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <Chip 
                label={assignment.status} 
                color={
                  assignment.status === 'COMPLETED' ? 'success' : 
                  assignment.status === 'ACCEPTED' ? 'primary' : 
                  assignment.status === 'IN_PROGRESS' ? 'warning' : 'default'
                } 
                sx={{ fontWeight: 600 }}
                size="small" 
              />
              {isCompleted && (
                <Chip 
                  label="Points Earned" 
                  sx={{
                    backgroundColor: alpha(customTheme.success, 0.15),
                    color: customTheme.success,
                    fontWeight: 600,
                    border: `1px solid ${alpha(customTheme.success, 0.3)}`
                  }}
                  size="small" 
                  icon={<CheckIcon />}
                />
              )}
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 1, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500,
                color: alpha(customTheme.primary, 0.8)
              }}>
                <LocationIcon fontSize="small" sx={{ mr: 1, color: customTheme.accent }} />
                {isRescue ? 
                  renderLocation(assignment.report_details?.location) : 
                  assignment.opportunity_details?.location
                }
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ 
                mb: 1, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500,
                color: alpha(customTheme.primary, 0.8)
              }}>
                <TimerIcon fontSize="small" sx={{ mr: 1, color: customTheme.secondary }} />
                {isRescue ? 
                  `Assigned ${assignment.time_since_assigned || 0}m ago` :
                  formatDateTime(assignment.opportunity_details?.start_time)
                }
              </Typography>
            </Box>
            
            {assignment.volunteer_notes && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.6)} 100%)`,
                  border: `1px solid ${alpha(customTheme.primary, 0.1)}`
                }}
              >
                <Typography variant="body2" sx={{ 
                  fontWeight: 600, 
                  color: customTheme.primary,
                  mb: 1
                }}>
                  Your notes:
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontStyle: 'italic' 
                }}>
                  {assignment.volunteer_notes}
                </Typography>
              </Paper>
            )}

            {assignment.completion_notes && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                  border: `1px solid ${alpha(customTheme.success, 0.3)}`
                }}
              >
                <Typography variant="body2" sx={{ 
                  fontWeight: 600, 
                  color: customTheme.success,
                  mb: 1
                }}>
                  Completion notes:
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: customTheme.primary
                }}>
                  {assignment.completion_notes}
                </Typography>
              </Paper>
            )}
            
            {assignment.hours_logged && (
              <Typography variant="body2" color="text.secondary" sx={{ 
                mb: 1,
                fontWeight: 500,
                color: alpha(customTheme.primary, 0.8)
              }}>
                Hours logged: {assignment.hours_logged}
              </Typography>
            )}
          </CardContent>

          <CardActions sx={{ p: 3, pt: 0 }}>
            {canComplete && (
              <>
                <Button
                  className="assignment-action-btn"
                  variant="contained"
                  color="success"
                  onClick={() => handleCompleteAssignment(assignment, isRescue)}
                  startIcon={<CompleteIcon />}
                  sx={{
                    flex: 1,
                    mr: 1,
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.4)}`
                    }
                  }}
                >
                  {isRescue ? 'Complete Rescue' : 'Complete Assignment'}
                </Button>
                
                {isRescue && (
                  <Button
                    variant="outlined"
                    onClick={() => handleSendTeamMessage(assignment)}
                    startIcon={<MessageIcon />}
                    sx={{ 
                      minWidth: 'auto',
                      py: 2,
                      borderRadius: 3,
                      borderColor: customTheme.primary,
                      borderWidth: 2,
                      color: customTheme.primary,
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: customTheme.primary,
                        borderWidth: 2,
                        backgroundColor: alpha(customTheme.primary, 0.08),
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    Message Team
                  </Button>
                )}
              </>
            )}
            
            {isCompleted && (
              <Button
                variant="outlined"
                startIcon={<CheckIcon />}
                fullWidth
                disabled
                sx={{
                  py: 2,
                  borderRadius: 3,
                  borderColor: customTheme.success,
                  color: customTheme.success,
                  fontWeight: 600,
                  backgroundColor: alpha(customTheme.success, 0.05)
                }}
              >
                Assignment Completed
              </Button>
            )}
            
            {!canComplete && !isCompleted && (
              <Button
                variant="outlined"
                fullWidth
                disabled
                sx={{
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600
                }}
              >
                {assignment.status || 'Pending'}
              </Button>
            )}
          </CardActions>
        </Card>
      </Fade>
    </Grid>
  );
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
        <PetsIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
        <FavoriteIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
          Loading Volunteer Hub
        </Typography>
        <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
          Preparing rescue missions and opportunities...
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
      <EmergencyIcon sx={{ fontSize: 25, color: customTheme.accent, transform: 'rotate(45deg)' }} />
    </Box>

    <Container maxWidth="xl" sx={{ pt: 4, position: 'relative', zIndex: 1 }}>
      {/* Hero Header */}
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
              <AssignmentIcon sx={{ fontSize: 40 }} />
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
            Volunteer Hub
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: alpha(customTheme.primary, 0.8),
              fontWeight: 400,
              lineHeight: 1.6,
              animation: `${slideInUp} 1s ease-out 0.3s both`
            }}
          >
            Emergency rescues, community events, and your volunteer activities - all in one place
          </Typography>
        </Box>
      </Fade>

      {error && (
        <Fade in timeout={800}>
          <Alert 
            severity={error.includes('Successfully') ? 'success' : 'error'} 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              fontSize: '1.1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: `2px solid ${error.includes('Successfully') ? customTheme.success : '#f44336'}`,
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
        </Fade>
      )}

      {/* Enhanced Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          mb: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                color: alpha(customTheme.primary, 0.7),
                py: 3,
                px: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: customTheme.primary,
                  backgroundColor: alpha(customTheme.primary, 0.05)
                },
                '&.Mui-selected': {
                  color: customTheme.primary,
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: 2,
                background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`
              }
            }}
          >
            <Tab 
              label={
                <Badge badgeContent={rescues.length} color="error">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmergencyIcon sx={{ mr: 1 }} />
                    Urgent Rescues
                  </Box>
                </Badge>
              } 
            />
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
                <Badge badgeContent={rescueAssignments.length + regularAssignments.length} color="success">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon sx={{ mr: 1 }} />
                    My Assignments
                  </Box>
                </Badge>
              } 
            />
          </Tabs>
        </Box>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ 
              color: customTheme.primary, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 700,
              mb: 1
            }}>
             <EmergencyIcon sx={{ mr: 2, color: '#f44336' }} />
             Emergency Animal Rescues
            </Typography>
            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
              Urgent rescue missions requiring immediate volunteer response
            </Typography>
          </Box>
  
          <Button
            variant="outlined"
            onClick={refreshVolunteerQualifications}
            startIcon={<RefreshIcon />}
            sx={{
              borderColor: customTheme.primary,
              borderWidth: 2,
              color: customTheme.primary,
              fontWeight: 600,
              borderRadius: 3,
              px: 3,
              py: 1.5,
              '&:hover': {
                borderColor: customTheme.primary,
                borderWidth: 2,
                backgroundColor: alpha(customTheme.primary, 0.08),
                transform: 'translateY(-2px)'
              }
            }}
          >
            Refresh Qualifications
          </Button>
        </Box>
        
        {rescues.length === 0 ? (
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
              <EmergencyIcon 
                sx={{ 
                  fontSize: 120, 
                  color: alpha(customTheme.primary, 0.3), 
                  mb: 3,
                  animation: `${float} 4s ease-in-out infinite`
                }} 
              />
              <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                No urgent rescues at the moment
              </Typography>
              <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                Thank you for being ready to help! Check back soon for new rescue missions.
              </Typography>
            </Paper>
          </Zoom>
        ) : (
          <Grid container spacing={4}>
            {rescues.map(renderRescueCard)}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            color: customTheme.primary, 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 700,
            mb: 1
          }}>
            <EventIcon sx={{ mr: 2, color: customTheme.success }} />
            Scheduled Volunteer Opportunities
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Community events, facility maintenance, and ongoing volunteer work. Plan ahead and make a difference!
          </Typography>
        </Box>
        
        {opportunities.length === 0 ? (
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
              <EventIcon 
                sx={{ 
                  fontSize: 120, 
                  color: alpha(customTheme.primary, 0.3), 
                  mb: 3,
                  animation: `${float} 4s ease-in-out infinite`
                }} 
              />
              <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                No upcoming opportunities
              </Typography>
              <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                Check back soon for new volunteer events and activities!
              </Typography>
            </Paper>
          </Zoom>
        ) : (
          <Grid container spacing={4}>
            {opportunities.map(renderOpportunityCard)}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            color: customTheme.primary,
            fontWeight: 700,
            mb: 1
          }}>
            My Active Assignments
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Track your progress and complete your volunteer commitments
          </Typography>
        </Box>
        
        {rescueAssignments.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mt: 4, mb: 3, color: '#f44336', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              <EmergencyIcon sx={{ mr: 2 }} />
              Rescue Assignments
            </Typography>
            <Grid container spacing={4}>
              {rescueAssignments.map(assignment => renderAssignmentCard(assignment, true))}
            </Grid>
          </>
        )}
        
        {regularAssignments.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mt: 4, mb: 3, color: customTheme.success, display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              <EventIcon sx={{ mr: 2 }} />
              Regular Volunteer Assignments
            </Typography>
            <Grid container spacing={4}>
              {regularAssignments.map(assignment => renderAssignmentCard(assignment, false))}
            </Grid>
          </>
        )}
        
        {rescueAssignments.length === 0 && regularAssignments.length === 0 && (
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
              <AssignmentIcon 
                sx={{ 
                  fontSize: 120, 
                  color: alpha(customTheme.primary, 0.3), 
                  mb: 3,
                  animation: `${float} 4s ease-in-out infinite`
                }} 
              />
              <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                No active assignments
              </Typography>
              <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                Check the other tabs to find volunteer opportunities!
              </Typography>
            </Paper>
          </Zoom>
        )}
      </TabPanel>

      {/* Enhanced Accept Assignment Dialog */}
      <Dialog 
        open={acceptDialogOpen} 
        onClose={() => setAcceptDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.08)} 0%, ${alpha(customTheme.accent, 0.08)} 100%)`,
          color: customTheme.primary,
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          {selectedItem?.type === 'rescue' ? 'Accept Rescue Mission' : 'Sign Up for Volunteer Opportunity'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedItem && (
            <>
              <Typography variant="h5" sx={{ 
                color: customTheme.primary,
                fontWeight: 700,
                mb: 2
              }}>
                {selectedItem.type === 'rescue' ? 
                  `${selectedItem.animal_type} Rescue` : 
                  selectedItem.title
                }
              </Typography>
              
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
                <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 500, lineHeight: 1.8 }}>
                  <strong>Location:</strong> {selectedItem.type === 'rescue' ? 
                    renderLocation(selectedItem.location) : 
                    selectedItem.location
                  }<br/>
                  {selectedItem.distance_km && (
                    <>
                      <strong>Distance:</strong> ~{selectedItem.distance_km}km away<br/>
                    </>
                  )}
                  {selectedItem.urgency && (
                    <>
                      <strong>Urgency:</strong> {selectedItem.urgency}<br/>
                    </>
                  )}
                  {selectedItem.start_time && (
                    <>
                      <strong>Date/Time:</strong> {formatDateTime(selectedItem.start_time)}<br/>
                    </>
                  )}
                </Typography>
              </Paper>
              
              {selectedItem.type === 'rescue' && (
                <FormControl 
                  fullWidth 
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.secondary,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary,
                      },
                    }
                  }}
                >
                  <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>Assignment Type</InputLabel>
                  <Select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value)}
                    label="Assignment Type"
                  >
                    <MenuItem value="PRIMARY">Primary Responder</MenuItem>
                    <MenuItem value="BACKUP">Backup Support</MenuItem>
                    <MenuItem value="TRANSPORT">Transportation</MenuItem>
                    <MenuItem value="MEDICAL">Medical Support</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes (required)"
                value={volunteerNotes}
                onChange={(e) => setVolunteerNotes(e.target.value)}
                placeholder="Any relevant information about your response..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: alpha(customTheme.primary, 0.3),
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: customTheme.secondary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: customTheme.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                  }
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button 
            onClick={() => setAcceptDialogOpen(false)}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              color: alpha(customTheme.primary, 0.7),
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAcceptRescue} 
            variant="contained" 
            disabled={accepting}
            color={selectedItem?.urgency === 'EMERGENCY' ? 'error' : 'primary'}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              ...(selectedItem?.urgency !== 'EMERGENCY' && {
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                }
              })
            }}
          >
            {accepting ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : null}
            {accepting ? 'Confirming...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Assignment Completion Dialog */}
      <Dialog 
        open={completeDialogOpen} 
        onClose={() => setCompleteDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.08)} 0%, ${alpha(customTheme.secondary, 0.08)} 100%)`,
          color: customTheme.primary,
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          {selectedAssignment?.isRescue ? 'Complete Rescue Mission' : 'Complete Assignment'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedAssignment && (
            <>
              <Typography variant="h5" sx={{ 
                color: customTheme.primary,
                fontWeight: 700,
                mb: 2
              }}>
                {selectedAssignment.isRescue ? 
                  (selectedAssignment.report_details?.animal_type !== 'Unknown' 
                    ? selectedAssignment.report_details?.animal_type 
                    : extractAnimalTypeFromDescription(selectedAssignment.report_details?.description) || 'Animal Rescue'
                    ) : 
                    (selectedAssignment.opportunity_details?.title || selectedAssignment.title)
                }
              </Typography>
              
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.6)} 100%)`,
                  border: `1px solid ${alpha(customTheme.primary, 0.1)}`
                }}
              >
                <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 500 }}>
                  Assignment ID: {selectedAssignment.id} • 
                  Started: {formatTimeAgo(selectedAssignment.assigned_at || selectedAssignment.created_at)}
                </Typography>
              </Paper>

              {selectedAssignment.isRescue && (
                <Box sx={{ mb: 4 }}>
                  <FormLabel component="legend" sx={{ 
                    mb: 2,
                    color: customTheme.primary,
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    Rescue Outcome *
                  </FormLabel>
                  <RadioGroup
                    value={completionOutcome}
                    onChange={(e) => setCompletionOutcome(e.target.value)}
                    sx={{
                      '& .MuiFormControlLabel-root': {
                        mb: 1,
                        '& .MuiFormControlLabel-label': {
                          fontWeight: 500,
                          color: customTheme.primary
                        }
                      }
                    }}
                  >
                    <FormControlLabel 
                      value="SUCCESS" 
                      control={<Radio sx={{ color: customTheme.success }} />} 
                      label="Successful Rescue" 
                    />
                    <FormControlLabel 
                      value="REFERRED" 
                      control={<Radio sx={{ color: customTheme.accent }} />} 
                      label="Referred to Veterinarian" 
                    />
                    <FormControlLabel 
                      value="ANIMAL_GONE" 
                      control={<Radio sx={{ color: alpha(customTheme.primary, 0.7) }} />} 
                      label="Animal Not Found" 
                    />
                    <FormControlLabel 
                      value="UNABLE_TO_CAPTURE" 
                      control={<Radio sx={{ color: '#ff9800' }} />} 
                      label="Unable to Capture" 
                    />
                  </RadioGroup>
                </Box>
              )}
              
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Completion Notes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder={selectedAssignment.isRescue ? 
                  "Describe the rescue outcome, animal condition, any challenges faced, next steps needed..." :
                  "Describe what was accomplished, any issues encountered, recommendations..."
                }
                required
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: alpha(customTheme.primary, 0.3),
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: customTheme.secondary,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: customTheme.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                  }
                }}
              />

              {selectedAssignment.isRescue && (
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
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    <strong>Tip:</strong> Include details about animal condition, behavior, 
                    location where found, any medical concerns, and if follow-up care is needed.
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Button 
            onClick={() => setCompleteDialogOpen(false)}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              color: alpha(customTheme.primary, 0.7),
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitCompletion}
            variant="contained"
            color="success"
            disabled={completing || !completionNotes.trim()}
            startIcon={completing ? <CircularProgress size={20} /> : <CompleteIcon />}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              background: `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
              '&:hover:not(:disabled)': {
                background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
              }
            }}
          >
            {completing ? 'Completing...' : 'Complete Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 600,
            backgroundColor: alpha(customTheme.success, 0.1),
            border: `2px solid ${customTheme.success}`,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            }
          }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {/* Team Message Dialog */}
      <TeamMessageDialog
        open={messageDialogOpen}
        onClose={handleCloseMessageDialog}
        assignment={selectedAssignmentForMessage}
      />

    </Container>
  </Box>
);
}

export default VolunteerHub;