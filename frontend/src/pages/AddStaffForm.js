import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../redux/api';

function AddStaffForm() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    user_type: 'STAFF',
  });

  // Check if current user can add staff (shelter administrators and staff)
  const canAddStaff = user && (
    user.is_staff || 
    user.user_type === 'ADMIN' || 
    user.user_type === 'STAFF' || 
    user.user_type === 'SHELTER'
  );

  const userTypeChoices = [
    { value: 'STAFF', label: 'Staff Member' },
    { value: 'SHELTER', label: 'Shelter Staff' },
    { value: 'VOLUNTEER', label: 'Volunteer' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.username) errors.push('Username is required');
    if (!formData.email) errors.push('Email is required');
    if (!formData.password) errors.push('Password is required');
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    if (formData.password && formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!formData.first_name) errors.push('First name is required');
    if (!formData.last_name) errors.push('Last name is required');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword, // API expects password_confirm
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone, // API expects phone_number, not phone
        user_type: formData.user_type,
        is_staff: formData.user_type === 'STAFF' || formData.user_type === 'SHELTER',
      };

      // Create new staff member using the users endpoint
      const response = await api.post('/users/', submitData);
      
      setSuccess(`Staff member ${formData.first_name} ${formData.last_name} created successfully!`);
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone: '',
        user_type: 'STAFF',
      });

      // Redirect to staff management after 2 seconds
      setTimeout(() => {
        navigate('/staff-management');
      }, 2000);

    } catch (err) {
      console.error('Error creating staff member:', err);
      if (err.response?.data) {
        // Handle specific field errors
        const errorMessages = [];
        Object.entries(err.response.data).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            errorMessages.push(`${field}: ${messages.join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${messages}`);
          }
        });
        setError(errorMessages.join('; '));
      } else {
        setError('Failed to create staff member. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!canAddStaff) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          You don't have permission to add staff members. Only shelter administrators can access this feature.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/staff-management')}
          sx={{ mr: 3 }}
        >
          Back to Staff Management
        </Button>
        <Typography variant="h4" component="h1">
          Add New Staff Member
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Account Information */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonAddIcon sx={{ mr: 1, color: '#8d6e63' }} />
                <Typography variant="h6">Account Information</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="username"
                label="Username"
                fullWidth
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g., john.doe"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., john.doe@shelter.com"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                helperText="Minimum 8 characters"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>

            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="first_name"
                label="First Name"
                fullWidth
                required
                value={formData.first_name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="last_name"
                label="Last Name"
                fullWidth
                required
                value={formData.last_name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                fullWidth
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., +1 (555) 123-4567"
              />
            </Grid>

            {/* Role Assignment */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Staff Role</InputLabel>
                <Select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  label="Staff Role"
                >
                  {userTypeChoices.map((choice) => (
                    <MenuItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Role Description */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Role Descriptions:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • <strong>Staff Member:</strong> Can manage animals, handle adoptions, and access daily operations<br/>
                  • <strong>Shelter Staff:</strong> Same as staff member with additional shelter-specific permissions<br/>
                  • <strong>Volunteer:</strong> Limited access for volunteer activities and animal care logging
                </Typography>
              </Box>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/staff-management')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    backgroundColor: '#8d6e63',
                    '&:hover': { backgroundColor: '#6d4c41' },
                    minWidth: 150
                  }}
                >
                  {loading ? 'Creating...' : 'Create Staff Member'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default AddStaffForm;