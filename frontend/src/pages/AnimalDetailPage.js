import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  Card,
  CardContent,
  CardMedia,
  Fade,
  Zoom,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import Psychology from '@mui/icons-material/Psychology';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import api from '../redux/api';
import HealthTrackingTab from '../components/HealthTracking/HealthTrackingTab';
import PhotoDocumentManager from '../components/Animal/PhotoDocumentManager';
import EditAnimalForm from '../components/HealthTracking/EditAnimalForm';
import DailyCareTab from '../components/DailyCare/DailyCareTab';
import AdoptionRequirementsTab from '../components/Adoption/AdoptionRequirementsTab';

// Custom theme colors
const theme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

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
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AnimalDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromMatches = searchParams.get('from') === 'matches';
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState('');

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
      console.log('Animal updated successfully');
    } catch (error) {
      console.error('Error updating animal:', error);
      throw error;
    }
  };

  const handleAssignToMe = async () => {
    setAssignmentLoading(true);
    try {
      const response = await api.post(`/animals/${id}/assign_to_me/`);
      setAssignmentMessage('Animal assigned to you successfully!');
      await fetchAnimalDetails();
    } catch (error) {
      console.error('Error assigning animal:', error);
      setAssignmentMessage(error.response?.data?.error || 'Failed to assign animal');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleUnassign = async () => {
    setAssignmentLoading(true);
    try {
      const response = await api.post(`/animals/${id}/unassign/`);
      setAssignmentMessage('Animal unassigned successfully!');
      await fetchAnimalDetails();
    } catch (error) {
      console.error('Error unassigning animal:', error);
      setAssignmentMessage(error.response?.data?.error || 'Failed to unassign animal');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const isStaff = user && (user.user_type === 'STAFF' || user.user_type === 'SHELTER' || user.is_staff);

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return theme.success;
      case 'ADOPTED': return theme.secondary;
      case 'REPORTED': return theme.accent;
      case 'IN_TREATMENT':
      case 'UNDER_TREATMENT': return theme.primary;
      case 'QUARANTINE': return theme.accent;
      case 'URGENT_MEDICAL': return '#f44336';
      case 'READY_FOR_TRANSFER': return theme.secondary;
      default: return theme.primary;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
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
            Loading animal details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Alert severity="error" sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!animal) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Alert severity="info" sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)' }}>
          Animal not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.background,
    }}>
      {/* Hero Section with Animal Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
        backdropFilter: 'blur(10px)',
        py: 4,
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
          {/* Back Button */}
          <Fade in timeout={500}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(fromMatches ? '/adoption/matches' : '/animals')}
              sx={{ 
                mb: 3,
                color: theme.primary,
                fontWeight: 'bold',
                backgroundColor: 'white',
                border: `2px solid ${theme.secondary}`,
                borderRadius: 3,
                px: 3,
                py: 1,
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: theme.grey,
                  borderColor: theme.primary,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                }
              }}
            >
              {fromMatches ? 'Back to Matches' : 'Back to Animals'}
            </Button>
          </Fade>

          {/* Assignment Message */}
          {assignmentMessage && (
            <Fade in>
              <Alert 
                severity={assignmentMessage.includes('successfully') ? 'success' : 'error'} 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: `1px solid ${theme.secondary}30`,
                }}
                onClose={() => setAssignmentMessage('')}
              >
                {assignmentMessage}
              </Alert>
            </Fade>
          )}

          {/* Main Animal Card */}
          <Zoom in timeout={800}>
            <Card sx={{ 
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.secondary}30`,
              borderRadius: 4,
              boxShadow: '0 16px 48px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
              }
            }}>
              <CardContent sx={{ p: 4, pt: 5 }}>
                <Grid container spacing={4}>
                  {/* Animal Info */}
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ 
                        backgroundColor: theme.primary, 
                        mr: 2, 
                        width: 56, 
                        height: 56,
                        boxShadow: '0 4px 15px rgba(141, 110, 99, 0.3)',
                      }}>
                        <PetsIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h3" component="h1" sx={{ 
                          color: theme.primary,
                          fontWeight: 'bold',
                          mb: 1,
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}>
                          {animal.name || 'Unnamed Animal'}
                        </Typography>
                        <Chip
                          label={animal.status}
                          sx={{
                            backgroundColor: getStatusColor(animal.status),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            px: 2,
                            py: 1,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                          }}
                        />
                      </Box>
                    </Box>
                    
                    {/* Animal Details Grid */}
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InfoIcon sx={{ color: theme.secondary, mr: 1 }} />
                            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                              Type: <span style={{ fontWeight: 'normal' }}>{animal.animal_type}</span>
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PetsIcon sx={{ color: theme.secondary, mr: 1 }} />
                            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                              Gender: <span style={{ fontWeight: 'normal' }}>{animal.gender}</span>
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InfoIcon sx={{ color: theme.secondary, mr: 1 }} />
                            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                              Breed: <span style={{ fontWeight: 'normal' }}>{animal.breed || 'Unknown'}</span>
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InfoIcon sx={{ color: theme.secondary, mr: 1 }} />
                            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                              Color: <span style={{ fontWeight: 'normal' }}>{animal.color || 'Not specified'}</span>
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon sx={{ color: theme.secondary, mr: 1 }} />
                            <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                              Age: <span style={{ fontWeight: 'normal' }}>{animal.age_estimate || 'Unknown'}</span>
                            </Typography>
                          </Box>
                          
                          {animal.weight && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <HealthAndSafetyIcon sx={{ color: theme.secondary, mr: 1 }} />
                              <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                                Weight: <span style={{ fontWeight: 'normal' }}>{animal.weight} lbs</span>
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>

                    {/* Assignment Information for Staff */}
                    {isStaff && (
                      <Box sx={{ mt: 3, p: 3, backgroundColor: theme.grey, borderRadius: 3, border: `1px solid ${theme.secondary}30` }}>
                        <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                          Assignment Status
                        </Typography>
                        <Typography variant="body1" sx={{ color: theme.primary }}>
                          <strong>Assigned to:</strong> {
                            animal.current_shelter_details ? 
                              `${animal.current_shelter_details.first_name} ${animal.current_shelter_details.last_name} (${animal.current_shelter_details.username})` : 
                              'Unassigned'
                          }
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  {/* Animal Photo */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      {animal.photos && animal.photos.length > 0 ? (
                        <CardMedia
                          component="img"
                          image={animal.photos[0]}
                          alt={animal.name}
                          sx={{
                            width: '100%',
                            height: 320,
                            objectFit: 'cover',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            border: `3px solid ${theme.secondary}`,
                            '&:hover': {
                              transform: 'scale(1.02)',
                              transition: 'transform 0.3s ease',
                            }
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: 320,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${theme.grey}, ${theme.background})`,
                            borderRadius: 3,
                            border: `3px solid ${theme.secondary}`,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          }}
                        >
                          <PetsIcon sx={{ fontSize: 80, color: theme.primary, opacity: 0.7 }} />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Divider sx={{ my: 4, borderColor: theme.secondary }} />
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
                  {/* Edit Button for Staff */}
                  {isStaff && (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEditAnimal}
                      sx={{ 
                        borderColor: theme.primary,
                        color: theme.primary,
                        borderWidth: 2,
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        '&:hover': { 
                          borderColor: theme.primary,
                          backgroundColor: theme.grey,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(141, 110, 99, 0.3)',
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  )}

                  {/* Assignment Buttons for Staff */}
                  {isStaff && (
                    <Box>
                      {!animal.current_shelter ? (
                        <Button
                          variant="contained"
                          onClick={handleAssignToMe}
                          disabled={assignmentLoading}
                          sx={{ 
                            background: `linear-gradient(135deg, ${theme.success}, #4caf50)`,
                            fontWeight: 'bold',
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                            '&:hover': { 
                              background: `linear-gradient(135deg, #4caf50, ${theme.success})`,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.5)',
                            }
                          }}
                        >
                          {assignmentLoading ? 'Assigning...' : 'Assign to Me'}
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          onClick={handleUnassign}
                          disabled={assignmentLoading}
                          sx={{
                            borderColor: theme.accent,
                            color: theme.accent,
                            borderWidth: 2,
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: theme.accent,
                              color: 'white',
                              borderColor: theme.accent,
                              transform: 'translateY(-2px)',
                            }
                          }}
                        >
                          {assignmentLoading ? 'Unassigning...' : 'Unassign'}
                        </Button>
                      )}
                    </Box>
                  )}

                  {/* Public/Staff specific buttons */}
                  {isStaff ? (
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/adoption/applications?animal=${id}`)}
                      sx={{ 
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        color: 'white',
                        fontWeight: 'bold',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        boxShadow: '0 4px 15px rgba(141, 110, 99, 0.4)',
                        '&:hover': { 
                          background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(141, 110, 99, 0.5)',
                        }
                      }}
                    >
                      View Applications for {animal.name || 'this animal'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<FavoriteIcon />}
                      onClick={() => navigate(`/virtual-adoptions/new/${animal.id}`)}
                      sx={{ 
                        background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                        fontWeight: 'bold',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        boxShadow: '0 4px 15px rgba(255, 138, 101, 0.4)',
                        '&:hover': { 
                          background: `linear-gradient(135deg, #ff7043, ${theme.accent})`,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(255, 138, 101, 0.5)',
                        }
                      }} 
                    >
                      Virtual Adoption
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Zoom>
        </Container>
      </Box>

      {/* Tabs Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={1000}>
          <Paper sx={{ 
            width: '100%', 
            mb: 3,
            background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.secondary}30`,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>
            {/* Enhanced Tabs */}
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 100%)`,
            }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="animal details tabs"
                sx={{
                  '& .MuiTab-root': {
                    color: theme.primary,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    px: 3,
                    py: 2,
                    '&.Mui-selected': {
                      color: theme.accent,
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: theme.accent,
                    height: 4,
                    borderRadius: 2,
                  }
                }}
              >
                <Tab label="Overview" />
                <Tab 
                  label="Health Records" 
                  icon={<VaccinesIcon />} 
                  iconPosition="start" 
                />
                {user?.user_type !== 'PUBLIC' && (
                  <Tab 
                    label="Daily Care" 
                    icon={<RestaurantIcon />} 
                    iconPosition="start" 
                  />
                )}
                {isStaff && (
                  <Tab 
                    label="Adoption Requirements" 
                    icon={<Psychology />} 
                    iconPosition="start" 
                  />
                )}
                <Tab 
                  label="Photos & Documents" 
                  icon={<PhotoCameraIcon />} 
                  iconPosition="start" 
                />
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box sx={{ p: 4 }}>
              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{
                  background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
                  border: `1px solid ${theme.secondary}30`,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  p: 4,
                }}>
                  <Typography variant="h5" gutterBottom sx={{ color: theme.primary, fontWeight: 'bold', mb: 3 }}>
                    Additional Information
                  </Typography>
                  
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                        Health Status:
                      </Typography>
                      <Typography variant="body1" sx={{ color: theme.primary, opacity: 0.8, fontSize: '1.1rem' }}>
                        {animal.health_status || 'Not specified'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ borderColor: theme.secondary }} />
                    
                    <Box>
                      <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                        Behavior Notes:
                      </Typography>
                      <Typography variant="body1" sx={{ color: theme.primary, opacity: 0.8, fontSize: '1.1rem' }}>
                        {animal.behavior_notes || 'No notes'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ borderColor: theme.secondary }} />
                    
                    <Box>
                      <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                        Special Needs:
                      </Typography>
                      <Typography variant="body1" sx={{ color: theme.primary, opacity: 0.8, fontSize: '1.1rem' }}>
                        {animal.special_needs || 'None'}
                      </Typography>
                    </Box>
                    
                    {animal.adoption_fee && (
                      <>
                        <Divider sx={{ borderColor: theme.secondary }} />
                        <Box>
                          <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
                            Adoption Fee:
                          </Typography>
                          <Typography variant="h4" sx={{ color: theme.accent, fontWeight: 'bold' }}>
                            ${animal.adoption_fee}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Stack>
                </Box>
              </TabPanel>

              {/* Health Records Tab */}
              <TabPanel value={tabValue} index={1}>
                <HealthTrackingTab animalId={id} animal={animal} />
              </TabPanel>

              {/* Daily Care Tab */}
              {user?.user_type !== 'PUBLIC' && (
                <TabPanel value={tabValue} index={2}>
                  <DailyCareTab animalId={id} animal={animal} />
                </TabPanel>
              )}

              {/* Adoption Requirements Tab */}
              {isStaff && (
                <TabPanel value={tabValue} index={3}>
                  <AdoptionRequirementsTab animalId={id} animal={animal} />
                </TabPanel>
              )}

              {/* Photos & Documents Tab */}
              <TabPanel value={tabValue} index={user?.user_type !== 'PUBLIC' ? (isStaff ? 4 : 3) : 2}>
                <PhotoDocumentManager 
                  animal={animal} 
                  onUpdate={fetchAnimalDetails} 
                />
              </TabPanel>
            </Box>
          </Paper>
        </Fade>
      </Container>

      {/* Edit Animal Form Modal */}
      <EditAnimalForm
        open={editFormOpen}
        onClose={handleCloseEditForm}
        animal={animal}
        onSave={handleSaveAnimal}
      />
    </Box>
  );
}

export default AnimalDetailPage;