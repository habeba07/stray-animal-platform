import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  IconButton,
  Stack,
} from '@mui/material';
import {
  AccountBalance as BudgetIcon,
  Assessment as ReportIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Edit as EditIcon,
  GetApp as ExportIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../redux/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`budget-tabpanel-${index}`}
      aria-labelledby={`budget-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function BudgetManagementPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // States
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budgetData, setBudgetData] = useState(null);
  const [budgetDialog, setBudgetDialog] = useState({ open: false, budget: null });
  const [newBudget, setNewBudget] = useState({
    impact_category: '',
    year: new Date().getFullYear(),
    quarter: 'Q1',
    allocated_amount: ''
  });

  // Check authorization
  useEffect(() => {
    if (!user || !['SHELTER', 'STAFF'].includes(user.user_type)) {
      navigate('/');
      return;
    }

    fetchBudgetData();
  }, [user, navigate]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      
      const [budgetOverview, categories, budgets] = await Promise.all([
        api.get('/budgets/budget_overview/').catch(() => ({ data: {} })),
        api.get('/impact-categories/').catch(() => ({ data: [] })),
        api.get('/budgets/').catch(() => ({ data: [] }))
      ]);

      setBudgetData({
        overview: budgetOverview.data,
        categories: categories.data,
        budgets: budgets.data
      });

    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    try {
      await api.post('/budgets/', newBudget);
      setBudgetDialog({ open: false, budget: null });
      setNewBudget({
        impact_category: '',
        year: new Date().getFullYear(),
        quarter: 'Q1',
        allocated_amount: ''
      });
      fetchBudgetData();
    } catch (err) {
      console.error('Error creating budget:', err);
      setError('Failed to create budget');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getBudgetStatusColor = (utilization) => {
    if (utilization >= 90) return 'error';
    if (utilization >= 75) return 'warning';
    return 'success';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!budgetData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Failed to load budget data'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <BudgetIcon sx={{ mr: 2, color: '#2196f3' }} />
          Budget Management & Financial Reports
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setBudgetDialog({ open: true, budget: null })}
          sx={{ backgroundColor: '#2196f3' }}
        >
          Create Budget
        </Button>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <BudgetIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h5" color="primary.main">
                {formatCurrency(budgetData.overview.total_allocated || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h5" color="warning.main">
                {formatCurrency(budgetData.overview.total_spent || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Spent
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e8' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h5" color="success.main">
                {formatCurrency(budgetData.overview.remaining || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Remaining Budget
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fce4ec' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ReportIcon sx={{ fontSize: 40, color: '#e91e63', mb: 1 }} />
              <Typography variant="h5" color="secondary.main">
                {Math.round(budgetData.overview.utilization_rate || 0)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Budget Utilization
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="💰 Budget Overview" />
          <Tab label="📊 Budget Details" />
          <Tab label="📈 Financial Reports" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* Budget Overview */}
        <Typography variant="h5" gutterBottom>Current Period: {budgetData.overview.current_period}</Typography>
        
        <Grid container spacing={3}>
          {budgetData.overview.budgets_by_category?.map((budget) => (
            <Grid item xs={12} md={6} lg={4} key={budget.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {budget.impact_category_name}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Budget: {formatCurrency(budget.allocated_amount)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Spent: {formatCurrency(budget.spent_amount)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Remaining: {formatCurrency(budget.remaining_budget)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Utilization: {Math.round(budget.budget_utilization)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, budget.budget_utilization)}
                      color={getBudgetStatusColor(budget.budget_utilization)}
                    />
                  </Box>

                  {budget.budget_utilization >= 90 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Budget nearly exhausted!
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Budget Details */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Quarter</TableCell>
                <TableCell align="right">Allocated</TableCell>
                <TableCell align="right">Spent</TableCell>
                <TableCell align="right">Remaining</TableCell>
                <TableCell align="center">Utilization</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgetData.budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.impact_category_name}</TableCell>
                  <TableCell>{budget.year}</TableCell>
                  <TableCell>{budget.quarter}</TableCell>
                  <TableCell align="right">{formatCurrency(budget.allocated_amount)}</TableCell>
                  <TableCell align="right">{formatCurrency(budget.spent_amount)}</TableCell>
                  <TableCell align="right">{formatCurrency(budget.remaining_budget)}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={`${Math.round(budget.budget_utilization)}%`}
                      color={getBudgetStatusColor(budget.budget_utilization)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small"
                      onClick={() => setBudgetDialog({ open: true, budget })}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Financial Reports */}
        <Typography variant="h5" gutterBottom>Financial Reports</Typography>
        <Typography variant="body1" color="textSecondary">
          Financial reporting features will be enhanced here with export capabilities.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<ExportIcon />}
            sx={{ mr: 2 }}
          >
            Export Budget Report
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ExportIcon />}
          >
            Export Financial Summary
          </Button>
        </Box>
      </TabPanel>

      {/* Budget Creation/Edit Dialog */}
      <Dialog 
        open={budgetDialog.open} 
        onClose={() => setBudgetDialog({ open: false, budget: null })} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {budgetDialog.budget ? 'Edit Budget' : 'Create New Budget'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newBudget.impact_category}
                onChange={(e) => setNewBudget({ ...newBudget, impact_category: e.target.value })}
                label="Category"
              >
                {budgetData.categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Year"
              type="number"
              fullWidth
              value={newBudget.year}
              onChange={(e) => setNewBudget({ ...newBudget, year: parseInt(e.target.value) })}
            />

            <FormControl fullWidth>
              <InputLabel>Quarter</InputLabel>
              <Select
                value={newBudget.quarter}
                onChange={(e) => setNewBudget({ ...newBudget, quarter: e.target.value })}
                label="Quarter"
              >
                <MenuItem value="Q1">Q1 (Jan-Mar)</MenuItem>
                <MenuItem value="Q2">Q2 (Apr-Jun)</MenuItem>
                <MenuItem value="Q3">Q3 (Jul-Sep)</MenuItem>
                <MenuItem value="Q4">Q4 (Oct-Dec)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Budget Amount"
              type="number"
              fullWidth
              value={newBudget.allocated_amount}
              onChange={(e) => setNewBudget({ ...newBudget, allocated_amount: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialog({ open: false, budget: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateBudget} 
            variant="contained"
            disabled={!newBudget.impact_category || !newBudget.allocated_amount}
          >
            {budgetDialog.budget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BudgetManagementPage;