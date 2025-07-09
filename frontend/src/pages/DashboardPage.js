// pages/DashboardPage.js - ENHANCED VERSION with new features for SHELTER users

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
  Divider,
  Chip,
  LinearProgress,
  Button,
  Tooltip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import PetsIcon from '@mui/icons-material/Pets';
import ReportIcon from '@mui/icons-material/Report';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PeopleIcon from '@mui/icons-material/People';
import PolicyIcon from '@mui/icons-material/Policy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';  // NEW
import WarningIcon from '@mui/icons-material/Warning';  // NEW
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';  // NEW
import HomeIcon from '@mui/icons-material/Home';  // NEW
import EmergencyIcon from '@mui/icons-material/Emergency';  // NEW
import api from '../redux/api';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#8884D8'];

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

// NEW: Helper to get status color for capacity
const getCapacityColor = (percentage) => {
  if (percentage >= 95) return 'error';
  if (percentage >= 80) return 'warning';
  return 'success';
};

// NEW: Helper to get urgency color
const getUrgencyColor = (level) => {
  switch (level) {
    case 'EMERGENCY': return '#f44336';
    case 'HIGH': return '#ff9800';
    case 'NORMAL': return '#4caf50';
    default: return '#9e9e9e';
  }
};

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [animalDistribution, setAnimalDistribution] = useState([]);
  const [reportTrends, setReportTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authorized to view dashboard
    if (!user || !['STAFF', 'SHELTER', 'AUTHORITY'].includes(user.user_type)) {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user.user_type === 'AUTHORITY') {
        // EXISTING AUTHORITY logic - keep unchanged
        const strategicRes = await api.get('/authority-analytics/test_endpoint/');

        console.log('Authority API response:', strategicRes.data);

        const totalAnimals = strategicRes.data?.total_animals || 0;
        const totalReports = strategicRes.data?.total_reports || 0;

        setStats({
          strategic_data: strategicRes.data,
          user_type: 'AUTHORITY',
          population_stats: {
            total_population: totalAnimals,
            population_growth: 12.3,
            high_risk_areas: 23,
            intervention_zones: 8
          },
          response_stats: {
            total_reports: totalReports,
            avg_response_time: 98,
            completion_rate: 75,
            territory_coverage: 87.5
          },
          budget_stats: {
            total_budget: 1250000,
            allocated_funds: 1087500,
            efficiency_rate: 91.4,
            cost_per_animal: 127.50
          },
          health_stats: {
            vaccination_coverage: 73.2,
            disease_incidents: 12,
            prevention_success: 94.5,
            risk_level: 'Medium'
          }
        });
        
        setAnimalDistribution([
          { name: 'High Risk Areas', value: 23 },
          { name: 'Medium Risk Areas', value: 45 },
          { name: 'Low Risk Areas', value: 67 },
          { name: 'Intervention Zones', value: 8 }
        ]);
        
        setReportTrends([
          { month: 'Jan', count: 234 },
          { month: 'Feb', count: 267 },
          { month: 'Mar', count: 289 },
          { month: 'Apr', count: 312 },
          { month: 'May', count: 298 },
          { month: 'Jun', count: 276 }
        ]);
        
      } else {
        // ENHANCED operational data for STAFF/SHELTER users
        const [statsRes, distributionRes, trendsRes] = await Promise.all([
          api.get('/dashboard/stats/'),
          api.get('/dashboard/animals/distribution/'),
          api.get('/dashboard/reports/trends/')
        ]);

        setStats(statsRes.data);
        
        // Format animal distribution data for pie chart
        const distributionData = distributionRes.data.map(item => ({
          name: item.status,
          value: item.count
        }));
        setAnimalDistribution(distributionData);
        
        // Format report trends data for bar chart
        const trendsData = trendsRes.data.map(item => {
          const date = new Date(item.month);
          return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            count: item.count
          };
        });
        setReportTrends(trendsData);
      }
      
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Failed to load dashboard data'}</Alert>
      </Container>
    );
  }

  // EXISTING AUTHORITY Dashboard - keep unchanged
  if (user.user_type === 'AUTHORITY') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🏛️ Strategic Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
          Strategic oversight and policy impact analysis
        </Typography>

        {/* Population Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 1 }} /> Population Overview
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Population
                </Typography>
                <Typography variant="h4">
                  {stats.population_stats.total_population.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  +{stats.population_stats.population_growth}% growth
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  High-Risk Areas
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.population_stats.high_risk_areas}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Require intervention
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Interventions
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.population_stats.intervention_zones}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Zones under management
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Vaccination Coverage
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.health_stats.vaccination_coverage}%
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Public health metric
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Response Efficiency */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1 }} /> Response Efficiency
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Territory Reports
                </Typography>
                <Typography variant="h4">
                  {stats.response_stats.total_reports}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Total incidents reported
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg Response Time
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.response_stats.avg_response_time}m
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Below 2hr target
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Completion Rate
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.response_stats.completion_rate}%
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Cases resolved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Territory Coverage
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.response_stats.territory_coverage}%
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Area monitored
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Budget & Resource Allocation */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PolicyIcon sx={{ mr: 1 }} /> Budget & Resource Allocation
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Budget
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(stats.budget_stats.total_budget)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Annual allocation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Funds Allocated
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(stats.budget_stats.allocated_funds)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  87% of budget
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Efficiency Rate
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.budget_stats.efficiency_rate}%
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Above target
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Cost Per Animal
                </Typography>
                <Typography variant="h4" color="info.main">
                  {formatCurrency(stats.budget_stats.cost_per_animal)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Management cost
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Strategic Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2,
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
            }}>
              <Typography variant="h6" gutterBottom>
                Risk Area Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={animalDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {animalDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} areas`, 'Count']} />
                  <Legend />
                </PieChart>
                </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
              p: 2,
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
            }}>
              <Typography variant="h6" gutterBottom>
                Population Trends (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={reportTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => [`${value} reports`, 'Population Indicators']} />
                  <Legend />
                  <Bar dataKey="count" name="Incidents" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Strategic Insights */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3,
              backgroundColor: '#e3f2fd',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
              border: '1px solid #bbdefb'
            }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 1 }} /> Strategic Insights & Recommendations
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>
                    Population Management
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    TNR programs showing 51% effectiveness in high-risk areas. Consider expanding coverage to eastern suburbs.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>
                    Resource Optimization
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Mobile clinic efficiency at 87%. Recommend additional unit for northern commercial district.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>
                    Policy Impact
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Education campaigns yielding 23% behavior change. Budget increase recommended for broader reach.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // ENHANCED STAFF/SHELTER Operational Dashboard
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Operational Dashboard
      </Typography>

      {/* NEW: Emergency Alerts Section - Only for SHELTER users */}
      {user?.user_type === 'SHELTER' && stats.medical_alerts && (
        <>
          {(stats.medical_alerts.animals_needing_urgent_care > 0 || 
            stats.medical_alerts.quarantine_ending_today > 0 || 
            stats.medical_alerts.overdue_medical_checkups > 0) && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, backgroundColor: '#ffebee', borderRadius: 2 }}
              icon={<EmergencyIcon />}
            >
              <Typography variant="h6" gutterBottom>
                🚨 Emergency Alerts
              </Typography>
              {stats.medical_alerts.animals_needing_urgent_care > 0 && (
                <Typography variant="body2">
                  • {stats.medical_alerts.animals_needing_urgent_care} animals need urgent medical attention
                </Typography>
              )}
              {stats.medical_alerts.quarantine_ending_today > 0 && (
                <Typography variant="body2">
                  • {stats.medical_alerts.quarantine_ending_today} animals finishing quarantine today
                </Typography>
              )}
              {stats.medical_alerts.overdue_medical_checkups > 0 && (
                <Typography variant="body2">
                  • {stats.medical_alerts.overdue_medical_checkups} animals overdue for medical checkups
                </Typography>
              )}
              <Button 
                variant="contained" 
                color="error" 
                size="small" 
                sx={{ mt: 1 }}
                onClick={() => navigate('/medical-management')}
              >
                View Medical Management
              </Button>
            </Alert>
          )}
        </>
      )}

      {/* NEW: Capacity Status - Only for SHELTER users */}
      {user?.user_type === 'SHELTER' && stats.capacity_stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              backgroundColor: '#fff8e1',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
            }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 1 }} /> Shelter Capacity Status
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h4" sx={{ mr: 2 }}>
                      {stats.capacity_stats.current_occupancy} / {stats.capacity_stats.max_capacity}
                    </Typography>
                    <Chip 
                      label={`${stats.capacity_stats.capacity_percentage}%`}
                      color={getCapacityColor(stats.capacity_stats.capacity_percentage)}
                      size="small"
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.capacity_stats.capacity_percentage} 
                    color={getCapacityColor(stats.capacity_stats.capacity_percentage)}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {stats.capacity_stats.available_space} spaces available
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Tooltip title="Current capacity status">
                    <Chip
                      label={
                        stats.capacity_stats.status === 'full' ? 'AT CAPACITY' :
                        stats.capacity_stats.status === 'high' ? 'HIGH OCCUPANCY' : 'NORMAL'
                      }
                      color={
                        stats.capacity_stats.status === 'full' ? 'error' :
                        stats.capacity_stats.status === 'high' ? 'warning' : 'success'
                      }
                      variant="filled"
                      sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}
                    />
                  </Tooltip>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ENHANCED Animal Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PetsIcon sx={{ mr: 1 }} /> Animal Statistics
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Animals
              </Typography>
              <Typography variant="h4">
                {stats.animal_stats.total_animals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Available for Adoption
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.animal_stats.available_animals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Adopted
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.animal_stats.adopted_animals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Under Treatment
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.animal_stats.under_treatment}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* NEW: Emergency/Medical Cards - Only for SHELTER users */}
        {user?.user_type === 'SHELTER' && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                backgroundColor: '#ffebee',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                border: '2px solid #ffcdd2',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmergencyIcon sx={{ mr: 1, color: '#f44336' }} />
                    URGENT MEDICAL
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.animal_stats.urgent_medical || 0}
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Immediate attention needed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                backgroundColor: '#fff3e0',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    In Quarantine
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.animal_stats.quarantine_cases || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Isolation protocol
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                backgroundColor: '#e8f5e8',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Ready for Transfer
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.animal_stats.ready_for_transfer || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Awaiting placement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                backgroundColor: '#fff8e1',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Intake This Week
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats.animal_stats.intake_this_week || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    New arrivals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* ENHANCED Report Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ReportIcon sx={{ mr: 1 }} /> Report Statistics
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Reports
              </Typography>
              <Typography variant="h4">
                {stats.report_stats.total_reports}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Reports
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.report_stats.pending_reports}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Recent Reports (7d)
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.report_stats.recent_reports}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.report_stats.completion_rate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* NEW: Emergency Response Cards - Only for SHELTER users */}
        {user?.user_type === 'SHELTER' && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                backgroundColor: '#ffebee',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1, color: '#f44336' }} />
                    Emergency Reports
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.report_stats.emergency_reports || 0}
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                    Immediate response needed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                backgroundColor: '#fff8e1',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats.report_stats.avg_response_time_hours || 0}h
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Average response
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Existing Donation Stats - keep unchanged */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <VolunteerActivismIcon sx={{ mr: 1 }} /> Donation Statistics
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Donations
              </Typography>
              <Typography variant="h4">
                {formatCurrency(stats.donation_stats.total_amount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Recent Donations (30d)
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(stats.donation_stats.recent_amount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Unique Donors
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.donation_stats.donor_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Donation
              </Typography>
              <Typography variant="h4" color="info.main">
                {formatCurrency(stats.donation_stats.average_donation)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 2,
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
          }}>
            <Typography variant="h6" gutterBottom>
              Animal Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={animalDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {animalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} animals`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 2,
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)'
          }}>
            <Typography variant="h6" gutterBottom>
              Report Trends (Last 6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={reportTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`${value} reports`, 'Count']} />
                <Legend />
                <Bar dataKey="count" name="Reports" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* User Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 1 }} /> User Statistics
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {stats.user_stats.total_users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                New Users (30d)
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.user_stats.new_users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Volunteers
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.user_stats.active_volunteers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: '#fff8e1',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
              transition: 'all 0.3s ease'
            }
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Shelters
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.user_stats.shelters}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DashboardPage;