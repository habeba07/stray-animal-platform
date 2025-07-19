import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../redux/api';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Avatar,
  Fade,
  Divider,
  Paper,
  Card,
  CardContent,
  Slide,
  Zoom,
  alpha,
  Chip,
  LinearProgress,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import {
  Report as ReportIcon,
  Pets as PetsIcon,
  LocationOn as LocationIcon,
  PhotoCamera as PhotoIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CloudUpload as UploadIcon,
  Map as MapIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Fix for Leaflet marker icon
const customIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="#8d6e63" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// LocationMarker component to handle map clicks and location updates
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

function ReportFormPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [position, setPosition] = useState(null);
  const [geoLocationError, setGeoLocationError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    animal_type: 'DOG',
    other_animal_type: '', // Add field for "other" animal specification
    gender: 'UNKNOWN',
    color: '',
    description: '',
    animal_condition: '',
    location_details: '',
  });

  useEffect(() => {
    // No redirect - allow anonymous reporting
    if (!user) {
      console.log('Anonymous user - reporting allowed');
    } else {
      console.log('Logged-in user - will get points for reporting');
    }
  }, [user, navigate]);

  // Get current location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setGeoLocationError(`Error getting location: ${error.message}`);
        }
      );
    } else {
      setGeoLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Clear other_animal_type when changing away from "OTHER"
      if (name === 'animal_type' && value !== 'OTHER') {
        newData.other_animal_type = '';
      }
      
      return newData;
    });
  };

  const handlePhotoChange = (e) => {
    const files = e.target.files;
    
    if (files.length > 3) {
      setError('Maximum 3 photos allowed');
      return;
    }
    
    setPhotos(files);
    
    // Generate previews with progress simulation
    setUploadProgress(0);
    const newPreviewUrls = [];
    Array.from(files).forEach((file, index) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        newPreviewUrls.push(fileReader.result);
        setUploadProgress((prev) => prev + (100 / files.length));
        if (newPreviewUrls.length === files.length) {
          setPreviewUrls(newPreviewUrls);
        }
      };
      fileReader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!position) {
      setError('Please select a location on the map');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Please provide a description of the animal');
      return;
    }
    
    if (formData.animal_type === 'OTHER' && !formData.other_animal_type.trim()) {
      setError('Please specify the type of animal when "Other" is selected');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Create FormData for the entire request (including photos)
      const submitFormData = new FormData();
      
      // Add basic form fields
      submitFormData.append('animal_type', formData.animal_type);
      if (formData.animal_type === 'OTHER' && formData.other_animal_type) {
        submitFormData.append('other_animal_type', formData.other_animal_type);
      }
      submitFormData.append('gender', formData.gender);
      submitFormData.append('color', formData.color || '');
      submitFormData.append('description', formData.description);
      submitFormData.append('animal_condition', formData.animal_condition || '');
      submitFormData.append('location_details', formData.location_details || '');
      
      // Add location data in the format the backend expects
      submitFormData.append('latitude', position.lat.toString());
      submitFormData.append('longitude', position.lng.toString());
      
      // Add photos if they exist
      if (photos.length > 0) {
        Array.from(photos).forEach((file, index) => {
          console.log(`Adding photo ${index}:`, file.name);
          submitFormData.append(`photo_${index}`, file);
        });
      }
      
      // Submit everything in one request
      const response = await api.post('/reports/', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Report created successfully:', response.data);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (user) {
    	  navigate('/reports');  // Logged-in users see their reports
	} else {
    	  // For anonymous users, show confirmation with tracking ID
    	  const trackingId = response.data.tracking_id || `PWR-${new Date().getFullYear()}-${response.data.id.toString().padStart(4, '0')}`;

    	  navigate('/', { 
      	    state: { 
              	message: `Report #${response.data.id} submitted successfully!`,
            	trackingId: trackingId,
            	reportId: response.data.id,
            	showTrackingInfo: true

      	    }

    	  });
  	}
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting report:', err);
      
      // Better error handling
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          // Handle field-specific errors
          const errorMessages = [];
          Object.keys(err.response.data).forEach(key => {
            const fieldErrors = err.response.data[key];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(`${key}: ${fieldErrors.join(', ')}`);
            } else {
              errorMessages.push(`${key}: ${fieldErrors}`);
            }
          });
          setError(`Error: ${errorMessages.join('; ')}`);
        } else {
          setError(`Error: ${err.response.data}`);
        }
      } else {
        setError('Error submitting report. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

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
    '& .MuiSelect-select': {
      padding: '18px 14px', // Increased padding
      minHeight: '24px', // Ensure minimum height
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
        <PetsIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
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
        <LocationIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <FavoriteIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          right: '5%',
          animation: `${float} 16s ease-in-out infinite`,
          animationDelay: '6s',
          opacity: 0.3
        }}
      >
        <StarIcon sx={{ fontSize: 25, color: customTheme.accent, transform: 'rotate(45deg)' }} />
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Hero Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              {/* Floating sparkles */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  left: '30%',
                  animation: `${sparkle} 3s infinite`,
                  animationDelay: '0s'
                }}
              >
                <StarIcon sx={{ color: customTheme.accent, fontSize: 20 }} />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: '25%',
                  animation: `${sparkle} 3s infinite`,
                  animationDelay: '1s'
                }}
              >
                <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
              </Box>
              
              <Slide direction="down" in timeout={1000}>
                <Avatar
                  sx={{
                    bgcolor: customTheme.primary,
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  <ReportIcon sx={{ fontSize: 40 }} />
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
                  letterSpacing: '-0.02em'
                }}
              >
                Report a Stray Animal
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                Help us rescue animals in need with detailed reporting and GPS tracking
              </Typography>
              
              {/* User Status Indicator */}
              {user ? (
                <Fade in timeout={1200}>
                  <Chip
                    icon={<CheckIcon />}
                    label="Logged in - You'll earn points for this report!"
                    sx={{
                      mt: 3,
                      backgroundColor: alpha(customTheme.success, 0.15),
                      color: customTheme.success,
                      fontWeight: 600,
                      border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                      fontSize: '1rem',
                      py: 1,
                      px: 2
                    }}
                  />
                </Fade>
              ) : (
                <Fade in timeout={1200}>
                  <Chip
                    icon={<InfoIcon />}
                    label="Anonymous reporting enabled - No account needed"
                    sx={{
                      mt: 3,
                      backgroundColor: alpha(customTheme.accent, 0.15),
                      color: customTheme.accent,
                      fontWeight: 600,
                      border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
                      fontSize: '1rem',
                      py: 1,
                      px: 2
                    }}
                  />
                </Fade>
              )}
            </Box>
            
            {/* Error and Warning Alerts */}
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
                  onClose={() => setError('')}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {error}
                  </Typography>
                </Alert>
              </Slide>
            )}
            
            {geoLocationError && (
              <Slide direction="down" in timeout={800}>
                <Alert 
                  severity="warning" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: `2px solid #ff9800`,
                    backdropFilter: 'blur(10px)',
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem',
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {geoLocationError}
                  </Typography>
                </Alert>
              </Slide>
            )}
            
            {/* Main Form Card */}
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
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  
                  {/* Animal Information Section */}
                  <Box sx={{ p: 5 }}>
                    <Slide direction="right" in timeout={1000}>
                      <Box sx={{ mb: 4 }}>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: customTheme.primary,
                            fontWeight: 700,
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <PetsIcon sx={{ fontSize: '1.2em' }} />
                          Animal Information
                        </Typography>
                        <Divider 
                          sx={{ 
                            borderColor: customTheme.secondary, 
                            borderWidth: 2,
                            mb: 4
                          }} 
                        />
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                              <InputLabel 
                                sx={{
                                  color: customTheme.primary,
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'visible',
                                  textOverflow: 'unset',
                                  width: 'auto',
                                  '&.Mui-focused': { color: customTheme.primary },
                                  '&.MuiInputLabel-shrink': {
                                    fontSize: '0.85rem',
                                    transform: 'translate(14px, -9px) scale(0.85)',
                                    width: 'auto',
                                    maxWidth: 'none'
                                  }
                                }}
                              >
                                Animal Type
                              </InputLabel>
                              <Select
                                name="animal_type"
                                value={formData.animal_type}
                                label="Animal Type"
                                onChange={handleChange}
                                sx={selectStyles}
                              >
                                <MenuItem value="DOG">Dog</MenuItem>
                                <MenuItem value="CAT">Cat</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          {/* Conditional field for "Other" animal type */}
                          {formData.animal_type === 'OTHER' && (
                            <Slide direction="right" in={formData.animal_type === 'OTHER'} timeout={600}>
                              <Grid item xs={12} sm={6} md={8}>
                                <TextField
                                  required
                                  fullWidth
                                  name="other_animal_type"
                                  label="Please specify the animal type"
                                  value={formData.other_animal_type}
                                  onChange={handleChange}
                                  sx={{
                                    ...fieldStyles,
                                    '& .MuiFormHelperText-root': {
                                      color: alpha(customTheme.primary, 0.7),
                                      fontWeight: 500
                                    }
                                  }}
                                  helperText="What type of animal is it? (e.g., rabbit, bird, horse, etc.)"
                                />
                              </Grid>
                            </Slide>
                          )}
                          
                          <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                              <InputLabel 
                                sx={{
                                  color: customTheme.primary,
                                  fontWeight: 600,
                                  '&.Mui-focused': { color: customTheme.primary },
                                }}
                              >
                                Gender
                              </InputLabel>
                              <Select
                                name="gender"
                                value={formData.gender}
                                label="Gender"
                                onChange={handleChange}
                                sx={selectStyles}
                              >
                                <MenuItem value="MALE">Male</MenuItem>
                                <MenuItem value="FEMALE">Female</MenuItem>
                                <MenuItem value="UNKNOWN">Unknown</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={4}>
                            <TextField
                              fullWidth
                              name="color"
                              label="Color/Markings"
                              value={formData.color}
                              onChange={handleChange}
                              sx={fieldStyles}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              required
                              fullWidth
                              name="description"
                              label="Description *"
                              multiline
                              rows={3}
                              value={formData.description}
                              onChange={handleChange}
                              helperText="Please provide as much detail as possible about the animal"
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
                              fullWidth
                              name="animal_condition"
                              label="Animal Condition"
                              multiline
                              rows={2}
                              value={formData.animal_condition}
                              onChange={handleChange}
                              helperText="Describe the animal's health condition"
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
                              fullWidth
                              name="location_details"
                              label="Location Details"
                              multiline
                              rows={2}
                              value={formData.location_details}
                              onChange={handleChange}
                              helperText="Additional details about the location"
                              sx={{
                                ...fieldStyles,
                                '& .MuiFormHelperText-root': {
                                  color: alpha(customTheme.primary, 0.7),
                                  fontWeight: 500
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Slide>
                  </Box>

                  {/* Location Section */}
                  <Paper
                    elevation={0}
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.08)} 0%, ${alpha(customTheme.secondary, 0.03)} 100%)`,
                      borderTop: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                      borderBottom: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                      p: 5
                    }}
                  >
                    <Slide direction="left" in timeout={1200}>
                      <Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: customTheme.primary,
                            fontWeight: 700,
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <MapIcon sx={{ fontSize: '1.2em' }} />
                          Location
                        </Typography>
                        <Divider 
                          sx={{ 
                            borderColor: customTheme.secondary, 
                            borderWidth: 2,
                            mb: 4
                          }} 
                        />
                        
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: customTheme.primary,
                            opacity: 0.8,
                            mb: 3,
                            fontWeight: 500
                          }}
                        >
                          Click on the map to set the animal's precise location
                        </Typography>
                        
                        <Paper
                          elevation={3}
                          sx={{ 
                            height: '400px', 
                            width: '100%', 
                            mb: 3,
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: `4px solid ${customTheme.primary}`,
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              boxShadow: `inset 0 0 20px ${alpha(customTheme.primary, 0.2)}`,
                              pointerEvents: 'none',
                              zIndex: 1000
                            }
                          }}
                        >
                          <MapContainer 
                            center={position || [0, 0]} 
                            zoom={position ? 13 : 2} 
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker position={position} setPosition={setPosition} />
                          </MapContainer>
                        </Paper>
                        
                        {position && (
                          <Zoom in timeout={600}>
                            <Paper 
                              elevation={2}
                              sx={{ 
                                p: 3,
                                backgroundColor: alpha(customTheme.success, 0.08),
                                borderRadius: 3,
                                border: `2px solid ${customTheme.success}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                            >
                              <CheckIcon sx={{ color: customTheme.success, fontSize: 28 }} />
                              <Box>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    color: customTheme.primary,
                                    fontWeight: 700,
                                    mb: 0.5
                                  }}
                                >
                                  Location Selected!
                                </Typography>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    color: alpha(customTheme.primary, 0.8),
                                    fontWeight: 500,
                                    fontFamily: 'monospace'
                                  }}
                                >
                                  {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                                </Typography>
                              </Box>
                            </Paper>
                          </Zoom>
                        )}
                      </Box>
                    </Slide>
                  </Paper>

                  {/* Photos Section */}
                  <Box sx={{ p: 5 }}>
                    <Slide direction="right" in timeout={1400}>
                      <Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            color: customTheme.primary,
                            fontWeight: 700,
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <PhotoIcon sx={{ fontSize: '1.2em' }} />
                          Photos
                        </Typography>
                        <Divider 
                          sx={{ 
                            borderColor: customTheme.secondary, 
                            borderWidth: 2,
                            mb: 4
                          }} 
                        />
                        
                        <input
                          accept="image/*"
                          id="photo-upload"
                          type="file"
                          multiple
                          onChange={handlePhotoChange}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="photo-upload">
                          <Paper
                            elevation={2}
                            sx={{
                              p: 4,
                              textAlign: 'center',
                              borderRadius: 4,
                              background: `
                                linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)
                              `,
                              border: `3px dashed ${customTheme.accent}`,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              mb: 3,
                              '&:hover': {
                                background: `
                                  linear-gradient(135deg, ${alpha(customTheme.accent, 0.15)} 0%, ${alpha(customTheme.accent, 0.08)} 100%)
                                `,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.2)}`
                              }
                            }}
                          >
                            <UploadIcon 
                              sx={{ 
                                fontSize: 60, 
                                color: customTheme.accent, 
                                mb: 2,
                                animation: `${pulse} 2s infinite`
                              }} 
                            />
                            <Typography variant="h5" sx={{ 
                              color: customTheme.accent, 
                              fontWeight: 700,
                              mb: 1
                            }}>
                              Upload Photos
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: alpha(customTheme.accent, 0.8),
                              fontWeight: 500
                            }}>
                              Click here or drag photos (Maximum 3 photos)
                            </Typography>
                          </Paper>
                        </label>
                        
                        {/* Upload Progress */}
                        {photos.length > 0 && uploadProgress < 100 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1, color: customTheme.primary, fontWeight: 600 }}>
                              Uploading photos... {Math.round(uploadProgress)}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={uploadProgress}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(customTheme.accent, 0.2),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: customTheme.accent,
                                  borderRadius: 4
                                }
                              }}
                            />
                          </Box>
                        )}
                        
                        {/* Photo Previews */}
                        {previewUrls.length > 0 && (
                          <Box>
                            <Typography variant="h6" sx={{ 
                              color: customTheme.primary, 
                              fontWeight: 600,
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <CheckIcon sx={{ color: customTheme.success }} />
                              Photo Previews ({previewUrls.length}/3)
                            </Typography>
                            <Grid container spacing={2}>
                              {previewUrls.map((url, index) => (
                                <Grid item xs={6} sm={4} md={3} key={index}>
                                  <Zoom in timeout={300 * (index + 1)}>
                                    <Paper
                                      elevation={3}
                                      sx={{
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        border: `3px solid ${customTheme.primary}`,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                          transform: 'scale(1.05)'
                                        }
                                      }}
                                    >
                                      <Box 
                                        component="img" 
                                        src={url} 
                                        alt={`Preview ${index + 1}`}
                                        sx={{ 
                                          width: '100%',
                                          height: 120, 
                                          objectFit: 'cover'
                                        }}
                                      />
                                    </Paper>
                                  </Zoom>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}
                      </Box>
                    </Slide>
                  </Box>

                  {/* Submit Button */}
                  <Paper
                    elevation={0}
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.08)} 0%, ${alpha(customTheme.primary, 0.03)} 100%)`,
                      borderTop: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                      p: 5
                    }}
                  >
                    <Slide direction="up" in timeout={1600}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading || !position}
                        startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                        sx={{ 
                          py: 3,
                          borderRadius: 4,
                          fontSize: '1.3rem',
                          fontWeight: 800,
                          background: isLoading || !position ? 
                            `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.primary, 0.2)} 90%)` :
                            `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                          boxShadow: !isLoading && position ? 
                            `0 8px 30px ${alpha(customTheme.accent, 0.4)}` : 
                            'none',
                          color: '#ffffff',
                          textTransform: 'none',
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
                            background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 40px ${alpha(customTheme.accent, 0.5)}`,
                            '&::before': {
                              left: '100%'
                            }
                          },
                          '&:disabled': {
                            color: alpha('#ffffff', 0.6),
                            cursor: 'not-allowed'
                          }
                        }}
                      >
                        {isLoading ? 'Submitting Report...' : 
                         !position ? 'Please Select Location First' : 
                         'Submit Report'}
                      </Button>
                    </Slide>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ 
            width: '100%',
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 3,
            backgroundColor: alpha(customTheme.success, 0.15),
            border: `2px solid ${customTheme.success}`,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            }
          }}
        >
          Report submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ReportFormPage;