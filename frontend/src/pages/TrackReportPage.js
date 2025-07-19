import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  CircularProgress,
  Grid,
  Divider,
  Avatar,
  Paper,
  Fade,
  Zoom,
  Slide,
  LinearProgress,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Search as SearchIcon,
  Report as ReportIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import api from '../redux/api';

const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  grey: '#f3e5ab',
  accent: '#ff8a65',
  background: '#fff8e1',
};

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
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

function TrackReportPage() {
  const [trackingId, setTrackingId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper functions
  const getAnimalTypeDisplay = (report) => {
    const animalType = report.animal_type || 
                       report.animal_details?.animal_type || 
                       'Not specified';
    
    if (animalType === 'OTHER') {
      const customType = report.other_animal_type || 
                         report.animal_details?.other_animal_type;
      return customType ? `Other (${customType})` : 'Other animal';
    }
    
    if (animalType === 'DOG') return 'Dog';
    if (animalType === 'CAT') return 'Cat';
    
    return animalType;
  };

  const getLocationDisplay = (report) => {
    if (report.location_details) {
      return report.location_details;
    }
    
    if (report.latitude && report.longitude) {
      return `${parseFloat(report.latitude).toFixed(4)}, ${parseFloat(report.longitude).toFixed(4)}`;
    }
    
    return 'Location not provided';
  };

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await api.get(`/reports/track/${trackingId.trim()}/`);
      setReport(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Report not found. Please check your tracking ID.');
      } else {
        setError('Unable to track report. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <PendingIcon sx={{ color: '#ff9800' }} />;
      case 'ASSIGNED':
        return <AssignmentIcon sx={{ color: '#2196f3' }} />;
      case 'IN_PROGRESS':
        return <AssignmentIcon sx={{ color: '#3f51b5' }} />;
      case 'COMPLETED':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'CANCELLED':
        return <CancelIcon sx={{ color: '#f44336' }} />;
      default:
        return <ReportIcon sx={{ color: '#757575' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'PENDING': return 25;
      case 'ASSIGNED': return 50;
      case 'IN_PROGRESS': return 75;
      case 'COMPLETED': return 100;
      default: return 0;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.3)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.3)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.4)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.5)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
      py: 4
    }}>
      {/* Floating Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.1)}, ${alpha(customTheme.accent, 0.1)})`,
          animation: `${float} 6s ease-in-out infinite`,
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${alpha(customTheme.secondary, 0.15)}, ${alpha(customTheme.success, 0.1)})`,
          animation: `${float} 8s ease-in-out infinite 2s`,
          zIndex: 0
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Slide direction="down" in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                color: customTheme.primary,
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                animation: `${pulse} 3s ease-in-out infinite`
              }}
            >
              🔍 Track Your Report
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8), 
                fontWeight: 500,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.4
              }}
            >
              Enter your tracking ID to get real-time updates on your animal report status
            </Typography>
          </Box>
        </Slide>

        {/* Search Form */}
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: 4,
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.9) 0%, 
                rgba(255, 255, 255, 0.7) 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(customTheme.primary, 0.1)}`,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Shimmer effect */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, 
                  transparent, 
                  ${customTheme.accent}, 
                  transparent)`,
                animation: `${shimmer} 2s infinite`
              }}
            />
            
            <CardContent sx={{ p: 5 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Enter Tracking ID or Report Number"
                    placeholder="e.g., PWR-2025-001 or #123"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '1.1rem',
                        '& fieldset': {
                          borderColor: alpha(customTheme.primary, 0.3),
                          borderWidth: 2
                        },
                        '&:hover fieldset': {
                          borderColor: customTheme.primary
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: customTheme.secondary
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: customTheme.primary,
                        fontWeight: 600,
                        '&.Mui-focused': {
                          color: customTheme.secondary
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleTrack}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${customTheme.primary} 0%, ${customTheme.secondary} 100%)`,
                      boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${customTheme.secondary} 0%, ${customTheme.success} 100%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Searching...' : 'Track Report'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Paper>
        </Fade>

        {/* Error Message */}
        {error && (
          <Slide direction="up" in timeout={600}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                fontSize: '1.1rem',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              {error}
            </Alert>
          </Slide>
        )}

        {/* Report Results */}
        {report && (
          <Zoom in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.95) 0%, 
                  rgba(255, 255, 255, 0.85) 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(customTheme.success, 0.2)}`,
                position: 'relative'
              }}
            >
              {/* Header with Status */}
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${customTheme.primary} 0%, ${customTheme.secondary} 100%)`,
                  color: 'white',
                  p: 4,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 10px,
                      rgba(255, 255, 255, 0.05) 10px,
                      rgba(255, 255, 255, 0.05) 20px
                    )`,
                    animation: `${gradientShift} 4s linear infinite`
                  }}
                />
                
                <Grid container alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                  <Grid item>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 80, 
                      height: 80,
                      border: '3px solid rgba(255,255,255,0.3)'
                    }}>
                      <ReportIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      Report #{report.id}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                      Tracking ID: {report.tracking_id || `PWR-${report.id.toString().padStart(4, '0')}`}
                    </Typography>
                    <Chip
                      label={report.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(report.status)}
                      size="large"
                      icon={getStatusIcon(report.status)}
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '1rem',
                        px: 2,
                        py: 1,
                        height: 'auto'
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Progress Bar */}
                <Box sx={{ mt: 3, position: 'relative', zIndex: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                    Progress: {getStatusProgress(report.status)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getStatusProgress(report.status)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              </Box>

              <CardContent sx={{ p: 5 }}>
                {/* Animal Details */}
                <Grid container spacing={4} sx={{ mb: 5 }}>
                  <Grid item xs={12}>
                    <Typography variant="h5" sx={{ 
                      color: customTheme.primary, 
                      fontWeight: 700, 
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <PetsIcon sx={{ fontSize: '1.2em' }} />
                      Animal Information
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.accent, 0.1)} 100%)`,
                      border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                      borderRadius: 3,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 10px 25px ${alpha(customTheme.primary, 0.2)}`
                      }
                    }}>
                      <PetsIcon sx={{ fontSize: 48, color: customTheme.primary, mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: customTheme.primary }}>
                        Animal Type
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: customTheme.primary }}>
                        {getAnimalTypeDisplay(report)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.success, 0.1)} 100%)`,
                      border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                      borderRadius: 3,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 10px 25px ${alpha(customTheme.secondary, 0.2)}`
                      }
                    }}>
                      <CalendarIcon sx={{ fontSize: 48, color: customTheme.secondary, mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: customTheme.secondary }}>
                        Reported On
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.secondary }}>
                        {formatDate(report.created_at)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={12} md={4}>
                    <Paper sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.grey, 0.2)} 100%)`,
                      border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                      borderRadius: 3,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 10px 25px ${alpha(customTheme.accent, 0.2)}`
                      }
                    }}>
                      <LocationIcon sx={{ fontSize: 48, color: customTheme.accent, mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: customTheme.accent }}>
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.accent }}>
                        {getLocationDisplay(report)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Description */}
                {report.description && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ color: customTheme.primary, mb: 2, fontWeight: 600 }}>
                      📝 Description
                    </Typography>
                    <Paper sx={{ 
                      p: 3, 
                      backgroundColor: alpha(customTheme.grey, 0.3),
                      borderLeft: `4px solid ${customTheme.primary}`,
                      borderRadius: 2
                    }}>
                      <Typography variant="body1" sx={{ lineHeight: 1.7, color: customTheme.primary }}>
                        {report.description}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {/* Contact Support */}
                <Paper sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.secondary, 0.1)} 100%)`,
                  border: `1px solid ${alpha(customTheme.success, 0.2)}`
                }}>
                  <Typography variant="h6" sx={{ color: customTheme.success, mb: 2, fontWeight: 700 }}>
                    📞 Need Help?
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    • Reports are typically reviewed within 2-4 hours<br/>
                    • You'll receive updates via email if you provided one<br/>
                    • For urgent cases, call our emergency hotline<br/>
                    • Keep your tracking ID for future reference
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<PhoneIcon />}
                        sx={{
                          borderColor: customTheme.success,
                          color: customTheme.success,
                          fontWeight: 600,
                          py: 1.5,
                          '&:hover': {
                            borderColor: customTheme.success,
                            backgroundColor: alpha(customTheme.success, 0.1),
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Emergency: 1-800-RESCUE
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<EmailIcon />}
                        sx={{
                          borderColor: customTheme.secondary,
                          color: customTheme.secondary,
                          fontWeight: 600,
                          py: 1.5,
                          '&:hover': {
                            borderColor: customTheme.secondary,
                            backgroundColor: alpha(customTheme.secondary, 0.1),
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Contact Support
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </CardContent>
            </Paper>
          </Zoom>
        )}
      </Container>
    </Box>
  );
}

export default TrackReportPage;