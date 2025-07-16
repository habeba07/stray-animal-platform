import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Alert,
  CircularProgress,
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Fade,
  Zoom,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import { useSelector } from 'react-redux';
import api from '../../redux/api';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PetsIcon from '@mui/icons-material/Pets';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SendIcon from '@mui/icons-material/Send';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import StarIcon from '@mui/icons-material/Star';

// Custom theme colors
const theme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

function VirtualAdoptionForm() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [animal, setAnimal] = useState(null);
  const [adoptionLevels, setAdoptionLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    animal: '',
    amount: '',
    period: 'MONTHLY',
    is_gift: false,
    gift_recipient_name: '',
    gift_recipient_email: '',
    gift_message: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [user, animalId, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch animal details
      const animalRes = await api.get(`/animals/${animalId}/`);
      setAnimal(animalRes.data);
      setFormData(prev => ({ ...prev, animal: animalRes.data.id }));
      
      // Fetch adoption levels
      const levelsRes = await api.get('/virtual-adoption-levels/');
      setAdoptionLevels(levelsRes.data);
      
      // Set default amount to first level if available
      if (levelsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, amount: levelsRes.data[0].amount.toString() }));
      }
      
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLevelSelect = (level) => {
    setFormData(prev => ({
      ...prev,
      amount: level.amount.toString()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount) {
      setError('Please select or enter an amount');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      await api.post('/virtual-adoptions/', formData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/virtual-adoptions/my');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process virtual adoption');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
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
            Loading virtual adoption form...
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
                <VolunteerActivismIcon sx={{ fontSize: 40 }} />
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
                Virtually Adopt {animal.name || 'This Animal'}
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.primary,
                  opacity: 0.8,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Make a difference in an animal's life through virtual adoption support
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4, mt: -2, position: 'relative', zIndex: 2 }}>
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
              Virtual adoption successful! Redirecting...
            </Alert>
          </Fade>
        )}
        
        {/* Animal Card */}
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
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ width: { xs: '100%', md: 300 }, position: 'relative' }}>
                <CardMedia
                  component="img"
                  sx={{ 
                    width: '100%', 
                    height: { xs: 250, md: 300 },
                    objectFit: 'cover',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s ease',
                    }
                  }}
                  image={animal.photos && animal.photos.length ? animal.photos[0] : '/placeholder.jpg'}
                  alt={animal.name}
                />
                <Box sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                  borderRadius: '50%',
                  p: 1,
                  boxShadow: '0 4px 12px rgba(255, 138, 101, 0.4)',
                }}>
                  <FavoriteIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
              </Box>
              <CardContent sx={{ flex: '1 0 auto', p: 4 }}>
                <Typography variant="h4" component="div" sx={{ 
                  color: theme.primary, 
                  fontWeight: 'bold', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <PetsIcon sx={{ color: theme.accent }} />
                  {animal.name || 'Unnamed'}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Paper sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      backgroundColor: theme.grey,
                      borderRadius: 3,
                    }}>
                      <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                        {animal.breed || animal.animal_type}
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
                    }}>
                      <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                        {animal.gender}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                        Gender
                      </Typography>
                    </Paper>
                  </Grid>
                  {animal.age_estimate && (
                    <Grid item xs={12}>
                      <Paper sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        backgroundColor: theme.grey,
                        borderRadius: 3,
                      }}>
                        <Typography variant="h6" sx={{ color: theme.primary, fontWeight: 'bold' }}>
                          {animal.age_estimate}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.primary, opacity: 0.7 }}>
                          Age
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
                
                <Typography variant="body1" sx={{ color: theme.primary, lineHeight: 1.6 }}>
                  Your virtual adoption helps provide food, shelter, and medical care for {animal.name || 'this animal'}.
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </Zoom>
          
        {/* Adoption Levels */}
        <Fade in timeout={1000}>
          <Paper sx={{
            background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.secondary}30`,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            p: 4,
            mb: 4,
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
            <Typography variant="h4" sx={{ 
              color: theme.primary, 
              fontWeight: 'bold', 
              mb: 4, 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              pt: 1
            }}>
              <AttachMoneyIcon sx={{ fontSize: 36, color: theme.accent }} />
              Choose Your Adoption Level
            </Typography>
            
            <Grid container spacing={3}>
              {adoptionLevels.map((level) => (
                <Grid item xs={12} sm={6} md={4} key={level.id}>
                  <Zoom in timeout={300 + level.id * 100}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        border: formData.amount === level.amount.toString() ? 
                          `3px solid ${theme.accent}` : 
                          `1px solid ${theme.secondary}30`,
                        borderRadius: 3,
                        background: formData.amount === level.amount.toString() ? 
                          `linear-gradient(135deg, ${theme.accent}10, white)` : 
                          `linear-gradient(135deg, white, ${theme.grey}20)`,
                        boxShadow: formData.amount === level.amount.toString() ? 
                          '0 8px 32px rgba(255, 138, 101, 0.3)' : 
                          '0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                        }
                      }}
                      onClick={() => handleLevelSelect(level)}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        {formData.amount === level.amount.toString() && (
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              icon={<StarIcon />}
                              label="SELECTED"
                              sx={{
                                backgroundColor: theme.accent,
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />
                          </Box>
                        )}
                        
                        <Typography variant="h5" gutterBottom sx={{ 
                          color: theme.primary, 
                          fontWeight: 'bold' 
                        }}>
                          {level.name}
                        </Typography>
                        
                        <Typography variant="h3" sx={{ 
                          color: theme.accent, 
                          fontWeight: 'bold',
                          mb: 2
                        }}>
                          {formatCurrency(level.amount)}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ 
                          color: theme.primary, 
                          mb: 3,
                          minHeight: 40
                        }}>
                          {level.description}
                        </Typography>
                        
                        <Box>
                          <Typography variant="h6" sx={{ 
                            color: theme.primary, 
                            fontWeight: 'bold', 
                            mb: 1 
                          }}>
                            Benefits:
                          </Typography>
                          <Stack spacing={1}>
                            {level.benefits.map((benefit, index) => (
                              <Box key={index} sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'flex-start',
                                textAlign: 'left'
                              }}>
                                <Box sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: theme.secondary,
                                  mr: 1,
                                  flexShrink: 0
                                }} />
                                <Typography variant="body2" sx={{ color: theme.primary }}>
                                  {benefit}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
              
              {/* Custom Amount Option */}
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in timeout={300 + adoptionLevels.length * 100}>
                  <Card sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    border: !adoptionLevels.some(l => l.amount.toString() === formData.amount) ? 
                      `3px solid ${theme.secondary}` : 
                      `1px solid ${theme.secondary}30`,
                    borderRadius: 3,
                    background: !adoptionLevels.some(l => l.amount.toString() === formData.amount) ? 
                      `linear-gradient(135deg, ${theme.secondary}10, white)` : 
                      `linear-gradient(135deg, white, ${theme.grey}20)`,
                    boxShadow: !adoptionLevels.some(l => l.amount.toString() === formData.amount) ? 
                      '0 8px 32px rgba(129, 199, 132, 0.3)' : 
                      '0 4px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                    }
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      {!adoptionLevels.some(l => l.amount.toString() === formData.amount) && (
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            icon={<StarIcon />}
                            label="CUSTOM"
                            sx={{
                              backgroundColor: theme.secondary,
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                        </Box>
                      )}
                      
                      <Typography variant="h5" gutterBottom sx={{ 
                        color: theme.primary, 
                        fontWeight: 'bold' 
                      }}>
                        Custom Amount
                      </Typography>
                      
                      <TextField
                        name="amount"
                        label="Amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1, color: theme.primary, fontWeight: 'bold' }}>$</Typography>,
                        }}
                        sx={{ 
                          mb: 2,
                          minWidth: 200,
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
                      
                      <Typography variant="body2" sx={{ color: theme.primary }}>
                        Enter a custom amount to support this animal.
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
        
        {/* Form Options */}
        <Fade in timeout={1200}>
          <Paper sx={{
            background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.secondary}30`,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            p: 4,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.secondary}, ${theme.accent})`,
            }
          }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                {/* Subscription Period */}
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    backgroundColor: theme.background,
                    borderRadius: 3,
                    border: `1px solid ${theme.secondary}30`,
                  }}>
                    <Typography variant="h5" sx={{ 
                      color: theme.primary, 
                      fontWeight: 'bold', 
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CalendarTodayIcon sx={{ color: theme.secondary }} />
                      Subscription Period
                    </Typography>
                    
                    <FormControl component="fieldset">
                      <RadioGroup
                        name="period"
                        value={formData.period}
                        onChange={handleChange}
                        row
                        sx={{ gap: 3 }}
                      >
                        <FormControlLabel 
                          value="MONTHLY" 
                          control={
                            <Radio sx={{
                              color: theme.primary,
                              '&.Mui-checked': { color: theme.accent }
                            }} />
                          } 
                          label={
                            <Typography sx={{ color: theme.primary, fontWeight: 'bold' }}>
                              Monthly
                            </Typography>
                          } 
                        />
                        <FormControlLabel 
                          value="QUARTERLY" 
                          control={
                            <Radio sx={{
                              color: theme.primary,
                              '&.Mui-checked': { color: theme.accent }
                            }} />
                          } 
                          label={
                            <Typography sx={{ color: theme.primary, fontWeight: 'bold' }}>
                              Quarterly
                            </Typography>
                          } 
                        />
                        <FormControlLabel 
                          value="ANNUALLY" 
                          control={
                            <Radio sx={{
                              color: theme.primary,
                              '&.Mui-checked': { color: theme.accent }
                            }} />
                          } 
                          label={
                            <Typography sx={{ color: theme.primary, fontWeight: 'bold' }}>
                              Annually
                            </Typography>
                          } 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Paper>
                </Grid>
                
                {/* Gift Option */}
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    backgroundColor: theme.background,
                    borderRadius: 3,
                    border: `1px solid ${theme.secondary}30`,
                  }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_gift"
                          checked={formData.is_gift}
                          onChange={handleChange}
                          sx={{
                            color: theme.primary,
                            '&.Mui-checked': { color: theme.accent }
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ 
                          color: theme.primary, 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <CardGiftcardIcon sx={{ color: theme.accent }} />
                          This is a gift
                        </Typography>
                      }
                    />
                  </Paper>
                </Grid>
                
                {/* Gift Fields */}
                {formData.is_gift && (
                  <Grid item xs={12}>
                    <Fade in>
                      <Paper sx={{ 
                        p: 3, 
                        backgroundColor: theme.background,
                        borderRadius: 3,
                        border: `1px solid ${theme.accent}30`,
                      }}>
                        <Typography variant="h6" sx={{ 
                          color: theme.primary, 
                          fontWeight: 'bold', 
                          mb: 3,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <CardGiftcardIcon sx={{ color: theme.accent }} />
                          Gift Details
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="gift_recipient_name"
                              label="Recipient's Name"
                              fullWidth
                              value={formData.gift_recipient_name}
                              onChange={handleChange}
                              required={formData.is_gift}
                              sx={{
                                minWidth: 200,
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
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <TextField
                              name="gift_recipient_email"
                              label="Recipient's Email"
                              type="email"
                              fullWidth
                              value={formData.gift_recipient_email}
                              onChange={handleChange}
                              required={formData.is_gift}
                              sx={{
                                minWidth: 200,
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
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              name="gift_message"
                              label="Gift Message"
                              multiline
                              rows={3}
                              fullWidth
                              value={formData.gift_message}
                              onChange={handleChange}
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
                          </Grid>
                        </Grid>
                      </Paper>
                    </Fade>
                  </Grid>
                )}
                
                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
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
                      {submitting ? 'Processing Virtual Adoption...' : 'Complete Virtual Adoption'}
                    </Button>
                    
                    <Typography variant="body2" sx={{ 
                      color: theme.primary, 
                      opacity: 0.7, 
                      mt: 2,
                      maxWidth: 500,
                      mx: 'auto'
                    }}>
                      Your virtual adoption will help provide care, food, and medical attention for this animal.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default VirtualAdoptionForm;