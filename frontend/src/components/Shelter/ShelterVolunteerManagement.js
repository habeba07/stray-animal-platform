// ShelterVolunteerManagement.js - Complete volunteer management system for SHELTER users

import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../redux/api';

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

      const assignmentsData = await fetch('/api/volunteer-assignments/')
        .then(r => r.json());
    
      const volunteersData = await fetch('/api/volunteer-profiles/')  // Add this
        .then(r => r.json());
      
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
      setAssignments(assignmentsData); 
      setVolunteers(volunteersData);
      setRescueAssignments(rescueAssignmentsResponse.data);

   


      // Calculate analytics
      calculateAnalytics(opportunitiesResponse.data, assignmentsData, volunteersData);
      
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
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <VolunteerIcon sx={{ mr: 2, fontSize: 40 }} />
            Volunteer Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage volunteer opportunities, assignments, and coordination
          </Typography>
        </Box>
        
        <Fab 
          color="primary" 
          aria-label="add opportunity"
          onClick={() => setCreateOpportunityOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">{analytics.totalVolunteers}</Typography>
              <Typography variant="body2" color="text.secondary">Active Volunteers</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4">{analytics.activeOpportunities}</Typography>
              <Typography variant="body2" color="text.secondary">Open Opportunities</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4">{analytics.pendingAssignments}</Typography>
              <Typography variant="body2" color="text.secondary">Pending Assignments</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4">{analytics.completedAssignments}</Typography>
              <Typography variant="body2" color="text.secondary">Completed This Month</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AnalyticsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4">{analytics.totalVolunteerHours}</Typography>
              <Typography variant="body2" color="text.secondary">Total Hours Logged</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmergencyIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4">{analytics.averageResponseTime}</Typography>
              <Typography variant="body2" color="text.secondary">Avg Response Time</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
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
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Volunteer Opportunities Management
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Date/Time</TableCell>
                <TableCell>Volunteers</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell>{opportunity.title}</TableCell>
                  <TableCell>
                    <Chip label={opportunity.category} size="small" />
                  </TableCell>
                  <TableCell>{formatDateTime(opportunity.start_time)}</TableCell>
                  <TableCell>{opportunity.assigned_count || 0} / {opportunity.max_volunteers}</TableCell>
                  <TableCell>
                    <Chip 
                      label={opportunity.status} 
                      color={opportunity.status === 'OPEN' ? 'success' : 'default'}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => {
                      setSelectedOpportunity(opportunity);
                      setEditOpportunityOpen(true);
                    }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteOpportunity(opportunity.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Volunteer Assignments
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Volunteer</TableCell>
                <TableCell>Opportunity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned Date</TableCell>
                <TableCell>Hours Logged</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.volunteer_details?.username || 'Unknown'}</TableCell>
                  <TableCell>{assignment.opportunity_details?.title || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.status} 
                      color={getStatusColor(assignment.status)}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(assignment.assigned_at)}</TableCell>
                  <TableCell>{assignment.hours_logged || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    {assignment.status === 'ASSIGNED' && (
                      <IconButton size="small" color="success">
                        <CheckIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Volunteer Directory
        </Typography>
        
        <Grid container spacing={3}>
          {volunteers.map((volunteer) => (
            <Grid item xs={12} md={6} lg={4} key={volunteer.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {volunteer.user_details?.first_name} {volunteer.user_details?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {volunteer.user_details?.username}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Experience: {volunteer.experience_level}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Hours: {volunteer.total_hours || 0}
                    </Typography>
                  </Box>
                  
                  {volunteer.skills && volunteer.skills.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Skills:
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {volunteer.skills.slice(0, 3).map((skill, index) => (
                          <Chip key={index} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                        {volunteer.skills.length > 3 && (
                          <Chip label={`+${volunteer.skills.length - 3} more`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small">View Profile</Button>
                  <Button size="small">Contact</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
          Emergency Rescue Coordination
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Coordinate volunteer responses to emergency animal rescues. Monitor real-time status and GPS tracking.
        </Alert>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report</TableCell>
                <TableCell>Volunteer</TableCell>
                <TableCell>Assignment Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Response Time</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rescueAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {assignment.report_details?.animal_type} Rescue
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {assignment.report}
                    </Typography>
                  </TableCell>
                  <TableCell>{assignment.volunteer_details?.username}</TableCell>
                  <TableCell>
                    <Chip label={assignment.assignment_type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.status} 
                      color={getStatusColor(assignment.status)}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{assignment.response_time_minutes || '-'} min</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <LocationIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Create Opportunity Dialog */}
      <Dialog open={createOpportunityOpen} onClose={() => setCreateOpportunityOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Volunteer Opportunity</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={opportunityForm.title}
                onChange={(e) => setOpportunityForm({...opportunityForm, title: e.target.value})}
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
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={opportunityForm.category}
                  onChange={(e) => setOpportunityForm({...opportunityForm, category: e.target.value})}
                  label="Category"
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
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Min Volunteers"
                value={opportunityForm.min_volunteers}
                onChange={(e) => setOpportunityForm({...opportunityForm, min_volunteers: parseInt(e.target.value)})}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Volunteers"
                value={opportunityForm.max_volunteers}
                onChange={(e) => setOpportunityForm({...opportunityForm, max_volunteers: parseInt(e.target.value)})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpportunityOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateOpportunity} 
            variant="contained" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Create Opportunity'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ShelterVolunteerManagement;