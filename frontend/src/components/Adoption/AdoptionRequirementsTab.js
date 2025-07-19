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
  Card,
  CardContent,
  Avatar,
  Stack,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  Save as SaveIcon,
  Pets as PetsIcon,
  Psychology as BehaviorIcon,
  Home as HomeIcon,
  LocalHospital as HealthIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  CheckCircle as CheckIcon,
  Create as CreateIcon,
  Update as UpdateIcon,
  AutoAwesome as SparkleIcon,
  EmojiObjects as IdeaIcon,
  Group as GroupIcon,
  School as TrainingIcon,
  ChildCare as ChildrenIcon,
  Person as PersonIcon,
  Link as LeashIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { keyframes } from '@mui/system';
import api from '../../redux/api';

const customTheme = {
  primary: '#8d6e63',     // Warm Brown
  secondary: '#81c784',   // Soft Green
  success: '#4caf50',     // Fresh Green
  warning: '#ff9800',
  error: '#f44336',
  grey: '#f3e5ab',        // Warm Cream
  accent: '#ff8a65',      // Gentle Orange
  background: '#fff8e1',  // Soft Cream
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

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

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
    { value: 'LOW', label: 'Low Energy', color: '#4caf50' },
    { value: 'MEDIUM', label: 'Medium Energy', color: '#ff9800' },
    { value: 'HIGH', label: 'High Energy', color: '#f44336' },
    { value: 'VERY_HIGH', label: 'Very High Energy', color: '#9c27b0' },
  ];

  const temperamentChoices = [
    { value: 'CALM', label: 'Calm', color: '#4caf50' },
    { value: 'PLAYFUL', label: 'Playful', color: '#2196f3' },
    { value: 'INDEPENDENT', label: 'Independent', color: '#9c27b0' },
    { value: 'AFFECTIONATE', label: 'Affectionate', color: '#e91e63' },
    { value: 'PROTECTIVE', label: 'Protective', color: '#ff5722' },
    { value: 'SHY', label: 'Shy', color: '#607d8b' },
    { value: 'ANXIOUS', label: 'Anxious', color: '#795548' },
  ];

  const trainingLevelChoices = [
    { value: 'NONE', label: 'No Training', color: '#f44336' },
    { value: 'BASIC', label: 'Basic Commands', color: '#ff9800' },
    { value: 'INTERMEDIATE', label: 'Well Trained', color: '#4caf50' },
    { value: 'ADVANCED', label: 'Extensively Trained', color: '#2196f3' },
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

  // Enhanced field styles
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
      '&.MuiInputLabel-shrink': {
        fontSize: '0.85rem',
        transform: 'translate(14px, -9px) scale(0.85)',
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
    minHeight: 65,
    width: '100%',
    '& .MuiSelect-select': {
      padding: '18px 14px',
      minHeight: '24px',
      overflow: 'visible',
      textOverflow: 'clip',  
      whiteSpace: 'nowrap',
      minWidth: '120px',          
    },

    '& .MuiOutlinedInput-root': { 
    overflow: 'visible',
    },

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

  const selectMenuProps = {
    PaperProps: {
      sx: {
        maxHeight: 300,
        zIndex: 9999,
        '& .MuiMenuItem-root': {
          padding: '12px 16px',
          minHeight: 'auto',
        }
      }
    },
    MenuListProps: {
      sx: {
        padding: '8px 0',
      }
    }
  };

  // Check if user has permission to edit
  const canEdit = user && (user.user_type === 'STAFF' || user.user_type === 'SHELTER' || user.is_staff);

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '60vh',
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
        {/* Floating Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            animation: `${float} 6s ease-in-out infinite`,
            animationDelay: '0s'
          }}
        >
          <PetsIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '2s'
          }}
        >
          <FavoriteIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
        </Box>
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <CircularProgress 
              size={80} 
              thickness={3}
              sx={{ 
                color: customTheme.primary,
                animation: `${pulse} 2s infinite`
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `${sparkle} 2s infinite`
              }}
            >
              <StarIcon sx={{ color: customTheme.accent, fontSize: 30 }} />
            </Box>
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              color: customTheme.primary, 
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Loading Requirements Profile
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Analyzing behavioral data...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!canEdit) {
    return (
      <Box sx={{ 
        minHeight: '60vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.15)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.15)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
        `,
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 6,
              background: `
                radial-gradient(circle at center, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                linear-gradient(135deg, ${alpha(customTheme.accent, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
              `,
              border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
              maxWidth: 500
            }}
          >
            <Avatar
              sx={{
                bgcolor: customTheme.accent,
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`,
              }}
            >
              <BehaviorIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" sx={{ color: customTheme.accent, fontWeight: 700, mb: 2 }}>
              Staff Access Required
            </Typography>
            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 500 }}>
              You don't have permission to manage adoption requirements. Only shelter staff can access this feature.
            </Typography>
          </Paper>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.15)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.15)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.2)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '12%',
          left: '8%',
          animation: `${float} 10s ease-in-out infinite`,
          animationDelay: '0s',
          opacity: 0.6,
          zIndex: 0
        }}
      >
        <BehaviorIcon sx={{ fontSize: 35, color: customTheme.secondary, filter: 'blur(1px)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '12%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.4,
          zIndex: 0
        }}
      >
        <HomeIcon sx={{ fontSize: 45, color: customTheme.accent, transform: 'rotate(25deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          animation: `${float} 14s ease-in-out infinite`,
          animationDelay: '4s',
          opacity: 0.5,
          zIndex: 0
        }}
      >
        <StarIcon sx={{ fontSize: 30, color: customTheme.primary, transform: 'rotate(-15deg)' }} />
      </Box>

      {/* Header Section */}
      <Fade in timeout={800}>
        <Box sx={{ 
          textAlign: 'center', 
          mb: 5, 
          position: 'relative', 
          zIndex: 1,
          px: { xs: 2, sm: 3 }
        }}>
          {/* Floating sparkles */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              left: '40%',
              animation: `${sparkle} 3s infinite`,
              animationDelay: '0s',
              zIndex: 0
            }}
          >
            <StarIcon sx={{ color: customTheme.accent, fontSize: 18 }} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: -5,
              right: '35%',
              animation: `${sparkle} 3s infinite`,
              animationDelay: '1.5s',
              zIndex: 0
            }}
          >
            <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 14 }} />
          </Box>
          
          <Slide direction="down" in timeout={1000}>
            <Avatar
              sx={{
                bgcolor: customTheme.primary,
                width: 70,
                height: 70,
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                animation: `${pulse} 3s infinite`
              }}
            >
              <BehaviorIcon sx={{ fontSize: 35 }} />
            </Avatar>
          </Slide>
          
          <Typography 
            variant="h3" 
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
              letterSpacing: '-0.02em'
            }}
          >
            Adoption Requirements
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: alpha(customTheme.primary, 0.8),
              fontWeight: 400,
              lineHeight: 1.6,
              animation: `${slideInUp} 1s ease-out 0.3s both`
            }}
          >
            Set behavioral and compatibility requirements for {animal?.name || 'this animal'}
          </Typography>
        </Box>
      </Fade>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {/* Success/Error Messages */}
        {error && (
          <Slide direction="down" in timeout={600}>
            <Box sx={{ mb: 3, mx: { xs: 1, sm: 0 } }}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: `2px solid ${customTheme.error}`,
                  backdropFilter: 'blur(10px)',
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {error}
                </Typography>
              </Alert>
            </Box>
          </Slide>
        )}

        {success && (
          <Slide direction="down" in timeout={600}>
            <Box sx={{ mb: 3, mx: { xs: 1, sm: 0 } }}>
              <Alert 
                severity="success" 
                sx={{ 
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: `2px solid ${customTheme.success}`,
                  backdropFilter: 'blur(10px)',
                  '& .MuiAlert-icon': {
                    fontSize: '1.5rem',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {success}
                </Typography>
              </Alert>
            </Box>
          </Slide>
        )}

        <Grid container spacing={4} sx={{ 
          position: 'relative', 
          zIndex: 1,
          maxWidth: '100%',
          mx: 'auto',
          px: { xs: 1, sm: 2 }
        }}>
          {/* Behavioral Characteristics */}
          <Grid item xs={12}>
            <Slide direction="right" in timeout={1000}>
              <Card
                sx={{
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  zIndex: 1,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.primary, 0.2)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.primary,
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 700,
                      mb: 1
                    }}>
                      Behavioral Characteristics
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500
                    }}>
                      Define the animal's core behavioral traits
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth sx={{ minWidth: 200 }}>
                        <InputLabel
                          sx={{
                            color: customTheme.primary,
                            fontWeight: 600,
                            '&.Mui-focused': { color: customTheme.primary },
                          }}
                        >
                          Energy Level
                        </InputLabel>
                        <Select
                          name="energy_level"
                          value={formData.energy_level}
                          onChange={handleChange}
                          sx={selectStyles}
                          MenuProps={selectMenuProps}
                        >
                          {energyLevelChoices.map((choice) => (
                            <MenuItem key={choice.value} value={choice.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: choice.color
                                  }}
                                />
                                {choice.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                     <FormControl fullWidth sx={{ minWidth: 200 }}>
                        <InputLabel
                          sx={{
                            color: customTheme.primary,
                            fontWeight: 600,
                            '&.Mui-focused': { color: customTheme.primary },
                          }}
                        >
                          Temperament
                        </InputLabel>
                        <Select
                          name="temperament"
                          value={formData.temperament}
                          onChange={handleChange}
                          sx={selectStyles}
                          MenuProps={selectMenuProps}
                        >
                          {temperamentChoices.map((choice) => (
                            <MenuItem key={choice.value} value={choice.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: choice.color
                                  }}
                                />
                                {choice.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                   <Grid item xs={12} md={4}>
                      <FormControl fullWidth sx={{ minWidth: 200 }}>
                        <InputLabel
                          sx={{
                            color: customTheme.primary,
                            fontWeight: 600,
                            '&.Mui-focused': { color: customTheme.primary },
                          }}
                        >
                          Training Level
                        </InputLabel>
                        <Select
                          name="training_level"
                          value={formData.training_level}
                          onChange={handleChange}
                          sx={selectStyles}
                          MenuProps={selectMenuProps}
                        >
                          {trainingLevelChoices.map((choice) => (
                            <MenuItem key={choice.value} value={choice.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: choice.color
                                  }}
                                />
                                {choice.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Social Compatibility */}
          <Grid item xs={12}>
            <Slide direction="left" in timeout={1200}>
              <Card
                sx={{
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.secondary, 0.15)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.secondary, 0.2)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.secondary,
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`,
                      }}
                    >
                      <GroupIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 700,
                      mb: 1
                    }}>
                      Social Compatibility
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500
                    }}>
                      Assess compatibility with family members and other pets
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    {[
                      { name: 'good_with_children', label: 'Good with Children', icon: <ChildrenIcon /> },
                      { name: 'good_with_dogs', label: 'Good with Dogs', icon: <PetsIcon /> },
                      { name: 'good_with_cats', label: 'Good with Cats', icon: <PetsIcon /> },
                      { name: 'good_with_strangers', label: 'Good with Strangers', icon: <GroupIcon /> }
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} md={3} key={item.name}>
                        <Zoom in timeout={300 * (index + 1)}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 4,
                              textAlign: 'center',
                              background: formData[item.name] 
                                ? `linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`
                                : `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.grey, 0.1)} 100%)`,
                              border: formData[item.name] 
                                ? `2px solid ${customTheme.success}`
                                : `2px solid ${alpha(customTheme.primary, 0.2)}`,
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 30px ${alpha(customTheme.secondary, 0.2)}`
                              }
                            }}
                            onClick={() => handleChange({ 
                              target: { 
                                name: item.name, 
                                type: 'checkbox', 
                                checked: !formData[item.name] 
                              } 
                            })}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mb: 1,
                              color: formData[item.name] ? customTheme.success : customTheme.secondary
                            }}>
                              {React.cloneElement(item.icon, { sx: { fontSize: 32 } })}
                            </Box>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name={item.name}
                                  checked={formData[item.name]}
                                  onChange={handleChange}
                                  sx={{
                                    color: customTheme.secondary,
                                    '&.Mui-checked': {
                                      color: customTheme.success,
                                    },
                                  }}
                                />
                              }
                              label={
                                <Typography variant="body1" sx={{ 
                                  fontWeight: 600,
                                  color: customTheme.primary
                                }}>
                                  {item.label}
                                </Typography>
                              }
                              sx={{ 
                                '& .MuiFormControlLabel-label': {
                                  fontSize: '0.9rem'
                                }
                              }}
                            />
                          </Paper>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Training & Habits */}
          <Grid item xs={12}>
            <Slide direction="right" in timeout={1400}>
              <Card
                sx={{
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.accent, 0.15)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.accent, 0.2)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.accent,
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`,
                      }}
                    >
                      <TrainingIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 700,
                      mb: 1
                    }}>
                      Training & Habits
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500
                    }}>
                      Current training status and behavioral habits
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={4}>
                    {[
                      { name: 'house_trained', label: 'House Trained', icon: <HomeIcon /> },
                      { name: 'leash_trained', label: 'Leash Trained', icon: <LeashIcon /> }
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} key={item.name}>
                        <Zoom in timeout={400 * (index + 1)}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 4,
                              borderRadius: 4,
                              textAlign: 'center',
                              background: formData[item.name] 
                                ? `linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`
                                : `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.grey, 0.1)} 100%)`,
                              border: formData[item.name] 
                                ? `2px solid ${customTheme.success}`
                                : `2px solid ${alpha(customTheme.primary, 0.2)}`,
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 30px ${alpha(customTheme.accent, 0.2)}`
                              }
                            }}
                            onClick={() => handleChange({ 
                              target: { 
                                name: item.name, 
                                type: 'checkbox', 
                                checked: !formData[item.name] 
                              } 
                            })}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              mb: 2,
                              color: formData[item.name] ? customTheme.success : customTheme.accent
                            }}>
                              {React.cloneElement(item.icon, { sx: { fontSize: 48 } })}
                            </Box>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name={item.name}
                                  checked={formData[item.name]}
                                  onChange={handleChange}
                                  sx={{
                                    color: customTheme.accent,
                                    '&.Mui-checked': {
                                      color: customTheme.success,
                                    },
                                  }}
                                />
                              }
                              label={
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 600,
                                  color: customTheme.primary
                                }}>
                                  {item.label}
                                </Typography>
                              }
                            />
                          </Paper>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Special Needs & Notes */}
          <Grid item xs={12}>
            <Slide direction="left" in timeout={1600}>
              <Card
                sx={{
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.grey, 0.4)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.1)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.primary, 0.15)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: customTheme.warning,
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 8px 25px ${alpha(customTheme.warning, 0.4)}`,
                      }}
                    >
                      <IdeaIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 700,
                      mb: 1
                    }}>
                      Special Considerations & Notes
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500
                    }}>
                      Additional requirements and important information
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
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
                        sx={{
                          ...fieldStyles,
                          '& .MuiFormHelperText-root': {
                            color: alpha(customTheme.primary, 0.7),
                            fontWeight: 500
                          }
                        }}
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
                        sx={fieldStyles}
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
                        sx={fieldStyles}
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
                        sx={fieldStyles}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Slide direction="up" in timeout={1800}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                  p: 4
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {behaviorProfile && (
                      <Chip 
                        icon={<CheckIcon />}
                        label="Profile Exists" 
                        sx={{
                          backgroundColor: alpha(customTheme.success, 0.15),
                          color: customTheme.success,
                          fontWeight: 600,
                          border: `1px solid ${customTheme.success}`
                        }}
                      />
                    )}
                    {formData.energy_level && (
                      <Chip 
                        label={`Energy: ${energyLevelChoices.find(c => c.value === formData.energy_level)?.label}`}
                        sx={{
                          backgroundColor: alpha(customTheme.primary, 0.1),
                          color: customTheme.primary,
                          fontWeight: 500,
                          border: `1px solid ${alpha(customTheme.primary, 0.3)}`
                        }}
                      />
                    )}
                    {formData.temperament && (
                      <Chip 
                        label={`Temperament: ${temperamentChoices.find(c => c.value === formData.temperament)?.label}`}
                        sx={{
                          backgroundColor: alpha(customTheme.secondary, 0.1),
                          color: customTheme.secondary,
                          fontWeight: 500,
                          border: `1px solid ${alpha(customTheme.secondary, 0.3)}`
                        }}
                      />
                    )}
                  </Box>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : (behaviorProfile ? <UpdateIcon /> : <CreateIcon />)}
                    sx={{
                      py: 2.5,
                      px: 4,
                      borderRadius: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: saving ? 
                        `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.primary, 0.2)} 90%)` :
                        `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                      boxShadow: !saving ? 
                        `0 8px 30px ${alpha(customTheme.primary, 0.4)}` : 
                        'none',
                      color: '#ffffff',
                      textTransform: 'none',
                      minWidth: 220,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                        transition: 'left 0.6s ease',
                      },
                      '&:hover:not(:disabled)': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 40px ${alpha(customTheme.primary, 0.5)}`,
                        '&::before': {
                          left: '100%'
                        }
                      },
                      '&:disabled': {
                        color: alpha('#ffffff', 0.6),
                      }
                    }}
                  >
                    {saving ? 'Saving...' : (behaviorProfile ? 'Update Requirements' : 'Create Requirements')}
                  </Button>
                </Box>
              </Paper>
            </Slide>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export default AdoptionRequirementsTab;