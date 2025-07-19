import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Chip,
  Box,
  Divider,
  Rating,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Videocam as VideocamIcon,
  InsertDriveFile as InsertDriveFileIcon,
  HelpOutline as HelpOutlineIcon,
  ListAlt as ListAltIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  Send as SendIcon,
  AutoAwesome as SparkleIcon,
  Favorite as FavoriteIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
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

function ResourceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [resource, setResource] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  
  useEffect(() => {
    fetchResource();
  }, [slug]);
  
  const fetchResource = async () => {
    try {
      setLoading(true);
      const resourceRes = await api.get(`/resources/${slug}/`);
      setResource(resourceRes.data);
      
      // Get ratings for this resource
      const ratingsRes = await api.get(`/resource-ratings/resource_ratings/?resource_id=${resourceRes.data.id}`);
      setRatings(ratingsRes.data);
      
      // Check if user has already rated
      if (user) {
        const userRatingObj = ratingsRes.data.find(r => r.user === user.user_id);
        if (userRatingObj) {
          setUserRating(userRatingObj.rating);
          setComment(userRatingObj.comment || '');
        }
      }
    } catch (err) {
      setError('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userRating === 0) {
      setError('Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      await api.post('/resource-ratings/', {
        resource: resource.id,
        rating: userRating,
        comment: comment
      });
      
      setRatingSuccess(true);
      fetchResource(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'ARTICLE':
        return <MenuBookIcon />;
      case 'VIDEO':
        return <VideocamIcon />;
      case 'INFOGRAPHIC':
        return <InsertDriveFileIcon />;
      case 'FAQ':
        return <HelpOutlineIcon />;
      case 'CHECKLIST':
        return <ListAltIcon />;
      default:
        return <MenuBookIcon />;
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
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
              <MenuBookIcon sx={{ color: customTheme.accent, fontSize: 30 }} />
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
            Loading Resource
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Preparing content for you...
          </Typography>
        </Box>
      </Box>
    );
  }
  
  if (!resource) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        pt: 4
      }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ 
            borderRadius: 3,
            fontSize: '1.1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: `2px solid #f44336`,
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Resource not found
            </Typography>
          </Alert>
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
        <MenuBookIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <StarIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Back Button */}
        <Slide direction="right" in timeout={800}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/resources')}
            sx={{ 
              mb: 3,
              color: customTheme.primary,
              fontWeight: 600,
              fontSize: '1.1rem',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: alpha(customTheme.primary, 0.1),
                transform: 'translateX(-5px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Back to Resources
          </Button>
        </Slide>
        
        {/* Main Content Card */}
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
          <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
            {/* Resource Header */}
            <Fade in timeout={1000}>
              <Box sx={{ mb: 4 }}>
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
                    mb: 3,
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {resource.title}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Chip
                    icon={getResourceTypeIcon(resource.resource_type)}
                    label={resource.resource_type}
                    sx={{
                      backgroundColor: alpha(customTheme.primary, 0.15),
                      color: customTheme.primary,
                      fontWeight: 600,
                      border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                      fontSize: '1rem',
                      py: 1
                    }}
                  />
                  
                  <Chip
                    icon={<CalendarTodayIcon />}
                    label={formatDate(resource.created_at)}
                    variant="outlined"
                    sx={{
                      borderColor: alpha(customTheme.secondary, 0.5),
                      color: customTheme.secondary,
                      fontWeight: 600
                    }}
                  />
                  
                  {resource.category_details && (
                    <Chip 
                      label={resource.category_details.name} 
                      sx={{
                        backgroundColor: alpha(customTheme.secondary, 0.15),
                        color: customTheme.secondary,
                        fontWeight: 600
                      }}
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VisibilityIcon sx={{ fontSize: 20, color: alpha(customTheme.primary, 0.6) }} />
                    <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.6), fontWeight: 500 }}>
                      {resource.view_count} views
                    </Typography>
                  </Box>
                  
                  {resource.average_rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={resource.average_rating} precision={0.5} readOnly size="small" />
                      <Typography variant="body1" sx={{ color: customTheme.accent, fontWeight: 600 }}>
                        ({resource.rating_count})
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PersonIcon sx={{ mr: 1, color: customTheme.primary }} />
                  <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                    By {resource.author_details?.first_name} {resource.author_details?.last_name || resource.author_details?.username}
                  </Typography>
                </Box>
                
                {resource.featured_image && (
                  <Zoom in timeout={1200}>
                    <Paper
                      elevation={3}
                      sx={{
                        mb: 4,
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `3px solid ${customTheme.primary}`,
                        position: 'relative',
                        '&::after': {
                          content: '""',
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
                        },
                        '&:hover::after': {
                          opacity: 1
                        }
                      }}
                    >
                      <img
                        src={resource.featured_image}
                        alt={resource.title}
                        style={{ 
                          width: '100%', 
                          maxHeight: '400px', 
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </Paper>
                  </Zoom>
                )}
              </Box>
            </Fade>
            
            <Divider sx={{ mb: 4, borderColor: customTheme.secondary, borderWidth: 2 }} />
            
            {/* Resource Content */}
            <Slide direction="up" in timeout={1400}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.15)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                  border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                  mb: 5
                }}
              >
                <Typography 
                  variant="body1" 
                  component="div"
                  sx={{
                    color: customTheme.primary,
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    '& p': { mb: 2 },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      color: customTheme.primary,
                      fontWeight: 700,
                      mt: 3,
                      mb: 2
                    },
                    '& ul, & ol': {
                      pl: 3,
                      mb: 2
                    },
                    '& li': {
                      mb: 1
                    }
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: resource.content }} />
                </Typography>
              </Paper>
            </Slide>
            
            <Divider sx={{ my: 5, borderColor: customTheme.accent, borderWidth: 2 }} />
            
            {/* Rating Section */}
            <Slide direction="up" in timeout={1600}>
              <Card sx={{ 
                mb: 5,
                background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.08)} 0%, ${alpha(customTheme.accent, 0.03)} 100%)`,
                border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
                borderRadius: 4
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h4" 
                    gutterBottom
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 700,
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <StarIcon sx={{ fontSize: '1.2em', color: customTheme.accent }} />
                    Rate this Resource
                  </Typography>
                  
                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: `2px solid #f44336`
                      }}
                      onClose={() => setError('')}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {error}
                      </Typography>
                    </Alert>
                  )}
                  
                  {ratingSuccess && (
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: `2px solid ${customTheme.success}`
                      }}
                      onClose={() => setRatingSuccess(false)}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Your rating has been submitted!
                      </Typography>
                    </Alert>
                  )}
                  
                  {!user ? (
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                        border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h6" sx={{ color: customTheme.primary, mb: 2, fontWeight: 600 }}>
                        Please log in to rate this resource
                      </Typography>
                      <Button 
                        onClick={() => navigate('/login')}
                        variant="contained"
                        sx={{
                          background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${customTheme.success} 90%)`,
                          color: '#ffffff',
                          fontWeight: 700,
                          textTransform: 'none',
                          '&:hover': {
                            background: `linear-gradient(45deg, ${alpha(customTheme.secondary, 0.9)} 30%, ${alpha(customTheme.success, 0.9)} 90%)`
                          }
                        }}
                      >
                        Log In
                      </Button>
                    </Paper>
                  ) : (
                    <form onSubmit={handleRatingSubmit}>
                      <Box sx={{ mb: 3 }}>
                        <Typography component="legend" sx={{ color: customTheme.primary, fontWeight: 600, mb: 2, fontSize: '1.1rem' }}>
                          Your Rating
                        </Typography>
                        <Rating
                          name="user-rating"
                          value={userRating}
                          onChange={(event, newValue) => {
                            setUserRating(newValue);
                          }}
                          size="large"
                          sx={{
                            '& .MuiRating-iconFilled': {
                              color: customTheme.accent
                            },
                            '& .MuiRating-iconEmpty': {
                              color: alpha(customTheme.accent, 0.3)
                            }
                          }}
                        />
                      </Box>
                      
                      <TextField
                        label="Your Comment (Optional)"
                        multiline
                        rows={4}
                        fullWidth
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{ 
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            '& fieldset': {
                              borderColor: alpha(customTheme.primary, 0.3),
                              borderWidth: 2,
                            },
                            '&:hover fieldset': {
                              borderColor: customTheme.secondary,
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
                        }}
                      />
                      
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting || userRating === 0}
                        startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                        sx={{
                          background: submitting || userRating === 0 ? 
                            `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.primary, 0.2)} 90%)` :
                            `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                          color: '#ffffff',
                          fontWeight: 700,
                          py: 1.5,
                          px: 4,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          '&:hover:not(:disabled)': {
                            background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.3)}`
                          }
                        }}
                      >
                        {submitting ? 'Submitting...' : 'Submit Rating'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </Slide>
            
            {/* Comments Section */}
            <Slide direction="up" in timeout={1800}>
              <Box>
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: '1.2em' }} />
                  User Ratings and Comments ({ratings.length})
                </Typography>
                
                {ratings.length === 0 ? (
                  <Paper
                    elevation={2}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.2)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                      border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                      textAlign: 'center'
                    }}
                  >
                    <StarIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.3), mb: 2 }} />
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                      No ratings yet. Be the first to rate this resource!
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {ratings.map((rating, index) => (
                      <Grid item xs={12} key={rating.id}>
                        <Fade in timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                          <Card
                            sx={{
                              borderRadius: 4,
                              overflow: 'hidden',
                              background: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.15)}`,
                                border: `2px solid ${alpha(customTheme.primary, 0.3)}`
                              }
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', mb: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    mr: 2, 
                                    bgcolor: customTheme.primary,
                                    width: 50,
                                    height: 50,
                                    fontSize: '1.2rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {rating.user_details.username[0].toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                                      {rating.user_details.username}
                                    </Typography>
                                    <Rating 
                                      value={rating.rating} 
                                      readOnly 
                                      size="small"
                                      sx={{
                                        '& .MuiRating-iconFilled': {
                                          color: customTheme.accent
                                        }
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.6), fontWeight: 500 }}>
                                    {formatDate(rating.created_at)}
                                  </Typography>
                                  {rating.comment && (
                                    <Typography variant="body1" sx={{ mt: 2, color: customTheme.primary, fontWeight: 500, lineHeight: 1.6 }}>
                                      {rating.comment}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Fade>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Slide>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default ResourceDetail;