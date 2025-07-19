// components/HealthTracking/MedicalRecordForm.js - ENHANCED VERSION with impressive styling and inventory integration

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
  FormControlLabel,
  Checkbox,
  Alert,
  Box,
  Typography,
  Chip,
  Autocomplete,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Fade,
  Slide,
  alpha,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  MedicalServices as MedicalServicesIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  AttachMoney as AttachMoneyIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as ClinicIcon,
  Assignment as AssignmentIcon,
  MonetizationOn as CostIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Healing as HealingIcon,
  Science as ScienceIcon,
  EventAvailable as FollowUpIcon,
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

const RECORD_TYPES = [
  { value: 'CHECKUP', label: 'Regular Checkup', color: customTheme.secondary, icon: '🔍' },
  { value: 'TREATMENT', label: 'Treatment', color: customTheme.primary, icon: '💊' },
  { value: 'SURGERY', label: 'Surgery', color: '#f44336', icon: '🏥' },
  { value: 'EMERGENCY', label: 'Emergency', color: '#d32f2f', icon: '🚨' },
  { value: 'FOLLOW_UP', label: 'Follow-up', color: customTheme.accent, icon: '📅' },
  { value: 'OTHER', label: 'Other', color: '#2196f3', icon: '📋' },
];

const TREATMENT_CATEGORIES = [
  { value: 'MEDICATION', label: 'Medication Administration', color: customTheme.accent },
  { value: 'WOUND_CARE', label: 'Wound Care', color: '#f44336' },
  { value: 'SURGERY', label: 'Surgical Procedure', color: '#d32f2f' },
  { value: 'DIAGNOSTIC', label: 'Diagnostic Test', color: customTheme.secondary },
  { value: 'PREVENTIVE', label: 'Preventive Care', color: customTheme.success },
  { value: 'EMERGENCY', label: 'Emergency Treatment', color: '#ff1744' },
  { value: 'REHABILITATION', label: 'Rehabilitation', color: customTheme.primary },
];

function MedicalRecordForm({ open, onClose, onSubmit, animalId }) {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    record_type: '',
    treatment_category: '',
    date: new Date(),
    veterinarian: '',
    clinic_name: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    follow_up_required: false,
    follow_up_date: null,
    estimated_cost: '',
    actual_cost: '',
    notes: ''
  });
  
  // Medical supplies tracking
  const [medicalSupplies, setMedicalSupplies] = useState([]);
  const [selectedSupplies, setSelectedSupplies] = useState([]);
  const [availableSupplies, setAvailableSupplies] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [stockWarnings, setStockWarnings] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  // Fetch available medical supplies from inventory
  useEffect(() => {
    if (open && user?.user_type === 'SHELTER') {
      fetchAvailableSupplies();
    }
  }, [open, user]);

  // Calculate total cost when supplies or costs change
  useEffect(() => {
    calculateTotalCost();
  }, [selectedSupplies, formData.estimated_cost, formData.actual_cost]);

  const fetchAvailableSupplies = async () => {
    try {
      setInventoryLoading(true);
      const response = await api.get('/inventory-items/?category=medical,medications,surgical_supplies,wound_care');
      const supplies = response.data.filter(item => item.quantity > 0);
      setAvailableSupplies(supplies);
      
      // Check for low stock warnings
      const lowStock = supplies.filter(item => item.quantity <= (item.reorder_level || 5));
      setStockWarnings(lowStock);
    } catch (err) {
      console.error('Error fetching medical supplies:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const calculateTotalCost = () => {
    let supplyCost = selectedSupplies.reduce((total, supply) => {
      return total + ((supply.cost_per_unit || 0) * (supply.quantity_used || 1));
    }, 0);
    
    let treatmentCost = parseFloat(formData.estimated_cost || formData.actual_cost || 0);
    setTotalCost(supplyCost + treatmentCost);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Handle adding medical supplies
  const handleAddSupply = (event, newValue) => {
    if (newValue && !selectedSupplies.find(s => s.id === newValue.id)) {
      const supplyToAdd = {
        ...newValue,
        quantity_used: 1,
        cost_per_unit: newValue.cost_per_unit || 0
      };
      setSelectedSupplies(prev => [...prev, supplyToAdd]);
    }
  };

  // Handle removing medical supplies
  const handleRemoveSupply = (supplyId) => {
    setSelectedSupplies(prev => prev.filter(s => s.id !== supplyId));
  };

  // Handle updating supply quantity
  const handleSupplyQuantityChange = (supplyId, quantity) => {
    setSelectedSupplies(prev => prev.map(s => 
      s.id === supplyId ? { ...s, quantity_used: quantity } : s
    ));
  };

  // Check if enough inventory is available for all supplies
  const checkInventoryAvailability = () => {
    return selectedSupplies.every(supply => 
      supply.quantity >= supply.quantity_used
    );
  };

  // Get supply usage warnings
  const getSupplyWarnings = () => {
    return selectedSupplies.filter(supply => 
      (supply.quantity - supply.quantity_used) <= (supply.reorder_level || 5)
    );
  };

  // Suggest treatment category based on reason
  const suggestTreatmentCategory = (reason) => {
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes('wound') || reasonLower.includes('injury')) return 'WOUND_CARE';
    if (reasonLower.includes('surgery') || reasonLower.includes('operation')) return 'SURGERY';
    if (reasonLower.includes('medication') || reasonLower.includes('drug')) return 'MEDICATION';
    if (reasonLower.includes('emergency') || reasonLower.includes('urgent')) return 'EMERGENCY';
    if (reasonLower.includes('checkup') || reasonLower.includes('exam')) return 'DIAGNOSTIC';
    return '';
  };

  const handleReasonChange = (e) => {
    const reason = e.target.value;
    setFormData(prev => ({
      ...prev,
      reason,
      treatment_category: prev.treatment_category || suggestTreatmentCategory(reason)
    }));
  };

  // Get record type info
  const getRecordTypeInfo = (type) => {
    return RECORD_TYPES.find(record => record.value === type) || RECORD_TYPES[0];
  };

  // Get treatment category info
  const getTreatmentCategoryInfo = (category) => {
    return TREATMENT_CATEGORIES.find(cat => cat.value === category) || TREATMENT_CATEGORIES[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inventory availability
    if (!checkInventoryAvailability()) {
      alert('Insufficient inventory quantity available for selected supplies');
      return;
    }
    
    const submitData = {
      ...formData,
      animal: animalId,
      date: formData.date.toISOString().split('T')[0],
      follow_up_date: formData.follow_up_date ? formData.follow_up_date.toISOString().split('T')[0] : null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
      // Include selected supplies for inventory tracking
      medical_supplies_used: selectedSupplies.map(supply => ({
        inventory_item: supply.id,
        quantity_used: supply.quantity_used,
        cost_per_unit: supply.cost_per_unit
      }))
    };
    
    onSubmit(submitData);
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      record_type: '',
      treatment_category: '',
      date: new Date(),
      veterinarian: '',
      clinic_name: '',
      reason: '',
      diagnosis: '',
      treatment: '',
      medications: '',
      follow_up_required: false,
      follow_up_date: null,
      estimated_cost: '',
      actual_cost: '',
      notes: ''
    });
    setSelectedSupplies([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const currentRecordInfo = getRecordTypeInfo(formData.record_type);
  const currentCategoryInfo = getTreatmentCategoryInfo(formData.treatment_category);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 6,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.primary, 0.2)} 0%, transparent 50%),
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
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 500 }}
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
        <MedicalServicesIcon sx={{ fontSize: 80, color: customTheme.primary, transform: 'rotate(15deg)' }} />
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
        <HealingIcon sx={{ fontSize: 60, color: customTheme.accent, transform: 'rotate(-20deg)' }} />
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
                  <MedicalServicesIcon sx={{ fontSize: 32, color: customTheme.primary }} />
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
                    Add Medical Record
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500 
                    }}
                  >
                    Document medical treatment and manage resources
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
                        Low medical supply stock alert
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {stockWarnings.slice(0, 5).map((item, index) => (
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
                        {stockWarnings.length > 5 && (
                          <Chip 
                            label={`+${stockWarnings.length - 5} more`}
                            color="warning"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Alert>
                </Fade>
              )}

              <Grid container spacing={4}>
                {/* Record Type & Category Section */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      background: `linear-gradient(135deg, ${alpha(currentRecordInfo.color, 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `3px solid ${alpha(currentRecordInfo.color, 0.3)}`,
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
                      <AssignmentIcon sx={{ fontSize: 28 }} />
                      Record Information
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel 
                          sx={{ 
                            color: currentRecordInfo.color, 
                            fontWeight: 600,
                            '&.Mui-focused': { color: currentRecordInfo.color }
                          }}
                        >
                          Record Type
                        </InputLabel>
                        <Select
                          name="record_type"
                          value={formData.record_type}
                          onChange={handleChange}
                          label="Record Type"
                          required
                          sx={{
                            borderRadius: 3,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha(currentRecordInfo.color, 0.3),
                              borderWidth: 2
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: currentRecordInfo.color
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: currentRecordInfo.color
                            }
                          }}
                        >
                          {RECORD_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

                    <FormControl fullWidth>
                      <InputLabel 
                        sx={{ 
                          color: currentCategoryInfo.color, 
                          fontWeight: 600,
                          '&.Mui-focused': { color: currentCategoryInfo.color }
                        }}
                      >
                        Treatment Category
                      </InputLabel>
                      <Select
                        name="treatment_category"
                        value={formData.treatment_category}
                        onChange={handleChange}
                        label="Treatment Category"
                        sx={{
                          borderRadius: 3,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(currentCategoryInfo.color, 0.3),
                            borderWidth: 2
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: currentCategoryInfo.color
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: currentCategoryInfo.color
                          }
                        }}
                      >
                        {TREATMENT_CATEGORIES.map((cat) => (
                          <MenuItem key={cat.value} value={cat.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: cat.color
                                }}
                              />
                              <Typography sx={{ fontWeight: 600 }}>
                                {cat.label}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Paper>
                </Grid>

                {/* Date & Veterinarian Info */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
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
                      Date & Veterinarian
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Date"
                          value={formData.date}
                          onChange={(date) => handleDateChange('date', date)}
                          renderInput={(params) => 
                            <TextField 
                              {...params} 
                              fullWidth 
                              required 
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                      </LocalizationProvider>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="veterinarian"
                        label="Veterinarian"
                        fullWidth
                        value={formData.veterinarian}
                        onChange={handleChange}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                          },
                          '& .MuiInputBase-input': {
                            color: customTheme.primary,
                            fontWeight: 600
                          }
                        }}
                      />
                    </Box>
                    
                    <TextField
                      name="clinic_name"
                      label="Clinic Name"
                      fullWidth
                      value={formData.clinic_name}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                        },
                        '& .MuiInputBase-input': {
                          color: customTheme.primary,
                          fontWeight: 600
                        }
                      }}
                    />
                  </Paper>
                </Grid>

                {/* Reason & Diagnosis */}
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
                      <ScienceIcon sx={{ fontSize: 28 }} />
                      Clinical Details
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="reason"
                        label="Reason for Visit"
                        fullWidth
                        value={formData.reason}
                        onChange={handleReasonChange}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                          },
                          '& .MuiInputBase-input': {
                            color: customTheme.primary,
                            fontWeight: 600
                          }
                        }}
                      />
                    </Box>
                    
                    <TextField
                      name="diagnosis"
                      label="Diagnosis"
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.diagnosis}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                        },
                        '& .MuiInputBase-input': {
                          color: customTheme.primary,
                          fontWeight: 600
                        }
                      }}
                    />
                  </Paper>
                </Grid>

                {/* Treatment & Medications */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.05)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `3px solid ${alpha(customTheme.success, 0.2)}`,
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
                      <HealingIcon sx={{ fontSize: 28 }} />
                      Treatment Details
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        name="treatment"
                        label="Treatment Provided"
                        fullWidth
                        multiline
                        rows={2}
                        value={formData.treatment}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                          },
                          '& .MuiInputBase-input': {
                            color: customTheme.primary,
                            fontWeight: 600
                          }
                        }}
                      />
                    </Box>
                    
                    <TextField
                      name="medications"
                      label="Medications Prescribed"
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.medications}
                      onChange={handleChange}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '& fieldset': {
                            borderColor: alpha('#9c27b0', 0.3),
                            borderWidth: 2
                          },
                          '&:hover fieldset': {
                            borderColor: '#9c27b0'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#9c27b0'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#9c27b0',
                          fontWeight: 600,
                          '&.Mui-focused': { color: '#9c27b0' }
                        },
                        '& .MuiInputBase-input': {
                          color: customTheme.primary,
                          fontWeight: 600
                        }
                      }}
                    />
                  </Paper>
                </Grid>

                {/* Cost tracking for SHELTER users */}
                {user?.user_type === 'SHELTER' && (
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        borderRadius: 5,
                        background: `linear-gradient(135deg, ${alpha('#e3f2fd', 0.8)} 0%, ${alpha(customTheme.background, 0.9)} 100%)`,
                        border: `3px solid ${alpha('#2196f3', 0.3)}`,
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
                        <CostIcon sx={{ fontSize: 28 }} />
                        Cost Tracking
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <TextField
                          name="estimated_cost"
                          label="Estimated Cost ($)"
                          type="number"
                          fullWidth
                          value={formData.estimated_cost}
                          onChange={handleChange}
                          inputProps={{ step: "0.01", min: "0" }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '& fieldset': {
                                borderColor: alpha('#2196f3', 0.3),
                                borderWidth: 2
                              },
                              '&:hover fieldset': {
                                borderColor: '#2196f3'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#2196f3'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: '#2196f3',
                              fontWeight: 600,
                              '&.Mui-focused': { color: '#2196f3' }
                            },
                            '& .MuiInputBase-input': {
                              color: customTheme.primary,
                              fontWeight: 600
                            }
                          }}
                        />
                      </Box>
                      
                      <TextField
                        name="actual_cost"
                        label="Actual Cost ($)"
                        type="number"
                        fullWidth
                        value={formData.actual_cost}
                        onChange={handleChange}
                        inputProps={{ step: "0.01", min: "0" }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '& fieldset': {
                              borderColor: alpha('#4caf50', 0.3),
                              borderWidth: 2
                            },
                            '&:hover fieldset': {
                              borderColor: '#4caf50'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#4caf50'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: '#4caf50',
                            fontWeight: 600,
                            '&.Mui-focused': { color: '#4caf50' }
                          },
                          '& .MuiInputBase-input': {
                            color: customTheme.primary,
                            fontWeight: 600
                          }
                        }}
                      />
                    </Paper>
                  </Grid>
                )}

                {/* Medical Supplies Section for SHELTER users */}
                {user?.user_type === 'SHELTER' && (
                  <Grid item xs={12}>
                    <Slide direction="down" in timeout={1200}>
                      <Paper 
                        sx={{ 
                          p: 4,
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
                            Medical Supplies Used
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
                                Loading medical supplies...
                              </Typography>
                            </Box>
                          ) : (
                            <Autocomplete
                              options={availableSupplies.filter(supply => 
                                !selectedSupplies.find(s => s.id === supply.id)
                              )}
                              getOptionLabel={(option) => `${option.name} (${option.quantity} available)`}
                              onChange={handleAddSupply}
                              renderInput={(params) => (
                                <TextField 
                                  {...params} 
                                  label="Add Medical Supply" 
                                  placeholder="Search for medical supplies..."
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 3,
                                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                                      {option.cost_per_unit && ` | Cost: $${option.cost_per_unit}`}
                                      {option.category && ` | Category: ${option.category}`}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={option.quantity}
                                    color={option.quantity <= (option.reorder_level || 5) ? 'error' : 'success'}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                  />
                                </Box>
                              )}
                              sx={{ mb: 3 }}
                            />
                          )}
                          
                          {/* Selected supplies list */}
                          {selectedSupplies.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="h6" gutterBottom sx={{ 
                                color: customTheme.primary,
                                fontWeight: 700,
                                mb: 2
                              }}>
                                Selected Supplies:
                              </Typography>
                              {selectedSupplies.map((supply, index) => (
                                <Fade in timeout={800} key={supply.id}>
                                  <Card sx={{ 
                                    mb: 2,
                                    borderRadius: 4,
                                    border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                                    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
                                    backdropFilter: 'blur(10px)'
                                  }}>
                                    <CardContent sx={{ py: 2 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="body1" sx={{ fontWeight: 700, color: customTheme.primary }}>
                                            {supply.name}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                            Available: {supply.quantity} {supply.unit}
                                            {supply.cost_per_unit && ` | $${supply.cost_per_unit} per unit`}
                                          </Typography>
                                        </Box>
                                        
                                        <TextField
                                          label="Qty Used"
                                          type="number"
                                          size="small"
                                          value={supply.quantity_used}
                                          onChange={(e) => handleSupplyQuantityChange(supply.id, parseFloat(e.target.value) || 1)}
                                          inputProps={{ 
                                            min: 0.1, 
                                            max: supply.quantity, 
                                            step: 0.1 
                                          }}
                                          sx={{ 
                                            width: 120,
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
                                            }
                                          }}
                                        />
                                        
                                        <Typography variant="body1" sx={{ 
                                          minWidth: 80, 
                                          fontWeight: 700,
                                          color: customTheme.success,
                                          textAlign: 'center'
                                        }}>
                                          ${((supply.cost_per_unit || 0) * (supply.quantity_used || 1)).toFixed(2)}
                                        </Typography>
                                        
                                        <IconButton 
                                          size="small" 
                                          color="error"
                                          onClick={() => handleRemoveSupply(supply.id)}
                                          sx={{
                                            backgroundColor: alpha('#f44336', 0.1),
                                            '&:hover': {
                                              backgroundColor: alpha('#f44336', 0.2),
                                              transform: 'scale(1.1)'
                                            }
                                          }}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Box>
                                      
                                      {supply.quantity_used > supply.quantity && (
                                        <Alert severity="error" sx={{ mt: 2, borderRadius: 3 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Insufficient quantity. Max available: {supply.quantity}
                                          </Typography>
                                        </Alert>
                                      )}
                                    </CardContent>
                                  </Card>
                                </Fade>
                              ))}
                              
                              {/* Supply warnings */}
                              {getSupplyWarnings().length > 0 && (
                                <Alert severity="warning" sx={{ mt: 2, borderRadius: 4 }}>
                                  <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                                    The following supplies will be low after use:
                                  </Typography>
                                  <Box sx={{ mt: 1 }}>
                                    {getSupplyWarnings().map((supply, index) => (
                                      <Chip 
                                        key={index}
                                        label={`${supply.name}: ${(supply.quantity - supply.quantity_used).toFixed(1)} left`}
                                        color="warning"
                                        size="small"
                                        sx={{ mr: 1, fontWeight: 600 }}
                                      />
                                    ))}
                                  </Box>
                                </Alert>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Slide>
                  </Grid>
                )}

                {/* Follow-up Section */}
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
                      <FollowUpIcon sx={{ fontSize: 28 }} />
                      Follow-up Care
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="follow_up_required"
                            checked={formData.follow_up_required}
                            onChange={handleChange}
                            sx={{
                              color: customTheme.accent,
                              '&.Mui-checked': { color: customTheme.accent }
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ fontWeight: 600, color: customTheme.primary }}>
                            Follow-up Required
                          </Typography>
                        }
                      />
                    </Box>
                    
                    {formData.follow_up_required && (
                      <Box sx={{ mt: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Follow-up Date"
                            value={formData.follow_up_date}
                            onChange={(date) => handleDateChange('follow_up_date', date)}
                            renderInput={(params) => 
                              <TextField 
                                {...params} 
                                fullWidth 
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                      </Box>
                    )}
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
                      label="Medical Notes"
                      fullWidth
                      multiline
                      rows={6}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Additional observations, complications, or notes..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                        },
                        '& .MuiInputBase-input': {
                          color: customTheme.primary,
                          fontWeight: 600
                        }
                      }}
                    />
                  </Paper>
                </Grid>

                {/* Cost Summary for SHELTER users */}
                {user?.user_type === 'SHELTER' && totalCost > 0 && (
                  <Grid item xs={12}>
                    <Fade in timeout={1400}>
                      <Paper 
                        sx={{ 
                          p: 4,
                          borderRadius: 5,
                          background: `linear-gradient(135deg, ${alpha('#e3f2fd', 0.8)} 0%, ${alpha(customTheme.background, 0.9)} 100%)`,
                          border: `3px solid ${alpha('#2196f3', 0.3)}`,
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
                            background: `linear-gradient(90deg, #2196f3, ${customTheme.success})`,
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
                            <AttachMoneyIcon sx={{ fontSize: 28 }} />
                            Treatment Cost Summary
                          </Typography>
                          
                          <Grid container spacing={3}>
                            <Grid item xs={4}>
                              <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600, mb: 1 }}>
                                Medical Supplies Cost:
                              </Typography>
                              <Typography variant="h4" sx={{ color: customTheme.secondary, fontWeight: 800 }}>
                                ${selectedSupplies.reduce((total, supply) => 
                                  total + ((supply.cost_per_unit || 0) * (supply.quantity_used || 1)), 0
                                ).toFixed(2)}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={4}>
                              <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600, mb: 1 }}>
                                Treatment Cost:
                              </Typography>
                              <Typography variant="h4" sx={{ color: customTheme.accent, fontWeight: 800 }}>
                                ${(parseFloat(formData.estimated_cost || formData.actual_cost || 0)).toFixed(2)}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={4}>
                              <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600, mb: 1 }}>
                                Total Estimated Cost:
                              </Typography>
                              <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                                ${totalCost.toFixed(2)}
                              </Typography>
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ mt: 3 }}>
                            <Divider sx={{ my: 2, backgroundColor: alpha(customTheme.primary, 0.2), height: 2 }} />
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h5" sx={{ 
                                color: customTheme.primary, 
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1
                              }}>
                                <TrendingDownIcon />
                                Comprehensive Medical Care Investment
                              </Typography>
                            </Box>
                          </Box>
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
                disabled={!checkInventoryAvailability()}
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
                Add Medical Record
              </Button>
            </Box>
          </Fade>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default MedicalRecordForm;