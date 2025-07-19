// Fixed ResourceList.js - Resolves content duplication and missing content issues

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Tabs,
  Tab,
  Box,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Paper,
  Avatar,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  MenuBook as MenuBookIcon,
  Videocam as VideocamIcon,
  InsertDriveFile as InsertDriveFileIcon,
  HelpOutline as HelpOutlineIcon,
  ListAlt as ListAltIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  School as SchoolIcon,
  Policy as PolicyIcon,
  AccountBalance as AccountBalanceIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingUpIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
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

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function ResourceList() {
  console.log('🚀 ResourceList component is rendering!');
  
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  console.log('🚀 User from Redux:', user);
  console.log('🚀 User type:', user?.user_type);
  
  const [categories, setCategories] = useState([]);
  const [resourcesByCategory, setResourcesByCategory] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  // Determine if this is an authority user
  const isAuthority = user?.user_type === 'AUTHORITY';

  // Filter function to exclude interactive resources and apply role-based filtering
  const filterResourcesByRole = (resources, categoryInfo = null) => {
    console.log('🔍 DEBUG: filterResourcesByRole called with:', resources.length, 'resources');
    console.log('🔍 DEBUG: isAuthority:', isAuthority);
    console.log('🔍 DEBUG: categoryInfo:', categoryInfo);
    
    // First filter out interactive resources
    let filtered = resources.filter(resource => !resource.interactive_module);
    console.log('🔍 DEBUG: After filtering interactive resources:', filtered.length);
    
    // Then apply role-based filtering
    if (isAuthority) {
      console.log('🔍 DEBUG: Applying authority filtering...');
      
      // Authority users: show only policy/government related content
      const authorityCategories = [
        'policy implementation',
        'legal frameworks', 
        'best practices',
        'strategic planning',
        'research studies',
        'municipal guidelines',
        'enforcement procedures',
        'regulatory compliance'
      ];
      
      filtered = filtered.filter(resource => {
        // Get category name from the passed categoryInfo or try to find it from resource
        const categoryName = (categoryInfo?.name || resource.category_details?.name || '').toLowerCase();
        const resourceTitle = resource.title?.toLowerCase() || '';
        const resourceSummary = resource.summary?.toLowerCase() || '';
        
        console.log(`🔍 DEBUG: Checking resource "${resource.title}"`);
        console.log(`🔍 DEBUG: - Category: "${categoryName}"`);
        console.log(`🔍 DEBUG: - Title: "${resourceTitle}"`);
        
        const matches = authorityCategories.some(keyword => 
          categoryName.includes(keyword) || 
          resourceTitle.includes(keyword) ||
          resourceSummary.includes(keyword)
        );
        
        console.log(`🔍 DEBUG: - Matches authority criteria: ${matches}`);
        return matches;
      });
      
      console.log('🔍 DEBUG: Final filtered authority resources:', filtered.length);
    } else {
      // Public users: exclude authority/policy content
      const publicExclusions = [
        'policy implementation',
        'legal frameworks',
        'municipal guidelines',
        'enforcement procedures',
        'regulatory compliance',
        'strategic planning'
      ];
      
      filtered = filtered.filter(resource => {
        const categoryName = (categoryInfo?.name || resource.category_details?.name || '').toLowerCase();
        const resourceTitle = resource.title?.toLowerCase() || '';
        
        return !publicExclusions.some(keyword => 
          categoryName.includes(keyword) || 
          resourceTitle.includes(keyword)
        );
      });
    }
    
    return filtered;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, resourcesByCategoryRes, featuredRes] = await Promise.all([
        api.get('/resource-categories/'),
        api.get('/resources/by_category/'),
        api.get('/resources/featured/')
      ]);
      
      setCategories(categoriesRes.data);
      
      // Apply role-based filtering
      const filteredResourcesByCategory = resourcesByCategoryRes.data.map(categoryGroup => ({
        ...categoryGroup,
        resources: filterResourcesByRole(categoryGroup.resources, categoryGroup.category)
      })).filter(categoryGroup => categoryGroup.resources.length > 0);
      
      setResourcesByCategory(filteredResourcesByCategory);
      
      // For authorities, don't show featured tab to avoid duplication
      // For public users, still show featured content
      if (!isAuthority) {
        setFeaturedResources(filterResourcesByRole(featuredRes.data));
      } else {
        setFeaturedResources([]); // No featured tab for authorities
      }
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      const response = await api.get(`/resources/?search=${searchQuery}`);
      setSearchResults(filterResourcesByRole(response.data));
      
      // Calculate correct tab index for search results
      const availableCategories = categories.filter(category => 
        resourcesByCategory.some(c => c.category.id === category.id)
      );
      const searchTabIndex = availableCategories.length + (featuredResources.length > 0 ? 1 : 0);
      setTabValue(searchTabIndex);
    } catch (err) {
      setError('Failed to search resources');
    } finally {
      setSearching(false);
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
      case 'GUIDE':
        return isAuthority ? <PolicyIcon /> : <MenuBookIcon />;
      default:
        return <MenuBookIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderResourceCard = (resource) => (
    <Grid item xs={12} md={6} lg={4} key={resource.id}>
      <Fade in timeout={800}>
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
          {resource.featured_image && (
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
              <CardMedia
                component="img"
                height="140"
                image={resource.featured_image}
                alt={resource.title}
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
            </Box>
          )}
          
          <CardContent sx={{ flexGrow: 1, p: 3, position: 'relative', zIndex: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontWeight: 700, 
              color: customTheme.primary,
              lineHeight: 1.3
            }}>
              {resource.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={getResourceTypeIcon(resource.resource_type)}
                label={resource.resource_type}
                size="small"
                sx={{
                  backgroundColor: alpha(customTheme.primary, 0.15),
                  color: customTheme.primary,
                  fontWeight: 600,
                  border: `1px solid ${alpha(customTheme.primary, 0.3)}`
                }}
              />
              <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 500 }}>
                {formatDate(resource.created_at)}
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: alpha(customTheme.primary, 0.7),
                lineHeight: 1.6,
                mb: 3,
                fontWeight: 500
              }}
            >
              {resource.summary}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VisibilityIcon sx={{ fontSize: 16, color: alpha(customTheme.primary, 0.6) }} />
                <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.6), fontWeight: 500 }}>
                  {resource.view_count} views
                </Typography>
              </Box>
              
              {resource.average_rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: 16, color: customTheme.accent }} />
                  <Typography variant="body2" sx={{ color: customTheme.accent, fontWeight: 500 }}>
                    {resource.average_rating.toFixed(1)} ({resource.rating_count})
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
          
          <CardActions sx={{ p: 3, pt: 0, position: 'relative', zIndex: 2 }}>
            <Button 
              size="large" 
              fullWidth
              onClick={() => navigate(`/resources/${resource.slug}`)}
              variant="contained"
              sx={{
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                color: '#ffffff',
                fontWeight: 700,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
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
                  background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`,
                  '&::before': {
                    left: '100%'
                  }
                }
              }}
            >
              {isAuthority ? 'View Policy' : 'Read More'}
            </Button>
          </CardActions>
        </Card>
      </Fade>
    </Grid>
  );

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
          <MenuBookIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <SchoolIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
            Loading {isAuthority ? 'Policy Resources' : 'Educational Resources'}
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Gathering valuable content for you...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Check if we have appropriate resources for this user type
  const hasResources = featuredResources.length > 0 || resourcesByCategory.length > 0;

  // Different page titles and content based on user type
  const pageTitle = isAuthority ? 'Policy Resources' : 'Educational Resources';
  const pageDescription = isAuthority 
    ? 'Municipal policy guidelines, best practices, and regulatory frameworks for stray animal management'
    : 'Educational content to help you learn about animal care and welfare';

  // Get available categories that have resources
  const availableCategories = categories.filter(category => 
    resourcesByCategory.some(c => c.category.id === category.id)
  );

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
        <SchoolIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Hero Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 6, position: 'relative' }}>
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Slide direction="right" in timeout={1200}>
                <Avatar
                  sx={{
                    bgcolor: customTheme.primary,
                    width: 60,
                    height: 60,
                    mr: 3,
                    boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  {isAuthority ? (
                    <AccountBalanceIcon sx={{ fontSize: 30 }} />
                  ) : (
                    <SchoolIcon sx={{ fontSize: 30 }} />
                  )}
                </Avatar>
              </Slide>
              
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
                    mb: 1,
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {pageTitle}
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
                  {pageDescription}
                </Typography>
              </Box>
            </Box>
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
        
        {!hasResources ? (
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
                  {isAuthority ? (
                    <AccountBalanceIcon 
                      sx={{ 
                        fontSize: 120, 
                        color: alpha(customTheme.primary, 0.3), 
                        mb: 3,
                        animation: `${float} 4s ease-in-out infinite`
                      }} 
                    />
                  ) : (
                    <SchoolIcon 
                      sx={{ 
                        fontSize: 120, 
                        color: alpha(customTheme.primary, 0.3), 
                        mb: 3,
                        animation: `${float} 4s ease-in-out infinite`
                      }} 
                    />
                  )}
                  <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                    {isAuthority ? 'Policy Resources Coming Soon!' : 'Educational Resources Coming Soon!'}
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 500, mx: 'auto', mb: 4 }}>
                    {isAuthority 
                      ? "We're preparing municipal guidelines, policy frameworks, and regulatory documentation for local authorities."
                      : "We're preparing articles, guides, and other educational content for you. Check back soon for valuable resources!"
                    }
                  </Typography>
                  {isAuthority && (
                    <Button 
                      variant="contained" 
                      href="/volunteer"
                      startIcon={<SchoolIcon />}
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
                      Learn More About Our Platform
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        ) : (
          <>
            {/* Search Bar */}
            <Slide direction="up" in timeout={1400}>
              <Paper
                elevation={3}
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.1)}`
                }}
              >
                <TextField
                  fullWidth
                  placeholder={isAuthority ? "Search policy documents and guidelines..." : "Search articles and guides..."}
                  variant="outlined"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: customTheme.primary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          variant="contained" 
                          onClick={handleSearch}
                          disabled={!searchQuery.trim() || searching}
                          startIcon={searching ? <CircularProgress size={16} /> : null}
                          sx={{
                            background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                            color: '#ffffff',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`
                            }
                          }}
                        >
                          {searching ? 'Searching...' : 'Search'}
                        </Button>
                      </InputAdornment>
                    ),
                    sx: {
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '1.1rem',
                        color: customTheme.primary,
                        fontWeight: 500,
                        py: 2
                      }
                    }
                  }}
                />
              </Paper>
            </Slide>
            
            {/* Enhanced Tabs */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: `
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                backdropFilter: 'blur(20px)',
                mb: 4
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: customTheme.primary,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    minHeight: 80,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(customTheme.primary, 0.08),
                      transform: 'translateY(-2px)'
                    },
                    '&.Mui-selected': {
                      color: customTheme.primary,
                      backgroundColor: alpha(customTheme.primary, 0.1),
                      fontWeight: 800
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: customTheme.primary,
                    height: 4,
                    borderRadius: 2
                  }
                }}
              >
                {/* Featured tab only for public users */}
                {featuredResources.length > 0 && !isAuthority && (
                  <Tab label="Featured" />
                )}
                
                {/* Category tabs */}
                {availableCategories.map((category) => (
                  <Tab key={category.id} label={category.name} />
                ))}
                
                {/* Search results tab */}
                {searchResults.length > 0 && (
                  <Tab label="Search Results" />
                )}
              </Tabs>
            </Paper>
            
            {/* Featured tab content (only for public users) */}
            {featuredResources.length > 0 && !isAuthority && (
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h4" gutterBottom sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 700,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <StarIcon sx={{ fontSize: '1.2em' }} />
                  Featured Resources
                </Typography>
                <Grid container spacing={3}>
                  {featuredResources.map(resource => renderResourceCard(resource))}
                </Grid>
              </TabPanel>
            )}
            
            {/* Category tabs content */}
            {availableCategories.map((category, index) => {
              const categoryData = resourcesByCategory.find(c => c.category.id === category.id);
              if (!categoryData) return null;
              
              // Calculate correct tab index
              const tabIndex = (!isAuthority && featuredResources.length > 0) ? index + 1 : index;
              
              return (
                <TabPanel value={tabValue} index={tabIndex} key={category.id}>
                  <Typography variant="h4" gutterBottom sx={{ 
                    color: customTheme.primary, 
                    fontWeight: 700,
                    mb: 2
                  }}>
                    {category.name}
                  </Typography>
                  <Typography variant="h6" paragraph sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    mb: 4,
                    fontWeight: 500
                  }}>
                    {category.description}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {categoryData.resources.map(resource => renderResourceCard(resource))}
                  </Grid>
                </TabPanel>
              );
            })}
            
            {/* Search results tab */}
            {searchResults.length > 0 && (
              <TabPanel 
                value={tabValue} 
                index={availableCategories.length + (featuredResources.length > 0 && !isAuthority ? 1 : 0)}
              >
                <Typography variant="h4" gutterBottom sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 700,
                  mb: 2
                }}>
                  Search Results for "{searchQuery}"
                </Typography>
                {searchResults.length === 0 && (
                  <Alert severity="info" sx={{ mb: 4 }}>
                    {isAuthority 
                      ? "No policy resources found for your search."
                      : "No educational resources found for your search. Please try different keywords."
                    }
                  </Alert>
                )}
                <Grid container spacing={3}>
                  {searchResults.map(resource => renderResourceCard(resource))}
                </Grid>
              </TabPanel>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default ResourceList;