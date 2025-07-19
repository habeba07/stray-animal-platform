// Enhanced VolunteerEmergencyReport.js with impressive styling

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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Fade,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Paper,
  Slide,
  Zoom,
  Divider,
  alpha,
  ButtonGroup,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import {
  Emergency as EmergencyIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  Pets as PetsIcon,
  AutoAwesome as SparkleIcon,
  Star as StarIcon,
  SupportAgent as SupportIcon,
  LocalHospital as MedicalIcon,
  DirectionsCar as TransportIcon,
  Backup as BackupIcon,
  Send as SendIcon,
  Map as MapIcon,
  CheckCircle as CheckIcon,
  Favorite as FavoriteIcon,
  Close as CloseIcon,
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
  emergency: '#f44336',     // Emergency Red
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
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.emergency, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha(customTheme.emergency, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.emergency, 0)}; }
`;

const emergencyPulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
  70% { transform: scale(1.03); box-shadow: 0 0 0 15px rgba(244, 67, 54, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
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

const urgentBlink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.7; }
`;

// Fix for Leaflet marker icon
const customIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="#f44336" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
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

function VolunteerEmergencyReport() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [position, setPosition] = useState(null);
  const [geoLocationError, setGeoLocationError] = useState('');
  const [activeAssignments, setActiveAssignments] = useState([]);
  
  const [formData, setFormData] = useState({
    // Emergency context
    report_type: 'NEW_EMERGENCY', // NEW_EMERGENCY, ESCALATION, BACKUP_NEEDED
    situation_type: 'ON_SCENE', // ON_SCENE, SPOTTED_WHILE_TRAVELING
    related_assignment_id: '',
    
    // Animal details (simplified for emergency)
    animal_type: 'DOG',
    urgency_level: 'HIGH',
    animal_condition: '',
    immediate_danger: false,
    
    // Location & description
    description: '',
    location_details: '',
    access_difficulties: '',
    
    // Volunteer status
    can_respond_now: true,
    equipment_needed: '',
    backup_requested: false,
  });

  // Redirect if not volunteer
  useEffect(() => {
    if (!user || user.user_type !== 'VOLUNTEER') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Get current location and active assignments
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
    }

    // Fetch active assignments
    fetchActiveAssignments();
  }, []);

  const fetchActiveAssignments = async () => {
    try {
      const response = await api.get('/volunteers/rescue-assignments/my_rescue_assignments/');
      const active = (response.data || []).filter(assignment => 
        assignment.status === 'ACCEPTED' || assignment.status === 'IN_PROGRESS'
      );
      setActiveAssignments(active);
    } catch (err) {
      console.error('Error fetching active assignments:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!position) {
      setError('Please set location on the map or enable GPS');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Please provide a description of the emergency');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const submitData = {
        // Basic report fields
        animal_type: formData.animal_type,
        description: formData.description,
        animal_condition: formData.animal_condition,
        location_details: formData.location_details,
        latitude: position.lat.toString(),
        longitude: position.lng.toString(),
        urgency_level: formData.urgency_level,
        
        // Volunteer-specific fields
        reported_by_volunteer: true,
        volunteer_report_type: formData.report_type,
        situation_type: formData.situation_type,
        related_assignment_id: formData.related_assignment_id || null,
        immediate_danger: formData.immediate_danger,
        access_difficulties: formData.access_difficulties,
        equipment_needed: formData.equipment_needed,
        backup_requested: formData.backup_requested,
        volunteer_can_respond: formData.can_respond_now,
      };
      
      const response = await api.post('/reports/', submitData);
      console.log('Emergency report created:', response.data);
      
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/volunteer/hub');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting emergency report:', err);
      if (err.response?.data) {
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
        setError('Error submitting emergency report. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyCall = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/volunteers/rescue-assignments/emergency_call/', {
        message: 'Emergency assistance needed during field operation',
        location: formData.location_details || `${position?.lat}, ${position?.lng}` || 'Current location'
      });
    
      if (response.data.success) {
    
        alert(`Emergency call sent! ${response.data.coordinators_notified} coordinators notified.`);
      }
    } catch (error) {
      console.error('Error sending emergency call:', error);
      setError('Failed to send emergency call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupRequest = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/volunteers/rescue-assignments/request_backup/', {
        message: 'Need backup assistance for current rescue operation',
        location: formData.location_details || `${position?.lat}, ${position?.lng}` || 'Current location',
        equipment_needed: formData.equipment_needed,
        report_id: formData.related_assignment_id || null
      });
    
      if (response.data.success) {
    
        setFormData(prev => ({ ...prev, backup_requested: true }));
        alert(`Backup request sent! ${response.data.volunteers_notified} volunteers notified.`);
      }
    } catch (error) {
      console.error('Error requesting backup:', error);
      setError('Failed to request backup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
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
    }
  };

  const selectStyles = {
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: customTheme.primary,
    fontWeight: 500,
    transition: 'all 0.3s ease',
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
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.emergency, 0.15)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
      py: 4,
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
        <EmergencyIcon sx={{ fontSize: 30, color: customTheme.emergency, filter: 'blur(1px)' }} />
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Enhanced Hero Header */}
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
                    bgcolor: customTheme.emergency,
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    boxShadow: `0 8px 25px ${alpha(customTheme.emergency, 0.4)}`,
                    animation: `${emergencyPulse} 2s infinite`
                  }}
                >
                  <EmergencyIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Slide>
              
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${customTheme.emergency} 20%, ${customTheme.accent} 50%, ${customTheme.primary} 80%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 3s ease infinite`,
                  mb: 2,
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.02em'
                }}
              >
                Emergency Field Report
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`,
                  mb: 3
                }}
              >
                Quick emergency reporting for active volunteers in the field
              </Typography>
              
              {/* Enhanced Volunteer Info Bar */}
              <Slide direction="up" in timeout={1200}>
                <Card sx={{ 
                  background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${customTheme.success} 90%)`,
                  borderRadius: 4,
                  boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`,
                  border: `2px solid ${alpha('#ffffff', 0.3)}`,
                  backdropFilter: 'blur(10px)'
                }}>
                  <CardContent sx={{ py: 3 }}>
                    <Typography variant="h5" sx={{ 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 700,
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <PersonIcon sx={{ mr: 2, fontSize: 28 }} />
                      Volunteer: {user?.username} • Active Assignments: {activeAssignments.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            </Box>
            
            {/* Enhanced Alert Messages */}
            {error && (
              <Slide direction="down" in timeout={800}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: `2px solid ${customTheme.emergency}`,
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
            
            {success && (
              <Zoom in timeout={800}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: `2px solid ${customTheme.success}`,
                    backdropFilter: 'blur(10px)',
                    animation: `${pulse} 1s ease infinite`,
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem',
                      animation: `${sparkle} 2s infinite`
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Emergency report submitted successfully! Redirecting to Volunteer Hub...
                  </Typography>
                </Alert>
              </Zoom>
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
            
            {/* Enhanced Main Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={4}>
                
                {/* Left Column - Emergency Context */}
                <Grid item xs={12} md={6}>
                  
                  {/* Enhanced Emergency Type Card */}
                  <Fade in timeout={1000}>
                    <Card sx={{ 
                      mb: 4, 
                      borderRadius: 5,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `3px solid ${alpha(customTheme.emergency, 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 15px 35px ${alpha(customTheme.emergency, 0.2)}`
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ 
                          color: customTheme.emergency, 
                          mb: 3,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <WarningIcon sx={{ mr: 2, fontSize: 28, animation: `${urgentBlink} 1s infinite` }} />
                          Emergency Context
                        </Typography>
                        
                        <Box sx={{ mb: 4 }}>
                          <FormLabel 
                            component="legend" 
                            sx={{ 
                              color: customTheme.primary,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              mb: 2
                            }}
                          >
                            Report Type
                          </FormLabel>
                          <RadioGroup
                            name="report_type"
                            value={formData.report_type}
                            onChange={handleChange}
                            sx={{
                              '& .MuiFormControlLabel-root': {
                                mb: 2,
                                p: 2,
                                borderRadius: 3,
                                border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: alpha(customTheme.primary, 0.05),
                                  transform: 'translateX(5px)'
                                },
                                '& .MuiFormControlLabel-label': {
                                  fontWeight: 600,
                                  color: customTheme.primary,
                                  fontSize: '1rem'
                                }
                              }
                            }}
                          >
                            <FormControlLabel 
                              value="NEW_EMERGENCY" 
                              control={<Radio sx={{ color: customTheme.emergency }} />} 
                              label="New Emergency Discovery" 
                            />
                            <FormControlLabel 
                              value="ESCALATION" 
                              control={<Radio sx={{ color: customTheme.accent }} />} 
                              label="Current Assignment Escalation" 
                            />
                            <FormControlLabel 
                              value="BACKUP_NEEDED" 
                              control={<Radio sx={{ color: customTheme.secondary }} />} 
                              label="Backup/Support Needed" 
                            />
                          </RadioGroup>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <FormLabel 
                            component="legend"
                            sx={{ 
                              color: customTheme.primary,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              mb: 2
                            }}
                          >
                            Your Situation
                          </FormLabel>
                          <RadioGroup
                            name="situation_type"
                            value={formData.situation_type}
                            onChange={handleChange}
                            sx={{
                              '& .MuiFormControlLabel-root': {
                                mb: 1,
                                p: 2,
                                borderRadius: 3,
                                border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                                flex: 1,
                                m: 0.5,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: alpha(customTheme.primary, 0.05),
                                  transform: 'scale(1.02)'
                                },
                                '& .MuiFormControlLabel-label': {
                                  fontWeight: 600,
                                  color: customTheme.primary
                                }
                              }
                            }}
                            row
                          >
                            <FormControlLabel 
                              value="ON_SCENE" 
                              control={<Radio sx={{ color: customTheme.success }} />} 
                              label="I'm on scene now" 
                            />
                            <FormControlLabel 
                              value="SPOTTED_WHILE_TRAVELING" 
                              control={<Radio sx={{ color: customTheme.accent }} />} 
                              label="Spotted while traveling" 
                            />
                          </RadioGroup>
                        </Box>

                        {/* Link to existing assignment */}
                        {formData.report_type !== 'NEW_EMERGENCY' && activeAssignments.length > 0 && (
                          <Slide direction="right" in timeout={600}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                              <InputLabel sx={{ 
                                color: customTheme.primary,
                                fontWeight: 600
                              }}>
                                Related Assignment
                              </InputLabel>
                              <Select
                                name="related_assignment_id"
                                value={formData.related_assignment_id}
                                label="Related Assignment"
                                onChange={handleChange}
                                sx={selectStyles}
                              >
                                {activeAssignments.map((assignment) => (
                                  <MenuItem key={assignment.id} value={assignment.id}>
                                    {assignment.report_details?.animal_type || 'Animal'} - 
                                    {assignment.report_details?.location_details || 'Location'}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Slide>
                        )}
                      </CardContent>
                    </Card>
                  </Fade>

                  {/* Enhanced Animal Information Card */}
                  <Fade in timeout={1200}>
                    <Card sx={{ 
                      mb: 4,
                      borderRadius: 5,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 15px 35px ${alpha(customTheme.primary, 0.2)}`
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ 
                          color: customTheme.primary, 
                          mb: 3,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <PetsIcon sx={{ mr: 2, fontSize: 28 }} />
                          Animal Information
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={6}>
                            <FormControl fullWidth>
                              <InputLabel sx={{ 
                                color: customTheme.primary,
                                fontWeight: 600
                              }}>
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
                          
                          <Grid item xs={6}>
                            <FormControl fullWidth>
                              <InputLabel sx={{ 
                                color: customTheme.primary,
                                fontWeight: 600
                              }}>
                                Urgency Level
                              </InputLabel>
                              <Select
                                name="urgency_level"
                                value={formData.urgency_level}
                                label="Urgency Level"
                                onChange={handleChange}
                                sx={selectStyles}
                              >
                                <MenuItem value="EMERGENCY">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <EmergencyIcon sx={{ mr: 1, color: customTheme.emergency }} />
                                    EMERGENCY
                                  </Box>
                                </MenuItem>
                                <MenuItem value="HIGH">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <WarningIcon sx={{ mr: 1, color: '#ff9800' }} />
                                    HIGH
                                  </Box>
                                </MenuItem>
                                <MenuItem value="NORMAL">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AssignmentIcon sx={{ mr: 1, color: customTheme.primary }} />
                                    NORMAL
                                  </Box>
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              name="animal_condition"
                              label="Animal Condition"
                              value={formData.animal_condition}
                              onChange={handleChange}
                              placeholder="Injured, aggressive, trapped, etc."
                              sx={fieldStyles}
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              required
                              fullWidth
                              name="description"
                              label="Emergency Description"
                              multiline
                              rows={3}
                              value={formData.description}
                              onChange={handleChange}
                              placeholder="Describe the emergency situation and immediate concerns"
                              sx={fieldStyles}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>

                {/* Right Column - Location & Response */}
                <Grid item xs={12} md={6}>
                  
                  {/* Enhanced Location Card */}
                  <Fade in timeout={1400}>
                    <Card sx={{ 
                      mb: 4,
                      borderRadius: 5,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 15px 35px ${alpha(customTheme.secondary, 0.2)}`
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ 
                          color: customTheme.primary, 
                          mb: 3,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <MapIcon sx={{ mr: 2, fontSize: 28, color: customTheme.secondary }} />
                          Emergency Location
                        </Typography>
                        
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 3, 
                            color: alpha(customTheme.primary, 0.8),
                            fontWeight: 500,
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: alpha(customTheme.secondary, 0.1),
                            border: `1px solid ${alpha(customTheme.secondary, 0.3)}`
                          }}
                        >
                          Click to set exact emergency location
                        </Typography>
                        
                        <Paper
                          elevation={3}
                          sx={{ 
                            height: '250px', 
                            width: '100%', 
                            mb: 3,
                            borderRadius: 4,
                            overflow: 'hidden',
                            border: `4px solid ${customTheme.emergency}`,
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              boxShadow: `inset 0 0 20px ${alpha(customTheme.emergency, 0.3)}`,
                              pointerEvents: 'none',
                              zIndex: 1000
                            }
                          }}
                        >
                          <MapContainer 
                            center={position || [0, 0]} 
                            zoom={position ? 15 : 2} 
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
                                backgroundColor: alpha(customTheme.success, 0.1),
                                borderRadius: 3,
                                border: `2px solid ${customTheme.success}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 3
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
                                  Emergency Location Set!
                                </Typography>
                                <Typography 
                                  variant="body2" 
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
                        
                        <TextField
                          fullWidth
                          name="location_details"
                          label="Location Details"
                          value={formData.location_details}
                          onChange={handleChange}
                          placeholder="Building name, landmarks, access instructions"
                          sx={fieldStyles}
                        />
                      </CardContent>
                    </Card>
                  </Fade>

                  {/* Enhanced Response Capability Card */}
                  <Fade in timeout={1600}>
                    <Card sx={{ 
                      mb: 4,
                      borderRadius: 5,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 15px 35px ${alpha(customTheme.success, 0.2)}`
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ 
                          color: customTheme.success, 
                          mb: 3,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <SupportIcon sx={{ mr: 2, fontSize: 28 }} />
                          Response Information
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                          <FormLabel 
                            component="legend"
                            sx={{ 
                              color: customTheme.primary,
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              mb: 2
                            }}
                          >
                            Can you respond now?
                          </FormLabel>
                          <RadioGroup
                            name="can_respond_now"
                            value={formData.can_respond_now}
                            onChange={handleChange}
                            sx={{
                              '& .MuiFormControlLabel-root': {
                                mb: 1,
                                p: 2,
                                borderRadius: 3,
                                border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                                flex: 1,
                                m: 0.5,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: alpha(customTheme.primary, 0.05),
                                  transform: 'scale(1.02)'
                                },
                                '& .MuiFormControlLabel-label': {
                                  fontWeight: 600,
                                  color: customTheme.primary
                                }
                              }
                            }}
                            row
                          >
                            <FormControlLabel 
                              value={true} 
                              control={<Radio sx={{ color: customTheme.success }} />} 
                              label="Yes, I can respond" 
                            />
                            <FormControlLabel 
                              value={false} 
                              control={<Radio sx={{ color: customTheme.emergency }} />} 
                              label="No, need others" 
                            />
                          </RadioGroup>
                        </Box>

                        <TextField
                          fullWidth
                          name="access_difficulties"
                          label="Access Difficulties"
                          value={formData.access_difficulties}
                          onChange={handleChange}
                          placeholder="Locked area, dangerous location, equipment needed"
                          sx={{ ...fieldStyles, mb: 3 }}
                        />
                        
                        <TextField
                          fullWidth
                          name="equipment_needed"
                          label="Equipment Needed"
                          value={formData.equipment_needed}
                          onChange={handleChange}
                          placeholder="Nets, carriers, medical supplies, etc."
                          sx={fieldStyles}
                        />
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              </Grid>

              {/* Enhanced Emergency Actions */}
              <Fade in timeout={1800}>
                <Card sx={{ 
                  mt: 4,
                  borderRadius: 6,
                  background: `linear-gradient(45deg, ${customTheme.emergency} 30%, ${customTheme.accent} 90%)`,
                  boxShadow: `0 15px 40px ${alpha(customTheme.emergency, 0.4)}`,
                  border: `3px solid ${alpha('#ffffff', 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 20% 80%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, ${alpha('#ffffff', 0.05)} 0%, transparent 50%)
                    `,
                    pointerEvents: 'none'
                  }
                }}>
                  <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" sx={{ 
                      color: 'white', 
                      mb: 4, 
                      textAlign: 'center',
                      fontWeight: 800,
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <PhoneIcon sx={{ mr: 2, fontSize: 32, animation: `${pulse} 2s infinite` }} />
                      Emergency Actions
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleEmergencyCall}
                          disabled={isLoading}
                          sx={{ 
                            py: 3,
                            borderRadius: 4,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            border: `2px solid ${alpha('#ffffff', 0.3)}`,
                            transition: 'all 0.3s ease',
                            '&:hover:not(:disabled)': { 
                              backgroundColor: 'rgba(255,255,255,0.25)',
                              transform: 'translateY(-3px)',
                              boxShadow: `0 12px 35px ${alpha('#000000', 0.3)}`
                            }
                          }}
                          startIcon={<PhoneIcon />}
                        >
                          Call Emergency Line
                        </Button>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleBackupRequest}
                          disabled={isLoading}
                          sx={{ 
                            py: 3,
                            borderRadius: 4,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            backgroundColor: formData.backup_requested ? 
                              'rgba(76,175,80,0.8)' : 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            border: `2px solid ${alpha('#ffffff', 0.3)}`,
                            transition: 'all 0.3s ease',
                            '&:hover:not(:disabled)': { 
                              backgroundColor: formData.backup_requested ? 
                                'rgba(76,175,80,0.9)' : 'rgba(255,255,255,0.25)',
                              transform: 'translateY(-3px)',
                              boxShadow: `0 12px 35px ${alpha('#000000', 0.3)}`
                            },
                            ...(formData.backup_requested && {
                              animation: `${pulse} 2s infinite`
                            })
                          }}
                          startIcon={formData.backup_requested ? <CheckIcon /> : <BackupIcon />}
                        >
                          {formData.backup_requested ? 'Backup Requested' : 'Request Backup'}
                        </Button>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          disabled={isLoading || !position}
                          sx={{ 
                            py: 3,
                            borderRadius: 4,
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            textTransform: 'none',
                            backgroundColor: 'white',
                            color: customTheme.emergency,
                            border: `2px solid ${alpha('#ffffff', 0.5)}`,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: `linear-gradient(90deg, transparent, ${alpha('#000000', 0.1)}, transparent)`,
                              transition: 'left 0.6s ease',
                            },
                            '&:hover:not(:disabled)': { 
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              transform: 'translateY(-3px)',
                              boxShadow: `0 12px 35px ${alpha('#000000', 0.4)}`,
                              '&::before': {
                                left: '100%'
                              }
                            },
                            '&:disabled': {
                              backgroundColor: alpha('#ffffff', 0.5),
                              color: alpha(customTheme.emergency, 0.5)
                            }
                          }}
                          startIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                        >
                          {isLoading ? 'Submitting...' : 
                           !position ? 'Set Location First' : 
                           'SUBMIT EMERGENCY REPORT'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default VolunteerEmergencyReport;