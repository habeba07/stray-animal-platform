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
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Slide,
  alpha,
  useTheme,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSelector } from 'react-redux';
import { keyframes } from '@mui/system';
import api from '../../redux/api';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63', // Warm Brown
  secondary: '#81c784', // Soft Green
  success: '#4caf50', // Fresh Green
  grey: '#f3e5ab', // Warm Cream
  accent: '#ff8a65', // Gentle Orange
  background: '#fff8e1', // Soft Cream
};

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const slideInFromLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInFromRight = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const steps = ['Housing Info', 'Household', 'Pet Experience', 'Preferences'];

function AdopterProfileForm() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
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

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={600}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <HomeIcon sx={{ color: customTheme.primary, fontSize: 32 }} />
                  <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                    Housing Information
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel 
                    sx={{ 
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.primary }
                    }}
                  >
                    Housing Type
                  </InputLabel>
                  <Select
                    name="housing_type"
                    value={formData.housing_type}
                    onChange={handleChange}
                    required
                    sx={{
                      minWidth: 250,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.primary
                      }
                    }}
                  >
                    <MenuItem value="HOUSE">House</MenuItem>
                    <MenuItem value="APARTMENT">Apartment</MenuItem>
                    <MenuItem value="CONDO">Condo</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                    border: `1px solid ${alpha(customTheme.primary, 0.2)}`,
                    borderRadius: 2
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="has_yard"
                        checked={formData.has_yard}
                        onChange={handleChange}
                        sx={{
                          color: customTheme.primary,
                          '&.Mui-checked': { color: customTheme.primary }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                        Has Yard
                      </Typography>
                    }
                  />
                </Paper>
              </Grid>

              {formData.has_yard && (
                <Grid item xs={12} sm={6}>
                  <Slide direction="right" in={formData.has_yard} timeout={500}>
                    <FormControl fullWidth>
                      <InputLabel 
                        sx={{ 
                          color: customTheme.primary,
                          '&.Mui-focused': { color: customTheme.secondary }
                        }}
                      >
                        Yard Size
                      </InputLabel>
                      <Select
                        name="yard_size"
                        value={formData.yard_size}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(customTheme.secondary, 0.3),
                            borderWidth: 2
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.secondary
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.secondary
                          }
                        }}
                      >
                        <MenuItem value="SMALL">Small Yard</MenuItem>
                        <MenuItem value="MEDIUM">Medium Yard</MenuItem>
                        <MenuItem value="LARGE">Large Yard</MenuItem>
                      </Select>
                    </FormControl>
                  </Slide>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                    border: `1px solid ${alpha(customTheme.accent, 0.2)}`,
                    borderRadius: 2
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="rent_permission"
                        checked={formData.rent_permission}
                        onChange={handleChange}
                        sx={{
                          color: customTheme.accent,
                          '&.Mui-checked': { color: customTheme.accent }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                        Have Landlord Permission (if renting)
                      </Typography>
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={600}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <FamilyRestroomIcon sx={{ color: customTheme.secondary, fontSize: 32 }} />
                  <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                    Household Information
                  </Typography>
                </Box>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.secondary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.secondary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.secondary
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.secondary }
                    }
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.secondary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.secondary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.secondary
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.secondary }
                    }
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.secondary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.secondary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.secondary
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.secondary }
                    }
                  }}
                />
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
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.accent, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.accent
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.accent
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.accent }
                    }
                  }}
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
                  sx={{
                    minWidth: 250,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.accent, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.accent
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.accent
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.accent }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="budget_for_pet"
                  label="Monthly Budget for Pet Care"
                  fullWidth
                  value={formData.budget_for_pet}
                  onChange={handleChange}
                  required
                  placeholder="e.g., $100-200 per month"
                  sx={{
                    minWidth: 250,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.success, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.success
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.success
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.success }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={600}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <PetsIcon sx={{ color: customTheme.accent, fontSize: 32 }} />
                  <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                    Pet Experience
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel 
                    sx={{ 
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.accent }
                    }}
                  >
                    Pet Experience Level
                  </InputLabel>
                  <Select
                    name="pet_experience"
                    value={formData.pet_experience}
                    onChange={handleChange}
                    required
                    sx={{
                      minWidth: 250,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(customTheme.accent, 0.3),
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.accent
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.accent
                      }
                    }}
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
                  <InputLabel 
                    sx={{ 
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.secondary }
                    }}
                  >
                    Activity Level
                  </InputLabel>
                  <Select
                    name="activity_level"
                    value={formData.activity_level}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(customTheme.secondary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.secondary
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.secondary
                      }
                    }}
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
                  rows={3}
                  value={formData.current_pets}
                  onChange={handleChange}
                  placeholder="Describe any current pets"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.primary }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="previous_pets"
                  label="Previous Pets"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.previous_pets}
                  onChange={handleChange}
                  placeholder="Describe any previous pets"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.primary, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.primary
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.primary
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.primary }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Fade>
        );

      case 3:
        return (
          <Fade in timeout={600}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <FavoriteIcon sx={{ color: customTheme.success, fontSize: 32 }} />
                  <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                    Pet Preferences
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel 
                    sx={{ 
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.success }
                    }}
                  >
                    Preferred Animal Type
                  </InputLabel>
                  <Select
                    name="preferred_animal_type"
                    value={formData.preferred_animal_type}
                    onChange={handleChange}
                    sx={{
                      minWidth: 250,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(customTheme.success, 0.3),
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.success
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.success
                      }
                    }}
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
                  <InputLabel 
                    sx={{ 
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.success }
                    }}
                  >
                    Preferred Gender
                  </InputLabel>
                  <Select
                    name="preferred_gender"
                    value={formData.preferred_gender}
                    onChange={handleChange}
                    sx={{
                      minWidth: 250,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(customTheme.success, 0.3),
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.success
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customTheme.success
                      }
                    }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.accent, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.accent
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.accent
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.accent }
                    }
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(customTheme.accent, 0.3),
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: customTheme.accent
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: customTheme.accent
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: customTheme.primary,
                      '&.Mui-focused': { color: customTheme.accent }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                    border: `1px solid ${alpha(customTheme.success, 0.2)}`,
                    borderRadius: 3
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="willing_to_train"
                        checked={formData.willing_to_train}
                        onChange={handleChange}
                        sx={{
                          color: customTheme.success,
                          '&.Mui-checked': { color: customTheme.success }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                        Willing to Train
                      </Typography>
                    }
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                    border: `1px solid ${alpha(customTheme.secondary, 0.2)}`,
                    borderRadius: 3
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="special_needs_capable"
                        checked={formData.special_needs_capable}
                        onChange={handleChange}
                        sx={{
                          color: customTheme.secondary,
                          '&.Mui-checked': { color: customTheme.secondary }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                        Can Handle Special Needs Pets
                      </Typography>
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
      `,
      py: 4
    }}>
      {/* Floating Background Elements */}
      <Box
        sx={{
          position: 'fixed',
          top: '10%',
          right: '5%',
          animation: `${float} 8s ease-in-out infinite`,
          opacity: 0.4,
          zIndex: 0
        }}
      >
        <PetsIcon sx={{ fontSize: 60, color: customTheme.primary, transform: 'rotate(15deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: '15%',
          left: '3%',
          animation: `${float} 10s ease-in-out infinite`,
          opacity: 0.3,
          zIndex: 0
        }}
      >
        <FavoriteIcon sx={{ fontSize: 40, color: customTheme.accent, transform: 'rotate(-20deg)' }} />
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Adopter Profile
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Help us find your perfect companion by sharing some information about your lifestyle and preferences
            </Typography>
          </Box>
        </Fade>

        {/* Stepper */}
        <Slide direction="down" in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${alpha(customTheme.background, 0.8)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)`,
              border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-iconContainer': {
                        '& .MuiStepIcon-root': {
                          color: alpha(customTheme.primary, 0.3),
                          fontSize: '2rem',
                          '&.Mui-active': {
                            color: customTheme.primary
                          },
                          '&.Mui-completed': {
                            color: customTheme.success
                          }
                        }
                      },
                      '& .MuiStepLabel-label': {
                        color: customTheme.primary,
                        fontWeight: 600,
                        '&.Mui-active': {
                          color: customTheme.primary,
                          fontWeight: 700
                        },
                        '&.Mui-completed': {
                          color: customTheme.success,
                          fontWeight: 700
                        }
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Slide>

        {/* Main Form Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Progress bar at top */}
          <Box
            sx={{
              height: 6,
              background: `linear-gradient(90deg, ${customTheme.success} 0%, ${customTheme.success} ${((activeStep + 1) / steps.length) * 100}%, ${alpha(customTheme.grey, 0.3)} ${((activeStep + 1) / steps.length) * 100}%, ${alpha(customTheme.grey, 0.3)} 100%)`,
              transition: 'all 0.5s ease'
            }}
          />

          <CardContent sx={{ p: 4 }}>
            {/* Error Alert */}
            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha('#f44336', 0.3)}`
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}
            
            {/* Success Alert */}
            {success && (
              <Fade in>
                <Alert 
                  severity="success" 
                  icon={<CheckCircleIcon />}
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(customTheme.success, 0.3)}`,
                    backgroundColor: alpha(customTheme.success, 0.1)
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Profile saved successfully! Redirecting to matches...
                  </Typography>
                </Alert>
              </Fade>
            )}

            {/* Form Content */}
            <form onSubmit={(e) => e.preventDefault()}>
              <Box sx={{ mb: 4 }}>
                {getStepContent(activeStep)}
              </Box>

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    borderColor: customTheme.primary,
                    color: customTheme.primary,
                    borderWidth: 2,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: customTheme.primary,
                      backgroundColor: alpha(customTheme.primary, 0.05)
                    },
                    '&:disabled': {
                      borderColor: alpha(customTheme.primary, 0.3),
                      color: alpha(customTheme.primary, 0.3)
                    }
                  }}
                >
                  Back
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    sx={{
                      background: `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                      color: '#ffffff',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      minWidth: 150,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${customTheme.success} 90%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                    ) : (
                      existingProfile ? 'Update Profile' : 'Create Profile'
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    variant="contained"
                    sx={{
                      background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                      color: '#ffffff',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.primary} 90%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default AdopterProfileForm;