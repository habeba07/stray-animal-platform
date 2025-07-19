import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Divider,
  TextField,
  Breadcrumbs,
  IconButton,
  Badge,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
  Grow,
} from '@mui/material';
import {
  Forum as ForumIcon,
  Topic as TopicIcon,
  Message as MessageIcon,
  Add as AddIcon,
  ThumbUp as ThumbUpIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  NavigateNext as NavigateNextIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  PushPin as PushPinIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
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

function ForumPage() {
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentView, setCurrentView] = useState('categories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/forum-categories/');
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Forum categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (categoryId = null) => {
    try {
      setLoading(true);
      const url = categoryId ? `/forum-topics/?category=${categoryId}` : '/forum-topics/';
      const response = await api.get(url);
      setTopics(response.data);
      setSelectedCategory(categoryId);
      setCurrentView('topics');
    } catch (err) {
      setError('Failed to load topics');
      console.error('Forum topics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (topicId) => {
    try {
      setLoading(true);
      const response = await api.get(`/forum-posts/?topic=${topicId}`);
      setPosts(response.data);
      setSelectedTopic(topicId);
      setCurrentView('posts');
    } catch (err) {
      setError('Failed to load posts');
      console.error('Forum posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!newTopicTitle.trim()) {
      setError('Please enter a topic title');
      return;
    }

    try {
      await api.post('/forum-topics/', {
        title: newTopicTitle,
        category: selectedCategory
      });
      setNewTopicTitle('');
      setShowNewTopicForm(false);
      fetchTopics(selectedCategory);
      setError('');
    } catch (err) {
      setError('Failed to create topic');
      console.error('Create topic error:', err);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim()) {
      setError('Please enter post content');
      return;
    }

    try {
      await api.post('/forum-posts/', {
        topic: selectedTopic,
        content: newPostContent
      });
      setNewPostContent('');
      setShowNewPostForm(false);
      fetchPosts(selectedTopic);
      setError('');
    } catch (err) {
      setError('Failed to create post');
      console.error('Create post error:', err);
    }
  };

  const likePost = async (postId) => {
    try {
      await api.post(`/forum-posts/${postId}/like/`);
      fetchPosts(selectedTopic);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getUserTypeDisplayName = (userType) => {
    const names = {
      'SHELTER': 'Shelter Manager',
      'STAFF': 'Shelter Staff',
      'VOLUNTEER': 'Volunteer',
      'PUBLIC': 'Community Member',
      'AUTHORITY': 'Policy Maker'
    };
    return names[userType] || userType;
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      'Operational Coordination': customTheme.primary,
      'Emergency Response': '#f44336',
      'Health & Veterinary': '#d32f2f',
      'Resource Management': '#9c27b0',
      'Staff Wellness & Support': customTheme.secondary,
      'Volunteer Coordination': customTheme.accent,
      'Policy & Advocacy': '#3f51b5',
      'Adoption Success Stories': customTheme.success,
      'Pet Care Basics': customTheme.accent,
      'Training & Behavior': customTheme.primary,
      'General Discussion': customTheme.secondary
    };
    return colors[categoryName] || customTheme.primary;
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Operational Coordination': ForumIcon,
      'Emergency Response': MessageIcon,
      'Health & Veterinary': ChatIcon,
      'Resource Management': TopicIcon,
      'Staff Wellness & Support': PersonIcon,
      'Volunteer Coordination': PersonIcon,
      'Policy & Advocacy': ForumIcon,
      'Adoption Success Stories': StarIcon,
      'Pet Care Basics': ChatIcon,
      'Training & Behavior': TopicIcon,
      'General Discussion': MessageIcon
    };
    return icons[categoryName] || MessageIcon;
  };

  if (loading && categories.length === 0 && currentView === 'categories') {
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
          <ForumIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <ChatIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
            Loading Community Forum
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Preparing your discussions...
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
        <ForumIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <ChatIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
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
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <ForumIcon sx={{ fontSize: '2.5rem', color: customTheme.primary }} />
              Community Forum
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
              Connect, share knowledge, and collaborate with the community
            </Typography>
            
            {/* User Badge */}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Avatar sx={{ bgcolor: customTheme.primary }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                      {getUserTypeDisplayName(user?.user_type)} Access
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                      Welcome to the forum, {user?.username}!
                    </Typography>
                  </Box>
                </Paper>
              </Box>
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
                  color: '#f44336'
                }
              }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setError('')}
                  sx={{ color: '#f44336' }}
                >
                  <CloseIcon />
                </IconButton>
              }
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Role-based filter explanation */}
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
              border: `1px solid ${alpha(customTheme.success, 0.2)}`
            }}
          >
            <Typography variant="h6" sx={{ color: customTheme.success, fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              🎯 Personalized Categories
            </Typography>
            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), lineHeight: 1.6 }}>
              {user?.user_type === 'SHELTER' && 
                "As a Shelter Manager, you see operational, staff coordination, and professional categories relevant to shelter management."
              }
              {user?.user_type === 'STAFF' && 
                "As Shelter Staff, you have access to operational, medical, and staff wellness categories for day-to-day work."
              }
              {user?.user_type === 'VOLUNTEER' && 
                "As a Volunteer, you can access emergency response, coordination, and community discussion categories."
              }
              {user?.user_type === 'PUBLIC' && 
                "As a Community Member, you can access pet care, training tips, and general discussion categories."
              }
              {user?.user_type === 'AUTHORITY' && 
                "As a Policy Maker, you have access to strategic, policy, and operational oversight categories."
              }
            </Typography>
          </Paper>
        </Fade>

        {/* Navigation Breadcrumbs */}
        <Slide direction="down" in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)`,
              border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: customTheme.primary }} />}
              sx={{
                '& .MuiBreadcrumbs-li': {
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            >
              <Button
                variant={currentView === 'categories' ? 'contained' : 'text'}
                startIcon={<ForumIcon />}
                onClick={() => setCurrentView('categories')}
                sx={{
                  backgroundColor: currentView === 'categories' ? customTheme.primary : 'transparent',
                  color: currentView === 'categories' ? '#ffffff' : customTheme.primary,
                  '&:hover': {
                    backgroundColor: currentView === 'categories' ? alpha(customTheme.primary, 0.8) : alpha(customTheme.primary, 0.1),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                  },
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
              >
                Categories
              </Button>
              {selectedCategory && (
                <Button
                  variant={currentView === 'topics' ? 'contained' : 'text'}
                  startIcon={<TopicIcon />}
                  onClick={() => fetchTopics(selectedCategory)}
                  sx={{
                    backgroundColor: currentView === 'topics' ? customTheme.primary : 'transparent',
                    color: currentView === 'topics' ? '#ffffff' : customTheme.primary,
                    '&:hover': {
                      backgroundColor: currentView === 'topics' ? alpha(customTheme.primary, 0.8) : alpha(customTheme.primary, 0.1),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                    },
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Topics
                </Button>
              )}
              {selectedTopic && (
                <Button
                  variant={currentView === 'posts' ? 'contained' : 'text'}
                  startIcon={<MessageIcon />}
                  onClick={() => fetchPosts(selectedTopic)}
                  sx={{
                    backgroundColor: currentView === 'posts' ? customTheme.primary : 'transparent',
                    color: currentView === 'posts' ? '#ffffff' : customTheme.primary,
                    '&:hover': {
                      backgroundColor: currentView === 'posts' ? alpha(customTheme.primary, 0.8) : alpha(customTheme.primary, 0.1),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                    },
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Discussion
                </Button>
              )}
            </Breadcrumbs>
          </Paper>
        </Slide>

        {/* Categories View */}
        {currentView === 'categories' && (
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: customTheme.primary, 
              mb: 4,
              textAlign: 'center'
            }}>
              Forum Categories
            </Typography>
            
            {categories.length > 0 ? (
              <Grid container spacing={4}>
                {categories.map((category, index) => {
                  const IconComponent = getCategoryIcon(category.name);
                  return (
                    <Grid item xs={12} md={6} lg={4} key={category.id}>
                      <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            cursor: 'pointer',
                            borderRadius: 4,
                            overflow: 'hidden',
                            background: `
                              linear-gradient(135deg, 
                                ${alpha('#ffffff', 0.95)} 0%, 
                                ${alpha(getCategoryColor(category.name), 0.05)} 100%
                              )
                            `,
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(getCategoryColor(category.name), 0.2)}`,
                            borderLeft: `4px solid ${getCategoryColor(category.name)}`,
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '3px',
                              background: `linear-gradient(90deg, ${getCategoryColor(category.name)} 0%, ${alpha(getCategoryColor(category.name), 0.3)} 100%)`,
                              opacity: 0,
                              transition: 'opacity 0.3s ease'
                            },
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.02)',
                              boxShadow: `
                                0 20px 40px ${alpha(getCategoryColor(category.name), 0.25)},
                                0 8px 16px ${alpha(getCategoryColor(category.name), 0.15)},
                                0 0 0 1px ${alpha(getCategoryColor(category.name), 0.1)},
                                inset 0 1px 0 ${alpha('#ffffff', 0.8)}
                              `,
                              border: `1px solid ${alpha(getCategoryColor(category.name), 0.4)}`,
                              '&::before': {
                                opacity: 1
                              }
                            }
                          }}
                          onClick={() => fetchTopics(category.id)}
                        >
                          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            {/* Subtle background pattern */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '60px',
                                height: '60px',
                                background: `radial-gradient(circle, ${alpha(getCategoryColor(category.name), 0.1)} 0%, transparent 70%)`,
                                borderRadius: '50%',
                                transform: 'translate(30%, -30%)'
                              }}
                            />
                            
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, position: 'relative' }}>
                              <Box
                                sx={{
                                  mr: 3,
                                  p: 2.5,
                                  borderRadius: 3,
                                  background: `
                                    linear-gradient(135deg, 
                                      ${alpha(getCategoryColor(category.name), 0.1)} 0%, 
                                      ${alpha(getCategoryColor(category.name), 0.05)} 100%
                                    )
                                  `,
                                  border: `1px solid ${alpha(getCategoryColor(category.name), 0.2)}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minWidth: '60px',
                                  height: '60px',
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <IconComponent 
                                  sx={{ 
                                    fontSize: '2rem',
                                    color: getCategoryColor(category.name),
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                  }} 
                                />
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                  variant="h5" 
                                  sx={{ 
                                    fontWeight: 700,
                                    color: getCategoryColor(category.name),
                                    mb: 1,
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.01em'
                                  }}
                                >
                                  {category.name}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: alpha(customTheme.primary, 0.6),
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Discussion Category
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: alpha(customTheme.primary, 0.8),
                                lineHeight: 1.6,
                                mb: 4,
                                flex: 1,
                                fontSize: '0.95rem'
                              }}
                            >
                              {category.description}
                            </Typography>
                            
                            <Box sx={{ mt: 'auto' }}>
                              <Divider 
                                sx={{ 
                                  my: 2, 
                                  backgroundColor: alpha(getCategoryColor(category.name), 0.15),
                                  height: '1px'
                                }} 
                              />
                              
                              <Grid container spacing={3}>
                                <Grid item xs={6}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography 
                                      variant="h3" 
                                      sx={{ 
                                        color: getCategoryColor(category.name), 
                                        fontWeight: 800, 
                                        mb: 0.5,
                                        lineHeight: 1,
                                        fontSize: '2.2rem'
                                      }}
                                    >
                                      {category.topic_count}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: alpha(customTheme.primary, 0.6), 
                                        fontWeight: 600, 
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.7rem'
                                      }}
                                    >
                                      Topics
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography 
                                      variant="h3" 
                                      sx={{ 
                                        color: getCategoryColor(category.name), 
                                        fontWeight: 800, 
                                        mb: 0.5,
                                        lineHeight: 1,
                                        fontSize: '2.2rem'
                                      }}
                                    >
                                      {category.post_count}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: alpha(customTheme.primary, 0.6), 
                                        fontWeight: 600, 
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontSize: '0.7rem'
                                      }}
                                    >
                                      Posts
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </CardContent>
                        </Card>
                      </Fade>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
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
                  <ForumIcon 
                    sx={{ 
                      fontSize: 120, 
                      color: alpha(customTheme.primary, 0.3), 
                      mb: 3,
                      animation: `${float} 4s ease-in-out infinite`
                    }} 
                  />
                  <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                    No Categories Available
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto' }}>
                    No forum categories are available for your user type at this time.
                  </Typography>
                </Paper>
              </Zoom>
            )}
          </Box>
        )}

        {/* Topics View */}
        {currentView === 'topics' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: customTheme.primary }}>
                Forum Topics
              </Typography>
              <Button 
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowNewTopicForm(!showNewTopicForm)}
                sx={{
                  background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${alpha(customTheme.accent, 0.8)} 90%)`,
                  color: '#ffffff',
                  fontWeight: 700,
                  py: 1.5,
                  px: 3,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${customTheme.accent} 90%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`
                  }
                }}
              >
                New Topic
              </Button>
            </Box>

            {showNewTopicForm && (
              <Grow in timeout={500}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`
                  }}
                >
                  <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700, mb: 3 }}>
                    Create New Topic
                  </Typography>
                  <TextField
                    fullWidth
                    label="Topic title..."
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(customTheme.background, 0.8),
                        borderRadius: 3,
                        '& fieldset': { borderColor: alpha(customTheme.primary, 0.3) },
                        '&:hover fieldset': { borderColor: customTheme.primary },
                        '&.Mui-focused fieldset': { borderColor: customTheme.primary }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={createTopic}
                      sx={{
                        background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                        color: '#ffffff',
                        fontWeight: 700,
                        py: 1.5,
                        px: 3,
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`
                        }
                      }}
                    >
                      Create Topic
                    </Button>
                    <Button 
                      variant="outlined"
                      onClick={() => setShowNewTopicForm(false)}
                      sx={{
                        borderColor: customTheme.primary,
                        color: customTheme.primary,
                        fontWeight: 600,
                        py: 1.5,
                        px: 3,
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: customTheme.primary,
                          backgroundColor: alpha(customTheme.primary, 0.08),
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              </Grow>
            )}

            {topics.length > 0 ? (
              <Grid container spacing={3}>
                {topics.map((topic, index) => (
                  <Grid item xs={12} key={topic.id}>
                    <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `
                              0 15px 35px ${alpha(customTheme.primary, 0.2)},
                              0 0 0 1px ${alpha(customTheme.primary, 0.1)}
                            `,
                            border: `2px solid ${alpha(customTheme.primary, 0.3)}`
                          }
                        }}
                        onClick={() => fetchPosts(topic.id)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1, mr: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TopicIcon sx={{ color: customTheme.primary, mr: 1 }} />
                                <Typography 
                                  variant="h5" 
                                  sx={{ 
                                    fontWeight: 700,
                                    color: customTheme.primary,
                                    lineHeight: 1.3
                                  }}
                                >
                                  {topic.title}
                                </Typography>
                                {topic.is_pinned && (
                                  <Chip
                                    icon={<PushPinIcon />}
                                    label="Pinned"
                                    size="small"
                                    sx={{
                                      ml: 2,
                                      backgroundColor: alpha(customTheme.accent, 0.2),
                                      color: customTheme.accent,
                                      fontWeight: 600,
                                      '& .MuiChip-icon': { color: customTheme.accent }
                                    }}
                                  />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PersonIcon fontSize="small" />
                                  By {topic.created_by_username}
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ScheduleIcon fontSize="small" />
                                  {formatDate(topic.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Chip
                                  icon={<VisibilityIcon />}
                                  label={`${topic.views} views`}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(customTheme.secondary, 0.2),
                                    color: customTheme.secondary,
                                    fontWeight: 600,
                                    '& .MuiChip-icon': { color: customTheme.secondary }
                                  }}
                                />
                                <Chip
                                  icon={<MessageIcon />}
                                  label={`${topic.post_count} posts`}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(customTheme.primary, 0.2),
                                    color: customTheme.primary,
                                    fontWeight: 600,
                                    '& .MuiChip-icon': { color: customTheme.primary }
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            ) : (
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
                  }}
                >
                  <TopicIcon 
                    sx={{ 
                      fontSize: 120, 
                      color: alpha(customTheme.primary, 0.3), 
                      mb: 3,
                      animation: `${float} 4s ease-in-out infinite`
                    }} 
                  />
                  <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                    No topics found
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                    Be the first to start a discussion!
                  </Typography>
                </Paper>
              </Zoom>
            )}
          </Box>
        )}

        {/* Posts View */}
        {currentView === 'posts' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: customTheme.primary }}>
                Discussion
              </Typography>
              <Button 
                variant="contained"
                startIcon={<MessageIcon />}
                onClick={() => setShowNewPostForm(!showNewPostForm)}
                sx={{
                  background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${alpha(customTheme.secondary, 0.8)} 90%)`,
                  color: '#ffffff',
                  fontWeight: 700,
                  py: 1.5,
                  px: 3,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${alpha(customTheme.secondary, 0.9)} 30%, ${customTheme.secondary} 90%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`
                  }
                }}
              >
                Reply
              </Button>
            </Box>

            {showNewPostForm && (
              <Grow in timeout={500}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                    border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
                  }}
                >
                  <Typography variant="h5" sx={{ color: customTheme.secondary, fontWeight: 700, mb: 3 }}>
                    Add Your Reply
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Write your message..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: alpha(customTheme.background, 0.8),
                        borderRadius: 3,
                        '& fieldset': { borderColor: alpha(customTheme.secondary, 0.3) },
                        '&:hover fieldset': { borderColor: customTheme.secondary },
                        '&.Mui-focused fieldset': { borderColor: customTheme.secondary }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={createPost}
                      sx={{
                        background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${alpha(customTheme.secondary, 0.8)} 90%)`,
                        color: '#ffffff',
                        fontWeight: 700,
                        py: 1.5,
                        px: 3,
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${alpha(customTheme.secondary, 0.9)} 30%, ${customTheme.secondary} 90%)`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`
                        }
                      }}
                    >
                      Post Reply
                    </Button>
                    <Button 
                      variant="outlined"
                      onClick={() => setShowNewPostForm(false)}
                      sx={{
                        borderColor: customTheme.secondary,
                        color: customTheme.secondary,
                        fontWeight: 600,
                        py: 1.5,
                        px: 3,
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: customTheme.secondary,
                          backgroundColor: alpha(customTheme.secondary, 0.08),
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              </Grow>
            )}

            {posts.length > 0 ? (
              <Grid container spacing={3}>
                {posts.map((post, index) => (
                  <Grid item xs={12} key={post.id}>
                    <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
                      <Card 
                        sx={{ 
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `
                              0 10px 25px ${alpha(customTheme.primary, 0.15)},
                              0 0 0 1px ${alpha(customTheme.primary, 0.1)}
                            `,
                            border: `2px solid ${alpha(customTheme.primary, 0.2)}`
                          }
                        }}
                      >
                        <CardContent sx={{ p: 4 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: customTheme.primary }}>
                                <PersonIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                                  {post.author_username}
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ScheduleIcon fontSize="small" />
                                  {formatDate(post.created_at)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                onClick={() => likePost(post.id)}
                                sx={{
                                  backgroundColor: post.user_has_liked ? alpha(customTheme.success, 0.2) : alpha(customTheme.primary, 0.1),
                                  color: post.user_has_liked ? customTheme.success : customTheme.primary,
                                  '&:hover': {
                                    backgroundColor: post.user_has_liked ? alpha(customTheme.success, 0.3) : alpha(customTheme.primary, 0.2),
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <Badge badgeContent={post.likes_count} color="primary">
                                  <ThumbUpIcon />
                                </Badge>
                              </IconButton>
                              {post.is_solution && (
                                <Chip
                                  icon={<CheckCircleIcon />}
                                  label="Solution"
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(customTheme.success, 0.2),
                                    color: customTheme.success,
                                    fontWeight: 600,
                                    '& .MuiChip-icon': { color: customTheme.success }
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 2, backgroundColor: alpha(customTheme.primary, 0.1) }} />
                          
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: alpha(customTheme.primary, 0.9),
                              lineHeight: 1.7,
                              fontSize: '1.1rem'
                            }}
                          >
                            {post.content}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            ) : (
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
                  }}
                >
                  <MessageIcon 
                    sx={{ 
                      fontSize: 120, 
                      color: alpha(customTheme.primary, 0.3), 
                      mb: 3,
                      animation: `${float} 4s ease-in-out infinite`
                    }} 
                  />
                  <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                    No posts yet
                  </Typography>
                  <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                    Be the first to contribute to this discussion!
                  </Typography>
                </Paper>
              </Zoom>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default ForumPage;