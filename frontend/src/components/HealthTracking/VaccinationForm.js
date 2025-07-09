// components/HealthTracking/VaccinationForm.js - ENHANCED VERSION with inventory integration

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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import api from '../../redux/api';

const VACCINE_TYPES = [
  { value: 'RABIES', label: 'Rabies' },
  { value: 'DISTEMPER', label: 'Distemper' },
  { value: 'PARVOVIRUS', label: 'Parvovirus' },
  { value: 'HEPATITIS', label: 'Hepatitis' },
  { value: 'LEPTOSPIROSIS', label: 'Leptospirosis' },
  { value: 'BORDETELLA', label: 'Bordetella' },
  { value: 'LYME', label: 'Lyme Disease' },
  { value: 'FVRCP', label: 'FVRCP (Cats)' },
  { value: 'FELV', label: 'Feline Leukemia' },
  { value: 'OTHER', label: 'Other' },
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
    quantity_used: 1, // NEW
    inventory_item: null, // NEW
  });
  
  // NEW: Inventory integration states
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

  // NEW: Handle inventory item selection
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

  // NEW: Suggest vaccine type based on inventory item name
  const suggestVaccineType = (itemName) => {
    const name = itemName.toLowerCase();
    for (const vaccine of VACCINE_TYPES) {
      if (name.includes(vaccine.label.toLowerCase())) {
        return vaccine.value;
      }
    }
    return '';
  };

  // NEW: Check if enough inventory is available
  const checkInventoryAvailability = () => {
    if (!selectedInventoryItem) return true;
    return selectedInventoryItem.quantity >= formData.quantity_used;
  };

  // NEW: Get stock status color
  const getStockColor = (quantity, reorderLevel) => {
    if (quantity <= (reorderLevel || 5)) return 'error';
    if (quantity <= (reorderLevel || 5) * 2) return 'warning';
    return 'success';
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
    // Reset form on close
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
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Vaccination Record</DialogTitle>
        <DialogContent>
          {/* NEW: Inventory stock warnings for SHELTER users */}
          {user?.user_type === 'SHELTER' && stockWarnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Low vaccine stock alert:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {stockWarnings.map((item, index) => (
                  <Chip 
                    key={index}
                    label={`${item.name}: ${item.quantity} left`}
                    color="warning"
                    size="small"
                    sx={{ mr: 1, mb: 0.5 }}
                  />
                ))}
              </Box>
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* NEW: Inventory Selection for SHELTER users */}
            {user?.user_type === 'SHELTER' && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ mr: 1 }} />
                    Vaccine Inventory
                  </Typography>
                  
                  {inventoryLoading ? (
                    <LinearProgress />
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
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1">{option.name}</Typography>
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
                          />
                        </Box>
                      )}
                    />
                  )}
                  
                  {selectedInventoryItem && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                      <Typography variant="body2" gutterBottom>
                        <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                        Selected: {selectedInventoryItem.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2">
                          Available: {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                        </Typography>
                        <TextField
                          label="Quantity to Use"
                          type="number"
                          size="small"
                          value={formData.quantity_used}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantity_used: parseFloat(e.target.value) || 1 }))}
                          inputProps={{ min: 0.1, max: selectedInventoryItem.quantity, step: 0.1 }}
                          sx={{ width: 150 }}
                        />
                      </Box>
                      
                      {!checkInventoryAvailability() && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          Insufficient quantity available. Maximum: {selectedInventoryItem.quantity}
                        </Alert>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vaccine Type</InputLabel>
                <Select
                  name="vaccine_type"
                  value={formData.vaccine_type}
                  onChange={handleChange}
                  label="Vaccine Type"
                  required
                >
                  {VACCINE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="vaccine_name"
                label="Vaccine Name"
                fullWidth
                value={formData.vaccine_name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date Administered"
                  value={formData.date_administered}
                  onChange={(date) => handleDateChange('date_administered', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Next Due Date"
                  value={formData.next_due_date}
                  onChange={(date) => handleDateChange('next_due_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              {formData.next_due_date && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  <InfoIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  Auto-calculated based on vaccine type
                </Typography>
              )}
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
                name="batch_number"
                label="Batch Number"
                fullWidth
                value={formData.batch_number}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about the vaccination..."
              />
            </Grid>

            {/* NEW: Inventory impact preview for SHELTER users */}
            {user?.user_type === 'SHELTER' && selectedInventoryItem && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: '#fff3e0' }}>
                  <Typography variant="h6" gutterBottom>
                    Inventory Impact Preview
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Current Stock: {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        After Use: {(selectedInventoryItem.quantity - formData.quantity_used).toFixed(1)} {selectedInventoryItem.unit}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={((selectedInventoryItem.quantity - formData.quantity_used) / selectedInventoryItem.quantity) * 100}
                    color={getStockColor(selectedInventoryItem.quantity - formData.quantity_used, selectedInventoryItem.reorder_level)}
                    sx={{ mt: 1 }}
                  />
                  
                  {(selectedInventoryItem.quantity - formData.quantity_used) <= (selectedInventoryItem.reorder_level || 5) && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        This will bring stock below reorder level. Consider restocking soon.
                      </Typography>
                    </Alert>
                  )}
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
            disabled={selectedInventoryItem && !checkInventoryAvailability()}
          >
            Add Vaccination
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default VaccinationForm;