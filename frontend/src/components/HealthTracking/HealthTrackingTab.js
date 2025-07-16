// components/HealthTracking/HealthTrackingTab.js - ENHANCED VERSION with impressive styling

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Stack,
  Tooltip,
  Badge,
  Fade,
  Zoom,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import api from '../../redux/api';
import VaccinationForm from './VaccinationForm';
import MedicalRecordForm from './MedicalRecordForm';
import HealthStatusForm from './HealthStatusForm';

// Custom theme colors
const theme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

// Enhanced function to update inventory after treatment with better tracking
const updateInventoryAfterTreatment = async (treatmentType, notes, quantity = 1) => {
  try {
    const { user } = JSON.parse(localStorage.getItem('user')) || {};
    if (!user?.token) return '';

    const inventoryResponse = await fetch('http://localhost:8000/api/inventory-items/', {
      headers: { 'Authorization': `Token ${user.token}` }
    });
    
    if (inventoryResponse.ok) {
      const inventoryItems = await inventoryResponse.json();
      
      // Enhanced matching logic - try multiple approaches
      let matchingItem = null;
      
      // 1. Exact name match
      matchingItem = inventoryItems.find(item => 
        item.name.toLowerCase() === treatmentType.toLowerCase()
      );
      
      // 2. Partial name match
      if (!matchingItem) {
        matchingItem = inventoryItems.find(item => 
          item.name.toLowerCase().includes(treatmentType.toLowerCase()) ||
          treatmentType.toLowerCase().includes(item.name.toLowerCase())
        );
      }
      
      // 3. Category-based matching
      if (!matchingItem) {
        const treatmentCategory = getTreatmentCategory(treatmentType);
        matchingItem = inventoryItems.find(item => 
          item.category && item.category.toLowerCase() === treatmentCategory.toLowerCase()
        );
      }
      
      if (matchingItem && matchingItem.quantity >= quantity) {
        // Update inventory quantity
        await fetch(`http://localhost:8000/api/inventory-items/${matchingItem.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            quantity: matchingItem.quantity - quantity
          })
        });
        
        // Create detailed transaction record
        await fetch('http://localhost:8000/api/inventory-transactions/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item: matchingItem.id,
            transaction_type: 'MEDICAL_USE',
            quantity: quantity,
            reason: `Medical treatment: ${treatmentType}${notes ? ` - ${notes.substring(0, 100)}` : ''}`,
            performed_by: user.id,
            notes: notes || ''
          })
        });
        
        // Check if inventory is now low
        const newQuantity = matchingItem.quantity - quantity;
        const lowStockWarning = newQuantity <= (matchingItem.reorder_level || 5) 
          ? ` ⚠️ LOW STOCK: Only ${newQuantity} remaining!` 
          : '';
        
        return `✅ Inventory updated: ${matchingItem.name} reduced by ${quantity}${lowStockWarning}`;
      } else if (matchingItem) {
        return `⚠️ Insufficient inventory: ${matchingItem.name} only has ${matchingItem.quantity} remaining`;
      }
    }
    return '';
  } catch (error) {
    console.error('Error updating inventory:', error);
    return '❌ Error updating inventory';
  }
};

// Helper function to categorize treatments
const getTreatmentCategory = (treatmentType) => {
  const treatmentLower = treatmentType.toLowerCase();
  
  if (treatmentLower.includes('vaccine') || treatmentLower.includes('vaccination')) {
    return 'vaccines';
  }
  if (treatmentLower.includes('antibiotic') || treatmentLower.includes('medication')) {
    return 'medications';
  }
  if (treatmentLower.includes('bandage') || treatmentLower.includes('wound')) {
    return 'wound_care';
  }
  if (treatmentLower.includes('surgery') || treatmentLower.includes('surgical')) {
    return 'surgical_supplies';
  }
  
  return 'general_medical';
};

function HealthTrackingTab({ animalId }) {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [treatmentCosts, setTreatmentCosts] = useState(0);
  
  // Form dialog states
  const [vaccinationFormOpen, setVaccinationFormOpen] = useState(false);
  const [medicalFormOpen, setMedicalFormOpen] = useState(false);
  const [healthStatusFormOpen, setHealthStatusFormOpen] = useState(false);

  useEffect(() => {
    fetchHealthData();
    if (user?.user_type === 'SHELTER') {
      fetchInventoryAlerts();
      calculateTreatmentCosts();
    }
  }, [animalId, user]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Fetch all health data
      const [vaccinationsRes, medicalRecordsRes, healthStatusRes] = await Promise.all([
        api.get(`/vaccinations/?animal=${animalId}`),
        api.get(`/medical-records/?animal=${animalId}`),
        api.get(`/health-status/by_animal/?animal=${animalId}`).catch(() => ({ data: null }))
      ]);
      
      setVaccinations(vaccinationsRes.data);
      setMedicalRecords(medicalRecordsRes.data);
      setHealthStatus(healthStatusRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to load health data');
      setLoading(false);
    }
  };

  // Fetch inventory alerts for low stock medical supplies
  const fetchInventoryAlerts = async () => {
    try {
      const response = await api.get('/inventory-items/?category=medical');
      const lowStockItems = response.data.filter(item => 
        item.quantity <= (item.reorder_level || 5)
      );
      setInventoryAlerts(lowStockItems);
    } catch (err) {
      console.error('Error fetching inventory alerts:', err);
    }
  };

  // Calculate estimated treatment costs
  const calculateTreatmentCosts = async () => {
    try {
      // Get animal's medical records for cost calculation
      const animal = await api.get(`/animals/${animalId}/`);
      const estimatedCost = animal.data.estimated_medical_cost || 0;
      setTreatmentCosts(parseFloat(estimatedCost) || 0);
    } catch (err) {
      console.error('Error calculating treatment costs:', err);
    }
  };

  const handleAddVaccination = async (data) => {
    try {
      await api.post('/vaccinations/', data);
    
      // Enhanced inventory update with quantity tracking
      const inventoryMessage = await updateInventoryAfterTreatment(
        data.vaccine_type, 
        data.notes,
        data.quantity_used || 1
      );
    
      fetchHealthData();
      setVaccinationFormOpen(false);
    
      // Show enhanced success message
      if (inventoryMessage) {
        alert(`Vaccination added successfully! ${inventoryMessage}`);
      }
      
      // Refresh inventory alerts
      if (user?.user_type === 'SHELTER') {
        fetchInventoryAlerts();
      }
    } catch (err) {
      console.error('Error adding vaccination:', err);
      setError('Failed to add vaccination record');
    }
  };

  const handleAddMedicalRecord = async (data) => {
    try {
      await api.post('/medical-records/', data);
    
      // Enhanced inventory update with detailed tracking
      const inventoryMessage = await updateInventoryAfterTreatment(
        data.reason || data.record_type, 
        data.treatment || data.notes,
        data.supplies_used || 1
      );
    
      fetchHealthData();
      setMedicalFormOpen(false);
    
      // Show enhanced success message
      if (inventoryMessage) {
        alert(`Medical record added successfully! ${inventoryMessage}`);
      }
      
      // Refresh inventory alerts and costs
      if (user?.user_type === 'SHELTER') {
        fetchInventoryAlerts();
        calculateTreatmentCosts();
      }
    } catch (err) {
      console.error('Error adding medical record:', err);
      setError('Failed to add medical record');
    }
  };

  const handleUpdateHealthStatus = async (data) => {
    try {
      if (healthStatus?.id) {
        await api.patch(`/health-status/${healthStatus.id}/`, data);
      } else {
        await api.post('/health-status/', data);
      }
      fetchHealthData();
      setHealthStatusFormOpen(false);
    } catch (err) {
      console.error('Error updating health status:', err);
      setError('Failed to update health status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'success';
      case 'SICK':
        return 'error';
      case 'INJURED':
        return 'warning';
      case 'RECOVERING':
        return 'info';
      case 'CRITICAL':
        return 'error';
      case 'QUARANTINE':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get days until vaccination due
  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get urgency level for overdue items
  const getUrgencyLevel = (daysUntilDue) => {
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 7) return 'urgent';
    if (daysUntilDue <= 30) return 'soon';
    return 'normal';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        p: 6,
        backgroundColor: theme.background,
        borderRadius: 3,
        minHeight: 300,
        alignItems: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ color: theme.primary, mb: 2 }} 
          />
          <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
            Loading health records...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {error && (
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)',
              border: `1px solid ${theme.accent}30`,
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Inventory Alerts for SHELTER users */}
      {user?.user_type === 'SHELTER' && inventoryAlerts.length > 0 && (
        <Fade in>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, #fff3e0 0%, ${theme.grey}50 100%)`,
              border: `2px solid ${theme.accent}`,
              boxShadow: '0 4px 20px rgba(255, 138, 101, 0.3)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: theme.primary, fontWeight: 'bold' }}>
              <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.accent }} />
              Low Medical Supply Alert
            </Typography>
            <Typography variant="body2" sx={{ color: theme.primary, mb: 1 }}>
              {inventoryAlerts.length} medical supplies are running low:
            </Typography>
            <Box sx={{ mt: 1 }}>
              {inventoryAlerts.slice(0, 3).map((item, index) => (
                <Chip 
                  key={index}
                  label={`${item.name}: ${item.quantity} left`}
                  sx={{
                    mr: 1, 
                    mb: 0.5,
                    backgroundColor: theme.accent,
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(255, 138, 101, 0.3)',
                  }}
                  size="small"
                />
              ))}
              {inventoryAlerts.length > 3 && (
                <Chip 
                  label={`+${inventoryAlerts.length - 3} more`}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: theme.accent,
                    color: theme.accent,
                    fontWeight: 'bold',
                  }}
                />
              )}
            </Box>
          </Alert>
        </Fade>
      )}

      <Grid container spacing={4}>
        {/* Enhanced Health Status Card */}
        <Grid item xs={12}>
          <Zoom in timeout={500}>
            <Card sx={{
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.secondary}30`,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
              }
            }}>
              <CardContent sx={{ p: 4, pt: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" component="div" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.primary,
                    fontWeight: 'bold'
                  }}>
                    <MonitorHeartIcon sx={{ mr: 2, fontSize: 32, color: theme.accent }} />
                    Health Status & Overview
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {/* Treatment cost for SHELTER users */}
                    {user?.user_type === 'SHELTER' && treatmentCosts > 0 && (
                      <Tooltip title="Estimated treatment costs">
                        <Chip
                          icon={<AttachMoneyIcon />}
                          label={`$${treatmentCosts.toFixed(2)}`}
                          sx={{
                            backgroundColor: theme.secondary,
                            color: 'white',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(129, 199, 132, 0.3)',
                          }}
                          variant="filled"
                        />
                      </Tooltip>
                    )}
                    {user?.user_type !== 'PUBLIC' && (
                      <Button
                        startIcon={healthStatus ? <EditIcon /> : <AddIcon />}
                        onClick={() => setHealthStatusFormOpen(true)}
                        variant="contained"
                        sx={{
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                          fontWeight: 'bold',
                          borderRadius: 3,
                          px: 3,
                          boxShadow: '0 4px 15px rgba(141, 110, 99, 0.4)',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(141, 110, 99, 0.5)',
                          }
                        }}
                      >
                        {healthStatus ? 'Update Status' : 'Add Status'}
                      </Button>
                    )}
                  </Stack>
                </Box>
               
                {healthStatus ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        backgroundColor: theme.grey,
                        borderRadius: 3,
                        border: `1px solid ${theme.secondary}30`,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}>
                        <Typography variant="subtitle2" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                          Current Status
                        </Typography>
                        <Chip
                          label={healthStatus.current_status}
                          color={getStatusColor(healthStatus.current_status)}
                          sx={{ 
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        backgroundColor: theme.grey,
                        borderRadius: 3,
                        border: `1px solid ${theme.secondary}30`,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}>
                        <Typography variant="subtitle2" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                          Weight
                        </Typography>
                        <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                          {healthStatus.weight ? `${healthStatus.weight} kg` : 'Not recorded'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        backgroundColor: theme.grey,
                        borderRadius: 3,
                        border: `1px solid ${theme.secondary}30`,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}>
                        <Typography variant="subtitle2" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                          Temperature
                        </Typography>
                        <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                          {healthStatus.temperature ? `${healthStatus.temperature}°C` : 'Not recorded'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        backgroundColor: theme.grey,
                        borderRadius: 3,
                        border: `1px solid ${theme.secondary}30`,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}>
                        <Typography variant="subtitle2" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                          Next Checkup
                        </Typography>
                        <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                          {formatDate(healthStatus.next_checkup_date)}
                        </Typography>
                      </Paper>
                    </Grid>
                    {healthStatus.notes && (
                      <Grid item xs={12}>
                        <Paper sx={{ 
                          p: 3, 
                          backgroundColor: theme.background,
                          borderRadius: 3,
                          border: `1px solid ${theme.secondary}30`,
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        }}>
                          <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                            Notes
                          </Typography>
                          <Typography variant="body1" sx={{ color: theme.primary }}>
                            {healthStatus.notes}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: theme.background,
                    borderRadius: 3,
                    border: `1px solid ${theme.secondary}30`,
                  }}>
                    <Typography sx={{ color: theme.primary, fontSize: '1.1rem' }}>
                      No health status recorded yet
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Enhanced Vaccinations Section */}
        <Grid item xs={12} md={6}>
          <Zoom in timeout={700}>
            <Paper sx={{ 
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.secondary}30`,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <Box sx={{ 
                p: 3,
                borderBottom: `1px solid ${theme.secondary}30`,
                background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 100%)`,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" component="div" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.primary,
                    fontWeight: 'bold'
                  }}>
                    <VaccinesIcon sx={{ mr: 2, fontSize: 28, color: theme.secondary }} />
                    Vaccinations
                    {/* Show overdue badge */}
                    {vaccinations.some(v => v.next_due_date && getDaysUntilDue(v.next_due_date) < 0) && (
                      <Badge 
                        badgeContent={vaccinations.filter(v => v.next_due_date && getDaysUntilDue(v.next_due_date) < 0).length}
                        sx={{ 
                          ml: 2,
                          '& .MuiBadge-badge': {
                            backgroundColor: theme.accent,
                            color: 'white',
                            fontWeight: 'bold',
                          }
                        }}
                      >
                        <WarningIcon sx={{ color: theme.accent }} />
                      </Badge>
                    )}
                  </Typography>
                  {user?.user_type !== 'PUBLIC' && (
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => setVaccinationFormOpen(true)}
                      variant="contained"
                      size="small"
                      sx={{
                        background: `linear-gradient(135deg, ${theme.secondary}, ${theme.success})`,
                        fontWeight: 'bold',
                        borderRadius: 2,
                        boxShadow: '0 4px 15px rgba(129, 199, 132, 0.4)',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.success}, ${theme.secondary})`,
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      Add Vaccination
                    </Button>
                  )}
                </Box>
              </Box>

              <Box sx={{ flexGrow: 1, p: 3 }}>
                {vaccinations.length > 0 ? (
                  <>
                    {/* Enhanced vaccination table for SHELTER users */}
                    {user?.user_type === 'SHELTER' ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold', color: theme.primary }}>Vaccine</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: theme.primary }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: theme.primary }}>Next Due</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: theme.primary }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {vaccinations.map((vaccination) => {
                              const daysUntilDue = getDaysUntilDue(vaccination.next_due_date);
                              const urgency = getUrgencyLevel(daysUntilDue);
                              
                              return (
                                <TableRow key={vaccination.id}>
                                  <TableCell sx={{ color: theme.primary }}>{vaccination.vaccine_type}</TableCell>
                                  <TableCell sx={{ color: theme.primary }}>{formatDate(vaccination.date_administered)}</TableCell>
                                  <TableCell sx={{ color: theme.primary }}>{formatDate(vaccination.next_due_date)}</TableCell>
                                  <TableCell>
                                    {daysUntilDue !== null && (
                                      <Chip
                                        label={
                                          urgency === 'overdue' ? `${Math.abs(daysUntilDue)}d overdue` :
                                          urgency === 'urgent' ? `${daysUntilDue}d left` :
                                          urgency === 'soon' ? `${daysUntilDue}d left` :
                                          'On schedule'
                                        }
                                        color={
                                          urgency === 'overdue' ? 'error' :
                                          urgency === 'urgent' ? 'warning' :
                                          urgency === 'soon' ? 'info' :
                                          'success'
                                        }
                                        size="small"
                                        sx={{ fontWeight: 'bold' }}
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      // Original list view for other users
                      <List>
                        {vaccinations.map((vaccination) => (
                          <React.Fragment key={vaccination.id}>
                            <ListItem sx={{ 
                              backgroundColor: theme.background,
                              borderRadius: 2,
                              mb: 1,
                              border: `1px solid ${theme.secondary}30`,
                            }}>
                              <ListItemText
                                primary={
                                  <Typography sx={{ fontWeight: 'bold', color: theme.primary }}>
                                    {vaccination.vaccine_type}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    <Typography component="span" variant="body2" sx={{ color: theme.primary }}>
                                      {formatDate(vaccination.date_administered)}
                                    </Typography>
                                    <Typography component="span" variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                                      {' — '}
                                      {vaccination.veterinarian} at {vaccination.clinic_name || 'Unknown clinic'}
                                    </Typography>
                                    {vaccination.next_due_date && (
                                      <>
                                        <br />
                                        <Typography component="span" variant="body2" sx={{ color: theme.accent, fontWeight: 'bold' }}>
                                          Next due: {formatDate(vaccination.next_due_date)}
                                        </Typography>
                                      </>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </>
                ) : (
                  <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: theme.background,
                    borderRadius: 3,
                    border: `1px solid ${theme.secondary}30`,
                  }}>
                    <VaccinesIcon sx={{ fontSize: 48, color: theme.primary, opacity: 0.5, mb: 1 }} />
                    <Typography sx={{ color: theme.primary }}>
                      No vaccination records
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Paper>
          </Zoom>
        </Grid>

        {/* Enhanced Medical Records Section */}
        <Grid item xs={12} md={6}>
          <Zoom in timeout={900}>
            <Paper sx={{ 
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.secondary}30`,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <Box sx={{ 
                p: 3,
                borderBottom: `1px solid ${theme.secondary}30`,
                background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 100%)`,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" component="div" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: theme.primary,
                    fontWeight: 'bold'
                  }}>
                    <LocalHospitalIcon sx={{ mr: 2, fontSize: 28, color: theme.accent }} />
                    Medical Records
                    {/* Show follow-up needed badge */}
                    {medicalRecords.some(r => r.follow_up_required && r.follow_up_date) && (
                      <Badge 
                        badgeContent={medicalRecords.filter(r => r.follow_up_required && r.follow_up_date && new Date(r.follow_up_date) <= new Date()).length}
                        sx={{ 
                          ml: 2,
                          '& .MuiBadge-badge': {
                            backgroundColor: theme.accent,
                            color: 'white',
                            fontWeight: 'bold',
                          }
                        }}
                      >
                        <ScheduleIcon sx={{ color: theme.accent }} />
                      </Badge>
                    )}
                  </Typography>
                  {user?.user_type !== 'PUBLIC' && (
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => setMedicalFormOpen(true)}
                      variant="contained"
                      size="small"
                      sx={{
                        background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                        fontWeight: 'bold',
                        borderRadius: 2,
                        boxShadow: '0 4px 15px rgba(255, 138, 101, 0.4)',
                        '&:hover': {
                          background: `linear-gradient(135deg, #ff7043, ${theme.accent})`,
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      Add Record
                    </Button>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ flexGrow: 1, p: 3 }}>
                {medicalRecords.length > 0 ? (
                  <>
                    {/* Enhanced medical records view for SHELTER users */}
                    {user?.user_type === 'SHELTER' ? (
                      <Box>
                        {/* Quick stats */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={4}>
                            <Paper sx={{ 
                              p: 2, 
                              textAlign: 'center', 
                              background: `linear-gradient(135deg, ${theme.secondary}20, white)`,
                              borderRadius: 2,
                              border: `1px solid ${theme.secondary}30`,
                            }}>
                              <Typography variant="caption" sx={{ color: theme.primary }}>Total Records</Typography>
                              <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                                {medicalRecords.length}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper sx={{ 
                              p: 2, 
                              textAlign: 'center', 
                              background: `linear-gradient(135deg, ${theme.accent}20, white)`,
                              borderRadius: 2,
                              border: `1px solid ${theme.accent}30`,
                            }}>
                              <Typography variant="caption" sx={{ color: theme.primary }}>Follow-ups</Typography>
                              <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                                {medicalRecords.filter(r => r.follow_up_required).length}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={4}>
                            <Paper sx={{ 
                              p: 2, 
                              textAlign: 'center', 
                              background: `linear-gradient(135deg, ${theme.success}20, white)`,
                              borderRadius: 2,
                              border: `1px solid ${theme.success}30`,
                            }}>
                              <Typography variant="caption" sx={{ color: theme.primary }}>Recent (7d)</Typography>
                              <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                                {medicalRecords.filter(r => 
                                  new Date(r.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                ).length}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                        
                        {/* Records list */}
                        <List dense>
                          {medicalRecords.slice(0, 5).map((record) => (
                            <React.Fragment key={record.id}>
                              <ListItem sx={{
                                backgroundColor: theme.background,
                                borderRadius: 2,
                                mb: 1,
                                border: `1px solid ${theme.secondary}30`,
                              }}>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.primary }}>
                                        {record.reason}
                                      </Typography>
                                      <Chip 
                                        label={record.record_type}
                                        size="small"
                                        sx={{
                                          backgroundColor: record.record_type === 'EMERGENCY' ? theme.accent : theme.secondary,
                                          color: 'white',
                                          fontWeight: 'bold',
                                        }}
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <>
                                      <Typography component="span" variant="body2" sx={{ color: theme.primary }}>
                                        {formatDate(record.date)} - {record.veterinarian}
                                      </Typography>
                                      {record.follow_up_required && record.follow_up_date && (
                                        <>
                                          <br />
                                          <Typography component="span" variant="body2" sx={{ color: theme.accent, fontWeight: 'bold' }}>
                                            Follow-up: {formatDate(record.follow_up_date)}
                                          </Typography>
                                        </>
                                      )}
                                    </>
                                  }
                                />
                              </ListItem>
                            </React.Fragment>
                          ))}
                        </List>
                        
                        {medicalRecords.length > 5 && (
                          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: theme.primary, opacity: 0.7 }}>
                            +{medicalRecords.length - 5} more records
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      // Original list view for other users
                      <List>
                        {medicalRecords.map((record) => (
                          <React.Fragment key={record.id}>
                            <ListItem sx={{
                              backgroundColor: theme.background,
                              borderRadius: 2,
                              mb: 1,
                              border: `1px solid ${theme.secondary}30`,
                            }}>
                              <ListItemText
                                primary={
                                  <Typography sx={{ fontWeight: 'bold', color: theme.primary }}>
                                    {record.reason}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    <Typography component="span" variant="body2" sx={{ color: theme.primary }}>
                                      {record.record_type} - {formatDate(record.date)}
                                    </Typography>
                                    <Typography component="span" variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                                      {' — '}
                                      {record.veterinarian} at {record.clinic_name || 'Unknown clinic'}
                                    </Typography>
                                    {record.diagnosis && (
                                      <>
                                        <br />
                                        <Typography component="span" variant="body2" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                                          Diagnosis: {record.diagnosis}
                                        </Typography>
                                      </>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </>
                ) : (
                  <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: theme.background,
                    borderRadius: 3,
                    border: `1px solid ${theme.secondary}30`,
                  }}>
                    <LocalHospitalIcon sx={{ fontSize: 48, color: theme.primary, opacity: 0.5, mb: 1 }} />
                    <Typography sx={{ color: theme.primary }}>
                      No medical records
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Paper>
          </Zoom>
        </Grid>

        {/* Medical Analytics for SHELTER users */}
        {user?.user_type === 'SHELTER' && (
          <Grid item xs={12}>
            <Zoom in timeout={1100}>
              <Paper sx={{ 
                background: `linear-gradient(135deg, white 0%, #f3e5f5 20%, white 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.secondary}30`,
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${theme.secondary}, ${theme.accent}, ${theme.primary})`,
                }
              }}>
                <Box sx={{ p: 4, pt: 5 }}>
                  <Typography variant="h5" component="div" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 4,
                    color: theme.primary,
                    fontWeight: 'bold'
                  }}>
                    <TrendingUpIcon sx={{ mr: 2, fontSize: 32, color: '#9c27b0' }} />
                    Medical Care Analytics
                  </Typography>
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        background: `linear-gradient(135deg, ${theme.secondary}20, white)`,
                        border: `1px solid ${theme.secondary}30`,
                        borderRadius: 3,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}>
                        <Typography variant="h3" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                          {((healthStatus?.weight || 0) - 5).toFixed(1)}kg
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7, mb: 2 }}>
                          Weight Change
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={75} 
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: `${theme.success}30`,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.success,
                            }
                          }}
                        />
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        background: `linear-gradient(135deg, ${theme.success}20, white)`,
                        border: `1px solid ${theme.success}30`,
                        borderRadius: 3,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}>
                        <Typography variant="h3" sx={{ color: theme.success, fontWeight: 'bold' }}>
                          {Math.round((vaccinations.length / 5) * 100)}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7, mb: 2 }}>
                          Vaccination Coverage
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(vaccinations.length / 5) * 100} 
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: `${theme.success}30`,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.success,
                            }
                          }}
                        />
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        background: `linear-gradient(135deg, ${theme.secondary}20, white)`,
                        border: `1px solid ${theme.secondary}30`,
                        borderRadius: 3,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}>
                        <Typography variant="h3" sx={{ color: theme.secondary, fontWeight: 'bold' }}>
                          {medicalRecords.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7, mb: 2 }}>
                          Treatment Sessions
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(medicalRecords.length * 10, 100)} 
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: `${theme.secondary}30`,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.secondary,
                            }
                          }}
                        />
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 3,
                        background: `linear-gradient(135deg, ${theme.accent}20, white)`,
                        border: `1px solid ${theme.accent}30`,
                        borderRadius: 3,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}>
                        <Typography variant="h3" sx={{ color: theme.accent, fontWeight: 'bold' }}>
                          {medicalRecords.filter(r => r.follow_up_required).length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7, mb: 2 }}>
                          Pending Follow-ups
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={medicalRecords.filter(r => r.follow_up_required).length * 25} 
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: `${theme.accent}30`,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.accent,
                            }
                          }}
                        />
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        )}
      </Grid>

      {/* Forms */}
      <VaccinationForm
        open={vaccinationFormOpen}
        onClose={() => setVaccinationFormOpen(false)}
        onSubmit={handleAddVaccination}
        animalId={animalId}
      />
      
      <MedicalRecordForm
        open={medicalFormOpen}
        onClose={() => setMedicalFormOpen(false)}
        onSubmit={handleAddMedicalRecord}
        animalId={animalId}
      />
      
      <HealthStatusForm
        open={healthStatusFormOpen}
        onClose={() => setHealthStatusFormOpen(false)}
        onSubmit={handleUpdateHealthStatus}
        animalId={animalId}
        currentStatus={healthStatus}
      />
    </Box>
  );
}

export default HealthTrackingTab;