import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Person as PersonIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Visibility as ReviewIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

function AdoptionApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchApplicationDetail();
  }, [id, user, navigate]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/adoption-applications/${id}/`);
      setApplication(response.data);
    } catch (err) {
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'UNDER_REVIEW':
        return 'info';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'WITHDRAWN':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <PendingIcon />;
      case 'UNDER_REVIEW':
        return <ReviewIcon />;
      case 'APPROVED':
        return <ApprovedIcon />;
      case 'REJECTED':
        return <RejectedIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.patch(`/adoption-applications/${id}/`, { status: newStatus });
      fetchApplicationDetail(); // Refresh data
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!application) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Application not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Adoption Application #{application.id}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/adoption/applications')}>
          Back to Applications
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Animal Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <PetsIcon />
                </Avatar>
                <Typography variant="h6">Animal Information</Typography>
              </Box>
              
              {application.animal_details?.photos && application.animal_details.photos.length > 0 ? (
                <Box
                  component="img"
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 2
                  }}
                  src={`http://localhost:8000${application.animal_details.photos[0]}`}
                  alt={application.animal_details.name}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f3e5ab',
                    borderRadius: 2,
                    mb: 2
                  }}
                >
                  <PetsIcon sx={{ fontSize: 60, color: '#8d6e63' }} />
                </Box>
              )}

              <Typography variant="h6" gutterBottom>
                {application.animal_details?.name || 'Unnamed'}
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Type" 
                    secondary={application.animal_details?.animal_type || 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Breed" 
                    secondary={application.animal_details?.breed || 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Age" 
                    secondary={application.animal_details?.age || 'Unknown'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Gender" 
                    secondary={application.animal_details?.gender || 'Unknown'} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Status & Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                  {getStatusIcon(application.status)}
                </Avatar>
                <Typography variant="h6">Application Status</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Chip
                  label={application.status}
                  color={getStatusColor(application.status)}
                  size="large"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="textSecondary">
                  Submitted: {formatDate(application.created_at)}
                </Typography>
                {application.updated_at && application.updated_at !== application.created_at && (
                  <Typography variant="body2" color="textSecondary">
                    Last Updated: {formatDate(application.updated_at)}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                {application.compatibility_score && (
                  <ListItem>
                    <ListItemText 
                      primary="Compatibility Score" 
                      secondary={`${Math.round(application.compatibility_score)}%`} 
                    />
                  </ListItem>
                )}
                
                {application.applicant_details && (
                  <ListItem>
                    <ListItemText 
                      primary="Applicant" 
                      secondary={`${application.applicant_details.first_name} ${application.applicant_details.last_name}`} 
                    />
                  </ListItem>
                )}

                {application.phone && (
                  <ListItem>
                    <ListItemText 
                      primary="Phone" 
                      secondary={application.phone} 
                    />
                  </ListItem>
                )}

                {application.email && (
                  <ListItem>
                    <ListItemText 
                      primary="Email" 
                      secondary={application.email} 
                    />
                  </ListItem>
                )}
              </List>

              {/* Status Update Buttons for Staff */}
              {(user?.user_type === 'STAFF' || user?.user_type === 'SHELTER') && 
               application.status === 'PENDING' && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleUpdateStatus('APPROVED')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleUpdateStatus('REJECTED')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                  >
                    Mark Under Review
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Application Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Details
              </Typography>
              
              {application.motivation && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Why do you want to adopt this animal?
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2">
                      {application.motivation}
                    </Typography>
                  </Paper>
                </Box>
              )}

              <Grid container spacing={2}>
                {application.housing_type && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Housing Type</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {application.housing_type}
                    </Typography>
                  </Grid>
                )}

                {application.has_yard !== null && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Has Yard</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {application.has_yard ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                )}

                {application.other_pets !== null && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Other Pets</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {application.other_pets ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                )}

                {application.experience_level && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Experience Level</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {application.experience_level}
                    </Typography>
                  </Grid>
                )}

                {application.vet_reference && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Veterinarian Reference</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {application.vet_reference}
                    </Typography>
                  </Grid>
                )}

                {application.personal_reference && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Personal Reference</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {application.personal_reference}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Agreements */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Agreements
                </Typography>
                <List dense>
                  {application.agrees_to_home_visit !== null && (
                    <ListItem>
                      <ListItemText 
                        primary="Agrees to home visit" 
                        secondary={application.agrees_to_home_visit ? 'Yes' : 'No'} 
                      />
                    </ListItem>
                  )}
                  {application.agrees_to_follow_up !== null && (
                    <ListItem>
                      <ListItemText 
                        primary="Agrees to follow-up visits" 
                        secondary={application.agrees_to_follow_up ? 'Yes' : 'No'} 
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdoptionApplicationDetail;