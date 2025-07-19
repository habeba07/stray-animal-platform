// components/HealthTracking/VaccinationForm.js - ENHANCED VERSION with impressive styling and inventory integration

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Box,
  Typography,
  Chip,
  Autocomplete,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Fade,
  Slide,
  alpha,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Vaccines as VaccinesIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as ClinicIcon,
  Science as ScienceIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  TrendingDown as TrendingDownIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';
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

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha('#f44336', 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha('#f44336', 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha('#f44336', 0)}; }
`;

const VACCINE_TYPES = [
  { value: 'RABIES', label: 'Rabies', color: '#f44336' },
  { value: 'DISTEMPER', label: 'Distemper', color: customTheme.accent },
  { value: 'PARVOVIRUS', label: 'Parvovirus', color: '#e91e63' },
  { value: 'HEPATITIS', label: 'Hepatitis', color: customTheme.primary },
  { value: 'LEPTOSPIROSIS', label: 'Leptospirosis', color: '#9c27b0' },
  { value: 'BORDETELLA', label: 'Bordetella', color: customTheme.secondary },
  { value: 'LYME', label: 'Lyme Disease', color: '#607d8b' },
  { value: 'FVRCP', label: 'FVRCP (Cats)', color: '#ff9800' },
  { value: 'FELV', label: 'Feline Leukemia', color: '#795548' },
  { value: 'OTHER', label: 'Other', color: '#2196f3' },
];

function VaccinationForm({ open, onClose, onSubmit, animalId }) {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    vaccine_type: '',
    vaccine_name: '',
    date_administered: new Date(),
    next_due_date: null,
    veterinarian: '',
    clinic_name: '',
    batch_number: '',
    notes: '',
    quantity_used: 1,
    inventory_item: null,
  });
  
  // Inventory integration states
  const [availableVaccines, setAvailableVaccines] = useState([]);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [stockWarnings, setStockWarnings] = useState([]);
  
  // Fetch available vaccines from inventory
  useEffect(() => {
    if (open && user?.user_type === 'SHELTER') {
      fetchAvailableVaccines();
    }
  }, [open, user]);

  // Update due date when vaccine type changes
  useEffect(() => {
    if (formData.vaccine_type && formData.date_administered) {
      const dueDate = calculateNextDueDate(formData.vaccine_type, formData.date_administered);
      setFormData(prev => ({ ...prev, next_due_date: dueDate }));
    }
  }, [formData.vaccine_type, formData.date_administered]);

  const fetchAvailableVaccines = async () => {
    try {
      setInventoryLoading(true);
      const response = await api.get('/inventory-items/?category=vaccines');
      const vaccines = response.data.filter(item => item.quantity > 0);
      setAvailableVaccines(vaccines);
      
      // Check for low stock warnings
      const lowStock = vaccines.filter(item => item.quantity <= (item.reorder_level || 5));
      setStockWarnings(lowStock);
    } catch (err) {
      console.error('Error fetching vaccine inventory:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const calculateNextDueDate = (vaccineType, adminDate) => {
    if (!adminDate) return null;
    
    const intervals = {
      'RABIES': 365, // 1 year
      'DISTEMPER': 365,
      'PARVOVIRUS': 365,
      'HEPATITIS': 365,
      'LEPTOSPIROSIS': 365,
      'BORDETELLA': 180, // 6 months
      'LYME': 365,
      'FVRCP': 365,
      'FELV': 365,
      'OTHER': 365
    };
    
    const days = intervals[vaccineType] || 365;
    const dueDate = new Date(adminDate);
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  };

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

  // Handle inventory item selection
  const handleInventorySelection = (event, newValue) => {
    setSelectedInventoryItem(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        inventory_item: newValue.id,
        vaccine_name: newValue.name,
        batch_number: newValue.batch_number || '',
        // Auto-suggest vaccine type based on inventory item name
        vaccine_type: suggestVaccineType(newValue.name)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        inventory_item: null,
        vaccine_name: '',
        batch_number: ''
      }));
    }
  };

  // Suggest vaccine type based on inventory item name
  const suggestVaccineType = (itemName) => {
    const name = itemName.toLowerCase();
    for (const vaccine of VACCINE_TYPES) {
      if (name.includes(vaccine.label.toLowerCase())) {
        return vaccine.value;
      }
    }
    return '';
  };

  // Check if enough inventory is available
  const checkInventoryAvailability = () => {
    if (!selectedInventoryItem) return true;
    return selectedInventoryItem.quantity >= formData.quantity_used;
  };

  // Get stock status color
  const getStockColor = (quantity, reorderLevel) => {
    if (quantity <= (reorderLevel || 5)) return 'error';
    if (quantity <= (reorderLevel || 5) * 2) return 'warning';
    return 'success';
  };

  // Get vaccine type info
  const getVaccineTypeInfo = (type) => {
    return VACCINE_TYPES.find(vaccine => vaccine.value === type) || VACCINE_TYPES[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inventory if selected
    if (selectedInventoryItem && !checkInventoryAvailability()) {
      alert('Insufficient inventory quantity available');
      return;
    }
    
    const submitData = {
      ...formData,
      animal: animalId,
      date_administered: formData.date_administered.toISOString().split('T')[0],
      next_due_date: formData.next_due_date ? formData.next_due_date.toISOString().split('T')[0] : null,
    };
    
    onSubmit(submitData);
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      vaccine_type: '',
      vaccine_name: '',
      date_administered: new Date(),
      next_due_date: null,
      veterinarian: '',
      clinic_name: '',
      batch_number: '',
      notes: '',
      quantity_used: 1,
      inventory_item: null,
    });
    setSelectedInventoryItem(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const currentVaccineInfo = getVaccineTypeInfo(formData.vaccine_type);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 6,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
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
        <VaccinesIcon sx={{ fontSize: 80, color: customTheme.secondary, transform: 'rotate(15deg)' }} />
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
        <MedicationIcon sx={{ fontSize: 60, color: customTheme.accent, transform: 'rotate(-20deg)' }} />
      </Box>

      {/* Top gradient bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${customTheme.secondary}, ${customTheme.accent}, ${customTheme.primary})`,
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
                    background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.accent, 0.1)} 100%)`,
                    border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                    animation: `${float} 4s ease-in-out infinite`
                  }}
                >
                  <VaccinesIcon sx={{ fontSize: 32, color: customTheme.secondary }} />
                </Box>
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800,
                      background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${customTheme.accent} 70%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Add Vaccination Record
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500 
                    }}
                  >
                    Document vaccination details and manage inventory
                  </Typography>
                </Box>
              </Box>
              
              <Tooltip title="Close" arrow>
                <IconButton 
                  onClick={handleClose}
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
              {/* Stock warnings for SHELTER users */}
              {user?.user_type === 'SHELTER' && stockWarnings.length > 0 && (
                <Fade in timeout={600}>
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 4,
                      borderRadius: 4,
                      backgroundColor: alpha(customTheme.accent, 0.1),
                      border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${alpha(customTheme.accent, 0.1)}, transparent)`,
                        animation: `${shimmer} 3s infinite`,
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon />
                        Low vaccine stock alert
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {stockWarnings.map((item, index) => (
                          <Chip 
                            key={index}
                            label={`${item.name}: ${item.quantity} left`}
                            color="warning"
                            size="small"
                            sx={{ 
                              mr: 1, 
                              mb: 0.5,
                              fontWeight: 600,
                              animation: index % 2 === 0 ? `${pulse} 2s infinite` : 'none'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Alert>
                </Fade>
              )}

              {/* Inventory Selection for SHELTER users */}
              {user?.user_type === 'SHELTER' && (
                <Slide direction="down" in timeout={1200}>
                  <Paper 
                    sx={{ 
                      p: 4, 
                      mb: 4,
                      borderRadius: 5,
                      background: `
                        linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
                      `,
                      border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${customTheme.secondary}, ${customTheme.accent})`,
                        animation: `${gradientShift} 3s ease infinite`
                      }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="h5" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        color: customTheme.primary,
                        fontWeight: 800,
                        mb: 3
                      }}>
                        <InventoryIcon sx={{ fontSize: 28 }} />
                        Vaccine Inventory
                      </Typography>
                      
                      {inventoryLoading ? (
                        <Box sx={{ mb: 3 }}>
                          <LinearProgress 
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha(customTheme.grey, 0.3),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: customTheme.secondary,
                                borderRadius: 4
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ mt: 1, color: customTheme.primary, fontWeight: 600 }}>
                            Loading vaccine inventory...
                          </Typography>
                        </Box>
                      ) : (
                        <Autocomplete
                          value={selectedInventoryItem}
                          onChange={handleInventorySelection}
                          options={availableVaccines}
                          getOptionLabel={(option) => `${option.name} (${option.quantity} available)`}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              label="Select Vaccine from Inventory" 
                              placeholder="Choose a vaccine or leave empty for manual entry"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  '& fieldset': {
                                    borderColor: alpha(customTheme.primary, 0.4),
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
                                },
                                '& .MuiInputBase-input': {
                                  color: customTheme.primary,
                                  fontWeight: 600
                                }
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component="li" {...props}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>{option.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Stock: {option.quantity} {option.unit}
                                  {option.batch_number && ` | Batch: ${option.batch_number}`}
                                  {option.expiry_date && ` | Expires: ${new Date(option.expiry_date).toLocaleDateString()}`}
                                </Typography>
                              </Box>
                              <Chip
                                label={option.quantity}
                                color={getStockColor(option.quantity, option.reorder_level)}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          )}
                        />
                      )}
                      
                      {selectedInventoryItem && (
                        <Fade in timeout={800}>
                          <Box sx={{ 
                            mt: 3, 
                            p: 3, 
                            backgroundColor: alpha(customTheme.success, 0.1), 
                            borderRadius: 4,
                            border: `2px solid ${alpha(customTheme.success, 0.2)}`
                          }}>
                            <Typography variant="h6" gutterBottom sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: customTheme.success,
                              fontWeight: 700
                            }}>
                              <CheckCircleIcon />
                              Selected: {selectedInventoryItem.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                              <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                                Available: {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                              </Typography>
                              <TextField
                                label="Quantity to Use"
                                type="number"
                                size="small"
                                value={formData.quantity_used}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity_used: parseFloat(e.target.value) || 1 }))}
                                inputProps={{ min: 0.1, max: selectedInventoryItem.quantity, step: 0.1 }}
                                sx={{ 
                                  width: 150,
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
                            </Box>
                            
                            {!checkInventoryAvailability() && (
                              <Alert severity="error" sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Insufficient quantity available. Maximum: {selectedInventoryItem.quantity}
                                </Typography>
                              </Alert>
                            )}
                          </Box>
                        </Fade>
                      )}
                    </Box>
                  </Paper>
                </Slide>
              )}

              <Grid container spacing={4}>
                {/* Vaccine Information Section */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `3px solid ${alpha(currentVaccineInfo.color, 0.3)}`,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 800, 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}>
                      <ScienceIcon sx={{ fontSize: 28 }} />
                      Vaccine Information
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel 
                          sx={{ 
                            color: currentVaccineInfo.color, 
                            fontWeight: 600,
                            '&.Mui-focused': { color: currentVaccineInfo.color }
                          }}
                        >
                          Vaccine Type
                        </InputLabel>
                        <Select
                          name="vaccine_type"
                          value={formData.vaccine_type}
                          onChange={handleChange}
                          label="Vaccine Type"
                          required
                          sx={{
                            borderRadius: 3,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha(currentVaccineInfo.color, 0.3),
                              borderWidth: 2
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: currentVaccineInfo.color
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: currentVaccineInfo.color
                            }
                          }}
                        >
                          {VACCINE_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: type.color
                                  }}
                                />
                                <Typography sx={{ fontWeight: 600 }}>
                                  {type.label}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <TextField
                      name="vaccine_name"
                      label="Vaccine Name"
                      fullWidth
                      value={formData.vaccine_name}
                      onChange={handleChange}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '& fieldset': {
                            borderColor: alpha(customTheme.primary, 0.4),
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
                        },
                        '& .MuiInputBase-input': {
                          color: customTheme.primary,
                          fontWeight: 600
                        }
                      }}
                    />

                    <TextField
                      name="batch_number"
                      label="Batch Number"
                      fullWidth
                      value={formData.batch_number}
                      onChange={handleChange}
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
                  </Paper>
                </Grid>

                {/* Date & Schedule Section */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 800, 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}>
                      <ScheduleIcon sx={{ fontSize: 28 }} />
                      Schedule & Dates
                    </Typography>
                    
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Box sx={{ mb: 3 }}>
                        <DatePicker
                          label="Date Administered"
                          value={formData.date_administered}
                          onChange={(date) => handleDateChange('date_administered', date)}
                          renderInput={(params) => 
                            <TextField 
                              {...params} 
                              fullWidth 
                              required 
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
                          }
                        />
                      </Box>
                      
                      <DatePicker
                        label="Next Due Date"
                        value={formData.next_due_date}
                        onChange={(date) => handleDateChange('next_due_date', date)}
                        renderInput={(params) => 
                          <TextField 
                            {...params} 
                            fullWidth 
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
                        }
                      />
                    </LocalizationProvider>
                    
                    {formData.next_due_date && (
                      <Fade in timeout={800}>
                        <Alert 
                          severity="info" 
                          sx={{ 
                            mt: 2,
                            borderRadius: 3,
                            backgroundColor: alpha(customTheme.secondary, 0.1),
                            border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon sx={{ fontSize: 16 }} />
                            Auto-calculated based on vaccine type and schedule
                          </Typography>
                        </Alert>
                      </Fade>
                    )}
                  </Paper>
                </Grid>

                {/* Veterinarian Information */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
                      height: '100%'
                    }}
                  >
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 800, 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}>
                      <ClinicIcon sx={{ fontSize: 28 }} />
                      Veterinarian Info
                    </Typography>
                    
                    <TextField
                      name="veterinarian"
                      label="Veterinarian"
                      fullWidth
                      value={formData.veterinarian}
                      onChange={handleChange}
                      required
                      sx={{
                        mb: 3,
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
                    
                    <TextField
                      name="clinic_name"
                      label="Clinic Name"
                      fullWidth
                      value={formData.clinic_name}
                      onChange={handleChange}
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
                  </Paper>
                </Grid>

                {/* Notes Section */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                      height: '100%'
                    }}
                  >
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 800, 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}>
                      <AssessmentIcon sx={{ fontSize: 28 }} />
                      Additional Notes
                    </Typography>
                    
                    <TextField
                      name="notes"
                      label="Vaccination Notes"
                      fullWidth
                      multiline
                      rows={6}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Document any observations, reactions, or special instructions..."
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

                {/* Inventory Impact Preview for SHELTER users */}
                {user?.user_type === 'SHELTER' && selectedInventoryItem && (
                  <Grid item xs={12}>
                    <Fade in timeout={1400}>
                      <Paper 
                        sx={{ 
                          p: 4,
                          borderRadius: 5,
                          background: `linear-gradient(135deg, ${alpha('#fff3e0', 0.8)} 0%, ${alpha(customTheme.background, 0.9)} 100%)`,
                          border: `3px solid ${alpha(customTheme.accent, 0.3)}`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: `linear-gradient(90deg, ${customTheme.accent}, ${customTheme.secondary})`,
                            animation: `${gradientShift} 3s ease infinite`
                          }}
                        />
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <Typography variant="h5" gutterBottom sx={{ 
                            color: customTheme.primary,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 3
                          }}>
                            <TrendingDownIcon sx={{ fontSize: 28 }} />
                            Inventory Impact Preview
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={6}>
                              <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600, mb: 1 }}>
                                Current Stock:
                              </Typography>
                              <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                                {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600, mb: 1 }}>
                                After Use:
                              </Typography>
                              <Typography variant="h4" sx={{ color: customTheme.accent, fontWeight: 800 }}>
                                {(selectedInventoryItem.quantity - formData.quantity_used).toFixed(1)} {selectedInventoryItem.unit}
                              </Typography>
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ mt: 3 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={((selectedInventoryItem.quantity - formData.quantity_used) / selectedInventoryItem.quantity) * 100}
                              sx={{
                                height: 16,
                                borderRadius: 8,
                                backgroundColor: alpha(customTheme.grey, 0.3),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getStockColor(selectedInventoryItem.quantity - formData.quantity_used, selectedInventoryItem.reorder_level) === 'error' ? '#f44336' : 
                                                 getStockColor(selectedInventoryItem.quantity - formData.quantity_used, selectedInventoryItem.reorder_level) === 'warning' ? customTheme.accent : customTheme.success,
                                  borderRadius: 8,
                                }
                              }}
                            />
                          </Box>
                          
                          {(selectedInventoryItem.quantity - formData.quantity_used) <= (selectedInventoryItem.reorder_level || 5) && (
                            <Alert severity="warning" sx={{ mt: 2, borderRadius: 3 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                This will bring stock below reorder level. Consider restocking soon.
                              </Typography>
                            </Alert>
                          )}
                        </Box>
                      </Paper>
                    </Fade>
                  </Grid>
                )}
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
          <Fade in timeout={1400}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={handleClose}
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
                disabled={selectedInventoryItem && !checkInventoryAvailability()}
                sx={{
                  background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${alpha(customTheme.secondary, 0.8)} 90%)`,
                  fontWeight: 700,
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${alpha(customTheme.secondary, 0.9)} 30%, ${customTheme.secondary} 90%)`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 35px ${alpha(customTheme.secondary, 0.4)}`,
                    '&::before': {
                      transform: 'translateX(100%)'
                    }
                  },
                  '&:disabled': {
                    background: alpha(customTheme.grey, 0.3),
                    color: alpha(customTheme.primary, 0.5)
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
                Add Vaccination
              </Button>
            </Box>
          </Fade>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default VaccinationForm;