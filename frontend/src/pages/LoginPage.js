import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../redux/slices/authSlice';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Alert, 
  CircularProgress,
  Paper,
  Avatar,
  Fade,
  Slide,
  Zoom,
  alpha,
  Divider,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Login as LoginIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
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

function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Check if already authenticated on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('LoginPage useEffect - checking stored user:', !storedUser);
    if (storedUser && storedUser.token) {
      console.log('Already authenticated, redirecting...');
      setIsAuthenticated && setIsAuthenticated(true);
      navigate('/', { replace: true });
    }
  }, [setIsAuthenticated, navigate]);

  // Handle login success
  useEffect(() => {
    if (isSuccess && user) {
      console.log('Login successful, user:', user);
      setIsAuthenticated && setIsAuthenticated(true);
      
      // Force a re-render by dispatching a custom event
      window.dispatchEvent(new Event('storage'));
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }

    // Reset auth state
    return () => {
      dispatch(reset());
    };
  }, [isSuccess, user, setIsAuthenticated, navigate, dispatch]);

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!username.trim() && !password.trim()) {
      errors.general = 'Please enter username and password';
      return errors;
    }
    
    if (!username.trim()) {
      errors.username = 'Please enter username';
    }
    
    if (!password.trim()) {
      errors.password = 'Please enter password';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear validation errors when user types
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (validationErrors.username || validationErrors.general) {
      setValidationErrors(prev => ({
        ...prev,
        username: '',
        general: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (validationErrors.password || validationErrors.general) {
      setValidationErrors(prev => ({
        ...prev,
        password: '',
        general: ''
      }));
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log('Attempting login with:', { username, password: '***' });
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    // Use Redux action for login
    dispatch(login({ username, password }));
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

  // Check if form is valid for button enabling
  const isFormValid = username.trim() && password.trim();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, ${alpha(customTheme.primary, 0.1)} 0%, transparent 50%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${customTheme.grey} 100%)
      `,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
      animation: `${gradientShift} 8s ease infinite`,
      py: 4,
      px: 2,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${customTheme.primary.substring(1)}' fill-opacity='0.03'%3E%3Ccircle cx='9' cy='9' r='3'/%3E%3Ccircle cx='39' cy='39' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `,
        animation: `${shimmer} 20s linear infinite`,
      }
    }}>
      {/* Floating elements */}
      <PetsIcon sx={{ 
        position: 'absolute', 
        top: '15%', 
        left: '10%', 
        fontSize: 40, 
        color: alpha(customTheme.accent, 0.3),
        animation: `${float} 6s ease-in-out infinite`,
        animationDelay: '0s'
      }} />
      <FavoriteIcon sx={{ 
        position: 'absolute', 
        top: '25%', 
        right: '15%', 
        fontSize: 35, 
        color: alpha(customTheme.secondary, 0.3),
        animation: `${float} 8s ease-in-out infinite`,
        animationDelay: '2s'
      }} />
      <StarIcon sx={{ 
        position: 'absolute', 
        bottom: '20%', 
        left: '20%', 
        fontSize: 30, 
        color: alpha(customTheme.primary, 0.3),
        animation: `${sparkle} 4s ease-in-out infinite`,
        animationDelay: '1s'
      }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={800}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minHeight: '100vh',
            justifyContent: 'center'
          }}>
            {/* Main Login Card */}
            <Card sx={{
              width: '100%',
              maxWidth: 480,
              background: `linear-gradient(145deg, 
                rgba(255,255,255,0.95) 0%, 
                rgba(255,255,255,0.85) 100%)`,
              backdropFilter: 'blur(20px)',
              borderRadius: 6,
              boxShadow: `
                0 20px 40px rgba(0,0,0,0.1),
                0 15px 25px rgba(0,0,0,0.05),
                inset 0 1px 0 rgba(255,255,255,0.8)
              `,
              border: `1px solid ${alpha(customTheme.primary, 0.1)}`,
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.secondary}, ${customTheme.accent})`,
              }
            }}>
              <CardContent sx={{ p: 6 }}>
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  {/* Logo Animation */}
                  <Zoom in timeout={1000}>
                    <Avatar sx={{
                      mx: 'auto',
                      mb: 3,
                      width: 80,
                      height: 80,
                      background: `linear-gradient(135deg, ${customTheme.primary}, ${customTheme.secondary})`,
                      animation: `${pulse} 3s ease-in-out infinite`,
                      boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`,
                    }}>
                      <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Avatar>
                  </Zoom>

                  {/* Title */}
                  <Slide direction="down" in timeout={1200}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800,
                        background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.secondary})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 1,
                        fontSize: { xs: '2rem', sm: '2.5rem' }
                      }}
                    >
                      Welcome Back
                    </Typography>
                  </Slide>

                  <Slide direction="up" in timeout={1400}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: customTheme.primary,
                        opacity: 0.8,
                        fontWeight: 500,
                        fontSize: '1.1rem'
                      }}
                    >
                      Sign in to continue helping animals
                    </Typography>
                  </Slide>
                </Box>

                {/* Error Alert */}
                <Fade in={isError || validationErrors.general} timeout={500}>
                  <Box sx={{ mb: 3 }}>
                    {(isError || validationErrors.general) && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          borderRadius: 3,
                          backgroundColor: alpha('#f44336', 0.1),
                          border: `1px solid ${alpha('#f44336', 0.2)}`,
                          '& .MuiAlert-message': {
                            fontWeight: 500
                          }
                        }}
                      >
                        {validationErrors.general || message}
                      </Alert>
                    )}
                  </Box>
                </Fade>

                {/* Login Form */}
                <Paper 
                  component="form" 
                  onSubmit={handleLogin}
                  elevation={0}
                  sx={{ 
                    backgroundColor: 'transparent',
                    animation: `${slideInUp} 0.6s ease-out`
                  }}
                >
                  {/* Username Field */}
                  <Slide direction="right" in timeout={1000}>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        required
                        id="username"
                        name="username"
                        label="Username"
                        value={username}
                        onChange={handleUsernameChange}
                        error={!!validationErrors.username}
                        helperText={validationErrors.username}
                        autoComplete="username"
                        autoFocus
                        sx={{
                          ...fieldStyles,
                          '& .MuiInputAdornment-root': {
                            color: customTheme.primary,
                          }
                        }}
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
                    </Box>
                  </Slide>

                  {/* Password Field */}
                  <Slide direction="left" in timeout={1200}>
                    <Box sx={{ mb: 4 }}>
                      <TextField
                        fullWidth
                        required
                        id="password"
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        error={!!validationErrors.password}
                        helperText={validationErrors.password}
                        autoComplete="current-password"
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
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: customTheme.primary }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                      />
                    </Box>
                  </Slide>

                  {/* Submit Button */}
                  <Slide direction="up" in timeout={1600}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isLoading || !isFormValid}
                      sx={{
                        py: 2.5,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 4,
                        textTransform: 'none',
                        background: !isFormValid 
                          ? '#ccc' 
                          : `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.secondary} 90%)`,
                        boxShadow: !isFormValid 
                          ? 'none' 
                          : `0 8px 25px ${alpha(customTheme.primary, 0.3)}`,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          background: !isFormValid 
                            ? '#ccc' 
                            : `linear-gradient(45deg, ${customTheme.primary}dd 30%, ${customTheme.secondary}dd 90%)`,
                          transform: isFormValid ? 'translateY(-2px)' : 'none',
                          boxShadow: isFormValid 
                            ? `0 12px 35px ${alpha(customTheme.primary, 0.4)}` 
                            : 'none',
                        },
                        '&:active': {
                          transform: isFormValid ? 'translateY(0)' : 'none',
                        },
                        '&.Mui-disabled': {
                          background: '#ccc',
                          color: '#888',
                        }
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={26} sx={{ color: 'white' }} />
                      ) : isFormValid ? 'Sign In' : 'Please fill all fields'}
                    </Button>
                  </Slide>
                  
                  {/* Register Link */}
                  <Fade in timeout={1800}>
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontSize: '1.1rem' }}>
                        Don't have an account?{' '}
                        <RouterLink 
                          to="/register" 
                          style={{ 
                            textDecoration: 'none',
                            color: customTheme.accent,
                            fontWeight: 700,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Create Account
                        </RouterLink>
                      </Typography>
                    </Box>
                  </Fade>
                </Paper>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default LoginPage;