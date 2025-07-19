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
  Avatar,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  People as PeopleIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { keyframes } from '@mui/system';
import api from '../redux/api';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63', // Warm Brown
  secondary: '#81c784', // Soft Green
  success: '#4caf50', // Fresh Green
  grey: '#f3e5ab', // Warm Cream
  accent: '#ff8a65', // Gentle Orange
  background: '#fff8e1', // Soft Cream
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
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="md">
          <Zoom in timeout={1000}>
            <Alert 
              severity="error"
              sx={{
                borderRadius: 4,
                fontSize: '1.1rem',
                backgroundColor: alpha('#f44336', 0.1),
                border: `2px solid ${alpha('#f44336', 0.3)}`,
                boxShadow: `0 20px 40px ${alpha('#f44336', 0.1)}`,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Access Denied
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                You don't have permission to add staff members. Only shelter administrators can access this feature.
              </Typography>
            </Alert>
          </Zoom>
        </Container>
      </Box>
    );
  }

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
      overflow: 'hidden'
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
        <SparkleIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
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
        <PeopleIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="md" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header */}
        <Fade in timeout={1000}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4,
            position: 'relative'
          }}>
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

            <Slide direction="right" in timeout={1200}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/staff-management')}
                sx={{ 
                  mr: 3,
                  color: customTheme.primary,
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: alpha(customTheme.primary, 0.1),
                    transform: 'translateX(-5px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Back to Staff Management
              </Button>
            </Slide>

            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 4s ease infinite`,
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.02em'
                }}
              >
                Add New Staff Member
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                Create a new team member account with appropriate permissions
              </Typography>
            </Box>
          </Box>
        </Fade>

        {/* Enhanced Main Form Card */}
        <Slide direction="up" in timeout={1400}>
          <Paper sx={{ 
            p: 6,
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `
              0 25px 50px ${alpha(customTheme.primary, 0.15)},
              0 0 0 1px ${alpha(customTheme.primary, 0.05)},
              inset 0 1px 0 ${alpha('#ffffff', 0.6)}
            `,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(135deg, ${alpha(customTheme.background, 0.8)} 0%, transparent 50%),
                radial-gradient(circle at top right, ${alpha(customTheme.accent, 0.05)} 0%, transparent 50%)
              `,
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none'
            },
            '&:hover::before': {
              opacity: 1
            }
          }}>
            {/* Enhanced Success Message */}
            {success && (
              <Fade in timeout={800}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    backgroundColor: alpha(customTheme.success, 0.1),
                    border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem',
                      color: customTheme.success
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {success}
                  </Typography>
                </Alert>
              </Fade>
            )}

            {/* Enhanced Error Message */}
            {error && (
              <Fade in timeout={800}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    backgroundColor: alpha('#f44336', 0.1),
                    border: `2px solid ${alpha('#f44336', 0.3)}`,
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem'
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {error}
                  </Typography>
                </Alert>
              </Fade>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                {/* Account Information Section */}
                <Grid item xs={12}>
                  <Fade in timeout={1000} style={{ transitionDelay: '200ms' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                          sx={{
                            bgcolor: customTheme.primary,
                            width: 48,
                            height: 48,
                            mr: 2,
                            boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`,
                            animation: `${pulse} 3s infinite`
                          }}
                        >
                          <PersonAddIcon sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: customTheme.primary,
                            fontWeight: 700
                          }}
                        >
                          Account Information
                        </Typography>
                      </Box>
                      <Divider sx={{ 
                        mb: 4, 
                        backgroundColor: alpha(customTheme.primary, 0.15), 
                        height: 2,
                        borderRadius: 1
                      }} />
                    </Box>
                  </Fade>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Zoom in timeout={800} style={{ transitionDelay: '300ms' }}>
                    <TextField
                      name="username"
                      label="Username"
                      fullWidth
                      required
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="e.g., john.doe"
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: customTheme.primary,
                          fontWeight: 600
                        },
                        '& .MuiOutlinedInput-root': {
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
                        }
                      }}
                    />
                  </Zoom>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Zoom in timeout={800} style={{ transitionDelay: '400ms' }}>
                    <TextField
                      name="email"
                      label="Email Address"
                      type="email"
                      fullWidth
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g., john.doe@shelter.com"
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: customTheme.primary,
                          fontWeight: 600
                        },
                        '& .MuiOutlinedInput-root': {
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
                        }
                      }}
                    />
                  </Zoom>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Zoom in timeout={800} style={{ transitionDelay: '500ms' }}>
                    <TextField
                      name="password"
                      label="Password"
                      type="password"
                      fullWidth
                      required
                      value={formData.password}
                      onChange={handleChange}
                      helperText="Minimum 8 characters"
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: customTheme.primary,
                          fontWeight: 600
                        },
                        '& .MuiOutlinedInput-root': {
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
                        '& .MuiFormHelperText-root': {
                          color: alpha(customTheme.primary, 0.7),
                          fontWeight: 500
                        }
                      }}
                    />
                  </Zoom>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Zoom in timeout={800} style={{ transitionDelay: '600ms' }}>
                    <TextField
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      fullWidth
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: customTheme.primary,
                          fontWeight: 600
                        },
                        '& .MuiOutlinedInput-root': {
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
                        }
                      }}
                    />
                  </Zoom>
                </Grid>

                {/* Personal Information Section */}
                <Grid item xs={12}>
                  <Fade in timeout={1000} style={{ transitionDelay: '700ms' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: customTheme.accent,
                            width: 48,
                            height: 48,
                            mr: 2,
                            boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.3)}`,
                            animation: `${pulse} 3s infinite`,
                            animationDelay: '1s'
                          }}
                        >
                          <PeopleIcon sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: customTheme.accent,
                            fontWeight: 700
                          }}
                        >
                          Personal Information
                        </Typography>
                      </Box>
                      <Divider sx={{ 
                        mb: 4, 
                        backgroundColor: alpha(customTheme.accent, 0.15), 
                        height: 2,
                        borderRadius: 1
                      }} />
                    </Box>
                  </Fade>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Zoom in timeout={800} style={{ transitionDelay: '800ms' }}>
                    <TextField
                      name="first_name"
                      label="First Name"
                      fullWidth
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: customTheme.accent,
                          fontWeight: 600
                        },
                        '& .MuiOutlinedInput-root': {
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
                  </Zoom>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Zoom in timeout={800} style={{ transitionDelay: '900ms' }}>
                    <TextField
                      name="last_name"
                      label="Last Name"
                      fullWidth
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: customTheme.accent,
                          fontWeight: 600
                        },
                        '& .MuiOutlinedInput-root': {
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
                  </Zoom>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Zoom in timeout={800} style={{ transitionDelay: '1000ms' }}>
                    <TextField
                      name="phone"
                      label="Phone Number"
                      fullWidth
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g., +1 (555) 123-4567"
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: customTheme.accent,
                          fontWeight: 600
                        },
                        '& .MuiOutlinedInput-root': {
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
                  </Zoom>
                </Grid>

                {/* Role Assignment Section */}
                <Grid item xs={12} sm={6}>
                  <Zoom in timeout={800} style={{ transitionDelay: '1100ms' }}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ color: customTheme.secondary, fontWeight: 600 }}>Staff Role</InputLabel>
                      <Select
                        name="user_type"
                        value={formData.user_type}
                        onChange={handleChange}
                        label="Staff Role"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(customTheme.secondary, 0.3),
                            borderWidth: 2
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.secondary
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: customTheme.secondary
                          }
                        }}
                      >
                        {userTypeChoices.map((choice) => (
                          <MenuItem key={choice.value} value={choice.value}>
                            {choice.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Zoom>
                </Grid>

                {/* Role Description */}
                <Grid item xs={12}>
                  <Fade in timeout={1000} style={{ transitionDelay: '1200ms' }}>
                    <Paper sx={{ 
                      p: 4, 
                      borderRadius: 4,
                      background: `
                        radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                        linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
                      `,
                      border: `2px solid ${alpha(customTheme.secondary, 0.15)}`,
                      position: 'relative'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: customTheme.secondary,
                            width: 40,
                            height: 40,
                            mr: 2,
                            boxShadow: `0 6px 20px ${alpha(customTheme.secondary, 0.3)}`
                          }}
                        >
                          <WorkIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: customTheme.secondary }}>
                          Role Descriptions
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), lineHeight: 1.8, fontWeight: 500 }}>
                        <strong style={{ color: customTheme.primary }}>Staff Member:</strong> Can manage animals, handle adoptions, and access daily operations<br/>
                        <strong style={{ color: customTheme.primary }}>Shelter Staff:</strong> Same as staff member with additional shelter-specific permissions<br/>
                        <strong style={{ color: customTheme.primary }}>Volunteer:</strong> Limited access for volunteer activities and animal care logging
                      </Typography>
                    </Paper>
                  </Fade>
                </Grid>

                {/* Enhanced Submit Button */}
                <Grid item xs={12}>
                  <Fade in timeout={1000} style={{ transitionDelay: '1300ms' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, mt: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/staff-management')}
                        disabled={loading}
                        sx={{
                          borderColor: alpha(customTheme.primary, 0.7),
                          color: alpha(customTheme.primary, 0.7),
                          fontWeight: 600,
                          py: 2,
                          px: 4,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontSize: '1rem',
                          minWidth: 120,
                          '&:hover': {
                            borderColor: customTheme.primary,
                            color: customTheme.primary,
                            backgroundColor: alpha(customTheme.primary, 0.05),
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{
                          background: `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
                          color: '#ffffff',
                          fontWeight: 700,
                          py: 2,
                          px: 4,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontSize: '1rem',
                          minWidth: 180,
                          position: 'relative',
                          overflow: 'hidden',
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
                          '&:hover': {
                            background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.4)}`,
                            '&::before': {
                              left: '100%'
                            }
                          },
                          '&:disabled': {
                            background: alpha(customTheme.success, 0.3),
                            color: alpha('#ffffff', 0.7),
                            transform: 'none',
                            boxShadow: 'none'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Creating...' : 'Create Staff Member'}
                      </Button>
                    </Box>
                  </Fade>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
}

export default AddStaffForm;