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
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import ReportIcon from '@mui/icons-material/Report';
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
  
  const [formData, setFormData] = useState({
    animal_type: 'DOG',
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const files = e.target.files;
    
    if (files.length > 3) {
      setError('Maximum 3 photos allowed');
      return;
    }
    
    setPhotos(files);
    
    // Generate previews
    const newPreviewUrls = [];
    Array.from(files).forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        newPreviewUrls.push(fileReader.result);
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
    
    setError('');
    setIsLoading(true);
    
    try {
      // Create FormData for the entire request (including photos)
      const submitFormData = new FormData();
      
      // Add basic form fields
      submitFormData.append('animal_type', formData.animal_type);
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
    backgroundColor: 'transparent',
    minHeight: 56, // Ensure adequate height
    '& fieldset': {
      borderColor: customTheme.primary + '60',
      borderWidth: 2,
    },
    '&:hover fieldset': {
      borderColor: customTheme.secondary,
      borderWidth: 2,
    },
    '&.Mui-focused fieldset': {
      borderColor: customTheme.primary,
      borderWidth: 3,
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

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${customTheme.background} 0%, ${customTheme.grey} 100%)`,
      py: 6,
      px: 2
    }}>
      <Container maxWidth="md">
        <Fade in={true} timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Avatar
                sx={{
                  bgcolor: customTheme.primary,
                  width: 70,
                  height: 70,
                  mx: 'auto',
                  mb: 3,
                  boxShadow: `0 8px 25px ${customTheme.primary}40`
                }}
              >
                <ReportIcon sx={{ fontSize: 35 }} />
              </Avatar>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: customTheme.primary,
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Report a Stray Animal
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: customTheme.primary,
                  fontWeight: 400,
                  opacity: 0.8
                }}
              >
                Help us rescue animals in need with detailed reporting and GPS tracking
              </Typography>
            </Box>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  borderRadius: 3,
                  backgroundColor: 'transparent',
                  border: `2px solid #f44336`,
                }}
              >
                {error}
              </Alert>
            )}
            
            {geoLocationError && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 4,
                  borderRadius: 3,
                  backgroundColor: 'transparent',
                  border: `2px solid #ff9800`,
                }}
              >
                {geoLocationError}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Animal Information */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  Animal Information
                </Typography>
                <Divider sx={{ mb: 4, borderColor: customTheme.secondary, borderWidth: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel 
                        sx={{
                          color: customTheme.primary,
                          fontWeight: 600,
                          '&.Mui-focused': { color: customTheme.primary },
                        }}
                      >
                        Animal Type
                      </InputLabel>
                      <Select
                        name="animal_type"
                        value={formData.animal_type}
                        label="Animal Type"
                        onChange={handleChange}
                        sx={{
                          borderRadius: 3,
                          backgroundColor: 'transparent',
                          color: customTheme.primary,
                          fontWeight: 500,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.primary + '60',
                            borderWidth: 2,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.secondary,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.primary,
                            borderWidth: 3,
                          },
                        }}
                      >
                        <MenuItem value="DOG">Dog</MenuItem>
                        <MenuItem value="CAT">Cat</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
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
                        sx={{
                          borderRadius: 3,
                          backgroundColor: 'transparent',
                          color: customTheme.primary,
                          fontWeight: 500,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.primary + '60',
                            borderWidth: 2,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.secondary,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.primary,
                            borderWidth: 3,
                          },
                        }}
                      >
                        <MenuItem value="MALE">Male</MenuItem>
                        <MenuItem value="FEMALE">Female</MenuItem>
                        <MenuItem value="UNKNOWN">Unknown</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
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
                      label="Description"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      helperText="Please provide as much detail as possible"
                      sx={{
                        ...fieldStyles,
                        '& .MuiFormHelperText-root': {
                          color: customTheme.primary + '80'
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
                          color: customTheme.primary + '80'
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
                          color: customTheme.primary + '80'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Location */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  Location
                </Typography>
                <Divider sx={{ mb: 4, borderColor: customTheme.secondary, borderWidth: 2 }} />
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: customTheme.primary,
                    opacity: 0.8,
                    mb: 3
                  }}
                >
                  Click on the map to set the animal's precise location
                </Typography>
                
                <Box sx={{ 
                  height: '400px', 
                  width: '100%', 
                  mb: 3,
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `3px solid ${customTheme.primary}40`,
                }}>
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
                </Box>
                
                {position && (
                  <Box 
                    sx={{ 
                      p: 2,
                      backgroundColor: customTheme.secondary + '20',
                      borderRadius: 2,
                      border: `2px solid ${customTheme.secondary}40`
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600
                      }}
                    >
                      Selected location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Photos */}
              <Box sx={{ mb: 6 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  Photos
                </Typography>
                <Divider sx={{ mb: 4, borderColor: customTheme.secondary, borderWidth: 2 }} />
                
                <input
                  accept="image/*"
                  id="photo-upload"
                  type="file"
                  multiple
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="photo-upload">
                  <Button 
                    variant="contained" 
                    component="span"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      backgroundColor: customTheme.secondary,
                      '&:hover': {
                        backgroundColor: customTheme.success,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    Upload Photos (Maximum 3)
                  </Button>
                </label>
                
                {previewUrls.length > 0 && (
                  <Grid container spacing={2} sx={{ mt: 3 }}>
                    {previewUrls.map((url, index) => (
                      <Grid item xs={4} sm={3} md={2} key={index}>
                        <Box 
                          component="img" 
                          src={url} 
                          alt={`Preview ${index + 1}`}
                          sx={{ 
                            width: '100%',
                            height: 100, 
                            objectFit: 'cover', 
                            borderRadius: 2,
                            border: `2px solid ${customTheme.primary}40`,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading || !position}
                sx={{ 
                  py: 2.5,
                  borderRadius: 4,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                  boxShadow: `0 6px 20px ${customTheme.accent}40`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${customTheme.accent}e0 30%, ${customTheme.secondary}e0 90%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${customTheme.accent}50`,
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    transform: 'none'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                {isLoading ? <CircularProgress size={26} color="inherit" /> : 'Submit Report'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container>
      
      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Report submitted successfully!"
      />
    </Box>
  );
}

export default ReportFormPage;