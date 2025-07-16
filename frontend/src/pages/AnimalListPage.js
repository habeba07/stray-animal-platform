// pages/AnimalListPage.js - IMPRESSIVE REDESIGNED VERSION

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Pets as PetsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FavoriteOutlined as HeartIcon,
  LocationOn as LocationIcon,
  CalendarToday as AgeIcon,
  MedicalServices as MedicalIcon,
  Warning as WarningIcon,
  Emergency as EmergencyIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  LocalHospital as HospitalIcon,
  Lock as LockIcon,     
  TransferWithinAStation as TransferWithinAStationIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import api from '../redux/api';

// Custom theme colors
const theme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

function AnimalListPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [animalTypeFilter, setAnimalTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showMyAnimalsOnly, setShowMyAnimalsOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animals, searchTerm, animalTypeFilter, statusFilter, genderFilter, priorityFilter, user]);

  const fetchAnimals = async (url = '/animals/') => {
    try {
      setLoading(true);
      const response = await api.get(url);
      console.log('Animals data received:', response.data);

      setApiResponse(response.data);
      setAnimals(response.data.results || []);
      setFilteredAnimals(response.data.results || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError('Failed to load animals');
      setLoading(false);
    }
  };

  const fetchPage = (pageUrl) => {
    if (pageUrl) {
       const url = pageUrl.replace('https://pawrescue-backend.onrender.com/api', '');
       fetchAnimals(url);
    
       const pageMatch = pageUrl.match(/page=(\d+)/);
       if (pageMatch) {
         setCurrentPage(parseInt(pageMatch[1]));
       }
     }
   };

  const applyFilters = () => {
    let filtered = [...animals];

    if (user?.user_type === 'PUBLIC') {
      filtered = filtered.filter(animal => animal.status === 'AVAILABLE');
    }

    if (searchTerm) {
      filtered = filtered.filter(animal =>
        animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.animal_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (animalTypeFilter) {
      filtered = filtered.filter(animal => animal.animal_type === animalTypeFilter);
    }

    if (statusFilter && user?.user_type !== 'PUBLIC') {
      filtered = filtered.filter(animal => animal.status === statusFilter);
    }

    if (genderFilter) {
      filtered = filtered.filter(animal => animal.gender === genderFilter);
    }

    if (priorityFilter && user?.user_type === 'SHELTER') {
      filtered = filtered.filter(animal => animal.priority_level === priorityFilter);
    }

    if (user?.user_type === 'SHELTER') {
      filtered.sort((a, b) => {
        const priorityOrder = { 'EMERGENCY': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3 };
        return (priorityOrder[a.priority_level] || 2) - (priorityOrder[b.priority_level] || 2);
      });
    }

    setFilteredAnimals(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'ADOPTED': return 'info';
      case 'REPORTED': return 'warning';
      case 'IN_TREATMENT':
      case 'UNDER_TREATMENT': return 'secondary';
      case 'QUARANTINE': return 'warning';
      case 'URGENT_MEDICAL': return 'error';
      case 'READY_FOR_TRANSFER': return 'primary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'EMERGENCY': return '#f44336';
      case 'HIGH': return theme.accent;
      case 'NORMAL': return theme.success;
      case 'LOW': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'URGENT_MEDICAL': return <EmergencyIcon />;
      case 'UNDER_TREATMENT': return <HospitalIcon />;
      case 'QUARANTINE': return <LockIcon />;  
      case 'READY_FOR_TRANSFER': return <TransferWithinAStationIcon />;
      default: return null;
    }
  };

  const handleApplyForAdoption = (animalId) => {
    navigate(`/adoption/apply/${animalId}`);
  };

  const getAnimalTypes = () => {
    return [
     { value: 'DOG', label: 'Dog' },
     { value: 'CAT', label: 'Cat' },
     { value: 'OTHER', label: 'Other' }
   ];
 };

  const getPageTitle = () => {
    if (user?.user_type === 'PUBLIC') {
      return 'Find Your Perfect Companion';
    }
    return 'Animal Management Center';
  };

  const getPageSubtitle = () => {
    if (user?.user_type === 'PUBLIC') {
      return 'Discover loving animals waiting for their forever homes';
    }
    return 'Comprehensive animal care and tracking system';
  };

  const getEmptyStateMessage = () => {
    if (user?.user_type === 'PUBLIC') {
      return 'No animals available for adoption at the moment. Check back soon!';
    }
    return 'No animals found';
  };

  const getUrgentCount = () => {
    return filteredAnimals.filter(animal => 
      animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY'
    ).length;
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.grey} 100%)`,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: theme.primary,
              mb: 2
            }} 
          />
          <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
            Loading amazing animals...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.background,
    }}>
      {/* Hero Section */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
        backdropFilter: 'blur(10px)',
        py: 8,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${theme.accent}10 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, ${theme.secondary}10 0%, transparent 50%),
                       radial-gradient(circle at 40% 80%, ${theme.primary}10 0%, transparent 50%)`,
          zIndex: 0,
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  color: theme.primary,
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 100,
                    height: 4,
                    background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})`,
                    borderRadius: 2,
                  }
                }}
              >
                {getPageTitle()}
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: theme.primary,
                  opacity: 0.8,
                  mb: 4,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                {getPageSubtitle()}
              </Typography>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
                <Grid item xs={12} md={4}>
                  <Zoom in timeout={1200}>
                    <Paper sx={{
                      p: 3,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, white 0%, ${theme.grey}50 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${theme.secondary}30`,
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}>
                      <PetsIcon sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                      <Typography variant="h4" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                        {apiResponse?.count || animals.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                        Total Animals
                      </Typography>
                    </Paper>
                  </Zoom>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Zoom in timeout={1400}>
                    <Paper sx={{
                      p: 3,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, white 0%, ${theme.grey}50 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${theme.secondary}30`,
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}>
                      <HeartIcon sx={{ fontSize: 40, color: theme.accent, mb: 1 }} />
                      <Typography variant="h4" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                        {filteredAnimals.filter(a => a.status === 'AVAILABLE').length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                        Available for Adoption
                      </Typography>
                    </Paper>
                  </Zoom>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Zoom in timeout={1600}>
                    <Paper sx={{
                      p: 3,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, white 0%, ${theme.grey}50 100%)`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${theme.secondary}30`,
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}>
                      <HomeIcon sx={{ fontSize: 40, color: theme.success, mb: 1 }} />
                      <Typography variant="h4" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                        {filteredAnimals.filter(a => a.status === 'ADOPTED').length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                        Successfully Adopted
                      </Typography>
                    </Paper>
                  </Zoom>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Emergency Alert */}
        {user?.user_type === 'SHELTER' && getUrgentCount() > 0 && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                background: `linear-gradient(135deg, #ffebee 0%, ${theme.grey}50 100%)`,
                border: `2px solid ${theme.accent}`,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(255, 138, 101, 0.3)',
                '& .MuiAlert-icon': {
                  color: theme.accent,
                  fontSize: 28
                }
              }}
            >
              <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                {getUrgentCount()} animals require urgent medical attention
              </Typography>
            </Alert>
          </Fade>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Enhanced Search and Filters */}
        <Fade in timeout={800}>
          <Paper sx={{ 
            p: 4, 
            mb: 4, 
            background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.secondary}30`,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
            }
          }}>
            <Stack spacing={3}>
              {/* Enhanced Search Bar */}
              <Box>
                <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold', mb: 2 }}>
                  Find Your Perfect Match
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by name, breed, or animal type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: theme.primary, mr: 1, fontSize: 28 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      '& fieldset': {
                        borderColor: theme.secondary,
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.primary,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.primary,
                        boxShadow: `0 0 0 3px ${theme.primary}20`,
                      },
                    },
                  }}
                />
              </Box>

              {/* Filter Toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                  Advanced Filters
                </Typography>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterIcon />}
                  variant={showFilters ? "contained" : "outlined"}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontWeight: 'bold',
                    background: showFilters ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : 'white',
                    borderColor: theme.primary,
                    color: showFilters ? 'white' : theme.primary,
                    '&:hover': {
                      background: showFilters ? `linear-gradient(135deg, ${theme.primary}dd, ${theme.secondary}dd)` : theme.grey,
                    }
                  }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </Box>

              {/* Filters */}
              {showFilters && (
                <Fade in>
                  <Box>
                    <Divider sx={{ borderColor: theme.secondary, mb: 3 }} />
                    
                    <Grid container spacing={3}>
                      {/* My Animals Filter - Only for STAFF users */}
                      {user?.user_type === 'STAFF' && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            variant={showMyAnimalsOnly ? "contained" : "outlined"}
                            fullWidth
                            onClick={() => {
                              const newValue = !showMyAnimalsOnly;
                              setShowMyAnimalsOnly(newValue);
                              if (newValue) {
                                setAnimals([]);
                                setFilteredAnimals([]);
                                setApiResponse(null);
                                fetchAnimals('/animals/my_animals/');
                              } else {
                                setAnimals([]);
                                setFilteredAnimals([]);
                                setApiResponse(null);
                                fetchAnimals('/animals/');
                              }
                            }}
                            sx={{ 
                              height: '56px',
                              borderRadius: 3,
                              background: showMyAnimalsOnly ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : 'white',
                              borderColor: theme.primary,
                              color: showMyAnimalsOnly ? 'white' : theme.primary,
                              fontWeight: 'bold',
                              boxShadow: showMyAnimalsOnly ? '0 4px 15px rgba(141, 110, 99, 0.3)' : 'none',
                              '&:hover': { 
                                background: showMyAnimalsOnly ? `linear-gradient(135deg, ${theme.primary}dd, ${theme.secondary}dd)` : theme.grey
                              }
                            }}
                          >
                            {showMyAnimalsOnly ? 'My Animals ✓' : 'My Animals'}
                          </Button>
                        </Grid>
                      )}

                      {/* Enhanced Filter Dropdowns */}
                      {[
                        { 
                          label: 'Animal Type', 
                          value: animalTypeFilter, 
                          onChange: setAnimalTypeFilter,
                          options: [{ value: '', label: 'All Types' }, ...getAnimalTypes()]
                        },
                        { 
                          label: 'Gender', 
                          value: genderFilter, 
                          onChange: setGenderFilter,
                          options: [
                            { value: '', label: 'Any Gender' },
                            { value: 'MALE', label: 'Male' },
                            { value: 'FEMALE', label: 'Female' },
                            { value: 'UNKNOWN', label: 'Unknown' }
                          ]
                        },
                        ...(user?.user_type !== 'PUBLIC' ? [{
                          label: 'Status', 
                          value: statusFilter, 
                          onChange: setStatusFilter,
                          options: [
                            { value: '', label: 'All Statuses' },
                            { value: 'AVAILABLE', label: 'Available' },
                            { value: 'ADOPTED', label: 'Adopted' },
                            { value: 'REPORTED', label: 'Reported' },
                            { value: 'IN_TREATMENT', label: 'In Treatment' },
                            { value: 'UNDER_TREATMENT', label: 'Under Treatment' },
                            { value: 'QUARANTINE', label: 'Quarantine' },
                            { value: 'URGENT_MEDICAL', label: 'Urgent Medical' },
                            { value: 'READY_FOR_TRANSFER', label: 'Ready for Transfer' }
                          ]
                        }] : []),
                        ...(user?.user_type === 'SHELTER' ? [{
                          label: 'Priority', 
                          value: priorityFilter, 
                          onChange: setPriorityFilter,
                          options: [
                            { value: '', label: 'All Priorities' },
                            { value: 'EMERGENCY', label: 'Emergency' },
                            { value: 'HIGH', label: 'High Priority' },
                            { value: 'NORMAL', label: 'Normal' },
                            { value: 'LOW', label: 'Low Priority' }
                          ]
                        }] : [])
                      ].map((filter, index) => (
                        <Grid item xs={12} sm={6} md={3} key={filter.label}>
                          <FormControl fullWidth sx={{ minWidth: 140 }}>
                            <InputLabel sx={{ 
                              color: theme.primary,
                              fontWeight: 'bold',
                              '&.Mui-focused': { color: theme.primary }
                            }}>
                              {filter.label}
                            </InputLabel>
                            <Select
                              value={filter.value}
                              onChange={(e) => filter.onChange(e.target.value)}
                              label={filter.label}
                              sx={{
                                backgroundColor: 'white',
                                borderRadius: 3,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: theme.secondary,
                                  borderWidth: 2,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: theme.primary,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: theme.primary,
                                  boxShadow: `0 0 0 3px ${theme.primary}20`,
                                },
                              }}
                            >
                              {filter.options.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      ))}

                      <Grid item xs={12} sm={6} md={3}>
                        <Button 
                          variant="outlined" 
                          onClick={() => {
                            setSearchTerm('');
                            setAnimalTypeFilter('');
                            setStatusFilter('');
                            setGenderFilter('');
                            setPriorityFilter('');
                            setShowMyAnimalsOnly(false);
                            fetchAnimals('/animals/');
                          }}
                          fullWidth
                          sx={{
                            height: '56px',
                            borderRadius: 3,
                            borderColor: theme.accent,
                            color: theme.accent,
                            backgroundColor: 'white',
                            fontWeight: 'bold',
                            borderWidth: 2,
                            '&:hover': {
                              backgroundColor: theme.accent,
                              color: 'white',
                              borderColor: theme.accent,
                            }
                          }}
                        >
                          Clear All Filters
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              )}
            </Stack>
          </Paper>
        </Fade>

        {/* Results Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
              Showing {filteredAnimals.length} of {apiResponse?.count || animals.length} animals
            </Typography>
            {apiResponse && apiResponse.count > 20 && (
              <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                Page {currentPage} of {Math.ceil(apiResponse.count / 20)}
              </Typography>
            )}
          </Box>
          
          {user?.user_type === 'SHELTER' && getUrgentCount() > 0 && (
            <Chip 
              label={`${getUrgentCount()} URGENT CASES`} 
              sx={{ 
                background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 1,
                boxShadow: '0 4px 15px rgba(255, 138, 101, 0.4)',
                animation: 'pulse 2s infinite'
              }}
            />
          )}
        </Box>

        {/* Enhanced Pagination */}
        {apiResponse && (apiResponse.next || apiResponse.previous) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
            <Paper sx={{
              p: 2,
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: `1px solid ${theme.secondary}30`,
            }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  disabled={!apiResponse.previous}
                  onClick={() => fetchPage(apiResponse.previous)}
                  sx={{ 
                    background: !apiResponse.previous ? '#ccc' : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    '&:hover': {
                      background: !apiResponse.previous ? '#ccc' : `linear-gradient(135deg, ${theme.primary}dd, ${theme.secondary}dd)`,
                    }
                  }}
                >
                  Previous
                </Button>
                
                <Typography variant="body1" sx={{ 
                  color: theme.primary, 
                  fontWeight: 'bold',
                  px: 2
                }}>
                  {currentPage} / {Math.ceil(apiResponse.count / 20)}
                </Typography>
                
                <Button
                  variant="contained"
                  disabled={!apiResponse.next}
                  onClick={() => fetchPage(apiResponse.next)}
                  sx={{
                    background: !apiResponse.next ? '#ccc' : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    '&:hover': {
                      background: !apiResponse.next ? '#ccc' : `linear-gradient(135deg, ${theme.primary}dd, ${theme.secondary}dd)`,
                    }
                  }}
                >
                  Next
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Animals Grid */}
        {filteredAnimals.length === 0 ? (
          <Fade in>
            <Paper sx={{ 
              p: 6, 
              textAlign: 'center',
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              borderRadius: 4,
              border: `1px solid ${theme.secondary}30`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}>
              <PetsIcon sx={{ fontSize: 80, color: theme.primary, mb: 3, opacity: 0.7 }} />
              <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 'bold', mb: 2 }}>
                {getEmptyStateMessage()}
              </Typography>
              {user?.user_type === 'PUBLIC' && (
                <Typography variant="body1" sx={{ color: theme.primary, opacity: 0.8 }}>
                  You can still help by <strong>reporting stray animals</strong> you encounter!
                </Typography>
              )}
            </Paper>
          </Fade>
        ) : (
          <Grid container spacing={4}>
            {filteredAnimals.map((animal, index) => (
              <Grid item xs={12} sm={6} md={4} key={animal.id}>
                <Zoom in timeout={300 + index * 100}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    background: `linear-gradient(135deg, white 0%, ${theme.background}80 100%)`,
                    borderRadius: 4,
                    border: `1px solid ${theme.secondary}30`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    
                    ...(animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY') && {
                      border: `3px solid ${theme.accent}`,
                      boxShadow: `0 8px 32px rgba(255, 138, 101, 0.3)`,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 6,
                        background: `linear-gradient(90deg, ${theme.accent}, #ff7043)`,
                        zIndex: 1,
                      }
                    },
                    
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      '& .animal-image': {
                        transform: 'scale(1.05)',
                      }
                    }
                  }}>
                    {/* Emergency Banner */}
                    {(animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY') && (
                      <Box sx={{ 
                        background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                        color: 'white', 
                        p: 1, 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        position: 'relative',
                        zIndex: 2,
                        boxShadow: '0 2px 8px rgba(255, 138, 101, 0.3)',
                      }}>
                        URGENT MEDICAL ATTENTION REQUIRED
                      </Box>
                    )}

                    {/* Animal Image */}
                    {animal.photos && animal.photos.length > 0 ? (
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          height="280"
                          image={`http://localhost:8000${animal.photos[0]}`}
                          alt={animal.name || 'Animal'}
                          className="animal-image"
                          sx={{ 
                            objectFit: 'cover', 
                            transition: 'transform 0.3s ease',
                          }}
                        />
                        {animal.priority_level === 'EMERGENCY' && (
                          <Box sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                            borderRadius: '50%',
                            p: 1,
                            boxShadow: '0 4px 12px rgba(255, 138, 101, 0.4)',
                          }}>
                            <EmergencyIcon sx={{ color: 'white', fontSize: 24 }} />
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{
                        height: 280,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${theme.grey}, ${theme.background})`,
                        position: 'relative'
                      }}>
                        <PetsIcon sx={{ fontSize: 80, color: theme.primary, opacity: 0.7 }} />
                        {animal.priority_level === 'EMERGENCY' && (
                          <Box sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                            borderRadius: '50%',
                            p: 1,
                            boxShadow: '0 4px 12px rgba(255, 138, 101, 0.4)',
                          }}>
                            <EmergencyIcon sx={{ color: 'white', fontSize: 24 }} />
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Name and Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h5" component="div" sx={{ 
                          fontWeight: 'bold', 
                          color: theme.primary,
                          mb: 1
                        }}>
                          {animal.name || 'Unnamed'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip
                            label={animal.status}
                            color={getStatusColor(animal.status)}
                            size="small"
                            icon={getStatusIcon(animal.status)}
                            sx={{ 
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          />
                          {user?.user_type === 'SHELTER' && animal.priority_level && animal.priority_level !== 'NORMAL' && (
                            <Chip
                              label={animal.priority_level}
                              size="small"
                              sx={{ 
                                backgroundColor: getPriorityColor(animal.priority_level),
                                color: 'white',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Animal Details with Icons */}
                      <Stack spacing={1.5}>
                        <Typography variant="body1" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                          {animal.animal_type} {animal.breed && `• ${animal.breed}`}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ color: theme.primary }}>
                          Gender: {animal.gender}
                        </Typography>

                        {animal.age_estimate && (
                          <Typography variant="body2" sx={{ color: theme.primary }}>
                            Age: {animal.age_estimate}
                          </Typography>
                        )}

                        {animal.location_description && (
                          <Typography variant="body2" sx={{ color: theme.primary }}>
                            Location: {animal.location_description}
                          </Typography>
                        )}

                        {user?.user_type === 'SHELTER' && animal.intake_date && (
                          <Typography variant="body2" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                            Days in shelter: {
                              Math.floor((new Date() - new Date(animal.intake_date)) / (1000 * 60 * 60 * 24))
                            }
                          </Typography>
                        )}

                        {animal.health_status && (
                          <Typography variant="body2" sx={{ color: theme.primary }}>
                            Health: {animal.health_status}
                          </Typography>
                        )}
                      </Stack>

                      {/* Special Instructions */}
                      {user?.user_type === 'SHELTER' && animal.special_instructions && (
                        <Alert 
                          severity="info" 
                          sx={{ 
                            mt: 2,
                            fontSize: '0.8rem',
                            background: `linear-gradient(135deg, ${theme.grey}50, white)`,
                            border: `1px solid ${theme.secondary}`,
                            borderRadius: 2,
                          }}
                        >
                          <strong>Special Instructions:</strong> {animal.special_instructions}
                        </Alert>
                      )}
                    </CardContent>

                    {/* Enhanced Action Buttons */}
                    <Box sx={{ p: 3, pt: 0 }}>
                      <Stack spacing={2}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => navigate(`/animals/${animal.id}`)}
                          sx={{ 
                            borderColor: theme.primary,
                            color: theme.primary,
                            fontWeight: 'bold',
                            borderWidth: 2,
                            borderRadius: 3,
                            py: 1.5,
                            '&:hover': { 
                              borderColor: theme.primary,
                              backgroundColor: theme.grey,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 15px rgba(141, 110, 99, 0.3)',
                            }
                          }}
                        >
                          View Full Profile
                        </Button>
                        
                        {/* Adoption Button */}
                        {user?.user_type === 'PUBLIC' && animal.status === 'AVAILABLE' && (
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<HeartIcon />}
                            onClick={() => handleApplyForAdoption(animal.id)}
                            sx={{ 
                              background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                              fontWeight: 'bold',
                              borderRadius: 3,
                              py: 1.5,
                              boxShadow: '0 4px 15px rgba(255, 138, 101, 0.4)',
                              '&:hover': { 
                                background: `linear-gradient(135deg, #ff7043, ${theme.accent})`,
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(255, 138, 101, 0.5)',
                              }
                            }}
                          >
                            Apply for Adoption
                          </Button>
                        )}

                        {/* Shelter Action Buttons */}
                        {user?.user_type === 'SHELTER' && (
                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="contained"
                              startIcon={<MedicalIcon />}
                              onClick={() => navigate(`/animals/${animal.id}?tab=health`)}
                              sx={{ 
                                background: `linear-gradient(135deg, ${theme.success}, #4caf50)`,
                                fontWeight: 'bold',
                                borderRadius: 3,
                                flex: 1,
                                '&:hover': { 
                                  background: `linear-gradient(135deg, #4caf50, ${theme.success})`,
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              Medical
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<EditIcon />}
                              onClick={() => navigate(`/animals/${animal.id}?tab=edit`)}
                              sx={{ 
                                background: `linear-gradient(135deg, ${theme.secondary}, #81c784)`,
                                fontWeight: 'bold',
                                borderRadius: 3,
                                flex: 1,
                                '&:hover': { 
                                  background: `linear-gradient(135deg, #81c784, ${theme.secondary})`,
                                  transform: 'translateY(-2px)',
                                }
                              }}
                            >
                              Edit
                            </Button>
                          </Stack>
                        )}

                        {/* Emergency Button */}
                        {(animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY') && user?.user_type === 'SHELTER' && (
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<EmergencyIcon />}
                            onClick={() => navigate(`/medical-management?animal=${animal.id}`)}
                            sx={{ 
                              background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                              fontWeight: 'bold',
                              borderRadius: 3,
                              py: 1.5,
                              boxShadow: '0 4px 15px rgba(255, 138, 101, 0.4)',
                              animation: 'pulse 2s infinite',
                              '&:hover': { 
                                background: `linear-gradient(135deg, #ff7043, ${theme.accent})`,
                                transform: 'translateY(-2px)',
                              }
                            }}
                          >
                            EMERGENCY TREATMENT
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}

export default AnimalListPage;