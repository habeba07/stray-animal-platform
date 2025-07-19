import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Divider,
  Button,
  LinearProgress,
  Alert,
  Paper,
  Fade,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Stars as StarIcon,
  Timeline as ActivityIcon,
  Redeem as RedeemIcon,
  Block as BlockIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  Assignment as AssignmentIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../redux/api';

const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  grey: '#f3e5ab',
  accent: '#ff8a65',
  background: '#fff8e1',
};

function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [pointsSummary, setPointsSummary] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restrict access for STAFF and SHELTER users
  useEffect(() => {
    if (user && ['STAFF', 'SHELTER'].includes(user.user_type)) {
      // Don't allow staff or shelter users to access the gamification dashboard
      return;
    }
  }, [user]);

  useEffect(() => {
    // Only fetch data if user is not STAFF or SHELTER
    if (!user || ['STAFF', 'SHELTER'].includes(user.user_type)) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch activities and points
        const [activitiesRes, pointsRes, rewardsRes] = await Promise.all([
          api.get('/activities/my_activities/'),
          api.get('/activities/my_points/'),
          api.get('/rewards/')
        ]);

        setActivities(activitiesRes.data);
        setPointsSummary(pointsRes.data);
        setRewards(rewardsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'PROFILE_CREATED':
        return <PersonIcon sx={{ fontSize: '1.2rem', color: customTheme.primary }} />;
      case 'ADOPTION_APPLICATION':
        return <PetsIcon sx={{ fontSize: '1.2rem', color: customTheme.secondary }} />;
      case 'REPORT_ANIMAL':
        return <AssignmentIcon sx={{ fontSize: '1.2rem', color: customTheme.accent }} />;
      case 'FIRST_REPORT':
        return <StarIcon sx={{ fontSize: '1.2rem', color: customTheme.success }} />;
      default:
        return <StarBorderIcon sx={{ fontSize: '1.2rem', color: customTheme.primary }} />;
    }
  };

  const getActivityDescription = (activityType) => {
    const descriptions = {
      'PROFILE_CREATED': 'Created adopter profile',
      'ADOPTION_APPLICATION': 'Applied for animal adoption',
      'REPORT_ANIMAL': 'Reported stray animal',
      'FIRST_REPORT': 'First animal report',
    };
    return descriptions[activityType] || activityType.replace('_', ' ');
  };

  // If user is STAFF or SHELTER, show access restriction message
  if (user && ['STAFF', 'SHELTER'].includes(user.user_type)) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in timeout={1000}>
          <Paper sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 6,
            background: `
              radial-gradient(circle at center, ${customTheme.grey} 0%, ${customTheme.background} 70%),
              linear-gradient(135deg, ${customTheme.grey} 0%, ${customTheme.background} 100%)
            `,
            border: `2px solid ${customTheme.primary}20`,
            boxShadow: `0 20px 40px ${customTheme.primary}15`
          }}>
            <Avatar
              sx={{
                bgcolor: customTheme.primary,
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 25px ${customTheme.primary}40`
              }}
            >
              <BlockIcon sx={{ fontSize: 50 }} />
            </Avatar>
            
            <Typography variant="h3" sx={{ 
              color: customTheme.primary, 
              fontWeight: 700, 
              mb: 2 
            }}>
              Staff Access Notice
            </Typography>
            
            <Typography variant="h6" sx={{ 
              color: customTheme.primary, 
              opacity: 0.8,
              mb: 4,
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.6
            }}>
              This dashboard is designed for community members and volunteers to track their engagement points and achievements. 
              As a shelter staff member, you have access to specialized operational dashboards.
            </Typography>

            <Alert 
              severity="info" 
              sx={{ 
                mb: 4,
                backgroundColor: customTheme.background,
                border: `2px solid ${customTheme.secondary}50`,
                borderRadius: 3,
                '& .MuiAlert-icon': {
                  color: customTheme.secondary
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Staff members can access operational tools through the main navigation menu.
              </Typography>
            </Alert>

            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                sx={{
                  background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                  color: '#ffffff',
                  fontWeight: 700,
                  py: 2,
                  px: 4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: `0 6px 20px ${customTheme.primary}40`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.primary} 90%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${customTheme.primary}50`
                  }
                }}
              >
                Go to Homepage
              </Button>
              
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderColor: customTheme.secondary,
                  color: customTheme.secondary,
                  fontWeight: 700,
                  py: 2,
                  px: 4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: customTheme.secondary,
                    backgroundColor: `${customTheme.secondary}10`,
                    borderWidth: 2,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Operational Dashboard
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    );
  }

  // If not logged in, show login prompt
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in timeout={1000}>
          <Paper sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 6,
            background: customTheme.background,
            border: `2px solid ${customTheme.primary}20`
          }}>
            <Typography variant="h4" sx={{ 
              color: customTheme.primary, 
              fontWeight: 700, 
              mb: 3 
            }}>
              Please Log In
            </Typography>
            <Typography variant="h6" sx={{ 
              color: customTheme.primary, 
              opacity: 0.8,
              mb: 4
            }}>
              You need to be logged in to view your dashboard
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                color: '#ffffff',
                fontWeight: 700,
                py: 2,
                px: 4,
                borderRadius: 3
              }}
            >
              Log In
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 1 }}>
          My Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: customTheme.primary, opacity: 0.8 }}>
          Track your points, activities, and achievements
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Points Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)` }}>
            <CardContent sx={{ textAlign: 'center', color: 'white' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                <StarIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {pointsSummary?.total_points || 0}
              </Typography>
              <Typography variant="h6">Total Points</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 'bold' }}>
                    {activities.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Activities</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" sx={{ color: customTheme.secondary, fontWeight: 'bold' }}>
                    {pointsSummary?.points_by_activity?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Types</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" sx={{ color: customTheme.accent, fontWeight: 'bold' }}>
                    0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Achievements</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h4" sx={{ color: customTheme.success, fontWeight: 'bold' }}>
                    {rewards.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Rewards</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ActivityIcon sx={{ color: customTheme.primary, mr: 2 }} />
                <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                  Recent Activities
                </Typography>
              </Box>
              
              {activities.length > 0 ? (
                <List>
                  {activities.slice(0, 5).map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem sx={{ px: 0 }}>
                        <Box sx={{ 
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          bgcolor: customTheme.background,
                          borderRadius: '50%'
                        }}>
                          {getActivityIcon(activity.activity_type)}
                        </Box>
                        <ListItemText
                          primary={getActivityDescription(activity.activity_type)}
                          secondary={formatDate(activity.created_at)}
                        />
                        <Chip 
                          label={`${activity.points_earned >= 0 ? '+' : ''}${activity.points_earned} pts`}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </ListItem>
                      {index < Math.min(activities.length, 5) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No activities yet. Start by creating a profile or applying for adoption!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Points Breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: customTheme.primary, mb: 3, fontWeight: 600 }}>
                Points by Activity
              </Typography>
              
              {pointsSummary?.points_by_activity?.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {getActivityDescription(item.activity_type)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.total} pts
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.total / pointsSummary.total_points) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: customTheme.grey,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: customTheme.secondary
                      }
                    }}
                  />
                </Box>
              )) || (
                <Typography variant="body2" color="textSecondary">
                  No point breakdown available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Available Rewards */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <RedeemIcon sx={{ color: customTheme.primary, mr: 2 }} />
                <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                  Available Rewards
                </Typography>
              </Box>
              
              {rewards.length > 0 ? (
                <Grid container spacing={2}>
                  {rewards.map((reward) => (
                    <Grid item xs={12} sm={6} md={4} key={reward.id}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 1 }}>{reward.name}</Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            {reward.description}
                          </Typography>
                          <Chip 
                            label={`${reward.points_required} points`}
                            color={pointsSummary?.total_points >= reward.points_required ? "success" : "default"}
                            sx={{ mb: 2 }}
                          />
                          <Button 
                            variant="contained"
                            fullWidth
                            disabled={pointsSummary?.total_points < reward.points_required}
                            sx={{ 
                              backgroundColor: customTheme.secondary,
                              '&:hover': { backgroundColor: customTheme.success }
                            }}
                          >
                            Redeem
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                    No rewards available yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Rewards will be added soon. Keep earning points!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default UserDashboard;