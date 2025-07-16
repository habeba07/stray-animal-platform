import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  LinearProgress,
  Badge,
  Paper,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Pause as PauseIcon,
  PlayArrow as ResumeIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
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

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`donations-tabpanel-${index}`}
      aria-labelledby={`donations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function MyDonationsPage() {
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [donations, setDonations] = useState([]);
  const [recurringDonations, setRecurringDonations] = useState([]);
  const [personalImpact, setPersonalImpact] = useState({});

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    recurring: null
  });

  // Receipt modal state
  const [receiptModal, setReceiptModal] = useState({
    open: false,
    donation: null,
    loading: false
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [donationsRes, recurringRes, impactRes] = await Promise.all([
        api.get('/donations/my_donations/'),
        api.get('/recurring-donations/my_subscriptions/'),
        api.get('/impact-dashboard/donor_impact/')
      ]);

      setDonations(donationsRes.data);
      setRecurringDonations(recurringRes.data);
      setPersonalImpact(impactRes.data);
    } catch (err) {
      setError('Failed to load donation data');
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRecurringAction = async (recurring, action) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = `/recurring-donations/${recurring.id}/${action}/`;
      await api.post(endpoint);
      
      setSuccess(`Recurring donation ${action}d successfully!`);
      await fetchAllData(); // Refresh data
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} recurring donation`);
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmDialog = (recurring, action) => {
    const actions = {
      pause: {
        title: 'Pause Recurring Donation',
        message: `Are you sure you want to pause your $${recurring.amount} ${recurring.frequency.toLowerCase()} donation? You can resume it anytime.`
      },
      resume: {
        title: 'Resume Recurring Donation',
        message: `Are you sure you want to resume your $${recurring.amount} ${recurring.frequency.toLowerCase()} donation? The next payment will be scheduled.`
      },
      cancel: {
        title: 'Cancel Recurring Donation',
        message: `Are you sure you want to permanently cancel your $${recurring.amount} ${recurring.frequency.toLowerCase()} donation? This action cannot be undone.`
      }
    };

    setConfirmDialog({
      open: true,
      title: actions[action].title,
      message: actions[action].message,
      action: action,
      recurring: recurring
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': customTheme.success,
      'PAUSED': customTheme.accent,
      'CANCELLED': '#ef5350',
      'EXPIRED': customTheme.grey
    };
    return colors[status] || customTheme.grey;
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      'WEEKLY': customTheme.primary,
      'MONTHLY': customTheme.success,
      'QUARTERLY': customTheme.accent,
      'ANNUALLY': customTheme.secondary
    };
    return colors[frequency] || customTheme.grey;
  };

  // Receipt modal functions
  const viewReceipt = async (donationId) => {
    try {
      setReceiptModal({ open: true, donation: null, loading: true });
      
      const response = await api.get(`/donations/${donationId}/`);
      const donation = response.data;
      
      setReceiptModal({ 
        open: true, 
        donation: donation, 
        loading: false 
      });
      
    } catch (err) {
      setError('Failed to load receipt');
      setReceiptModal({ open: false, donation: null, loading: false });
    }
  };

  const closeReceiptModal = () => {
    setReceiptModal({ open: false, donation: null, loading: false });
  };

  const printReceipt = () => {
    window.print();
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
          <MoneyIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
            Loading Your Generous Impact
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Gathering your donation history...
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
        <MoneyIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
            
              My Donations
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
              Your compassionate contributions making a difference in animal lives
            </Typography>
          </Box>
        </Fade>

        {/* Error and Success Alerts */}
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

        {success && (
          <Fade in timeout={800}>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                backgroundColor: alpha(customTheme.success, 0.1),
                border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                }
              }}
              onClose={() => setSuccess('')}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {success}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Personal Impact Summary */}
        {personalImpact.personal_stats && (
          <Slide direction="up" in timeout={1200}>
            <Card sx={{ 
              mb: 4, 
              background: `linear-gradient(135deg, ${customTheme.primary} 0%, ${alpha(customTheme.primary, 0.8)} 50%, ${customTheme.accent} 100%)`,
              color: 'white',
              borderRadius: 6,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.3)}`,
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
            }}>
              <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                <Typography variant="h4" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  fontWeight: 800,
                  mb: 4
                }}>
                  <TrendingUpIcon sx={{ fontSize: '1.2em' }} />
                  Your Incredible Impact
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center" sx={{
                      p: 3,
                      borderRadius: 4,
                      background: alpha('#ffffff', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}>
                      <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                        {formatCurrency(personalImpact.personal_stats.total_donated)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Total Donated</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center" sx={{
                      p: 3,
                      borderRadius: 4,
                      background: alpha('#ffffff', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}>
                      <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                        {personalImpact.personal_stats.animals_helped}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Animals Helped</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center" sx={{
                      p: 3,
                      borderRadius: 4,
                      background: alpha('#ffffff', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}>
                      <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                        {personalImpact.personal_stats.donations_count}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Donations Made</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box textAlign="center" sx={{
                      p: 3,
                      borderRadius: 4,
                      background: alpha('#ffffff', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}>
                      <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                        {personalImpact.personal_stats.donor_level}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Donor Level</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>
        )}

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
            aria-label="donation tabs"
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
            <Tab 
              label={
                <Badge badgeContent={donations.length} color="primary" sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: customTheme.accent,
                    color: '#ffffff',
                    fontWeight: 700
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon />
                    Donation History
                  </Box>
                </Badge>
              } 
            />
            <Tab 
              label={
                <Badge badgeContent={recurringDonations.length} color="secondary" sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: customTheme.secondary,
                    color: '#ffffff',
                    fontWeight: 700
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon />
                    Recurring Donations
                  </Box>
                </Badge>
              }
            />
          </Tabs>
        </Paper>

        {/* Donation History Tab */}
        <TabPanel value={tabValue} index={0}>
          {donations.length === 0 ? (
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
                    <ReceiptIcon 
                      sx={{ 
                        fontSize: 120, 
                        color: alpha(customTheme.primary, 0.3), 
                        mb: 3,
                        animation: `${float} 4s ease-in-out infinite`
                      }} 
                    />
                    <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                      No donation history yet
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto', mb: 4 }}>
                      Your donation history will appear here after you make your first donation.
                    </Typography>
                    <Button 
                      variant="contained" 
                      href="/donations"
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
                      Make Your First Donation
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          ) : (
            <Grid container spacing={3}>
              {donations.map((donation, index) => (
                <Grid item xs={12} key={donation.id}>
                  <Fade in timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Card sx={{
                      borderRadius: 5,
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.01)',
                        boxShadow: `
                          0 20px 40px ${alpha(customTheme.primary, 0.2)},
                          0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                          inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                        `,
                        border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: customTheme.primary, mb: 1 }}>
                              {formatCurrency(donation.amount)}
                            </Typography>
                            <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), mb: 1, fontWeight: 600 }}>
                              {donation.campaign_details?.title || 'General Fund'}
                            </Typography>
                            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.6), fontWeight: 500 }}>
                              {formatDate(donation.created_at)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Chip 
                              label={donation.get_payment_method_display || donation.payment_method}
                              sx={{
                                backgroundColor: alpha(customTheme.secondary, 0.2),
                                color: customTheme.secondary,
                                fontWeight: 600,
                                border: `1px solid ${alpha(customTheme.secondary, 0.3)}`
                              }}
                            />
                            <IconButton 
                              size="large" 
                              onClick={() => viewReceipt(donation.id)}
                              sx={{
                                backgroundColor: alpha(customTheme.primary, 0.1),
                                color: customTheme.primary,
                                border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: customTheme.primary,
                                  color: '#ffffff',
                                  transform: 'scale(1.1)',
                                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                                }
                              }}
                            >
                              <ReceiptIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        {donation.message && (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              mb: 3,
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.6)} 100%)`,
                              border: `1px solid ${alpha(customTheme.primary, 0.1)}`
                            }}
                          >
                            <Typography variant="body1" sx={{ fontStyle: 'italic', color: alpha(customTheme.primary, 0.8), fontWeight: 500 }}>
                              "{donation.message}"
                            </Typography>
                          </Paper>
                        )}
                        
                        <Divider sx={{ my: 2, backgroundColor: alpha(customTheme.primary, 0.15), height: 1 }} />
                        
                        <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.6), fontFamily: 'monospace', fontWeight: 600 }}>
                          Transaction ID: {donation.transaction_id}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Recurring Donations Tab */}
        <TabPanel value={tabValue} index={1}>
          {recurringDonations.length === 0 ? (
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
                    <CalendarIcon 
                      sx={{ 
                        fontSize: 120, 
                        color: alpha(customTheme.primary, 0.3), 
                        mb: 3,
                        animation: `${float} 4s ease-in-out infinite`
                      }} 
                    />
                    <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                      No recurring donations set up
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 500, mx: 'auto', mb: 4 }}>
                      Set up a recurring donation to provide ongoing support for animals in need.
                    </Typography>
                    <Button 
                      variant="contained" 
                      href="/donations"
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
                      Set Up Recurring Donation
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          ) : (
            <Grid container spacing={3}>
              {recurringDonations.map((recurring, index) => (
                <Grid item xs={12} md={6} key={recurring.id}>
                  <Fade in timeout={800} style={{ transitionDelay: `${index * 100}ms` }}>
                    <Card sx={{
                      height: '100%',
                      borderRadius: 5,
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `
                          0 20px 40px ${alpha(customTheme.primary, 0.2)},
                          0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                          inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                        `,
                        border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                      }
                    }}>
                      <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h4" sx={{ fontWeight: 800, color: customTheme.primary }}>
                                {formatCurrency(recurring.amount)}
                              </Typography>
                              <Chip 
                                label={recurring.frequency}
                                sx={{
                                  backgroundColor: getFrequencyColor(recurring.frequency),
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  fontSize: '0.9rem'
                                }}
                              />
                            </Box>
                            <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                              {recurring.campaign_details?.title || 'General Fund'}
                            </Typography>
                          </Box>
                          <Chip 
                            label={recurring.status}
                            sx={{
                              backgroundColor: alpha(getStatusColor(recurring.status), 0.15),
                              color: getStatusColor(recurring.status),
                              fontWeight: 700,
                              border: `1px solid ${alpha(getStatusColor(recurring.status), 0.3)}`
                            }}
                          />
                        </Box>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.5)} 100%)`,
                            border: `1px solid ${alpha(customTheme.primary, 0.1)}`
                          }}
                        >
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 1, fontWeight: 600 }}>
                            <strong>Next Payment:</strong> {formatDate(recurring.next_payment_date)}
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 1, fontWeight: 600 }}>
                            <strong>Total Donated:</strong> {formatCurrency(recurring.total_donated)}
                          </Typography>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                            <strong>Payments Made:</strong> {recurring.successful_payments}
                          </Typography>
                        </Paper>

                        {recurring.message && (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              mb: 3,
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                              border: `1px solid ${alpha(customTheme.secondary, 0.2)}`
                            }}
                          >
                            <Typography variant="body1" sx={{ fontStyle: 'italic', color: alpha(customTheme.primary, 0.8), fontWeight: 500 }}>
                              "{recurring.message}"
                            </Typography>
                          </Paper>
                        )}

                        <Box sx={{ mt: 'auto' }}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {recurring.status === 'ACTIVE' && (
                              <Button
                                size="large"
                                startIcon={<PauseIcon />}
                                onClick={() => openConfirmDialog(recurring, 'pause')}
                                disabled={actionLoading}
                                sx={{
                                  backgroundColor: alpha(customTheme.accent, 0.1),
                                  color: customTheme.accent,
                                  border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
                                  fontWeight: 700,
                                  borderRadius: 3,
                                  textTransform: 'none',
                                  '&:hover': {
                                    backgroundColor: customTheme.accent,
                                    color: '#ffffff',
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.3)}`
                                  }
                                }}
                              >
                                Pause
                              </Button>
                            )}
                            
                            {recurring.status === 'PAUSED' && (
                              <Button
                                size="large"
                                startIcon={<ResumeIcon />}
                                onClick={() => openConfirmDialog(recurring, 'resume')}
                                disabled={actionLoading}
                                sx={{
                                  backgroundColor: alpha(customTheme.success, 0.1),
                                  color: customTheme.success,
                                  border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                                  fontWeight: 700,
                                  borderRadius: 3,
                                  textTransform: 'none',
                                  '&:hover': {
                                    backgroundColor: customTheme.success,
                                    color: '#ffffff',
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.3)}`
                                  }
                                }}
                              >
                                Resume
                              </Button>
                            )}
                            
                            {(recurring.status === 'ACTIVE' || recurring.status === 'PAUSED') && (
                              <Button
                                size="large"
                                startIcon={<CancelIcon />}
                                onClick={() => openConfirmDialog(recurring, 'cancel')}
                                disabled={actionLoading}
                                sx={{
                                  backgroundColor: alpha('#ef5350', 0.1),
                                  color: '#ef5350',
                                  border: `2px solid ${alpha('#ef5350', 0.3)}`,
                                  fontWeight: 700,
                                  borderRadius: 3,
                                  textTransform: 'none',
                                  '&:hover': {
                                    backgroundColor: '#ef5350',
                                    color: '#ffffff',
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 25px ${alpha('#ef5350', 0.3)}`
                                  }
                                }}
                              >
                                Cancel
                              </Button>
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
        </TabPanel>

        {/* Enhanced Receipt Modal */}
        <Dialog
          open={receiptModal.open}
          onClose={closeReceiptModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              minHeight: '80vh',
              borderRadius: 4,
              background: '#ffffff',
              border: `3px solid ${customTheme.primary}`,
              boxShadow: `0 24px 48px ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
            color: '#ffffff',
            py: 3
          }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Donation Receipt</Typography>
            <Box>
              <IconButton 
                onClick={printReceipt} 
                sx={{ 
                  mr: 1,
                  color: '#ffffff',
                  '&:hover': { backgroundColor: alpha('#ffffff', 0.1) }
                }}
              >
                <PrintIcon />
              </IconButton>
              <IconButton 
                onClick={closeReceiptModal}
                sx={{ 
                  color: '#ffffff',
                  '&:hover': { backgroundColor: alpha('#ffffff', 0.1) }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4, backgroundColor: '#ffffff' }}>
            {receiptModal.loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress 
                    size={60} 
                    sx={{ 
                      color: customTheme.primary,
                      mb: 2
                    }}
                  />
                  <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                    Loading receipt...
                  </Typography>
                </Box>
              </Box>
            ) : receiptModal.donation ? (
              <Box>
                {/* Receipt Header */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                  <Typography variant="h2" sx={{ 
                    color: customTheme.primary, 
                    fontWeight: 800,
                    mb: 1
                  }}>
                    PAW Rescue
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: alpha(customTheme.primary, 0.7),
                    fontWeight: 600
                  }}>
                    Official Donation Receipt
                  </Typography>
                </Box>
                
                {/* Thank You Section */}
                <Box sx={{ 
                  background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                  color: '#ffffff',
                  p: 4, 
                  borderRadius: 4, 
                  mb: 4,
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                    Thank You for Your Generous Donation!
                  </Typography>
                  <Typography variant="h6">
                    Your support helps save animal lives every day
                  </Typography>
                </Box>
                
                {/* Receipt Details */}
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: alpha(customTheme.grey, 0.15),
                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                    mb: 4
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        Donation Amount:
                      </Typography>
                      <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                        {formatCurrency(receiptModal.donation.amount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        Date:
                      </Typography>
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        {formatDate(receiptModal.donation.created_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        Campaign:
                      </Typography>
                      <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        {receiptModal.donation.campaign_details?.title || 'General Fund'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        Transaction ID:
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', color: customTheme.primary, fontWeight: 600 }}>
                        {receiptModal.donation.transaction_id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        Payment Method:
                      </Typography>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        {receiptModal.donation.payment_method}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        Donor:
                      </Typography>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                        {receiptModal.donation.is_anonymous ? 'Anonymous' : receiptModal.donation.donor_name}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
                
                {/* Message Section */}
                {receiptModal.donation.message && (
                  <Paper
                    elevation={1}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: alpha(customTheme.secondary, 0.08),
                      border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                      mb: 4
                    }}
                  >
                    <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600, mb: 1 }}>
                      Your Message:
                    </Typography>
                    <Typography variant="h6" sx={{ fontStyle: 'italic', color: customTheme.primary, fontWeight: 500 }}>
                      "{receiptModal.donation.message}"
                    </Typography>
                  </Paper>
                )}
                
                {/* Footer */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `2px dashed ${alpha(customTheme.primary, 0.3)}`,
                    background: alpha(customTheme.grey, 0.2)
                  }}
                >
                  <Typography variant="body1" sx={{ color: customTheme.primary, mb: 2, fontWeight: 500 }}>
                    This receipt serves as confirmation of your donation for tax purposes. 
                    PAW Rescue is a registered non-profit organization. Please keep this 
                    receipt for your records.
                  </Typography>
                  <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                    Questions? Contact us at support@pawrescue.com
                  </Typography>
                </Paper>
              </Box>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Enhanced Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: '#ffffff',
              border: `3px solid ${customTheme.primary}`,
              boxShadow: `0 24px 48px ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.5rem'
          }}>
            {confirmDialog.title}
          </DialogTitle>
          <DialogContent sx={{ p: 4, backgroundColor: '#ffffff' }}>
            <DialogContentText sx={{ 
              color: customTheme.primary, 
              fontSize: '1.1rem',
              fontWeight: 500
            }}>
              {confirmDialog.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2, backgroundColor: '#ffffff', borderTop: `1px solid ${alpha(customTheme.primary, 0.1)}` }}>
            <Button 
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              disabled={actionLoading}
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
              onClick={() => handleRecurringAction(confirmDialog.recurring, confirmDialog.action)}
              disabled={actionLoading}
              size="large"
              startIcon={actionLoading && <CircularProgress size={16} />}
              sx={{
                backgroundColor: confirmDialog.action === 'cancel' ? '#ef5350' : customTheme.primary,
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                border: 'none',
                '&:hover': {
                  backgroundColor: confirmDialog.action === 'cancel' ? alpha('#ef5350', 0.8) : alpha(customTheme.primary, 0.8),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(confirmDialog.action === 'cancel' ? '#ef5350' : customTheme.primary, 0.3)}`
                }
              }}
            >
              {confirmDialog.action === 'cancel' ? 'Permanently Cancel' : 
               confirmDialog.action === 'pause' ? 'Pause' : 'Resume'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default MyDonationsPage;