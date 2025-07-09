import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Box,
  Divider,
} from '@mui/material';
import { useSelector } from 'react-redux';
import api from '../../redux/api';
import PetsIcon from '@mui/icons-material/Pets';

function AdoptionApplicationForm() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [animal, setAnimal] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  
  const [formData, setFormData] = useState({
    why_adopt: '',
    previous_adoption: false,
    previous_adoption_details: '',
    veterinarian_info: '',
    personal_reference: '',
    agree_home_visit: false,
    agree_follow_up: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAnimalAndProfile();
  }, [user, animalId, navigate]);

  const fetchAnimalAndProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch animal details
      const animalResponse = await api.get(`/animals/${animalId}/`);
      setAnimal(animalResponse.data);
      
      // Check if user has adopter profile
      try {
        await api.get('/adopter-profiles/my_profile/');
        setHasProfile(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasProfile(false);
          setError('Please create an adopter profile before applying.');
        }
      }
      
    } catch (err) {
      setError('Failed to load animal details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agree_home_visit || !formData.agree_follow_up) {
      setError('You must agree to home visits and follow-ups to proceed.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const applicationData = {
        ...formData,
        animal: animalId,
      };
      
      await api.post('/adoption-applications/', applicationData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/adoption/applications');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!animal) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Animal not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Adoption Application
        </Typography>
        
        {/* Animal Info Card */}
        <Card sx={{ mb: 4 }}>
          <Grid container>
            <Grid item xs={12} md={4}>
              {animal.photos && animal.photos.length > 0 ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={animal.photos[0]}
                  alt={animal.name}
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
                  <PetsIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {animal.name || 'Unnamed'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {animal.animal_type} • {animal.breed || 'Unknown breed'} • {animal.gender}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {animal.age_estimate && `Age: ${animal.age_estimate}`}
                </Typography>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              !hasProfile && (
                <Button color="inherit" size="small" onClick={() => navigate('/adoption/profile')}>
                  Create Profile
                </Button>
              )
            }
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Application submitted successfully! Redirecting...
          </Alert>
        )}

        {hasProfile && (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="why_adopt"
                  label="Why do you want to adopt this animal?"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.why_adopt}
                  onChange={handleChange}
                  required
                  placeholder="Tell us why you think this pet would be a good fit for your home..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="previous_adoption"
                      checked={formData.previous_adoption}
                      onChange={handleChange}
                    />
                  }
                  label="Have you adopted from a shelter before?"
                />
              </Grid>

              {formData.previous_adoption && (
                <Grid item xs={12}>
                  <TextField
                    name="previous_adoption_details"
                    label="Previous Adoption Details"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.previous_adoption_details}
                    onChange={handleChange}
                    placeholder="Please provide details about your previous adoption experience..."
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  name="veterinarian_info"
                  label="Veterinarian Information (if any)"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.veterinarian_info}
                  onChange={handleChange}
                  placeholder="Name, clinic, and contact information of your veterinarian..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="personal_reference"
                  label="Personal Reference"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.personal_reference}
                  onChange={handleChange}
                  placeholder="Name and contact information of someone who can vouch for you..."
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Agreements
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agree_home_visit"
                      checked={formData.agree_home_visit}
                      onChange={handleChange}
                      required
                    />
                  }
                  label="I agree to allow a home visit before adoption approval"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agree_follow_up"
                      checked={formData.agree_follow_up}
                      onChange={handleChange}
                      required
                    />
                  }
                  label="I agree to follow-up visits after adoption"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={submitting || !hasProfile}
                  sx={{ mt: 2 }}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Paper>
    </Container>
  );
}

export default AdoptionApplicationForm;