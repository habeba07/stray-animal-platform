import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Stack,
  Avatar,
  Fade,
  Zoom,
  Slide,
  Grow,
  IconButton,
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoneyIcon from '@mui/icons-material/Money';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CertificateIcon from '@mui/icons-material/WorkspacePremium';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

// Enhanced theme colors
const theme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

function MyVirtualAdoptions() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchAdoptions();
  }, [user, navigate]);

  const fetchAdoptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/virtual-adoptions/my_adoptions/');
      setAdoptions(response.data);
    } catch (err) {
      setError('Failed to load your virtual adoptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await api.post(`/virtual-adoptions/${selectedAdoption.id}/cancel/`);
      fetchAdoptions();
      setCancelDialogOpen(false);
    } catch (err) {
      setError('Failed to cancel adoption');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setActionLoading(true);
      await api.post(`/virtual-adoptions/${selectedAdoption.id}/pause/`);
      fetchAdoptions();
      setPauseDialogOpen(false);
    } catch (err) {
      setError('Failed to pause adoption');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      await api.post(`/virtual-adoptions/${selectedAdoption.id}/resume/`);
      fetchAdoptions();
      setResumeDialogOpen(false);
    } catch (err) {
      setError('Failed to resume adoption');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return theme.success;
      case 'PAUSED':
        return theme.accent;
      case 'CANCELLED':
        return '#f44336';
      case 'EXPIRED':
        return '#9e9e9e';
      default:
        return theme.primary;
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `radial-gradient(ellipse at top, ${theme.background} 0%, ${theme.grey}40 50%, ${theme.background} 100%)`,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
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
            radial-gradient(circle at 20% 30%, ${theme.accent}08 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${theme.secondary}08 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, ${theme.primary}08 0%, transparent 50%)
          `,
          animation: 'float 20s ease-in-out infinite',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        }
      }}>
        <Fade in>
          <Box sx={{ 
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 6,
            border: `1px solid ${theme.secondary}30`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          }}>
            <Box sx={{ position: 'relative', mb: 3 }}>
              <CircularProgress 
                size={80} 
                thickness={4}
                sx={{ 
                  color: theme.primary,
                  position: 'relative',
                  zIndex: 1
                }} 
              />
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
                  '50%': { transform: 'translate(-50%, -50%) scale(1.1)' },
                }
              }}>
                <FavoriteIcon sx={{ fontSize: 32, color: theme.accent }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ 
              color: theme.primary, 
              fontWeight: 'bold',
              mb: 2,
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Loading Your Adoptions
            </Typography>
            <Typography variant="h6" sx={{ 
              color: theme.primary, 
              opacity: 0.8,
              fontWeight: 300
            }}>
              Preparing your impact dashboard...
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `radial-gradient(ellipse at top, ${theme.background} 0%, ${theme.grey}40 50%, ${theme.background} 100%)`,
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
          radial-gradient(circle at 20% 30%, ${theme.accent}08 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, ${theme.secondary}08 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, ${theme.primary}08 0%, transparent 50%)
        `,
        animation: 'float 30s ease-in-out infinite',
        zIndex: 0,
      },
      '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '33%': { transform: 'translateY(-10px) rotate(120deg)' },
        '66%': { transform: 'translateY(10px) rotate(240deg)' },
      }
    }}>
      {/* Enhanced Hero Section */}
      <Box sx={{
        background: `
          linear-gradient(135deg, 
            ${theme.primary}20 0%, 
            ${theme.secondary}15 30%, 
            ${theme.accent}10 60%, 
            ${theme.background} 100%
          )
        `,
        backdropFilter: 'blur(20px)',
        py: 8,
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 10% 20%, ${theme.accent}15 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, ${theme.secondary}15 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, ${theme.primary}10 0%, transparent 60%)
          `,
          zIndex: 0,
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: 4 
            }}>
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ position: 'relative', mr: 3 }}>
                    <Avatar sx={{ 
                      width: 80, 
                      height: 80,
                      background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                      boxShadow: '0 15px 35px rgba(255, 138, 101, 0.4)',
                      border: `3px solid rgba(255,255,255,0.3)`,
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      <FavoriteIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      width: 30,
                      height: 30,
                      background: `linear-gradient(135deg, ${theme.success}, ${theme.secondary})`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'bounce 2s ease-in-out infinite',
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-5px)' },
                      }
                    }}>
                      <AutoAwesomeIcon sx={{ fontSize: 16, color: 'white' }} />
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography 
                      variant="h2" 
                      component="h1" 
                      sx={{ 
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold',
                        textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        lineHeight: 1.2,
                      }}
                    >
                      My Virtual Adoptions
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <StarIcon sx={{ color: theme.accent, mr: 1, fontSize: 20 }} />
                      <Typography variant="h6" sx={{ 
                        color: theme.primary,
                        fontWeight: 500,
                        opacity: 0.9
                      }}>
                        Making a Difference Together
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: theme.primary,
                    opacity: 0.8,
                    maxWidth: 600,
                    lineHeight: 1.6,
                    fontWeight: 300,
                    mb: 2
                  }}
                >
                  Track your ongoing support and see the incredible difference you're making in the lives of animals waiting for their forever homes.
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <TrendingUpIcon sx={{ color: theme.success, fontSize: 24 }} />
                  <Typography variant="body1" sx={{ 
                    color: theme.primary,
                    fontWeight: 500,
                    opacity: 0.9
                  }}>
                    Your compassion creates lasting impact
                  </Typography>
                </Box>
              </Box>
              
              <Grow in timeout={1200}>
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/animals')}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    borderRadius: 4,
                    px: 6,
                    py: 2.5,
                    minWidth: 250,
                    boxShadow: '0 8px 25px rgba(255, 138, 101, 0.4)',
                    border: `2px solid rgba(255,255,255,0.2)`,
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transition: 'left 0.6s ease',
                    },
                    '&:hover': {
                      background: `linear-gradient(135deg, #ff7043, ${theme.accent})`,
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: '0 12px 35px rgba(255, 138, 101, 0.5)',
                      '&::before': {
                        left: '100%',
                      }
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Adopt Another Animal
                </Button>
              </Grow>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6, mt: -4, position: 'relative', zIndex: 2 }}>
        {error && (
          <Slide direction="down" in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 4,
                background: 'rgba(244, 67, 54, 0.1)',
                backdropFilter: 'blur(10px)',
                border: `1px solid rgba(244, 67, 54, 0.3)`,
                boxShadow: '0 8px 32px rgba(244, 67, 54, 0.2)',
                '& .MuiAlert-message': {
                  fontSize: '1.1rem',
                  fontWeight: 500
                }
              }}
            >
              {error}
            </Alert>
          </Slide>
        )}

        {adoptions.length === 0 ? (
          <Zoom in timeout={800}>
            <Paper sx={{ 
              p: 8, 
              textAlign: 'center',
              background: `
                linear-gradient(135deg, 
                  rgba(255,255,255,0.9) 0%, 
                  ${theme.grey}40 50%, 
                  rgba(255,255,255,0.9) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              borderRadius: 6,
              border: `2px solid ${theme.secondary}30`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
              }
            }}>
              <Box sx={{ position: 'relative', mb: 4 }}>
                <PetsIcon sx={{ 
                  fontSize: 120, 
                  color: theme.primary, 
                  opacity: 0.3, 
                  mb: 3,
                  animation: 'gentle-bounce 3s ease-in-out infinite',
                  '@keyframes gentle-bounce': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                  }
                }} />
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${theme.accent}10 0%, transparent 70%)`,
                  zIndex: -1,
                }} />
              </Box>

              <Typography variant="h3" sx={{ 
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold', 
                mb: 3,
                lineHeight: 1.2
              }}>
                Start Your Journey of Compassion
              </Typography>

              <Typography variant="h5" sx={{ 
                color: theme.primary, 
                mb: 5,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 300,
                opacity: 0.9
              }}>
                Virtual adoption helps provide food, shelter, and care for animals in need while they wait for their forever homes. Your support creates real, lasting impact.
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 3, 
                flexWrap: 'wrap',
                mb: 4 
              }}>
                {[
                  { icon: FavoriteIcon, text: "Provide Daily Care", color: theme.accent },
                  { icon: MoneyIcon, text: "Support Essential Needs", color: theme.success },
                  { icon: PetsIcon, text: "Save Lives", color: theme.primary },
                ].map((item, index) => (
                  <Fade in timeout={1000 + index * 200} key={index}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 2,
                      borderRadius: 3,
                      background: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                    }}>
                      <item.icon sx={{ color: item.color, fontSize: 24 }} />
                      <Typography sx={{ color: theme.primary, fontWeight: 500 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  </Fade>
                ))}
              </Box>

              <Button 
                variant="contained" 
                size="large"
                startIcon={<PetsIcon />}
                onClick={() => navigate('/animals')}
                sx={{
                  background: `linear-gradient(135deg, ${theme.secondary}, ${theme.success})`,
                  fontWeight: 'bold',
                  fontSize: '1.3rem',
                  borderRadius: 4,
                  px: 8,
                  py: 3,
                  boxShadow: '0 8px 25px rgba(129, 199, 132, 0.4)',
                  border: `2px solid rgba(255,255,255,0.2)`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transition: 'left 0.6s ease',
                  },
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.success}, ${theme.secondary})`,
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 12px 40px rgba(129, 199, 132, 0.5)',
                    '&::before': {
                      left: '100%',
                    }
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Browse Animals to Adopt
              </Button>
            </Paper>
          </Zoom>
        ) : (
          <>
            {/* Enhanced Stats Cards */}
            <Fade in timeout={600}>
              <Grid container spacing={4} sx={{ mb: 6 }}>
                {[
                  { 
                    value: adoptions.length, 
                    label: 'Total Adoptions', 
                    color: theme.secondary, 
                    icon: PetsIcon,
                    gradient: `linear-gradient(135deg, ${theme.secondary}20, rgba(255,255,255,0.9))`
                  },
                  { 
                    value: adoptions.filter(a => a.status === 'ACTIVE').length, 
                    label: 'Active', 
                    color: theme.success, 
                    icon: FavoriteIcon,
                    gradient: `linear-gradient(135deg, ${theme.success}20, rgba(255,255,255,0.9))`
                  },
                  { 
                    value: formatCurrency(adoptions.reduce((sum, a) => sum + parseFloat(a.amount), 0)), 
                    label: 'Total Support', 
                    color: theme.accent, 
                    icon: TrendingUpIcon,
                    gradient: `linear-gradient(135deg, ${theme.accent}20, rgba(255,255,255,0.9))`
                  },
                  { 
                    value: adoptions.filter(a => a.is_gift).length, 
                    label: 'Gifts Given', 
                    color: theme.primary, 
                    icon: StarIcon,
                    gradient: `linear-gradient(135deg, ${theme.primary}20, rgba(255,255,255,0.9))`
                  }
                ].map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Grow in timeout={800 + index * 200}>
                      <Paper sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        background: stat.gradient,
                        backdropFilter: 'blur(20px)',
                        border: `2px solid ${stat.color}30`,
                        borderRadius: 4,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)`,
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        }
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mb: 2 
                        }}>
                          <Avatar sx={{
                            width: 60,
                            height: 60,
                            background: `linear-gradient(135deg, ${stat.color}, ${stat.color}80)`,
                            boxShadow: `0 8px 25px ${stat.color}40`,
                          }}>
                            <stat.icon sx={{ fontSize: 28 }} />
                          </Avatar>
                        </Box>
                        <Typography variant="h3" sx={{ 
                          color: stat.color, 
                          fontWeight: 'bold',
                          mb: 1,
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: theme.primary, 
                          fontWeight: 500,
                          opacity: 0.8
                        }}>
                          {stat.label}
                        </Typography>
                      </Paper>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Fade>

            {/* Enhanced Adoptions Grid */}
            <Grid container spacing={4}>
              {adoptions.map((adoption, index) => (
                <Grid item xs={12} md={6} lg={4} key={adoption.id}>
                  <Zoom in timeout={400 + index * 150}>
                    <Card sx={{
                      height: '100%',
                      background: `
                        linear-gradient(135deg, 
                          rgba(255,255,255,0.95) 0%, 
                          ${theme.background}90 50%, 
                          rgba(255,255,255,0.95) 100%
                        )
                      `,
                      backdropFilter: 'blur(20px)',
                      borderRadius: 6,
                      border: `2px solid ${theme.secondary}30`,
                      boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${getStatusColor(adoption.status)}, ${theme.accent})`,
                        zIndex: 1,
                      },
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                        '& .animal-image': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}>
                      {/* Enhanced Image Section */}
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        {adoption.animal_details.photos && adoption.animal_details.photos.length > 0 ? (
                          <CardMedia
                            component="img"
                            height="220"
                            image={adoption.animal_details.photos[0]}
                            alt={adoption.animal_details.name}
                            className="animal-image"
                            sx={{ 
                              objectFit: 'cover',
                              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 220,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: `linear-gradient(135deg, ${theme.grey}, ${theme.background})`,
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `radial-gradient(circle, ${theme.primary}10 0%, transparent 70%)`,
                              }
                            }}
                          >
                            <PetsIcon sx={{ fontSize: 80, color: theme.primary, opacity: 0.5, zIndex: 1 }} />
                          </Box>
                        )}

                        {/* Enhanced Status and Gift Badges */}
                        <Chip
                          label={adoption.status}
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            background: `linear-gradient(135deg, ${getStatusColor(adoption.status)}, ${getStatusColor(adoption.status)}CC)`,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid rgba(255,255,255,0.2)`,
                          }}
                        />

                        {adoption.is_gift && (
                          <Chip
                            label="GIFT"
                            sx={{
                              position: 'absolute',
                              top: 16,
                              left: 16,
                              background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.85rem',
                              boxShadow: '0 6px 20px rgba(255, 138, 101, 0.4)',
                              backdropFilter: 'blur(10px)',
                              border: `1px solid rgba(255,255,255,0.2)`,
                            }}
                          />
                        )}

                        {/* Overlay gradient */}
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 60,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                          pointerEvents: 'none',
                        }} />
                      </Box>
                      
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h4" component="div" sx={{ 
                            fontWeight: 'bold', 
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            flex: 1,
                          }}>
                            {adoption.animal_details.name || 'Unnamed'}
                          </Typography>
                          <IconButton sx={{
                            background: `${theme.secondary}20`,
                            color: theme.secondary,
                            '&:hover': { background: `${theme.secondary}30` }
                          }}>
                            <StarIcon />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body1" sx={{ 
                          color: theme.primary, 
                          opacity: 0.8, 
                          mb: 3,
                          fontWeight: 500
                        }}>
                          {adoption.animal_details.breed || adoption.animal_details.animal_type} • {adoption.animal_details.gender}
                        </Typography>
                        
                        <Divider sx={{ 
                          my: 3, 
                          background: `linear-gradient(90deg, ${theme.secondary}, transparent, ${theme.secondary})`,
                          height: 2,
                          borderRadius: 1
                        }} />
                        
                        <Stack spacing={3}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 2,
                            borderRadius: 3,
                            background: `${theme.accent}15`,
                            border: `1px solid ${theme.accent}30`,
                          }}>
                            <Avatar sx={{ 
                              width: 40, 
                              height: 40, 
                              background: `linear-gradient(135deg, ${theme.accent}, #ff7043)` 
                            }}>
                              <MoneyIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                                {formatCurrency(adoption.amount)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                                {adoption.period.toLowerCase()}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CalendarMonthIcon sx={{ fontSize: 24, color: theme.secondary }} />
                            <Box>
                              <Typography variant="body1" sx={{ color: theme.primary, fontWeight: 600 }}>
                                Since: {formatDate(adoption.start_date)}
                              </Typography>
                              {adoption.status === 'ACTIVE' && adoption.next_payment_date && (
                                <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                                  Next payment: {formatDate(adoption.next_payment_date)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          {adoption.is_gift && (
                            <Box sx={{ 
                              p: 3, 
                              background: `
                                linear-gradient(135deg, 
                                  ${theme.accent}20 0%, 
                                  rgba(255,255,255,0.8) 50%, 
                                  ${theme.accent}20 100%
                                )
                              `,
                              borderRadius: 4,
                              border: `2px solid ${theme.accent}30`,
                              backdropFilter: 'blur(10px)',
                            }}>
                              <Typography variant="h6" sx={{ 
                                color: theme.primary, 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                Gift for: {adoption.gift_recipient_name}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                        
                        <Divider sx={{ 
                          my: 4, 
                          background: `linear-gradient(90deg, ${theme.secondary}, transparent, ${theme.secondary})`,
                          height: 2,
                          borderRadius: 1
                        }} />
                        
                        <Stack spacing={2}>
                          {/* Action Buttons Row */}
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                              variant="outlined" 
                              size="medium"
                              startIcon={<VisibilityIcon />}
                              onClick={() => navigate(`/animals/${adoption.animal_details.id}`)}
                              sx={{ 
                                flex: 1,
                                borderColor: theme.primary,
                                color: theme.primary,
                                borderRadius: 3,
                                fontWeight: 600,
                                borderWidth: 2,
                                '&:hover': { 
                                  borderColor: theme.primary,
                                  background: `${theme.grey}50`,
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              View
                            </Button>
                            
                            {adoption.status === 'ACTIVE' && (
                              <Button 
                                variant="outlined" 
                                size="medium"
                                startIcon={<PauseIcon />}
                                onClick={() => {
                                  setSelectedAdoption(adoption);
                                  setPauseDialogOpen(true);
                                }}
                                sx={{ 
                                  flex: 1,
                                  borderColor: theme.accent,
                                  color: theme.accent,
                                  borderRadius: 3,
                                  fontWeight: 600,
                                  borderWidth: 2,
                                  '&:hover': { 
                                    borderColor: theme.accent,
                                    background: `${theme.accent}15`,
                                    transform: 'translateY(-2px)',
                                  }
                                }}
                              >
                                Pause
                              </Button>
                            )}
                            
                            {adoption.status === 'PAUSED' && (
                              <Button 
                                variant="outlined" 
                                size="medium"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => {
                                  setSelectedAdoption(adoption);
                                  setResumeDialogOpen(true);
                                }}
                                sx={{ 
                                  flex: 1,
                                  borderColor: theme.success,
                                  color: theme.success,
                                  borderRadius: 3,
                                  fontWeight: 600,
                                  borderWidth: 2,
                                  '&:hover': { 
                                    borderColor: theme.success,
                                    background: `${theme.success}15`,
                                    transform: 'translateY(-2px)',
                                  }
                                }}
                              >
                                Resume
                              </Button>
                            )}
                          </Box>

                          {/* Certificate Button */}
                          <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={<CertificateIcon />}
                            onClick={() => navigate(`/virtual-adoptions/certificate/${adoption.id}`)}
                            sx={{
                              background: `linear-gradient(135deg, ${theme.secondary}, ${theme.success})`,
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              borderRadius: 3,
                              py: 1.5,
                              boxShadow: '0 8px 25px rgba(129, 199, 132, 0.4)',
                              border: `1px solid rgba(255,255,255,0.2)`,
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                transition: 'left 0.6s ease',
                              },
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.success}, ${theme.secondary})`,
                                transform: 'translateY(-3px)',
                                boxShadow: '0 12px 35px rgba(129, 199, 132, 0.5)',
                                '&::before': {
                                  left: '100%',
                                }
                              },
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            View Certificate
                          </Button>

                          {/* Cancel Button */}
                          {['ACTIVE', 'PAUSED'].includes(adoption.status) && (
                            <Button 
                              variant="outlined" 
                              size="medium"
                              startIcon={<CancelIcon />}
                              onClick={() => {
                                setSelectedAdoption(adoption);
                                setCancelDialogOpen(true);
                              }}
                              sx={{ 
                                borderColor: '#f44336',
                                color: '#f44336',
                                borderRadius: 3,
                                fontWeight: 600,
                                borderWidth: 2,
                                '&:hover': { 
                                  borderColor: '#f44336',
                                  background: '#ffebee',
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              Cancel Adoption
                            </Button>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        
        {/* Enhanced Dialogs */}
        {/* Cancel Dialog */}
        <Dialog 
          open={cancelDialogOpen} 
          onClose={() => setCancelDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${theme.background}80)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.secondary}30`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }
          }}
        >
          <DialogTitle sx={{ 
            color: theme.primary, 
            fontWeight: 'bold',
            fontSize: '1.5rem',
            borderBottom: `2px solid ${theme.secondary}30`,
            pb: 2
          }}>
            Cancel Virtual Adoption
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <DialogContentText sx={{ 
              color: theme.primary,
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}>
              Are you sure you want to cancel your virtual adoption of {selectedAdoption?.animal_details.name || 'this animal'}? This will stop all future payments and end your sponsorship.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setCancelDialogOpen(false)}
              variant="outlined"
              sx={{ 
                color: theme.primary,
                borderColor: theme.primary,
                fontWeight: 600,
                borderRadius: 3
              }}
            >
              No, Keep Supporting
            </Button>
            <Button 
              onClick={handleCancel} 
              disabled={actionLoading}
              variant="contained"
              sx={{ 
                background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                fontWeight: 'bold',
                borderRadius: 3,
                '&:hover': { 
                  background: 'linear-gradient(135deg, #d32f2f, #c62828)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Yes, Cancel Adoption'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Pause Dialog */}
        <Dialog 
          open={pauseDialogOpen} 
          onClose={() => setPauseDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${theme.background}80)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.secondary}30`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }
          }}
        >
          <DialogTitle sx={{ 
            color: theme.primary, 
            fontWeight: 'bold',
            fontSize: '1.5rem',
            borderBottom: `2px solid ${theme.secondary}30`,
            pb: 2
          }}>
            Pause Virtual Adoption
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <DialogContentText sx={{ 
              color: theme.primary,
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}>
              Would you like to temporarily pause your support for {selectedAdoption?.animal_details.name || 'this animal'}? You can resume at any time.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setPauseDialogOpen(false)}
              variant="outlined"
              sx={{ 
                color: theme.primary,
                borderColor: theme.primary,
                fontWeight: 600,
                borderRadius: 3
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePause} 
              disabled={actionLoading}
              variant="contained"
              sx={{ 
                background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                fontWeight: 'bold',
                borderRadius: 3,
                '&:hover': { 
                  background: `linear-gradient(135deg, #ff7043, #ff5722)`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Pause Adoption'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Resume Dialog */}
        <Dialog 
          open={resumeDialogOpen} 
          onClose={() => setResumeDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${theme.background}80)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.secondary}30`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }
          }}
        >
          <DialogTitle sx={{ 
            color: theme.primary, 
            fontWeight: 'bold',
            fontSize: '1.5rem',
            borderBottom: `2px solid ${theme.secondary}30`,
            pb: 2
          }}>
            Resume Virtual Adoption
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <DialogContentText sx={{ 
              color: theme.primary,
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}>
              Ready to resume your support for {selectedAdoption?.animal_details.name || 'this animal'}? We'll process your next payment on the next scheduled date.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setResumeDialogOpen(false)}
              variant="outlined"
              sx={{ 
                color: theme.primary,
                borderColor: theme.primary,
                fontWeight: 600,
                borderRadius: 3
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResume} 
              disabled={actionLoading}
              variant="contained"
              sx={{ 
                background: `linear-gradient(135deg, ${theme.success}, ${theme.secondary})`,
                fontWeight: 'bold',
                borderRadius: 3,
                '&:hover': { 
                  background: `linear-gradient(135deg, #388e3c, ${theme.success})`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Resume Adoption'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default MyVirtualAdoptions;