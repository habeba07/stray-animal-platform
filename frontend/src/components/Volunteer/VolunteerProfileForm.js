// Enhanced VolunteerProfileForm.js - Replace your existing file

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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Emergency as EmergencyIcon,
  DirectionsCar as CarIcon,
  Pets as PetsIcon,
  School as TrainingIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

// Enhanced predefined options
const SKILLS = [
  'Animal Handling', 'Dog Walking', 'Cat Socialization', 'Grooming', 
  'First Aid', 'Photography', 'Marketing', 'Social Media', 'Fundraising',
  'Event Planning', 'Administration', 'Transportation', 'Veterinary',
  'Training', 'Customer Service', 'Public Speaking', 'Cleaning',
  // NEW: Rescue-specific skills
  'Emergency Response', 'Large Animal Rescue', 'Water Rescue', 'Rope Rescue',
  'Animal Behavior Assessment', 'Crowd Control', 'Equipment Operation',
  'Radio Communications', 'Scene Management', 'Trauma Response'
];

const INTERESTS = [
  'Dog Care', 'Cat Care', 'Small Animals', 'Wildlife', 'Adoption Events',
  'Fundraising', 'Community Outreach', 'Education', 'Administrative',
  'Facility Maintenance', 'Transportation', 'Foster Care',
  // NEW: Rescue-specific interests
  'Emergency Response', 'Search and Rescue', 'Disaster Relief', 
  'Large Animal Rescue', 'Wildlife Rehabilitation', 'Medical Support'
];

const ANIMAL_TYPES = [
  'Dogs', 'Cats', 'Small Animals', 'Birds', 'Reptiles', 'Farm Animals', 
  'Wildlife', 'Horses', 'Livestock', 'Exotic Animals'
];

// NEW: Rescue specializations
const RESCUE_SPECIALIZATIONS = [
  'Urban Rescue', 'Rural Rescue', 'Water Rescue', 'High-Angle Rescue',
  'Confined Space', 'Vehicle Extrication', 'Large Animal', 'Wildlife',
  'Disaster Response', 'Medical Support', 'Communications', 'Logistics'
];

// NEW: Vehicle types
const VEHICLE_TYPES = [
  'Sedan', 'SUV', 'Pickup Truck', 'Van', 'Trailer', 'Motorcycle', 
  '4WD Vehicle', 'Emergency Vehicle', 'Boat', 'ATV'
];

function EnhancedVolunteerProfileForm() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [userStats, setUserStats] = useState(null);
  
  const [formData, setFormData] = useState({
    // Basic volunteer info
    skills: [],
    interests: [],
    availability: '',
    experience_level: '',
    has_animal_handling: false,
    has_transportation: false,
    preferred_animals: [],
    bio: '',
    emergency_contact: '',
    
    // Enhanced rescue fields
    max_rescue_distance_km: 10,
    available_for_emergency: false,
    rescue_experience_level: 'NONE',
    gps_tracking_consent: false,
    emergency_contact_phone: '',
    preferred_contact_method: 'APP',
    
    // NEW: Advanced rescue capabilities
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
      
      // Fetch existing profile
      try {
        const response = await api.get('/volunteer-profiles/my_profile/');
        setExistingProfile(response.data);
        setFormData({
          ...response.data,
          // Ensure new fields have defaults
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
      
      // Fetch user statistics
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

  const renderPerformanceMetrics = () => {
    if (!userStats) return null;

    return (
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ mr: 1 }} />
            🏆 Your Rescue Performance
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {userStats.total_points || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Points
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {userStats.user_profile?.total_rescues_completed || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Rescues Completed
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {userStats.user_profile?.average_response_time_minutes ? 
                    `${Math.round(userStats.user_profile.average_response_time_minutes)}m` : 'N/A'
                  }
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Avg Response Time
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {userStats.leaderboard_position?.rescue_rank || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Community Rank
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {userStats.recent_achievements?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                Recent Achievements:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {userStats.recent_achievements.slice(0, 3).map((achievement, index) => (
                  <Chip
                    key={index}
                    label={achievement.name}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
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
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} key={index} />
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
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} key={index} />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Availability</InputLabel>
                <Select
                  name="availability"
                  value={formData.availability}
                  label="Availability"
                  onChange={handleChange}
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
                <InputLabel>Experience Level</InputLabel>
                <Select
                  name="experience_level"
                  value={formData.experience_level}
                  label="Experience Level"
                  onChange={handleChange}
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
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} key={index} />
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
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  🚨 Emergency Rescue Settings
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
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Rescue Experience Level</InputLabel>
                <Select
                  name="rescue_experience_level"
                  value={formData.rescue_experience_level}
                  label="Rescue Experience Level"
                  onChange={handleChange}
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
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                🎯 Rescue Specializations
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
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} key={index} color="primary" />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                💪 Physical Capabilities
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="physical_capabilities.can_lift_50lbs"
                        checked={formData.physical_capabilities.can_lift_50lbs}
                        onChange={handleChange}
                      />
                    }
                    label="Can lift 50+ lbs"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="physical_capabilities.comfortable_heights"
                        checked={formData.physical_capabilities.comfortable_heights}
                        onChange={handleChange}
                      />
                    }
                    label="Comfortable with heights"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="physical_capabilities.comfortable_water"
                        checked={formData.physical_capabilities.comfortable_water}
                        onChange={handleChange}
                      />
                    }
                    label="Comfortable in/around water"
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
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="has_animal_handling"
                    checked={formData.has_animal_handling}
                    onChange={handleChange}
                  />
                }
                label="✅ I have experience handling animals safely"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="available_for_emergency"
                    checked={formData.available_for_emergency}
                    onChange={handleChange}
                  />
                }
                label="🚨 Available for emergency rescue calls (high priority alerts)"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="gps_tracking_consent"
                    checked={formData.gps_tracking_consent}
                    onChange={handleChange}
                  />
                }
                label="📍 I consent to GPS tracking during rescue operations (required for rescue assignments)"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CarIcon sx={{ mr: 1 }} />
                🚗 Vehicle Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="vehicle_info.has_vehicle"
                    checked={formData.vehicle_info.has_vehicle}
                    onChange={handleChange}
                  />
                }
                label="I have my own vehicle for rescue operations"
              />
            </Grid>

            {formData.vehicle_info.has_vehicle && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select
                      name="vehicle_info.vehicle_type"
                      value={formData.vehicle_info.vehicle_type}
                      label="Vehicle Type"
                      onChange={handleChange}
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
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="vehicle_info.has_trailer"
                        checked={formData.vehicle_info.has_trailer}
                        onChange={handleChange}
                      />
                    }
                    label="Has trailer for large animal transport"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="vehicle_info.four_wheel_drive"
                        checked={formData.vehicle_info.four_wheel_drive}
                        onChange={handleChange}
                      />
                    }
                    label="Four-wheel drive capability"
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
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} key={index} />
                      ))
                    }
                  />
                </Grid>
              </>
            )}

            {!formData.vehicle_info.has_vehicle && (
              <Grid item xs={12}>
                <Alert severity="info">
                  No vehicle? No problem! You can still participate in rescue operations as:
                  <ul>
                    <li>On-site rescue support</li>
                    <li>Animal handling specialist</li>
                    <li>Medical support</li>
                    <li>Communications coordinator</li>
                  </ul>
                </Alert>
              </Grid>
            )}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TimerIcon sx={{ mr: 1 }} />
                ⏰ Detailed Availability
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
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
                      />
                    }
                    label="Weekdays (Mon-Fri)"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="availability_schedule.weekends"
                        checked={formData.availability_schedule.weekends}
                        onChange={handleChange}
                      />
                    }
                    label="Weekends"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="availability_schedule.evenings"
                        checked={formData.availability_schedule.evenings}
                        onChange={handleChange}
                      />
                    }
                    label="Evenings"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="availability_schedule.overnight"
                        checked={formData.availability_schedule.overnight}
                        onChange={handleChange}
                      />
                    }
                    label="Overnight"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="availability_schedule.holidays"
                        checked={formData.availability_schedule.holidays}
                        onChange={handleChange}
                      />
                    }
                    label="Holidays"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <PhoneIcon sx={{ mr: 1 }} />
                📞 Contact Preferences
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  name="preferred_contact_method"
                  value={formData.preferred_contact_method}
                  label="Preferred Contact Method"
                  onChange={handleChange}
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
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (loading && !existingProfile) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Performance Metrics */}
      {renderPerformanceMetrics()}

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          textAlign: 'center',
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3
        }}>
          🚑 Enhanced Volunteer Profile
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          Complete your profile to access emergency rescue assignments and specialized volunteer opportunities
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile saved successfully! Redirecting to Volunteer Hub...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  <Typography variant="h6">{label}</Typography>
                </StepLabel>
                <StepContent>
                  {renderStepContent(index)}
                  
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(activeStep + 1)}
                      sx={{ mr: 1 }}
                      disabled={activeStep >= steps.length}
                    >
                      {activeStep === steps.length - 1 ? 'Complete' : 'Continue'}
                    </Button>
                    <Button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(activeStep - 1)}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                🎉 Profile Complete!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Ready to save lives? Your enhanced profile enables access to emergency rescue operations.
              </Typography>
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  minWidth: 200,
                  background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #388e3c 30%, #689f38 90%)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : (existingProfile ? 'Update Profile' : 'Save Profile')}
              </Button>
            </Box>
          )}
        </form>
      </Paper>
    </Container>
  );
}

export default EnhancedVolunteerProfileForm;