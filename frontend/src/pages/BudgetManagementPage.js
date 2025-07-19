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
  Avatar,
  Fade,
  Slide,
  Zoom,
  alpha,
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
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  BarChart as ChartIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
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

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

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
          <BudgetIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <MoneyIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
            Loading Budget Data
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Analyzing financial information...
          </Typography>
        </Box>
      </Box>
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
        <ChartIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <MoneyIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header */}
        <Fade in timeout={1000}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
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
              <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Slide direction="right" in timeout={1200}>
                <Avatar
                  sx={{
                    bgcolor: customTheme.primary,
                    width: 60,
                    height: 60,
                    mr: 3,
                    boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  <BudgetIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Slide>
              
              <Box>
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
                    mb: 1,
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Budget Management Center
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 400,
                    lineHeight: 1.6,
                    animation: `${slideInUp} 1s ease-out 0.3s both`
                  }}
                >
                  Financial oversight and budget planning for shelter operations
                </Typography>
              </Box>
            </Box>

            <Slide direction="left" in timeout={1400}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setBudgetDialog({ open: true, budget: null })}
                sx={{
                  background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${alpha(customTheme.accent, 0.8)} 90%)`,
                  color: '#ffffff',
                  fontWeight: 700,
                  py: 2,
                  px: 4,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
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
                    background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${customTheme.accent} 90%)`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.4)}`,
                    '&::before': {
                      left: '100%'
                    }
                  }
                }}
              >
                Create Budget
              </Button>
            </Slide>
          </Box>
        </Fade>

        {/* Enhanced Quick Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={800} style={{ transitionDelay: '100ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha(customTheme.primary, 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha(customTheme.primary, 0.2)},
                    0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <BudgetIcon sx={{ 
                      fontSize: 50, 
                      color: customTheme.primary, 
                      mb: 2,
                      animation: `${pulse} 3s infinite`,
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 800,
                    mb: 1,
                    background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {formatCurrency(budgetData.overview.total_allocated || 0)}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha(customTheme.primary, 0.7),
                    fontWeight: 600
                  }}>
                    Total Budget
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={800} style={{ transitionDelay: '200ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha(customTheme.accent, 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.accent, 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha(customTheme.accent, 0.2)},
                    0 0 0 1px ${alpha(customTheme.accent, 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha(customTheme.accent, 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <TrendingUpIcon sx={{ 
                      fontSize: 50, 
                      color: customTheme.accent, 
                      mb: 2,
                      animation: `${pulse} 3s infinite`,
                      animationDelay: '1s',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    color: customTheme.accent,
                    fontWeight: 800,
                    mb: 1,
                    background: `linear-gradient(45deg, ${customTheme.accent}, ${customTheme.secondary})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {formatCurrency(budgetData.overview.total_spent || 0)}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha(customTheme.accent, 0.8),
                    fontWeight: 600
                  }}>
                    Total Spent
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={800} style={{ transitionDelay: '300ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha(customTheme.success, 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.success, 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha(customTheme.success, 0.2)},
                    0 0 0 1px ${alpha(customTheme.success, 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <CheckCircleIcon sx={{ 
                      fontSize: 50, 
                      color: customTheme.success, 
                      mb: 2,
                      animation: `${pulse} 3s infinite`,
                      animationDelay: '2s',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    color: customTheme.success,
                    fontWeight: 800,
                    mb: 1,
                    background: `linear-gradient(45deg, ${customTheme.success}, ${customTheme.secondary})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {formatCurrency(budgetData.overview.remaining || 0)}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha(customTheme.success, 0.8),
                    fontWeight: 600
                  }}>
                    Remaining Budget
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Zoom in timeout={800} style={{ transitionDelay: '400ms' }}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 5,
                overflow: 'hidden',
                background: `
                  radial-gradient(circle at top right, ${alpha(customTheme.secondary, 0.15)} 0%, transparent 50%),
                  linear-gradient(135deg, ${alpha(customTheme.background, 0.9)} 0%, ${alpha(customTheme.grey, 0.4)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.secondary, 0.1)}`,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, transparent 50%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `
                    0 20px 40px ${alpha(customTheme.secondary, 0.2)},
                    0 0 0 1px ${alpha(customTheme.secondary, 0.1)},
                    inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                  `,
                  border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                  '&::before': {
                    opacity: 1
                  }
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <ReportIcon sx={{ 
                      fontSize: 50, 
                      color: customTheme.secondary, 
                      mb: 2,
                      animation: `${pulse} 3s infinite`,
                      animationDelay: '3s',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }} />
                  </Box>
                  <Typography variant="h4" sx={{ 
                    color: customTheme.secondary,
                    fontWeight: 800,
                    mb: 1,
                    background: `linear-gradient(45deg, ${customTheme.secondary}, ${customTheme.primary})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {Math.round(budgetData.overview.utilization_rate || 0)}%
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: alpha(customTheme.secondary, 0.8),
                    fontWeight: 600
                  }}>
                    Budget Utilization
                  </Typography>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Enhanced Navigation Tabs */}
        <Slide direction="up" in timeout={1600}>
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
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
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
              <Tab label="Budget Overview" />
              <Tab label="Budget Details" />
              <Tab label="Financial Reports" />
            </Tabs>
          </Paper>
        </Slide>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          <Fade in timeout={1000}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ 
                color: customTheme.primary, 
                fontWeight: 700,
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <BudgetIcon sx={{ fontSize: '1.2em' }} />
                Current Period: {budgetData.overview.current_period}
              </Typography>
              
              <Grid container spacing={3}>
                {budgetData.overview.budgets_by_category?.map((budget, index) => (
                  <Grid item xs={12} md={6} lg={4} key={budget.id}>
                    <Fade in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                      <Card sx={{
                        height: '100%',
                        borderRadius: 5,
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `
                            linear-gradient(135deg, ${alpha(customTheme.background, 0.8)} 0%, transparent 50%),
                            radial-gradient(circle at top right, ${alpha(customTheme.accent, 0.1)} 0%, transparent 50%)
                          `,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          pointerEvents: 'none',
                          zIndex: 1
                        },
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: `
                            0 25px 50px ${alpha(customTheme.primary, 0.25)},
                            0 0 0 1px ${alpha(customTheme.primary, 0.1)},
                            inset 0 1px 0 ${alpha('#ffffff', 0.6)}
                          `,
                          border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
                          '&::before': {
                            opacity: 1
                          }
                        }
                      }}>
                        <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
                          <Typography variant="h5" gutterBottom sx={{ 
                            fontWeight: 700, 
                            color: customTheme.primary,
                            mb: 3
                          }}>
                            {budget.impact_category_name}
                          </Typography>
                          
                          <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                                Budget:
                              </Typography>
                              <Typography variant="body2" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                                {formatCurrency(budget.allocated_amount)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                                Spent:
                              </Typography>
                              <Typography variant="body2" sx={{ color: customTheme.accent, fontWeight: 700 }}>
                                {formatCurrency(budget.spent_amount)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 600 }}>
                                Remaining:
                              </Typography>
                              <Typography variant="body2" sx={{ color: customTheme.success, fontWeight: 700 }}>
                                {formatCurrency(budget.remaining_budget)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: customTheme.primary }}>
                                Utilization
                              </Typography>
                              <Chip
                                label={`${Math.round(budget.budget_utilization)}%`}
                                color={getBudgetStatusColor(budget.budget_utilization)}
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.9rem'
                                }}
                              />
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(100, budget.budget_utilization)}
                              color={getBudgetStatusColor(budget.budget_utilization)}
                              sx={{ 
                                height: 12, 
                                borderRadius: 6,
                                backgroundColor: alpha(customTheme.grey, 0.3),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 6
                                }
                              }}
                            />
                          </Box>

                          {budget.budget_utilization >= 90 && (
                            <Alert 
                              severity="warning" 
                              sx={{ 
                                borderRadius: 3,
                                backgroundColor: alpha(customTheme.accent, 0.1),
                                border: `1px solid ${alpha(customTheme.accent, 0.3)}`,
                                '& .MuiAlert-icon': {
                                  color: customTheme.accent
                                }
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Budget nearly exhausted!
                              </Typography>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Fade in timeout={1000}>
            <Paper sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
              boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.1)}`
            }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(customTheme.primary, 0.05) }}>
                      <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Year</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Quarter</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Allocated</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Spent</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Remaining</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Utilization</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: customTheme.primary, fontSize: '1rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgetData.budgets.map((budget, index) => (
                      <TableRow 
                        key={budget.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(customTheme.primary, 0.02),
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease'
                          },
                          '&:nth-of-type(even)': {
                            backgroundColor: alpha(customTheme.grey, 0.1)
                          }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: customTheme.primary }}>
                          {budget.impact_category_name}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{budget.year}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{budget.quarter}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: customTheme.primary }}>
                          {formatCurrency(budget.allocated_amount)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: customTheme.accent }}>
                          {formatCurrency(budget.spent_amount)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: customTheme.success }}>
                          {formatCurrency(budget.remaining_budget)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${Math.round(budget.budget_utilization)}%`}
                            color={getBudgetStatusColor(budget.budget_utilization)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small"
                            onClick={() => setBudgetDialog({ open: true, budget })}
                            sx={{
                              color: customTheme.primary,
                              '&:hover': {
                                backgroundColor: alpha(customTheme.primary, 0.1),
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Fade>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Fade in timeout={1000}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ 
                color: customTheme.primary, 
                fontWeight: 700,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <ReportIcon sx={{ fontSize: '1.2em' }} />
                Financial Reports
              </Typography>
              
              <Paper sx={{
                p: 6,
                borderRadius: 4,
                background: `
                  radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                  linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                textAlign: 'center'
              }}>
                <ReportIcon sx={{ 
                  fontSize: 80, 
                  color: alpha(customTheme.primary, 0.3), 
                  mb: 3,
                  animation: `${float} 4s ease-in-out infinite`
                }} />
                <Typography variant="h5" sx={{ 
                  color: customTheme.primary, 
                  fontWeight: 700, 
                  mb: 2 
                }}>
                  Advanced Financial Reports
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: alpha(customTheme.primary, 0.7), 
                  mb: 4,
                  maxWidth: 600,
                  mx: 'auto'
                }}>
                  Financial reporting features will be enhanced here with export capabilities and detailed analytics.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    startIcon={<ExportIcon />}
                    sx={{
                      background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                      color: '#ffffff',
                      fontWeight: 700,
                      py: 2,
                      px: 4,
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                      }
                    }}
                  >
                    Export Budget Report
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<ExportIcon />}
                    sx={{
                      background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${alpha(customTheme.accent, 0.8)} 90%)`,
                      color: '#ffffff',
                      fontWeight: 700,
                      py: 2,
                      px: 4,
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${customTheme.accent} 90%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.3)}`
                      }
                    }}
                  >
                    Export Financial Summary
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Fade>
        </TabPanel>

        {/* Enhanced Budget Creation/Edit Dialog */}
        <Dialog 
          open={budgetDialog.open} 
          onClose={() => setBudgetDialog({ open: false, budget: null })} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: customTheme.background,
              border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ 
            color: customTheme.primary, 
            fontWeight: 700, 
            fontSize: '1.5rem',
            borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`,
            pb: 2
          }}>
            {budgetDialog.budget ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>Category</InputLabel>
                <Select
                  value={newBudget.impact_category}
                  onChange={(e) => setNewBudget({ ...newBudget, impact_category: e.target.value })}
                  label="Category"
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
                sx={{
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(customTheme.primary, 0.3),
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: customTheme.primary
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: customTheme.primary
                    }
                  }
                }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>Quarter</InputLabel>
                <Select
                  value={newBudget.quarter}
                  onChange={(e) => setNewBudget({ ...newBudget, quarter: e.target.value })}
                  label="Quarter"
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
                sx={{
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(customTheme.primary, 0.3),
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: customTheme.primary
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: customTheme.primary
                    }
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={() => setBudgetDialog({ open: false, budget: null })}
              sx={{ 
                color: alpha(customTheme.primary, 0.7), 
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: alpha(customTheme.primary, 0.1)
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBudget} 
              variant="contained"
              disabled={!newBudget.impact_category || !newBudget.allocated_amount}
              sx={{
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                color: '#ffffff',
                fontWeight: 700,
                px: 4,
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 20px ${alpha(customTheme.primary, 0.3)}`
                },
                '&:disabled': {
                  background: alpha(customTheme.primary, 0.3),
                  color: alpha('#ffffff', 0.5)
                }
              }}
            >
              {budgetDialog.budget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default BudgetManagementPage;