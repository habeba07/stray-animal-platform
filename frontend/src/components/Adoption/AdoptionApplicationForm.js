import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Box,
  Divider,
  Fade,
  Zoom,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { useSelector } from 'react-redux';
import api from '../../redux/api';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';

// Custom theme colors
const theme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

function AdoptionApplicationForm() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [animal, setAnimal] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  
  const [formData, setFormData] = useState({
    why_adopt: '',
    previous_adoption: false,
    previous_adoption_details: '',
    veterinarian_info: '',
    personal_reference: '',
    agree_home_visit: false,
    agree_follow_up: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAnimalAndProfile();
  }, [user, animalId, navigate]);

  const fetchAnimalAndProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch animal details
      const animalResponse = await api.get(`/animals/${animalId}/`);
      setAnimal(animalResponse.data);
      
      // Check if user has adopter profile
      try {
        await api.get('/adopter-profiles/my_profile/');
        setHasProfile(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasProfile(false);
          setError('Please create an adopter profile before applying.');
        }
      }
      
    } catch (err) {
      setError('Failed to load animal details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agree_home_visit || !formData.agree_follow_up) {
      setError('You must agree to home visits and follow-ups to proceed.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const applicationData = {
        ...formData,
        animal: animalId,
      };
      
      await api.post('/adoption-applications/', applicationData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/adoption/applications');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setSubmitting(false);
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
            Loading application form...
          </Typography>
        </Box>
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
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)' 
          }}
        >
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
      {/* Hero Section */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
        backdropFilter: 'blur(10px)',
        py: 6,
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
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 3,
                backgroundColor: theme.accent,
                boxShadow: '0 8px 32px rgba(255, 138, 101, 0.4)',
              }}>
                <FavoriteIcon sx={{ fontSize: 40 }} />
              </Avatar>
              
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  color: theme.primary,
                  fontWeight: 'bold',
                  mb: 2,
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
                Adoption Application
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.primary,
                  opacity: 0.8,
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Take the first step towards giving a loving animal their forever home
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4, mt: -2, position: 'relative', zIndex: 2 }}>
        {/* Animal Info Card */}
        <Zoom in timeout={800}>
          <Card sx={{
            mb: 4,
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
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary}, ${theme.primary})`,
            }
          }}>
            <CardContent sx={{ p: 4, pt: 5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  {animal.photos && animal.photos.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="280"
                      image={animal.photos[0]}
                      alt={animal.name}
                      sx={{
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        border: `3px solid ${theme.secondary}`,
                        objectFit: 'cover',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          transition: 'transform 0.3s ease',
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{
                      height: 280,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${theme.grey}, ${theme.background})`,
                      borderRadius: 3,
                      border: `3px solid ${theme.secondary}`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}>
                      <PetsIcon sx={{ fontSize: 80, color: theme.primary, opacity: 0.7 }} />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h3" sx={{ 
                      color: theme.primary, 
                      fontWeight: 'bold', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <PetsIcon sx={{ fontSize: 40, color: theme.accent }} />
                      {animal.name || 'Unnamed'}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          backgroundColor: theme.grey,
                          borderRadius: 3,
                          border: `1px solid ${theme.secondary}30`,
                        }}>
                          <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                            {animal.animal_type}
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                            Type
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          backgroundColor: theme.grey,
                          borderRadius: 3,
                          border: `1px solid ${theme.secondary}30`,
                        }}>
                          <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                            {animal.breed || 'Mixed'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                            Breed
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          backgroundColor: theme.grey,
                          borderRadius: 3,
                          border: `1px solid ${theme.secondary}30`,
                        }}>
                          <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                            {animal.gender}
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                            Gender
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ 
                          p: 2, 
                          textAlign: 'center', 
                          backgroundColor: theme.grey,
                          borderRadius: 3,
                          border: `1px solid ${theme.secondary}30`,
                        }}>
                          <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                            {animal.age_estimate || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                            Age
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Zoom>
        
        {/* Alerts */}
        {error && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)',
                border: `1px solid ${theme.accent}30`,
              }}
              action={
                !hasProfile && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => navigate('/adoption/profile')}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Create Profile
                  </Button>
                )
              }
            >
              {error}
            </Alert>
          </Fade>
        )}
        
        {success && (
          <Fade in>
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)',
                border: `1px solid ${theme.success}30`,
              }}
            >
              Application submitted successfully! Redirecting...
            </Alert>
          </Fade>
        )}

        {/* Application Form */}
        {hasProfile && (
          <Fade in timeout={1200}>
            <Paper sx={{
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.secondary}30`,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              position: 'relative',
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
              <Box sx={{ p: 4, pt: 5 }}>
                <Typography variant="h4" sx={{ 
                  color: theme.primary, 
                  fontWeight: 'bold', 
                  mb: 4,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2
                }}>
                  <DescriptionIcon sx={{ fontSize: 36, color: theme.accent }} />
                  Application Details
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={4}>
                    {/* Why Adopt Question */}
                    <Grid item xs={12}>
                      <Paper sx={{ 
                        p: 3, 
                        backgroundColor: theme.background,
                        borderRadius: 3,
                        border: `1px solid ${theme.secondary}30`,
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: theme.primary, 
                          fontWeight: 'bold', 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <PersonIcon sx={{ color: theme.accent }} />
                          Tell us about yourself
                        </Typography>
                        <TextField
                          name="why_adopt"
                          label="Why do you want to adopt this animal?"
                          fullWidth
                          multiline
                          rows={4}
                          value={formData.why_adopt}
                          onChange={handleChange}
                          required
                          placeholder="Tell us why you think this pet would be a good fit for your home..."
                          sx={{
                            minWidth: 360,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                              borderRadius: 3,
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
                            '& .MuiInputLabel-root': {
                              color: theme.primary,
                              fontWeight: 'bold',
                              '&.Mui-focused': { color: theme.primary }
                            }
                          }}
                        />
                      </Paper>
                    </Grid>

                    {/* Previous Adoption Experience */}
                    <Grid item xs={12}>
                      <Paper sx={{ 
                        p: 3, 
                        backgroundColor: theme.background,
                        borderRadius: 3,
                        border: `1px solid ${theme.secondary}30`,
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: theme.primary, 
                          fontWeight: 'bold', 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <HomeIcon sx={{ color: theme.secondary }} />
                          Previous Experience
                        </Typography>
                        
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="previous_adoption"
                              checked={formData.previous_adoption}
                              onChange={handleChange}
                              sx={{
                                color: theme.primary,
                                '&.Mui-checked': {
                                  color: theme.accent,
                                },
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ color: theme.primary, fontWeight: 'bold' }}>
                              Have you adopted from a shelter before?
                            </Typography>
                          }
                        />

                        {formData.previous_adoption && (
                          <Fade in>
                            <Box sx={{ mt: 2 }}>
                              <TextField
                                name="previous_adoption_details"
                                label="Previous Adoption Details"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.previous_adoption_details}
                                onChange={handleChange}
                                placeholder="Please provide details about your previous adoption experience..."
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    borderRadius: 3,
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
                                  '& .MuiInputLabel-root': {
                                    color: theme.primary,
                                    fontWeight: 'bold',
                                    '&.Mui-focused': { color: theme.primary }
                                  }
                                }}
                              />
                            </Box>
                          </Fade>
                        )}
                      </Paper>
                    </Grid>

                    {/* References */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ 
                        p: 3, 
                        backgroundColor: theme.background,
                        borderRadius: 3,
                        border: `1px solid ${theme.secondary}30`,
                        height: '100%'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: theme.primary, 
                          fontWeight: 'bold', 
                          mb: 2 
                        }}>
                          Veterinarian Information
                        </Typography>
                        <TextField
                          name="veterinarian_info"
                          label="Veterinarian Information (if any)"
                          fullWidth
                          multiline
                          rows={3}
                          value={formData.veterinarian_info}
                          onChange={handleChange}
                          placeholder="Name, clinic, and contact information of your veterinarian..."
                          sx={{
                            minWidth: 300,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                              borderRadius: 3,
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
                            '& .MuiInputLabel-root': {
                              color: theme.primary,
                              fontWeight: 'bold',
                              '&.Mui-focused': { color: theme.primary }
                            }
                          }}
                        />
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper sx={{ 
                        p: 3, 
                        backgroundColor: theme.background,
                        borderRadius: 3,
                        border: `1px solid ${theme.secondary}30`,
                        height: '100%'
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: theme.primary, 
                          fontWeight: 'bold', 
                          mb: 2 
                        }}>
                          Personal Reference
                        </Typography>
                        <TextField
                          name="personal_reference"
                          label="Personal Reference"
                          fullWidth
                          multiline
                          rows={3}
                          value={formData.personal_reference}
                          onChange={handleChange}
                          placeholder="Name and contact information of someone who can vouch for you..."
                          sx={{
                            minWidth: 300,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                              borderRadius: 3,
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
                            '& .MuiInputLabel-root': {
                              color: theme.primary,
                              fontWeight: 'bold',
                              '&.Mui-focused': { color: theme.primary }
                            }
                          }}
                        />
                      </Paper>
                    </Grid>

                    {/* Agreements */}
                    <Grid item xs={12}>
                      <Paper sx={{ 
                        p: 3, 
                        backgroundColor: theme.background,
                        borderRadius: 3,
                        border: `1px solid ${theme.secondary}30`,
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: theme.primary, 
                          fontWeight: 'bold', 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <CheckCircleIcon sx={{ color: theme.success }} />
                          Required Agreements
                        </Typography>
                        
                        <Divider sx={{ my: 2, borderColor: theme.secondary }} />

                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name="agree_home_visit"
                                  checked={formData.agree_home_visit}
                                  onChange={handleChange}
                                  required
                                  sx={{
                                    color: theme.primary,
                                    '&.Mui-checked': {
                                      color: theme.success,
                                    },
                                  }}
                                />
                              }
                              label={
                                <Typography sx={{ color: theme.primary, fontWeight: 'bold' }}>
                                  I agree to allow a home visit before adoption approval
                                </Typography>
                              }
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name="agree_follow_up"
                                  checked={formData.agree_follow_up}
                                  onChange={handleChange}
                                  required
                                  sx={{
                                    color: theme.primary,
                                    '&.Mui-checked': {
                                      color: theme.success,
                                    },
                                  }}
                                />
                              }
                              label={
                                <Typography sx={{ color: theme.primary, fontWeight: 'bold' }}>
                                  I agree to follow-up visits after adoption
                                </Typography>
                              }
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', pt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={submitting || !hasProfile}
                          startIcon={submitting ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                          sx={{
                            background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                            fontWeight: 'bold',
                            borderRadius: 4,
                            px: 6,
                            py: 2,
                            fontSize: '1.2rem',
                            boxShadow: '0 8px 32px rgba(255, 138, 101, 0.4)',
                            '&:hover': {
                              background: `linear-gradient(135deg, #ff7043, ${theme.accent})`,
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 40px rgba(255, 138, 101, 0.5)',
                            },
                            '&:disabled': {
                              background: '#ccc',
                            }
                          }}
                        >
                          {submitting ? 'Submitting Application...' : 'Submit Adoption Application'}
                        </Button>
                        
                        <Typography variant="body2" sx={{ 
                          color: theme.primary, 
                          opacity: 0.7, 
                          mt: 2,
                          maxWidth: 500,
                          mx: 'auto'
                        }}>
                          By submitting this application, you confirm that all information provided is accurate and complete.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

export default AdoptionApplicationForm;