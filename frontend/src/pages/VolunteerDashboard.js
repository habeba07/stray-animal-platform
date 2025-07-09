// Create: frontend/src/pages/VolunteerDashboard.js - Main landing page for volunteers

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  CircularProgress,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Emergency as EmergencyIcon,
  School as TrainingIcon,
  Assignment as AssignmentIcon,
  TrendingUp as StatsIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Timer as TimerIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  EmojiEvents as AchievementIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Speed as SpeedIcon,
  Group as TeamIcon,
  Pets as AnimalIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../redux/api';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [emergencyRescues, setEmergencyRescues] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [trainingProgress, setTrainingProgress] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  
  // UI states
  const [selectedRescue, setSelectedRescue] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user?.user_type !== 'VOLUNTEER') {
      navigate('/');
      return;
    }
    
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds for emergency updates
    const interval = setInterval(() => {
      fetchEmergencyRescues();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEmergencyRescues(),
        fetchMyAssignments(),
        fetchTrainingProgress(),
        fetchRecentActivity(),
        fetchUserStats(),
        fetchVolunteerProfile()
      ]);
      
      // Show welcome dialog for new users
      checkWelcomeStatus();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencyRescues = async () => {
    try {
      const response = await api.get('/volunteers/rescue-assignments/available_rescues/');
      // Filter for high priority rescues for dashboard
      const emergencyOnly = (response.data || []).filter(rescue => 
        rescue.urgency === 'EMERGENCY' || rescue.urgency === 'HIGH'
      );
      setEmergencyRescues(emergencyOnly.slice(0, 3)); // Show top 3
    } catch (error) {
      console.error('Error fetching emergency rescues:', error);
    }
  };

  const fetchMyAssignments = async () => {
    try {
      const response = await api.get('/volunteers/rescue-assignments/my_rescue_assignments/');
      setMyAssignments(response.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchTrainingProgress = async () => {
    try {
      const response = await api.get('/volunteers/learning-progress/my_progress/');
      setTrainingProgress(response.data?.slice(0, 4) || []);
    } catch (error) {
      console.error('Error fetching training progress:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/community/activities/', {
        params: { limit: 10, user: user.id }
      });
      setRecentActivity(response.data?.results?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/volunteers/rescue-assignments/activity_dashboard/');
      setUserStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchVolunteerProfile = async () => {
    try {
      const response = await api.get('/volunteer-profiles/my_profile/');
      setVolunteerProfile(response.data);
    } catch (error) {
      console.error('Error fetching volunteer profile:', error);
    }
  };

  const checkWelcomeStatus = () => {
    // Show welcome if user is new (no rescues completed and no training progress)
    const isNewUser = (!userStats?.user_profile?.total_rescues_completed || userStats.user_profile.total_rescues_completed === 0) &&
                      (!trainingProgress?.length || trainingProgress.length === 0);
    
    if (isNewUser && !localStorage.getItem('volunteer_welcome_shown')) {
      setShowWelcome(true);
      localStorage.setItem('volunteer_welcome_shown', 'true');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleAcceptRescue = async (rescue) => {
    try {
      await api.post('/volunteers/rescue-assignments/accept_rescue/', {
        report_id: rescue.id,
        assignment_type: 'PRIMARY',
        volunteer_notes: 'Accepting emergency rescue from dashboard'
      });
      
      // Refresh data
      await fetchDashboardData();
      setSelectedRescue(null);
      
      // Navigate to volunteer hub
      navigate('/volunteer/hub');
    } catch (error) {
      console.error('Error accepting rescue:', error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toUpperCase()) {
      case 'EMERGENCY': return '#f44336';
      case 'HIGH': return '#ff9800';
      default: return '#2196f3';
    }
  };

  const formatTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const calculateTrainingCompletion = () => {
    if (!trainingProgress.length) return 0;
    const completed = trainingProgress.filter(p => p.status === 'COMPLETED' || p.status === 'PASSED').length;
    return Math.round((completed / trainingProgress.length) * 100);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            🚑 Emergency Rescue Operations
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome back, {user?.username}! Ready to save lives today?
          </Typography>
        </Box>
        
        <Fab
          color="primary"
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ position: 'relative' }}
        >
          {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
        </Fab>
      </Box>

      {/* Quick Stats Row */}
      {userStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {userStats.total_points || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Points
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                  {userStats.user_profile?.total_rescues_completed || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lives Saved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                  {userStats.user_profile?.average_response_time_minutes ? 
                    `${Math.round(userStats.user_profile.average_response_time_minutes)}m` : 'N/A'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Response
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', bgcolor: '#fce4ec' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e91e63' }}>
                  {userStats.leaderboard_position?.rescue_rank || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rescue Rank
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Emergency Rescues - Priority Column */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3, border: '2px solid #f44336', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmergencyIcon sx={{ color: '#f44336', mr: 1, fontSize: 30 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                  🚨 URGENT RESCUES NEEDED
                </Typography>
                <Badge 
                  badgeContent={emergencyRescues.length} 
                  color="error" 
                  sx={{ ml: 2 }}
                />
              </Box>
              
              {emergencyRescues.length === 0 ? (
                <Alert severity="success">
                  No emergency rescues at the moment. Great job, team! 🎉
                </Alert>
              ) : (
                <Box>
                  {emergencyRescues.map((rescue) => (
                    <Card 
                      key={rescue.id}
                      sx={{ 
                        mb: 2, 
                        border: `2px solid ${getUrgencyColor(rescue.urgency)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 20px ${getUrgencyColor(rescue.urgency)}33`
                        }
                      }}
                      onClick={() => setSelectedRescue(rescue)}
                    >
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {rescue.animal_type}
                          </Typography>
                          <Chip 
                            label={rescue.urgency} 
                            sx={{ 
                              bgcolor: getUrgencyColor(rescue.urgency),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📍 {rescue.location_details || 'Location provided'}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {rescue.description?.substring(0, 100)}...
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          ⏰ Reported {rescue.time_since_reported}
                        </Typography>
                      </CardContent>
                      
                      <CardActions>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<EmergencyIcon />}
                          fullWidth
                          sx={{ fontWeight: 'bold' }}
                        >
                          {rescue.urgency === 'EMERGENCY' ? 'RESPOND NOW' : 'ACCEPT RESCUE'}
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/volunteer/hub')}
                    sx={{ mt: 2 }}
                  >
                    View All Available Rescues
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* My Active Assignments */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                📋 My Active Assignments
              </Typography>
              
              {myAssignments.length === 0 ? (
                <Alert severity="info">
                  No active assignments. Check available rescues above!
                </Alert>
              ) : (
                <List>
                  {myAssignments.map((assignment) => (
                    <ListItem key={assignment.id} sx={{ bgcolor: 'background.default', borderRadius: 1, mb: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#4caf50' }}>
                          <AnimalIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${assignment.report_details?.animal_type || 'Animal'} Rescue`}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Status: {assignment.status} • {formatTimeAgo(assignment.assigned_at)}
                            </Typography>
                            {assignment.estimated_arrival && (
                              <Typography variant="caption">
                                ETA: {format(new Date(assignment.estimated_arrival), 'MMM d, h:mm a')}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Chip 
                        label={assignment.status} 
                        color={assignment.status === 'COMPLETED' ? 'success' : 'primary'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Training & Activity */}
        <Grid item xs={12} lg={4}>
          {/* Training Progress */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrainingIcon sx={{ mr: 1 }} />
                🎓 Training Progress
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overall Completion</Typography>
                  <Typography variant="body2">{calculateTrainingCompletion()}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateTrainingCompletion()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              {trainingProgress.length === 0 ? (
                <Alert severity="warning" action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => navigate('/interactive-learning')}
                  >
                    Start Training
                  </Button>
                }>
                  Complete training to qualify for rescue assignments!
                </Alert>
              ) : (
                <List dense>
                  {trainingProgress.slice(0, 3).map((progress) => (
                    <ListItem key={progress.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: progress.status === 'COMPLETED' ? '#4caf50' : '#ff9800',
                          width: 32,
                          height: 32
                        }}>
                          {progress.status === 'COMPLETED' ? <CheckIcon /> : <PlayIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {progress.module_title}
                          </Typography>
                        }
                        secondary={`${progress.completion_percentage}% complete`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TrainingIcon />}
                onClick={() => navigate('/interactive-learning')}
                sx={{ mt: 2 }}
              >
                Continue Training
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <StatsIcon sx={{ mr: 1 }} />
                📈 Recent Activity
              </Typography>
              
              {recentActivity.length === 0 ? (
                <Alert severity="info">
                  No recent activity. Start your rescue journey!
                </Alert>
              ) : (
                <List dense>
                  {recentActivity.map((activity) => (
                    <ListItem key={activity.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                          <StarIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            {activity.description}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption">
                              +{activity.points_earned} points
                            </Typography>
                            <Typography variant="caption">
                              {formatTimeAgo(activity.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/activities')}
                sx={{ mt: 2 }}
              >
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions FAB */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
        <Fab
          color="error"
          size="large"
          onClick={() => navigate('/report-animal')}
          sx={{ 
            background: 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
            }
          }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Rescue Detail Dialog */}
      <Dialog
        open={Boolean(selectedRescue)}
        onClose={() => setSelectedRescue(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Emergency Rescue Details
          </Typography>
          <IconButton onClick={() => setSelectedRescue(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {selectedRescue && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmergencyIcon sx={{ color: getUrgencyColor(selectedRescue.urgency), mr: 1 }} />
                <Typography variant="h5">
                  {selectedRescue.animal_type}
                </Typography>
                <Chip 
                  label={selectedRescue.urgency}
                  sx={{ 
                    bgcolor: getUrgencyColor(selectedRescue.urgency),
                    color: 'white',
                    ml: 2,
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">
                    📍 {selectedRescue.location_details || 'Coordinates provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Reported
                  </Typography>
                  <Typography variant="body1">
                    ⏰ {selectedRescue.time_since_reported}
                  </Typography>
                </Grid>
                
                {selectedRescue.animal_condition && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Animal Condition
                    </Typography>
                    <Typography variant="body1">
                      🏥 {selectedRescue.animal_condition}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedRescue.description}
              </Typography>
              
              {selectedRescue.distance_km && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  📍 Approximately {selectedRescue.distance_km} km from your location
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSelectedRescue(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAcceptRescue(selectedRescue)}
            startIcon={<EmergencyIcon />}
            sx={{ fontWeight: 'bold' }}
          >
            Accept Rescue Assignment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onClose={() => setShowWelcome(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <EmergencyIcon sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
          <Typography variant="h4">
            Welcome to Rescue Operations!
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" paragraph>
            You're now part of our emergency animal rescue team! This dashboard is your mission control 
            for life-saving operations.
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Before accepting rescue assignments:
            </Typography>
            <ul>
              <li>Complete mandatory training modules</li>
              <li>Set up your enhanced volunteer profile</li>
              <li>Ensure GPS tracking consent is enabled</li>
            </ul>
          </Alert>
          
          <Typography variant="body1">
            Emergency rescues appear in real-time. Be ready to save lives! 🚑
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowWelcome(false)}>
            I'm Ready!
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              setShowWelcome(false);
              navigate('/interactive-learning');
            }}
            startIcon={<TrainingIcon />}
          >
            Start Training Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VolunteerDashboard;