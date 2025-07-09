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
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { useNavigate } from 'react-router-dom';
import api from '../../redux/api';

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

  // FIXED: Better status determination
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
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#8d6e63' }}>
          Inventory Dashboard
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/inventory/items')}
          sx={{ backgroundColor: '#8d6e63', '&:hover': { backgroundColor: '#6d4c41' } }}
        >
          Manage Inventory
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Enhanced Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff8e1' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', color: '#8d6e63' }}>
                <InventoryIcon sx={{ mr: 1 }} />
                {summary?.total_items || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary?.medical_items || 0} medical items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff8e1' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Urgent Actions
              </Typography>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', color: '#ff8a65' }}>
                <WarningIcon sx={{ mr: 1 }} />
                {(summary?.low_stock_items || 0) + (summary?.expiring_soon || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary?.low_stock_items || 0} low stock, {summary?.expiring_soon || 0} expiring
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff8e1' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                On Order
              </Typography>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', color: '#81c784' }}>
                <LocalShippingIcon sx={{ mr: 1 }} />
                {summary?.on_order_items || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Items being delivered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff8e1' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Inventory Value
              </Typography>
              <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', color: '#4caf50' }}>
                <AttachMoneyIcon sx={{ mr: 1 }} />
                {formatCurrency(summary?.total_value || 0)}
              </Typography>
              {summary?.items_missing_cost > 0 && (
                <Typography variant="body2" color="warning.main">
                  {summary.items_missing_cost} items missing cost data
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Procurement Suggestions */}
      {procurementSuggestions.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fff8e1' }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#8d6e63' }}>
            Procurement Suggestions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            {procurementSuggestions.slice(0, 4).map((suggestion, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card variant="outlined" sx={{ borderColor: getUrgencyColor(suggestion.urgency) + '.main' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {suggestion.item_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current: {suggestion.current_stock} {suggestion.item?.unit || ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Suggested: {suggestion.suggested_quantity} {suggestion.item?.unit || ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Estimated cost: {formatCurrency(suggestion.estimated_cost)}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={suggestion.urgency} 
                        color={getUrgencyColor(suggestion.urgency)} 
                        size="small" 
                      />
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleOrderNow(suggestion)}
                        sx={{ 
                          backgroundColor: '#ff8a65', 
                          '&:hover': { backgroundColor: '#ff7043' },
                          fontSize: '0.75rem'
                        }}
                      >
                        Order
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Low Stock Alerts with Actions */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fff8e1' }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#8d6e63' }}>
          Low Stock Alerts
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {lowStockItems.length === 0 ? (
          <Alert severity="success">
            All items are well-stocked!
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {lowStockItems.slice(0, 4).map((item) => {
              const status = getItemStatus(item);
              return (
                <Grid item xs={12} sm={6} md={3} key={item.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.name}
                        {item.item_type === 'MEDICAL' && (
                          <MedicalServicesIcon sx={{ ml: 1, fontSize: 16, color: '#ff8a65' }} />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Current: {item.quantity} {item?.unit || ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Minimum: {item.minimum_threshold} {item.unit}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={status.label}
                          color={status.color} 
                          size="small" 
                          icon={status.icon}
                        />
                        <Tooltip title="Create purchase order">
                          <IconButton
                            size="small"
                            onClick={() => handleOrderNow(item)}
                            sx={{ color: '#ff8a65' }}
                          >
                            <ShoppingCartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            
            {lowStockItems.length > 4 && (
              <Grid item xs={12}>
                <Button
                  onClick={() => navigate('/inventory/items')}
                  variant="text"
                  sx={{ color: '#8d6e63' }}
                >
                  View all {lowStockItems.length} low stock items
                </Button>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      {/* Expiring Soon Items with Better Status */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fff8e1' }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#8d6e63' }}>
          Expiring Soon
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {expiringItems.length === 0 ? (
          <Alert severity="success">
            No items are expiring soon!
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {expiringItems.slice(0, 4).map((item) => {
              const status = getItemStatus(item);
              const daysUntilExpiry = item.days_until_expiry;
              const isUrgent = daysUntilExpiry <= 7;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={item.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderColor: isUrgent ? 'error.main' : 'warning.main',
                      backgroundColor: isUrgent ? '#ffebee' : '#fff3e0'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.name}
                        {item.item_type === 'MEDICAL' && (
                          <MedicalServicesIcon sx={{ ml: 1, fontSize: 16, color: '#ff8a65' }} />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Quantity: {item.quantity} {item?.unit || ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expires: {new Date(item.expiry_date).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`${daysUntilExpiry} days remaining`}
                          color={isUrgent ? 'error' : 'warning'} 
                          size="small" 
                          icon={<EventIcon />}
                        />
                        <Button size="small" variant="outlined" startIcon={<ShoppingCartIcon />} onClick={() => handleOrderNow(item)} sx={{ ml: 1, borderColor: "#ff8a65", color: "#ff8a65", "&:hover": { backgroundColor: "#fff3e0" }, fontSize: "0.75rem" }}>Order Fresh</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            
            {expiringItems.length > 4 && (
              <Grid item xs={12}>
                <Button
                  onClick={() => navigate('/inventory/items')}
                  variant="text"
                  sx={{ color: '#8d6e63' }}
                >
                  View all {expiringItems.length} expiring items
                </Button>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      {/* Stock Forecast */}
      <Paper sx={{ p: 3, backgroundColor: '#fff8e1' }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#8d6e63' }}>
          30-Day Stock Forecast
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {forecast.length === 0 ? (
          <Alert severity="info">
            No forecast data available. This may be due to insufficient consumption history.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {forecast.slice(0, 4).map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current: {item.current_quantity} {item.unit}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Days remaining: {item.days_remaining || "No consumption data"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Predicted need: {item.predicted_need} {item.unit}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {forecast.length > 4 && (
              <Grid item xs={12}>
                <Button
                  onClick={() => navigate('/inventory/forecast')}
                  variant="text"
                  sx={{ color: '#8d6e63' }}
                >
                  View full forecast
                </Button>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      {/* Order Now Dialog */}
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#8d6e63', color: 'white' }}>
          Create Purchase Order
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedItem && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedItem.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Stock: {selectedItem.quantity} {selectedItem.unit}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Minimum Threshold: {selectedItem.minimum_threshold} {selectedItem.unit}
              </Typography>
              
              <TextField
                margin="normal"
                fullWidth
                label="Quantity to Order"
                type="number"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                inputProps={{ min: 1 }}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={orderForm.supplier_id}
                  label="Supplier"
                  onChange={(e) => setOrderForm(prev => ({ ...prev, supplier_id: e.target.value }))}
                >
                  {suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name} {supplier.is_preferred && '(Preferred)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Estimated Cost: {formatCurrency((orderForm.quantity || 0) * (selectedItem?.cost_per_unit || 0))}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleOrderSubmit}
            disabled={!orderForm.quantity || !orderForm.supplier_id}
            sx={{ backgroundColor: '#8d6e63', '&:hover': { backgroundColor: '#6d4c41' } }}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default InventoryDashboard;