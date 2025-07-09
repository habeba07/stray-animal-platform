import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register, reset } from '../redux/slices/authSlice';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Fade,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green 
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    user_type: 'PUBLIC',
    phone_number: '',
    address: '',
    organization_name: '',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess) {
      navigate('/login');
    }

    return () => {
      dispatch(reset());
    };
  }, [isSuccess, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirm) {
      alert('Passwords do not match');
      return;
    }

    dispatch(register(formData));
  };

  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'transparent',
      '& fieldset': {
        borderColor: customTheme.primary + '80',
        borderWidth: 2,
      },
      '&:hover fieldset': {
        borderColor: customTheme.secondary,
        borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: customTheme.primary,
        borderWidth: 3,
      },
    },
    '& .MuiInputLabel-root': {
      color: customTheme.primary,
      fontWeight: 600,
      '&.Mui-focused': {
        color: customTheme.primary,
      },
    },
    '& .MuiOutlinedInput-input': {
      color: customTheme.primary,
      fontWeight: 500,
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${customTheme.background} 0%, ${customTheme.grey} 100%)`,
      py: 6,
      px: 2,
      // Remove any potential background
      backgroundColor: 'transparent'
    }}>
      <Container maxWidth="md" sx={{ backgroundColor: 'transparent' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5, backgroundColor: 'transparent' }}>
          <Avatar
            sx={{
              bgcolor: customTheme.primary,
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              boxShadow: `0 8px 25px ${customTheme.primary}40`
            }}
          >
            <PersonAddIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography 
            variant="h2" 
            sx={{ 
              color: customTheme.primary,
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Join PAWRescue
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: customTheme.primary,
              fontWeight: 400,
              opacity: 0.9,
              mb: 4,
              lineHeight: 1.4
            }}
          >
            Advanced Stray Animal Management Platform
          </Typography>
        </Box>
        
        {isError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              backgroundColor: 'transparent',
              border: `2px solid #f44336`,
              '& .MuiAlert-icon': {
                color: '#d32f2f'
              }
            }}
          >
            {message}
          </Alert>
        )}
        
        {/* Form with NO background container */}
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          noValidate
          sx={{ 
            backgroundColor: 'transparent',
            maxWidth: 800,
            mx: 'auto'
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                sx={fieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                sx={fieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                sx={fieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password_confirm"
                label="Confirm Password"
                type="password"
                id="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                sx={fieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="first_name"
                label="First Name"
                id="first_name"
                value={formData.first_name}
                onChange={handleChange}
                sx={fieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="last_name"
                label="Last Name"
                id="last_name"
                value={formData.last_name}
                onChange={handleChange}
                sx={fieldStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel 
                  id="user-type-label"
                  sx={{
                    color: customTheme.primary,
                    fontWeight: 600,
                    '&.Mui-focused': {
                      color: customTheme.primary,
                    },
                  }}
                >
                  User Type
                </InputLabel>
                <Select
                  labelId="user-type-label"
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  label="User Type"
                  onChange={handleChange}
                  sx={{
                    borderRadius: 3,
                    backgroundColor: 'transparent',
                    color: customTheme.primary,
                    fontWeight: 500,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: customTheme.primary + '80',
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: customTheme.secondary,
                      borderWidth: 2,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: customTheme.primary,
                      borderWidth: 3,
                    },
                  }}
                >
                  <MenuItem value="PUBLIC">General Public</MenuItem>
                  <MenuItem value="VOLUNTEER">Volunteer</MenuItem>
                  <MenuItem value="SHELTER">Animal Shelter/Rescue Organization</MenuItem>
                  <MenuItem value="STAFF">Shelter Staff</MenuItem>
                  <MenuItem value="AUTHORITY">Local Authority</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phone_number"
                label="Phone Number"
                id="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                sx={fieldStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="address"
                label="Address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                sx={fieldStyles}
              />
            </Grid>
            
            {formData.user_type === 'SHELTER' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="organization_name"
                  label="Organization Name"
                  id="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  sx={fieldStyles}
                />
              </Grid>
            )}
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ 
              mt: 5, 
              mb: 3,
              py: 2,
              borderRadius: 4,
              fontSize: '1.2rem',
              fontWeight: 700,
              background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
              boxShadow: `0 6px 20px ${customTheme.accent}50`,
              '&:hover': {
                background: `linear-gradient(45deg, ${customTheme.accent}e0 30%, ${customTheme.secondary}e0 90%)`,
                transform: 'translateY(-3px)',
                boxShadow: `0 8px 30px ${customTheme.accent}60`,
              },
              '&:active': {
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            {isLoading ? <CircularProgress size={26} color="inherit" /> : 'Create Account'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 3, backgroundColor: 'transparent' }}>
            <Typography variant="body1" sx={{ color: customTheme.primary, fontSize: '1.1rem' }}>
              Already have an account?{' '}
              <RouterLink 
                to="/login" 
                style={{ 
                  textDecoration: 'none',
                  color: customTheme.accent,
                  fontWeight: 700
                }}
              >
                Login here
              </RouterLink>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default RegisterPage;