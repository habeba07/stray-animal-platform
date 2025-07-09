// components/HealthTracking/MedicalRecordForm.js - ENHANCED VERSION with inventory integration

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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InventoryIcon from '@mui/icons-material/Inventory';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoIcon from '@mui/icons-material/Info';
import api from '../../redux/api';

const RECORD_TYPES = [
  { value: 'CHECKUP', label: 'Regular Checkup' },
  { value: 'TREATMENT', label: 'Treatment' },
  { value: 'SURGERY', label: 'Surgery' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'OTHER', label: 'Other' },
];

const TREATMENT_CATEGORIES = [
  { value: 'MEDICATION', label: 'Medication Administration' },
  { value: 'WOUND_CARE', label: 'Wound Care' },
  { value: 'SURGERY', label: 'Surgical Procedure' },
  { value: 'DIAGNOSTIC', label: 'Diagnostic Test' },
  { value: 'PREVENTIVE', label: 'Preventive Care' },
  { value: 'EMERGENCY', label: 'Emergency Treatment' },
  { value: 'REHABILITATION', label: 'Rehabilitation' },
];

function MedicalRecordForm({ open, onClose, onSubmit, animalId }) {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    record_type: '',
    treatment_category: '', // NEW
    date: new Date(),
    veterinarian: '',
    clinic_name: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    follow_up_required: false,
    follow_up_date: null,
    estimated_cost: '', // NEW
    actual_cost: '', // NEW
    notes: ''
  });
  
  // NEW: Medical supplies tracking
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

  // NEW: Handle adding medical supplies
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

  // NEW: Handle removing medical supplies
  const handleRemoveSupply = (supplyId) => {
    setSelectedSupplies(prev => prev.filter(s => s.id !== supplyId));
  };

  // NEW: Handle updating supply quantity
  const handleSupplyQuantityChange = (supplyId, quantity) => {
    setSelectedSupplies(prev => prev.map(s => 
      s.id === supplyId ? { ...s, quantity_used: quantity } : s
    ));
  };

  // NEW: Check if enough inventory is available for all supplies
  const checkInventoryAvailability = () => {
    return selectedSupplies.every(supply => 
      supply.quantity >= supply.quantity_used
    );
  };

  // NEW: Get supply usage warnings
  const getSupplyWarnings = () => {
    return selectedSupplies.filter(supply => 
      (supply.quantity - supply.quantity_used) <= (supply.reorder_level || 5)
    );
  };

  // NEW: Suggest treatment category based on reason
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MedicalServicesIcon sx={{ mr: 1 }} />
            Add Medical Record
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* NEW: Stock warnings for SHELTER users */}
          {user?.user_type === 'SHELTER' && stockWarnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Low medical supply stock alert:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {stockWarnings.slice(0, 5).map((item, index) => (
                  <Chip 
                    key={index}
                    label={`${item.name}: ${item.quantity} left`}
                    color="warning"
                    size="small"
                    sx={{ mr: 1, mb: 0.5 }}
                  />
                ))}
                {stockWarnings.length > 5 && (
                  <Chip 
                    label={`+${stockWarnings.length - 5} more`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Record Type</InputLabel>
                <Select
                  name="record_type"
                  value={formData.record_type}
                  onChange={handleChange}
                  label="Record Type"
                  required
                >
                  {RECORD_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* NEW: Treatment Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Treatment Category</InputLabel>
                <Select
                  name="treatment_category"
                  value={formData.treatment_category}
                  onChange={handleChange}
                  label="Treatment Category"
                >
                  {TREATMENT_CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(date) => handleDateChange('date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="veterinarian"
                label="Veterinarian"
                fullWidth
                value={formData.veterinarian}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="clinic_name"
                label="Clinic Name"
                fullWidth
                value={formData.clinic_name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="reason"
                label="Reason for Visit"
                fullWidth
                value={formData.reason}
                onChange={handleReasonChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="diagnosis"
                label="Diagnosis"
                fullWidth
                multiline
                rows={2}
                value={formData.diagnosis}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="treatment"
                label="Treatment Provided"
                fullWidth
                multiline
                rows={2}
                value={formData.treatment}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="medications"
                label="Medications Prescribed"
                fullWidth
                multiline
                rows={2}
                value={formData.medications}
                onChange={handleChange}
              />
            </Grid>

            {/* NEW: Cost tracking for SHELTER users */}
            {user?.user_type === 'SHELTER' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="estimated_cost"
                    label="Estimated Cost ($)"
                    type="number"
                    fullWidth
                    value={formData.estimated_cost}
                    onChange={handleChange}
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="actual_cost"
                    label="Actual Cost ($)"
                    type="number"
                    fullWidth
                    value={formData.actual_cost}
                    onChange={handleChange}
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
              </>
            )}

            {/* NEW: Medical Supplies Section for SHELTER users */}
            {user?.user_type === 'SHELTER' && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ mr: 1 }} />
                    Medical Supplies Used
                  </Typography>
                  
                  {inventoryLoading ? (
                    <LinearProgress />
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
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1">{option.name}</Typography>
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
                          />
                        </Box>
                      )}
                      sx={{ mb: 2 }}
                    />
                  )}
                  
                  {/* Selected supplies list */}
                  {selectedSupplies.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected Supplies:
                      </Typography>
                      {selectedSupplies.map((supply, index) => (
                        <Card key={supply.id} sx={{ mb: 1 }}>
                          <CardContent sx={{ py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {supply.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
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
                                sx={{ width: 100 }}
                              />
                              
                              <Typography variant="body2" sx={{ minWidth: 60 }}>
                                ${((supply.cost_per_unit || 0) * (supply.quantity_used || 1)).toFixed(2)}
                              </Typography>
                              
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRemoveSupply(supply.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                            
                            {supply.quantity_used > supply.quantity && (
                              <Alert severity="error" sx={{ mt: 1 }}>
                                Insufficient quantity. Max available: {supply.quantity}
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Supply warnings */}
                      {getSupplyWarnings().length > 0 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          <Typography variant="body2" gutterBottom>
                            The following supplies will be low after use:
                          </Typography>
                          {getSupplyWarnings().map((supply, index) => (
                            <Chip 
                              key={index}
                              label={`${supply.name}: ${(supply.quantity - supply.quantity_used).toFixed(1)} left`}
                              color="warning"
                              size="small"
                              sx={{ mr: 1 }}
                            />
                          ))}
                        </Alert>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Follow-up Section */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="follow_up_required"
                    checked={formData.follow_up_required}
                    onChange={handleChange}
                  />
                }
                label="Follow-up Required"
              />
            </Grid>
            
            {formData.follow_up_required && (
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Follow-up Date"
                    value={formData.follow_up_date}
                    onChange={(date) => handleDateChange('follow_up_date', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Additional Notes"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional observations, complications, or notes..."
              />
            </Grid>

            {/* NEW: Cost Summary for SHELTER users */}
            {user?.user_type === 'SHELTER' && totalCost > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoneyIcon sx={{ mr: 1 }} />
                    Treatment Cost Summary
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Medical Supplies Cost:
                      </Typography>
                      <Typography variant="h6">
                        ${selectedSupplies.reduce((total, supply) => 
                          total + ((supply.cost_per_unit || 0) * (supply.quantity_used || 1)), 0
                        ).toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Treatment Cost:
                      </Typography>
                      <Typography variant="h6">
                        ${(parseFloat(formData.estimated_cost || formData.actual_cost || 0)).toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Estimated Cost:</span>
                        <span>${totalCost.toFixed(2)}</span>
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={!checkInventoryAvailability()}
          >
            Add Medical Record
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default MedicalRecordForm;