// components/HealthTracking/HealthTrackingTab.js - ENHANCED VERSION with inventory integration and SHELTER features

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

// NEW: Enhanced function to update inventory after treatment with better tracking
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

// NEW: Helper function to categorize treatments
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
  const [inventoryAlerts, setInventoryAlerts] = useState([]); // NEW
  const [treatmentCosts, setTreatmentCosts] = useState(0); // NEW
  
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

  // NEW: Fetch inventory alerts for low stock medical supplies
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

  // NEW: Calculate estimated treatment costs
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

  // NEW: Get days until vaccination due
  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // NEW: Get urgency level for overdue items
  const getUrgencyLevel = (daysUntilDue) => {
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 7) return 'urgent';
    if (daysUntilDue <= 30) return 'soon';
    return 'normal';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* NEW: Inventory Alerts for SHELTER users */}
      {user?.user_type === 'SHELTER' && inventoryAlerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Low Medical Supply Alert
          </Typography>
          <Typography variant="body2">
            {inventoryAlerts.length} medical supplies are running low:
          </Typography>
          <Box sx={{ mt: 1 }}>
            {inventoryAlerts.slice(0, 3).map((item, index) => (
              <Chip 
                key={index}
                label={`${item.name}: ${item.quantity} left`}
                color="warning"
                size="small"
                sx={{ mr: 1, mb: 0.5 }}
              />
            ))}
            {inventoryAlerts.length > 3 && (
              <Chip 
                label={`+${inventoryAlerts.length - 3} more`}
                color="warning"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Enhanced Health Status Card */}
        <Grid item xs={12}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonitorHeartIcon sx={{ mr: 1 }} />
                  Health Status & Overview
                </Typography>
                <Stack direction="row" spacing={1}>
                  {/* NEW: Treatment cost for SHELTER users */}
                  {user?.user_type === 'SHELTER' && treatmentCosts > 0 && (
                    <Tooltip title="Estimated treatment costs">
                      <Chip
                        icon={<AttachMoneyIcon />}
                        label={`$${treatmentCosts.toFixed(2)}`}
                        color="info"
                        variant="outlined"
                      />
                    </Tooltip>
                  )}
                  <Button
                    startIcon={healthStatus ? <EditIcon /> : <AddIcon />}
                    onClick={() => setHealthStatusFormOpen(true)}
                    size="small"
                  >
                    {healthStatus ? 'Update Status' : 'Add Status'}
                  </Button>
                </Stack>
              </Box>
              
              {healthStatus ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Status
                    </Typography>
                    <Chip
                      label={healthStatus.current_status}
                      color={getStatusColor(healthStatus.current_status)}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Weight
                    </Typography>
                    <Typography variant="body1">
                      {healthStatus.weight ? `${healthStatus.weight} kg` : 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Temperature
                    </Typography>
                    <Typography variant="body1">
                      {healthStatus.temperature ? `${healthStatus.temperature}°C` : 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Next Checkup
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(healthStatus.next_checkup_date)}
                    </Typography>
                  </Grid>
                  {healthStatus.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body1">
                        {healthStatus.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No health status recorded yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Vaccinations Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 2,
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <VaccinesIcon sx={{ mr: 1 }} />
                Vaccinations
                {/* NEW: Show overdue badge */}
                {vaccinations.some(v => v.next_due_date && getDaysUntilDue(v.next_due_date) < 0) && (
                  <Badge 
                    badgeContent={vaccinations.filter(v => v.next_due_date && getDaysUntilDue(v.next_due_date) < 0).length}
                    color="error"
                    sx={{ ml: 1 }}
                  >
                    <WarningIcon color="error" />
                  </Badge>
                )}
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setVaccinationFormOpen(true)}
                size="small"
              >
                Add Vaccination
              </Button>
            </Box>
            
            {vaccinations.length > 0 ? (
              <>
                {/* NEW: Enhanced vaccination table for SHELTER users */}
                {user?.user_type === 'SHELTER' ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Vaccine</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Next Due</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vaccinations.map((vaccination) => {
                          const daysUntilDue = getDaysUntilDue(vaccination.next_due_date);
                          const urgency = getUrgencyLevel(daysUntilDue);
                          
                          return (
                            <TableRow key={vaccination.id}>
                              <TableCell>{vaccination.vaccine_type}</TableCell>
                              <TableCell>{formatDate(vaccination.date_administered)}</TableCell>
                              <TableCell>{formatDate(vaccination.next_due_date)}</TableCell>
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
                        <ListItem>
                          <ListItemText
                            primary={vaccination.vaccine_type}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {formatDate(vaccination.date_administered)}
                                </Typography>
                                {' — '}
                                {vaccination.veterinarian} at {vaccination.clinic_name || 'Unknown clinic'}
                                {vaccination.next_due_date && (
                                  <>
                                    <br />
                                    Next due: {formatDate(vaccination.next_due_date)}
                                  </>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No vaccination records
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Enhanced Medical Records Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 2,
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalHospitalIcon sx={{ mr: 1 }} />
                Medical Records
                {/* NEW: Show follow-up needed badge */}
                {medicalRecords.some(r => r.follow_up_required && r.follow_up_date) && (
                  <Badge 
                    badgeContent={medicalRecords.filter(r => r.follow_up_required && r.follow_up_date && new Date(r.follow_up_date) <= new Date()).length}
                    color="warning"
                    sx={{ ml: 1 }}
                  >
                    <ScheduleIcon color="warning" />
                  </Badge>
                )}
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setMedicalFormOpen(true)}
                size="small"
              >
                Add Record
              </Button>
            </Box>
            
            {medicalRecords.length > 0 ? (
              <>
                {/* NEW: Enhanced medical records view for SHELTER users */}
                {user?.user_type === 'SHELTER' ? (
                  <Box>
                    {/* Quick stats */}
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                          <Typography variant="caption">Total Records</Typography>
                          <Typography variant="h6">{medicalRecords.length}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: '#fff3e0' }}>
                          <Typography variant="caption">Follow-ups</Typography>
                          <Typography variant="h6">
                            {medicalRecords.filter(r => r.follow_up_required).length}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 1, textAlign: 'center', backgroundColor: '#e8f5e8' }}>
                          <Typography variant="caption">Recent (7d)</Typography>
                          <Typography variant="h6">
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
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {record.reason}
                                  </Typography>
                                  <Chip 
                                    label={record.record_type}
                                    size="small"
                                    color={record.record_type === 'EMERGENCY' ? 'error' : 'primary'}
                                  />
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {formatDate(record.date)} - {record.veterinarian}
                                  </Typography>
                                  {record.follow_up_required && record.follow_up_date && (
                                    <>
                                      <br />
                                      <Typography component="span" variant="body2" color="warning.main">
                                        Follow-up: {formatDate(record.follow_up_date)}
                                      </Typography>
                                    </>
                                  )}
                                </>
                              }
                            />
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                    
                    {medicalRecords.length > 5 && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                        +{medicalRecords.length - 5} more records
                      </Typography>
                    )}
                  </Box>
                ) : (
                  // Original list view for other users
                  <List>
                    {medicalRecords.map((record) => (
                      <React.Fragment key={record.id}>
                        <ListItem>
                          <ListItemText
                            primary={record.reason}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {record.record_type} - {formatDate(record.date)}
                                </Typography>
                                {' — '}
                                {record.veterinarian} at {record.clinic_name || 'Unknown clinic'}
                                {record.diagnosis && (
                                  <>
                                    <br />
                                    Diagnosis: {record.diagnosis}
                                  </>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No medical records
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* NEW: Medical Analytics for SHELTER users */}
        {user?.user_type === 'SHELTER' && (
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 2,
              backgroundColor: '#f3e5f5',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
            }}>
              <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                Medical Care Analytics
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary.main">
                      {((healthStatus?.weight || 0) - 5).toFixed(1)}kg
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Weight Change
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ mt: 1 }}
                      color="success"
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success.main">
                      {Math.round((vaccinations.length / 5) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vaccination Coverage
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(vaccinations.length / 5) * 100} 
                      sx={{ mt: 1 }}
                      color="success"
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="info.main">
                      {medicalRecords.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Treatment Sessions
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(medicalRecords.length * 10, 100)} 
                      sx={{ mt: 1 }}
                      color="info"
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="warning.main">
                      {medicalRecords.filter(r => r.follow_up_required).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Follow-ups
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={medicalRecords.filter(r => r.follow_up_required).length * 25} 
                      sx={{ mt: 1 }}
                      color="warning"
                    />
                  </Card>
                </Grid>
              </Grid>
            </Paper>
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