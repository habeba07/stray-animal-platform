import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoneyIcon from '@mui/icons-material/Money';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

function MyVirtualAdoptions() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchAdoptions();
  }, [user, navigate]);

  const fetchAdoptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/virtual-adoptions/my_adoptions/');
      setAdoptions(response.data);
    } catch (err) {
      setError('Failed to load your virtual adoptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await api.post(`/virtual-adoptions/${selectedAdoption.id}/cancel/`);
      fetchAdoptions();
      setCancelDialogOpen(false);
    } catch (err) {
      setError('Failed to cancel adoption');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setActionLoading(true);
      await api.post(`/virtual-adoptions/${selectedAdoption.id}/pause/`);
      fetchAdoptions();
      setPauseDialogOpen(false);
    } catch (err) {
      setError('Failed to pause adoption');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      await api.post(`/virtual-adoptions/${selectedAdoption.id}/resume/`);
      fetchAdoptions();
      setResumeDialogOpen(false);
    } catch (err) {
      setError('Failed to resume adoption');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'EXPIRED':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Virtual Adoptions
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/animals')}
        >
          Adopt Another Animal
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {adoptions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            You haven't virtually adopted any animals yet.
          </Typography>
          <Typography variant="body1" paragraph>
            Virtual adoption helps provide food, shelter, and care for animals in need.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/animals')}
          >
            Browse Animals to Adopt
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {adoptions.map((adoption) => (
            <Grid item xs={12} md={6} key={adoption.id}>
              <Card>
                <Box sx={{ position: 'relative' }}>
                  {adoption.animal_details.photos && adoption.animal_details.photos.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={adoption.animal_details.photos[0]}
                      alt={adoption.animal_details.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.200',
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                    </Box>
                  )}
                  <Chip
                    label={adoption.status}
                    color={getStatusColor(adoption.status)}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                    }}
                  />
                </Box>
                
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    {adoption.animal_details.name || 'Unnamed'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {adoption.animal_details.breed || adoption.animal_details.animal_type} • {adoption.animal_details.gender}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <MoneyIcon fontSize="small" sx={{ mr: 1 }} />
                        {formatCurrency(adoption.amount)} {adoption.period.toLowerCase()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                        Since: {formatDate(adoption.start_date)}
                      </Typography>
                    </Grid>
                    
                    {adoption.status === 'ACTIVE' && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          Next payment: {formatDate(adoption.next_payment_date)}
                        </Typography>
                      </Grid>
                    )}
                    
                    {adoption.is_gift && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          Gift for: {adoption.gift_recipient_name}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate(`/animals/${adoption.animal_details.id}`)}
                    >
                      View Animal
                    </Button>
                    
                    {adoption.status === 'ACTIVE' && (
                      <Button 
                        variant="outlined" 
                        color="warning"
                        onClick={() => {
                          setSelectedAdoption(adoption);
                          setPauseDialogOpen(true);
                        }}
                      >
                        Pause
                      </Button>
                    )}
                    
                    {adoption.status === 'PAUSED' && (
                      <Button 
                        variant="outlined" 
                        color="success"
                        onClick={() => {
                          setSelectedAdoption(adoption);
                          setResumeDialogOpen(true);
                        }}
                      >
                        Resume
                      </Button>
                    )}
                    
                    {['ACTIVE', 'PAUSED'].includes(adoption.status) && (
                      <Button 
                        variant="outlined" 
                        color="error"
                        onClick={() => {
                          setSelectedAdoption(adoption);
                          setCancelDialogOpen(true);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Virtual Adoption</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your virtual adoption of {selectedAdoption?.animal_details.name || 'this animal'}? This will stop all future payments and end your sponsorship.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            No, Keep Supporting
          </Button>
          <Button 
            onClick={handleCancel} 
            color="error" 
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Yes, Cancel Adoption'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Pause Dialog */}
      <Dialog open={pauseDialogOpen} onClose={() => setPauseDialogOpen(false)}>
        <DialogTitle>Pause Virtual Adoption</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to temporarily pause your support for {selectedAdoption?.animal_details.name || 'this animal'}? You can resume at any time.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPauseDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePause} 
            color="warning" 
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Pause Adoption'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Resume Dialog */}
      <Dialog open={resumeDialogOpen} onClose={() => setResumeDialogOpen(false)}>
        <DialogTitle>Resume Virtual Adoption</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ready to resume your support for {selectedAdoption?.animal_details.name || 'this animal'}? We'll process your next payment on the next scheduled date.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResumeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleResume} 
            color="success" 
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Resume Adoption'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyVirtualAdoptions;