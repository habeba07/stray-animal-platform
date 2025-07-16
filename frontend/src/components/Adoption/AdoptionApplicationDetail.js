import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Fade,
  Slide,
  alpha,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Person as PersonIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Visibility as ReviewIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Family as FamilyIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
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
  50% { transform: translateY(-15px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

function AdoptionApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchApplicationDetail();
  }, [id, user, navigate]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/adoption-applications/${id}/`);
      setApplication(response.data);
    } catch (err) {
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return customTheme.accent;
      case 'UNDER_REVIEW':
        return customTheme.secondary;
      case 'APPROVED':
        return customTheme.success;
      case 'REJECTED':
        return '#f44336';
      case 'WITHDRAWN':
        return '#9e9e9e';
      default:
        return customTheme.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <PendingIcon />;
      case 'UNDER_REVIEW':
        return <ReviewIcon />;
      case 'APPROVED':
        return <ApprovedIcon />;
      case 'REJECTED':
        return <RejectedIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.patch(`/adoption-applications/${id}/`, { status: newStatus });
      fetchApplicationDetail(); // Refresh data
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
            linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
          `,
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ color: customTheme.primary, mb: 2 }}
          />
          <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 500 }}>
            Loading application details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
            linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
          `,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)',
            fontSize: '1.1rem'
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!application) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
            linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
          `,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)',
            fontSize: '1.1rem'
          }}
        >
          Application not found
        </Alert>
      </Box>
    );
  }

  const isStaff = user && (user.user_type === 'STAFF' || user.user_type === 'SHELTER' || user.is_staff);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '8%',
          right: '5%',
          animation: `${float} 8s ease-in-out infinite`,
          opacity: 0.3,
          zIndex: 0
        }}
      >
        <PetsIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(15deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '3%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.3,
          zIndex: 0
        }}
      >
        <FavoriteIcon sx={{ fontSize: 35, color: customTheme.accent, transform: 'rotate(-20deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Header with Back Button */}
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Application #{application.id}
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/adoption/applications')}
              sx={{
                borderColor: customTheme.primary,
                color: customTheme.primary,
                borderWidth: 2,
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: customTheme.primary,
                  backgroundColor: alpha(customTheme.primary, 0.05),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                },
                transition: 'all 0.3s ease'
              }}
            >
              Back to Applications
            </Button>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {/* Animal Information Card */}
          <Grid item xs={12} md={6}>
            <Slide direction="right" in timeout={1000}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.15)}`
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: customTheme.primary, 
                        width: 56, 
                        height: 56,
                        boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.3)}`
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                      Animal Information
                    </Typography>
                  </Box>
                  
                  {application.animal_details?.photos && application.animal_details.photos.length > 0 ? (
                    <Box
                      component="img"
                      sx={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: 3,
                        mb: 3,
                        border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.02)' }
                      }}
                      src={`http://localhost:8000${application.animal_details.photos[0]}`}
                      alt={application.animal_details.name}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(customTheme.grey, 0.3),
                        borderRadius: 3,
                        mb: 3,
                        border: `2px solid ${alpha(customTheme.primary, 0.2)}`
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.4) }} />
                    </Box>
                  )}

                  <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                    {application.animal_details?.name || 'Unnamed'}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                          border: `1px solid ${alpha(customTheme.secondary, 0.2)}`
                        }}
                      >
                        <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                          Type
                        </Typography>
                        <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                          {application.animal_details?.animal_type || 'Unknown'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                          border: `1px solid ${alpha(customTheme.accent, 0.2)}`
                        }}
                      >
                        <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                          Breed
                        </Typography>
                        <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                          {application.animal_details?.breed || 'Unknown'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                          border: `1px solid ${alpha(customTheme.success, 0.2)}`
                        }}
                      >
                        <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                          Age
                        </Typography>
                        <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                          {application.animal_details?.age || 'Unknown'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                          border: `1px solid ${alpha(customTheme.primary, 0.2)}`
                        }}
                      >
                        <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                          Gender
                        </Typography>
                        <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                          {application.animal_details?.gender || 'Unknown'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Application Status & Info Card */}
          <Grid item xs={12} md={6}>
            <Slide direction="left" in timeout={1200}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.secondary, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 20px 40px ${alpha(customTheme.secondary, 0.15)}`
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: customTheme.secondary,
                        width: 56, 
                        height: 56,
                        boxShadow: `0 4px 15px ${alpha(customTheme.secondary, 0.3)}`
                      }}
                    >
                      {getStatusIcon(application.status)}
                    </Avatar>
                    <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                      Application Status
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Chip
                      label={application.status}
                      icon={getStatusIcon(application.status)}
                      sx={{
                        backgroundColor: getStatusColor(application.status),
                        color: '#ffffff',
                        fontSize: '1.1rem',
                        height: 45,
                        px: 2,
                        mb: 2,
                        fontWeight: 700,
                        '& .MuiChip-icon': { color: '#ffffff' },
                        animation: application.status === 'PENDING' ? `${pulse} 2s infinite` : 'none'
                      }}
                    />
                    <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 500 }}>
                      Submitted: {formatDate(application.created_at)}
                    </Typography>
                    {application.updated_at && application.updated_at !== application.created_at && (
                      <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 500 }}>
                        Last Updated: {formatDate(application.updated_at)}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 3, backgroundColor: alpha(customTheme.primary, 0.2) }} />

                  {/* Compatibility Score */}
                  {application.compatibility_score && (
                    <Box sx={{ mb: 3 }}>
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                          border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                          textAlign: 'center'
                        }}
                      >
                        <StarIcon sx={{ color: customTheme.success, fontSize: 32, mb: 1 }} />
                        <Typography variant="h4" sx={{ color: customTheme.success, fontWeight: 800, mb: 1 }}>
                          {Math.round(application.compatibility_score)}%
                        </Typography>
                        <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                          Compatibility Score
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Contact Information */}
                  <Grid container spacing={2}>
                    {application.applicant_details && (
                      <Grid item xs={12}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                            border: `1px solid ${alpha(customTheme.primary, 0.2)}`
                          }}
                        >
                          <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                            Applicant
                          </Typography>
                          <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                            {`${application.applicant_details.first_name} ${application.applicant_details.last_name}`}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}

                    {application.phone && (
                      <Grid item xs={12}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                            border: `1px solid ${alpha(customTheme.accent, 0.2)}`
                          }}
                        >
                          <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                            Phone
                          </Typography>
                          <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                            {application.phone}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}

                    {application.email && (
                      <Grid item xs={12}>
                        <Paper 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                            border: `1px solid ${alpha(customTheme.secondary, 0.2)}`
                          }}
                        >
                          <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                            Email
                          </Typography>
                          <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                            {application.email}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  {/* Status Update Buttons for Staff */}
                  {isStaff && application.status === 'PENDING' && (
                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleUpdateStatus('APPROVED')}
                        sx={{
                          backgroundColor: customTheme.success,
                          fontWeight: 700,
                          py: 1.5,
                          borderRadius: 3,
                          '&:hover': {
                            backgroundColor: alpha(customTheme.success, 0.8),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleUpdateStatus('REJECTED')}
                        sx={{
                          backgroundColor: '#f44336',
                          fontWeight: 700,
                          py: 1.5,
                          borderRadius: 3,
                          '&:hover': {
                            backgroundColor: alpha('#f44336', 0.8),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha('#f44336', 0.4)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                        sx={{
                          borderColor: customTheme.secondary,
                          color: customTheme.secondary,
                          borderWidth: 2,
                          fontWeight: 700,
                          py: 1.5,
                          borderRadius: 3,
                          '&:hover': {
                            borderColor: customTheme.secondary,
                            backgroundColor: alpha(customTheme.secondary, 0.05),
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Under Review
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Slide>
          </Grid>

          {/* Application Details Card */}
          <Grid item xs={12}>
            <Fade in timeout={1500}>
              <Card
                sx={{
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.accent, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 20px 40px ${alpha(customTheme.accent, 0.15)}`
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700, mb: 4 }}>
                    Application Details
                  </Typography>
                  {application.why_adopt && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 2 }}>
                        Why do you want to adopt this animal?
                      </Typography>
                      <Paper 
                        sx={{ 
                          p: 3, 
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                          border: `1px solid ${alpha(customTheme.primary, 0.2)}`,
                          minHeight: 60 
                        }}
                      >
                        <Typography variant="body1" sx={{ color: customTheme.primary, lineHeight: 1.6 }}>
                          {application.why_adopt || 'No information provided'}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  <Grid container spacing={3}>
                    {[
                      { label: 'Housing Type', value: application.housing_type, icon: <HomeIcon /> },
                      { label: 'Previous Adoption Details', value: application.previous_adoption_details, icon: <PetsIcon /> },
                      { label: 'Veterinarian Information', value: application.veterinarian_info, icon: <PersonIcon /> },
                      { label: 'Personal Reference', value: application.personal_reference, icon: <PersonIcon /> },
                      { label: 'Experience Level', value: application.experience_level, icon: <StarIcon /> },

                    ].filter(item => item.value).map((item, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.08)} 0%, ${alpha(customTheme.background, 0.4)} 100%)`,
                            border: `1px solid ${alpha(customTheme.secondary, 0.2)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.2)}`
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ color: customTheme.secondary, mr: 1 }}>
                              {item.icon}
                            </Box>
                            <Typography variant="subtitle1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                              {item.label}
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8) }}>
                            {item.value}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Agreements Section */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 3 }}>
                      Agreements
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Agrees to home visit', value: application.agree_home_visit },
                        { label: 'Agrees to follow-up visits', value: application.agree_follow_up }
                      ].map((agreement, index) => (
                        agreement.value !== null && (
                          <Grid item xs={12} sm={6} key={index}>
                            <Paper
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                background: agreement.value ? 
                                  `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.background, 0.4)} 100%)` :
                                  `linear-gradient(135deg, ${alpha('#f44336', 0.1)} 0%, ${alpha(customTheme.background, 0.4)} 100%)`,
                                border: `1px solid ${agreement.value ? alpha(customTheme.success, 0.3) : alpha('#f44336', 0.3)}`
                              }}
                            >
                              <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 500 }}>
                                {agreement.label}: <strong>{agreement.value ? 'Yes' : 'No'}</strong>
                              </Typography>
                            </Paper>
                          </Grid>
                        )
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default AdoptionApplicationDetail;