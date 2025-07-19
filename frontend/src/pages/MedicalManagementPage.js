// pages/MedicalManagementPage.js - Enhanced with impressive styling

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Checkbox,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  MedicalServices as MedicalIcon,
  Emergency as EmergencyIcon,
  LocalHospital as HospitalIcon,
  Vaccines as VaccinesIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Inventory as InventoryIcon,
  Lock as QuarantinedIcon, 
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  AutoAwesome as SparkleIcon,
  TrendingUp as TrendingIcon,
  Healing as HealingIcon,
  Science as ScienceIcon,
  MonitorHeart as MonitorIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../redux/api';

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
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.error, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha(customTheme.error, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.error, 0)}; }
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
      id={`medical-tabpanel-${index}`}
      aria-labelledby={`medical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function MedicalManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  
  // States
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [medicalData, setMedicalData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [selectedAnimalsForReport, setSelectedAnimalsForReport] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [treatmentForm, setTreatmentForm] = useState({
    treatmentType: '',
    treatmentNotes: '',
    veterinarian: '',
    newStatus: ''
  });

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

  // Check authorization
  useEffect(() => {
    if (!user || !['STAFF', 'SHELTER'].includes(user.user_type)) {
      navigate('/');
      return;
    }

    // Check if we should focus on a specific animal from URL params
    const animalId = searchParams.get('animal');
    if (animalId) {
      setSelectedAnimal(animalId);
      setActiveTab(1); // Switch to urgent care tab
    }

    fetchMedicalData();
  }, [user, navigate, searchParams]);

  const fetchMedicalData = async () => {
    try {
      setLoading(true);
    
      // Fetch medical dashboard data
      const [urgentAnimalsRes, vaccinationsRes, treatmentsRes, inventoryRes] = await Promise.all([
        api.get('/animals/?status=URGENT_MEDICAL,UNDER_TREATMENT,QUARANTINE'),
        api.get('/vaccinations/'),
        api.get('/medical-records/'),
        api.get('/inventory-items/?category=medical').catch(() => ({ data: [] }))
      ]);

      // Fix: Extract the actual data arrays from the API responses
      const animalsData = urgentAnimalsRes.data.results || urgentAnimalsRes.data || [];
      const vaccinationsData = vaccinationsRes.data.results || vaccinationsRes.data || [];
      const treatmentsData = treatmentsRes.data.results || treatmentsRes.data || [];
      const inventoryData = inventoryRes.data.results || inventoryRes.data || [];

      // Process the data
      const urgentAnimals = animalsData.filter(animal => 
        ['URGENT_MEDICAL', 'UNDER_TREATMENT', 'QUARANTINE'].includes(animal.status) ||
        animal.priority_level === 'EMERGENCY'
      );

      const upcomingVaccinations = vaccinationsData.filter(vacc => {
        if (!vacc.next_due_date) return false;
        const dueDate = new Date(vacc.next_due_date);
        const today = new Date();
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
      });

      const recentTreatments = treatmentsData
        .filter(treatment => {
          const treatmentDate = new Date(treatment.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return treatmentDate >= weekAgo;
        })
        .slice(0, 10);

      setMedicalData({
        urgentAnimals,
        upcomingVaccinations,
        recentTreatments,
        medicalInventory: inventoryData,
        stats: {
          urgentCases: urgentAnimals.filter(a => a.status === 'URGENT_MEDICAL' || a.priority_level === 'EMERGENCY').length,
          inTreatment: urgentAnimals.filter(a => a.status === 'UNDER_TREATMENT').length,
          inQuarantine: urgentAnimals.filter(a => a.status === 'QUARANTINE').length,
          vaccinationsDue: upcomingVaccinations.length,
          lowStockItems: inventoryData.filter(item => item.quantity <= item.reorder_level).length
        }
      });

    } catch (err) {
      console.error('Error fetching medical data:', err);
      setError('Failed to load medical data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'EMERGENCY': return 'error';
      case 'HIGH': return 'warning';
      case 'NORMAL': return 'info';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'EMERGENCY': return <EmergencyIcon color="error" />;
      case 'HIGH': return <WarningIcon color="warning" />;
      default: return <CheckCircleIcon color="success" />;
    }
  };

  const handleGenerateMedicalReport = () => {
    setReportType('medical_report');
    setReportDialogOpen(true);
  };

  const handleExportTreatmentRecords = () => {
    setReportType('treatment_records');
    setReportDialogOpen(true);
  };

  const handleScheduleVetVisit = () => {
    setMessage('Vet visit scheduling coming soon!');
  };

  const generateHealthCertificate = async (animalId, reportType) => {
    try {
      setReportLoading(true);
    
      const animalResponse = await api.get(`/animals/${animalId}/`);
      const animal = animalResponse.data;
    
      const medicalResponse = await api.get(`/medical-records/?animal=${animalId}`);
      const medicalRecords = medicalResponse.data;
    
      const vaccinationResponse = await api.get(`/vaccinations/?animal=${animalId}`);
      const vaccinations = vaccinationResponse.data;
    
      const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Health Certificate - ${animal.name || 'Unnamed'}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; }
      .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
      .section { margin-bottom: 20px; }
      .section h3 { color: #2196f3; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f5f5f5; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>ANIMAL HEALTH CERTIFICATE</h1>
      <p><strong>PawRescue Animal Management System</strong></p>
      <p>Certificate Date: ${new Date().toLocaleDateString()}</p>
    </div>
  
    <div class="section">
      <h3>Animal Information</h3>
      <table>
        <tr><td><strong>Name:</strong></td><td>${animal.name || 'Unnamed'}</td></tr>
        <tr><td><strong>Type:</strong></td><td>${animal.animal_type}</td></tr>
        <tr><td><strong>Breed:</strong></td><td>${animal.breed || 'Unknown'}</td></tr>
        <tr><td><strong>Gender:</strong></td><td>${animal.gender}</td></tr>
        <tr><td><strong>Status:</strong></td><td>${animal.status}</td></tr>
        <tr><td><strong>Health Status:</strong></td><td>${animal.health_status || 'Not specified'}</td></tr>
      </table>
    </div>
  
    <div class="section">
      <h3>Health Certification</h3>
      <p>This animal has been examined and found to be in good health condition for adoption/transfer purposes.</p>
      <p><strong>Generated by:</strong> ${user.username}</p>
    </div>
  </body>
  </html>`;
    
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-certificate-${animal.name || 'unnamed'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    
      setMessage(`Health certificate generated for ${animal.name || 'Unnamed'}`);
    
    } catch (error) {
      console.error('Error generating health certificate:', error);
      setError('Failed to generate health certificate');
    } finally {
      setReportLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleQuickTreatment = (animal) => {
    setSelectedAnimal(animal);
    setDialogOpen(true);
  };

  const handleSaveEmergencyTreatment = async () => {
    console.log("Emergency treatment save clicked!");
    console.log("Form data:", treatmentForm);
  
    try {
      // Create medical record
      await api.post('/medical-records/', {
        animal: selectedAnimal.id,
        reason: treatmentForm.treatmentNotes,
        veterinarian: treatmentForm.veterinarian,
        record_type: treatmentForm.treatmentType.toUpperCase() || 'EMERGENCY',
        date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatment: treatmentForm.treatmentNotes,
        medications: '',
        clinic_name: '',
        follow_up_required: false,
        follow_up_date: null
      });
    
      // Update animal status
      await api.patch(`/animals/${selectedAnimal.id}/`, {
        status: treatmentForm.newStatus,
        priority_level: 'NORMAL' 
      });
    
      // Refresh data and close dialog
      await fetchMedicalData();
      setDialogOpen(false);
      setTreatmentForm({ treatmentType: '', treatmentNotes: '', veterinarian: '', newStatus: '' });
    
    } catch (error) {
      console.error("Emergency treatment save error:", error);
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
          <MedicalIcon sx={{ fontSize: 60, color: alpha(customTheme.primary, 0.1), transform: 'rotate(15deg)' }} />
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
          <HealingIcon sx={{ fontSize: 40, color: alpha(customTheme.accent, 0.15), transform: 'rotate(-20deg)' }} />
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
            Loading Medical Center
          </Typography>
          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7) }}>
            Initializing medical management systems...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!medicalData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Failed to load medical data'}</Alert>
      </Container>
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
        <MedicalIcon sx={{ fontSize: 35, color: customTheme.secondary, filter: 'blur(1px)' }} />
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
        <HospitalIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <HealingIcon sx={{ fontSize: 35, color: customTheme.accent, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
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
                <MedicalIcon sx={{ fontSize: 40 }} />
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
              Medical Management Center
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
              Comprehensive medical care and monitoring for all animals
            </Typography>
            
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/animals?filter=medical')}
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
              Add Medical Record
            </Button>
          </Box>
        </Fade>

        {/* Emergency Alert Banner */}
        {medicalData.stats.urgentCases > 0 && (
          <Slide direction="down" in timeout={1200}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 4,
                fontSize: '1.2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: `3px solid ${customTheme.error}`,
                backdropFilter: 'blur(20px)',
                '& .MuiAlert-icon': {
                  fontSize: '2rem',
                  animation: `${pulse} 2s infinite`
                },
                '& .MuiAlert-action': {
                  pt: 0
                }
              }}
              icon={<EmergencyIcon />}
              action={
                <Button 
                  color="inherit" 
                  size="large" 
                  onClick={() => setActiveTab(1)}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    backgroundColor: alpha(customTheme.error, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(customTheme.error, 0.2),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  VIEW URGENT CASES
                </Button>
              }
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                EMERGENCY ALERT: {medicalData.stats.urgentCases} animals require immediate medical attention
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Critical cases detected. Please review and take action immediately.
              </Typography>
            </Alert>
          </Slide>
        )}

        {/* Quick Stats Cards */}
        <Fade in timeout={1400}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: medicalData.stats.urgentCases > 0 ? `3px solid ${customTheme.error}` : `2px solid ${alpha(customTheme.error, 0.3)}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 25px 50px ${alpha(customTheme.error, 0.3)}`,
                  border: `3px solid ${customTheme.error}`,
                },
                '&::before': medicalData.stats.urgentCases > 0 ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${customTheme.error}, ${alpha(customTheme.error, 0.6)})`,
                  animation: `${shimmer} 2s infinite`
                } : {}
              }}
              onClick={() => setActiveTab(1)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: customTheme.error, 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: `0 8px 25px ${alpha(customTheme.error, 0.4)}`,
                    animation: medicalData.stats.urgentCases > 0 ? `${pulse} 2s infinite` : 'none'
                  }}>
                    <EmergencyIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    color: customTheme.error, 
                    fontWeight: 800,
                    mb: 1,
                    textShadow: `0 2px 4px ${alpha(customTheme.error, 0.3)}`
                  }}>
                    {medicalData.stats.urgentCases}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600
                  }}>
                    Emergency Cases
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha(customTheme.warning, 0.3)}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 25px 50px ${alpha(customTheme.warning, 0.3)}`,
                  border: `3px solid ${customTheme.warning}`,
                }
              }} 
              onClick={() => setActiveTab(2)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: customTheme.warning, 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: `0 8px 25px ${alpha(customTheme.warning, 0.4)}`
                  }}>
                    <HospitalIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    color: customTheme.warning, 
                    fontWeight: 800,
                    mb: 1,
                    textShadow: `0 2px 4px ${alpha(customTheme.warning, 0.3)}`
                  }}>
                    {medicalData.stats.inTreatment}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600
                  }}>
                    In Treatment
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${alpha('#9c27b0', 0.3)}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `0 25px 50px ${alpha('#9c27b0', 0.3)}`,
                  border: `3px solid #9c27b0`,
                }
              }} 
              onClick={() => setActiveTab(3)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: '#9c27b0', 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: `0 8px 25px ${alpha('#9c27b0', 0.4)}`
                  }}>
                    <QuarantinedIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    color: '#9c27b0', 
                    fontWeight: 800,
                    mb: 1,
                    textShadow: `0 2px 4px ${alpha('#9c27b0', 0.3)}`
                  }}>
                    {medicalData.stats.inQuarantine}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600
                  }}>
                    In Quarantine
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
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
              }} 
              onClick={() => setActiveTab(4)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: customTheme.success, 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`
                  }}>
                    <VaccinesIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    color: customTheme.success, 
                    fontWeight: 800,
                    mb: 1,
                    textShadow: `0 2px 4px ${alpha(customTheme.success, 0.3)}`
                  }}>
                    {medicalData.stats.vaccinationsDue}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600
                  }}>
                    Vaccinations Due
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
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
              }} 
              onClick={() => setActiveTab(5)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: '#2196f3', 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    boxShadow: `0 8px 25px ${alpha('#2196f3', 0.4)}`
                  }}>
                    <InventoryIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ 
                    color: '#2196f3', 
                    fontWeight: 800,
                    mb: 1,
                    textShadow: `0 2px 4px ${alpha('#2196f3', 0.3)}`
                  }}>
                    {medicalData.stats.lowStockItems}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600
                  }}>
                    Low Stock Alerts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>

        {/* Navigation Tabs */}
        <Slide direction="up" in timeout={1600}>
          <Paper sx={{ 
            mb: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
            boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  color: customTheme.primary,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(customTheme.primary, 0.05),
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-selected': {
                    color: customTheme.accent,
                    fontWeight: 700
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: customTheme.accent,
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab label="Overview" />
              <Tab 
                label={
                  <Badge badgeContent={medicalData.stats.urgentCases} color="error">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmergencyIcon />
                      Emergency Cases
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HospitalIcon />
                    Treatments
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuarantinedIcon />
                    Quarantine
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VaccinesIcon />
                    Vaccinations
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon />
                    Medical Inventory
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    Reports & Analytics
                  </Box>
                }
              />
            </Tabs>
          </Paper>
        </Slide>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          {/* Overview Tab */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Slide direction="right" in timeout={800}>
                <Card sx={{
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.secondary, 0.15)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.secondary, 0.2)}`,
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: customTheme.secondary, 
                        width: 50, 
                        height: 50, 
                        mr: 2,
                        boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.4)}`
                      }}>
                        <ScheduleIcon sx={{ fontSize: 25 }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: customTheme.primary 
                      }}>
                        Today's Medical Schedule
                      </Typography>
                    </Box>
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {medicalData.upcomingVaccinations.slice(0, 5).map((vaccination, index) => (
                        <Zoom in timeout={200 * (index + 1)} key={index}>
                          <ListItem sx={{
                            borderRadius: 3,
                            mb: 1,
                            backgroundColor: alpha(customTheme.secondary, 0.05),
                            border: `1px solid ${alpha(customTheme.secondary, 0.2)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: alpha(customTheme.secondary, 0.1),
                              transform: 'translateX(8px)'
                            }
                          }}>
                            <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                                  {vaccination.animal?.name || 'Unnamed'} - {vaccination.vaccine_type}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                                  Due: {formatDate(vaccination.next_due_date)}
                                </Typography>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Chip 
                                label="Vaccination" 
                                sx={{
                                  backgroundColor: alpha(customTheme.success, 0.15),
                                  color: customTheme.success,
                                  fontWeight: 600,
                                  border: `1px solid ${customTheme.success}`
                                }}
                                size="small" 
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        </Zoom>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>

            <Grid item xs={12} md={6}>
              <Slide direction="left" in timeout={1000}>
                <Card sx={{
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.accent, 0.15)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.accent, 0.2)}`,
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: customTheme.accent, 
                        width: 50, 
                        height: 50, 
                        mr: 2,
                        boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.4)}`
                      }}>
                        <TimelineIcon sx={{ fontSize: 25 }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: customTheme.primary 
                      }}>
                        Recent Medical Activities
                      </Typography>
                    </Box>
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {medicalData.recentTreatments.slice(0, 5).map((treatment, index) => (
                        <Zoom in timeout={200 * (index + 1)} key={index}>
                          <ListItem sx={{
                            borderRadius: 3,
                            mb: 1,
                            backgroundColor: alpha(customTheme.accent, 0.05),
                            border: `1px solid ${alpha(customTheme.accent, 0.2)}`,
                            transition: 'all 0.3s ease',
                            pr: 12, // Add padding right to prevent overlap
                            '&:hover': {
                              backgroundColor: alpha(customTheme.accent, 0.1),
                              transform: 'translateX(8px)'
                            }
                          }}>
                            <ListItemText
                              primary={
                                <Typography variant="body1" sx={{ 
                                  fontWeight: 600, 
                                  color: customTheme.primary,
                                  pr: 2 // Add padding right
                                }}>
                                  {treatment.animal?.name || 'Unnamed'} - {treatment.reason}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ 
                                  color: alpha(customTheme.primary, 0.7),
                                  pr: 2 // Add padding right
                                }}>
                                  {formatDate(treatment.date)} by {treatment.veterinarian}
                                </Typography>
                              }
                            />
                            <ListItemSecondaryAction sx={{ right: 8 }}>
                              <Chip 
                                label={treatment.record_type} 
                                sx={{
                                  backgroundColor: alpha('#2196f3', 0.15),
                                  color: '#2196f3',
                                  fontWeight: 600,
                                  border: `1px solid #2196f3`,
                                  minWidth: 80 // Ensure minimum width
                                }}
                                size="small" 
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        </Zoom>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Emergency Cases Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              color: customTheme.error, 
              fontWeight: 800,
              mb: 2,
              display: 'flex', 
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ 
                bgcolor: customTheme.error, 
                width: 50, 
                height: 50,
                animation: `${pulse} 2s infinite`
              }}>
                <EmergencyIcon sx={{ fontSize: 25 }} />
              </Avatar>
              Emergency Medical Cases
            </Typography>
          </Box>
          
          {medicalData.urgentAnimals.filter(animal => 
            animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY'
          ).length === 0 ? (
            <Zoom in timeout={800}>
              <Card sx={{
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: `3px solid ${alpha(customTheme.success, 0.3)}`,
                boxShadow: `0 25px 50px ${alpha(customTheme.success, 0.15)}`,
                p: 6,
                textAlign: 'center'
              }}>
                <Avatar sx={{ 
                  bgcolor: customTheme.success, 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 3,
                  boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`
                }}>
                  <CheckCircleIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" sx={{ 
                  color: customTheme.success, 
                  fontWeight: 700, 
                  mb: 2 
                }}>
                  All Clear!
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: alpha(customTheme.primary, 0.8), 
                  fontWeight: 500 
                }}>
                  No emergency cases at this time. All animals are stable.
                </Typography>
              </Card>
            </Zoom>
          ) : (
            <Grid container spacing={4} sx={{ px: { xs: 2, sm: 0 } }}>
              {medicalData.urgentAnimals
                .filter(animal => animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY')
                .map((animal, index) => (
                  <Grid item xs={12} md={6} lg={6} key={animal.id}>
                    <Zoom in timeout={300 * (index + 1)}>
                      <Card sx={{ 
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: `3px solid ${customTheme.error}`,
                        boxShadow: `0 25px 50px ${alpha(customTheme.error, 0.2)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 35px 60px ${alpha(customTheme.error, 0.3)}`,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '6px',
                          background: `linear-gradient(90deg, ${customTheme.error}, ${alpha(customTheme.error, 0.6)})`,
                          animation: `${shimmer} 2s infinite`
                        }
                      }}>
                        <CardContent sx={{ p: 4, pt: 5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ 
                                bgcolor: customTheme.error, 
                                width: 50, 
                                height: 50,
                                animation: `${pulse} 2s infinite`
                              }}>
                                <EmergencyIcon sx={{ fontSize: 25 }} />
                              </Avatar>
                              <Box>
                                <Typography variant="h5" sx={{ 
                                  color: customTheme.primary, 
                                  fontWeight: 700,
                                  mb: 0.5
                                }}>
                                  {animal.name || 'Unnamed'}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                  color: alpha(customTheme.primary, 0.7),
                                  fontWeight: 500
                                }}>
                                  {animal.animal_type}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip 
                              label={animal.priority_level || 'URGENT'} 
                              sx={{
                                backgroundColor: customTheme.error,
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                animation: `${pulse} 2s infinite`
                              }}
                              icon={<EmergencyIcon sx={{ color: '#ffffff !important' }} />}
                            />
                          </Box>
                          
                          <Divider sx={{ 
                            my: 2, 
                            backgroundColor: alpha(customTheme.error, 0.2),
                            height: 2
                          }} />
                          
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" sx={{ 
                              color: customTheme.primary,
                              fontWeight: 600,
                              mb: 1
                            }}>
                              <strong>Status:</strong> {animal.status}
                            </Typography>
                            
                            {animal.health_status && (
                              <Typography variant="body1" sx={{ 
                                color: customTheme.primary,
                                fontWeight: 600,
                                mb: 2
                              }}>
                                <strong>Condition:</strong> {animal.health_status}
                              </Typography>
                            )}

                            {animal.special_instructions && (
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 3,
                                  backgroundColor: alpha(customTheme.warning, 0.1),
                                  border: `2px solid ${alpha(customTheme.warning, 0.3)}`
                                }}
                              >
                                <Typography variant="body1" sx={{ 
                                  color: customTheme.warning,
                                  fontWeight: 600,
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  <WarningIcon />
                                  Special Instructions:
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  color: customTheme.primary,
                                  fontWeight: 500
                                }}>
                                  {animal.special_instructions}
                                </Typography>
                              </Paper>
                            )}
                          </Box>

                          <Stack direction="row" spacing={2}>
                            <Button 
                              variant="contained" 
                              size="large"
                              startIcon={<MedicalIcon />}
                              onClick={() => handleQuickTreatment(animal)}
                              sx={{
                                flex: 1,
                                py: 2,
                                borderRadius: 3,
                                fontSize: '1rem',
                                fontWeight: 700,
                                background: `linear-gradient(45deg, ${customTheme.error} 30%, ${alpha(customTheme.error, 0.8)} 90%)`,
                                boxShadow: `0 8px 30px ${alpha(customTheme.error, 0.4)}`,
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
                                  background: `linear-gradient(45deg, ${alpha(customTheme.error, 0.9)} 30%, ${customTheme.error} 90%)`,
                                  transform: 'translateY(-3px)',
                                  boxShadow: `0 12px 40px ${alpha(customTheme.error, 0.5)}`,
                                  '&::before': {
                                    left: '100%'
                                  }
                                }
                              }}
                            >
                              Start Treatment
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="large"
                              startIcon={<ViewIcon />}
                              onClick={() => navigate(`/animals/${animal.id}?tab=health`)}
                              sx={{
                                borderColor: customTheme.primary,
                                borderWidth: 2,
                                color: customTheme.primary,
                                fontWeight: 600,
                                py: 2,
                                borderRadius: 3,
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: customTheme.primary,
                                  borderWidth: 2,
                                  backgroundColor: alpha(customTheme.primary, 0.08),
                                  transform: 'translateY(-3px)',
                                  boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.2)}`
                                }
                              }}
                            >
                              Details
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Treatments Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              color: customTheme.primary, 
              fontWeight: 800,
              mb: 2,
              display: 'flex', 
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ 
                bgcolor: customTheme.warning, 
                width: 50, 
                height: 50
              }}>
                <HospitalIcon sx={{ fontSize: 25 }} />
              </Avatar>
              Animals Under Treatment
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {medicalData.urgentAnimals
              .filter(animal => animal.status === 'UNDER_TREATMENT')
              .map((animal, index) => (
                <Grid item xs={12} md={6} key={animal.id}>
                  <Zoom in timeout={300 * (index + 1)}>
                    <Card sx={{
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `3px solid ${alpha(customTheme.warning, 0.3)}`,
                      boxShadow: `0 25px 50px ${alpha(customTheme.warning, 0.15)}`,
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 35px 60px ${alpha(customTheme.warning, 0.25)}`,
                        border: `3px solid ${customTheme.warning}`,
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Avatar sx={{ 
                            bgcolor: customTheme.warning, 
                            width: 50, 
                            height: 50
                          }}>
                            <HospitalIcon sx={{ fontSize: 25 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" sx={{ 
                              color: customTheme.primary, 
                              fontWeight: 700,
                              mb: 0.5
                            }}>
                              {animal.name || 'Unnamed'}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: alpha(customTheme.primary, 0.7),
                              fontWeight: 500
                            }}>
                              {animal.animal_type}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Chip 
                          label="Under Treatment" 
                          sx={{
                            backgroundColor: alpha(customTheme.warning, 0.15),
                            color: customTheme.warning,
                            fontWeight: 600,
                            border: `1px solid ${customTheme.warning}`,
                            mb: 2,
                            fontSize: '0.9rem'
                          }}
                        />
                        
                        {animal.health_status && (
                          <Typography variant="body1" sx={{ 
                            color: customTheme.primary,
                            fontWeight: 600,
                            mb: 3
                          }}>
                            <strong>Treatment for:</strong> {animal.health_status}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={2}>
                          <Button 
                            variant="contained" 
                            size="large"
                            startIcon={<AssignmentIcon />}
                            onClick={() => navigate(`/animals/${animal.id}?tab=health`)}
                            sx={{
                              flex: 1,
                              py: 2,
                              borderRadius: 3,
                              fontSize: '1rem',
                              fontWeight: 700,
                              background: `linear-gradient(45deg, ${customTheme.warning} 30%, ${alpha(customTheme.warning, 0.8)} 90%)`,
                              boxShadow: `0 8px 30px ${alpha(customTheme.warning, 0.4)}`,
                              color: '#ffffff',
                              textTransform: 'none',
                              '&:hover': {
                                background: `linear-gradient(45deg, ${alpha(customTheme.warning, 0.9)} 30%, ${customTheme.warning} 90%)`,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 40px ${alpha(customTheme.warning, 0.5)}`
                              }
                            }}
                          >
                            Update Treatment
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="large"
                            onClick={() => navigate(`/animals/${animal.id}`)}
                            sx={{
                              borderColor: customTheme.primary,
                              borderWidth: 2,
                              color: customTheme.primary,
                              fontWeight: 600,
                              py: 2,
                              borderRadius: 3,
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: customTheme.primary,
                                borderWidth: 2,
                                backgroundColor: alpha(customTheme.primary, 0.08),
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.2)}`
                              }
                            }}
                          >
                            View Profile
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {/* Quarantine Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              color: customTheme.primary, 
              fontWeight: 800,
              mb: 2,
              display: 'flex', 
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ 
                bgcolor: '#9c27b0', 
                width: 50, 
                height: 50
              }}>
                <QuarantinedIcon sx={{ fontSize: 25 }} />
              </Avatar>
              Quarantine Management
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {medicalData.urgentAnimals
              .filter(animal => animal.status === 'QUARANTINE')
              .map((animal, index) => (
                <Grid item xs={12} md={6} key={animal.id}>
                  <Zoom in timeout={300 * (index + 1)}>
                    <Card sx={{
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: `3px solid ${alpha('#9c27b0', 0.3)}`,
                      boxShadow: `0 25px 50px ${alpha('#9c27b0', 0.15)}`,
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 35px 60px ${alpha('#9c27b0', 0.25)}`,
                        border: `3px solid #9c27b0`,
                      }
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Avatar sx={{ 
                            bgcolor: '#9c27b0', 
                            width: 50, 
                            height: 50
                          }}>
                            <QuarantinedIcon sx={{ fontSize: 25 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" sx={{ 
                              color: customTheme.primary, 
                              fontWeight: 700,
                              mb: 0.5
                            }}>
                              {animal.name || 'Unnamed'}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: alpha(customTheme.primary, 0.7),
                              fontWeight: 500
                            }}>
                              {animal.animal_type}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Chip 
                          label="In Quarantine" 
                          sx={{
                            backgroundColor: alpha('#9c27b0', 0.15),
                            color: '#9c27b0',
                            fontWeight: 600,
                            border: `1px solid #9c27b0`,
                            mb: 2,
                            fontSize: '0.9rem'
                          }}
                        />
                        
                        {animal.quarantine_end_date && (
                          <Typography variant="body1" sx={{ 
                            color: customTheme.primary,
                            fontWeight: 600,
                            mb: 3
                          }}>
                            <strong>Quarantine ends:</strong> {formatDate(animal.quarantine_end_date)}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={2}>
                          <Button 
                            variant="contained" 
                            size="large"
                            onClick={() => navigate(`/animals/${animal.id}?tab=health`)}
                            sx={{
                              flex: 1,
                              py: 2,
                              borderRadius: 3,
                              fontSize: '1rem',
                              fontWeight: 700,
                              background: `linear-gradient(45deg, #9c27b0 30%, ${alpha('#9c27b0', 0.8)} 90%)`,
                              boxShadow: `0 8px 30px ${alpha('#9c27b0', 0.4)}`,
                              color: '#ffffff',
                              textTransform: 'none',
                              '&:hover': {
                                background: `linear-gradient(45deg, ${alpha('#9c27b0', 0.9)} 30%, #9c27b0 90%)`,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 40px ${alpha('#9c27b0', 0.5)}`
                              }
                            }}
                          >
                            Update Status
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          {/* Vaccinations Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              color: customTheme.primary, 
              fontWeight: 800,
              mb: 2,
              display: 'flex', 
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ 
                bgcolor: customTheme.success, 
                width: 50, 
                height: 50
              }}>
                <VaccinesIcon sx={{ fontSize: 25 }} />
              </Avatar>
              Vaccination Schedule
            </Typography>
          </Box>
          
          <Card sx={{
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `3px solid ${alpha(customTheme.success, 0.2)}`,
            boxShadow: `0 25px 50px ${alpha(customTheme.success, 0.15)}`,
          }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ 
                  backgroundColor: alpha(customTheme.success, 0.1)
                }}>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: customTheme.primary,
                      fontSize: '1.1rem'
                    }}>
                      Animal
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: customTheme.primary,
                      fontSize: '1.1rem'
                    }}>
                      Vaccine Type
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: customTheme.primary,
                      fontSize: '1.1rem'
                    }}>
                      Due Date
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: customTheme.primary,
                      fontSize: '1.1rem'
                    }}>
                      Days Until Due
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 700, 
                      color: customTheme.primary,
                      fontSize: '1.1rem'
                    }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicalData.upcomingVaccinations.map((vaccination, index) => {
                    const dueDate = new Date(vaccination.next_due_date);
                    const today = new Date();
                    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <Fade in timeout={200 * (index + 1)} key={index}>
                        <TableRow sx={{
                          '&:hover': {
                            backgroundColor: alpha(customTheme.success, 0.05)
                          }
                        }}>
                          <TableCell sx={{ 
                            fontWeight: 600, 
                            color: customTheme.primary,
                            fontSize: '1rem'
                          }}>
                            {vaccination.animal?.name || 'Unnamed'}
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 500, 
                            color: customTheme.primary
                          }}>
                            {vaccination.vaccine_type}
                          </TableCell>
                          <TableCell sx={{ 
                            fontWeight: 500, 
                            color: customTheme.primary
                          }}>
                            {formatDate(vaccination.next_due_date)}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${daysUntilDue} days`}
                              sx={{
                                backgroundColor: daysUntilDue <= 7 
                                  ? alpha(customTheme.error, 0.15) 
                                  : daysUntilDue <= 14 
                                    ? alpha(customTheme.warning, 0.15) 
                                    : alpha(customTheme.success, 0.15),
                                color: daysUntilDue <= 7 
                                  ? customTheme.error 
                                  : daysUntilDue <= 14 
                                    ? customTheme.warning 
                                    : customTheme.success,
                                fontWeight: 600,
                                border: `1px solid ${daysUntilDue <= 7 
                                  ? customTheme.error 
                                  : daysUntilDue <= 14 
                                    ? customTheme.warning 
                                    : customTheme.success}`
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => navigate(`/animals/${vaccination.animal}?tab=health`)}
                              sx={{
                                borderColor: customTheme.success,
                                color: customTheme.success,
                                fontWeight: 600,
                                borderRadius: 3,
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: customTheme.success,
                                  backgroundColor: alpha(customTheme.success, 0.08),
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.2)}`
                                }
                              }}
                            >
                              Schedule
                            </Button>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          {/* Medical Inventory Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              color: customTheme.primary, 
              fontWeight: 800,
              mb: 2,
              display: 'flex', 
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ 
                bgcolor: '#2196f3', 
                width: 50, 
                height: 50
              }}>
                <InventoryIcon sx={{ fontSize: 25 }} />
              </Avatar>
              Medical Inventory Status
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/inventory/dashboard')}
                sx={{
                  mb: 3,
                  py: 2,
                  px: 3,
                  borderRadius: 4,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: `linear-gradient(45deg, #2196f3 30%, ${alpha('#2196f3', 0.8)} 90%)`,
                  boxShadow: `0 8px 30px ${alpha('#2196f3', 0.4)}`,
                  color: '#ffffff',
                  textTransform: 'none',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${alpha('#2196f3', 0.9)} 30%, #2196f3 90%)`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 40px ${alpha('#2196f3', 0.5)}`
                  }
                }}
              >
                View Full Inventory System
              </Button>
            </Grid>
            
            {medicalData.medicalInventory.slice(0, 6).map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Zoom in timeout={200 * (index + 1)}>
                  <Card sx={{
                    borderRadius: 6,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: item.quantity <= item.reorder_level 
                      ? `3px solid ${customTheme.error}` 
                      : `3px solid ${alpha('#2196f3', 0.3)}`,
                    boxShadow: `0 25px 50px ${alpha('#2196f3', 0.15)}`,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 35px 60px ${alpha('#2196f3', 0.25)}`,
                    },
                    '&::before': item.quantity <= item.reorder_level ? {
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
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ 
                          bgcolor: item.quantity <= item.reorder_level ? customTheme.error : '#2196f3', 
                          width: 50, 
                          height: 50, 
                          mr: 2
                        }}>
                          <ScienceIcon sx={{ fontSize: 25 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: customTheme.primary 
                        }}>
                          {item.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600,
                        mb: 1
                      }}>
                        <strong>Current Stock:</strong> {item.quantity} {item.unit}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600,
                        mb: 3
                      }}>
                        <strong>Reorder Level:</strong> {item.reorder_level} {item.unit}
                      </Typography>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={(item.quantity / (item.reorder_level * 2)) * 100}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: alpha(customTheme.grey, 0.3),
                          mb: 2,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: item.quantity <= item.reorder_level ? customTheme.error : customTheme.success,
                            borderRadius: 6
                          }
                        }}
                      />
                      
                      {item.quantity <= item.reorder_level && (
                        <Chip 
                          label="LOW STOCK" 
                          sx={{
                            backgroundColor: alpha(customTheme.error, 0.15),
                            color: customTheme.error,
                            fontWeight: 700,
                            border: `2px solid ${customTheme.error}`,
                            animation: `${pulse} 2s infinite`
                          }}
                          size="small" 
                        />
                      )}
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={6}>
          {/* Reports & Analytics Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              color: customTheme.primary, 
              fontWeight: 800,
              mb: 2,
              display: 'flex', 
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ 
                bgcolor: customTheme.accent, 
                width: 50, 
                height: 50
              }}>
                <AssignmentIcon sx={{ fontSize: 25 }} />
              </Avatar>
              Medical Reports & Analytics
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Slide direction="right" in timeout={800}>
                <Card sx={{
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.accent, 0.15)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.accent, 0.2)}`,
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: customTheme.accent, 
                        width: 50, 
                        height: 50, 
                        mr: 2
                      }}>
                        <TrendingIcon sx={{ fontSize: 25 }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: customTheme.primary 
                      }}>
                        Medical Activity Summary
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600,
                        mb: 1
                      }}>
                        Total Emergency Cases This Month: {medicalData.stats.urgentCases}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600,
                        mb: 1
                      }}>
                        Animals Currently in Treatment: {medicalData.stats.inTreatment}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600,
                        mb: 1
                      }}>
                        Successful Treatments: 85%
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: customTheme.primary,
                        fontWeight: 600
                      }}>
                        Average Treatment Duration: 7 days
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Slide direction="left" in timeout={1000}>
                <Card sx={{
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                  boxShadow: `0 25px 50px ${alpha(customTheme.secondary, 0.15)}`,
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 35px 60px ${alpha(customTheme.secondary, 0.2)}`,
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: customTheme.secondary, 
                        width: 50, 
                        height: 50, 
                        mr: 2
                      }}>
                        <PrintIcon sx={{ fontSize: 25 }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: customTheme.primary 
                      }}>
                        Quick Actions
                      </Typography>
                    </Box>
                    
                    <Stack spacing={3}>
                      <Button 
                        variant="outlined" 
                        startIcon={<PrintIcon />}
                        onClick={handleGenerateMedicalReport}
                        disabled={reportLoading}
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderColor: customTheme.secondary,
                          color: customTheme.secondary,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: customTheme.secondary,
                            backgroundColor: alpha(customTheme.secondary, 0.08),
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.secondary, 0.2)}`
                          }
                        }}
                      >
                        Generate Medical Report
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<AssignmentIcon />}
                        onClick={handleExportTreatmentRecords}
                        disabled={reportLoading}
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderColor: customTheme.accent,
                          color: customTheme.accent,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: customTheme.accent,
                            backgroundColor: alpha(customTheme.accent, 0.08),
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.accent, 0.2)}`
                          }
                        }}
                      >
                        Export Treatment Records
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<ScheduleIcon />}
                        onClick={handleScheduleVetVisit}
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderColor: customTheme.primary,
                          color: customTheme.primary,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: customTheme.primary,
                            backgroundColor: alpha(customTheme.primary, 0.08),
                            transform: 'translateY(-3px)',
                            boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.2)}`
                          }
                        }}
                      >
                        Schedule Vet Visit
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Quick Treatment Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
              m: { xs: 2, sm: 4 },
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2,
            borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: customTheme.error, 
                width: 50, 
                height: 50,
                animation: `${pulse} 2s infinite`
              }}>
                <EmergencyIcon sx={{ fontSize: 25 }} />
              </Avatar>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary, 
                fontWeight: 700 
              }}>
                Quick Emergency Treatment
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, px: 4, pb: 2 }}>
            {selectedAnimal && (
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
                    {selectedAnimal.name || 'Unnamed'} - {selectedAnimal.animal_type}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: alpha(customTheme.primary, 0.8),
                    fontWeight: 500
                  }}>
                    Current Status: {selectedAnimal.status}
                  </Typography>
                </Paper>
                
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <FormControl fullWidth sx={{ minWidth: 200 }}>
                      <InputLabel sx={{
                        color: customTheme.primary,
                        fontWeight: 600,
                        '&.Mui-focused': { color: customTheme.primary },
                      }}>
                        Treatment Type
                      </InputLabel>
                      <Select 
                        label="Treatment Type"
                        value={treatmentForm.treatmentType}
                        onChange={(e) => setTreatmentForm({...treatmentForm, treatmentType: e.target.value})}
                        sx={selectStyles}
                      >
                        <MenuItem value="emergency">Emergency Care</MenuItem>
                        <MenuItem value="medication">Medication Administration</MenuItem>
                        <MenuItem value="wound_care">Wound Care</MenuItem>
                        <MenuItem value="stabilization">Patient Stabilization</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Treatment Notes"
                      placeholder="Describe the treatment provided..."
                      value={treatmentForm.treatmentNotes}
                      onChange={(e) => setTreatmentForm({...treatmentForm, treatmentNotes: e.target.value})}
                      sx={fieldStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Veterinarian"
                      placeholder="Dr. Smith"
                      value={treatmentForm.veterinarian}
                      onChange={(e) => setTreatmentForm({...treatmentForm, veterinarian: e.target.value})}
                      sx={fieldStyles}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ minWidth: 200 }}>
                      <InputLabel sx={{
                        color: customTheme.primary,
                        fontWeight: 600,
                        '&.Mui-focused': { color: customTheme.primary },
                      }}>
                        New Status
                      </InputLabel>
                      <Select 
                        label="New Status"
                        value={treatmentForm.newStatus}
                        onChange={(e) => setTreatmentForm({...treatmentForm, newStatus: e.target.value})}
                        sx={selectStyles}
                      >
                        <MenuItem value="UNDER_TREATMENT">Under Treatment</MenuItem>
                        <MenuItem value="STABLE">Stable</MenuItem>
                        <MenuItem value="RECOVERING">Recovering</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`,
            gap: 2
          }}>
            <Button 
              onClick={() => setDialogOpen(false)}
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
              onClick={handleSaveEmergencyTreatment}
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
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 40px ${alpha(customTheme.success, 0.5)}`
                }
              }}
            >
              Save Treatment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Health Certificate Dialog */}
        <Dialog 
          open={reportDialogOpen} 
          onClose={() => setReportDialogOpen(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.accent, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.accent, 0.15)}`,
              m: { xs: 2, sm: 4 },
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2,
            borderBottom: `2px solid ${alpha(customTheme.accent, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: customTheme.accent, 
                width: 50, 
                height: 50
              }}>
                <PrintIcon sx={{ fontSize: 25 }} />
              </Avatar>
              <Typography variant="h4" sx={{ 
                color: customTheme.primary, 
                fontWeight: 700 
              }}>
                {reportType === 'medical_report' ? 'Generate Medical Report' : 'Export Treatment Records'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, px: 4, pb: 2 }}>
            <Typography variant="h6" sx={{ 
              mb: 3,
              color: customTheme.primary,
              fontWeight: 600
            }}>
              Select animals to include in the report:
            </Typography>
            
            {medicalData && medicalData.urgentAnimals && (
              <List sx={{ 
                maxHeight: 400, 
                overflow: 'auto',
                border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                borderRadius: 3,
                backgroundColor: alpha(customTheme.accent, 0.02)
              }}>
                {medicalData.urgentAnimals.map((animal) => (
                  <ListItem 
                    key={animal.id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      mx: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(customTheme.accent, 0.1),
                        transform: 'translateX(8px)'
                      }
                    }}
                  >
                    <Checkbox 
                      checked={selectedAnimalsForReport.includes(animal.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAnimalsForReport(prev => [...prev, animal.id]);
                        } else {
                          setSelectedAnimalsForReport(prev => prev.filter(id => id !== animal.id));
                        }
                      }}
                      sx={{
                        color: customTheme.accent,
                        '&.Mui-checked': {
                          color: customTheme.accent,
                        },
                      }}
                    />
                    <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ 
                          fontWeight: 600, 
                          color: customTheme.primary 
                        }}>
                          {animal.name || 'Unnamed'} - {animal.animal_type}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ 
                          color: alpha(customTheme.primary, 0.7),
                          fontWeight: 500
                        }}>
                          Status: {animal.status}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            borderTop: `2px solid ${alpha(customTheme.accent, 0.1)}`,
            gap: 2
          }}>
            <Button 
              onClick={() => setReportDialogOpen(false)}
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
              onClick={async () => {
                for (const animalId of selectedAnimalsForReport) {
                  await generateHealthCertificate(animalId, reportType);
                }
                setReportDialogOpen(false);
                setSelectedAnimalsForReport([]);
              }}
              disabled={selectedAnimalsForReport.length === 0 || reportLoading}
              startIcon={reportLoading ? <CircularProgress size={20} color="inherit" /> : <PrintIcon />}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 700,
                background: `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
                boxShadow: `0 8px 30px ${alpha(customTheme.accent, 0.4)}`,
                color: '#ffffff',
                textTransform: 'none',
                '&:hover:not(:disabled)': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 40px ${alpha(customTheme.accent, 0.5)}`
                }
              }}
            >
              {reportLoading ? 'Generating...' : 'Generate Reports'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Message */}
        {message && (
          <Slide direction="up" in timeout={600}>
            <Alert 
              severity="success" 
              sx={{ 
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 9999,
                minWidth: 300,
                borderRadius: 4,
                fontSize: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: `2px solid ${customTheme.success}`,
                backdropFilter: 'blur(20px)',
                boxShadow: `0 25px 50px ${alpha(customTheme.success, 0.3)}`,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                }
              }}
              onClose={() => setMessage('')}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {message}
              </Typography>
            </Alert>
          </Slide>
        )}
      </Container>
    </Box>
  );
}

export default MedicalManagementPage;