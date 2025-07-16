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
} from '@mui/material';

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
  { value: 'REPORTED', label: 'Reported' },
  { value: 'RESCUED', label: 'Rescued' },
  { value: 'IN_SHELTER', label: 'In Shelter' },
  { value: 'UNDER_TREATMENT', label: 'Under Treatment' },
  { value: 'QUARANTINE', label: 'In Quarantine' },
  { value: 'URGENT_MEDICAL', label: 'Urgent Medical Attention' },
  { value: 'READY_FOR_TRANSFER', label: 'Ready for Transfer' },
  { value: 'AVAILABLE', label: 'Available for Adoption' },
  { value: 'ADOPTED', label: 'Adopted' },
  { value: 'RETURNED', label: 'Returned to Owner' },
];

// NEW: Priority levels for medical/emergency cases
const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'Low Priority' },
  { value: 'NORMAL', label: 'Normal Priority' },
  { value: 'HIGH', label: 'High Priority' },
  { value: 'EMERGENCY', label: 'Emergency' },
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Animal Profile</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {/* STATUS AND PRIORITY SECTION - NEW */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1, color: '#d32f2f' }}>
                🏥 Status & Priority Management
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Animal Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Animal Status"
                >
                  {STATUS_TYPES.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  name="priority_level"
                  value={formData.priority_level}
                  onChange={handleChange}
                  label="Priority Level"
                >
                  {PRIORITY_LEVELS.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                📋 Basic Information
              </Typography>
            </Grid>

            {/* Basic Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Animal Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Animal Type</InputLabel>
                <Select
                  name="animal_type"
                  value={formData.animal_type}
                  onChange={handleChange}
                  label="Animal Type"
                >
                  {ANIMAL_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
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
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
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
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                🏥 Health & Behavior Information
              </Typography>
            </Grid>

            {/* Health and Behavior */}
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
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ 
              backgroundColor: '#8d6e63',
              '&:hover': { backgroundColor: '#6d4c41' }
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EditAnimalForm;