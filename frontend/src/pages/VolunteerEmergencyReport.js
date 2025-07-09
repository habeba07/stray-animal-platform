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
  ButtonGroup,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import {
  Emergency as EmergencyIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  grey: '#f3e5ab',
  accent: '#ff8a65',
  background: '#fff8e1',
  emergency: '#f44336',
};

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

// LocationMarker component
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

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${customTheme.background} 0%, ${customTheme.grey} 100%)`,
      py: 4,
      px: 2
    }}>
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  bgcolor: customTheme.emergency,
                  width: 70,
                  height: 70,
                  mx: 'auto',
                  mb: 2,
                  boxShadow: `0 8px 25px ${customTheme.emergency}40`
                }}
              >
                <EmergencyIcon sx={{ fontSize: 35 }} />
              </Avatar>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: customTheme.emergency,
                  fontWeight: 700,
                  mb: 1
                }}
              >
                🚨 Emergency Field Report
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: customTheme.primary,
                  fontWeight: 400,
                  opacity: 0.8
                }}
              >
                Quick emergency reporting for active volunteers
              </Typography>
              
              {/* Volunteer Info Bar */}
              <Card sx={{ mt: 3, background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${customTheme.success} 90%)` }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Volunteer: {user?.username} • Active Assignments: {activeAssignments.length}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
                🎉 Emergency report submitted successfully! Redirecting to Volunteer Hub...
              </Alert>
            )}
            
            {geoLocationError && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
                {geoLocationError}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={4}>
                
                {/* Left Column - Emergency Context */}
                <Grid item xs={12} md={6}>
                  
                  {/* Emergency Type */}
                  <Card sx={{ mb: 3, border: `2px solid ${customTheme.emergency}40` }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: customTheme.emergency, mb: 2 }}>
                        <WarningIcon sx={{ mr: 1 }} />
                        Emergency Context
                      </Typography>
                      
                      <FormControl component="fieldset" sx={{ mb: 3 }}>
                        <FormLabel component="legend">Report Type</FormLabel>
                        <RadioGroup
                          name="report_type"
                          value={formData.report_type}
                          onChange={handleChange}
                        >
                          <FormControlLabel 
                            value="NEW_EMERGENCY" 
                            control={<Radio />} 
                            label="🆕 New Emergency Discovery" 
                          />
                          <FormControlLabel 
                            value="ESCALATION" 
                            control={<Radio />} 
                            label="⬆️ Current Assignment Escalation" 
                          />
                          <FormControlLabel 
                            value="BACKUP_NEEDED" 
                            control={<Radio />} 
                            label="🚑 Backup/Support Needed" 
                          />
                        </RadioGroup>
                      </FormControl>

                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <FormLabel component="legend">Your Situation</FormLabel>
                        <RadioGroup
                          name="situation_type"
                          value={formData.situation_type}
                          onChange={handleChange}
                          row
                        >
                          <FormControlLabel 
                            value="ON_SCENE" 
                            control={<Radio />} 
                            label="📍 I'm on scene now" 
                          />
                          <FormControlLabel 
                            value="SPOTTED_WHILE_TRAVELING" 
                            control={<Radio />} 
                            label="👁️ Spotted while traveling" 
                          />
                        </RadioGroup>
                      </FormControl>

                      {/* Link to existing assignment */}
                      {formData.report_type !== 'NEW_EMERGENCY' && activeAssignments.length > 0 && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Related Assignment</InputLabel>
                          <Select
                            name="related_assignment_id"
                            value={formData.related_assignment_id}
                            label="Related Assignment"
                            onChange={handleChange}
                          >
                            {activeAssignments.map((assignment) => (
                              <MenuItem key={assignment.id} value={assignment.id}>
                                {assignment.report_details?.animal_type || 'Animal'} - 
                                {assignment.report_details?.location_details || 'Location'}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </CardContent>
                  </Card>

                  {/* Animal Information */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: customTheme.primary, mb: 2 }}>
                        🐾 Animal Information
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel>Animal Type</InputLabel>
                            <Select
                              name="animal_type"
                              value={formData.animal_type}
                              label="Animal Type"
                              onChange={handleChange}
                            >
                              <MenuItem value="DOG">Dog</MenuItem>
                              <MenuItem value="CAT">Cat</MenuItem>
                              <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel>Urgency Level</InputLabel>
                            <Select
                              name="urgency_level"
                              value={formData.urgency_level}
                              label="Urgency Level"
                              onChange={handleChange}
                            >
                              <MenuItem value="EMERGENCY">🚨 EMERGENCY</MenuItem>
                              <MenuItem value="HIGH">⚠️ HIGH</MenuItem>
                              <MenuItem value="NORMAL">ℹ️ NORMAL</MenuItem>
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
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Right Column - Location & Response */}
                <Grid item xs={12} md={6}>
                  
                  {/* Location */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: customTheme.primary, mb: 2 }}>
                        <LocationIcon sx={{ mr: 1 }} />
                        Emergency Location
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Click to set exact emergency location
                      </Typography>
                      
                      <Box sx={{ 
                        height: '250px', 
                        width: '100%', 
                        mb: 2,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `2px solid ${customTheme.primary}40`,
                      }}>
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
                      </Box>
                      
                      {position && (
                        <Chip 
                          label={`📍 ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`}
                          color="primary"
                          sx={{ mb: 2 }}
                        />
                      )}
                      
                      <TextField
                        fullWidth
                        name="location_details"
                        label="Location Details"
                        value={formData.location_details}
                        onChange={handleChange}
                        placeholder="Building name, landmarks, access instructions"
                      />
                    </CardContent>
                  </Card>

                  {/* Response Capability */}
                  <Card sx={{ mb: 3, border: `2px solid ${customTheme.success}40` }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: customTheme.success, mb: 2 }}>
                        <AssignmentIcon sx={{ mr: 1 }} />
                        Response Information
                      </Typography>
                      
                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <FormLabel component="legend">Can you respond now?</FormLabel>
                        <RadioGroup
                          name="can_respond_now"
                          value={formData.can_respond_now}
                          onChange={handleChange}
                          row
                        >
                          <FormControlLabel 
                            value={true} 
                            control={<Radio />} 
                            label="✅ Yes, I can respond" 
                          />
                          <FormControlLabel 
                            value={false} 
                            control={<Radio />} 
                            label="❌ No, need others" 
                          />
                        </RadioGroup>
                      </FormControl>

                      <TextField
                        fullWidth
                        name="access_difficulties"
                        label="Access Difficulties"
                        value={formData.access_difficulties}
                        onChange={handleChange}
                        placeholder="Locked area, dangerous location, equipment needed"
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        name="equipment_needed"
                        label="Equipment Needed"
                        value={formData.equipment_needed}
                        onChange={handleChange}
                        placeholder="Nets, carriers, medical supplies, etc."
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Emergency Actions */}
              <Card sx={{ mt: 3, background: `linear-gradient(45deg, ${customTheme.emergency} 30%, ${customTheme.accent} 90%)` }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
                    <PhoneIcon sx={{ mr: 1 }} />
                    Emergency Actions
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ 
                          py: 2,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
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
                        sx={{ 
                          py: 2,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                        }}
                        startIcon={<WarningIcon />}
                        onClick={() => setFormData(prev => ({ ...prev, backup_requested: !prev.backup_requested }))}
                      >
                        {formData.backup_requested ? '✅ Backup Requested' : 'Request Backup'}
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading || !position}
                        sx={{ 
                          py: 2,
                          backgroundColor: 'white',
                          color: customTheme.emergency,
                          fontWeight: 'bold',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                        }}
                        startIcon={isLoading ? <CircularProgress size={20} /> : <EmergencyIcon />}
                      >
                        {isLoading ? 'Submitting...' : 'SUBMIT EMERGENCY REPORT'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default VolunteerEmergencyReport;