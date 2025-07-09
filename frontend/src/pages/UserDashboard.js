import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Stars as StarIcon,
  Timeline as ActivityIcon,
  Redeem as RedeemIcon,
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
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [pointsSummary, setPointsSummary] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
        return '👤';
      case 'ADOPTION_APPLICATION':
        return '🐕';
      case 'REPORT_ANIMAL':
        return '📋';
      case 'FIRST_REPORT':
        return '🌟';
      default:
        return '⭐';
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
                          fontSize: '1.5rem', 
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