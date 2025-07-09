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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const STATUS_CHOICES = [
  { value: 'HEALTHY', label: 'Healthy' },
  { value: 'SICK', label: 'Sick' },
  { value: 'INJURED', label: 'Injured' },
  { value: 'RECOVERING', label: 'Recovering' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'QUARANTINE', label: 'In Quarantine' },
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Update Health Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Current Status</InputLabel>
                <Select
                  name="current_status"
                  value={formData.current_status}
                  onChange={handleChange}
                  label="Current Status"
                  required
                >
                  {STATUS_CHOICES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Last Checkup Date"
                  value={formData.last_checkup_date}
                  onChange={(date) => handleDateChange('last_checkup_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Next Checkup Date"
                  value={formData.next_checkup_date}
                  onChange={(date) => handleDateChange('next_checkup_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="weight"
                label="Weight (kg)"
                type="number"
                fullWidth
                value={formData.weight}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="temperature"
                label="Temperature (°C)"
                type="number"
                fullWidth
                value={formData.temperature}
                onChange={handleChange}
                inputProps={{ step: "0.1" }}
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Update Status</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default HealthStatusForm;