import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import api from '../redux/api';
import HealthTrackingTab from '../components/HealthTracking/HealthTrackingTab';
import EditAnimalForm from '../components/HealthTracking/EditAnimalForm';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`animal-tabpanel-${index}`}
      aria-labelledby={`animal-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AnimalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editFormOpen, setEditFormOpen] = useState(false);

  useEffect(() => {
    fetchAnimalDetails();
  }, [id]);

  const fetchAnimalDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/animals/${id}/`);
      setAnimal(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching animal details:', err);
      setError('Failed to load animal details');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditAnimal = () => {
    setEditFormOpen(true);
  };

  const handleCloseEditForm = () => {
    setEditFormOpen(false);
  };

  const handleSaveAnimal = async (updateData) => {
    try {
      const response = await api.patch(`/animals/${id}/`, updateData);
      setAnimal(response.data);
      // Show success message or notification here if you have a notification system
      console.log('Animal updated successfully');
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!animal) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">Animal not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/animals')}
        sx={{ mb: 2 }}
      >
        Back to Animals
      </Button>

      <Paper sx={{ 
        p: 3, 
        mb: 3,
        backgroundColor: '#fff8e1', // Warm cream
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' // Green shadow
      }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
                <PetsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                {animal.name || 'Unnamed Animal'}
              </Typography>
              
              {/* Edit Button for Staff */}
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditAnimal}
                sx={{ 
                  ml: 2,
                  borderColor: '#8d6e63',
                  color: '#8d6e63',
                  '&:hover': { 
                    borderColor: '#6d4c41',
                    backgroundColor: '#f3e5ab' 
                  }
                }}
              >
                Edit Profile
              </Button>
            </Box>
            
            <Typography variant="body1" gutterBottom>
              <strong>Type:</strong> {animal.animal_type}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Gender:</strong> {animal.gender}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Breed:</strong> {animal.breed || 'Unknown'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Color:</strong> {animal.color || 'Not specified'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Age:</strong> {animal.age_estimate || 'Unknown'}
            </Typography>
            {animal.weight && (
              <Typography variant="body1" gutterBottom>
                <strong>Weight:</strong> {animal.weight} lbs
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={animal.status}
                color={animal.status === 'AVAILABLE' ? 'success' : 'default'}
                sx={{ mb: 2 }}
              />
              {animal.photos && animal.photos.length > 0 && (
                <Box
                  component="img"
                  src={animal.photos[0]}
                  alt={animal.name}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {user && ['STAFF', 'SHELTER'].includes(user.user_type) ? (
      // Staff button - single purpose, no duplication
      <Button
    	variant="contained"
        onClick={() => navigate(`/adoption/applications?animal=${id}`)}
        sx={{ 
          backgroundColor: '#8d6e63',
          color: 'white',
          '&:hover': { backgroundColor: '#6d4c41' },
          borderRadius: 2,
          mt: 2
        }}
      >
        View Applications for {animal.name || 'this animal'}
      </Button>
    ) : (
      // Public user button (keep Virtual Adoption for non-staff)
      <Button
        variant="contained"
        startIcon={<FavoriteIcon />}
        onClick={() => navigate(`/virtual-adoptions/new/${animal.id}`)}
        sx={{ 
          mt: 2,
          backgroundColor: '#ff8a65', // Warm orange
          '&:hover': { backgroundColor: '#ff7043' },
          borderRadius: 2
        }} 
      >
        Virtual Adoption
      </Button>
    )}

      <Paper sx={{ 
        width: '100%', 
        mb: 3,
        backgroundColor: '#fff8e1', // Warm cream
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' // Green shadow
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="animal details tabs">
            <Tab label="Overview" />
            <Tab 
              label="Health Records" 
              icon={<VaccinesIcon />} 
              iconPosition="start" 
            />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Health Status:</strong> {animal.health_status || 'Not specified'}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Behavior Notes:</strong> {animal.behavior_notes || 'No notes'}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Special Needs:</strong> {animal.special_needs || 'None'}
          </Typography>
          {animal.adoption_fee && (
            <Typography variant="body1" paragraph>
              <strong>Adoption Fee:</strong> ${animal.adoption_fee}
            </Typography>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <HealthTrackingTab animalId={id} animal={animal} />
        </TabPanel>
      </Paper>

      {/* Edit Animal Form Modal */}
      <EditAnimalForm
        open={editFormOpen}
        onClose={handleCloseEditForm}
        animal={animal}
        onSave={handleSaveAnimal}
      />
    </Container>
  );
}

export default AnimalDetailPage;