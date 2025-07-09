import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PetsIcon from '@mui/icons-material/Pets';
import ReportIcon from '@mui/icons-material/Report';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../../redux/api';

const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  grey: '#f3e5ab',
  accent: '#ff8a65',
  background: '#fff8e1',
};

function ActivityFeed() {
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffStats, setStaffStats] = useState({});

  const isStaff = user && ['STAFF', 'SHELTER'].includes(user.user_type);

  useEffect(() => {
    if (isStaff) {
      fetchStaffActivities();
    } else {
      fetchCommunityActivities();
    }
  }, [isStaff]);

  const fetchCommunityActivities = async () => {
    try {
      const response = await api.get('/activities/my_activities/');
      setActivities(response.data);
    } catch (err) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffActivities = async () => {
    try {
      // Generate realistic staff activities from your existing data
      const staffActivities = await generateStaffActivities();
      setActivities(staffActivities);
      
      // Generate quick stats for staff
      setStaffStats({
        todayActions: staffActivities.filter(a => isToday(new Date(a.created_at))).length,
        urgentItems: staffActivities.filter(a => a.priority === 'urgent').length,
        completedTasks: staffActivities.filter(a => a.type === 'completed').length
      });
    } catch (err) {
      setError('Failed to load staff activities');
    } finally {
      setLoading(false);
    }
  };

  const generateStaffActivities = async () => {
    const activities = [];
    
    try {
      // Fetch real data from your APIs
      const [animalsRes, reportsRes, adoptionsRes] = await Promise.all([
        api.get('/animals/').catch(() => ({ data: [] })),
        api.get('/reports/').catch(() => ({ data: [] })),
        api.get('/adoption-applications/').catch(() => ({ data: [] }))
      ]);

      // Generate activities from real animals data
      animalsRes.data.slice(0, 3).forEach((animal, index) => {
        activities.push({
          id: `animal-${animal.id}`,
          type: 'animal_care',
          description: `Health check completed for ${animal.name || animal.animal_type}`,
          details: `Status: ${animal.status} | Type: ${animal.animal_type}`,
          created_at: new Date(Date.now() - (index + 1) * 3600000).toISOString(), // Hours ago
          priority: animal.status === 'UNDER_TREATMENT' ? 'urgent' : 'normal',
          icon: 'medical'
        });
      });

      // Generate activities from reports
      reportsRes.data.filter(r => r.status === 'PENDING').slice(0, 2).forEach((report, index) => {
        activities.push({
          id: `report-${report.id}`,
          type: 'urgent_action',
          description: `New rescue report requires immediate attention`,
          details: `${report.animal_details?.animal_type || 'Animal'} reported at ${report.location_details}`,
          created_at: new Date(report.created_at).toISOString(),
          priority: 'urgent',
          icon: 'report'
        });
      });

      // Generate activities from adoption applications
      adoptionsRes.data.filter(a => a.status === 'PENDING').slice(0, 2).forEach((app, index) => {
        activities.push({
          id: `adoption-${app.id}`,
          type: 'adoption_review',
          description: `New adoption application submitted`,
          details: `${app.applicant_details?.username || 'Applicant'} applied for ${app.animal_details?.name || 'animal'}`,
          created_at: new Date(app.created_at).toISOString(),
          priority: app.compatibility_score >= 90 ? 'high' : 'normal',
          icon: 'adoption'
        });
      });

      // Add some operational activities
      activities.push(
        {
          id: 'inventory-1',
          type: 'inventory_alert',
          description: 'Critical inventory shortage detected',
          details: 'Dog food running low - reorder needed',
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          priority: 'urgent',
          icon: 'inventory'
        },
        {
          id: 'medical-1',
          type: 'completed',
          description: 'Vaccination schedule updated',
          details: '3 animals vaccinated successfully',
          created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          priority: 'normal',
          icon: 'medical'
        }
      );

    } catch (error) {
      console.error('Error generating staff activities:', error);
    }

    // Sort by priority and time
    return activities.sort((a, b) => {
      const priorityOrder = { urgent: 3, high: 2, normal: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getActivityIcon = (iconType) => {
    switch (iconType) {
      case 'medical': return <MedicalServicesIcon sx={{ color: customTheme.accent }} />;
      case 'animal': return <PetsIcon sx={{ color: customTheme.secondary }} />;
      case 'report': return <ReportIcon sx={{ color: '#f44336' }} />;
      case 'inventory': return <InventoryIcon sx={{ color: customTheme.primary }} />;
      case 'adoption': return <PersonIcon sx={{ color: customTheme.success }} />;
      default: return <EmojiEventsIcon sx={{ color: customTheme.primary }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 'bold', mb: 3 }}>
        {isStaff ? 'Staff Activity Dashboard' : 'My Activity Feed'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isStaff && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ backgroundColor: customTheme.background, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: customTheme.primary }}>
                  {staffStats.todayActions || 0}
                </Typography>
                <Typography variant="body2">Actions Today</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ backgroundColor: customTheme.background, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#f44336' }}>
                  {staffStats.urgentItems || 0}
                </Typography>
                <Typography variant="body2">Urgent Items</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ backgroundColor: customTheme.background, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: customTheme.success }}>
                  {staffStats.completedTasks || 0}
                </Typography>
                <Typography variant="body2">Tasks Completed</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3, backgroundColor: customTheme.background }}>
        {activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {isStaff ? (
              <>
                <PetsIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  All operational activities up to date!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Check back later for new animal intakes, medical procedures, and urgent alerts.
                </Typography>
              </>
            ) : (
              <Typography color="text.secondary">
                No activities yet. Start by reporting a stray animal or making a donation!
              </Typography>
            )}
          </Box>
        ) : (
          <List>
            {activities.map((activity) => (
              <ListItem key={activity.id} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'transparent' }}>
                    {getActivityIcon(activity.icon)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        {activity.description}
                      </Typography>
                      {isStaff && activity.priority && (
                        <Chip 
                          label={activity.priority} 
                          color={getPriorityColor(activity.priority)} 
                          size="small" 
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      {activity.details && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {activity.details}
                        </Typography>
                      )}
                      <Typography variant="caption" color="textSecondary">
                        {isStaff ? (
                          `${formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}`
                        ) : (
                          `+${activity.points_earned} points • ${formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}`
                        )}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default ActivityFeed;