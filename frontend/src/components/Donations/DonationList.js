import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  AttachMoney as MoneyIcon,
  Pets as PetsIcon,
  AutoAwesome as SparkleIcon,
  CardGiftcard as GiftIcon,
  VolunteerActivism as VolunteerIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../../redux/api';
import { useNavigate } from 'react-router-dom';

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

function DonationList() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/donation-campaigns/active/');
      setCampaigns(response.data);
    } catch (err) {
      setError('Failed to load donation campaigns');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current, target) => {
    if (!current || !target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getCampaignTypeColor = (type) => {
    const colors = {
      'EMERGENCY': '#f44336',
      'MEDICAL': '#2196f3',
      'SHELTER': customTheme.primary,
      'RESCUE': customTheme.accent,
      'GENERAL': customTheme.secondary,
      'VIRTUAL_ADOPTIONS': customTheme.secondary
    };
    return colors[type] || customTheme.primary;
  };

  const getCampaignTypeIcon = (type) => {
    const icons = {
      'EMERGENCY': <VolunteerIcon />,
      'MEDICAL': <FavoriteIcon />,
      'SHELTER': <PetsIcon />,
      'RESCUE': <StarIcon />,
      'GENERAL': <GiftIcon />
    };
    return icons[type] || <GiftIcon />;
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.3)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.3)} 0%, transparent 50%),
            linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
          `,
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Floating Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            animation: `${float} 6s ease-in-out infinite`,
            animationDelay: '0s'
          }}
        >
          <MoneyIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '2s'
          }}
        >
          <FavoriteIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            animation: `${float} 10s ease-in-out infinite`,
            animationDelay: '4s'
          }}
        >
          <StarIcon sx={{ fontSize: 50, color: alpha(customTheme.secondary, 0.12), transform: 'rotate(30deg)' }} />
        </Box>
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Box sx={{ position: 'relative', mb: 3 }}>
            <CircularProgress 
              size={80} 
              thickness={3}
              sx={{ 
                color: customTheme.primary,
                animation: `${pulse} 2s infinite`
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `${sparkle} 2s infinite`
              }}
            >
              <FavoriteIcon sx={{ color: customTheme.accent, fontSize: 30 }} />
            </Box>
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              color: customTheme.primary, 
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Loading Donation Campaigns
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Finding ways you can help...
          </Typography>
        </Box>
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
        <MoneyIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <PetsIcon sx={{ fontSize: 25, color: customTheme.accent, transform: 'rotate(45deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Hero Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
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
                textAlign: 'center'
              }}
            >
              Support Our Cause
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.6,
                animation: `${slideInUp} 1s ease-out 0.3s both`
              }}
            >
              Your generous donations help us rescue, care for, and find loving homes for animals in need
            </Typography>
          </Box>
        </Fade>

        {/* Error Alert */}
        {error && (
          <Fade in timeout={800}>
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
              onClose={() => setError('')}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <Zoom in timeout={1000}>
            <Card sx={{
              borderRadius: 6,
              background: `
                radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
              `,
              border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
              boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`
            }}>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Box sx={{ position: 'relative' }}>
                  <FavoriteIcon 
                    sx={{ 
                      fontSize: 120, 
                      color: alpha(customTheme.primary, 0.3), 
                      mb: 3,
                      animation: `${float} 4s ease-in-out infinite`
                    }} 
                  />
                  <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                    No active campaigns yet
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto', mb: 4 }}>
                    New donation campaigns will appear here when they become available.
                  </Typography>
                  <Button 
                    variant="contained" 
                    href="/volunteer"
                    size="large"
                    sx={{
                      background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                      color: '#ffffff',
                      fontWeight: 700,
                      py: 2,
                      px: 4,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '1.2rem',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`
                      }
                    }}
                  >
                    Volunteer With Us
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        ) : (
          <Grid container spacing={4}>
            {campaigns.map((campaign, index) => (
              <Grid item xs={12} md={6} key={campaign.id}>
                <Fade in timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `
                        linear-gradient(135deg, ${alpha(customTheme.background, 0.8)} 0%, transparent 50%),
                        radial-gradient(circle at top right, ${alpha(customTheme.accent, 0.1)} 0%, transparent 50%)
                      `,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 1
                    },
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: `
                        0 25px 50px ${alpha(customTheme.primary, 0.25)},
                        0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                        inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                      `,
                      border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    {/* Campaign Header */}
                    <Paper
                      elevation={0}
                      sx={{
                        background: `linear-gradient(135deg, ${getCampaignTypeColor(campaign.campaign_type)} 0%, ${alpha(getCampaignTypeColor(campaign.campaign_type), 0.8)} 100%)`,
                        color: '#ffffff',
                        p: 3,
                        position: 'relative',
                        zIndex: 2,
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `
                            radial-gradient(circle at 20% 80%, ${alpha('#ffffff', 0.1)} 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, ${alpha('#ffffff', 0.05)} 0%, transparent 50%)
                          `,
                          pointerEvents: 'none'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getCampaignTypeIcon(campaign.campaign_type)}
                        </Box>
                        <Chip
                          label={campaign.campaign_type}
                          sx={{
                            backgroundColor: alpha('#ffffff', 0.2),
                            color: '#ffffff',
                            fontWeight: 700,
                            border: `1px solid ${alpha('#ffffff', 0.3)}`
                          }}
                        />
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800, 
                        mb: 1,
                        position: 'relative',
                        zIndex: 1
                      }}>
                        {campaign.title}
                      </Typography>
                    </Paper>

                    <CardContent sx={{ flexGrow: 1, p: 4, position: 'relative', zIndex: 2 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: alpha(customTheme.primary, 0.8),
                          lineHeight: 1.6,
                          mb: 4,
                          fontWeight: 500
                        }}
                      >
                        {campaign.description}
                      </Typography>
                      
                      {/* Progress Section */}
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.15)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                          border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                          mb: 3
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, mb: 0.5 }}>
                              Raised
                            </Typography>
                            <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                              ${campaign.current_amount?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, mb: 0.5 }}>
                              Goal
                            </Typography>
                            <Typography variant="h5" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                              ${campaign.target_amount?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ position: 'relative' }}>
                          <LinearProgress
                            variant="determinate"
                            value={calculateProgress(campaign.current_amount, campaign.target_amount)}
                            sx={{ 
                              height: 12, 
                              borderRadius: 6,
                              backgroundColor: alpha(customTheme.primary, 0.2),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 6,
                                background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${customTheme.success} 90%)`,
                                backgroundColor: customTheme.secondary,
                                transition: 'transform 0.4s ease',
                              }
                            }}
                          />
                          {calculateProgress(campaign.current_amount, campaign.target_amount) > 5 && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: '#ffffff',
                                fontWeight: 700,
                                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                fontSize: '0.9rem'
                              }}
                            >
                              {calculateProgress(campaign.current_amount, campaign.target_amount).toFixed(0)}%
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </CardContent>
                    
                    <CardActions sx={{ p: 4, pt: 0, position: 'relative', zIndex: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => navigate(`/donate/${campaign.id}`)}
                        startIcon={<FavoriteIcon />}
                        sx={{
                          background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                          color: '#ffffff',
                          fontWeight: 700,
                          py: 2,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontSize: '1.2rem',
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
                            background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.4)}`,
                            '&::before': {
                              left: '100%'
                            }
                          }
                        }}
                      >
                        Donate Now
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default DonationList;