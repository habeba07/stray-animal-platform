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
  CardContent
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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Check if already authenticated on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('LoginPage useEffect - checking stored user:', !!storedUser);
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

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log('Attempting login with:', { username, password: '***' });
    
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
      display: 'flex',
      alignItems: 'center',
      py: 6,
      px: 2
    }}>
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          animation: `${float} 10s ease-in-out infinite`,
          animationDelay: '0s',
          opacity: 0.6
        }}
      >
        <PetsIcon sx={{ fontSize: 40, color: customTheme.accent, filter: 'blur(1px)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.4
        }}
      >
        <FavoriteIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '8%',
          animation: `${float} 14s ease-in-out infinite`,
          animationDelay: '4s',
          opacity: 0.5
        }}
      >
        <StarIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '5%',
          animation: `${float} 16s ease-in-out infinite`,
          animationDelay: '6s',
          opacity: 0.3
        }}
      >
        <LoginIcon sx={{ fontSize: 45, color: customTheme.accent, transform: 'rotate(30deg)' }} />
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
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
                <StarIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
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
                  <LoginIcon sx={{ fontSize: 50 }} />
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
                Welcome Back
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`,
                  maxWidth: 500,
                  mx: 'auto'
                }}
              >
                Sign in to continue your animal rescue journey
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
            
            {/* Main Login Card */}
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
                <Box component="form" onSubmit={handleLogin} noValidate>
                  
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
                      <PersonIcon sx={{ fontSize: '1.2em' }} />
                      Sign In
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
                    <Slide direction="right" in timeout={1200}>
                      <TextField
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{
                          ...fieldStyles,
                          mb: 3
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
                    </Slide>
                    
                    <Slide direction="left" in timeout={1400}>
                      <TextField
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    </Slide>
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
                    <Slide direction="up" in timeout={1600}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <LoginIcon />}
                        sx={{ 
                          py: 3,
                          borderRadius: 4,
                          fontSize: '1.3rem',
                          fontWeight: 800,
                          background: isLoading ? 
                            `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.primary, 0.2)} 90%)` :
                            `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                          boxShadow: !isLoading ? 
                            `0 8px 30px ${alpha(customTheme.primary, 0.4)}` : 
                            'none',
                          color: '#ffffff',
                          textTransform: 'none',
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
                          '&:hover:not(:disabled)': {
                            background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`,
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 40px ${alpha(customTheme.primary, 0.5)}`,
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
                        {isLoading ? 'Signing In...' : 'Sign In'}
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
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default LoginPage;