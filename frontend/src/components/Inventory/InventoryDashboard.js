// components/Inventory/InventoryDashboard.js - Enhanced with impressive styling

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  LinearProgress,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  AttachMoney as AttachMoneyIcon,
  Event as EventIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  MedicalServices as MedicalServicesIcon,
  TrendingUp as TrendingIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  AutoAwesome as SparkleIcon,
  Science as ScienceIcon,
  Healing as HealingIcon,
  MonitorHeart as MonitorIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';
import api from '../../redux/api';

const customTheme = {
  primary: '#8d6e63',     // Warm Brown
  secondary: '#81c784',   // Soft Green
  success: '#4caf50',     // Fresh Green
  warning: '#ff9800',
  error: '#f44336',
  grey: '#f3e5ab',        // Warm Cream
  accent: '#ff8a65',      // Gentle Orange
  background: '#fff8e1',  // Soft Cream
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
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.warning, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha(customTheme.warning, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.warning, 0)}; }
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

function InventoryDashboard() {
  const [summary, setSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [procurementSuggestions, setProcurementSuggestions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderForm, setOrderForm] = useState({
    quantity: 0,
    supplier_id: '',
  });
  const navigate = useNavigate();

  // Enhanced field styles
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
    }
  };

  const selectStyles = {
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: customTheme.primary,
    fontWeight: 500,
    transition: 'all 0.3s ease',
    minHeight: 65,
    width: '100%',
    '& .MuiSelect-select': {
      padding: '18px 14px',
      minHeight: '24px',
      overflow: 'visible',
      textOverflow: 'clip',
      whiteSpace: 'nowrap',
      minWidth: '150px',
    },
    '& .MuiOutlinedInput-root': {
      overflow: 'visible',
    },
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
      boxShadow: `0 0 0 3px ${alpha(customTheme.primary, 0.1)}`,
    },
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [summaryRes, lowStockRes, expiringRes, forecastRes, procurementRes, suppliersRes] = await Promise.all([
        api.get('/inventory-analytics/summary/'),
        api.get('/inventory-items/low_stock/'),
        api.get('/inventory-items/expiring_soon/'),
        api.get('/inventory-analytics/stock_forecast/'),
        api.get('/inventory-analytics/procurement_suggestions/'),
        api.get('/suppliers/')
      ]);
      
      setSummary(summaryRes.data);
      setLowStockItems(lowStockRes.data);
      setExpiringItems(expiringRes.data);
      setForecast(forecastRes.data);
      setProcurementSuggestions(procurementRes.data);
      setSuppliers(suppliersRes.data);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderNow = (item) => {
    setSelectedItem(item);
    setOrderForm({
      quantity: item.minimum_threshold * 2 - item.quantity,
      supplier_id: item.preferred_supplier?.id || '',
    });
    setOrderDialogOpen(true);
  };

  const handleOrderSubmit = async () => {
    try {
      await api.post(`/inventory-items/${selectedItem.id}/order_now/`, orderForm);
      
      // Show success message
      setError('');
      alert(`Purchase order created for ${orderForm.quantity} ${selectedItem.unit} of ${selectedItem.name}`);
      
      // Refresh data
      fetchInventoryData();
      setOrderDialogOpen(false);
    } catch (err) {
      console.error('Error creating purchase order:', err);
      setError(err.response?.data?.error || 'Failed to create purchase order');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Better status determination
  const getItemStatus = (item) => {
    if (item.is_expired) {
      return { label: 'Expired', color: 'error', icon: <WarningIcon /> };
    } else if (item.is_expiring_soon) {
      return { label: 'Expires Soon', color: 'warning', icon: <EventIcon /> };
    } else if (item.is_low_on_stock) {
      return { label: 'Low Stock', color: 'warning', icon: <WarningIcon /> };
    } else if (item.on_order_quantity > 0) {
      return { label: 'On Order', color: 'info', icon: <LocalShippingIcon /> };
    } else {
      return { label: 'In Stock', color: 'success', icon: <InventoryIcon /> };
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
        `,
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
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
          <InventoryIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <ScienceIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
            Loading Inventory Analytics
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Analyzing inventory data and procurement needs...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.15)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.15)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.2)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
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
          opacity: 0.6,
          zIndex: 0
        }}
      >
        <InventoryIcon sx={{ fontSize: 35, color: customTheme.secondary, filter: 'blur(1px)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.4,
          zIndex: 0
        }}
      >
        <ShoppingCartIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          animation: `${float} 14s ease-in-out infinite`,
          animationDelay: '4s',
          opacity: 0.5,
          zIndex: 0
        }}
      >
        <ScienceIcon sx={{ fontSize: 35, color: customTheme.accent, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
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
            
            <Slide direction="down" in timeout={1000}>
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
                <InventoryIcon sx={{ fontSize: 40 }} />
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
              Inventory Dashboard
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 400,
                lineHeight: 1.6,
                animation: `${slideInUp} 1s ease-out 0.3s both`
              }}
            >
              Real-time inventory monitoring and intelligent procurement insights
            </Typography>
            
            <Button 
              variant="contained" 
              onClick={() => navigate('/inventory/items')}
              sx={{
                mt: 3,
                py: 2,
                px: 3,
                borderRadius: 4,
                fontSize: '1.1rem',
                fontWeight: 700,
                background: `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                boxShadow: `0 8px 30px ${alpha(customTheme.success, 0.4)}`,
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
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 40px ${alpha(customTheme.success, 0.5)}`,
                  '&::before': {
                    left: '100%'
                  }
                }
              }}
            >
              Manage Inventory
            </Button>
          </Box>
        </Fade>

        {error && (
          <Slide direction="down" in timeout={1200}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 4,
                fontSize: '1.1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: `2px solid ${customTheme.error}`,
                backdropFilter: 'blur(20px)',
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

        {/* Enhanced Summary Cards */}
        <Fade in timeout={1400}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.3)}`,
                  border: `3px solid ${customTheme.primary}`,
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: customTheme.primary, 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`
                  }}>
                    <InventoryIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    color: customTheme.primary, 
                    fontWeight: 800,
                    mb: 1,
                    textShadow: `0 2px 4px ${alpha(customTheme.primary, 0.3)}`
                  }}>
                    {summary?.total_items || 0}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600
                  }}>
                    Total Items
                  </Typography>
                  {summary?.medical_items > 0 && (
                    <Typography variant="body2" sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500,
                      mt: 1
                    }}>
                      {summary.medical_items} medical items
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: (summary?.low_stock_items + summary?.expiring_soon) > 0 
                  ? `3px solid ${customTheme.warning}` 
                  : `2px solid ${alpha(customTheme.warning, 0.3)}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 25px 50px ${alpha(customTheme.warning, 0.3)}`,
                  border: `3px solid ${customTheme.warning}`,
                },
                '&::before': (summary?.low_stock_items + summary?.expiring_soon) > 0 ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${customTheme.warning}, ${alpha(customTheme.warning, 0.6)})`,
                  animation: `${shimmer} 2s infinite`
                } : {}
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: customTheme.warning, 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: `0 8px 25px ${alpha(customTheme.warning, 0.4)}`,
                    animation: (summary?.low_stock_items + summary?.expiring_soon) > 0 ? `${pulse} 2s infinite` : 'none'
                  }}>
                    <WarningIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    color: customTheme.warning, 
                    fontWeight: 800,
                    mb: 1,
                    textShadow: `0 2px 4px ${alpha(customTheme.warning, 0.3)}`
                  }}>
                    {(summary?.low_stock_items || 0) + (summary?.expiring_soon || 0)}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600
                  }}>
                    Urgent Actions
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: alpha(customTheme.primary, 0.7),
                    fontWeight: 500,
                    mt: 1
                  }}>
                    {summary?.low_stock_items || 0} low stock, {summary?.expiring_soon || 0} expiring
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha('#2196f3', 0.3)}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 25px 50px ${alpha('#2196f3', 0.3)}`,
                  border: `3px solid #2196f3`,
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: '#2196f3', 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: `0 8px 25px ${alpha('#2196f3', 0.4)}`
                  }}>
                    <LocalShippingIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    color: '#2196f3', 
                    fontWeight: 800,
                    mb: 1,
                    textShadow: `0 2px 4px ${alpha('#2196f3', 0.3)}`
                  }}>
                    {summary?.on_order_items || 0}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600
                  }}>
                    On Order
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: alpha(customTheme.primary, 0.7),
                    fontWeight: 500,
                    mt: 1
                  }}>
                    Items being delivered
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 25px 50px ${alpha(customTheme.success, 0.3)}`,
                  border: `3px solid ${customTheme.success}`,
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: customTheme.success, 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`
                  }}>
                    <AttachMoneyIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    color: customTheme.success, 
                    fontWeight: 800,
                    mb: 1,
                    textShadow: `0 2px 4px ${alpha(customTheme.success, 0.3)}`
                  }}>
                    {formatCurrency(summary?.total_value || 0)}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600
                  }}>
                    Total Value
                  </Typography>
                  {summary?.items_missing_cost > 0 && (
                    <Typography variant="body2" sx={{ 
                      color: customTheme.warning,
                      fontWeight: 500,
                      mt: 1
                    }}>
                      {summary.items_missing_cost} items missing cost data
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Procurement Suggestions */}
        {procurementSuggestions.length > 0 && (
          <Slide direction="right" in timeout={1600}>
            <Paper sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.accent, 0.15)}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ 
                  bgcolor: customTheme.accent, 
                  width: 60, 
                  height: 60, 
                  mr: 3,
                  boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`
                }}>
                  <AssessmentIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 1
                  }}>
                    Smart Procurement Suggestions
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 500
                  }}>
                    AI-powered recommendations based on consumption patterns
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 4, backgroundColor: alpha(customTheme.accent, 0.2), height: 2 }} />
              
              <Grid container spacing={3}>
                {procurementSuggestions.slice(0, 4).map((suggestion, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Zoom in timeout={300 * (index + 1)}>
                      <Card sx={{
                        borderRadius: 4,
                        border: `2px solid ${alpha(getUrgencyColor(suggestion.urgency).main || customTheme.primary, 0.3)}`,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 25px 50px ${alpha(getUrgencyColor(suggestion.urgency).main || customTheme.primary, 0.2)}`,
                          border: `3px solid ${getUrgencyColor(suggestion.urgency).main || customTheme.primary}`,
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: customTheme.primary,
                            mb: 2
                          }}>
                            {suggestion.item_name}
                          </Typography>
                          
                          <Stack spacing={1} sx={{ mb: 3 }}>
                            <Typography variant="body2" sx={{ 
                              color: alpha(customTheme.primary, 0.8),
                              fontWeight: 500
                            }}>
                              Current: {suggestion.current_stock} {suggestion.item?.unit || ""}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: alpha(customTheme.primary, 0.8),
                              fontWeight: 500
                            }}>
                              Suggested: {suggestion.suggested_quantity} {suggestion.item?.unit || ""}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: alpha(customTheme.primary, 0.8),
                              fontWeight: 500
                            }}>
                              Cost: {formatCurrency(suggestion.estimated_cost)}
                            </Typography>
                          </Stack>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              label={suggestion.urgency} 
                              color={getUrgencyColor(suggestion.urgency)} 
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<ShoppingCartIcon />}
                              onClick={() => handleOrderNow(suggestion)}
                              sx={{ 
                                backgroundColor: customTheme.accent, 
                                '&:hover': { 
                                  backgroundColor: alpha(customTheme.accent, 0.8),
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`
                                },
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: 3,
                                textTransform: 'none'
                              }}
                            >
                              Order
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Slide>
        )}

        {/* Low Stock Alerts with Actions */}
        <Slide direction="left" in timeout={1800}>
          <Paper sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `3px solid ${alpha(customTheme.warning, 0.2)}`,
            boxShadow: `0 25px 50px ${alpha(customTheme.warning, 0.15)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ 
                bgcolor: customTheme.warning, 
                width: 60, 
                height: 60, 
                mr: 3,
                boxShadow: `0 8px 25px ${alpha(customTheme.warning, 0.4)}`,
                animation: lowStockItems.length > 0 ? `${pulse} 2s infinite` : 'none'
              }}>
                <WarningIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ 
                  color: customTheme.primary,
                  fontWeight: 700,
                  mb: 1
                }}>
                  Low Stock Alerts
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 500
                }}>
                  Items requiring immediate attention
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 4, backgroundColor: alpha(customTheme.warning, 0.2), height: 2 }} />
            
            {lowStockItems.length === 0 ? (
              <Zoom in timeout={800}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 6,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                  border: `2px solid ${alpha(customTheme.success, 0.3)}`
                }}>
                  <Avatar sx={{ 
                    bgcolor: customTheme.success, 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 3,
                    boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`
                  }}>
                    <InventoryIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ 
                    color: customTheme.success, 
                    fontWeight: 700,
                    mb: 2
                  }}>
                    All items are well-stocked!
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 500
                  }}>
                    No low stock alerts at this time
                  </Typography>
                </Box>
              </Zoom>
            ) : (
              <Grid container spacing={3}>
                {lowStockItems.slice(0, 4).map((item, index) => {
                  const status = getItemStatus(item);
                  return (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                      <Zoom in timeout={300 * (index + 1)}>
                        <Card sx={{
                          borderRadius: 4,
                          border: `3px solid ${customTheme.error}`,
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: `0 25px 50px ${alpha(customTheme.error, 0.3)}`,
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: `linear-gradient(90deg, ${customTheme.error}, ${alpha(customTheme.error, 0.6)})`,
                            animation: `${shimmer} 2s infinite`
                          }
                        }}>
                          <CardContent sx={{ p: 3, pt: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ 
                                bgcolor: customTheme.error, 
                                width: 40, 
                                height: 40, 
                                mr: 2,
                                animation: `${pulse} 2s infinite`
                              }}>
                                {item.item_type === 'MEDICAL' ? (
                                  <MedicalServicesIcon sx={{ fontSize: 20 }} />
                                ) : (
                                  <InventoryIcon sx={{ fontSize: 20 }} />
                                )}
                              </Avatar>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 700,
                                color: customTheme.primary
                              }}>
                                {item.name}
                              </Typography>
                            </Box>
                            
                            <Stack spacing={1} sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ 
                                color: alpha(customTheme.primary, 0.8),
                                fontWeight: 500
                              }}>
                                Current: {item.quantity} {item?.unit || ""}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: alpha(customTheme.primary, 0.8),
                                fontWeight: 500
                              }}>
                                Minimum: {item.minimum_threshold} {item.unit}
                              </Typography>
                            </Stack>
                            
                            <LinearProgress 
                              variant="determinate" 
                              value={(item.quantity / item.minimum_threshold) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(customTheme.grey, 0.3),
                                mb: 2,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: customTheme.error,
                                  borderRadius: 4
                                }
                              }}
                            />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip 
                                label={status.label}
                                color={status.color} 
                                size="small" 
                                icon={status.icon}
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                              <Tooltip title="Create purchase order">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOrderNow(item)}
                                  sx={{ 
                                    color: customTheme.accent,
                                    '&:hover': {
                                      backgroundColor: alpha(customTheme.accent, 0.1),
                                      transform: 'scale(1.1)'
                                    }
                                  }}
                                >
                                  <ShoppingCartIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  );
                })}
                
                {lowStockItems.length > 4 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        onClick={() => navigate('/inventory/items')}
                        variant="outlined"
                        sx={{
                          color: customTheme.warning,
                          borderColor: customTheme.warning,
                          fontWeight: 600,
                          borderRadius: 3,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: customTheme.warning,
                            backgroundColor: alpha(customTheme.warning, 0.08),
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.warning, 0.2)}`
                          }
                        }}
                      >
                        View all {lowStockItems.length} low stock items
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
        </Slide>

        {/* Expiring Soon Items */}
        <Slide direction="right" in timeout={2000}>
          <Paper sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `3px solid ${alpha('#ff9800', 0.2)}`,
            boxShadow: `0 25px 50px ${alpha('#ff9800', 0.15)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ 
                bgcolor: '#ff9800', 
                width: 60, 
                height: 60, 
                mr: 3,
                boxShadow: `0 8px 25px ${alpha('#ff9800', 0.4)}`
              }}>
                <EventIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ 
                  color: customTheme.primary,
                  fontWeight: 700,
                  mb: 1
                }}>
                  Expiring Soon
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 500
                }}>
                  Items approaching expiration dates
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 4, backgroundColor: alpha('#ff9800', 0.2), height: 2 }} />
            
            {expiringItems.length === 0 ? (
              <Zoom in timeout={800}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 6,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                  border: `2px solid ${alpha(customTheme.success, 0.3)}`
                }}>
                  <Avatar sx={{ 
                    bgcolor: customTheme.success, 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 3,
                    boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`
                  }}>
                    <EventIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ 
                    color: customTheme.success, 
                    fontWeight: 700,
                    mb: 2
                  }}>
                    No items are expiring soon!
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 500
                  }}>
                    All inventory is within safe expiration windows
                  </Typography>
                </Box>
              </Zoom>
            ) : (
              <Grid container spacing={3}>
                {expiringItems.slice(0, 4).map((item, index) => {
                  const status = getItemStatus(item);
                  const daysUntilExpiry = item.days_until_expiry;
                  const isUrgent = daysUntilExpiry <= 7;
                  
                  return (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                      <Zoom in timeout={300 * (index + 1)}>
                        <Card sx={{
                          borderRadius: 4,
                          border: isUrgent ? `3px solid ${customTheme.error}` : `3px solid #ff9800`,
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: isUrgent 
                              ? `0 25px 50px ${alpha(customTheme.error, 0.3)}`
                              : `0 25px 50px ${alpha('#ff9800', 0.3)}`,
                          },
                          '&::before': isUrgent ? {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: `linear-gradient(90deg, ${customTheme.error}, ${alpha(customTheme.error, 0.6)})`,
                            animation: `${shimmer} 2s infinite`
                          } : {}
                        }}>
                          <CardContent sx={{ p: 3, pt: isUrgent ? 4 : 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ 
                                bgcolor: isUrgent ? customTheme.error : '#ff9800', 
                                width: 40, 
                                height: 40, 
                                mr: 2
                              }}>
                                {item.item_type === 'MEDICAL' ? (
                                  <MedicalServicesIcon sx={{ fontSize: 20 }} />
                                ) : (
                                  <EventIcon sx={{ fontSize: 20 }} />
                                )}
                              </Avatar>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 700,
                                color: customTheme.primary
                              }}>
                                {item.name}
                              </Typography>
                            </Box>
                            
                            <Stack spacing={1} sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ 
                                color: alpha(customTheme.primary, 0.8),
                                fontWeight: 500
                              }}>
                                Quantity: {item.quantity} {item?.unit || ""}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: alpha(customTheme.primary, 0.8),
                                fontWeight: 500
                              }}>
                                Expires: {new Date(item.expiry_date).toLocaleDateString()}
                              </Typography>
                            </Stack>
                            
                            <Box sx={{ mb: 2 }}>
                              <Chip 
                                label={`${daysUntilExpiry} days remaining`}
                                color={isUrgent ? 'error' : 'warning'} 
                                size="small" 
                                icon={<EventIcon />}
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  animation: isUrgent ? `${pulse} 2s infinite` : 'none'
                                }}
                              />
                            </Box>
                            
                            <Button 
                              size="small" 
                              variant="outlined" 
                              startIcon={<ShoppingCartIcon />} 
                              onClick={() => handleOrderNow(item)} 
                              sx={{ 
                                width: '100%',
                                borderColor: customTheme.accent, 
                                color: customTheme.accent, 
                                fontWeight: 600,
                                borderRadius: 3,
                                textTransform: 'none',
                                "&:hover": { 
                                  backgroundColor: alpha(customTheme.accent, 0.08),
                                  borderColor: customTheme.accent,
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.2)}`
                                }, 
                                fontSize: "0.75rem" 
                              }}
                            >
                              Order Fresh Stock
                            </Button>
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  );
                })}
                
                {expiringItems.length > 4 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        onClick={() => navigate('/inventory/items')}
                        variant="outlined"
                        sx={{
                          color: '#ff9800',
                          borderColor: '#ff9800',
                          fontWeight: 600,
                          borderRadius: 3,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#ff9800',
                            backgroundColor: alpha('#ff9800', 0.08),
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha('#ff9800', 0.2)}`
                          }
                        }}
                      >
                        View all {expiringItems.length} expiring items
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
        </Slide>

        {/* Stock Forecast */}
        <Slide direction="left" in timeout={2200}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
            boxShadow: `0 25px 50px ${alpha(customTheme.secondary, 0.15)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ 
                bgcolor: customTheme.secondary, 
                width: 60, 
                height: 60, 
                mr: 3,
                boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`
              }}>
                <TimelineIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ 
                  color: customTheme.primary,
                  fontWeight: 700,
                  mb: 1
                }}>
                  30-Day Stock Forecast
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: alpha(customTheme.primary, 0.8),
                  fontWeight: 500
                }}>
                  Predictive analytics based on consumption patterns
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 4, backgroundColor: alpha(customTheme.secondary, 0.2), height: 2 }} />
            
            {forecast.length === 0 ? (
              <Zoom in timeout={800}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 6,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha('#2196f3', 0.1)} 0%, ${alpha('#2196f3', 0.05)} 100%)`,
                  border: `2px solid ${alpha('#2196f3', 0.3)}`
                }}>
                  <Avatar sx={{ 
                    bgcolor: '#2196f3', 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 3,
                    boxShadow: `0 8px 25px ${alpha('#2196f3', 0.4)}`
                  }}>
                    <AssessmentIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ 
                    color: '#2196f3', 
                    fontWeight: 700,
                    mb: 2
                  }}>
                    Building Forecast Models
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 500
                  }}>
                    No forecast data available. This may be due to insufficient consumption history.
                  </Typography>
                </Box>
              </Zoom>
            ) : (
              <Grid container spacing={3}>
                {forecast.slice(0, 4).map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={item.id}>
                    <Zoom in timeout={300 * (index + 1)}>
                      <Card sx={{
                        borderRadius: 4,
                        border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 25px 50px ${alpha(customTheme.secondary, 0.3)}`,
                          border: `3px solid ${customTheme.secondary}`,
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: customTheme.secondary, 
                              width: 40, 
                              height: 40, 
                              mr: 2
                            }}>
                              <SpeedIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700,
                              color: customTheme.primary
                            }}>
                              {item.name}
                            </Typography>
                          </Box>
                          
                          <Stack spacing={1}>
                            <Typography variant="body2" sx={{ 
                              color: alpha(customTheme.primary, 0.8),
                              fontWeight: 500
                            }}>
                              Current: {item.current_quantity} {item.unit}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: alpha(customTheme.primary, 0.8),
                              fontWeight: 500
                            }}>
                              Days remaining: {item.days_remaining || "No consumption data"}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: alpha(customTheme.primary, 0.8),
                              fontWeight: 500
                            }}>
                              Predicted need: {item.predicted_need} {item.unit}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
                
                {forecast.length > 4 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button
                        onClick={() => navigate('/inventory/forecast')}
                        variant="outlined"
                        sx={{
                          color: customTheme.secondary,
                          borderColor: customTheme.secondary,
                          fontWeight: 600,
                          borderRadius: 3,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: customTheme.secondary,
                            backgroundColor: alpha(customTheme.secondary, 0.08),
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.secondary, 0.2)}`
                          }
                        }}
                      >
                        View full forecast
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
        </Slide>

        {/* Order Now Dialog */}
        <Dialog 
          open={orderDialogOpen} 
          onClose={() => setOrderDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2,
            borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: customTheme.primary, 
                width: 50, 
                height: 50
              }}>
                <ShoppingCartIcon sx={{ fontSize: 25 }} />
              </Avatar>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary, 
                fontWeight: 700 
              }}>
                Create Purchase Order
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedItem && (
              <Box sx={{ mt: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`,
                    border: `2px solid ${alpha(customTheme.accent, 0.3)}`
                  }}
                >
                  <Typography variant="h5" sx={{ 
                    color: customTheme.primary, 
                    fontWeight: 700,
                    mb: 1
                  }}>
                    {selectedItem.name}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 500,
                    mb: 1
                  }}>
                    Current Stock: {selectedItem.quantity} {selectedItem.unit}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 500
                  }}>
                    Minimum Threshold: {selectedItem.minimum_threshold} {selectedItem.unit}
                  </Typography>
                </Paper>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Quantity to Order"
                      type="number"
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                      inputProps={{ min: 1 }}
                      sx={fieldStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth sx={{ minWidth: 200 }}>
                      <InputLabel sx={{
                        color: customTheme.primary,
                        fontWeight: 600,
                        '&.Mui-focused': { color: customTheme.primary },
                      }}>
                        Supplier
                      </InputLabel>
                      <Select
                        value={orderForm.supplier_id}
                        label="Supplier"
                        onChange={(e) => setOrderForm(prev => ({ ...prev, supplier_id: e.target.value }))}
                        sx={selectStyles}
                      >
                        {suppliers.map(supplier => (
                          <MenuItem key={supplier.id} value={supplier.id}>
                            {supplier.name} {supplier.is_preferred && '(Preferred)'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mt: 3,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.success, 0.05)} 100%)`,
                    border: `2px solid ${alpha(customTheme.success, 0.3)}`
                  }}
                >
                  <Typography variant="h6" sx={{ 
                    color: customTheme.success,
                    fontWeight: 700,
                    mb: 1
                  }}>
                    Estimated Cost: {formatCurrency((orderForm.quantity || 0) * (selectedItem?.cost_per_unit || 0))}
                  </Typography>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`,
            gap: 2
          }}>
            <Button 
              onClick={() => setOrderDialogOpen(false)}
              sx={{
                py: 2,
                px: 3,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 600,
                color: alpha(customTheme.primary, 0.7),
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: alpha(customTheme.primary, 0.05),
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleOrderSubmit}
              disabled={!orderForm.quantity || !orderForm.supplier_id}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 700,
                background: `linear-gradient(45deg, ${customTheme.success} 30%, ${customTheme.secondary} 90%)`,
                boxShadow: `0 8px 30px ${alpha(customTheme.success, 0.4)}`,
                color: '#ffffff',
                textTransform: 'none',
                '&:hover:not(:disabled)': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 40px ${alpha(customTheme.success, 0.5)}`
                }
              }}
            >
              Create Order
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default InventoryDashboard;