import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Typography,
  Divider,
  Box,
  Chip,
  Avatar,
  Paper,
  Fade,
  Slide,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  Pets as PetsIcon,
  LocalHospital as MedicalIcon,
  Assignment as InfoIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Speed as PriorityIcon,
  CheckCircle as StatusIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
  warning: '#ff9800',
  error: '#f44336',
};

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
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

const ANIMAL_TYPES = [
  { value: 'DOG', label: 'Dog' },
  { value: 'CAT', label: 'Cat' },
  { value: 'OTHER', label: 'Other' },
];

const GENDER_TYPES = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

// NEW: Status options for shelter workflow
const STATUS_TYPES = [
  { value: 'REPORTED', label: 'Reported', color: customTheme.accent },
  { value: 'RESCUED', label: 'Rescued', color: customTheme.secondary },
  { value: 'IN_SHELTER', label: 'In Shelter', color: customTheme.primary },
  { value: 'UNDER_TREATMENT', label: 'Under Treatment', color: customTheme.warning },
  { value: 'QUARANTINE', label: 'In Quarantine', color: '#9c27b0' },
  { value: 'URGENT_MEDICAL', label: 'Urgent Medical Attention', color: customTheme.error },
  { value: 'READY_FOR_TRANSFER', label: 'Ready for Transfer', color: '#2196f3' },
  { value: 'AVAILABLE', label: 'Available for Adoption', color: customTheme.success },
  { value: 'ADOPTED', label: 'Adopted', color: '#4caf50' },
  { value: 'RETURNED', label: 'Returned to Owner', color: '#607d8b' },
];

// NEW: Priority levels for medical/emergency cases
const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'Low Priority', color: customTheme.success },
  { value: 'NORMAL', label: 'Normal Priority', color: customTheme.primary },
  { value: 'HIGH', label: 'High Priority', color: customTheme.accent },
  { value: 'EMERGENCY', label: 'Emergency', color: customTheme.error },
];

function EditAnimalForm({ open, onClose, animal, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    animal_type: '',
    breed: '',
    gender: '',
    age_estimate: '',
    weight: '',
    color: '',
    status: '', // NEW: Animal status
    priority_level: '', // NEW: Priority level
    health_status: '',
    behavior_notes: '',
    special_needs: '',
    adoption_fee: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (animal && open) {
      setFormData({
        name: animal.name || '',
        animal_type: animal.animal_type || '',
        breed: animal.breed || '',
        gender: animal.gender || '',
        age_estimate: animal.age_estimate || '',
        weight: animal.weight || '',
        color: animal.color || '',
        status: animal.status || '', // NEW: Include status
        priority_level: animal.priority_level || '', // NEW: Include priority
        health_status: animal.health_status || '',
        behavior_notes: animal.behavior_notes || '',
        special_needs: animal.special_needs || '',
        adoption_fee: animal.adoption_fee || '',
      });
      setError(null);
    }
  }, [animal, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data for API
      const updateData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        adoption_fee: formData.adoption_fee ? parseFloat(formData.adoption_fee) : null,
      };

      await onSave(updateData);
      onClose();
    } catch (err) {
      console.error('Error updating animal:', err);
      setError(err.response?.data?.detail || 'Failed to update animal information');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  const getStatusColor = (status) => {
    const statusType = STATUS_TYPES.find(s => s.value === status);
    return statusType?.color || customTheme.primary;
  };

  const getPriorityColor = (priority) => {
    const priorityType = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityType?.color || customTheme.primary;
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
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 6,
          overflow: 'hidden',
          background: `
            radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
          boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.2)}`,
          position: 'relative',
          maxHeight: '90vh',
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
        }
      }}
    >
      {/* Enhanced Dialog Title */}
      <DialogTitle sx={{ 
        p: 0,
        background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
        borderBottom: `3px solid ${alpha(customTheme.primary, 0.2)}`,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Loading Progress */}
        {loading && (
          <LinearProgress 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: alpha(customTheme.accent, 0.2),
              '& .MuiLinearProgress-bar': {
                backgroundColor: customTheme.accent,
                background: `linear-gradient(90deg, ${customTheme.accent}, ${customTheme.secondary})`
              }
            }}
          />
        )}

        <Box sx={{ p: 4, pb: 3, position: 'relative' }}>
          {/* Floating sparkles */}
          <Box
            sx={{
              position: 'absolute',
              top: 15,
              right: '20%',
              animation: `${sparkle} 3s infinite`,
              animationDelay: '0s'
            }}
          >
            <StarIcon sx={{ color: customTheme.accent, fontSize: 16 }} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: 25,
              right: '30%',
              animation: `${sparkle} 3s infinite`,
              animationDelay: '1s'
            }}
          >
            <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 12 }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: customTheme.primary,
                width: 56,
                height: 56,
                boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.3)}`,
                animation: `${pulse} 3s infinite`
              }}
            >
              <EditIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: customTheme.primary,
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                Edit Animal Profile
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.7),
                  fontWeight: 500
                }}
              >
                Update medical records and care information
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ 
          p: 0, 
          position: 'relative', 
          zIndex: 1,
          maxHeight: 'calc(90vh - 300px)',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(customTheme.grey, 0.3),
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(customTheme.primary, 0.5),
            borderRadius: 4,
            '&:hover': {
              background: alpha(customTheme.primary, 0.7),
            },
          },
        }}>
          {/* Error Alert */}
          {error && (
            <Fade in timeout={600}>
              <Alert 
                severity="error" 
                sx={{ 
                  m: 3,
                  mb: 2,
                  borderRadius: 3,
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor: alpha(customTheme.error, 0.1),
                  border: `2px solid ${alpha(customTheme.error, 0.3)}`,
                  '& .MuiAlert-icon': {
                    fontSize: '1.3rem'
                  }
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}
          
          <Box sx={{ p: 4, pb: 6 }}>
            {/* STATUS AND PRIORITY SECTION - NEW */}
            <Slide direction="right" in timeout={800}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  borderRadius: 4,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.error, 0.08)} 0%, ${alpha(customTheme.error, 0.03)} 100%)
                  `,
                  border: `3px solid ${alpha(customTheme.error, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: customTheme.error,
                      width: 48,
                      height: 48,
                      boxShadow: `0 4px 15px ${alpha(customTheme.error, 0.3)}`
                    }}
                  >
                    <MedicalIcon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 700,
                        mb: 0.5
                      }}
                    >
                      Status & Priority Management
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.7),
                        fontWeight: 500
                      }}
                    >
                      Critical care workflow and priority settings
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" required>
                      <InputLabel 
                        sx={{
                          color: customTheme.primary,
                          fontWeight: 600,
                          '&.Mui-focused': { color: customTheme.primary }
                        }}
                      >
                        Animal Status
                      </InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        label="Animal Status"
                        sx={selectStyles}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(selected),
                                boxShadow: `0 0 8px ${alpha(getStatusColor(selected), 0.5)}`
                              }}
                            />
                            <Typography sx={{ fontWeight: 600 }}>
                              {STATUS_TYPES.find(s => s.value === selected)?.label || selected}
                            </Typography>
                          </Box>
                        )}
                      >
                        {STATUS_TYPES.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: status.color,
                                  boxShadow: `0 0 8px ${alpha(status.color, 0.5)}`
                                }}
                              />
                              {status.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined" required>
                      <InputLabel 
                        sx={{
                          color: customTheme.primary,
                          fontWeight: 600,
                          '&.Mui-focused': { color: customTheme.primary }
                        }}
                      >
                        Priority Level
                      </InputLabel>
                      <Select
                        name="priority_level"
                        value={formData.priority_level}
                        onChange={handleChange}
                        label="Priority Level"
                        sx={selectStyles}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PriorityIcon 
                              sx={{ 
                                color: getPriorityColor(selected),
                                fontSize: 20,
                                animation: selected === 'EMERGENCY' ? `${pulse} 2s infinite` : 'none'
                              }} 
                            />
                            <Typography sx={{ fontWeight: 600 }}>
                              {PRIORITY_LEVELS.find(p => p.value === selected)?.label || selected}
                            </Typography>
                          </Box>
                        )}
                      >
                        {PRIORITY_LEVELS.map((priority) => (
                          <MenuItem key={priority.value} value={priority.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PriorityIcon 
                                sx={{ 
                                  color: priority.color,
                                  fontSize: 18,
                                  animation: priority.value === 'EMERGENCY' ? `${pulse} 2s infinite` : 'none'
                                }} 
                              />
                              {priority.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Slide>

            {/* Basic Information Section */}
            <Slide direction="left" in timeout={1000}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  borderRadius: 4,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.primary, 0.08)} 0%, ${alpha(customTheme.primary, 0.03)} 100%)
                  `,
                  border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: customTheme.primary,
                      width: 48,
                      height: 48,
                      boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.3)}`
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 700,
                        mb: 0.5
                      }}
                    >
                      Basic Information
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.7),
                        fontWeight: 500
                      }}
                    >
                      Essential animal identification details
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="name"
                      label="Animal Name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      sx={fieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel 
                        sx={{
                          color: customTheme.primary,
                          fontWeight: 600,
                          '&.Mui-focused': { color: customTheme.primary }
                        }}
                      >
                        Animal Type
                      </InputLabel>
                      <Select
                        name="animal_type"
                        value={formData.animal_type}
                        onChange={handleChange}
                        label="Animal Type"
                        sx={selectStyles}
                      >
                        {ANIMAL_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PetsIcon sx={{ color: customTheme.primary, fontSize: 18 }} />
                              {type.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="breed"
                      label="Breed"
                      value={formData.breed}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      sx={fieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel 
                        sx={{
                          color: customTheme.primary,
                          fontWeight: 600,
                          '&.Mui-focused': { color: customTheme.primary }
                        }}
                      >
                        Gender
                      </InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Gender"
                        sx={selectStyles}
                      >
                        {GENDER_TYPES.map((gender) => (
                          <MenuItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="age_estimate"
                      label="Age Estimate"
                      value={formData.age_estimate}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., 2 years, 6 months"
                      sx={fieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="weight"
                      label="Weight (lbs)"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      inputProps={{ step: 0.1, min: 0 }}
                      sx={fieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="color"
                      label="Color"
                      value={formData.color}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      sx={fieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="adoption_fee"
                      label="Adoption Fee ($)"
                      type="number"
                      value={formData.adoption_fee}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      inputProps={{ step: 1, min: 0 }}
                      sx={fieldStyles}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Slide>

            {/* Health & Behavior Section */}
            <Slide direction="right" in timeout={1200}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.success, 0.08)} 0%, ${alpha(customTheme.success, 0.03)} 100%)
                  `,
                  border: `3px solid ${alpha(customTheme.success, 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: customTheme.success,
                      width: 48,
                      height: 48,
                      boxShadow: `0 4px 15px ${alpha(customTheme.success, 0.3)}`
                    }}
                  >
                    <MedicalIcon sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 700,
                        mb: 0.5
                      }}
                    >
                      Health & Behavior Information
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: alpha(customTheme.primary, 0.7),
                        fontWeight: 500
                      }}
                    >
                      Medical records and behavioral assessments
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="health_status"
                      label="Health Status"
                      value={formData.health_status}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                      placeholder="Current health condition, treatments, medications..."
                      sx={fieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="behavior_notes"
                      label="Behavior Notes"
                      value={formData.behavior_notes}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={3}
                      placeholder="Behavioral characteristics, temperament, training level..."
                      sx={fieldStyles}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="special_needs"
                      label="Special Needs"
                      value={formData.special_needs}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                      placeholder="Medical requirements, dietary needs, special care..."
                      sx={fieldStyles}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Slide>
          </Box>
        </DialogContent>

        {/* Enhanced Dialog Actions */}
        <DialogActions sx={{ 
          p: 0,
          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
          borderTop: `3px solid ${alpha(customTheme.primary, 0.2)}`,
          position: 'relative',
          zIndex: 1
        }}>
          <Box sx={{ p: 4, display: 'flex', gap: 2, width: '100%' }}>
            <Button 
              onClick={handleClose} 
              disabled={loading}
              variant="outlined"
              size="large"
              startIcon={<CloseIcon />}
              sx={{
                flex: 1,
                py: 2,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 700,
                textTransform: 'none',
                borderColor: alpha(customTheme.primary, 0.5),
                color: customTheme.primary,
                borderWidth: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: customTheme.primary,
                  backgroundColor: alpha(customTheme.primary, 0.08),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                },
                '&:disabled': {
                  borderColor: alpha(customTheme.primary, 0.3),
                  color: alpha(customTheme.primary, 0.5)
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              size="large"
              startIcon={loading ? null : <SaveIcon />}
              sx={{ 
                flex: 2,
                py: 2,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 800,
                textTransform: 'none',
                background: loading 
                  ? `linear-gradient(45deg, ${alpha(customTheme.primary, 0.5)} 30%, ${alpha(customTheme.accent, 0.5)} 90%)`
                  : `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: loading 
                  ? 'none'
                  : `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: loading ? '0%' : '-100%',
                  width: '100%',
                  height: '100%',
                  background: loading 
                    ? `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`
                    : `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                  transition: 'left 0.6s ease',
                  animation: loading ? `${shimmer} 1.5s infinite linear` : 'none'
                },
                '&:hover:not(:disabled)': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.5)}`,
                  '&::before': {
                    left: '100%'
                  }
                },
                '&:disabled': {
                  color: alpha('#ffffff', 0.7)
                }
              }}
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EditAnimalForm;