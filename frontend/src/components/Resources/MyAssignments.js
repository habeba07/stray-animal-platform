import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import api from '../../redux/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function MyAssignments() {
  const [value, setValue] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hourDialogOpen, setHourDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [hours, setHours] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/volunteer-assignments/my_assignments/');
      setAssignments(response.data);
    } catch (err) {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleConfirm = async (assignmentId) => {
    try {
      await api.post(`/volunteer-assignments/${assignmentId}/confirm/`);
      fetchAssignments();
    } catch (err) {
      setError('Failed to confirm assignment');
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    
    if (!selectedAssignment) return;
    
    try {
      setSubmitting(true);
      await api.post(`/volunteer-assignments/${selectedAssignment.id}/complete/`, {
        hours: parseFloat(hours)
      });
      setHourDialogOpen(false);
      fetchAssignments();
    } catch (err) {
      setError('Failed to complete assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHoursChange = (e) => {
    // Only allow numbers and decimal point
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setHours(value);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    return format(new Date(dateTimeStr), 'PPP p');
  };

  // Filter assignments based on status
  const upcomingAssignments = assignments.filter(a => 
    ['ASSIGNED', 'CONFIRMED'].includes(a.status) && 
    new Date(a.opportunity_details.start_time) > new Date()
  );
  
  const pastAssignments = assignments.filter(a => 
    ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status) ||
    (new Date(a.opportunity_details.end_time) < new Date() && ['ASSIGNED', 'CONFIRMED'].includes(a.status))
  );
  
  const currentAssignments = assignments.filter(a => 
    ['ASSIGNED', 'CONFIRMED'].includes(a.status) &&
    new Date(a.opportunity_details.start_time) <= new Date() &&
    new Date(a.opportunity_details.end_time) >= new Date()
  );

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Volunteer Assignments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleTabChange} aria-label="assignment tabs">
          <Tab label={`Upcoming (${upcomingAssignments.length})`} />
          <Tab label={`Active (${currentAssignments.length})`} />
          <Tab label={`Past (${pastAssignments.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        {upcomingAssignments.length === 0 ? (
          <Alert severity="info">You have no upcoming volunteer assignments.</Alert>
        ) : (
          <Grid container spacing={3}>
            {upcomingAssignments.map((assignment) => (
              <Grid item xs={12} md={6} key={assignment.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {assignment.opportunity_details.title}
                    </Typography>
                    
                    <Chip
                      label={assignment.status}
                      color={assignment.status === 'CONFIRMED' ? 'success' : 'warning'}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <EventIcon fontSize="small" sx={{ mr: 1 }} />
                      {formatDateTime(assignment.opportunity_details.start_time)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                      {assignment.opportunity_details.location}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Duration: {assignment.opportunity_details.duration_hours.toFixed(1)} hours
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    {assignment.status === 'ASSIGNED' && (
                      <Button 
                        size="small" 
                        color="primary"
                        onClick={() => handleConfirm(assignment.id)}
                      >
                        Confirm Participation
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={value} index={1}>
        {currentAssignments.length === 0 ? (
          <Alert severity="info">You have no active volunteer assignments.</Alert>
        ) : (
          <Grid container spacing={3}>
            {currentAssignments.map((assignment) => (
              <Grid item xs={12} md={6} key={assignment.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {assignment.opportunity_details.title}
                    </Typography>
                    
                    <Chip
                      label="ACTIVE NOW"
                      color="success"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <EventIcon fontSize="small" sx={{ mr: 1 }} />
                      {formatDateTime(assignment.opportunity_details.start_time)} - {formatDateTime(assignment.opportunity_details.end_time)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                      {assignment.opportunity_details.location}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Duration: {assignment.opportunity_details.duration_hours.toFixed(1)} hours
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setHours(assignment.opportunity_details.duration_hours.toString());
                        setHourDialogOpen(true);
                      }}
                      startIcon={<CheckCircleIcon />}
                    >
                      Complete Assignment
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={value} index={2}>
        {pastAssignments.length === 0 ? (
          <Alert severity="info">You have no past volunteer assignments.</Alert>
        ) : (
          <Grid container spacing={3}>
            {pastAssignments.map((assignment) => (
              <Grid item xs={12} md={6} key={assignment.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {assignment.opportunity_details.title}
                    </Typography>
                    
                    <Chip
                      label={assignment.status}
                      color={
                        assignment.status === 'COMPLETED' ? 'success' :
                        assignment.status === 'CANCELLED' ? 'error' : 'default'
                      }
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <EventIcon fontSize="small" sx={{ mr: 1 }} />
                      {formatDateTime(assignment.opportunity_details.start_time)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                      {assignment.opportunity_details.location}
                    </Typography>
                    
                    {assignment.hours_logged && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <HourglassTopIcon fontSize="small" sx={{ mr: 1 }} />
                        Hours: {assignment.hours_logged}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Hours Logging Dialog */}
      <Dialog open={hourDialogOpen} onClose={() => setHourDialogOpen(false)}>
        <form onSubmit={handleComplete}>
          <DialogTitle>Log Volunteer Hours</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              Please enter the number of hours you volunteered for this assignment:
            </Typography>
            <TextField
              label="Hours"
              variant="outlined"
              fullWidth
              value={hours}
              onChange={handleHoursChange}
              type="text"
              required
              InputProps={{
                endAdornment: <Typography variant="caption">hours</Typography>
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHourDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={submitting || !hours}
            >
              {submitting ? <CircularProgress size={24} /> : 'Submit Hours'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default MyAssignments;