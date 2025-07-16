import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Badge,
  Zoom,
  Fade,
  Slide,
  alpha,
} from '@mui/material';
import {
  LocalOffer as LocalOfferIcon,
  Redeem as RedeemIcon,
  Star as StarIcon,
  CardGiftcard as GiftIcon,
  EmojiEvents as TrophyIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  Diamond as DiamondIcon,
  AutoAwesome as SparkleIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../../redux/api';

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

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -30px, 0); }
  70% { transform: translate3d(0, -15px, 0); }
  90% { transform: translate3d(0, -4px, 0); }
`;

function RewardCatalog() {
  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchRewardsAndPoints();
  }, []);

  const fetchRewardsAndPoints = async () => {
    try {
      setLoading(true);
      const [rewardsRes, pointsRes] = await Promise.all([
        api.get('/rewards/'),
        api.get('/activities/my_points/')
      ]);
      setRewards(rewardsRes.data);
      setUserPoints(pointsRes.data.total_points);
    } catch (err) {
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    try {
      setRedeeming(true);
      await api.post(`/rewards/${selectedReward.id}/redeem/`);
      setConfirmOpen(false);
      setError('');
      // Refresh data
      fetchRewardsAndPoints();
      alert('Reward redeemed successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to redeem reward');
    } finally {
      setRedeeming(false);
    }
  };

  const getRewardTypeIcon = (type) => {
    const icons = {
      'DISCOUNT': <LocalOfferIcon />,
      'MERCHANDISE': <GiftIcon />,
      'EXPERIENCE': <TrophyIcon />,
      'DIGITAL': <StarIcon />,
      'PHYSICAL': <DiamondIcon />
    };
    return icons[type] || <GiftIcon />;
  };

  const getRewardTypeColor = (type) => {
    const colors = {
      'DISCOUNT': customTheme.accent,
      'MERCHANDISE': customTheme.primary,
      'EXPERIENCE': customTheme.secondary,
      'DIGITAL': '#9c27b0',
      'PHYSICAL': '#795548'
    };
    return colors[type] || customTheme.grey;
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
          <GiftIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <TrophyIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
              <DiamondIcon sx={{ color: customTheme.accent, fontSize: 30 }} />
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
            Loading Amazing Rewards
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Discovering treasures for you...
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
        <GiftIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <TrophyIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
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
        <DiamondIcon sx={{ fontSize: 25, color: customTheme.accent, transform: 'rotate(45deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Hero Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 6,
            position: 'relative',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: { xs: 3, md: 0 }
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
            
            <Box sx={{ flex: 1 }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap'
                }}
              >
                <TrophyIcon sx={{ fontSize: '1.2em', color: customTheme.primary }} />
                Reward Catalog
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  maxWidth: 600,
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                Redeem your compassion points for amazing rewards
              </Typography>
            </Box>

            {/* Enhanced Points Display */}
            <Slide direction="left" in timeout={1200}>
              <Paper
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${customTheme.primary} 0%, ${alpha(customTheme.primary, 0.8)} 50%, ${customTheme.accent} 100%)`,
                  color: 'white',
                  borderRadius: 6,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.3)}`,
                  border: `3px solid ${alpha('#ffffff', 0.2)}`,
                  minWidth: { xs: '100%', md: 280 },
                  '&::before': {
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
                <Box sx={{ p: 4, position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        animation: `${bounce} 2s infinite`,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <LocalOfferIcon sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {userPoints.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    Your Points
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: `1px solid ${alpha('#ffffff', 0.2)}`,
                      fontSize: '0.9rem',
                      opacity: 0.8
                    }}
                  >
                    Keep earning to unlock more rewards!
                  </Box>
                </Box>
              </Paper>
            </Slide>
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
                backgroundColor: alpha('#f44336', 0.1),
                border: `2px solid ${alpha('#f44336', 0.3)}`,
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

        {/* Rewards Grid */}
        {rewards.length === 0 ? (
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
                  <GiftIcon 
                    sx={{ 
                      fontSize: 120, 
                      color: alpha(customTheme.primary, 0.3), 
                      mb: 3,
                      animation: `${float} 4s ease-in-out infinite`
                    }} 
                  />
                  <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                    No rewards available yet
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto', mb: 4 }}>
                    New rewards are being added regularly. Check back soon for amazing items to redeem!
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
                    Earn More Points
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        ) : (
          <Grid container spacing={4}>
            {rewards.map((reward, index) => (
              <Grid item xs={12} sm={6} md={4} key={reward.id}>
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
                    {/* Reward Image */}
                    {reward.image_url && (
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={reward.image_url}
                          alt={reward.name}
                          sx={{
                            transition: 'transform 0.4s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                        {/* Shimmer effect overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `
                              linear-gradient(90deg, 
                                transparent, 
                                ${alpha('#ffffff', 0.3)}, 
                                transparent
                              )
                            `,
                            backgroundSize: '200% 100%',
                            animation: `${shimmer} 3s infinite`,
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            '.MuiCard-root:hover &': {
                              opacity: 1
                            }
                          }}
                        />
                        {/* Quantity badge */}
                        {reward.quantity_available <= 5 && reward.quantity_available > 0 && (
                          <Chip 
                            label={`Only ${reward.quantity_available} left!`}
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              backgroundColor: '#ff5722',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              animation: `${pulse} 2s infinite`
                            }}
                          />
                        )}
                      </Box>
                    )}
                    
                    <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 2 }}>
                      {/* Reward Header */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ 
                          fontWeight: 700, 
                          color: customTheme.primary,
                          lineHeight: 1.3
                        }}>
                          {reward.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Chip
                            icon={getRewardTypeIcon(reward.reward_type)}
                            label={reward.reward_type}
                            sx={{
                              backgroundColor: alpha(getRewardTypeColor(reward.reward_type), 0.15),
                              color: getRewardTypeColor(reward.reward_type),
                              fontWeight: 600,
                              border: `1px solid ${alpha(getRewardTypeColor(reward.reward_type), 0.3)}`
                            }}
                          />
                          {!reward.is_active && (
                            <Chip 
                              label="Unavailable"
                              sx={{
                                backgroundColor: alpha('#9e9e9e', 0.15),
                                color: '#9e9e9e',
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Description */}
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        paragraph 
                        sx={{ 
                          color: alpha(customTheme.primary, 0.7),
                          lineHeight: 1.6,
                          fontWeight: 500
                        }}
                      >
                        {reward.description}
                      </Typography>
                      
                      {/* Points Required */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                          border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                          textAlign: 'center'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <DiamondIcon sx={{ color: customTheme.accent, fontSize: 24 }} />
                          <Typography variant="h4" sx={{ 
                            color: customTheme.accent, 
                            fontWeight: 800 
                          }}>
                            {reward.points_required.toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: alpha(customTheme.accent, 0.8),
                          fontWeight: 600,
                          mt: 0.5
                        }}>
                          points required
                        </Typography>
                      </Paper>
                      
                      {/* Quantity Available */}
                      {reward.quantity_available > 0 && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: alpha(customTheme.primary, 0.6),
                            textAlign: 'center',
                            mb: 2,
                            fontWeight: 600
                          }}
                        >
                          {reward.quantity_available} available
                        </Typography>
                      )}
                    </CardContent>
                    
                    {/* Action Button */}
                    <Box sx={{ p: 3, pt: 0, position: 'relative', zIndex: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={userPoints < reward.points_required || !reward.is_active}
                        onClick={() => handleRedeemClick(reward)}
                        startIcon={
                          userPoints >= reward.points_required && reward.is_active ? 
                          <RedeemIcon /> : 
                          userPoints < reward.points_required ? 
                          <LocalOfferIcon /> : null
                        }
                        sx={{
                          background: userPoints >= reward.points_required && reward.is_active ?
                            `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)` :
                            `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.primary, 0.2)} 90%)`,
                          color: userPoints >= reward.points_required && reward.is_active ? '#ffffff' : alpha(customTheme.primary, 0.6),
                          fontWeight: 700,
                          py: 1.5,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          border: userPoints >= reward.points_required && reward.is_active ? 
                            'none' : 
                            `2px solid ${alpha(customTheme.primary, 0.2)}`,
                          transition: 'all 0.3s ease',
                          '&:hover:not(:disabled)': {
                            background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.4)}`
                          },
                          '&:disabled': {
                            cursor: 'not-allowed'
                          }
                        }}
                      >
                        {userPoints < reward.points_required ? 
                          `Need ${(reward.points_required - userPoints).toLocaleString()} more points` : 
                          !reward.is_active ? 
                          'Currently Unavailable' : 
                          'Redeem Now'}
                      </Button>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Enhanced Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: '#ffffff',
              border: `3px solid ${customTheme.primary}`,
              overflow: 'hidden',
              boxShadow: `0 24px 48px ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <TrophyIcon sx={{ fontSize: '1.2em' }} />
            Confirm Redemption
          </DialogTitle>
          
          <DialogContent sx={{ p: 4, backgroundColor: '#ffffff' }}>
            <Box sx={{ textAlign: 'center' }}>
              {/* Reward Preview */}
              {selectedReward && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 700,
                      mb: 1
                    }}>
                      {selectedReward.name}
                    </Typography>
                    <Chip
                      label={selectedReward.reward_type}
                      icon={getRewardTypeIcon(selectedReward.reward_type)}
                      sx={{
                        backgroundColor: alpha(getRewardTypeColor(selectedReward.reward_type), 0.2),
                        color: customTheme.primary,
                        fontWeight: 600,
                        border: `2px solid ${customTheme.primary}`,
                        fontSize: '0.9rem'
                      }}
                    />
                  </Box>

                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      mb: 3,
                      borderRadius: 3,
                      backgroundColor: alpha(customTheme.accent, 0.08),
                      border: `2px solid ${customTheme.accent}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                      <DiamondIcon sx={{ color: customTheme.accent, fontSize: 28 }} />
                      <Typography variant="h3" sx={{ 
                        color: customTheme.accent, 
                        fontWeight: 800 
                      }}>
                        {selectedReward.points_required.toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ 
                      color: customTheme.accent,
                      fontWeight: 600
                    }}>
                      points will be deducted
                    </Typography>
                  </Paper>

                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600,
                    mb: 2
                  }}>
                    Are you sure you want to redeem this reward?
                  </Typography>

                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    mb: 3,
                    fontWeight: 500
                  }}>
                    You'll have {(userPoints - selectedReward.points_required).toLocaleString()} points remaining after this redemption.
                  </Typography>
                </>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2, backgroundColor: '#ffffff', borderTop: `1px solid ${alpha(customTheme.primary, 0.1)}` }}>
            <Button 
              onClick={() => setConfirmOpen(false)}
              disabled={redeeming}
              size="large"
              sx={{
                color: customTheme.primary,
                border: `2px solid ${customTheme.primary}`,
                backgroundColor: '#ffffff',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha(customTheme.primary, 0.08),
                  borderColor: customTheme.primary,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmRedeem}
              disabled={redeeming}
              size="large"
              startIcon={redeeming ? <CircularProgress size={16} /> : <CheckIcon />}
              sx={{
                background: `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                border: 'none',
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.3)}`
                }
              }}
            >
              {redeeming ? 'Redeeming...' : 'Confirm Redemption'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default RewardCatalog;