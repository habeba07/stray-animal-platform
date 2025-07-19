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
  Chip,
  Box,
  CircularProgress,
  Alert,
  Autocomplete,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  LinearProgress,
  Divider,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  Emergency as EmergencyIcon,
  DirectionsCar as CarIcon,
  Pets as PetsIcon,
  School as TrainingIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Timer as TimerIcon,
  VolunteerActivism as VolunteerIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingIcon,
  EmojiEvents as TrophyIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Build as BuildIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { keyframes } from '@mui/system';
import api from '../../redux/api';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha(customTheme.accent, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0)}; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Enhanced predefined options
const SKILLS = [
  'Animal Handling', 'Dog Walking', 'Cat Socialization', 'Grooming', 
  'First Aid', 'Photography', 'Marketing', 'Social Media', 'Fundraising',
  'Event Planning', 'Administration', 'Transportation', 'Veterinary',
  'Training', 'Customer Service', 'Public Speaking', 'Cleaning',
  'Emergency Response', 'Large Animal Rescue', 'Water Rescue', 'Rope Rescue',
  'Animal Behavior Assessment', 'Crowd Control', 'Equipment Operation',
  'Radio Communications', 'Scene Management', 'Trauma Response'
];

const INTERESTS = [
  'Dog Care', 'Cat Care', 'Small Animals', 'Wildlife', 'Adoption Events',
  'Fundraising', 'Community Outreach', 'Education', 'Administrative',
  'Facility Maintenance', 'Transportation', 'Foster Care',
  'Emergency Response', 'Search and Rescue', 'Disaster Relief', 
  'Large Animal Rescue', 'Wildlife Rehabilitation', 'Medical Support'
];

const ANIMAL_TYPES = [
  'Dogs', 'Cats', 'Small Animals', 'Birds', 'Reptiles', 'Farm Animals', 
  'Wildlife', 'Horses', 'Livestock', 'Exotic Animals'
];

const RESCUE_SPECIALIZATIONS = [
  'Urban Rescue', 'Rural Rescue', 'Water Rescue', 'High-Angle Rescue',
  'Confined Space', 'Vehicle Extrication', 'Large Animal', 'Wildlife',
  'Disaster Response', 'Medical Support', 'Communications', 'Logistics'
];

const VEHICLE_TYPES = [
  'Sedan', 'SUV', 'Pickup Truck', 'Van', 'Trailer', 'Motorcycle', 
  '4WD Vehicle', 'Emergency Vehicle', 'Boat', 'ATV'
];

function VolunteerProfileForm() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [userStats, setUserStats] = useState(null);
  
  const [formData, setFormData] = useState({
    skills: [],
    interests: [],
    availability: '',
    experience_level: '',
    has_animal_handling: false,
    has_transportation: false,
    preferred_animals: [],
    bio: '',
    emergency_contact: '',
    max_rescue_distance_km: 10,
    available_for_emergency: false,
    rescue_experience_level: 'NONE',
    gps_tracking_consent: false,
    emergency_contact_phone: '',
    preferred_contact_method: 'APP',
    rescue_specializations: [],
    vehicle_info: {
      has_vehicle: false,
      vehicle_type: '',
      vehicle_capacity: 0,
      has_trailer: false,
      four_wheel_drive: false,
      special_equipment: []
    },
    certifications: [],
    availability_schedule: {
      weekdays: false,
      weekends: false,
      evenings: false,
      overnight: false,
      holidays: false
    },
    physical_capabilities: {
      can_lift_50lbs: false,
      comfortable_heights: false,
      comfortable_water: false,
      mobility_limitations: ''
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      try {
        const response = await api.get('/volunteer-profiles/my_profile/');
        setExistingProfile(response.data);
        setFormData({
          ...response.data,
          rescue_specializations: response.data.rescue_specializations || [],
          vehicle_info: response.data.vehicle_info || {
            has_vehicle: false,
            vehicle_type: '',
            vehicle_capacity: 0,
            has_trailer: false,
            four_wheel_drive: false,
            special_equipment: []
          },
          certifications: response.data.certifications || [],
          availability_schedule: response.data.availability_schedule || {
            weekdays: false,
            weekends: false,
            evenings: false,
            overnight: false,
            holidays: false
          },
          physical_capabilities: response.data.physical_capabilities || {
            can_lift_50lbs: false,
            comfortable_heights: false,
            comfortable_water: false,
            mobility_limitations: ''
          }
        });
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Failed to fetch profile');
        }
      }
      
      try {
        const statsResponse = await api.get('/volunteers/rescue-assignments/activity_dashboard/');
        setUserStats(statsResponse.data);
      } catch (err) {
        console.log('No stats available yet');
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (existingProfile) {
        await api.put(`/volunteer-profiles/${existingProfile.id}/`, formData);
      } else {
        await api.post('/volunteer-profiles/', formData);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/volunteer/hub');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Basic Information',
    'Rescue Capabilities', 
    'Vehicle & Equipment',
    'Availability & Contact'
  ];

  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      minHeight: 56,
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: alpha(customTheme.primary, 0.3),
        borderWidth: 2,
      },
      '&:hover fieldset': {
        borderColor: customTheme.secondary,
        borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: customTheme.primary,
        borderWidth: 3,
        boxShadow: `0 0 0 3px ${alpha(customTheme.primary, 0.1)}`,
      },
    },
    '& .MuiInputLabel-root': {
      color: customTheme.primary,
      fontWeight: 600,
      fontSize: '1rem',
      '&.Mui-focused': {
        color: customTheme.primary,
      },
    },
    '& .MuiOutlinedInput-input': {
      color: customTheme.primary,
      fontWeight: 500,
      padding: '16px 14px',
    }
  };

  const selectStyles = {
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: customTheme.primary,
    fontWeight: 500,
    transition: 'all 0.3s ease',
    minHeight: 56,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(customTheme.primary, 0.3),
      borderWidth: 2,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: customTheme.secondary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: customTheme.primary,
      borderWidth: 3,
      boxShadow: `0 0 0 3px ${alpha(customTheme.primary, 0.1)}`,
    },
  };

  const renderPerformanceMetrics = () => {
    if (!userStats) return null;

    return (
      <Fade in timeout={800}>
        <Card sx={{ 
          mb: 6, 
          background: `linear-gradient(135deg, ${customTheme.primary} 0%, ${customTheme.accent} 100%)`, 
          color: 'white',
          borderRadius: 6,
          overflow: 'hidden',
          border: `3px solid ${alpha(customTheme.primary, 0.3)}`,
          boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.3)}`
        }}>
          <CardContent sx={{ p: 5 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 700,
              mb: 4
            }}>
              <TrophyIcon sx={{ mr: 2, fontSize: 32 }} />
              Your Rescue Performance
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {userStats.total_points || 0}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Total Points
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {userStats.user_profile?.total_rescues_completed || 0}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Rescues Completed
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {userStats.user_profile?.average_response_time_minutes ? 
                      `${Math.round(userStats.user_profile.average_response_time_minutes)}m` : 'N/A'
                    }
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Avg Response Time
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    {userStats.leaderboard_position?.rescue_rank || 'N/A'}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Community Rank
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {userStats.recent_achievements?.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
                  Recent Achievements:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {userStats.recent_achievements.slice(0, 3).map((achievement, index) => (
                    <Chip
                      key={index}
                      label={achievement.name}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
              border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <PersonIcon />
              Basic Volunteer Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={SKILLS}
                  value={formData.skills}
                  onChange={(e, newValue) => handleMultiSelectChange('skills', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Skills"
                      placeholder="Select your skills"
                      required
                      sx={fieldStyles}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip 
                        label={option} 
                        {...getTagProps({ index })} 
                        key={index}
                        sx={{
                          bgcolor: alpha(customTheme.secondary, 0.15),
                          color: customTheme.primary,
                          fontWeight: 600
                        }}
                      />
                    ))
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={INTERESTS}
                  value={formData.interests}
                  onChange={(e, newValue) => handleMultiSelectChange('interests', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Interests"
                      placeholder="Select your interests"
                      required
                      sx={fieldStyles}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip 
                        label={option} 
                        {...getTagProps({ index })} 
                        key={index}
                        sx={{
                          bgcolor: alpha(customTheme.accent, 0.15),
                          color: customTheme.primary,
                          fontWeight: 600
                        }}
                      />
                    ))
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>
                    Availability
                  </InputLabel>
                  <Select
                    name="availability"
                    value={formData.availability}
                    label="Availability"
                    onChange={handleChange}
                    sx={selectStyles}
                  >
                    <MenuItem value="WEEKDAYS">Weekdays</MenuItem>
                    <MenuItem value="WEEKENDS">Weekends</MenuItem>
                    <MenuItem value="EVENINGS">Evenings</MenuItem>
                    <MenuItem value="FLEXIBLE">Flexible Schedule</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>
                    Experience Level
                  </InputLabel>
                  <Select
                    name="experience_level"
                    value={formData.experience_level}
                    label="Experience Level"
                    onChange={handleChange}
                    sx={selectStyles}
                  >
                    <MenuItem value="BEGINNER">Beginner</MenuItem>
                    <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                    <MenuItem value="EXPERIENCED">Experienced</MenuItem>
                    <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={ANIMAL_TYPES}
                  value={formData.preferred_animals}
                  onChange={(e, newValue) => handleMultiSelectChange('preferred_animals', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Preferred Animals"
                      placeholder="Select types of animals you prefer to work with"
                      sx={fieldStyles}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip 
                        label={option} 
                        {...getTagProps({ index })} 
                        key={index}
                        sx={{
                          bgcolor: alpha(customTheme.primary, 0.15),
                          color: customTheme.primary,
                          fontWeight: 600
                        }}
                      />
                    ))
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="bio"
                  label="Bio"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and why you want to volunteer in animal rescue"
                  sx={fieldStyles}
                />
              </Grid>
            </Grid>
          </Paper>
        );

      case 1:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
              border: `2px solid ${alpha(customTheme.accent, 0.2)}`
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <EmergencyIcon />
              Emergency Rescue Capabilities
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    backgroundColor: alpha(customTheme.secondary, 0.1),
                    border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                    '& .MuiAlert-icon': {
                      color: customTheme.secondary
                    }
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                    Emergency Rescue Settings
                  </Typography>
                  Configure your availability for emergency animal rescue operations.
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="max_rescue_distance_km"
                  label="Max Rescue Distance (km)"
                  type="number"
                  fullWidth
                  value={formData.max_rescue_distance_km}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 100 }}
                  helperText="Maximum distance you're willing to travel for rescues"
                  sx={fieldStyles}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>
                    Rescue Experience Level
                  </InputLabel>
                  <Select
                    name="rescue_experience_level"
                    value={formData.rescue_experience_level}
                    label="Rescue Experience Level"
                    onChange={handleChange}
                    sx={selectStyles}
                  >
                    <MenuItem value="NONE">No Experience</MenuItem>
                    <MenuItem value="BEGINNER">Beginner</MenuItem>
                    <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                    <MenuItem value="EXPERIENCED">Experienced</MenuItem>
                    <MenuItem value="EXPERT">Expert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, color: customTheme.primary, fontWeight: 700 }}>
                  Rescue Specializations
                </Typography>
                <Autocomplete
                  multiple
                  options={RESCUE_SPECIALIZATIONS}
                  value={formData.rescue_specializations}
                  onChange={(e, newValue) => handleMultiSelectChange('rescue_specializations', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rescue Specializations"
                      placeholder="Select your areas of expertise"
                      sx={fieldStyles}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip 
                        label={option} 
                        {...getTagProps({ index })} 
                        key={index}
                        sx={{
                          bgcolor: alpha(customTheme.accent, 0.15),
                          color: customTheme.primary,
                          fontWeight: 600
                        }}
                      />
                    ))
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, color: customTheme.primary, fontWeight: 700 }}>
                  Physical Capabilities
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="physical_capabilities.can_lift_50lbs"
                          checked={formData.physical_capabilities.can_lift_50lbs}
                          onChange={handleChange}
                          sx={{ color: customTheme.primary }}
                        />
                      }
                      label="Can lift 50+ lbs"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="physical_capabilities.comfortable_heights"
                          checked={formData.physical_capabilities.comfortable_heights}
                          onChange={handleChange}
                          sx={{ color: customTheme.primary }}
                        />
                      }
                      label="Comfortable with heights"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="physical_capabilities.comfortable_water"
                          checked={formData.physical_capabilities.comfortable_water}
                          onChange={handleChange}
                          sx={{ color: customTheme.primary }}
                        />
                      }
                      label="Comfortable in/around water"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="physical_capabilities.mobility_limitations"
                      label="Mobility Limitations (if any)"
                      fullWidth
                      value={formData.physical_capabilities.mobility_limitations}
                      onChange={handleChange}
                      placeholder="Describe any physical limitations that might affect rescue work"
                      sx={fieldStyles}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="has_animal_handling"
                        checked={formData.has_animal_handling}
                        onChange={handleChange}
                        sx={{ color: customTheme.primary }}
                      />
                    }
                    label="I have experience handling animals safely"
                    sx={{ color: customTheme.primary, fontWeight: 600 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="available_for_emergency"
                        checked={formData.available_for_emergency}
                        onChange={handleChange}
                        sx={{ color: customTheme.accent }}
                      />
                    }
                    label="Available for emergency rescue calls (high priority alerts)"
                    sx={{ color: customTheme.primary, fontWeight: 600 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="gps_tracking_consent"
                        checked={formData.gps_tracking_consent}
                        onChange={handleChange}
                        sx={{ color: customTheme.secondary }}
                      />
                    }
                    label="I consent to GPS tracking during rescue operations (required for rescue assignments)"
                    sx={{ color: customTheme.primary, fontWeight: 600 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        );

      case 2:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
              border: `2px solid ${alpha(customTheme.success, 0.2)}`
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <CarIcon />
              Vehicle & Equipment Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="vehicle_info.has_vehicle"
                      checked={formData.vehicle_info.has_vehicle}
                      onChange={handleChange}
                      sx={{ color: customTheme.success }}
                    />
                  }
                  label="I have my own vehicle for rescue operations"
                  sx={{ color: customTheme.primary, fontWeight: 700, fontSize: '1.1rem' }}
                />
              </Grid>

              {formData.vehicle_info.has_vehicle && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        Vehicle Type
                      </InputLabel>
                      <Select
                        name="vehicle_info.vehicle_type"
                        value={formData.vehicle_info.vehicle_type}
                        label="Vehicle Type"
                        onChange={handleChange}
                        sx={selectStyles}
                      >
                        {VEHICLE_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="vehicle_info.vehicle_capacity"
                      label="Passenger/Animal Capacity"
                      type="number"
                      fullWidth
                      value={formData.vehicle_info.vehicle_capacity}
                      onChange={handleChange}
                      inputProps={{ min: 1, max: 20 }}
                      helperText="Number of animals/people your vehicle can transport"
                      sx={fieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="vehicle_info.has_trailer"
                          checked={formData.vehicle_info.has_trailer}
                          onChange={handleChange}
                          sx={{ color: customTheme.success }}
                        />
                      }
                      label="Has trailer for large animal transport"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="vehicle_info.four_wheel_drive"
                          checked={formData.vehicle_info.four_wheel_drive}
                          onChange={handleChange}
                          sx={{ color: customTheme.success }}
                        />
                      }
                      label="Four-wheel drive capability"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={['Winch', 'Ropes', 'First Aid Kit', 'Animal Carriers', 'Emergency Lighting']}
                      value={formData.vehicle_info.special_equipment}
                      onChange={(e, newValue) => {
                        setFormData(prev => ({
                          ...prev,
                          vehicle_info: {
                            ...prev.vehicle_info,
                            special_equipment: newValue
                          }
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Special Equipment"
                          placeholder="List any special rescue equipment in your vehicle"
                          sx={fieldStyles}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip 
                            label={option} 
                            {...getTagProps({ index })} 
                            key={index}
                            sx={{
                              bgcolor: alpha(customTheme.success, 0.15),
                              color: customTheme.primary,
                              fontWeight: 600
                            }}
                          />
                        ))
                      }
                    />
                  </Grid>
                </>
              )}

              {!formData.vehicle_info.has_vehicle && (
                <Grid item xs={12}>
                  <Alert 
                    severity="info"
                    sx={{
                      borderRadius: 3,
                      backgroundColor: alpha(customTheme.secondary, 0.1),
                      border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                      '& .MuiAlert-icon': {
                        color: customTheme.secondary
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      No vehicle? No problem!
                    </Typography>
                    You can still participate in rescue operations as:
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>On-site rescue support</li>
                      <li>Animal handling specialist</li>
                      <li>Medical support</li>
                      <li>Communications coordinator</li>
                    </ul>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        );

      case 3:
        return (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.grey, 0.15)} 100%)`,
              border: `2px solid ${alpha(customTheme.primary, 0.2)}`
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <ScheduleIcon />
              Availability & Contact Preferences
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: customTheme.primary, fontWeight: 700 }}>
                  When are you typically available for rescue calls?
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="availability_schedule.weekdays"
                          checked={formData.availability_schedule.weekdays}
                          onChange={handleChange}
                          sx={{ color: customTheme.primary }}
                        />
                      }
                      label="Weekdays (Mon-Fri)"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="availability_schedule.weekends"
                          checked={formData.availability_schedule.weekends}
                          onChange={handleChange}
                          sx={{ color: customTheme.primary }}
                        />
                      }
                      label="Weekends"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="availability_schedule.evenings"
                          checked={formData.availability_schedule.evenings}
                          onChange={handleChange}
                          sx={{ color: customTheme.primary }}
                        />
                      }
                      label="Evenings"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="availability_schedule.overnight"
                          checked={formData.availability_schedule.overnight}
                          onChange={handleChange}
                          sx={{ color: customTheme.accent }}
                        />
                      }
                      label="Overnight"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="availability_schedule.holidays"
                          checked={formData.availability_schedule.holidays}
                          onChange={handleChange}
                          sx={{ color: customTheme.accent }}
                        />
                      }
                      label="Holidays"
                      sx={{ color: customTheme.primary, fontWeight: 600 }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, color: customTheme.primary, fontWeight: 700 }}>
                  Contact Preferences
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  name="emergency_contact_phone"
                  label="Emergency Contact Phone"
                  fullWidth
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  helperText="Phone number for urgent rescue coordination"
                  sx={fieldStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>
                    Preferred Contact Method
                  </InputLabel>
                  <Select
                    name="preferred_contact_method"
                    value={formData.preferred_contact_method}
                    label="Preferred Contact Method"
                    onChange={handleChange}
                    sx={selectStyles}
                  >
                    <MenuItem value="APP">App Notification</MenuItem>
                    <MenuItem value="SMS">Text Message</MenuItem>
                    <MenuItem value="EMAIL">Email</MenuItem>
                    <MenuItem value="CALL">Phone Call</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="emergency_contact"
                  label="Emergency Contact Information"
                  fullWidth
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="Name and phone number of emergency contact"
                  helperText="Someone to contact if you're injured during rescue operations"
                  sx={fieldStyles}
                />
              </Grid>
            </Grid>
          </Paper>
        );

      default:
        return null;
    }
  };

  if (loading && !existingProfile) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={80} 
            thickness={3}
            sx={{ 
              color: customTheme.primary,
              animation: `${pulse} 2s infinite`,
              mb: 3
            }}
          />
          <Typography 
            variant="h4" 
            sx={{ 
              color: customTheme.primary, 
              fontWeight: 700,
              mb: 1
            }}
          >
            Loading Your Profile
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Please wait while we fetch your volunteer information...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
      py: 6,
      px: 2
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          animation: `${float} 10s ease-in-out infinite`,
          animationDelay: '0s',
          opacity: 0.6
        }}
      >
        <VolunteerIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.4
        }}
      >
        <PetsIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          animation: `${float} 14s ease-in-out infinite`,
          animationDelay: '4s',
          opacity: 0.5
        }}
      >
        <StarIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Performance Metrics */}
        {renderPerformanceMetrics()}

        {/* Hero Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Slide direction="down" in timeout={1000}>
              <Avatar
                sx={{
                  bgcolor: customTheme.primary,
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 4,
                  boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`,
                  animation: `${pulse} 3s infinite`
                }}
              >
                <VolunteerIcon sx={{ fontSize: 50 }} />
              </Avatar>
            </Slide>
            
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientShift} 4s ease infinite`,
                mb: 2,
                textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                letterSpacing: '-0.02em',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Volunteer Profile
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 400,
                lineHeight: 1.6,
                animation: `${slideInUp} 1s ease-out 0.3s both`,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Complete your profile to access emergency rescue assignments and specialized volunteer opportunities
            </Typography>
          </Box>
        </Fade>
        
        {error && (
          <Slide direction="down" in timeout={800}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: `2px solid #f44336`,
                backdropFilter: 'blur(10px)',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Alert>
          </Slide>
        )}
        
        {success && (
          <Slide direction="down" in timeout={800}>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: `2px solid ${customTheme.success}`,
                backdropFilter: 'blur(10px)',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                  color: customTheme.success
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Profile saved successfully! Redirecting to Volunteer Hub...
              </Typography>
            </Alert>
          </Slide>
        )}

        <Card
          sx={{
            borderRadius: 6,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
            boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.05)} 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.05)} 0%, transparent 50%)
              `,
              pointerEvents: 'none'
            }
          }}
        >
          <CardContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
            <form onSubmit={handleSubmit}>
              <Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 5 }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel sx={{
                      '& .MuiStepLabel-label': {
                        color: customTheme.primary,
                        fontWeight: 700,
                        fontSize: '1.2rem'
                      },
                      '& .MuiStepIcon-root': {
                        color: alpha(customTheme.primary, 0.3),
                        '&.Mui-active': {
                          color: customTheme.primary,
                        },
                        '&.Mui-completed': {
                          color: customTheme.success,
                        }
                      }
                    }}>
                      {label}
                    </StepLabel>
                    <StepContent>
                      {renderStepContent(index)}
                      
                      <Box sx={{ mt: 4, mb: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(activeStep + 1)}
                          sx={{ 
                            mr: 2,
                            background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${customTheme.success} 90%)`,
                            fontWeight: 700,
                            py: 1.5,
                            px: 3,
                            borderRadius: 3,
                            '&:hover': {
                              background: `linear-gradient(45deg, ${alpha(customTheme.secondary, 0.9)} 30%, ${alpha(customTheme.success, 0.9)} 90%)`,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.3)}`
                            }
                          }}
                          disabled={activeStep >= steps.length}
                        >
                          {activeStep === steps.length - 1 ? 'Complete' : 'Continue'}
                        </Button>
                        <Button
                          disabled={activeStep === 0}
                          onClick={() => setActiveStep(activeStep - 1)}
                          sx={{ 
                            mr: 1,
                            color: customTheme.primary,
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: alpha(customTheme.primary, 0.1)
                            }
                          }}
                        >
                          Back
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {activeStep === steps.length && (
                <Paper
                  elevation={0}
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.08)} 0%, ${alpha(customTheme.primary, 0.03)} 100%)`,
                    borderTop: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                    p: 5,
                    textAlign: 'center'
                  }}
                >
                  <CheckIcon sx={{ fontSize: 80, color: customTheme.success, mb: 3 }} />
                  <Typography variant="h4" gutterBottom sx={{ color: customTheme.primary, fontWeight: 800 }}>
                    Profile Complete!
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8), mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Ready to save lives? Your profile enables access to emergency rescue operations.
                  </Typography>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                    sx={{ 
                      minWidth: 200,
                      py: 3,
                      borderRadius: 4,
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      background: loading ? 
                        `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.primary, 0.2)} 90%)` :
                        `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                      boxShadow: !loading ? 
                        `0 8px 30px ${alpha(customTheme.accent, 0.4)}` : 
                        'none',
                      color: '#ffffff',
                      textTransform: 'none',
                      '&:hover:not(:disabled)': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 40px ${alpha(customTheme.accent, 0.5)}`
                      }
                    }}
                  >
                    {loading ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Save Profile')}
                  </Button>
                </Paper>
              )}
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default VolunteerProfileForm;