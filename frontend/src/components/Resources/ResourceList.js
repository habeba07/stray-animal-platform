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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideocamIcon from '@mui/icons-material/Videocam';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import PolicyIcon from '@mui/icons-material/Policy';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import api from '../../redux/api';

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
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {resource.featured_image && (
          <CardMedia
            component="img"
            height="140"
            image={resource.featured_image}
            alt={resource.title}
          />
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {resource.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip
              icon={getResourceTypeIcon(resource.resource_type)}
              label={resource.resource_type}
              size="small"
              sx={{ mr: 1 }}
              color={isAuthority ? "secondary" : "primary"}
            />
            <Typography variant="caption" color="text.secondary">
              {formatDate(resource.created_at)}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {resource.summary}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
              {resource.view_count} views
            </Typography>
            
            {resource.average_rating && (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                {resource.average_rating.toFixed(1)} ({resource.rating_count})
              </Typography>
            )}
          </Box>
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            onClick={() => navigate(`/resources/${resource.slug}`)}
            variant={isAuthority ? "outlined" : "text"}
          >
            {isAuthority ? 'View Policy' : 'Read More'}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {isAuthority ? (
          <AccountBalanceIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        ) : (
          <SchoolIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        )}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {pageTitle}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {pageDescription}
          </Typography>
        </Box>
      </Box>
      
      {/* Different info alerts based on user type */}
      {!isAuthority && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1 }} />
            <Typography>
              Looking for interactive courses and quizzes? Check out our{' '}
              <Button 
                onClick={() => navigate('/interactive-learning')}
                sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
              >
                Interactive Learning Center
              </Button>
            </Typography>
          </Box>
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!hasResources ? (
        <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            {isAuthority ? '📋 Policy Resources Coming Soon!' : '📚 Educational Resources Coming Soon!'}
          </Typography>
          <Typography paragraph>
            {isAuthority 
              ? "We're preparing municipal guidelines, policy frameworks, and regulatory documentation for local authorities."
              : "We're preparing articles, guides, and other educational content for you."
            }
          </Typography>
          {!isAuthority && (
            <Typography>
              In the meantime, try our{' '}
              <Button 
                variant="contained" 
                onClick={() => navigate('/interactive-learning')}
                startIcon={<SchoolIcon />}
              >
                Interactive Learning Center
              </Button>
            </Typography>
          )}
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
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
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      variant="contained" 
                      onClick={handleSearch}
                      disabled={!searchQuery.trim() || searching}
                    >
                      {searching ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
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
          </Box>
          
          {/* Featured tab content (only for public users) */}
          {featuredResources.length > 0 && !isAuthority && (
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" gutterBottom>
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
                <Typography variant="h5" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body1" paragraph>
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
              <Typography variant="h5" gutterBottom>
                Search Results for "{searchQuery}"
              </Typography>
              {searchResults.length === 0 && (
                <Alert severity="info">
                  {isAuthority 
                    ? "No policy resources found for your search."
                    : `No traditional educational resources found. Try searching in our Interactive Learning Center.`
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
  );
}

export default ResourceList;