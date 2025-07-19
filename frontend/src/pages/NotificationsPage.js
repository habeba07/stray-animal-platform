import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Chip,
  Button,
  Avatar,
  Fade,
  Slide,
  Zoom,
  alpha,
  Card,
  CardContent,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  DoneAll as DoneAllIcon,
  Notifications as NotificationsIcon,
  Report as ReportIcon,
  Pets as PetsIcon,
  Favorite as FavoriteIcon,
  VolunteerActivism as VolunteerIcon,
  MonetizationOn as DonationIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Circle as CircleIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
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

function NotificationsPage() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh notifications when the page loads
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on notification type and related object
    if (notification.related_object_type && notification.related_object_id) {
      switch(notification.related_object_type) {
        case 'report':
          navigate(`/reports/${notification.related_object_id}`);
          break;
        case 'adoption':
        case 'adoptionapplication':
          navigate(`/adoption/applications/${notification.related_object_id}`);
          break;
        case 'animal':
          navigate(`/animals/${notification.related_object_id}`);
          break;
        case 'donation':
          navigate(`/donations`);
          break;
        case 'volunteerassignment':
          navigate(`/volunteer/assignments`);
          break;
        default:
          break;
      }
    }
  };

  const formatNotificationDate = (dateString) => {
    return format(new Date(dateString), 'PPpp');
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'REPORT_UPDATE':
        return customTheme.primary;
      case 'ADOPTION_UPDATE':
        return customTheme.secondary;
      case 'VOLUNTEER_ASSIGNMENT':
        return customTheme.success;
      case 'DONATION_RECEIVED':
        return customTheme.accent;
      case 'ANIMAL_UPDATE':
        return '#ff9800';
      case 'SYSTEM_MESSAGE':
        return '#2196f3';
      default:
        return customTheme.primary;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'REPORT_UPDATE':
        return <ReportIcon />;
      case 'ADOPTION_UPDATE':
        return <FavoriteIcon />;
      case 'VOLUNTEER_ASSIGNMENT':
        return <VolunteerIcon />;
      case 'DONATION_RECEIVED':
        return <DonationIcon />;
      case 'ANIMAL_UPDATE':
        return <PetsIcon />;
      case 'SYSTEM_MESSAGE':
        return <InfoIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getReadableNotificationType = (type) => {
    switch (type) {
      case 'REPORT_UPDATE':
        return 'Report Update';
      case 'ADOPTION_UPDATE':
        return 'Adoption Update';
      case 'VOLUNTEER_ASSIGNMENT':
        return 'Volunteer Assignment';
      case 'DONATION_RECEIVED':
        return 'Donation Received';
      case 'ANIMAL_UPDATE':
        return 'Animal Update';
      case 'SYSTEM_MESSAGE':
        return 'System Message';
      default:
        return type.replace('_', ' ');
    }
  };

  // Group notifications by read status
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

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
        <NotificationsIcon sx={{ fontSize: 40, color: customTheme.accent, filter: 'blur(1px)' }} />
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
        <StarIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <PetsIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
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
                <NotificationsIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
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
                  <NotificationsIcon sx={{ fontSize: 50 }} />
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
                Notifications
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Stay updated with your rescue activities and community interactions
              </Typography>
            </Box>

            {/* Statistics Cards */}
            <Slide direction="up" in timeout={1200}>
              <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.15)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
                      borderRadius: 4,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <NotificationsIcon sx={{ fontSize: 40, color: customTheme.accent, mb: 1 }} />
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {notifications.length}
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                        Total Notifications
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.15)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                      borderRadius: 4,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <CircleIcon sx={{ fontSize: 40, color: customTheme.secondary, mb: 1 }} />
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {unreadCount}
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                        Unread
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.15)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                      borderRadius: 4,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <DoneAllIcon sx={{ fontSize: 40, color: customTheme.success, mb: 1 }} />
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {readNotifications.length}
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                        Read
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.15)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
                      border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                      borderRadius: 4,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <TrendingIcon sx={{ fontSize: 40, color: customTheme.primary, mb: 1 }} />
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {unreadCount > 0 ? Math.round((readNotifications.length / notifications.length) * 100) : 100}%
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                        Read Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Slide>

            {/* Main Notifications Card */}
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
                {/* Header */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 5,
                  pb: 3,
                  background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.08)} 0%, ${alpha(customTheme.primary, 0.03)} 100%)`,
                  borderBottom: `3px solid ${alpha(customTheme.primary, 0.2)}`
                }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: '1.2em' }} />
                    Your Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Button 
                      startIcon={<DoneAllIcon />}
                      onClick={markAllAsRead}
                      variant="contained"
                      sx={{
                        background: `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                        borderRadius: 3,
                        py: 1.5,
                        px: 3,
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.3)}`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.4)}`
                        }
                      }}
                    >
                      Mark All as Read
                    </Button>
                  )}
                </Box>

                <Divider sx={{ borderColor: alpha(customTheme.primary, 0.15), borderWidth: 1 }} />

                {notifications.length === 0 ? (
                  <Zoom in timeout={1000}>
                    <Box sx={{ p: 8, textAlign: 'center' }}>
                      <NotificationsIcon 
                        sx={{ 
                          fontSize: 120, 
                          color: alpha(customTheme.primary, 0.3), 
                          mb: 3,
                          animation: `${float} 4s ease-in-out infinite`
                        }} 
                      />
                      <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                        No notifications yet
                      </Typography>
                      <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                        When you have new updates, they'll appear here
                      </Typography>
                    </Box>
                  </Zoom>
                ) : (
                  <Box>
                    {/* Unread Notifications */}
                    {unreadNotifications.length > 0 && (
                      <Box sx={{ p: 4, pb: 2 }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: customTheme.primary,
                            fontWeight: 700,
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <CircleIcon sx={{ color: customTheme.accent, fontSize: 20 }} />
                          New Notifications ({unreadNotifications.length})
                        </Typography>
                        <List sx={{ p: 0 }}>
                          {unreadNotifications.map((notification, index) => (
                            <Fade in timeout={800} style={{ transitionDelay: `${index * 100}ms` }} key={notification.id}>
                              <Box>
                                <ListItem 
                                  button
                                  alignItems="flex-start"
                                  onClick={() => handleNotificationClick(notification)}
                                  sx={{ 
                                    bgcolor: alpha(customTheme.accent, 0.08),
                                    borderRadius: 3,
                                    mb: 2,
                                    border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: alpha(customTheme.accent, 0.12),
                                      transform: 'translateX(5px)',
                                      boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.2)}`
                                    }
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: getNotificationTypeColor(notification.notification_type),
                                      mr: 3,
                                      mt: 0.5,
                                      width: 48,
                                      height: 48
                                    }}
                                  >
                                    {getNotificationIcon(notification.notification_type)}
                                  </Avatar>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: customTheme.primary }}>
                                          {notification.title}
                                        </Typography>
                                        <Chip 
                                          label={getReadableNotificationType(notification.notification_type)} 
                                          size="small"
                                          sx={{
                                            bgcolor: alpha(getNotificationTypeColor(notification.notification_type), 0.15),
                                            color: getNotificationTypeColor(notification.notification_type),
                                            fontWeight: 600,
                                            border: `1px solid ${alpha(getNotificationTypeColor(notification.notification_type), 0.3)}`
                                          }}
                                        />
                                        <Chip 
                                          label="New" 
                                          size="small" 
                                          sx={{
                                            bgcolor: alpha(customTheme.accent, 0.15),
                                            color: customTheme.accent,
                                            fontWeight: 700,
                                            border: `1px solid ${customTheme.accent}`,
                                            animation: `${pulse} 2s infinite`
                                          }}
                                        />
                                      </Box>
                                    }
                                    secondary={
                                      <>
                                        <Typography variant="body1" component="div" sx={{ mb: 2, color: customTheme.primary, fontWeight: 500 }}>
                                          {notification.message}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <TimeIcon sx={{ fontSize: 16, color: alpha(customTheme.primary, 0.6) }} />
                                          <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.6), fontWeight: 500 }}>
                                            {formatNotificationDate(notification.created_at)}
                                          </Typography>
                                        </Box>
                                      </>
                                    }
                                  />
                                </ListItem>
                              </Box>
                            </Fade>
                          ))}
                        </List>
                      </Box>
                    )}

                    {/* Read Notifications */}
                    {readNotifications.length > 0 && (
                      <Box sx={{ p: 4, pt: unreadNotifications.length > 0 ? 2 : 4 }}>
                        {unreadNotifications.length > 0 && (
                          <Divider sx={{ mb: 4, borderColor: alpha(customTheme.primary, 0.15), borderWidth: 1 }} />
                        )}
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: customTheme.primary,
                            fontWeight: 700,
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <DoneAllIcon sx={{ color: customTheme.success, fontSize: 24 }} />
                          Previous Notifications ({readNotifications.length})
                        </Typography>
                        <List sx={{ p: 0 }}>
                          {readNotifications.map((notification, index) => (
                            <Fade in timeout={800} style={{ transitionDelay: `${(index + unreadNotifications.length) * 50}ms` }} key={notification.id}>
                              <Box>
                                <ListItem 
                                  button
                                  alignItems="flex-start"
                                  onClick={() => handleNotificationClick(notification)}
                                  sx={{ 
                                    bgcolor: alpha(customTheme.grey, 0.3),
                                    borderRadius: 3,
                                    mb: 2,
                                    border: `1px solid ${alpha(customTheme.primary, 0.1)}`,
                                    opacity: 0.8,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: alpha(customTheme.grey, 0.4),
                                      opacity: 1,
                                      transform: 'translateX(3px)',
                                      boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.1)}`
                                    }
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: alpha(getNotificationTypeColor(notification.notification_type), 0.6),
                                      mr: 3,
                                      mt: 0.5,
                                      width: 40,
                                      height: 40
                                    }}
                                  >
                                    {getNotificationIcon(notification.notification_type)}
                                  </Avatar>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                                          {notification.title}
                                        </Typography>
                                        <Chip 
                                          label={getReadableNotificationType(notification.notification_type)} 
                                          size="small"
                                          sx={{
                                            bgcolor: alpha(getNotificationTypeColor(notification.notification_type), 0.1),
                                            color: alpha(getNotificationTypeColor(notification.notification_type), 0.8),
                                            fontWeight: 500,
                                            fontSize: '0.7rem'
                                          }}
                                        />
                                      </Box>
                                    }
                                    secondary={
                                      <>
                                        <Typography variant="body2" component="div" sx={{ mb: 1, color: alpha(customTheme.primary, 0.8) }}>
                                          {notification.message}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <TimeIcon sx={{ fontSize: 14, color: alpha(customTheme.primary, 0.5) }} />
                                          <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.5) }}>
                                            {formatNotificationDate(notification.created_at)}
                                          </Typography>
                                        </Box>
                                      </>
                                    }
                                  />
                                </ListItem>
                              </Box>
                            </Fade>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default NotificationsPage;