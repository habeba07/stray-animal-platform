// components/HealthTracking/HealthStatusForm.js - ENHANCED VERSION with impressive styling

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
  Box,
  Typography,
  Chip,
  Paper,
  Fade,
  Slide,
  alpha,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  HealthAndSafety as HealthIcon,
  CalendarToday as CalendarIcon,
  MonitorWeight as WeightIcon,
  Thermostat as TempIcon,
  Notes as NotesIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63', // Warm Brown
  secondary: '#81c784', // Soft Green
  success: '#4caf50', // Fresh Green
  grey: '#f3e5ab', // Warm Cream
  accent: '#ff8a65', // Gentle Orange
  background: '#fff8e1', // Soft Cream
};

// Enhanced keyframe animations
const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const STATUS_CHOICES = [
  { value: 'HEALTHY', label: 'Healthy', color: customTheme.success, icon: '💚' },
  { value: 'SICK', label: 'Sick', color: customTheme.accent, icon: '🟡' },
  { value: 'INJURED', label: 'Injured', color: '#f44336', icon: '🔴' },
  { value: 'RECOVERING', label: 'Recovering', color: customTheme.secondary, icon: '🟢' },
  { value: 'CRITICAL', label: 'Critical', color: '#d32f2f', icon: '🔴' },
  { value: 'QUARANTINE', label: 'In Quarantine', color: '#ff9800', icon: '🟠' },
];

function HealthStatusForm({ open, onClose, onSubmit, animalId, currentStatus }) {
  const [formData, setFormData] = useState({
    current_status: 'HEALTHY',
    last_checkup_date: null,
    next_checkup_date: null,
    weight: '',
    temperature: '',
    notes: '',
  });

  useEffect(() => {
    if (currentStatus) {
      setFormData({
        current_status: currentStatus.current_status || 'HEALTHY',
        last_checkup_date: currentStatus.last_checkup_date ? new Date(currentStatus.last_checkup_date) : null,
        next_checkup_date: currentStatus.next_checkup_date ? new Date(currentStatus.next_checkup_date) : null,
        weight: currentStatus.weight || '',
        temperature: currentStatus.temperature || '',
        notes: currentStatus.notes || '',
      });
    }
  }, [currentStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      animal: animalId,
      last_checkup_date: formData.last_checkup_date ? formData.last_checkup_date.toISOString().split('T')[0] : null,
      next_checkup_date: formData.next_checkup_date ? formData.next_checkup_date.toISOString().split('T')[0] : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
    };
    onSubmit(submitData);
    onClose();
  };

  const getStatusInfo = (status) => {
    return STATUS_CHOICES.find(choice => choice.value === status) || STATUS_CHOICES[0];
  };

  const currentStatusInfo = getStatusInfo(formData.current_status);

  const getTemperatureStatus = (temp) => {
    if (!temp) return null;
    const temperature = parseFloat(temp);
    if (temperature < 37.5) return { label: 'Low', color: customTheme.secondary };
    if (temperature > 39.5) return { label: 'High', color: '#f44336' };
    return { label: 'Normal', color: customTheme.success };
  };

  const getWeightTrend = () => {
    // Mock trend calculation - in real app, this would compare with previous records
    return { trend: 'stable', icon: <TrendingUpIcon />, color: customTheme.success };
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 6,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
          maxHeight: '95vh',
          margin: '16px'
        }
      }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          animation: `${float} 6s ease-in-out infinite`,
          opacity: 0.3,
          zIndex: 0
        }}
      >
        <HealthIcon sx={{ fontSize: 80, color: customTheme.primary, transform: 'rotate(15deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: -15,
          left: -15,
          animation: `${float} 8s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.2,
          zIndex: 0
        }}
      >
        <AssessmentIcon sx={{ fontSize: 60, color: customTheme.accent, transform: 'rotate(-20deg)' }} />
      </Box>

      {/* Top gradient bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
          backgroundSize: '200% 200%',
          animation: `${gradientShift} 4s ease infinite`,
          zIndex: 1
        }}
      />

      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ 
          position: 'relative', 
          zIndex: 1,
          borderBottom: `1px solid ${alpha(customTheme.primary, 0.1)}`
        }}>
          <Fade in timeout={800}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              pt: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.accent, 0.1)} 100%)`,
                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                    animation: `${float} 4s ease-in-out infinite`
                  }}
                >
                  <HealthIcon sx={{ fontSize: 32, color: customTheme.primary }} />
                </Box>
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800,
                      background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 70%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Update Health Status
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500 
                    }}
                  >
                    Track and monitor animal health metrics
                  </Typography>
                </Box>
              </Box>
              
              <Tooltip title="Close" arrow>
                <IconButton 
                  onClick={onClose}
                  sx={{
                    color: customTheme.primary,
                    backgroundColor: alpha(customTheme.primary, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(customTheme.primary, 0.2),
                      transform: 'scale(1.1) rotate(90deg)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Fade>
        </DialogTitle>

        <DialogContent sx={{ 
          position: 'relative', 
          zIndex: 1, 
          px: 4, 
          pb: 2,
          maxHeight: '60vh',
          overflow: 'auto'
        }}>
          <Slide direction="up" in timeout={1000}>
            <Box>
              {/* Current Status Overview Card */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  mb: 4, 
                  borderRadius: 5,
                  background: `
                    linear-gradient(135deg, ${alpha(currentStatusInfo.color, 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
                  `,
                  border: `3px solid ${alpha(currentStatusInfo.color, 0.3)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `${slideInUp} 1s ease-out`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${alpha(currentStatusInfo.color, 0.1)}, transparent)`,
                    animation: `${shimmer} 3s infinite`,
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                    Current Health Overview
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip
                      label={currentStatusInfo.label}
                      sx={{
                        backgroundColor: currentStatusInfo.color,
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '1rem',
                        px: 2,
                        py: 1
                      }}
                    />
                    {formData.weight && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WeightIcon sx={{ color: customTheme.primary, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                          {formData.weight} kg
                        </Typography>
                      </Box>
                    )}
                    {formData.temperature && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TempIcon sx={{ color: customTheme.primary, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                          {formData.temperature}°C
                        </Typography>
                        {getTemperatureStatus(formData.temperature) && (
                          <Chip
                            label={getTemperatureStatus(formData.temperature).label}
                            size="small"
                            sx={{
                              backgroundColor: getTemperatureStatus(formData.temperature).color,
                              color: '#ffffff',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>

              <Grid container spacing={4}>
                {/* Health Status Selection */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HealthIcon sx={{ fontSize: 24 }} />
                      Health Status
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel 
                        sx={{ 
                          color: customTheme.primary, 
                          fontWeight: 600,
                          '&.Mui-focused': { color: customTheme.primary }
                        }}
                      >
                        Current Status
                      </InputLabel>
                      <Select
                        name="current_status"
                        value={formData.current_status}
                        onChange={handleChange}
                        label="Current Status"
                        required
                        sx={{
                          borderRadius: 3,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(currentStatusInfo.color, 0.3),
                            borderWidth: 2
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: currentStatusInfo.color
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: currentStatusInfo.color
                          }
                        }}
                      >
                        {STATUS_CHOICES.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: status.color
                                }}
                              />
                              <Typography sx={{ fontWeight: 600 }}>
                                {status.label}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Paper>
                </Grid>

                {/* Date Fields */}
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `2px solid ${alpha(customTheme.secondary, 0.15)}`,
                      height: '100%'
                    }}
                  >
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ fontSize: 24 }} />
                      Checkup Dates
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Box sx={{ mb: 3 }}>
                        <DatePicker
                          label="Last Checkup Date"
                          value={formData.last_checkup_date}
                          onChange={(date) => handleDateChange('last_checkup_date', date)}
                          renderInput={(params) => 
                            <TextField 
                              {...params} 
                              fullWidth 
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
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
                                  color: customTheme.secondary,
                                  fontWeight: 600,
                                  '&.Mui-focused': { color: customTheme.secondary }
                                }
                              }}
                            />
                          }
                        />
                      </Box>
                      <DatePicker
                        label="Next Checkup Date"
                        value={formData.next_checkup_date}
                        onChange={(date) => handleDateChange('next_checkup_date', date)}
                        renderInput={(params) => 
                          <TextField 
                            {...params} 
                            fullWidth 
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
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
                                color: customTheme.accent,
                                fontWeight: 600,
                                '&.Mui-focused': { color: customTheme.accent }
                              }
                            }}
                          />
                        }
                      />
                    </LocalizationProvider>
                  </Paper>
                </Grid>

                {/* Vital Signs */}
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `2px solid ${alpha(customTheme.accent, 0.15)}`,
                      height: '100%'
                    }}
                  >
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 24 }} />
                      Vital Signs
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="weight"
                        label="Weight (kg)"
                        type="number"
                        fullWidth
                        value={formData.weight}
                        onChange={handleChange}
                        inputProps={{ step: "0.1" }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
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
                            color: customTheme.success,
                            fontWeight: 600,
                            '&.Mui-focused': { color: customTheme.success }
                          }
                        }}
                      />
                    </Box>
                    <TextField
                      name="temperature"
                      label="Temperature (°C)"
                      type="number"
                      fullWidth
                      value={formData.temperature}
                      onChange={handleChange}
                      inputProps={{ step: "0.1" }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          '& fieldset': {
                            borderColor: alpha('#f44336', 0.3),
                            borderWidth: 2
                          },
                          '&:hover fieldset': {
                            borderColor: '#f44336'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#f44336'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#f44336',
                          fontWeight: 600,
                          '&.Mui-focused': { color: '#f44336' }
                        }
                      }}
                    />
                  </Paper>
                </Grid>

                {/* Notes Section */}
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotesIcon sx={{ fontSize: 24 }} />
                      Additional Notes
                    </Typography>
                    <TextField
                      name="notes"
                      label="Health Notes"
                      fullWidth
                      multiline
                      rows={4}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Document any observations, behaviors, symptoms, or treatment notes..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
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
                          fontWeight: 600,
                          '&.Mui-focused': { color: customTheme.primary }
                        }
                      }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Slide>
        </DialogContent>

        <DialogActions sx={{ 
          p: 4, 
          position: 'relative', 
          zIndex: 1,
          borderTop: `1px solid ${alpha(customTheme.primary, 0.1)}`
        }}>
          <Fade in timeout={1200}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={onClose}
                variant="outlined"
                sx={{
                  borderColor: customTheme.primary,
                  color: customTheme.primary,
                  borderWidth: 2,
                  fontWeight: 700,
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: customTheme.primary,
                    borderWidth: 2,
                    backgroundColor: alpha(customTheme.primary, 0.1),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                  fontWeight: 700,
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`,
                    '&::before': {
                      transform: 'translateX(100%)'
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                    transition: 'transform 0.6s ease'
                  }
                }}
              >
                Update Status
              </Button>
            </Box>
          </Fade>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default HealthStatusForm;