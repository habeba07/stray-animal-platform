// pages/DashboardPage.js - ENHANCED VERSION with impressive styling and smart routing

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
  Avatar,
  Fade,
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
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WarningIcon from '@mui/icons-material/Warning';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HomeIcon from '@mui/icons-material/Home';
import EmergencyIcon from '@mui/icons-material/Emergency';
import SparkleIcon from '@mui/icons-material/AutoAwesome';
import { keyframes } from '@mui/system';
import { alpha } from '@mui/material/styles';
import api from '../redux/api';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  grey: '#f3e5ab',
  accent: '#ff8a65',
  background: '#fff8e1',
};

// Enhanced keyframe animations
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

// Colors for charts
const COLORS = ['#8d6e63', '#81c784', '#ff8a65', '#4caf50', '#f3e5ab', '#ff9800'];

// Helper to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

// Helper to get status color for capacity
const getCapacityColor = (percentage) => {
  if (percentage >= 95) return 'error';
  if (percentage >= 80) return 'warning';
  return 'success';
};

// Helper to get urgency color
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
    // Smart routing based on user type
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect volunteers and public users to their gamification dashboard
    if (!['STAFF', 'SHELTER', 'AUTHORITY'].includes(user.user_type)) {
      navigate('/my-dashboard');
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
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.3)} 0%, transparent 70%),
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
          <AssessmentIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <TrendingUpIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            animation: `${float} 10s ease-in-out infinite`,
            animationDelay: '4s'
          }}
        >
          <SparkleIcon sx={{ fontSize: 50, color: alpha(customTheme.secondary, 0.12), transform: 'rotate(30deg)' }} />
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
              <AssessmentIcon sx={{ color: customTheme.accent, fontSize: 30 }} />
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
            Loading Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Gathering analytics and insights...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${alpha('#f44336', 0.2)}`,
          boxShadow: `0 8px 32px ${alpha('#f44336', 0.1)}`
        }}>
          {error || 'Failed to load dashboard data'}
        </Alert>
      </Container>
    );
  }

  // ENHANCED AUTHORITY Dashboard
  if (user.user_type === 'AUTHORITY') {
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
          <PolicyIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
        </Box>

        <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
          {/* Enhanced Header */}
          <Fade in timeout={1000}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography 
                variant="h3" 
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
                }}
              >
                Strategic Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                color="textSecondary" 
                sx={{ 
                  mb: 3,
                  animation: `${slideInUp} 1s ease-out 0.3s both`,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Strategic oversight and policy impact analysis
              </Typography>
            </Box>
          </Fade>

          {/* Population Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: customTheme.primary,
                fontWeight: 700,
                mb: 3
              }}>
                <TrendingUpIcon sx={{ mr: 2, fontSize: 30 }} /> Population Overview
              </Typography>
            </Grid>
            
            {[
              { 
                title: 'Total Population', 
                value: stats.population_stats.total_population.toLocaleString(), 
                subtitle: `+${stats.population_stats.population_growth}% growth`,
                color: customTheme.primary,
                icon: <PeopleIcon />
              },
              { 
                title: 'High-Risk Areas', 
                value: stats.population_stats.high_risk_areas, 
                subtitle: 'Require intervention',
                color: '#ff9800',
                icon: <WarningIcon />
              },
              { 
                title: 'Active Interventions', 
                value: stats.population_stats.intervention_zones, 
                subtitle: 'Zones under management',
                color: customTheme.secondary,
                icon: <LocationOnIcon />
              },
              { 
                title: 'Vaccination Coverage', 
                value: `${stats.health_stats.vaccination_coverage}%`, 
                subtitle: 'Public health metric',
                color: customTheme.success,
                icon: <MedicalServicesIcon />
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={1000} style={{ transitionDelay: `${index * 150}ms` }}>
                  <Card sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(item.color, 0.2)}`,
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, transparent 50%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 1
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `
                        0 20px 40px ${alpha(item.color, 0.25)},
                        0 0 0 1px ${alpha(item.color, 0.2)},
                        inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                      `,
                      border: `2px solid ${alpha(item.color, 0.4)}`,
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{
                          bgcolor: alpha(item.color, 0.15),
                          color: item.color,
                          width: 50,
                          height: 50,
                          mr: 2
                        }}>
                          {item.icon}
                        </Avatar>
                      </Box>
                      <Typography color="text.secondary" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="h4" sx={{ color: item.color, fontWeight: 'bold', mb: 1 }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(item.color, 0.8) }}>
                        {item.subtitle}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Response Efficiency */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: customTheme.primary,
                fontWeight: 700,
                mb: 3
              }}>
                <AssessmentIcon sx={{ mr: 2, fontSize: 30 }} /> Response Efficiency
              </Typography>
            </Grid>
            
            {[
              { 
                title: 'Territory Reports', 
                value: stats.response_stats.total_reports, 
                subtitle: 'Total incidents reported',
                color: customTheme.primary
              },
              { 
                title: 'Avg Response Time', 
                value: `${stats.response_stats.avg_response_time}m`, 
                subtitle: 'Below 2hr target',
                color: customTheme.secondary
              },
              { 
                title: 'Completion Rate', 
                value: `${stats.response_stats.completion_rate}%`, 
                subtitle: 'Cases resolved',
                color: customTheme.success
              },
              { 
                title: 'Territory Coverage', 
                value: `${stats.response_stats.territory_coverage}%`, 
                subtitle: 'Area monitored',
                color: customTheme.accent
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={1000} style={{ transitionDelay: `${(index + 4) * 150}ms` }}>
                  <Card sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(item.color, 0.2)}`,
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, transparent 50%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 1
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `
                        0 20px 40px ${alpha(item.color, 0.25)},
                        0 0 0 1px ${alpha(item.color, 0.2)},
                        inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                      `,
                      border: `2px solid ${alpha(item.color, 0.4)}`,
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                      <Typography color="text.secondary" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="h4" sx={{ color: item.color, fontWeight: 'bold', mb: 1 }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(item.color, 0.8) }}>
                        {item.subtitle}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Budget & Resource Allocation */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: customTheme.primary,
                fontWeight: 700,
                mb: 3
              }}>
                <PolicyIcon sx={{ mr: 2, fontSize: 30 }} /> Budget & Resource Allocation
              </Typography>
            </Grid>
            
            {[
              { 
                title: 'Total Budget', 
                value: formatCurrency(stats.budget_stats.total_budget), 
                subtitle: 'Annual allocation',
                color: customTheme.primary
              },
              { 
                title: 'Funds Allocated', 
                value: formatCurrency(stats.budget_stats.allocated_funds), 
                subtitle: '87% of budget',
                color: customTheme.success
              },
              { 
                title: 'Efficiency Rate', 
                value: `${stats.budget_stats.efficiency_rate}%`, 
                subtitle: 'Above target',
                color: customTheme.secondary
              },
              { 
                title: 'Cost Per Animal', 
                value: formatCurrency(stats.budget_stats.cost_per_animal), 
                subtitle: 'Management cost',
                color: customTheme.accent
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={1000} style={{ transitionDelay: `${(index + 8) * 150}ms` }}>
                  <Card sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(item.color, 0.2)}`,
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, transparent 50%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 1
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `
                        0 20px 40px ${alpha(item.color, 0.25)},
                        0 0 0 1px ${alpha(item.color, 0.2)},
                        inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                      `,
                      border: `2px solid ${alpha(item.color, 0.4)}`,
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                      <Typography color="text.secondary" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="h4" sx={{ color: item.color, fontWeight: 'bold', mb: 1 }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(item.color, 0.8) }}>
                        {item.subtitle}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Strategic Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Fade in timeout={1200}>
                <Paper sx={{ 
                  p: 3,
                  borderRadius: 5,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 30px 60px ${alpha(customTheme.primary, 0.15)}`
                  }
                }}>
                  <Typography variant="h6" gutterBottom sx={{ color: customTheme.primary, fontWeight: 700 }}>
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
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Fade in timeout={1400}>
                <Paper sx={{ 
                  p: 3,
                  borderRadius: 5,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 30px 60px ${alpha(customTheme.primary, 0.15)}`
                  }
                }}>
                  <Typography variant="h6" gutterBottom sx={{ color: customTheme.primary, fontWeight: 700 }}>
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
                      <Bar dataKey="count" name="Incidents" fill={customTheme.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Fade>
            </Grid>
          </Grid>

          {/* Strategic Insights */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Fade in timeout={1600}>
                <Paper sx={{ 
                  p: 4,
                  borderRadius: 6,
                  background: `
                    linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                  `,
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`,
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 30px 60px ${alpha(customTheme.primary, 0.15)}`
                  }
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 3
                  }}>
                    <LocationOnIcon sx={{ mr: 2 }} /> Strategic Insights & Recommendations
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ fontWeight: 700 }}>
                        Population Management
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        TNR programs showing 51% effectiveness in high-risk areas. Consider expanding coverage to eastern suburbs.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ fontWeight: 700 }}>
                        Resource Optimization
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Mobile clinic efficiency at 87%. Recommend additional unit for northern commercial district.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ fontWeight: 700 }}>
                        Policy Impact
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Education campaigns yielding 23% behavior change. Budget increase recommended for broader reach.
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  // ENHANCED STAFF/SHELTER Operational Dashboard
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
        <AssessmentIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <TrendingUpIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
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
              }}
            >
              Operational Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                animation: `${slideInUp} 1s ease-out 0.3s both`,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Real-time insights and management tools for shelter operations
            </Typography>
          </Box>
        </Fade>

        {/* Emergency Alerts Section - Only for SHELTER users */}
        {user?.user_type === 'SHELTER' && stats.medical_alerts && (
          <>
            {(stats.medical_alerts.animals_needing_urgent_care > 0 || 
              stats.medical_alerts.quarantine_ending_today > 0 || 
              stats.medical_alerts.overdue_medical_checkups > 0) && (
              <Fade in timeout={800}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha('#f44336', 0.3)}`,
                    boxShadow: `0 8px 32px ${alpha('#f44336', 0.2)}`,
                    '& .MuiAlert-icon': {
                      fontSize: '2rem'
                    }
                  }}
                  icon={<EmergencyIcon />}
                >
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Emergency Alerts
                  </Typography>
                  {stats.medical_alerts.animals_needing_urgent_care > 0 && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {stats.medical_alerts.animals_needing_urgent_care} animals need urgent medical attention
                    </Typography>
                  )}
                  {stats.medical_alerts.quarantine_ending_today > 0 && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {stats.medical_alerts.quarantine_ending_today} animals finishing quarantine today
                    </Typography>
                  )}
                  {stats.medical_alerts.overdue_medical_checkups > 0 && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {stats.medical_alerts.overdue_medical_checkups} animals overdue for medical checkups
                    </Typography>
                  )}
                  <Button 
                    variant="contained" 
                    color="error" 
                    size="small" 
                    sx={{ 
                      mt: 1,
                      fontWeight: 600,
                      borderRadius: 3
                    }}
                    onClick={() => navigate('/medical-management')}
                  >
                    View Medical Management
                  </Button>
                </Alert>
              </Fade>
            )}
          </>
        )}

        {/* Capacity Status - Only for SHELTER users */}
        {user?.user_type === 'SHELTER' && stats.capacity_stats && (
          <Fade in timeout={1000}>
            <Paper sx={{ 
              p: 4,
              mb: 6,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
              boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`,
              position: 'relative',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 30px 60px ${alpha(customTheme.primary, 0.15)}`
              }
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: customTheme.primary,
                fontWeight: 700,
                mb: 4
              }}>
                <HomeIcon sx={{ mr: 2, fontSize: 28 }} /> Shelter Capacity Status
              </Typography>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h3" sx={{ mr: 3, color: customTheme.primary, fontWeight: 'bold' }}>
                      {stats.capacity_stats.current_occupancy} / {stats.capacity_stats.max_capacity}
                    </Typography>
                    <Chip 
                      label={`${stats.capacity_stats.capacity_percentage}%`}
                      color={getCapacityColor(stats.capacity_stats.capacity_percentage)}
                      size="large"
                      sx={{ fontWeight: 700, fontSize: '1.1rem', px: 2 }}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.capacity_stats.capacity_percentage} 
                    color={getCapacityColor(stats.capacity_stats.capacity_percentage)}
                    sx={{ 
                      height: 16, 
                      borderRadius: 8, 
                      mb: 2,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 8
                      }
                    }}
                  />
                  <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>
                    {stats.capacity_stats.available_space} spaces available
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
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
                      sx={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        py: 3,
                        px: 4,
                        height: 'auto'
                      }}
                    />
                  </Tooltip>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        )}

        {/* Animal Statistics */}
        <Box sx={{ mb: 6 }}>
          <Fade in timeout={800}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary,
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 80%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}>
                <PetsIcon sx={{ fontSize: 32, color: customTheme.primary }} /> 
                Animal Statistics
              </Typography>
              <Typography variant="h6" sx={{ 
                color: alpha(customTheme.primary, 0.7),
                maxWidth: 600,
                mx: 'auto'
              }}>
                Current animal population and care status overview
              </Typography>
            </Box>
          </Fade>
          
          <Grid container spacing={3}>
            {[
              { 
                title: 'Total Animals', 
                value: stats.animal_stats.total_animals, 
                color: customTheme.primary,
                icon: <PetsIcon />
              },
              { 
                title: 'Available for Adoption', 
                value: stats.animal_stats.available_animals, 
                color: customTheme.success,
                icon: <PetsIcon />
              },
              { 
                title: 'Adopted', 
                value: stats.animal_stats.adopted_animals, 
                color: customTheme.secondary,
                icon: <PetsIcon />
              },
              { 
                title: 'Under Treatment', 
                value: stats.animal_stats.under_treatment, 
                color: '#ff9800',
                icon: <LocalHospitalIcon />
              }
            ].concat(
              user?.user_type === 'SHELTER' ? [
                { 
                  title: 'URGENT MEDICAL', 
                  value: stats.animal_stats.urgent_medical || 0, 
                  subtitle: 'Immediate attention needed',
                  color: '#f44336',
                  icon: <EmergencyIcon />,
                  urgent: true
                },
                { 
                  title: 'In Quarantine', 
                  value: stats.animal_stats.quarantine_cases || 0, 
                  subtitle: 'Isolation protocol',
                  color: '#ff9800',
                  icon: <MedicalServicesIcon />
                },
                { 
                  title: 'Ready for Transfer', 
                  value: stats.animal_stats.ready_for_transfer || 0, 
                  subtitle: 'Awaiting placement',
                  color: customTheme.success,
                  icon: <PetsIcon />
                },
                { 
                  title: 'Intake This Week', 
                  value: stats.animal_stats.intake_this_week || 0, 
                  subtitle: 'New arrivals',
                  color: customTheme.primary,
                  icon: <PetsIcon />
                }
              ] : []
            ).map((item, index) => (
              <Grid item xs={12} sm={6} md={user?.user_type === 'SHELTER' ? 3 : 3} key={index}>
                <Fade in timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card sx={{
                    height: '100%',
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: item.urgent ? 'rgba(255, 235, 238, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(item.color, item.urgent ? 0.4 : 0.2)}`,
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    animation: item.urgent ? `${pulse} 2s infinite` : 'none',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, transparent 50%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 1
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `
                        0 20px 40px ${alpha(item.color, 0.25)},
                        0 0 0 1px ${alpha(item.color, 0.2)},
                        inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                      `,
                      border: `2px solid ${alpha(item.color, 0.4)}`,
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 2, p: 3 }}>
                      {item.urgent && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <EmergencyIcon sx={{ mr: 1, color: '#f44336', fontSize: 20 }} />
                          <Typography variant="caption" sx={{ 
                            color: '#f44336', 
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            URGENT
                          </Typography>
                        </Box>
                      )}
                      <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="h3" sx={{ color: item.color, fontWeight: 'bold', mb: 1 }}>
                        {item.value}
                      </Typography>
                      {item.subtitle && (
                        <Typography variant="body2" sx={{ color: alpha(item.color, 0.8), fontWeight: 600 }}>
                          {item.subtitle}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Report Statistics */}
        <Box sx={{ mb: 6 }}>
          <Fade in timeout={800}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary,
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${customTheme.accent} 20%, ${customTheme.secondary} 80%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}>
                <ReportIcon sx={{ fontSize: 32, color: customTheme.accent }} /> 
                Report Statistics
              </Typography>
              <Typography variant="h6" sx={{ 
                color: alpha(customTheme.primary, 0.7),
                maxWidth: 600,
                mx: 'auto'
              }}>
                Incident reporting and response performance metrics
              </Typography>
            </Box>
          </Fade>
          
          <Grid container spacing={3}>
            {[
              { 
                title: 'Total Reports', 
                value: stats.report_stats.total_reports, 
                color: customTheme.primary
              },
              { 
                title: 'Pending Reports', 
                value: stats.report_stats.pending_reports, 
                color: '#ff9800'
              },
              { 
                title: 'Recent Reports (7d)', 
                value: stats.report_stats.recent_reports, 
                color: customTheme.secondary
              },
              { 
                title: 'Completion Rate', 
                value: `${stats.report_stats.completion_rate}%`, 
                color: customTheme.success
              }
            ].concat(
              user?.user_type === 'SHELTER' ? [
                { 
                  title: 'Emergency Reports', 
                  value: stats.report_stats.emergency_reports || 0, 
                  subtitle: 'Immediate response needed',
                  color: '#f44336',
                  urgent: true
                },
                { 
                  title: 'Avg Response Time', 
                  value: `${stats.report_stats.avg_response_time_hours || 0}h`, 
                  subtitle: 'Average response',
                  color: customTheme.primary
                }
              ] : []
            ).map((item, index) => (
              <Grid item xs={12} sm={6} md={user?.user_type === 'SHELTER' ? 2 : 3} key={index}>
                <Fade in timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card sx={{
                    height: '100%',
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: item.urgent ? 'rgba(255, 235, 238, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(item.color, item.urgent ? 0.4 : 0.2)}`,
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    animation: item.urgent ? `${pulse} 2s infinite` : 'none',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, transparent 50%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 1
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `
                        0 20px 40px ${alpha(item.color, 0.25)},
                        0 0 0 1px ${alpha(item.color, 0.2)},
                        inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                      `,
                      border: `2px solid ${alpha(item.color, 0.4)}`,
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 2, p: 3 }}>
                      {item.urgent && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <WarningIcon sx={{ mr: 1, color: '#f44336', fontSize: 20 }} />
                          <Typography variant="caption" sx={{ 
                            color: '#f44336', 
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            PRIORITY
                          </Typography>
                        </Box>
                      )}
                      <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="h3" sx={{ color: item.color, fontWeight: 'bold', mb: 1 }}>
                        {item.value}
                      </Typography>
                      {item.subtitle && (
                        <Typography variant="body2" sx={{ color: alpha(item.color, 0.8), fontWeight: 600 }}>
                          {item.subtitle}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Donation Statistics */}
        <Box sx={{ mb: 6 }}>
          <Fade in timeout={800}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary,
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${customTheme.secondary} 20%, ${customTheme.success} 80%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}>
                <VolunteerActivismIcon sx={{ fontSize: 32, color: customTheme.secondary }} /> 
                Donation Statistics
              </Typography>
              <Typography variant="h6" sx={{ 
                color: alpha(customTheme.primary, 0.7),
                maxWidth: 600,
                mx: 'auto'
              }}>
                Community support and financial contributions overview
              </Typography>
            </Box>
          </Fade>
          
          <Grid container spacing={3}>
            {[
              { 
                title: 'Total Donations', 
                value: formatCurrency(stats.donation_stats.total_amount), 
                color: customTheme.primary
              },
              { 
                title: 'Recent Donations (30d)', 
                value: formatCurrency(stats.donation_stats.recent_amount), 
                color: customTheme.success
              },
              { 
                title: 'Unique Donors', 
                value: stats.donation_stats.donor_count, 
                color: customTheme.secondary
              },
              { 
                title: 'Average Donation', 
                value: formatCurrency(stats.donation_stats.average_donation), 
                color: customTheme.accent
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card sx={{
                    height: '100%',
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(item.color, 0.2)}`,
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, transparent 50%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 1
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `
                        0 20px 40px ${alpha(item.color, 0.25)},
                        0 0 0 1px ${alpha(item.color, 0.2)},
                        inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                      `,
                      border: `2px solid ${alpha(item.color, 0.4)}`,
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 2, p: 3 }}>
                      <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="h3" sx={{ color: item.color, fontWeight: 'bold' }}>
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Charts */}
        <Box sx={{ mb: 6 }}>
          <Fade in timeout={800}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary,
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 80%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}>
                <AssessmentIcon sx={{ fontSize: 32, color: customTheme.primary }} /> 
                Data Analytics
              </Typography>
              <Typography variant="h6" sx={{ 
                color: alpha(customTheme.primary, 0.7),
                maxWidth: 600,
                mx: 'auto'
              }}>
                Visual insights and trend analysis for informed decision making
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Fade in timeout={1200}>
                <Paper sx={{ 
                  p: 4,
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 30px 60px ${alpha(customTheme.primary, 0.15)}`
                  }
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: customTheme.primary, 
                    fontWeight: 700, 
                    mb: 3,
                    textAlign: 'center'
                  }}>
                    Animal Status Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={animalDistribution}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        label={false}
                        outerRadius={90}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth={2}
                      >
                        {animalDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name) => [`${value} animals`, name]}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(customTheme.primary, 0.2)}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        height={80}
                        wrapperStyle={{
                          paddingTop: '20px',
                          fontSize: '12px'
                        }}
                        iconType="circle"
                        formatter={(value) => (
                          <span style={{ fontSize: '12px', fontWeight: 600, color: customTheme.primary }}>
                            {value.replace(/_/g, ' ')}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Status Summary Cards */}
                  <Grid container spacing={1} sx={{ mt: 2 }}>
                    {animalDistribution.slice(0, 4).map((item, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${alpha(COLORS[index % COLORS.length], 0.1)} 0%, ${alpha(COLORS[index % COLORS.length], 0.05)} 100%)`,
                          border: `1px solid ${alpha(COLORS[index % COLORS.length], 0.2)}`,
                          textAlign: 'center'
                        }}>
                          <Typography variant="h6" sx={{ 
                            color: COLORS[index % COLORS.length], 
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }}>
                            {item.value}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: alpha(customTheme.primary, 0.7),
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            {item.name.replace(/_/g, ' ')}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Fade in timeout={1400}>
                <Paper sx={{ 
                  p: 4,
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 30px 60px ${alpha(customTheme.primary, 0.15)}`
                  }
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: customTheme.primary, 
                    fontWeight: 700,
                    mb: 3,
                    textAlign: 'center'
                  }}>
                    Report Trends (Last 6 Months)
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={reportTrends}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(customTheme.primary, 0.1)} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: customTheme.primary }}
                        axisLine={{ stroke: alpha(customTheme.primary, 0.3) }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: customTheme.primary }}
                        axisLine={{ stroke: alpha(customTheme.primary, 0.3) }}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} reports`, 'Count']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(customTheme.primary, 0.2)}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        name="Reports" 
                        fill={customTheme.primary}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Box>

        {/* User Statistics */}
        <Box sx={{ mb: 4 }}>
          <Fade in timeout={800}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary,
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(45deg, ${customTheme.accent} 20%, ${customTheme.primary} 80%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}>
                <PeopleIcon sx={{ fontSize: 32, color: customTheme.accent }} /> 
                User Statistics
              </Typography>
              <Typography variant="h6" sx={{ 
                color: alpha(customTheme.primary, 0.7),
                maxWidth: 600,
                mx: 'auto'
              }}>
                Platform engagement and community growth metrics
              </Typography>
            </Box>
          </Fade>
          
          <Grid container spacing={3}>
            {[
              { 
                title: 'Total Users', 
                value: stats.user_stats.total_users, 
                color: customTheme.primary
              },
              { 
                title: 'New Users (30d)', 
                value: stats.user_stats.new_users, 
                color: customTheme.success
              },
              { 
                title: 'Active Volunteers', 
                value: stats.user_stats.active_volunteers, 
                color: customTheme.secondary
              },
              { 
                title: 'Shelters', 
                value: stats.user_stats.shelters, 
                color: customTheme.accent
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Fade in timeout={1000} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card sx={{
                    height: '100%',
                    borderRadius: 5,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `2px solid ${alpha(item.color, 0.2)}`,
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, transparent 50%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 1
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `
                        0 20px 40px ${alpha(item.color, 0.25)},
                        0 0 0 1px ${alpha(item.color, 0.2)},
                        inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                      `,
                      border: `2px solid ${alpha(item.color, 0.4)}`,
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    <CardContent sx={{ position: 'relative', zIndex: 2, p: 3 }}>
                      <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="h3" sx={{ color: item.color, fontWeight: 'bold' }}>
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default DashboardPage;