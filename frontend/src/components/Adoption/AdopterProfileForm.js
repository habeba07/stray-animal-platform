import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

function AdopterProfileForm() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    housing_type: '',
    has_yard: false,
    yard_size: '',
    rent_permission: false,
    adults_in_home: 1,
    children_in_home: 0,
    children_ages: '',
    pet_experience: '',
    current_pets: '',
    previous_pets: '',
    activity_level: '',
    work_schedule: '',
    hours_alone: '',
    preferred_animal_type: '',
    preferred_age: '',
    preferred_size: '',
    preferred_gender: '',
    willing_to_train: true,
    special_needs_capable: false,
    budget_for_pet: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/adopter-profiles/my_profile/');
      setExistingProfile(response.data);
      setFormData(response.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to fetch profile');
      }
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
    setLoading(true);
    setError('');

    try {
      if (existingProfile) {
        await api.put(`/adopter-profiles/${existingProfile.id}/`, formData);
      } else {
        await api.post('/adopter-profiles/', formData);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/adoption/matches');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Adopter Profile
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile saved successfully! Redirecting to matches...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Housing Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Housing Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Housing Type</InputLabel>
                <Select
                  name="housing_type"
                  value={formData.housing_type}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="HOUSE">House</MenuItem>
                  <MenuItem value="APARTMENT">Apartment</MenuItem>
                  <MenuItem value="CONDO">Condo</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="has_yard"
                    checked={formData.has_yard}
                    onChange={handleChange}
                  />
                }
                label="Has Yard"
              />
            </Grid>

            {formData.has_yard && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Yard Size</InputLabel>
                  <Select
                    name="yard_size"
                    value={formData.yard_size}
                    onChange={handleChange}
                  >
                    <MenuItem value="SMALL">Small Yard</MenuItem>
                    <MenuItem value="MEDIUM">Medium Yard</MenuItem>
                    <MenuItem value="LARGE">Large Yard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rent_permission"
                    checked={formData.rent_permission}
                    onChange={handleChange}
                  />
                }
                label="Have Landlord Permission (if renting)"
              />
            </Grid>

            {/* Household Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Household Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="adults_in_home"
                label="Adults in Home"
                type="number"
                fullWidth
                value={formData.adults_in_home}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="children_in_home"
                label="Children in Home"
                type="number"
                fullWidth
                value={formData.children_in_home}
                onChange={handleChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="children_ages"
                label="Children Ages"
                fullWidth
                value={formData.children_ages}
                onChange={handleChange}
                placeholder="e.g., 5, 8, 12"
                disabled={formData.children_in_home === 0}
              />
            </Grid>

            {/* Pet Experience */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Pet Experience
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Pet Experience Level</InputLabel>
                <Select
                  name="pet_experience"
                  value={formData.pet_experience}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="NONE">No Experience</MenuItem>
                  <MenuItem value="BEGINNER">Some Experience</MenuItem>
                  <MenuItem value="INTERMEDIATE">Moderate Experience</MenuItem>
                  <MenuItem value="EXPERT">Extensive Experience</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Activity Level</InputLabel>
                <Select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="SEDENTARY">Sedentary</MenuItem>
                  <MenuItem value="MODERATELY_ACTIVE">Moderately Active</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="VERY_ACTIVE">Very Active</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="current_pets"
                label="Current Pets"
                fullWidth
                multiline
                rows={2}
                value={formData.current_pets}
                onChange={handleChange}
                placeholder="Describe any current pets"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="previous_pets"
                label="Previous Pets"
                fullWidth
                multiline
                rows={2}
                value={formData.previous_pets}
                onChange={handleChange}
                placeholder="Describe any previous pets"
              />
            </Grid>

            {/* Lifestyle */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Lifestyle
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="work_schedule"
                label="Work Schedule"
                fullWidth
                value={formData.work_schedule}
                onChange={handleChange}
                required
                placeholder="e.g., 9-5 weekdays, flexible, work from home"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="hours_alone"
                label="Hours Pet Would Be Alone Daily"
                type="number"
                fullWidth
                value={formData.hours_alone}
                onChange={handleChange}
                required
                inputProps={{ min: 0, max: 24 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="budget_for_pet"
                label="Monthly Budget for Pet Care"
                fullWidth
                value={formData.budget_for_pet}
                onChange={handleChange}
                required
                placeholder="e.g., $100-200 per month"
              />
            </Grid>

            {/* Preferences */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Pet Preferences
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Animal Type</InputLabel>
                <Select
                  name="preferred_animal_type"
                  value={formData.preferred_animal_type}
                  onChange={handleChange}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="DOG">Dog</MenuItem>
                  <MenuItem value="CAT">Cat</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Gender</InputLabel>
                <Select
                  name="preferred_gender"
                  value={formData.preferred_gender}
                  onChange={handleChange}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="preferred_age"
                label="Preferred Age"
                fullWidth
                value={formData.preferred_age}
                onChange={handleChange}
                placeholder="e.g., puppy, adult, senior, any"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="preferred_size"
                label="Preferred Size"
                fullWidth
                value={formData.preferred_size}
                onChange={handleChange}
                placeholder="e.g., small, medium, large, any"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="willing_to_train"
                    checked={formData.willing_to_train}
                    onChange={handleChange}
                  />
                }
                label="Willing to Train"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="special_needs_capable"
                    checked={formData.special_needs_capable}
                    onChange={handleChange}
                  />
                }
                label="Can Handle Special Needs Pets"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : (existingProfile ? 'Update Profile' : 'Create Profile')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default AdopterProfileForm;