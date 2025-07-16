import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Pets as PetsIcon,
  Psychology as BehaviorIcon,
  Home as HomeIcon,
  LocalHospital as HealthIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

function AdoptionRequirementsTab({ animalId, animal }) {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [behaviorProfile, setBehaviorProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    energy_level: '',
    temperament: '',
    training_level: '',
    good_with_children: false,
    good_with_dogs: false,
    good_with_cats: false,
    good_with_strangers: false,
    house_trained: false,
    leash_trained: false,
    special_needs: '',
    medical_needs: '',
    behavior_notes: '',
    ideal_home: '',
  });

  const energyLevelChoices = [
    { value: 'LOW', label: 'Low Energy' },
    { value: 'MEDIUM', label: 'Medium Energy' },
    { value: 'HIGH', label: 'High Energy' },
    { value: 'VERY_HIGH', label: 'Very High Energy' },
  ];

  const temperamentChoices = [
    { value: 'CALM', label: 'Calm' },
    { value: 'PLAYFUL', label: 'Playful' },
    { value: 'INDEPENDENT', label: 'Independent' },
    { value: 'AFFECTIONATE', label: 'Affectionate' },
    { value: 'PROTECTIVE', label: 'Protective' },
    { value: 'SHY', label: 'Shy' },
    { value: 'ANXIOUS', label: 'Anxious' },
  ];

  const trainingLevelChoices = [
    { value: 'NONE', label: 'No Training' },
    { value: 'BASIC', label: 'Basic Commands' },
    { value: 'INTERMEDIATE', label: 'Well Trained' },
    { value: 'ADVANCED', label: 'Extensively Trained' },
  ];

  useEffect(() => {
    fetchBehaviorProfile();
  }, [animalId]);

  const fetchBehaviorProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to get existing behavior profile for this animal
      const response = await api.get('/animal-behavior-profiles/');
      const profiles = response.data;
      
      // Find profile for this specific animal
      const existingProfile = profiles.find(profile => profile.animal === parseInt(animalId));
      
      if (existingProfile) {
        setBehaviorProfile(existingProfile);
        setFormData(existingProfile);
      } else {
        // No existing profile - start with defaults
        setBehaviorProfile(null);
        setFormData({
          energy_level: '',
          temperament: '',
          training_level: '',
          good_with_children: false,
          good_with_dogs: false,
          good_with_cats: false,
          good_with_strangers: false,
          house_trained: false,
          leash_trained: false,
          special_needs: '',
          medical_needs: '',
          behavior_notes: '',
          ideal_home: '',
        });
      }
    } catch (err) {
      console.error('Error fetching behavior profile:', err);
      setError('Failed to load adoption requirements');
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
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        animal: parseInt(animalId)
      };

      let response;
      if (behaviorProfile) {
        // Update existing profile
        response = await api.put(`/animal-behavior-profiles/${behaviorProfile.id}/`, submitData);
        setSuccess('Adoption requirements updated successfully!');
      } else {
        // Create new profile
        response = await api.post('/animal-behavior-profiles/', submitData);
        setBehaviorProfile(response.data);
        setSuccess('Adoption requirements created successfully!');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error saving behavior profile:', err);
      setError(err.response?.data?.detail || 'Failed to save adoption requirements');
    } finally {
      setSaving(false);
    }
  };

  // Check if user has permission to edit
  const canEdit = user && (user.user_type === 'STAFF' || user.user_type === 'SHELTER' || user.is_staff);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!canEdit) {
    return (
      <Alert severity="warning">
        You don't have permission to manage adoption requirements. Only shelter staff can access this feature.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BehaviorIcon sx={{ mr: 2, color: '#8d6e63', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" component="h2">
            Adoption Requirements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set behavioral and compatibility requirements for {animal?.name || 'this animal'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Behavioral Characteristics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f3e5ab' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PetsIcon sx={{ mr: 1, color: '#8d6e63' }} />
                <Typography variant="h6">Behavioral Characteristics</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Energy Level</InputLabel>
                    <Select
                      name="energy_level"
                      value={formData.energy_level}
                      onChange={handleChange}
                    >
                      {energyLevelChoices.map((choice) => (
                        <MenuItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Temperament</InputLabel>
                    <Select
                      name="temperament"
                      value={formData.temperament}
                      onChange={handleChange}
                    >
                      {temperamentChoices.map((choice) => (
                        <MenuItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Training Level</InputLabel>
                    <Select
                      name="training_level"
                      value={formData.training_level}
                      onChange={handleChange}
                    >
                      {trainingLevelChoices.map((choice) => (
                        <MenuItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Social Compatibility */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#e8f5e8' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HomeIcon sx={{ mr: 1, color: '#4caf50' }} />
                <Typography variant="h6">Social Compatibility</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="good_with_children"
                        checked={formData.good_with_children}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Good with Children"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="good_with_dogs"
                        checked={formData.good_with_dogs}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Good with Dogs"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="good_with_cats"
                        checked={formData.good_with_cats}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Good with Cats"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="good_with_strangers"
                        checked={formData.good_with_strangers}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Good with Strangers"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Training & Habits */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#e3f2fd' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HealthIcon sx={{ mr: 1, color: '#2196f3' }} />
                <Typography variant="h6">Training & Habits</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="house_trained"
                        checked={formData.house_trained}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="House Trained"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="leash_trained"
                        checked={formData.leash_trained}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Leash Trained"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Special Needs & Notes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Special Considerations & Notes
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="special_needs"
                    label="Special Needs"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.special_needs}
                    onChange={handleChange}
                    placeholder="Describe any special needs or accommodations required..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="medical_needs"
                    label="Medical Needs"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.medical_needs}
                    onChange={handleChange}
                    placeholder="Describe any ongoing medical needs..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="behavior_notes"
                    label="Behavior Notes"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.behavior_notes}
                    onChange={handleChange}
                    placeholder="Additional behavioral observations and notes..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="ideal_home"
                    label="Ideal Home Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.ideal_home}
                    onChange={handleChange}
                    placeholder="Describe the ideal home environment for this animal..."
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {behaviorProfile && (
                  <Chip 
                    label="Profile Exists" 
                    color="success" 
                    size="small" 
                  />
                )}
                {formData.energy_level && (
                  <Chip 
                    label={`Energy: ${energyLevelChoices.find(c => c.value === formData.energy_level)?.label}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {formData.temperament && (
                  <Chip 
                    label={`Temperament: ${temperamentChoices.find(c => c.value === formData.temperament)?.label}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  backgroundColor: '#8d6e63',
                  '&:hover': { backgroundColor: '#6d4c41' },
                  minWidth: 200
                }}
              >
                {saving ? 'Saving...' : (behaviorProfile ? 'Update Requirements' : 'Create Requirements')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default AdoptionRequirementsTab;