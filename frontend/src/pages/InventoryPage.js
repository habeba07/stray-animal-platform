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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningIcon from '@mui/icons-material/Warning';
import api from '../redux/api';

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
          Inventory Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ backgroundColor: '#8d6e63', '&:hover': { backgroundColor: '#6d4c41' } }}
        >
          Add Item
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#fff8e1' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search Items"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
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

          <FormControl size="small" sx={{ minWidth: 150 }}>
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
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Cost Per Unit</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((item) => {
                const status = getItemStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.item_type === 'MEDICAL' && (
                          <MedicalServicesIcon sx={{ mr: 1, fontSize: 16, color: '#ff8a65' }} />
                        )}
                        {item.name}
                        {item.batch_number && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({item.batch_number})
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.item_type} 
                        size="small" 
                        variant="outlined"
                        color={item.item_type === 'MEDICAL' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {item.category_details ? item.category_details.name : ''}
                    </TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                      {item.on_order_quantity > 0 && (
                        <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                          (+{item.on_order_quantity} on order)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.cost_per_unit)}
                    </TableCell>
                    <TableCell>
                      {formatDate(item.expiry_date)}
                      {item.days_until_expiry !== null && item.days_until_expiry <= 30 && (
                        <Typography variant="caption" color="warning.main" sx={{ ml: 1 }}>
                          ({item.days_until_expiry} days)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={status.label}
                        color={status.color} 
                        size="small" 
                        icon={status.icon}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit item">
                        <IconButton onClick={() => handleOpenForm(item)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="View audit trail">
                        <IconButton onClick={() => handleViewAuditTrail(item)} size="small">
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {item.is_low_on_stock && item.preferred_supplier && (
                        <Tooltip title="Order now">
                          <IconButton onClick={() => handleOrderNow(item)} size="small" sx={{ color: '#ff8a65' }}>
                            <ShoppingCartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Delete item">
                        <IconButton onClick={() => handleDeleteItem(item)} size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {paginatedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Enhanced Add/Edit Item Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle sx={{ backgroundColor: '#8d6e63', color: 'white' }}>
          {currentItem ? `Edit Item: ${currentItem.name}` : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Item Name *"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
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
              <FormControl fullWidth required>
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
            
            <Grid item xs={12} sm={6}>
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
              />
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
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
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
              />
            </Grid>
            
            <Divider sx={{ width: '100%', my: 2 }} />
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="expiry_date"
                label="Expiry Date"
                type="date"
                value={formData.expiry_date}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
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
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="location"
                label="Storage Location"
                value={formData.location}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
                  />
                }
                label="Requires Refrigeration"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitForm}
            disabled={!formData.name || !formData.category || !formData.cost_per_unit}
            sx={{ backgroundColor: '#8d6e63', '&:hover': { backgroundColor: '#6d4c41' } }}
          >
            {currentItem ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{currentItem?.name}"? This action cannot be undone.
          </Typography>
          {currentItem?.quantity > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This item still has {currentItem.quantity} {currentItem.unit} in stock.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Audit Trail Dialog */}
      <Dialog open={auditDialogOpen} onClose={() => setAuditDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Audit Trail: {currentItem?.name}
        </DialogTitle>
        <DialogContent>
          {auditLogs.length === 0 ? (
            <Typography>No audit logs available.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Field</TableCell>
                    <TableCell>Old Value</TableCell>
                    <TableCell>New Value</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.field_changed || '-'}</TableCell>
                      <TableCell>{log.old_value || '-'}</TableCell>
                      <TableCell>{log.new_value || '-'}</TableCell>
                      <TableCell>{log.user?.username || 'System'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default InventoryPage;