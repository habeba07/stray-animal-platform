// pages/AnimalListPage.js - ENHANCED VERSION with new status badges and SHELTER features

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
} from '@mui/icons-material';
import api from '../redux/api';

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
  const [priorityFilter, setPriorityFilter] = useState(''); // NEW
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
      setLoading(false);
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError('Failed to load animals');
      setLoading(false);
    }
  };

  const fetchPage = (pageUrl) => {
    if (pageUrl) {
       // Extract just the path and query from the full URL
       const url = pageUrl.replace('https://pawrescue-backend.onrender.com/api', '');
       fetchAnimals(url);
    
       // Update current page number
       const pageMatch = pageUrl.match(/page=(\d+)/);
       if (pageMatch) {
         setCurrentPage(parseInt(pageMatch[1]));
       }
     }
   };

  const applyFilters = () => {
    let filtered = [...animals];

    // For PUBLIC users, only show AVAILABLE animals
    if (user?.user_type === 'PUBLIC') {
      filtered = filtered.filter(animal => animal.status === 'AVAILABLE');
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(animal =>
        animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.animal_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply animal type filter
    if (animalTypeFilter) {
      filtered = filtered.filter(animal => animal.animal_type === animalTypeFilter);
    }

    // Apply status filter (for non-public users)
    if (statusFilter && user?.user_type !== 'PUBLIC') {
      filtered = filtered.filter(animal => animal.status === statusFilter);
    }

    // Apply gender filter
    if (genderFilter) {
      filtered = filtered.filter(animal => animal.gender === genderFilter);
    }

    // NEW: Apply priority filter (for SHELTER users)
    if (priorityFilter && user?.user_type === 'SHELTER') {
      filtered = filtered.filter(animal => animal.priority_level === priorityFilter);
    }

    // NEW: Sort by priority for SHELTER users (emergency cases first)
    if (user?.user_type === 'SHELTER') {
      filtered.sort((a, b) => {
        const priorityOrder = { 'EMERGENCY': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3 };
        return (priorityOrder[a.priority_level] || 2) - (priorityOrder[b.priority_level] || 2);
      });
    }

    setFilteredAnimals(filtered);
  };

  // ENHANCED: Get status color with new status types
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'ADOPTED':
        return 'info';
      case 'REPORTED':
        return 'warning';
      case 'IN_TREATMENT':
      case 'UNDER_TREATMENT':
        return 'secondary';
      case 'QUARANTINE':
        return 'warning';
      case 'URGENT_MEDICAL':
        return 'error';
      case 'READY_FOR_TRANSFER':
        return 'primary';
      default:
        return 'default';
    }
  };

  // NEW: Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'EMERGENCY':
        return '#f44336';
      case 'HIGH':
        return '#ff9800';
      case 'NORMAL':
        return '#4caf50';
      case 'LOW':
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  };

  // NEW: Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'URGENT_MEDICAL':
        return <EmergencyIcon />;
      case 'UNDER_TREATMENT':
        return <HospitalIcon />;
      case 'QUARANTINE':
        return <LockIcon />;  
      case 'READY_FOR_TRANSFER':
        return <TransferWithinAStationIcon />;
      default:
        return null;
    }
  };

  const handleApplyForAdoption = (animalId) => {
    navigate(`/adoption/apply/${animalId}`);
  };

  const getAnimalTypes = () => {
    const types = [...new Set(animals.map(animal => animal.animal_type))];
    return types.filter(Boolean);
  };

  const getPageTitle = () => {
    if (user?.user_type === 'PUBLIC') {
      return 'Adoptable Animals';
    }
    return 'Animals';
  };

  const getEmptyStateMessage = () => {
    if (user?.user_type === 'PUBLIC') {
      return 'No animals available for adoption at the moment. Check back soon!';
    }
    return 'No animals found';
  };

  // NEW: Get emergency/urgent count for SHELTER users
  const getUrgentCount = () => {
    return filteredAnimals.filter(animal => 
      animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY'
    ).length;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {getPageTitle()}
          </Typography>
          {/* NEW: Emergency alert for SHELTER users */}
          {user?.user_type === 'SHELTER' && getUrgentCount() > 0 && (
            <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2">
                ⚠️ {getUrgentCount()} animals require urgent medical attention
              </Typography>
            </Alert>
          )}
        </Box>
        <Tooltip title="Toggle Filters">
          <IconButton onClick={() => setShowFilters(!showFilters)} color="primary">
            <FilterIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, breed, or animal type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />

          {/* Filters */}
          {showFilters && (
            <>
              <Divider />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <FormControl fullWidth>
                    <InputLabel>Animal Type</InputLabel>
                    <Select
                      value={animalTypeFilter}
                      onChange={(e) => setAnimalTypeFilter(e.target.value)}
                      label="Animal Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {getAnimalTypes().map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      label="Gender"
                    >
                      <MenuItem value="">Any Gender</MenuItem>
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="UNKNOWN">Unknown</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Status filter only for non-public users */}
                {user?.user_type !== 'PUBLIC' && (
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="AVAILABLE">Available</MenuItem>
                        <MenuItem value="ADOPTED">Adopted</MenuItem>
                        <MenuItem value="REPORTED">Reported</MenuItem>
                        <MenuItem value="IN_TREATMENT">In Treatment</MenuItem>
                        <MenuItem value="UNDER_TREATMENT">Under Treatment</MenuItem>
                        <MenuItem value="QUARANTINE">Quarantine</MenuItem>
                        <MenuItem value="URGENT_MEDICAL">Urgent Medical</MenuItem>
                        <MenuItem value="READY_FOR_TRANSFER">Ready for Transfer</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* NEW: Priority filter for SHELTER users */}
                {user?.user_type === 'SHELTER' && (
                  <Grid item xs={12} sm={6} md={2.4}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        label="Priority"
                      >
                        <MenuItem value="">All Priorities</MenuItem>
                        <MenuItem value="EMERGENCY">Emergency</MenuItem>
                        <MenuItem value="HIGH">High Priority</MenuItem>
                        <MenuItem value="NORMAL">Normal</MenuItem>
                        <MenuItem value="LOW">Low Priority</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12} sm={6} md={2.4}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setSearchTerm('');
                      setAnimalTypeFilter('');
                      setStatusFilter('');
                      setGenderFilter('');
                      setPriorityFilter('');
                    }}
                    fullWidth
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Stack>
      </Paper>

      {/* Results Count */}
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Showing {filteredAnimals.length} of {apiResponse?.count || animals.length} animals
        {apiResponse && apiResponse.count > 20 && (
          <span> (Page {currentPage} of {Math.ceil(apiResponse.count / 20)})</span>
        )}
        {user?.user_type === 'SHELTER' && getUrgentCount() > 0 && (
          <Chip 
            label={`${getUrgentCount()} URGENT`} 
            color="error" 
            size="small" 
            sx={{ ml: 2 }} 
          />
        )}
      </Typography>

      {/* Pagination Controls */}
      {apiResponse && (apiResponse.next || apiResponse.previous) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            disabled={!apiResponse.previous}
            onClick={() => fetchPage(apiResponse.previous)}
            sx={{ mr: 2 }}
          >
            Previous Page
          </Button>
          <Typography variant="body2" sx={{ mx: 2 }}>
            Page {currentPage} of {Math.ceil(apiResponse.count / 20)}
          </Typography>
          <Button
            variant="outlined"
            disabled={!apiResponse.next}
            onClick={() => fetchPage(apiResponse.next)}
          >
            Next Page
          </Button>
        </Box>
      )}


      {/* Animals Grid */}
      {filteredAnimals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PetsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {getEmptyStateMessage()}
          </Typography>
          {user?.user_type === 'PUBLIC' && (
            <Typography variant="body2" color="textSecondary">
              You can still help by <strong>reporting stray animals</strong> you encounter!
            </Typography>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAnimals.map((animal) => (
            <Grid item xs={12} sm={6} md={4} key={animal.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: '#fff8e1',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)',
                
                // NEW: Special border for urgent cases
                ...(animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY') && {
                  border: '2px solid #f44336',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                },
                
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(129, 199, 132, 0.4)',
                  transition: 'all 0.3s ease'
                }
              }}>
                {/* NEW: Emergency banner */}
                {(animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY') && (
                  <Box sx={{ 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    p: 0.5, 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    ⚠️ URGENT MEDICAL ATTENTION REQUIRED
                  </Box>
                )}

                {animal.photos && animal.photos.length > 0 ? (
                  <Badge
                    badgeContent={
                      animal.priority_level === 'EMERGENCY' ? (
                        <EmergencyIcon sx={{ color: '#f44336' }} />
                      ) : null
                    }
                    sx={{ width: '100%' }}
                  >
                    <CardMedia
                      component="img"
                      height="240"
                      image={`http://localhost:8000${animal.photos[0]}`}
                      alt={animal.name || 'Animal'}
                      sx={{ objectFit: 'cover', width: '100%' }}
                    />
                  </Badge>
                ) : (
                  <Box
                    sx={{
                      height: 240,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f3e5ab',
                      position: 'relative'
                    }}
                  >
                    <PetsIcon sx={{ fontSize: 80, color: '#8d6e63' }} />
                    {animal.priority_level === 'EMERGENCY' && (
                      <EmergencyIcon sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        color: '#f44336',
                        fontSize: 30
                      }} />
                    )}
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  {/* Animal Name and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {animal.name || 'Unnamed'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={animal.status}
                        color={getStatusColor(animal.status)}
                        size="small"
                        icon={getStatusIcon(animal.status)}
                        sx={{ ml: 1 }}
                      />
                      {/* NEW: Priority chip for SHELTER users */}
                      {user?.user_type === 'SHELTER' && animal.priority_level && animal.priority_level !== 'NORMAL' && (
                        <Chip
                          label={animal.priority_level}
                          size="small"
                          sx={{ 
                            backgroundColor: getPriorityColor(animal.priority_level),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Animal Details */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{animal.animal_type}</strong> {animal.breed && `• ${animal.breed}`}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Gender: {animal.gender}
                    </Typography>
                  </Stack>

                  {animal.age_estimate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <AgeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      Age: {animal.age_estimate}
                    </Typography>
                  )}

                  {animal.location_description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      {animal.location_description}
                    </Typography>
                  )}

                  {/* NEW: Days in shelter for SHELTER users */}
                  {user?.user_type === 'SHELTER' && animal.intake_date && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Days in shelter:</strong> {
                        Math.floor((new Date() - new Date(animal.intake_date)) / (1000 * 60 * 60 * 24))
                      }
                    </Typography>
                  )}

                  {/* Health Status */}
                  {animal.health_status && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Health:</strong> {animal.health_status}
                    </Typography>
                  )}

                  {/* NEW: Special instructions for SHELTER users */}
                  {user?.user_type === 'SHELTER' && animal.special_instructions && (
                    <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                      <strong>Special Instructions:</strong> {animal.special_instructions}
                    </Alert>
                  )}

                  {/* Description Preview */}
                  {animal.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {animal.description.length > 80 
                        ? `${animal.description.substring(0, 80)}...` 
                        : animal.description}
                    </Typography>
                  )}
                </CardContent>

                {/* Action Buttons */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/animals/${animal.id}`)}
                      sx={{ 
                        borderColor: '#8d6e63',
                        color: '#8d6e63',
                        '&:hover': { 
                          borderColor: '#6d4c41',
                          backgroundColor: 'rgba(141, 110, 99, 0.04)'
                        }
                      }}
                    >
                      View Details
                    </Button>
                    
                    {/* Apply for Adoption button only for PUBLIC users and AVAILABLE animals */}
                    {user?.user_type === 'PUBLIC' && animal.status === 'AVAILABLE' && (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<HeartIcon />}
                        onClick={() => handleApplyForAdoption(animal.id)}
                        sx={{ 
                          backgroundColor: '#ff8a65',
                          '&:hover': { backgroundColor: '#ff7043' },
                          borderRadius: 2
                        }}
                      >
                        Apply for Adoption
                      </Button>
                    )}

                    {/* NEW: SHELTER-specific action buttons */}
                    {user?.user_type === 'SHELTER' && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          startIcon={<MedicalIcon />}
                          onClick={() => navigate(`/animals/${animal.id}?tab=health`)}
                          sx={{ 
                            backgroundColor: '#4caf50',
                            '&:hover': { backgroundColor: '#388e3c' },
                            flex: 1
                          }}
                        >
                          Medical
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/animals/${animal.id}?tab=edit`)}
                          sx={{ 
                            backgroundColor: '#2196f3',
                            '&:hover': { backgroundColor: '#1976d2' },
                            flex: 1
                          }}
                        >
                          Edit
                        </Button>
                      </Stack>
                    )}

                    {/* NEW: Emergency action button for urgent cases */}
                    {(animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY') && user?.user_type === 'SHELTER' && (
                      <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<EmergencyIcon />}
                        onClick={() => navigate(`/medical-management?animal=${animal.id}`)}
                        sx={{ fontWeight: 'bold' }}
                      >
                        EMERGENCY TREATMENT
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default AnimalListPage;