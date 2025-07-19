import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Box,
  Divider,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  Chip,
  Grid,
  Avatar,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Favorite as FavoriteIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
  Repeat as RepeatIcon,
  Send as SendIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  AccountBalance as BankIcon,
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

function DonationForm() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [donationType, setDonationType] = useState('one-time'); // 'one-time' or 'recurring'
  
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'CREDIT_CARD',
    is_anonymous: false,
    message: '',
    // Recurring donation fields
    frequency: 'MONTHLY',
    end_date: null,
  });

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/donation-campaigns/${campaignId}/`);
      setCampaign(response.data);
    } catch (err) {
      setError('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      end_date: date
    }));
  };

  const calculateImpact = () => {
    const amount = parseFloat(formData.amount) || 0;
    if (donationType === 'recurring') {
      const multipliers = {
        'WEEKLY': 52,
        'MONTHLY': 12,
        'QUARTERLY': 4,
        'ANNUALLY': 1
      };
      return amount * multipliers[formData.frequency];
    }
    return amount;
  };

  const getFrequencyDisplay = () => {
    const frequencies = {
      'WEEKLY': 'week',
      'MONTHLY': 'month', 
      'QUARTERLY': '3 months',
      'ANNUALLY': 'year'
    };
    return frequencies[formData.frequency];
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'CREDIT_CARD': <CreditCardIcon />,
      'DEBIT_CARD': <CreditCardIcon />,
      'PAYPAL': <MoneyIcon />,
      'BANK_TRANSFER': <BankIcon />
    };
    return icons[method] || <CreditCardIcon />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (donationType === 'one-time') {
        // One-time donation
        await api.post(`/donation-campaigns/${campaignId}/donate/`, {
          amount: formData.amount,
          payment_method: formData.payment_method,
          is_anonymous: formData.is_anonymous,
          message: formData.message
        });
        setSuccess(true);
        setTimeout(() => {
          navigate('/donations');
        }, 2000);
      } else {
        // Recurring donation
        const recurringData = {
          amount: formData.amount,
          frequency: formData.frequency,
          payment_method: formData.payment_method,
          is_anonymous: formData.is_anonymous,
          message: formData.message,
          campaign: campaignId
        };
        
        // Add end_date if specified
        if (formData.end_date) {
          recurringData.end_date = formData.end_date.toISOString();
        }
        
        await api.post('/recurring-donations/', recurringData);
        setSuccess(true);
        setTimeout(() => {
          navigate('/donations');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process donation');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      minHeight: 56,
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: alpha(customTheme.primary, 0.3),
        borderWidth: 2,
      },
      '&:hover fieldset': {
        borderColor: customTheme.secondary,
        borderWidth: 2,
      },
      '&.Mui-focused fieldset': {
        borderColor: customTheme.primary,
        borderWidth: 3,
        boxShadow: `0 0 0 3px ${alpha(customTheme.primary, 0.1)}`,
      },
    },
    '& .MuiInputLabel-root': {
      color: customTheme.primary,
      fontWeight: 600,
      fontSize: '1rem',
      '&.Mui-focused': {
        color: customTheme.primary,
      },
    },
    '& .MuiOutlinedInput-input': {
      color: customTheme.primary,
      fontWeight: 500,
      padding: '16px 14px',
    }
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
              <FavoriteIcon sx={{ color: customTheme.accent, fontSize: 30 }} />
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
            Loading Campaign Details
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Preparing your donation form...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
        py: 6
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

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Hero Header */}
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
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
              
              <Slide direction="down" in timeout={1200}>
                <Avatar
                  sx={{
                    bgcolor: customTheme.primary,
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                    boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 40 }} />
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
                  letterSpacing: '-0.02em'
                }}
              >
                Support {campaign?.title}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 400,
                  lineHeight: 1.6,
                  mb: 2,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                {campaign?.description}
              </Typography>
            </Box>
          </Fade>

          {/* Main Form Card */}
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
              {error && (
                <Slide direction="down" in timeout={800}>
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
                </Slide>
              )}

              {success && (
                <Slide direction="down" in timeout={800}>
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 4,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: `2px solid ${customTheme.success}`,
                      backdropFilter: 'blur(10px)',
                      '& .MuiAlert-icon': {
                        fontSize: '1.5rem',
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {donationType === 'one-time' 
                        ? 'Thank you for your donation! Redirecting...'
                        : 'Thank you for setting up recurring donations! Redirecting...'
                      }
                    </Typography>
                  </Alert>
                </Slide>
              )}

              <form onSubmit={handleSubmit}>
                {/* Donation Type Selection */}
                <Slide direction="right" in timeout={1000}>
                  <Box sx={{ mb: 4 }}>
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
                      <MoneyIcon sx={{ fontSize: '1.2em' }} />
                      Donation Type
                    </Typography>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.15)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                        border: `2px solid ${alpha(customTheme.primary, 0.1)}`
                      }}
                    >
                      <RadioGroup
                        value={donationType}
                        onChange={(e) => setDonationType(e.target.value)}
                        row
                        sx={{ gap: 3 }}
                      >
                        <FormControlLabel 
                          value="one-time" 
                          control={
                            <Radio 
                              sx={{ 
                                color: customTheme.primary,
                                '&.Mui-checked': { color: customTheme.primary }
                              }} 
                            />
                          } 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FavoriteIcon sx={{ color: customTheme.primary }} />
                              <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                                One-time Donation
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel 
                          value="recurring" 
                          control={
                            <Radio 
                              sx={{ 
                                color: customTheme.primary,
                                '&.Mui-checked': { color: customTheme.primary }
                              }} 
                            />
                          } 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <RepeatIcon sx={{ color: customTheme.primary }} />
                              <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                                Recurring Donation
                              </Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </Paper>
                  </Box>
                </Slide>

                <Divider sx={{ mb: 4, borderColor: customTheme.secondary, borderWidth: 2 }} />

                {/* Amount Field */}
                <Slide direction="left" in timeout={1200}>
                  <Box sx={{ mb: 4 }}>
                    <TextField
                      name="amount"
                      label={donationType === 'recurring' 
                        ? `Amount per ${getFrequencyDisplay()} ($)` 
                        : "Amount ($)"
                      }
                      type="number"
                      fullWidth
                      required
                      value={formData.amount}
                      onChange={handleChange}
                      inputProps={{ min: "1", step: "0.01" }}
                      helperText={donationType === 'recurring' && formData.amount 
                        ? `Annual impact: $${calculateImpact().toFixed(2)}`
                        : 'Enter the amount you would like to donate'
                      }
                      sx={{
                        ...fieldStyles,
                        '& .MuiFormHelperText-root': {
                          color: alpha(customTheme.primary, 0.7),
                          fontWeight: 500
                        }
                      }}
                    />
                  </Box>
                </Slide>

                {/* Recurring Donation Options */}
                {donationType === 'recurring' && (
                  <Zoom in timeout={1000}>
                    <Card sx={{ 
                      mb: 4, 
                      background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.08)} 0%, ${alpha(customTheme.secondary, 0.03)} 100%)`,
                      border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                      borderRadius: 4
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ 
                          color: customTheme.primary,
                          fontWeight: 700,
                          mb: 3,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}>
                          <RepeatIcon sx={{ fontSize: '1.2em' }} />
                          Recurring Donation Settings
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>
                                Frequency
                              </InputLabel>
                              <Select
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                                label="Frequency"
                                sx={{
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  color: customTheme.primary,
                                  fontWeight: 500,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: alpha(customTheme.primary, 0.3),
                                    borderWidth: 2,
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: customTheme.secondary,
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: customTheme.primary,
                                    borderWidth: 3,
                                  },
                                }}
                              >
                                <MenuItem value="WEEKLY">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <ScheduleIcon sx={{ color: customTheme.primary }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Weekly</Typography>
                                    </Box>
                                    <Chip label="52x/year" size="small" sx={{ backgroundColor: alpha(customTheme.accent, 0.2), color: customTheme.accent }} />
                                  </Box>
                                </MenuItem>
                                <MenuItem value="MONTHLY">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <ScheduleIcon sx={{ color: customTheme.primary }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Monthly</Typography>
                                    </Box>
                                    <Chip label="12x/year" size="small" color="primary" />
                                  </Box>
                                </MenuItem>
                                <MenuItem value="QUARTERLY">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <ScheduleIcon sx={{ color: customTheme.primary }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Quarterly</Typography>
                                    </Box>
                                    <Chip label="4x/year" size="small" sx={{ backgroundColor: alpha(customTheme.secondary, 0.2), color: customTheme.secondary }} />
                                  </Box>
                                </MenuItem>
                                <MenuItem value="ANNUALLY">
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <ScheduleIcon sx={{ color: customTheme.primary }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Annually</Typography>
                                    </Box>
                                    <Chip label="1x/year" size="small" sx={{ backgroundColor: alpha(customTheme.grey, 0.4), color: customTheme.primary }} />
                                  </Box>
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <DatePicker
                              label="End Date (Optional)"
                              value={formData.end_date}
                              onChange={handleDateChange}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  helperText: "Leave blank for ongoing recurring donations",
                                  sx: {
                                    ...fieldStyles,
                                    '& .MuiFormHelperText-root': {
                                      color: alpha(customTheme.primary, 0.7),
                                      fontWeight: 500
                                    }
                                  }
                                }
                              }}
                              minDate={new Date()}
                            />
                          </Grid>
                        </Grid>

                        {formData.amount && (
                          <Fade in timeout={1000}>
                            <Paper
                              elevation={2}
                              sx={{ 
                                mt: 3, 
                                p: 3, 
                                background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                                border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
                                borderRadius: 3
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <TrendingUpIcon sx={{ color: customTheme.accent, fontSize: 28 }} />
                                <Typography variant="h6" sx={{ color: customTheme.accent, fontWeight: 700 }}>
                                  Impact Summary
                                </Typography>
                              </Box>
                              <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                                ${formData.amount} every {getFrequencyDisplay()} = ${calculateImpact().toFixed(2)} annually
                                {formData.end_date && ` (until ${formData.end_date.toLocaleDateString()})`}
                              </Typography>
                            </Paper>
                          </Fade>
                        )}
                      </CardContent>
                    </Card>
                  </Zoom>
                )}

                {/* Payment Method & Options */}
                <Slide direction="right" in timeout={1400}>
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h5" 
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
                      <CreditCardIcon sx={{ fontSize: '1.1em' }} />
                      Payment & Options
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>
                            Payment Method
                          </InputLabel>
                          <Select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            label="Payment Method"
                            sx={{
                              borderRadius: 3,
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              color: customTheme.primary,
                              fontWeight: 500,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(customTheme.primary, 0.3),
                                borderWidth: 2,
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: customTheme.secondary,
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: customTheme.primary,
                                borderWidth: 3,
                              },
                            }}
                          >
                            <MenuItem value="CREDIT_CARD">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CreditCardIcon sx={{ color: customTheme.primary }} />
                                Credit Card
                              </Box>
                            </MenuItem>
                            <MenuItem value="DEBIT_CARD">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CreditCardIcon sx={{ color: customTheme.primary }} />
                                Debit Card
                              </Box>
                            </MenuItem>
                            <MenuItem value="PAYPAL">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <MoneyIcon sx={{ color: customTheme.primary }} />
                                PayPal
                              </Box>
                            </MenuItem>
                            <MenuItem value="BANK_TRANSFER">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <BankIcon sx={{ color: customTheme.primary }} />
                                Bank Transfer
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          height: '100%',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.15)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                          border: `2px solid ${alpha(customTheme.primary, 0.1)}`
                        }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="is_anonymous"
                                checked={formData.is_anonymous}
                                onChange={handleChange}
                                sx={{ 
                                  color: customTheme.primary,
                                  '&.Mui-checked': { color: customTheme.primary }
                                }}
                              />
                            }
                            label={
                              <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                                Make this donation anonymous
                              </Typography>
                            }
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Slide>

                {/* Message */}
                <Slide direction="left" in timeout={1600}>
                  <Box sx={{ mb: 4 }}>
                    <TextField
                      name="message"
                      label="Message (optional)"
                      multiline
                      rows={4}
                      fullWidth
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={donationType === 'recurring' 
                        ? "Share why you want to support this cause regularly..."
                        : "Share your message of support..."
                      }
                      sx={fieldStyles}
                      helperText="Your message will be shared with our team and may be featured in our communications"
                    />
                  </Box>
                </Slide>

                {/* Submit Button */}
                <Slide direction="up" in timeout={1800}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={24} /> : <SendIcon />}
                    sx={{ 
                      py: 3,
                      borderRadius: 4,
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      background: submitting ? 
                        `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.primary, 0.2)} 90%)` :
                        `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                      boxShadow: !submitting ? 
                        `0 8px 30px ${alpha(customTheme.accent, 0.4)}` : 
                        'none',
                      color: '#ffffff',
                      textTransform: 'none',
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
                      '&:hover:not(:disabled)': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 40px ${alpha(customTheme.accent, 0.5)}`,
                        '&::before': {
                          left: '100%'
                        }
                      },
                      '&:disabled': {
                        color: alpha('#ffffff', 0.6),
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    {submitting ? 'Processing...' : donationType === 'recurring' ? 
                      'Set Up Recurring Donation' : 'Donate Now'}
                  </Button>
                </Slide>

                {/* Help Text */}
                <Fade in timeout={2000}>
                  <Typography variant="body2" sx={{ 
                    mt: 3, 
                    textAlign: 'center',
                    color: alpha(customTheme.primary, 0.7),
                    fontWeight: 500
                  }}>
                    {donationType === 'recurring' 
                      ? "You can pause, modify, or cancel your recurring donation anytime from your account."
                      : "You'll receive an email receipt immediately after your donation."
                    }
                  </Typography>
                </Fade>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}

export default DonationForm;