// Complete Enhanced VolunteerHub.js - Replace your entire file with this version

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
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../redux/api';

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

  useEffect(() => {
    fetchAllData();
    // Set up real-time updates every 30 seconds for emergency rescues
    const interval = setInterval(fetchRescues, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 FIXED: Proper API calls to fetch rescue data
  const fetchAllData = async () => {
    setLoading(true);
    try {
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

  // 🔥 FIXED: Fetch real emergency rescues from reports
  const fetchRescues = async () => {
    try {
      // Call the available_rescues endpoint from your volunteer API
      const response = await api.get('/volunteers/rescue-assignments/available_rescues/');
      setRescues(response.data || []);
    } catch (err) {
      console.error('Error fetching rescue assignments:', err);
      // Fallback: try to get urgent reports directly if volunteer endpoint fails
      try {
        const reportsResponse = await api.get('/reports/', {
          params: {
            status__in: 'PENDING,INVESTIGATING,ASSIGNED',
            urgency_level__in: 'HIGH,EMERGENCY',
            limit: 20
          }
        });
        
        // Transform reports into rescue format
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
          distance_km: null, // Will be calculated if user location available
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
      // Fetch rescue assignments
      const rescueResponse = await api.get('/volunteers/rescue-assignments/my_rescue_assignments/');
      setRescueAssignments(rescueResponse.data || []);
      
      // Fetch regular volunteer assignments  
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
        console.log('🔄 Refreshing volunteer qualifications...');
      
        const response = await api.post('/volunteers/rescue-assignments/refresh_qualifications/');
      
        if (response.data.success) {
          console.log('✅ Qualifications refreshed:', response.data);
          setQualificationRefreshTime(new Date());
        
          // Refresh all rescue data to get updated qualifications
          await fetchRescues(); 
        
          // Show success message
          setError(`✅ ${response.data.message}`);
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

  // Helper function to calculate time since report
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

  // FIXED: handleAcceptRescue function in VolunteerHub.js

  const handleAcceptRescue = async () => {
    if (!selectedItem) return;
  
    setAccepting(true);
    try {
      if (selectedItem.type === 'rescue') {
        // 🔥 FIXED: Use correct API endpoint
        const assignmentData = {
          report_id: selectedItem.id,
          assignment_type: assignmentType,
          volunteer_notes: volunteerNotes
        };
      
        // Use the correct rescue assignment endpoint
        await api.post('/rescue-assignments/accept_rescue/', assignmentData);
      
        setError('');
        // Show success message
        setError('✅ Successfully accepted rescue assignment! Check "My Assignments" tab for details.');
        setTimeout(() => setError(''), 5000);
      
      } else {
        // Handle regular opportunity signup
        await api.post(`/volunteer-opportunities/${selectedItem.id}/volunteer/`, {
          notes: volunteerNotes
        });
      }
    
      // Refresh data
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

  // Handle assignment completion
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
        // Complete rescue assignment
        await api.post(`/volunteers/rescue-assignments/${selectedAssignment.id}/complete_rescue/`, {
          completion_notes: completionNotes,
          rescue_outcome: completionOutcome
        });
        setSnackbarMessage('🎉 Rescue completed successfully! Points awarded.');
      } else {
        // Complete regular volunteer assignment
        await api.patch(`/volunteers/assignments/${selectedAssignment.id}/`, {
          status: 'COMPLETED',
          completion_notes: completionNotes,
          completed_at: new Date().toISOString()
        });
        setSnackbarMessage('✅ Assignment completed successfully!');
      }

      // Refresh assignments data
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
          border: '2px solid #f44336',
          boxShadow: '0 4px 20px rgba(244, 67, 54, 0.3)',
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)'
        };
      case 'HIGH': 
        return {
          border: '2px solid #ff9800',
          boxShadow: '0 4px 15px rgba(255, 152, 0, 0.2)',
          background: 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)'
        };
      default: 
        return {};
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toUpperCase()) {
      case 'EMERGENCY': return <EmergencyIcon />;
      case 'HIGH': return <WarningIcon />;
      default: return <LocationIcon />;
    }
  };

  // 🔥 FIXED: Render rescue cards with real data and enhanced styling
  const renderRescueCard = (rescue) => (
    <Grid item xs={12} md={6} lg={4} key={rescue.id}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        ...getUrgencyStyle(rescue.urgency)
      }}>
        <CardContent sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center' }}>
              {getUrgencyIcon(rescue.urgency)}
              <Box sx={{ ml: 1 }}>{rescue.animal_type}</Box>
            </Typography>
            <Chip 
              label={rescue.urgency || 'NORMAL'} 
              color={getUrgencyColor(rescue.urgency)}
              size="small"
              sx={{ 
                fontWeight: 'bold',
                ...(rescue.urgency === 'EMERGENCY' && { 
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)' }
                  }
                })
              }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <LocationIcon fontSize="small" sx={{ mr: 1 }} />
            {renderLocation(rescue.location)}
            {rescue.location_details && ` - ${rescue.location_details}`}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <TimerIcon fontSize="small" sx={{ mr: 1 }} />
            Reported {rescue.time_since_reported || formatTimeAgo(rescue.created_at)}
          </Typography>
          
          {rescue.distance_km && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <CarIcon fontSize="small" sx={{ mr: 1 }} />
              ~{rescue.distance_km}km away
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            {rescue.description}
          </Typography>
          
          {rescue.animal_condition && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Condition:</strong> 
              </Typography>
              <Chip 
                label={rescue.animal_condition}
                size="small"
                color={rescue.animal_condition.includes('Injured') ? 'error' : 
                       rescue.animal_condition.includes('Aggressive') ? 'warning' : 'default'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          )}

          {rescue.training_requirements && rescue.training_requirements.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Training Requirements:</strong>
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {rescue.training_requirements.map((training, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1, 
                    borderRadius: 1,
                    backgroundColor: training.required ? '#fff3e0' : '#e3f2fd',
                    border: `1px solid ${training.required ? '#ff9800' : '#2196f3'}`
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: training.required ? '#ef6c00' : '#1565c0' }}>
                      {training.required ? '⚠️ Required:' : '💡 Recommended:'} {training.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {training.level} • {training.duration}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    color={training.required ? 'warning' : 'primary'}
                    onClick={() => {
                      window.open(`/interactive-learning`, '_blank');
                    }}
                    sx={{ ml: 1, fontSize: '0.7rem' }}
                  >
                    Start Training
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {rescue.skill_badges && rescue.skill_badges.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Qualifications:</strong>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                    fontSize: '0.7rem',
                    backgroundColor: 
                    badge.color === 'green' ? '#e8f5e8' :
                    badge.color === 'orange' ? '#fff3e0' :
                    badge.color === 'blue' ? '#e3f2fd' :
                    badge.color === 'red' ? '#ffebee' : '#f5f5f5',
                  color:
                    badge.color === 'green' ? '#2e7d32' :
                    badge.color === 'orange' ? '#ef6c00' :
                    badge.color === 'blue' ? '#1565c0' :
                    badge.color === 'red' ? '#c62828' : '#666',
                  border: `1px solid ${
                    badge.color === 'green' ? '#4caf50' :
                    badge.color === 'orange' ? '#ff9800' :
                    badge.color === 'blue' ? '#2196f3' :
                    badge.color === 'red' ? '#f44336' : '#ccc'
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
        sx={{ mt: 1, mb: 1, fontSize: '0.8rem' }}
      >
        {rescue.qualification_message}
      </Alert>
    )}


        </CardContent>
        
        <CardActions>
          <Button
            variant="contained"

            color={
              rescue.skill_match === 'not_recommended' ? 'error' :
              rescue.urgency === 'EMERGENCY' ? 'error' : 'primary'
            }
            onClick={() => {
              // 🔧 CRITICAL: Block action if not qualified
              if (rescue.skill_match === 'not_recommended') {
                setError(`❌ Training required: ${rescue.required_trainings?.map(t => 
                  rescue.training_requirements?.find(tr => tr.slug === t)?.name || t
                ).join(', ')}`);
                setTimeout(() => setError(''), 5000);
                return; // ← This prevents the dialog from opening
              }
              setSelectedItem(rescue);
              setAcceptDialogOpen(true);
            }}
            startIcon={rescue.skill_match === 'not_recommended' ? <WarningIcon /> : <EmergencyIcon />}
            fullWidth
            disabled={rescue.skill_match === 'not_recommended'} // ← This line is CRITICAL
            sx={{
              ...(rescue.urgency === 'EMERGENCY' && rescue.skill_match !== 'not_recommended' && {
                background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                }
              }),
              ...(rescue.skill_match === 'not_recommended' && {
                backgroundColor: '#ffcdd2 !important',
                color: '#c62828 !important',
                cursor: 'not-allowed',
                '&:hover': {
                  backgroundColor: '#ffcdd2 !important',
                }
              })
            }}
          >
            {rescue.skill_match === 'not_recommended' ? 'COMPLETE TRAINING FIRST' :
             rescue.urgency === 'EMERGENCY' ? 'RESPOND NOW' : 'ACCEPT RESCUE'}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderOpportunityCard = (opportunity) => (
    <Grid item xs={12} md={6} lg={4} key={opportunity.id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="h3">
              {opportunity.title}
            </Typography>
            <Chip label={opportunity.category} color="primary" size="small" />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <LocationIcon fontSize="small" sx={{ mr: 1 }} />
            {opportunity.location}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <TimerIcon fontSize="small" sx={{ mr: 1 }} />
            {formatDateTime(opportunity.start_time)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
            Volunteers: {opportunity.current_volunteers || 0} / {opportunity.max_volunteers}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            {opportunity.description}
          </Typography>
          
          {opportunity.skills_required && opportunity.skills_required.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Skills needed:
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {opportunity.skills_required.map((skill, index) => (
                  <Chip key={index} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
        
        <CardActions>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setSelectedItem(opportunity);
              setAcceptDialogOpen(true);
            }}
            startIcon={<CheckIcon />}
            fullWidth
          >
            SIGN UP
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  // ENHANCED: Assignment card with completion functionality
  const renderAssignmentCard = (assignment, isRescue = false) => {
    const canComplete = assignment.status === 'ACCEPTED' || assignment.status === 'IN_PROGRESS';
    const isCompleted = assignment.status === 'COMPLETED';

    return (
      <Grid item xs={12} md={6} lg={4} key={assignment.id}>
        <Card sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...(isCompleted && {
            border: '2px solid #4caf50',
            background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)'
          })
        }}>
          <CardContent sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center' }}>
              {isRescue ? <EmergencyIcon sx={{ mr: 1, color: '#f44336' }} /> : <EventIcon sx={{ mr: 1 }} />}
              {isRescue ? 
               (assignment.report_details?.animal_type !== 'Unknown' 
                 ? assignment.report_details?.animal_type 
                 : extractAnimalTypeFromDescription(assignment.report_details?.description) || 'Animal Rescue'
               ) : 
               assignment.opportunity_details?.title
             }
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip 
                label={assignment.status} 
                color={
                  assignment.status === 'COMPLETED' ? 'success' : 
                  assignment.status === 'ACCEPTED' ? 'primary' : 
                  assignment.status === 'IN_PROGRESS' ? 'warning' : 'default'
                } 
                size="small" 
                sx={{ mr: 1 }}
              />
              {isCompleted && (
                <Chip 
                  label="Points Earned" 
                  color="success" 
                  size="small" 
                  icon={<CheckIcon />}
                />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <LocationIcon fontSize="small" sx={{ mr: 1 }} />
              {isRescue ? 
                renderLocation(assignment.report_details?.location) : 
                assignment.opportunity_details?.location
              }
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <TimerIcon fontSize="small" sx={{ mr: 1 }} />
              {isRescue ? 
                `Assigned ${assignment.time_since_assigned || 0}m ago` :
                formatDateTime(assignment.opportunity_details?.start_time)
              }
            </Typography>
            
            {assignment.volunteer_notes && (
              <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                <strong>Your notes:</strong> {assignment.volunteer_notes}
              </Typography>
            )}

            {assignment.completion_notes && (
              <Typography variant="body2" sx={{ mb: 1, color: 'success.main' }}>
                <strong>Completion notes:</strong> {assignment.completion_notes}
              </Typography>
            )}
            
            {assignment.hours_logged && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Hours logged: {assignment.hours_logged}
              </Typography>
            )}
          </CardContent>

          {/* ENHANCED: CardActions for completion */}
          <CardActions sx={{ p: 2, pt: 0 }}>
            {canComplete && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleCompleteAssignment(assignment, isRescue)}
                startIcon={<CompleteIcon />}
                fullWidth
                sx={{
                  background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                  }
                }}
              >
                {isRescue ? 'Complete Rescue' : 'Complete Assignment'}
              </Button>
            )}
            
            {isCompleted && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<CheckIcon />}
                fullWidth
                disabled
              >
                Assignment Completed ✓
              </Button>
            )}
            
            {!canComplete && !isCompleted && (
              <Button
                variant="outlined"
                color="default"
                fullWidth
                disabled
              >
                {assignment.status || 'Pending'}
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon sx={{ mr: 2, fontSize: 40 }} />
        Volunteer Hub
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Emergency rescues, community events, and your volunteer activities - all in one place
      </Typography>

      {error && (
        <Alert severity={error.includes('✅') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
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

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#f44336', display: 'flex', alignItems: 'center' }}>
           <WarningIcon sx={{ mr: 1 }} />
           Emergency Animal Rescues
          </Typography>
  
          <Button
            variant="outlined"
            onClick={refreshVolunteerQualifications}
            startIcon={<RefreshIcon />}
            size="small"
            sx={{ minWidth: 'auto' }}
          >
            Refresh Qualifications
          </Button>
        </Box>
        
        {rescues.length === 0 ? (
          <Alert severity="info">
            No urgent rescues at the moment. Thank you for being ready to help!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {rescues.map(renderRescueCard)}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', display: 'flex', alignItems: 'center' }}>
          <EventIcon sx={{ mr: 1 }} />
          Scheduled Volunteer Opportunities
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Community events, facility maintenance, and ongoing volunteer work. Plan ahead and make a difference!
        </Typography>
        
        {opportunities.length === 0 ? (
          <Alert severity="info">
            No upcoming volunteer opportunities. Check back soon for new events!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {opportunities.map(renderOpportunityCard)}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          My Active Assignments
        </Typography>
        
        {rescueAssignments.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, color: '#f44336' }}>
              <EmergencyIcon sx={{ mr: 1 }} />
              Rescue Assignments
            </Typography>
            <Grid container spacing={3}>
              {rescueAssignments.map(assignment => renderAssignmentCard(assignment, true))}
            </Grid>
          </>
        )}
        
        {regularAssignments.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, color: '#4caf50' }}>
              <EventIcon sx={{ mr: 1 }} />
              Regular Volunteer Assignments
            </Typography>
            <Grid container spacing={3}>
              {regularAssignments.map(assignment => renderAssignmentCard(assignment, false))}
            </Grid>
          </>
        )}
        
        {rescueAssignments.length === 0 && regularAssignments.length === 0 && (
          <Alert severity="info">
            No active assignments. Check the other tabs to find volunteer opportunities!
          </Alert>
        )}
      </TabPanel>

      {/* Accept Assignment Dialog */}
      <Dialog open={acceptDialogOpen} onClose={() => setAcceptDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem?.type === 'rescue' ? 'Accept Rescue Mission' : 'Sign Up for Volunteer Opportunity'}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedItem.type === 'rescue' ? 
                  `${selectedItem.animal_type} Rescue` : 
                  selectedItem.title
                }
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
              
              {selectedItem.type === 'rescue' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Assignment Type</InputLabel>
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
                rows={3}
                label="Notes (optional)"
                value={volunteerNotes}
                onChange={(e) => setVolunteerNotes(e.target.value)}
                placeholder="Any relevant information about your response..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAcceptRescue} 
            variant="contained" 
            disabled={accepting}
            color={selectedItem?.urgency === 'EMERGENCY' ? 'error' : 'primary'}
          >
            {accepting ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Completion Dialog */}
      <Dialog 
        open={completeDialogOpen} 
        onClose={() => setCompleteDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedAssignment?.isRescue ? 'Complete Rescue Mission' : 'Complete Assignment'}
        </DialogTitle>
        <DialogContent>
          {selectedAssignment && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedAssignment.isRescue ? 
                  (selectedAssignment.report_details?.animal_type || 'Animal Rescue') : 
                  (selectedAssignment.opportunity_details?.title || selectedAssignment.title)
                }
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Assignment ID: {selectedAssignment.id} • 
                Started: {formatTimeAgo(selectedAssignment.assigned_at || selectedAssignment.created_at)}
              </Typography>

              {selectedAssignment.isRescue && (
                <Box sx={{ mb: 3 }}>
                  <FormLabel component="legend" sx={{ mb: 2 }}>
                    Rescue Outcome *
                  </FormLabel>
                  <RadioGroup
                    value={completionOutcome}
                    onChange={(e) => setCompletionOutcome(e.target.value)}
                    row
                  >
                    <FormControlLabel 
                      value="SUCCESS" 
                      control={<Radio />} 
                      label="✅ Successful Rescue" 
                    />
                    <FormControlLabel 
                      value="REFERRED" 
                      control={<Radio />} 
                      label="🏥 Referred to Veterinarian" 
                    />
                    <FormControlLabel 
                      value="ANIMAL_GONE" 
                      control={<Radio />} 
                      label="🔍 Animal Not Found" 
                    />
                    <FormControlLabel 
                      value="UNABLE_TO_CAPTURE" 
                      control={<Radio />} 
                      label="⚠️ Unable to Capture" 
                    />
                  </RadioGroup>
                </Box>
              )}
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Completion Notes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder={selectedAssignment.isRescue ? 
                  "Describe the rescue outcome, animal condition, any challenges faced, next steps needed..." :
                  "Describe what was accomplished, any issues encountered, recommendations..."
                }
                required
                sx={{ mb: 2 }}
              />

              {selectedAssignment.isRescue && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  💡 <strong>Tip:</strong> Include details about animal condition, behavior, 
                  location where found, any medical concerns, and if follow-up care is needed.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={submitCompletion}
            variant="contained"
            color="success"
            disabled={completing || !completionNotes.trim()}
            startIcon={completing ? <CircularProgress size={20} /> : <CompleteIcon />}
          >
            {completing ? 'Completing...' : 'Complete Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}

export default VolunteerHub;