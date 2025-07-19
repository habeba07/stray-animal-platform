// components/TransferManagement.js - Complete Animal Transfer Interface

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Divider,
  Fade,
  Slide,
  Zoom,
  alpha,
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ReadyIcon,
  Group as BulkIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  Star as StarIcon,
  AutoAwesome as SparkleIcon,
  Pets as PetsIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  NotificationImportant as UrgentIcon,
  CheckCircleOutline as CompleteIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../../redux/api';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
  warning: '#ff9800',
  error: '#f44336',
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

const cardPop = keyframes`
  0% { transform: scale(0.95) translateY(10px); opacity: 0; }
  50% { transform: scale(1.02) translateY(-2px); opacity: 0.8; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
`;

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`transfer-tabpanel-${index}`}
      aria-labelledby={`transfer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function TransferManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animalsReadyForTransfer, setAnimalsReadyForTransfer] = useState([]);
  const [availableShelters, setAvailableShelters] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [markReadyDialogOpen, setMarkReadyDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [transferForm, setTransferForm] = useState({
    new_shelter_id: '',
    transfer_date: '',
    notes: ''
  });

  const [readyForm, setReadyForm] = useState({
    transfer_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchReadyForTransferAnimals();
    fetchAvailableShelters();
  }, []);

  const fetchReadyForTransferAnimals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/animals/ready_for_transfer/');
      setAnimalsReadyForTransfer(response.data);
    } catch (err) {
      console.error('Error fetching animals ready for transfer:', err);
      setError('Failed to load animals ready for transfer');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableShelters = async () => {
    try {
      const response = await api.get('/animals/available_shelters/');
      setAvailableShelters(response.data);
    } catch (err) {
      console.error('Error fetching available shelters:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSelectAnimal = (animalId) => {
    setSelectedAnimals(prev => 
      prev.includes(animalId) 
        ? prev.filter(id => id !== animalId)
        : [...prev, animalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnimals.length === animalsReadyForTransfer.length) {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals(animalsReadyForTransfer.map(animal => animal.id));
    }
  };

  const handleBulkTransfer = () => {
    if (selectedAnimals.length === 0) {
      setError('Please select animals to transfer');
      return;
    }
    setTransferDialogOpen(true);
  };

  const handleIndividualTransfer = (animal) => {
    setSelectedAnimal(animal);
    setSelectedAnimals([animal.id]);
    setTransferDialogOpen(true);
  };

  const handleMarkReady = (animal) => {
    setSelectedAnimal(animal);
    setMarkReadyDialogOpen(true);
  };

  const executeBulkTransfer = async () => {
    try {
      setLoading(true);
      await api.post('/animals/bulk_transfer/', {
        animal_ids: selectedAnimals,
        new_shelter_id: transferForm.new_shelter_id,
        transfer_date: transferForm.transfer_date,
        notes: transferForm.notes
      });

      setMessage(`Successfully transferred ${selectedAnimals.length} animals`);
      setTransferDialogOpen(false);
      setSelectedAnimals([]);
      setTransferForm({ new_shelter_id: '', transfer_date: '', notes: '' });
      fetchReadyForTransferAnimals();
    } catch (err) {
      console.error('Error transferring animals:', err);
      setError(err.response?.data?.error || 'Failed to transfer animals');
    } finally {
      setLoading(false);
    }
  };

  const executeMarkReady = async () => {
    try {
      setLoading(true);
      await api.post(`/animals/${selectedAnimal.id}/mark_ready_for_transfer/`, {
        transfer_date: readyForm.transfer_date,
        notes: readyForm.notes
      });

      setMessage(`${selectedAnimal.name || 'Animal'} marked as ready for transfer`);
      setMarkReadyDialogOpen(false);
      setReadyForm({ transfer_date: '', notes: '' });
      fetchReadyForTransferAnimals();
    } catch (err) {
      console.error('Error marking animal ready:', err);
      setError(err.response?.data?.error || 'Failed to mark animal as ready');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getShelterName = (shelter) => {
    if (!shelter) return 'Unassigned';
    return `${shelter.first_name} ${shelter.last_name}`.trim() || 
           shelter.organization_name || 
           shelter.username;
  };

  const fieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
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
        <TransferIcon sx={{ fontSize: 50, color: customTheme.primary, transform: 'rotate(25deg)' }} />
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
        <PetsIcon sx={{ fontSize: 35, color: customTheme.secondary, transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="xl" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
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
              <SparkleIcon sx={{ color: customTheme.secondary, fontSize: 16 }} />
            </Box>
            
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
              <TransferIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
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
              Animal Transfer Management
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
              Streamline animal transfers between shelters with advanced tracking and bulk operations
            </Typography>
          </Box>
        </Fade>

        {/* Header Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.1)} 0%, ${alpha(customTheme.primary, 0.05)} 100%)`,
              border: `2px solid ${alpha(customTheme.primary, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar sx={{ bgcolor: customTheme.primary, width: 40, height: 40 }}>
              <TrendingUpIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700, mb: 0.5 }}>
                Transfer Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                Manage inter-shelter animal transfers
              </Typography>
            </Box>
          </Paper>

          <Button 
            variant="contained" 
            startIcon={<BulkIcon />}
            onClick={handleBulkTransfer}
            disabled={selectedAnimals.length === 0}
            size="large"
            sx={{
              py: 2,
              px: 4,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'none',
              background: selectedAnimals.length === 0
                ? `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.accent, 0.3)} 90%)`
                : `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: selectedAnimals.length === 0 
                ? 'none'
                : `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
              transition: 'all 0.3s ease',
              '&:hover:not(:disabled)': {
                background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${alpha(customTheme.accent, 0.9)} 90%)`,
                transform: 'translateY(-3px)',
                boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.5)}`
              },
              '&:disabled': {
                color: alpha('#ffffff', 0.6),
                cursor: 'not-allowed'
              }
            }}
          >
            Bulk Transfer ({selectedAnimals.length})
          </Button>
        </Box>

        {/* Messages */}
        {message && (
          <Fade in timeout={800}>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                backgroundColor: alpha(customTheme.success, 0.1),
                border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }} 
              onClose={() => setMessage('')}
            >
              {message}
            </Alert>
          </Fade>
        )}
        
        {error && (
          <Fade in timeout={800}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                backgroundColor: alpha(customTheme.error, 0.1),
                border: `2px solid ${alpha(customTheme.error, 0.3)}`,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Loading */}
        {loading && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              border: `2px solid ${alpha(customTheme.accent, 0.3)}`
            }}
          >
            <LinearProgress 
              sx={{ 
                height: 8,
                backgroundColor: alpha(customTheme.accent, 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: customTheme.accent,
                  background: `linear-gradient(90deg, ${customTheme.accent}, ${customTheme.secondary})`
                }
              }}
            />
          </Paper>
        )}

        {/* Enhanced Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              '& .MuiTab-root': {
                color: customTheme.primary,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                minHeight: 64,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: customTheme.accent,
                  transform: 'translateY(-2px)'
                },
                '&.Mui-selected': {
                  color: customTheme.accent,
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: customTheme.accent,
                height: 4,
                borderRadius: 2
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReadyIcon />
                  <Box>
                    <Typography sx={{ fontWeight: 'inherit' }}>
                      Ready for Transfer
                    </Typography>
                    <Chip 
                      label={animalsReadyForTransfer.length}
                      size="small"
                      sx={{
                        bgcolor: alpha(customTheme.success, 0.2),
                        color: customTheme.success,
                        fontWeight: 700,
                        height: 20,
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon />
                  Transfer History
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          {/* Ready for Transfer Tab */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
              <Grid item>
                <Button 
                  variant="outlined"
                  onClick={handleSelectAll}
                  sx={{
                    borderColor: customTheme.primary,
                    color: customTheme.primary,
                    fontWeight: 600,
                    borderWidth: 2,
                    borderRadius: 3,
                    '&:hover': {
                      borderColor: customTheme.primary,
                      backgroundColor: alpha(customTheme.primary, 0.08),
                      borderWidth: 2
                    }
                  }}
                >
                  {selectedAnimals.length === animalsReadyForTransfer.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Grid>
              <Grid item xs>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.secondary, 0.05)} 100%)`,
                    border: `2px solid ${alpha(customTheme.secondary, 0.2)}`,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                    {selectedAnimals.length} of {animalsReadyForTransfer.length} animals selected
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {animalsReadyForTransfer.map((animal, index) => (
              <Grid item xs={12} md={6} lg={4} key={animal.id}>
                <Fade in timeout={600 + (index * 100)}>
                  <Card sx={{ 
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: selectedAnimals.includes(animal.id) 
                      ? `3px solid ${customTheme.accent}` 
                      : `2px solid ${alpha(customTheme.primary, 0.15)}`,
                    boxShadow: selectedAnimals.includes(animal.id)
                      ? `0 15px 35px ${alpha(customTheme.accent, 0.3)}`
                      : `0 8px 25px ${alpha(customTheme.primary, 0.1)}`,
                    transition: 'all 0.3s ease',
                    animation: `${cardPop} 0.6s ease-out ${index * 0.1}s both`,
                    backgroundColor: selectedAnimals.includes(animal.id) 
                      ? alpha(customTheme.accent, 0.05) 
                      : 'rgba(255, 255, 255, 0.95)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.2)}`,
                      border: `3px solid ${alpha(customTheme.accent, 0.5)}`
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Checkbox 
                            checked={selectedAnimals.includes(animal.id)}
                            onChange={() => handleSelectAnimal(animal.id)}
                            sx={{
                              color: customTheme.primary,
                              '&.Mui-checked': {
                                color: customTheme.accent,
                              },
                              transform: 'scale(1.3)'
                            }}
                          />
                          <Avatar
                            sx={{
                              bgcolor: customTheme.primary,
                              width: 48,
                              height: 48,
                              boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.3)}`
                            }}
                          >
                            <PetsIcon sx={{ fontSize: 24 }} />
                          </Avatar>
                        </Box>
                        <Chip 
                          label="Ready for Transfer" 
                          sx={{
                            backgroundColor: customTheme.success,
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            boxShadow: `0 4px 15px ${alpha(customTheme.success, 0.3)}`
                          }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: customTheme.primary,
                          fontWeight: 800,
                          mb: 1,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {animal.name || 'Unnamed'} - {animal.animal_type}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 2,
                          color: alpha(customTheme.primary, 0.8),
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <LocationIcon sx={{ fontSize: 18 }} />
                        <strong>Current Shelter:</strong> {getShelterName(animal.current_shelter_details)}
                      </Typography>
                      
                      {animal.transfer_ready_date && (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mb: 2,
                            color: alpha(customTheme.primary, 0.8),
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <DateIcon sx={{ fontSize: 18 }} />
                          <strong>Ready Date:</strong> {formatDate(animal.transfer_ready_date)}
                        </Typography>
                      )}

                      {animal.special_instructions && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            mb: 3,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(customTheme.warning, 0.1)} 0%, ${alpha(customTheme.warning, 0.05)} 100%)`,
                            border: `1px solid ${alpha(customTheme.warning, 0.3)}`
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: customTheme.primary,
                              fontWeight: 500,
                              fontStyle: 'italic',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1
                            }}
                          >
                            <UrgentIcon sx={{ fontSize: 16, color: customTheme.warning, mt: 0.2 }} />
                            <span><strong>Instructions:</strong> {animal.special_instructions}</span>
                          </Typography>
                        </Paper>
                      )}

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                          variant="contained" 
                          size="small"
                          startIcon={<TransferIcon />}
                          onClick={() => handleIndividualTransfer(animal)}
                          sx={{
                            flex: 1,
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 700,
                            textTransform: 'none',
                            background: `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
                            color: '#ffffff',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.4)}`
                            }
                          }}
                        >
                          Transfer
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {animalsReadyForTransfer.length === 0 && !loading && (
            <Zoom in timeout={1000}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 8, 
                  textAlign: 'center',
                  borderRadius: 6,
                  background: `
                    radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                    linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
                  `,
                  border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                  position: 'relative'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(customTheme.secondary, 0.1),
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 3,
                    border: `3px solid ${alpha(customTheme.secondary, 0.2)}`,
                    animation: `${float} 4s ease-in-out infinite`
                  }}
                >
                  <CompleteIcon sx={{ fontSize: 64, color: customTheme.secondary }} />
                </Avatar>
                <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                  No animals ready for transfer
                </Typography>
                <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 400, mx: 'auto' }}>
                  Animals marked as "Ready for Transfer" will appear here for efficient batch processing
                </Typography>
              </Paper>
            </Zoom>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Transfer History Tab */}
          <Zoom in timeout={1000}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 8, 
                textAlign: 'center',
                borderRadius: 6,
                background: `
                  radial-gradient(circle at center, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                  linear-gradient(135deg, ${alpha(customTheme.accent, 0.3)} 0%, ${alpha(customTheme.background, 0.8)} 100%)
                `,
                border: `2px solid ${alpha(customTheme.accent, 0.2)}`,
                position: 'relative'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(customTheme.accent, 0.1),
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 3,
                  border: `3px solid ${alpha(customTheme.accent, 0.3)}`,
                  animation: `${float} 4s ease-in-out infinite`
                }}
              >
                <AssessmentIcon sx={{ fontSize: 64, color: customTheme.accent }} />
              </Avatar>
              <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
                Transfer History Feature
              </Typography>
              <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.7), maxWidth: 500, mx: 'auto' }}>
                Coming soon - Comprehensive tracking and analytics for all past transfer records with detailed audit trails
              </Typography>
            </Paper>
          </Zoom>
        </TabPanel>

        {/* Enhanced Transfer Dialog */}
        <Dialog 
          open={transferDialogOpen} 
          onClose={() => setTransferDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: `
                radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
              `,
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ 
            p: 4,
            background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
            borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: customTheme.primary,
                  width: 48,
                  height: 48,
                  boxShadow: `0 4px 15px ${alpha(customTheme.primary, 0.3)}`
                }}
              >
                <TransferIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 0.5
                  }}
                >
                  Transfer {selectedAnimals.length} Animal{selectedAnimals.length > 1 ? 's' : ''}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha(customTheme.primary, 0.7),
                    fontWeight: 500
                  }}
                >
                  Complete the transfer details below
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel 
                    sx={{
                      color: customTheme.primary,
                      fontWeight: 600,
                      '&.Mui-focused': { color: customTheme.primary }
                    }}
                  >
                    Destination Shelter
                  </InputLabel>
                  <Select
                    value={transferForm.new_shelter_id}
                    onChange={(e) => setTransferForm({...transferForm, new_shelter_id: e.target.value})}
                    label="Destination Shelter"
                    sx={selectStyles}
                  >
                    {availableShelters.map((shelter) => (
                      <MenuItem key={shelter.id} value={shelter.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ color: customTheme.secondary, fontSize: 18 }} />
                          {getShelterName(shelter)}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Transfer Date"
                  value={transferForm.transfer_date}
                  onChange={(e) => setTransferForm({...transferForm, transfer_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldStyles}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Transfer Notes"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({...transferForm, notes: e.target.value})}
                  placeholder="Special instructions, medical notes, behavioral notes..."
                  sx={fieldStyles}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 4,
            background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
            borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Button 
              onClick={() => setTransferDialogOpen(false)}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{
                borderColor: customTheme.primary,
                color: customTheme.primary,
                fontWeight: 600,
                borderWidth: 2,
                borderRadius: 3,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: customTheme.primary,
                  backgroundColor: alpha(customTheme.primary, 0.08),
                  borderWidth: 2
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={executeBulkTransfer}
              disabled={!transferForm.new_shelter_id || loading}
              startIcon={loading ? null : <SendIcon />}
              sx={{
                background: loading 
                  ? `linear-gradient(45deg, ${alpha(customTheme.success, 0.5)} 30%, ${alpha(customTheme.success, 0.3)} 90%)`
                  : `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)`,
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                boxShadow: loading 
                  ? 'none'
                  : `0 8px 25px ${alpha(customTheme.success, 0.4)}`,
                '&:hover:not(:disabled)': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 35px ${alpha(customTheme.success, 0.5)}`
                },
                '&:disabled': {
                  color: alpha('#ffffff', 0.6)
                }
              }}
            >
              {loading ? 'Transferring...' : 'Transfer Animals'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Mark Ready Dialog */}
        <Dialog 
          open={markReadyDialogOpen} 
          onClose={() => setMarkReadyDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 6,
              background: `
                radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.8)} 70%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)
              `,
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
              boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ 
            p: 4,
            background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
            borderBottom: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: customTheme.warning,
                  width: 48,
                  height: 48,
                  boxShadow: `0 4px 15px ${alpha(customTheme.warning, 0.3)}`
                }}
              >
                <ReadyIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 700,
                    mb: 0.5
                  }}
                >
                  Mark Animal Ready for Transfer
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha(customTheme.primary, 0.7),
                    fontWeight: 500
                  }}
                >
                  Prepare {selectedAnimal?.name || 'animal'} for transfer
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Ready Date"
                  value={readyForm.transfer_date}
                  onChange={(e) => setReadyForm({...readyForm, transfer_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldStyles}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Transfer Instructions"
                  value={readyForm.notes}
                  onChange={(e) => setReadyForm({...readyForm, notes: e.target.value})}
                  placeholder="Special care instructions, medical requirements..."
                  sx={fieldStyles}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 4,
            background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
            borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Button 
              onClick={() => setMarkReadyDialogOpen(false)}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{
                borderColor: customTheme.primary,
                color: customTheme.primary,
                fontWeight: 600,
                borderWidth: 2,
                borderRadius: 3,
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: customTheme.primary,
                  backgroundColor: alpha(customTheme.primary, 0.08),
                  borderWidth: 2
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={executeMarkReady}
              disabled={loading}
              startIcon={loading ? null : <ReadyIcon />}
              sx={{
                background: loading 
                  ? `linear-gradient(45deg, ${alpha(customTheme.warning, 0.5)} 30%, ${alpha(customTheme.warning, 0.3)} 90%)`
                  : `linear-gradient(45deg, ${customTheme.warning} 30%, ${alpha(customTheme.warning, 0.8)} 90%)`,
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                boxShadow: loading 
                  ? 'none'
                  : `0 8px 25px ${alpha(customTheme.warning, 0.4)}`,
                '&:hover:not(:disabled)': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.warning, 0.9)} 30%, ${customTheme.warning} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 35px ${alpha(customTheme.warning, 0.5)}`
                },
                '&:disabled': {
                  color: alpha('#ffffff', 0.6)
                }
              }}
            >
              {loading ? 'Marking...' : 'Mark Ready'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default TransferManagement;