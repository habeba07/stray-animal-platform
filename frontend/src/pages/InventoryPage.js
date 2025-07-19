import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Divider,
  Card,
  CardContent,
  Fade,
  Slide,
  Zoom,
  Avatar,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningIcon from '@mui/icons-material/Warning';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BuildIcon from '@mui/icons-material/Build';
import PetsIcon from '@mui/icons-material/Pets';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { keyframes } from '@mui/system';
import api from '../redux/api';

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

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    item_type: 'SUPPLY',
    description: '',
    quantity: 0,
    unit: 'UNIT',
    minimum_threshold: 0,
    cost_per_unit: '', // FIXED: Now required
    expiry_date: '',
    location: '',
    batch_number: '',
    requires_refrigeration: false,
    preferred_supplier: '',
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setCategoriesLoading(true);
      const [itemsRes, categoriesRes, suppliersRes] = await Promise.all([
        api.get('/inventory-items/'),
        api.get('/inventory-categories/'),
        api.get('/suppliers/')
      ]);
      
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
      setSuppliers(suppliersRes.data);
      console.log('Categories loaded:', categoriesRes.data);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
    setPage(0);
  };

  const handleTypeFilterChange = (e) => {
    setFilterType(e.target.value);
    setPage(0);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Form field changed: ${name} = ${type === 'checkbox' ? checked : value}`);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenForm = (item = null) => {
    // Check if categories are loaded
    if (!categories.length) {
      setError('Categories not loaded. Please wait and try again.');
      return;
    }
    
    if (item) {
      setCurrentItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        item_type: item.item_type || 'SUPPLY',
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit,
        minimum_threshold: item.minimum_threshold,
        cost_per_unit: item.cost_per_unit || '',
        expiry_date: item.expiry_date || '',
        location: item.location || '',
        batch_number: item.batch_number || '',
        requires_refrigeration: item.requires_refrigeration || false,
        preferred_supplier: item.preferred_supplier || '',
      });
    } else {
      setCurrentItem(null);
      setFormData({
        name: '',
        category: categories.length > 0 ? categories[0].id : '',
        item_type: 'SUPPLY',
        description: '',
        quantity: 0,
        unit: 'UNIT',
        minimum_threshold: 0,
        cost_per_unit: '', // FIXED: Required field
        expiry_date: '',
        location: '',
        batch_number: '',
        requires_refrigeration: false,
        preferred_supplier: '',
      });
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setError('');
    setSuccess('');
  };

  const handleSubmitForm = async () => {
    try {
      // FIXED: Enhanced validation
      if (!formData.name || !formData.category || !formData.cost_per_unit) {
        setError('Please fill in all required fields (Name, Category, and Cost Per Unit)');
        return;
      }
      
      if (parseFloat(formData.cost_per_unit) <= 0) {
        setError('Cost per unit must be greater than 0');
        return;
      }
      
      console.log('Form data being submitted:', formData);
      
      const dataToSubmit = {
        name: formData.name,
        category: parseInt(formData.category),
        item_type: formData.item_type,
        description: formData.description || '',
        quantity: parseFloat(formData.quantity) || 0,
        unit: formData.unit,
        minimum_threshold: parseFloat(formData.minimum_threshold) || 0,
        cost_per_unit: parseFloat(formData.cost_per_unit), // FIXED: Always required
        expiry_date: formData.expiry_date || null,
        location: formData.location || '',
        batch_number: formData.batch_number || '',
        requires_refrigeration: formData.requires_refrigeration,
        preferred_supplier: formData.preferred_supplier || null,
      };
      
      console.log('Processed data to submit:', dataToSubmit);
      
      if (currentItem) {
        await api.put(`/inventory-items/${currentItem.id}/`, dataToSubmit);
        setSuccess('Item updated successfully');
      } else {
        const response = await api.post('/inventory-items/', dataToSubmit);
        console.log('Response:', response.data);
        setSuccess('Item created successfully');
      }
      
      fetchInventoryData();
      setFormOpen(false);
      setError('');
    } catch (err) {
      console.error("Error saving inventory item:", err);
      
      if (err.response && err.response.data) {
        console.error("Server error response:", err.response.data);
        
        let errorMessage = 'Failed to save inventory item: ';
        
        if (typeof err.response.data === 'object') {
          Object.keys(err.response.data).forEach(key => {
            const fieldError = err.response.data[key];
            if (Array.isArray(fieldError)) {
              errorMessage += `${key}: ${fieldError.join(', ')}. `;
            } else {
              errorMessage += `${key}: ${fieldError}. `;
            }
          });
        } else {
          errorMessage += err.response.data;
        }
        
        setError(errorMessage);
      } else {
        setError('Failed to save inventory item. Please check your connection and try again.');
      }
    }
  };

  // FIXED: Confirmation dialog for delete
  const handleDeleteItem = (item) => {
    setCurrentItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/inventory-items/${currentItem.id}/`);
      setSuccess(`${currentItem.name} deleted successfully`);
      fetchInventoryData();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      setError('Failed to delete inventory item');
    }
  };

  const handleViewAuditTrail = async (item) => {
    try {
      const response = await api.get(`/inventory-items/${item.id}/audit_trail/`);
      setAuditLogs(response.data);
      setCurrentItem(item);
      setAuditDialogOpen(true);
    } catch (err) {
      console.error("Error fetching audit trail:", err);
      setError('Failed to load audit trail');
    }
  };

  const handleOrderNow = async (item) => {
    try {
      const quantity = item.minimum_threshold * 2 - item.quantity;
      const supplier_id = item.preferred_supplier?.id;
      
      if (!supplier_id) {
        setError('No preferred supplier set for this item');
        return;
      }
      
      await api.post(`/inventory-items/${item.id}/order_now/`, {
        quantity,
        supplier_id
      });
      
      setSuccess(`Purchase order created for ${quantity} ${item.unit} of ${item.name}`);
      fetchInventoryData();
    } catch (err) {
      console.error('Error creating purchase order:', err);
      setError(err.response?.data?.error || 'Failed to create purchase order');
    }
  };

  // Filter and paginate items
  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.batch_number && item.batch_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === '' || item.category === parseInt(filterCategory);
    const matchesType = filterType === '' || item.item_type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });
  
  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // FIXED: Better status determination
  const getItemStatus = (item) => {
    if (item.is_expired) {
      return { label: 'Expired', color: 'error', icon: <WarningIcon /> };
    } else if (item.is_expiring_soon) {
      return { label: 'Expires Soon', color: 'warning', icon: <WarningIcon /> };
    } else if (item.is_low_on_stock) {
      return { label: 'Low Stock', color: 'warning', icon: <WarningIcon /> };
    } else if (item.on_order_quantity > 0) {
      return { label: 'On Order', color: 'info', icon: <ShoppingCartIcon /> };
    } else {
      return { label: 'In Stock', color: 'success', icon: null };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'MEDICAL': return <MedicalServicesIcon sx={{ fontSize: 16, color: customTheme.accent }} />;
      case 'FOOD': return <RestaurantIcon sx={{ fontSize: 16, color: customTheme.secondary }} />;
      case 'EQUIPMENT': return <BuildIcon sx={{ fontSize: 16, color: customTheme.primary }} />;
      default: return <CategoryIcon sx={{ fontSize: 16, color: customTheme.primary }} />;
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
      whiteSpace: 'nowrap',
      overflow: 'visible',
      textOverflow: 'unset',
      maxWidth: 'none',
      width: 'auto',
      '&.Mui-focused': {
        color: customTheme.primary,
      },
      '&.MuiInputLabel-shrink': {
        fontSize: '0.85rem',
        transform: 'translate(14px, -9px) scale(0.85)',
        maxWidth: 'none',
        width: 'auto',
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
          <MedicalServicesIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
            Loading Inventory System
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Gathering inventory data...
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
      overflow: 'hidden',
      py: 4
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
        <InventoryIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <MedicalServicesIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        
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
              Inventory Management
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
              Smart inventory tracking with real-time monitoring and automated ordering
            </Typography>
            
            {/* Stats Cards */}
            <Slide direction="up" in timeout={1200}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4, flexWrap: 'wrap' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.accent, 0.1)} 100%)`,
                    border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    minWidth: 140
                  }}
                >
                  <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 800, mb: 1 }}>
                    {items.length}
                  </Typography>
                  <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                    Total Items
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.secondary, 0.1)} 100%)`,
                    border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    minWidth: 140
                  }}
                >
                  <Typography variant="h4" sx={{ color: customTheme.accent, fontWeight: 800, mb: 1 }}>
                    {items.filter(item => item.is_low_on_stock).length}
                  </Typography>
                  <Typography variant="body1" sx={{ color: alpha(customTheme.accent, 0.8), fontWeight: 600 }}>
                    Low Stock
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.success, 0.1)} 100%)`,
                    border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    minWidth: 140
                  }}
                >
                  <Typography variant="h4" sx={{ color: customTheme.secondary, fontWeight: 800, mb: 1 }}>
                    {categories.length}
                  </Typography>
                  <Typography variant="body1" sx={{ color: alpha(customTheme.secondary, 0.8), fontWeight: 600 }}>
                    Categories
                  </Typography>
                </Paper>
              </Box>
            </Slide>
          </Box>
        </Fade>

        {/* Action Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Zoom in timeout={1400}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              sx={{
                background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                color: '#ffffff',
                fontWeight: 700,
                py: 2,
                px: 4,
                borderRadius: 4,
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.5)}`
                }
              }}
            >
              Add New Item
            </Button>
          </Zoom>
        </Box>

        {/* Error and Success Alerts */}
        {error && (
          <Slide direction="down" in timeout={800}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
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
                mb: 3,
                borderRadius: 3,
                fontSize: '1.1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: `2px solid ${customTheme.success}`,
                backdropFilter: 'blur(10px)',
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
          </Slide>
        )}

        {/* Main Content Card */}
        <Fade in timeout={1000}>
          <Card
            sx={{
              borderRadius: 6,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
              position: 'relative'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              
              {/* Filters Section */}
              <Paper
                elevation={0}
                sx={{
                  background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                  p: 4,
                  borderBottom: `3px solid ${alpha(customTheme.primary, 0.1)}`
                }}
              >
                <Slide direction="right" in timeout={1200}>
                  <Box>
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
                      <SearchIcon sx={{ fontSize: '1.2em' }} />
                      Search & Filter
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} lg={6}>
                        <TextField
                          label="Search Items"
                          variant="outlined"
                          fullWidth
                          value={searchQuery}
                          onChange={handleSearchChange}
                          sx={fieldStyles}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon sx={{ color: customTheme.primary }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6} lg={3}>
                        <FormControl fullWidth sx={{
                          ...fieldStyles,
                          minWidth: 180,
                          '& .MuiInputLabel-root': {
                            color: customTheme.primary,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'visible',
                            textOverflow: 'unset',
                            maxWidth: 'none',
                            width: 'auto',
                            '&.MuiInputLabel-shrink': {
                              fontSize: '0.85rem',
                              transform: 'translate(14px, -9px) scale(0.85)',
                              maxWidth: 'none',
                              width: 'auto',
                            }
                          }
                        }}>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={filterCategory}
                            label="Category"
                            onChange={handleCategoryFilterChange}
                          >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map(category => (
                              <MenuItem key={category.id} value={category.id}>
                                {category.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6} lg={3}>
                        <FormControl fullWidth sx={{
                          ...fieldStyles,
                          minWidth: 160,
                          '& .MuiInputLabel-root': {
                            color: customTheme.primary,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'visible',
                            textOverflow: 'unset',
                            maxWidth: 'none',
                            width: 'auto',
                            '&.MuiInputLabel-shrink': {
                              fontSize: '0.85rem',
                              transform: 'translate(14px, -9px) scale(0.85)',
                              maxWidth: 'none',
                              width: 'auto',
                            }
                          }
                        }}>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={filterType}
                            label="Type"
                            onChange={handleTypeFilterChange}
                          >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="MEDICAL">Medical</MenuItem>
                            <MenuItem value="FOOD">Food</MenuItem>
                            <MenuItem value="SUPPLY">Supply</MenuItem>
                            <MenuItem value="EQUIPMENT">Equipment</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>
                </Slide>
              </Paper>

              {/* Table Section */}
              <Box sx={{ p: 4 }}>
                <Slide direction="up" in timeout={1400}>
                  <TableContainer 
                    component={Paper}
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      background: 'transparent',
                      border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                      '& .MuiTableHead-root': {
                        background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.accent, 0.05)} 100%)`
                      }
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1.1rem' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1.1rem' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1.1rem' }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1.1rem' }}>Quantity</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1.1rem' }}>Cost Per Unit</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1.1rem' }}>Expiry Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1.1rem' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1.1rem' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedItems.map((item, index) => {
                          const status = getItemStatus(item);
                          return (
                            <TableRow 
                              key={item.id}
                              sx={{
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: alpha(customTheme.grey, 0.3),
                                  transform: 'translateX(5px)',
                                  boxShadow: `0 4px 20px ${alpha(customTheme.primary, 0.1)}`
                                }
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getTypeIcon(item.item_type)}
                                  <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                                      {item.name}
                                    </Typography>
                                    {item.batch_number && (
                                      <Typography variant="caption" color="text.secondary">
                                        Batch: {item.batch_number}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={item.item_type} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{
                                    backgroundColor: alpha(
                                      item.item_type === 'MEDICAL' ? customTheme.accent : 
                                      item.item_type === 'FOOD' ? customTheme.secondary :
                                      item.item_type === 'EQUIPMENT' ? customTheme.primary : 
                                      '#6d4c41', 0.1  // Changed from customTheme.grey to a darker brown
                                    ),
                                    borderColor: item.item_type === 'MEDICAL' ? customTheme.accent : 
                                                item.item_type === 'FOOD' ? customTheme.secondary :
                                                item.item_type === 'EQUIPMENT' ? customTheme.primary : 
                                                '#6d4c41',  // Changed from customTheme.grey to a darker brown
                                    color: item.item_type === 'MEDICAL' ? customTheme.accent : 
                                           item.item_type === 'FOOD' ? customTheme.secondary :
                                           item.item_type === 'EQUIPMENT' ? customTheme.primary : 
                                           '#6d4c41',  // Changed from customTheme.grey to a darker brown
                                    fontWeight: 600
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: customTheme.primary }}>
                                  {item.category_details ? item.category_details.name : ''}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                                    {item.quantity} {item.unit}
                                  </Typography>
                                  {item.on_order_quantity > 0 && (
                                    <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                                      (+{item.on_order_quantity} on order)
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                                  {formatCurrency(item.cost_per_unit)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: customTheme.primary }}>
                                    {formatDate(item.expiry_date)}
                                  </Typography>
                                  {item.days_until_expiry !== null && item.days_until_expiry <= 30 && (
                                    <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                                      ({item.days_until_expiry} days)
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={status.label}
                                  color={status.color} 
                                  size="small" 
                                  icon={status.icon}
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Edit item">
                                    <IconButton 
                                      onClick={() => handleOpenForm(item)} 
                                      size="small"
                                      sx={{ 
                                        color: customTheme.primary,
                                        '&:hover': { 
                                          backgroundColor: alpha(customTheme.primary, 0.1),
                                          transform: 'scale(1.2)'
                                        }
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title="View audit trail">
                                    <IconButton 
                                      onClick={() => handleViewAuditTrail(item)} 
                                      size="small"
                                      sx={{ 
                                        color: customTheme.secondary,
                                        '&:hover': { 
                                          backgroundColor: alpha(customTheme.secondary, 0.1),
                                          transform: 'scale(1.2)'
                                        }
                                      }}
                                    >
                                      <HistoryIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  {item.is_low_on_stock && item.preferred_supplier && (
                                    <Tooltip title="Order now">
                                      <IconButton 
                                        onClick={() => handleOrderNow(item)} 
                                        size="small" 
                                        sx={{ 
                                          color: customTheme.accent,
                                          '&:hover': { 
                                            backgroundColor: alpha(customTheme.accent, 0.1),
                                            transform: 'scale(1.2)'
                                          }
                                        }}
                                      >
                                        <ShoppingCartIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  
                                  <Tooltip title="Delete item">
                                    <IconButton 
                                      onClick={() => handleDeleteItem(item)} 
                                      size="small" 
                                      sx={{ 
                                        color: '#f44336',
                                        '&:hover': { 
                                          backgroundColor: alpha('#f44336', 0.1),
                                          transform: 'scale(1.2)'
                                        }
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        
                        {paginatedItems.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <InventoryIcon sx={{ fontSize: 80, color: alpha(customTheme.primary, 0.3), mb: 2 }} />
                                <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                                  No items found
                                </Typography>
                                <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                                  Try adjusting your search or filter criteria
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Slide>
                
                {/* Pagination */}
                {filteredItems.length > 0 && (
                  <Fade in timeout={1600}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 4,
                          background: `linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)`,
                          border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                          backdropFilter: 'blur(20px)'
                        }}
                      >
                        <TablePagination
                          rowsPerPageOptions={[5, 10, 25, 50]}
                          component="div"
                          count={filteredItems.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                          sx={{
                            color: customTheme.primary,
                            '& .MuiTablePagination-toolbar': {
                              color: customTheme.primary,
                            },
                            '& .MuiTablePagination-selectIcon': {
                              color: customTheme.primary,
                            },
                            '& .MuiIconButton-root': {
                              color: customTheme.primary,
                              '&:hover': {
                                backgroundColor: alpha(customTheme.primary, 0.1)
                              }
                            }
                          }}
                        />
                      </Paper>
                    </Box>
                  </Fade>
                )}
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>

      {/* Enhanced Add/Edit Item Form Dialog */}
      <Dialog 
        open={formOpen} 
        onClose={handleCloseForm} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.primary, 0.2)}`
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
            color: 'white',
            fontWeight: 700,
            fontSize: '1.3rem'
          }}
        >
          {currentItem ? `Edit Item: ${currentItem.name}` : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                name="name"
                label="Item Name *"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                required
                sx={{
                  ...fieldStyles,
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'unset',
                    maxWidth: 'none',
                    width: 'auto',
                    '&.MuiInputLabel-shrink': {
                      fontSize: '0.85rem',
                      transform: 'translate(14px, -9px) scale(0.85)',
                      maxWidth: 'none',
                      width: 'auto',
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="cost_per_unit"
                label="Cost Per Unit *"
                type="number"
                value={formData.cost_per_unit}
                onChange={handleFormChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
                helperText="Required for budget tracking"
                sx={{
                  ...fieldStyles,
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'unset',
                    maxWidth: 'none',
                    width: 'auto',
                    '&.MuiInputLabel-shrink': {
                      fontSize: '0.85rem',
                      transform: 'translate(14px, -9px) scale(0.85)',
                      maxWidth: 'none',
                      width: 'auto',
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required sx={{
                ...fieldStyles,
                '& .MuiInputLabel-root': {
                  color: customTheme.primary,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  textOverflow: 'unset',
                  maxWidth: 'none',
                  width: 'auto',
                  '&.MuiInputLabel-shrink': {
                    fontSize: '0.85rem',
                    transform: 'translate(14px, -9px) scale(0.85)',
                    maxWidth: 'none',
                    width: 'auto',
                  }
                }
              }}>
                <InputLabel>Item Type</InputLabel>
                <Select
                  name="item_type"
                  value={formData.item_type}
                  label="Item Type"
                  onChange={handleFormChange}
                >
                  <MenuItem value="MEDICAL">Medical/Vaccine</MenuItem>
                  <MenuItem value="FOOD">Food</MenuItem>
                  <MenuItem value="SUPPLY">General Supply</MenuItem>
                  <MenuItem value="EQUIPMENT">Equipment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required sx={{
                ...fieldStyles,
                '& .MuiInputLabel-root': {
                  color: customTheme.primary,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  textOverflow: 'unset',
                  maxWidth: 'none',
                  width: 'auto',
                  '&.MuiInputLabel-shrink': {
                    fontSize: '0.85rem',
                    transform: 'translate(14px, -9px) scale(0.85)',
                    maxWidth: 'none',
                    width: 'auto',
                  }
                }
              }}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleFormChange}
                >
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={2}
                sx={{
                  ...fieldStyles,
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'unset',
                    maxWidth: 'none',
                    width: 'auto',
                    '&.MuiInputLabel-shrink': {
                      fontSize: '0.85rem',
                      transform: 'translate(14px, -9px) scale(0.85)',
                      maxWidth: 'none',
                      width: 'auto',
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="quantity"
                label="Quantity *"
                type="number"
                value={formData.quantity}
                onChange={handleFormChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
                sx={{
                  ...fieldStyles,
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'unset',
                    maxWidth: 'none',
                    width: 'auto',
                    '&.MuiInputLabel-shrink': {
                      fontSize: '0.85rem',
                      transform: 'translate(14px, -9px) scale(0.85)',
                      maxWidth: 'none',
                      width: 'auto',
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required sx={{
                ...fieldStyles,
                '& .MuiInputLabel-root': {
                  color: customTheme.primary,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  textOverflow: 'unset',
                  maxWidth: 'none',
                  width: 'auto',
                  '&.MuiInputLabel-shrink': {
                    fontSize: '0.85rem',
                    transform: 'translate(14px, -9px) scale(0.85)',
                    maxWidth: 'none',
                    width: 'auto',
                  }
                }
              }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  name="unit"
                  value={formData.unit}
                  label="Unit"
                  onChange={handleFormChange}
                >
                  <MenuItem value="UNIT">Unit</MenuItem>
                  <MenuItem value="KG">Kilogram</MenuItem>
                  <MenuItem value="G">Gram</MenuItem>
                  <MenuItem value="L">Liter</MenuItem>
                  <MenuItem value="ML">Milliliter</MenuItem>
                  <MenuItem value="BOX">Box</MenuItem>
                  <MenuItem value="PACKET">Packet</MenuItem>
                  <MenuItem value="DOSE">Dose</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                name="minimum_threshold"
                label="Minimum Threshold *"
                type="number"
                value={formData.minimum_threshold}
                onChange={handleFormChange}
                fullWidth
                required
                inputProps={{ min: 0, step: "0.01" }}
                sx={{
                  ...fieldStyles,
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'unset',
                    maxWidth: 'none',
                    width: 'auto',
                    '&.MuiInputLabel-shrink': {
                      fontSize: '0.85rem',
                      transform: 'translate(14px, -9px) scale(0.85)',
                      maxWidth: 'none',
                      width: 'auto',
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider 
                sx={{ 
                  borderColor: customTheme.secondary, 
                  borderWidth: 1,
                  my: 2
                }} 
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="expiry_date"
                label="Expiry Date"
                type="date"
                value={formData.expiry_date}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  ...fieldStyles,
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'unset',
                    maxWidth: 'none',
                    width: 'auto',
                    '&.MuiInputLabel-shrink': {
                      fontSize: '0.85rem',
                      transform: 'translate(14px, -9px) scale(0.85)',
                      maxWidth: 'none',
                      width: 'auto',
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="batch_number"
                label="Batch/Lot Number"
                value={formData.batch_number}
                onChange={handleFormChange}
                fullWidth
                helperText="For medical items and recalls"
                sx={{
                  ...fieldStyles,
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'unset',
                    maxWidth: 'none',
                    width: 'auto',
                    '&.MuiInputLabel-shrink': {
                      fontSize: '0.85rem',
                      transform: 'translate(14px, -9px) scale(0.85)',
                      maxWidth: 'none',
                      width: 'auto',
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="location"
                label="Storage Location"
                value={formData.location}
                onChange={handleFormChange}
                fullWidth
                sx={{
                  ...fieldStyles,
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'unset',
                    maxWidth: 'none',
                    width: 'auto',
                    '&.MuiInputLabel-shrink': {
                      fontSize: '0.85rem',
                      transform: 'translate(14px, -9px) scale(0.85)',
                      maxWidth: 'none',
                      width: 'auto',
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{
                ...fieldStyles,
                minWidth: 200,
                '& .MuiInputLabel-root': {
                  color: customTheme.primary,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  textOverflow: 'unset',
                  maxWidth: 'none',
                  width: 'auto',
                  '&.MuiInputLabel-shrink': {
                    fontSize: '0.85rem',
                    transform: 'translate(14px, -9px) scale(0.85)',
                    maxWidth: 'none',
                    width: 'auto',
                  }
                }
              }}>
                <InputLabel>Preferred Supplier</InputLabel>
                <Select
                  name="preferred_supplier"
                  value={formData.preferred_supplier}
                  label="Preferred Supplier"
                  onChange={handleFormChange}
                >
                  <MenuItem value="">No preference</MenuItem>
                  {suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="requires_refrigeration"
                    checked={formData.requires_refrigeration}
                    onChange={handleFormChange}
                    sx={{
                      color: customTheme.primary,
                      '&.Mui-checked': {
                        color: customTheme.primary,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: customTheme.primary, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Requires Refrigeration
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseForm}
            sx={{ 
              color: customTheme.primary,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(customTheme.primary, 0.1)
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitForm}
            disabled={!formData.name || !formData.category || !formData.cost_per_unit}
            sx={{
              background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
              fontWeight: 700,
              px: 4,
              '&:hover': {
                background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`
              }
            }}
          >
            {currentItem ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Confirmation Dialog for Delete */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha('#f44336', 0.2)}`
          }
        }}
      >
        <DialogTitle sx={{ color: '#f44336', fontWeight: 700, fontSize: '1.3rem' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600, mb: 2 }}>
            Are you sure you want to delete "{currentItem?.name}"? This action cannot be undone.
          </Typography>
          {currentItem?.quantity > 0 && (
            <Alert 
              severity="warning" 
              sx={{ 
                mt: 2,
                borderRadius: 3,
                backgroundColor: alpha('#ff9800', 0.1),
                border: `2px solid #ff9800`
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                This item still has {currentItem.quantity} {currentItem.unit} in stock.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ 
              color: customTheme.primary,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(customTheme.primary, 0.1)
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={confirmDelete}
            sx={{ fontWeight: 700, px: 4 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Audit Trail Dialog */}
      <Dialog 
        open={auditDialogOpen} 
        onClose={() => setAuditDialogOpen(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.secondary, 0.2)}`
          }
        }}
      >
        <DialogTitle 
          sx={{
            background: `linear-gradient(45deg, ${customTheme.secondary} 30%, ${customTheme.success} 90%)`,
            color: 'white',
            fontWeight: 700,
            fontSize: '1.3rem'
          }}
        >
          Audit Trail: {currentItem?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {auditLogs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 80, color: alpha(customTheme.primary, 0.3), mb: 2 }} />
              <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 600 }}>
                No audit logs available.
              </Typography>
            </Box>
          ) : (
            <TableContainer 
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                maxHeight: 400
              }}
            >
              <Table size="small">
                <TableHead sx={{ background: alpha(customTheme.secondary, 0.1) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: customTheme.primary }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: customTheme.primary }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: customTheme.primary }}>Field</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: customTheme.primary }}>Old Value</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: customTheme.primary }}>New Value</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: customTheme.primary }}>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log, index) => (
                    <TableRow 
                      key={index}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(customTheme.secondary, 0.05)
                        }
                      }}
                    >
                      <TableCell sx={{ color: customTheme.primary, fontWeight: 500 }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.action} 
                          size="small" 
                          sx={{ 
                            backgroundColor: alpha(customTheme.secondary, 0.2),
                            color: customTheme.secondary,
                            fontWeight: 600
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ color: customTheme.primary, fontWeight: 500 }}>
                        {log.field_changed || '-'}
                      </TableCell>
                      <TableCell sx={{ color: alpha(customTheme.primary, 0.7) }}>
                        {log.old_value || '-'}
                      </TableCell>
                      <TableCell sx={{ color: customTheme.primary, fontWeight: 500 }}>
                        {log.new_value || '-'}
                      </TableCell>
                      <TableCell sx={{ color: customTheme.secondary, fontWeight: 600 }}>
                        {log.user?.username || 'System'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setAuditDialogOpen(false)}
            sx={{ 
              color: customTheme.secondary,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha(customTheme.secondary, 0.1)
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InventoryPage;