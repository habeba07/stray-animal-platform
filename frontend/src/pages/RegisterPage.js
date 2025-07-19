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
  Slide,
  Zoom,
  alpha,
  Divider,
  Paper,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Collapse,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  PersonAdd as PersonAddIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha(customTheme.accent, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0)}; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

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

  // Check password match
  useEffect(() => {
    if (formData.password && formData.password_confirm) {
      setPasswordMatch(formData.password === formData.password_confirm);
    }
  }, [formData.password, formData.password_confirm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
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
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      minHeight: 65,
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: alpha(customTheme.primary, 0.3),
        borderWidth: 2,
      },
      '&:hover fieldset': {
        borderColor: customTheme.secondary,
        borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: customTheme.primary,
        borderWidth: 3,
        boxShadow: `0 0 0 3px ${alpha(customTheme.primary, 0.1)}`,
      },
    },
    '& .MuiInputLabel-root': {
      color: customTheme.primary,
      fontWeight: 600,
      fontSize: '1rem',
      '&.Mui-focused': {
        color: customTheme.primary,
      },
      '&.MuiInputLabel-shrink': {
        fontSize: '0.85rem',
        transform: 'translate(14px, -9px) scale(0.85)',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: customTheme.primary,
      fontWeight: 500,
      padding: '18px 14px',
    }
  };

  const selectStyles = {
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: customTheme.primary,
    fontWeight: 500,
    transition: 'all 0.3s ease',
    minHeight: 65,
    '& .MuiSelect-select': {
      padding: '18px 14px',
      minHeight: '24px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(customTheme.primary, 0.3),
      borderWidth: 2,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: customTheme.secondary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: customTheme.primary,
      borderWidth: 3,
      boxShadow: `0 0 0 3px ${alpha(customTheme.primary, 0.1)}`,
    },
  };

  const getUserTypeIcon = (type) => {
    switch(type) {
      case 'PUBLIC': return <PersonIcon />;
      case 'VOLUNTEER': return <FavoriteIcon />;
      case 'SHELTER': return <BusinessIcon />;
      case 'STAFF': return <GroupIcon />;
      case 'AUTHORITY': return <CheckIcon />;
      default: return <PersonIcon />;
    }
  };

  const getUserTypeColor = (type) => {
    switch(type) {
      case 'PUBLIC': return customTheme.primary;
      case 'VOLUNTEER': return customTheme.accent;
      case 'SHELTER': return customTheme.secondary;
      case 'STAFF': return customTheme.success;
      case 'AUTHORITY': return '#9c27b0';
      default: return customTheme.primary;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
      py: 6,
      px: 2
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          animation: `${float} 10s ease-in-out infinite`,
          animationDelay: '0s',
          opacity: 0.6
        }}
      >
        <PetsIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.4
        }}
      >
        <PersonAddIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          animation: `${float} 14s ease-in-out infinite`,
          animationDelay: '4s',
          opacity: 0.5
        }}
      >
        <FavoriteIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          right: '5%',
          animation: `${float} 16s ease-in-out infinite`,
          animationDelay: '6s',
          opacity: 0.3
        }}
      >
        <StarIcon sx={{ fontSize: 25, color: customTheme.accent, transform: 'rotate(45deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Box>
            {/* Hero Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              {/* Floating sparkles */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  left: '30%',
                  animation: `${sparkle} 3s infinite`,
                  animationDelay: '0s'
                }}
              >
                <StarIcon sx={{ color: customTheme.accent, fontSize: 20 }} />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: '25%',
                  animation: `${sparkle} 3s infinite`,
                  animationDelay: '1s'
                }}
              >
                <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
              </Box>
              
              <Slide direction="down" in timeout={1000}>
                <Avatar
                  sx={{
                    bgcolor: customTheme.primary,
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 4,
                    boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 50 }} />
                </Avatar>
              </Slide>
              
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 4s ease infinite`,
                  mb: 2,
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Join PAWRescue
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Advanced Stray Animal Management Platform - Start making a difference today
              </Typography>
            </Box>

            {/* Error Alert */}
            {isError && (
              <Slide direction="down" in timeout={800}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: `2px solid #f44336`,
                    backdropFilter: 'blur(10px)',
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem',
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {message}
                  </Typography>
                </Alert>
              </Slide>
            )}
            
            {/* Main Registration Card */}
            <Card
              sx={{
                borderRadius: 6,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.05)} 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.05)} 0%, transparent 50%)
                  `,
                  pointerEvents: 'none'
                }
              }}
            >
              <CardContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  
                  {/* Form Header */}
                  <Box sx={{ p: 5, pb: 3 }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: customTheme.primary,
                        fontWeight: 700,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        justifyContent: 'center'
                      }}
                    >
                      <PersonAddIcon sx={{ fontSize: '1.2em' }} />
                      Create Your Account
                    </Typography>
                    <Divider 
                      sx={{ 
                        borderColor: customTheme.secondary, 
                        borderWidth: 2,
                        mb: 4
                      }} 
                    />
                  </Box>

                  {/* Form Fields */}
                  <Box sx={{ px: 5, pb: 3 }}>
                    <Grid container spacing={4}>
                      {/* Basic Information Section */}
                      <Grid item xs={12}>
                        <Slide direction="right" in timeout={1000}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 4,
                              mb: 4,
                              borderRadius: 4,
                              background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.08)} 0%, ${alpha(customTheme.secondary, 0.03)} 100%)`,
                              border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
                            }}
                          >
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                color: customTheme.primary,
                                fontWeight: 700,
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                            >
                              <PersonIcon />
                              Basic Information
                            </Typography>
                            
                            <Grid container spacing={3}>
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
                                  InputProps={{
                                    startAdornment: (
                                      <PersonIcon sx={{ 
                                        color: customTheme.primary, 
                                        mr: 1, 
                                        fontSize: 24 
                                      }} />
                                    ),
                                  }}
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
                                  InputProps={{
                                    startAdornment: (
                                      <EmailIcon sx={{ 
                                        color: customTheme.primary, 
                                        mr: 1, 
                                        fontSize: 24 
                                      }} />
                                    ),
                                  }}
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
                            </Grid>
                          </Paper>
                        </Slide>
                      </Grid>

                      {/* Security Section */}
                      <Grid item xs={12}>
                        <Slide direction="left" in timeout={1200}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 4,
                              mb: 4,
                              borderRadius: 4,
                              background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.08)} 0%, ${alpha(customTheme.accent, 0.03)} 100%)`,
                              border: `2px solid ${alpha(customTheme.accent, 0.2)}`
                            }}
                          >
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                color: customTheme.primary,
                                fontWeight: 700,
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                            >
                              <LockIcon />
                              Account Security
                            </Typography>
                            
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  required
                                  fullWidth
                                  name="password"
                                  label="Password"
                                  type={showPassword ? 'text' : 'password'}
                                  id="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  sx={fieldStyles}
                                  InputProps={{
                                    startAdornment: (
                                      <LockIcon sx={{ 
                                        color: customTheme.primary, 
                                        mr: 1, 
                                        fontSize: 24 
                                      }} />
                                    ),
                                    endAdornment: (
                                      <Box
                                        component="button"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        sx={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          color: customTheme.primary,
                                          display: 'flex',
                                          alignItems: 'center',
                                          padding: 0
                                        }}
                                      >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </Box>
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  required
                                  fullWidth
                                  name="password_confirm"
                                  label="Confirm Password"
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  id="password_confirm"
                                  value={formData.password_confirm}
                                  onChange={handleChange}
                                  error={!passwordMatch && formData.password_confirm}
                                  helperText={!passwordMatch && formData.password_confirm ? "Passwords don't match" : ""}
                                  sx={fieldStyles}
                                  InputProps={{
                                    startAdornment: (
                                      <LockIcon sx={{ 
                                        color: customTheme.primary, 
                                        mr: 1, 
                                        fontSize: 24 
                                      }} />
                                    ),
                                    endAdornment: (
                                      <Box
                                        component="button"
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        sx={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          color: customTheme.primary,
                                          display: 'flex',
                                          alignItems: 'center',
                                          padding: 0
                                        }}
                                      >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                      </Box>
                                    ),
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        </Slide>
                      </Grid>

                      {/* User Type Section */}
                      <Grid item xs={12}>
                        <Slide direction="right" in timeout={1400}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 4,
                              mb: 4,
                              borderRadius: 4,
                              background: `linear-gradient(135deg, ${alpha(getUserTypeColor(formData.user_type), 0.08)} 0%, ${alpha(getUserTypeColor(formData.user_type), 0.03)} 100%)`,
                              border: `2px solid ${alpha(getUserTypeColor(formData.user_type), 0.2)}`,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                color: customTheme.primary,
                                fontWeight: 700,
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                            >
                              {getUserTypeIcon(formData.user_type)}
                              Account Type
                            </Typography>
                            
                            <FormControl fullWidth>
                              <InputLabel 
                                sx={{
                                  color: customTheme.primary,
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  '&.Mui-focused': {
                                    color: customTheme.primary,
                                  },
                                }}
                              >
                                User Type
                              </InputLabel>
                              <Select
                                name="user_type"
                                value={formData.user_type}
                                label="User Type"
                                onChange={handleChange}
                                sx={selectStyles}
                              >
                                <MenuItem value="PUBLIC">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <PersonIcon sx={{ color: customTheme.primary }} />
                                    General Public
                                  </Box>
                                </MenuItem>
                                <MenuItem value="VOLUNTEER">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <FavoriteIcon sx={{ color: customTheme.accent }} />
                                    Volunteer
                                  </Box>
                                </MenuItem>
                                <MenuItem value="SHELTER">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <BusinessIcon sx={{ color: customTheme.secondary }} />
                                    Animal Shelter/Rescue Organization
                                  </Box>
                                </MenuItem>
                                <MenuItem value="STAFF">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <GroupIcon sx={{ color: customTheme.success }} />
                                    Shelter Staff
                                  </Box>
                                </MenuItem>
                                <MenuItem value="AUTHORITY">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckIcon sx={{ color: '#9c27b0' }} />
                                    Local Authority
                                  </Box>
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Paper>
                        </Slide>
                      </Grid>

                      {/* Contact Information Section */}
                      <Grid item xs={12}>
                        <Slide direction="left" in timeout={1600}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 4,
                              mb: 4,
                              borderRadius: 4,
                              background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.grey, 0.15)} 100%)`,
                              border: `2px solid ${alpha(customTheme.primary, 0.2)}`
                            }}
                          >
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                color: customTheme.primary,
                                fontWeight: 700,
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                            >
                              <PhoneIcon />
                              Contact Information
                            </Typography>
                            
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  name="phone_number"
                                  label="Phone Number"
                                  id="phone_number"
                                  value={formData.phone_number}
                                  onChange={handleChange}
                                  sx={fieldStyles}
                                  InputProps={{
                                    startAdornment: (
                                      <PhoneIcon sx={{ 
                                        color: customTheme.primary, 
                                        mr: 1, 
                                        fontSize: 24 
                                      }} />
                                    ),
                                  }}
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
                                  InputProps={{
                                    startAdornment: (
                                      <HomeIcon sx={{ 
                                        color: customTheme.primary, 
                                        mr: 1, 
                                        fontSize: 24 
                                      }} />
                                    ),
                                  }}
                                />
                              </Grid>
                              
                              {/* Organization Name for Shelter type */}
                              <Collapse in={formData.user_type === 'SHELTER'} timeout="auto" unmountOnExit>
                                <Grid item xs={12} sx={{ mt: 3 }}>
                                  <TextField
                                    fullWidth
                                    name="organization_name"
                                    label="Organization Name"
                                    id="organization_name"
                                    value={formData.organization_name}
                                    onChange={handleChange}
                                    sx={fieldStyles}
                                    InputProps={{
                                      startAdornment: (
                                        <BusinessIcon sx={{ 
                                          color: customTheme.primary, 
                                          mr: 1, 
                                          fontSize: 24 
                                        }} />
                                      ),
                                    }}
                                  />
                                </Grid>
                              </Collapse>
                            </Grid>
                          </Paper>
                        </Slide>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Submit Button */}
                  <Paper
                    elevation={0}
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.08)} 0%, ${alpha(customTheme.primary, 0.03)} 100%)`,
                      borderTop: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                      p: 5
                    }}
                  >
                    <Slide direction="up" in timeout={1800}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading || !passwordMatch}
                        startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <PersonAddIcon />}
                        sx={{ 
                          py: 3,
                          borderRadius: 4,
                          fontSize: '1.3rem',
                          fontWeight: 800,
                          background: isLoading || !passwordMatch ? 
                            `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.primary, 0.2)} 90%)` :
                            `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                          boxShadow: !isLoading && passwordMatch ? 
                            `0 8px 30px ${alpha(customTheme.accent, 0.4)}` : 
                            'none',
                          color: '#ffffff',
                          textTransform: 'none',
                          position: 'relative',
                          overflow: 'hidden',
                          mb: 4,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                            transition: 'left 0.6s ease',
                          },
                          '&:hover:not(:disabled)': {
                            background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 40px ${alpha(customTheme.accent, 0.5)}`,
                            '&::before': {
                              left: '100%'
                            }
                          },
                          '&:disabled': {
                            color: alpha('#ffffff', 0.6),
                            cursor: 'not-allowed'
                          }
                        }}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </Slide>
                    
                    {/* Login Link */}
                    <Fade in timeout={2000}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: customTheme.primary, fontSize: '1.1rem' }}>
                          Already have an account?{' '}
                          <RouterLink 
                            to="/login" 
                            style={{ 
                              textDecoration: 'none',
                              color: customTheme.accent,
                              fontWeight: 700,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Sign In
                          </RouterLink>
                        </Typography>
                      </Box>
                    </Fade>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default RegisterPage;