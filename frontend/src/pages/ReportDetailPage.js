import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportById, updateReportStatus, reset } from '../redux/slices/reportSlice';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardContent,
  Avatar,
  Fade,
  Slide,
  alpha,
} from '@mui/material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  ArrowBack as ArrowBackIcon,
  Pets as PetsIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  AssignmentInd as AssignmentIndIcon,
  Image as ImageIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

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

// Create a custom icon with inline SVG to avoid path issues
const customIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="#8d6e63" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { currentReport, isLoading, isError, message } = useSelector((state) => state.reports);
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [imageError, setImageError] = useState({});
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(fetchReportById(id));
    }
    
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch, id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return customTheme.accent;
      case 'ASSIGNED':
        return customTheme.secondary;
      case 'IN_PROGRESS':
        return customTheme.primary;
      case 'COMPLETED':
        return customTheme.success;
      case 'CANCELLED':
        return '#f44336';
      default:
        return customTheme.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <ScheduleIcon />;
      case 'ASSIGNED':
        return <AssignmentIndIcon />;
      case 'IN_PROGRESS':
        return <WarningIcon />;
      case 'COMPLETED':
        return <CheckCircleIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleStatusSubmit = () => {
    if (newStatus && currentReport) {
      dispatch(updateReportStatus({ id: currentReport.id, status: newStatus }));
      setStatusDialogOpen(false);
    }
  };

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
    console.error(`Error loading image at index ${index}`);
  };

  const canUpdateStatus = user && ['SHELTER', 'STAFF', 'AUTHORITY'].includes(user.user_type);

  if (isLoading || !currentReport) {
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
            Loading report details...
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
        <LocationOnIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(15deg)' }} />
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
        <PetsIcon sx={{ fontSize: 40, color: customTheme.accent, transform: 'rotate(-20deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
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
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <PetsIcon sx={{ fontSize: 40, color: customTheme.primary }} />
              Report #{currentReport.id}
            </Typography>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/reports')}
              variant="outlined"
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
              Back to Reports
            </Button>
          </Box>
        </Fade>

        {/* Error Alert */}
        {isError && (
          <Fade in timeout={600}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                backgroundColor: alpha('#f44336', 0.1),
                border: `1px solid ${alpha('#f44336', 0.3)}`
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {message}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Report Information Card */}
          <Grid item xs={12} md={8}>
            <Slide direction="right" in timeout={1000}>
              <Paper 
                sx={{ 
                  p: 4, 
                  mb: 4,
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                    Report Information
                  </Typography>
                  <Chip
                    icon={getStatusIcon(currentReport.status)}
                    label={currentReport.status}
                    sx={{
                      backgroundColor: getStatusColor(currentReport.status),
                      color: '#ffffff',
                      fontSize: '1rem',
                      height: 40,
                      px: 2,
                      fontWeight: 700,
                      '& .MuiChip-icon': { color: '#ffffff' },
                      animation: currentReport.status === 'PENDING' ? `${pulse} 2s infinite` : 'none'
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 3, backgroundColor: alpha(customTheme.primary, 0.2) }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 2 }}>
                      Animal Information
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1, color: customTheme.primary }}>
                        <strong>Type:</strong> {currentReport.animal_details?.animal_type === 'OTHER' 
                        ? (currentReport.animal_details?.other_animal_type || currentReport.other_animal_type || 'Other animal')
                        : (currentReport.animal_details?.animal_type || 'Not specified')}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1, color: customTheme.primary }}>
                        <strong>Gender:</strong> {currentReport.animal_details?.gender || 'Not specified'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1, color: customTheme.primary }}>
                        <strong>Color:</strong> {currentReport.animal_details?.color || 'Not specified'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1, color: customTheme.primary }}>
                        <strong>Condition:</strong> {currentReport.animal_condition || 'Not specified'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 2 }}>
                      Report Details
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1, color: customTheme.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 20, color: customTheme.secondary }} />
                        <strong>Reported by:</strong> {currentReport.reporter_details?.username || 'Anonymous'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1, color: customTheme.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 20, color: customTheme.accent }} />
                        <strong>Report Date:</strong> {formatDate(currentReport.created_at)}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1, color: customTheme.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 20, color: customTheme.primary }} />
                        <strong>Location:</strong> {currentReport.location_details || 'Not provided'}
                      </Typography>
                      {currentReport.assigned_to && (
                        <Typography variant="body1" sx={{ mb: 1, color: customTheme.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssignmentIndIcon sx={{ fontSize: 20, color: customTheme.success }} />
                          <strong>Assigned to:</strong> {currentReport.assigned_to_details?.username || 'Unknown'}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 2 }}>
                      Description
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                        border: `1px solid ${alpha(customTheme.primary, 0.2)}`
                      }}
                    >
                      <Typography variant="body1" sx={{ color: customTheme.primary, lineHeight: 1.6 }}>
                        {currentReport.description || 'No description provided'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Status Update Button */}
                {canUpdateStatus && (
                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      onClick={() => setStatusDialogOpen(true)}
                      sx={{
                        backgroundColor: customTheme.secondary,
                        fontWeight: 700,
                        py: 1.5,
                        px: 3,
                        borderRadius: 3,
                        '&:hover': {
                          backgroundColor: alpha(customTheme.secondary, 0.8),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Update Status
                    </Button>
                  </Box>
                )}

                {/* Rescue Notes */}
                {currentReport.rescue_notes && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 2 }}>
                      Rescue Notes
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                        border: `1px solid ${alpha(customTheme.success, 0.2)}`
                      }}
                    >
                      <Typography variant="body1" sx={{ color: customTheme.primary, lineHeight: 1.6 }}>
                        {currentReport.rescue_notes}
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Paper>
            </Slide>
          </Grid>

          {/* Status & Location Sidebar */}
          <Grid item xs={12} md={4}>
            <Slide direction="left" in timeout={1200}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Location Card */}
                <Paper 
                  sx={{ 
                    p: 3,
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: customTheme.secondary,
                        width: 48, 
                        height: 48
                      }}
                    >
                      <LocationOnIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                      Location
                    </Typography>
                  </Box>
                  {currentReport.location && (
                    <Box sx={{ height: '250px', width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                      <MapContainer
                        center={[currentReport.location.lat, currentReport.location.lng]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker 
                          position={[currentReport.location.lat, currentReport.location.lng]} 
                          icon={customIcon}
                        />
                      </MapContainer>
                    </Box>
                  )}
                </Paper>

                {/* Photos Card */}
                <Paper 
                  sx={{ 
                    p: 3,
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: customTheme.accent,
                        width: 48, 
                        height: 48
                      }}
                    >
                      <ImageIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                      Photos
                    </Typography>
                  </Box>
                  
                  {currentReport.photos && currentReport.photos.length > 0 ? (
                    <Grid container spacing={2}>
                      {currentReport.photos.map((photo, index) => {
                        // Fix the image URL if needed
                        let imageUrl = photo;
                        
                        if (photo.startsWith('reports/')) {
                          imageUrl = `/media/${photo}`;
                        } else if (photo.includes('/reports/') && !photo.includes('/media/')) {
                          const parts = photo.split('/reports/');
                          if (parts.length > 1) {
                            imageUrl = `/media/reports/${parts[1]}`;
                          }
                        }
                        
                        const absoluteImageUrl = `http://localhost:8000${imageUrl}`;
                        
                        return (
                          <Grid item xs={12} key={index}>
                            <Card 
                              sx={{ 
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                                }
                              }}
                            >
                              {!imageError[index] ? (
                                <CardMedia
                                  component="img"
                                  height="200"
                                  image={absoluteImageUrl}
                                  alt={`Animal photo ${index + 1}`}
                                  onError={() => handleImageError(index)}
                                  sx={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <Box 
                                  sx={{ 
                                    height: 200, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`
                                  }}
                                >
                                  <ImageIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.4) }} />
                                </Box>
                              )}
                              <CardContent sx={{ p: 2 }}>
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  fullWidth
                                  component="a"
                                  href={absoluteImageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    borderColor: customTheme.primary,
                                    color: customTheme.primary,
                                    '&:hover': {
                                      borderColor: customTheme.primary,
                                      backgroundColor: alpha(customTheme.primary, 0.05)
                                    }
                                  }}
                                >
                                  View Full Size
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Box sx={{ 
                      p: 4, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                      borderRadius: 2
                    }}>
                      <ImageIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.4), mb: 2 }} />
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 1 }}>
                        No photos available
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), textAlign: 'center' }}>
                        Photos help rescuers identify and locate the animal more effectively
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Slide>
          </Grid>
        </Grid>

        {/* Status Update Dialog */}
        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogContent sx={{ p: 4 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: customTheme.primary, 
                fontWeight: 700, 
                mb: 3,
                textAlign: 'center'
              }}
            >
              Update Report Status
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel 
                sx={{ 
                  color: customTheme.primary,
                  '&.Mui-focused': { color: customTheme.primary }
                }}
              >
                Status
              </InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={handleStatusChange}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(customTheme.primary, 0.3),
                    borderWidth: 2
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: customTheme.primary
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: customTheme.primary
                  }
                }}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                onClick={() => setStatusDialogOpen(false)}
                sx={{
                  color: customTheme.primary,
                  fontWeight: 600,
                  px: 3,
                  '&:hover': { backgroundColor: alpha(customTheme.primary, 0.05) }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleStatusSubmit}
                disabled={!newStatus}
                sx={{
                  backgroundColor: customTheme.primary,
                  fontWeight: 700,
                  px: 3,
                  '&:hover': {
                    backgroundColor: alpha(customTheme.primary, 0.8)
                  }
                }}
              >
                Update
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}

export default ReportDetailPage;