import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Box,
  Chip,
  LinearProgress,
  Divider,
  Pagination,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSelector } from 'react-redux';
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

function AdoptionMatchesPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [hasProfile, setHasProfile] = useState(true);
  const [mlPredictions, setMlPredictions] = useState({});
  const [animationDelay, setAnimationDelay] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [matchesPerPage] = useState(6);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMatches();
  }, [user, navigate]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/adoption-matches/my_matches/');
      setMatches(response.data);
      
      await fetchMLPredictions(response.data);
      
      setError('');
    } catch (err) {
      if (err.response?.status === 400) {
        setHasProfile(false);
        setError('Please create an adopter profile first.');
      } else {
        setError('Failed to load matches. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMLPredictions = async (matchedAnimals) => {
    try {
      const response = await api.get('/dashboard/analytics/ml_adoption_predictions/?limit=100');
      const predictions = {};
      
      matchedAnimals.forEach(match => {
        const animalPrediction = response.data.animals?.find(
          animal => animal.id === match.animal_details.id
        );
        
        if (animalPrediction) {
          predictions[match.animal_details.id] = {
            likelihood: animalPrediction.adoption_likelihood,
            percentage: animalPrediction.likelihood_percentage,
            factors: animalPrediction.top_factors || [],
            confidence: animalPrediction.confidence
          };
        }
      });
      
      setMlPredictions(predictions);
    } catch (error) {
      console.warn('ML predictions not available:', error);
    }
  };

  const handleApplyForAdoption = (animalId) => {
    navigate(`/adoption/apply/${animalId}`);
  };

  // Modified to include source parameter for navigation
  const handleViewDetails = (animalId) => {
    navigate(`/animals/${animalId}?from=matches`);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return customTheme.success;
    if (score >= 60) return customTheme.accent;
    return '#ef5350';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Possible Match';
    return 'Challenging Match';
  };

  const getLikelihoodColor = (likelihood) => {
    if (likelihood > 0.7) return customTheme.success;
    if (likelihood > 0.4) return customTheme.accent;
    return '#ef5350';
  };

  // Pagination logic
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch);
  const totalPages = Math.ceil(matches.length / matchesPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <PetsIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
              <StarIcon sx={{ color: customTheme.accent, fontSize: 30 }} />
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
            Finding Your Perfect Matches
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Analyzing compatibility scores...
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
        <StarIcon sx={{ fontSize: 30, color: customTheme.accent, filter: 'blur(1px)' }} />
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
        <PetsIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Hero Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
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
              <StarIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
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
                letterSpacing: '-0.02em'
              }}
            >
              Your Perfect Matches
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.6,
                mb: 3,
                animation: `${slideInUp} 1s ease-out 0.3s both`
              }}
            >
              Discover your ideal companion with advanced compatibility scoring and personalized matching
            </Typography>
            
            {/* Stats Card */}
            <Slide direction="up" in timeout={1200}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.accent, 0.1)} 100%)`,
                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    minWidth: 160
                  }}
                >
                  <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800, mb: 1 }}>
                    {matches.length}
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                    Perfect Matches Found
                  </Typography>
                </Paper>
              </Box>
            </Slide>
          </Box>
        </Fade>

        {/* Error Alert */}
        {error && (
          <Fade in timeout={800}>
            <Alert 
              severity={hasProfile ? "error" : "warning"} 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                  color: hasProfile ? '#f44336' : customTheme.accent
                },
                backgroundColor: hasProfile ? alpha('#f44336', 0.1) : alpha(customTheme.accent, 0.1),
                border: `2px solid ${hasProfile ? alpha('#f44336', 0.3) : alpha(customTheme.accent, 0.3)}`
              }}
              action={
                !hasProfile && (
                  <Button 
                    variant="contained"
                    size="large" 
                    onClick={() => navigate('/adoption/profile')}
                    sx={{
                      backgroundColor: customTheme.accent,
                      '&:hover': { 
                        backgroundColor: alpha(customTheme.accent, 0.8),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.3)}`
                      },
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3
                    }}
                  >
                    Create Profile
                  </Button>
                )
              }
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* No Matches State */}
        {matches.length === 0 && !error && (
          <Zoom in timeout={1000}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 8, 
                textAlign: 'center',
                borderRadius: 6,
                background: `
                  radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                  linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                position: 'relative'
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <PetsIcon 
                  sx={{ 
                    fontSize: 120, 
                    color: alpha(customTheme.primary, 0.3), 
                    mb: 3,
                    animation: `${float} 4s ease-in-out infinite`
                  }} 
                />
                <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                  No matches found yet
                </Typography>
                <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto' }}>
                  Please check back later or update your profile preferences to find your perfect companion
                </Typography>
              </Box>
            </Paper>
          </Zoom>
        )}

        {/* Matches Grid */}
        {currentMatches.length > 0 && (
          <Box>
            <Grid container spacing={4}>
              {currentMatches.map((match, index) => {
                const mlPrediction = mlPredictions[match.animal_details.id];
                
                return (
                  <Grid item xs={12} md={6} key={match.id}>
                    <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                      <Card 
                        sx={{ 
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
                          '&:hover': {
                            transform: 'translateY(-12px) scale(1.02)',
                            boxShadow: `
                              0 25px 50px ${alpha(customTheme.primary, 0.2)},
                              0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                              inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                            `,
                            border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                            '& .match-score-chip': {
                              transform: 'scale(1.1)',
                              boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`
                            },
                            '& .action-buttons': {
                              transform: 'translateY(-5px)'
                            }
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                          {match.animal_details.photos && match.animal_details.photos.length > 0 ? (
                            <CardMedia
                              component="img"
                              height="340"
                              image={match.animal_details.photos[0]}
                              alt={match.animal_details.name}
                              sx={{
                                objectFit: 'cover',
                                transition: 'transform 0.6s ease',
                                filter: 'brightness(1.05) contrast(1.1)',
                                '&:hover': { transform: 'scale(1.08)' }
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 340,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `
                                  radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.6)} 100%)
                                `,
                              }}
                            >
                              <PetsIcon sx={{ fontSize: 100, color: alpha(customTheme.primary, 0.4) }} />
                            </Box>
                          )}
                          
                          {/* Enhanced overlay gradient */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '100%',
                              background: `linear-gradient(180deg, ${alpha('#000000', 0.1)} 0%, transparent 30%, transparent 70%, ${alpha('#000000', 0.2)} 100%)`,
                              pointerEvents: 'none'
                            }}
                          />
                          
                          {/* Compatibility Score Chip */}
                          <Chip
                            icon={<FavoriteIcon />}
                            label={`${Math.round(match.overall_score)}% Match`}
                            className="match-score-chip"
                            sx={{
                              position: 'absolute',
                              top: 20,
                              right: 20,
                              backgroundColor: getScoreColor(match.overall_score),
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '1rem',
                              height: 40,
                              px: 1,
                              '& .MuiChip-icon': { color: '#ffffff', fontSize: '1.2rem' },
                              boxShadow: `0 8px 25px ${alpha('#000000', 0.3)}`,
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </Box>
                        
                        <CardContent sx={{ flexGrow: 1, p: 4 }}>
                          <Box sx={{ mb: 3 }}>
                            <Typography 
                              variant="h4" 
                              component="div" 
                              sx={{ 
                                fontWeight: 800,
                                color: customTheme.primary,
                                mb: 1,
                                letterSpacing: '-0.01em'
                              }}
                            >
                              {match.animal_details.name || 'Unnamed'}
                            </Typography>
                            
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: alpha(customTheme.primary, 0.7),
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <PetsIcon sx={{ fontSize: 20 }} />
                              {match.animal_details.animal_type} • {match.animal_details.breed || 'Unknown breed'} • {match.animal_details.gender}
                            </Typography>
                          </Box>

                          {/* Enhanced Compatibility Score Section */}
                          <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: customTheme.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FavoriteIcon sx={{ color: customTheme.accent }} />
                                Compatibility Score
                              </Typography>
                              <Chip
                                label={getScoreLabel(match.overall_score)}
                                sx={{
                                  backgroundColor: alpha(getScoreColor(match.overall_score), 0.1),
                                  color: getScoreColor(match.overall_score),
                                  fontWeight: 600,
                                  border: `1px solid ${alpha(getScoreColor(match.overall_score), 0.3)}`
                                }}
                              />
                            </Box>
                            <Box sx={{ position: 'relative' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={match.overall_score} 
                                sx={{ 
                                  height: 16, 
                                  borderRadius: 8,
                                  backgroundColor: alpha(customTheme.grey, 0.3),
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getScoreColor(match.overall_score),
                                    borderRadius: 8,
                                    background: `linear-gradient(90deg, ${getScoreColor(match.overall_score)}, ${alpha(getScoreColor(match.overall_score), 0.8)})`
                                  }
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  position: 'absolute',
                                  right: 8,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  fontSize: '0.8rem'
                                }}
                              >
                                {Math.round(match.overall_score)}%
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 4, backgroundColor: alpha(customTheme.primary, 0.15), height: 2 }} />

                          {/* Enhanced Detailed Scores Grid */}
                          <Grid container spacing={2} sx={{ mb: 4 }}>
                            {[
                              { label: 'Lifestyle', score: match.lifestyle_score, icon: 'Home' },
                              { label: 'Experience', score: match.experience_score, icon: 'Learn' },
                              { label: 'Housing', score: match.housing_score, icon: 'House' },
                              { label: 'Family', score: match.family_score, icon: 'People' }
                            ].map((item, idx) => (
                              <Grid item xs={6} key={idx}>
                                <Paper
                                  elevation={0}
                                  sx={{ 
                                    p: 2.5, 
                                    borderRadius: 3, 
                                    background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.6)} 100%)`,
                                    textAlign: 'center',
                                    border: `1px solid ${alpha(customTheme.primary, 0.1)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.1)}`
                                    }
                                  }}
                                >
                                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: customTheme.primary }}>
                                    {item.icon}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600, display: 'block', mb: 1 }}>
                                    {item.label}
                                  </Typography>
                                  <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                                    {Math.round(item.score)}%
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>

                          {/* Enhanced Match Reasons */}
                          {match.match_reasons && match.match_reasons.length > 0 && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                mb: 3,
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                                border: `1px solid ${alpha(customTheme.success, 0.2)}`
                              }}
                            >
                              <Typography variant="h6" sx={{ color: customTheme.success, fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                Why This Match Works
                              </Typography>
                              <Box sx={{ pl: 1 }}>
                                {match.match_reasons.map((reason, index) => (
                                  <Typography key={index} variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 1, fontWeight: 500 }}>
                                    • {reason}
                                  </Typography>
                                ))}
                              </Box>
                            </Paper>
                          )}

                          {/* Enhanced Challenges */}
                          {match.potential_challenges && match.potential_challenges.length > 0 && (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                mb: 3,
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha('#ff9800', 0.05)} 100%)`,
                                border: `1px solid ${alpha(customTheme.accent, 0.2)}`
                              }}
                            >
                              <Typography variant="h6" sx={{ color: customTheme.accent, fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                Things to Consider
                              </Typography>
                              <Box sx={{ pl: 1 }}>
                                {match.potential_challenges.map((challenge, index) => (
                                  <Typography key={index} variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 1, fontWeight: 500 }}>
                                    • {challenge}
                                  </Typography>
                                ))}
                              </Box>
                            </Paper>
                          )}

                          {/* Enhanced Action Buttons */}
                          <Box className="action-buttons" sx={{ display: 'flex', gap: 2, transition: 'transform 0.3s ease' }}>
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => handleApplyForAdoption(match.animal_details.id)}
                              sx={{
                                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                                color: '#ffffff',
                                fontWeight: 700,
                                py: 2,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                  background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                                  transform: 'translateY(-3px)',
                                  boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`,
                                  '&::before': {
                                    transform: 'translateX(100%)'
                                  }
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: '-100%',
                                  width: '100%',
                                  height: '100%',
                                  background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                                  transition: 'transform 0.6s ease'
                                }
                              }}
                            >
                              Apply to Adopt
                            </Button>
                            <Button
                              variant="outlined"
                              fullWidth
                              onClick={() => handleViewDetails(match.animal_details.id)}
                              startIcon={<VisibilityIcon />}
                              sx={{
                                borderColor: customTheme.primary,
                                borderWidth: 2,
                                color: customTheme.primary,
                                fontWeight: 700,
                                py: 2,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                '&:hover': {
                                  borderColor: customTheme.primary,
                                  borderWidth: 2,
                                  backgroundColor: alpha(customTheme.primary, 0.08),
                                  transform: 'translateY(-3px)',
                                  boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.2)}`
                                }
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                );
              })}
            </Grid>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <Fade in timeout={1200}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      background: `
                        linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                      `,
                      border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: customTheme.primary,
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          minWidth: 48,
                          height: 48,
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(customTheme.primary, 0.1),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                          },
                          '&.Mui-selected': {
                            backgroundColor: customTheme.primary,
                            color: '#ffffff',
                            transform: 'scale(1.1)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                            '&:hover': {
                              backgroundColor: alpha(customTheme.primary, 0.8),
                              transform: 'scale(1.1) translateY(-2px)'
                            }
                          }
                        }
                      }}
                    />
                  </Paper>
                </Box>
              </Fade>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default AdoptionMatchesPage;