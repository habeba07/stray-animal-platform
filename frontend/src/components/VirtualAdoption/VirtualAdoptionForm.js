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
} from '@mui/material';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

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
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!animal) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Animal not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Virtually Adopt {animal.name || 'This Animal'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Virtual adoption successful! Redirecting...
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Animal Card */}
          <Grid item xs={12}>
            <Card sx={{ display: 'flex', mb: 3 }}>
              <CardMedia
                component="img"
                sx={{ width: 200, objectFit: 'cover' }}
                image={animal.photos && animal.photos.length ? animal.photos[0] : '/placeholder.jpg'}
                alt={animal.name}
              />
              <CardContent sx={{ flex: '1 0 auto' }}>
                <Typography variant="h5" component="div">
                  {animal.name || 'Unnamed'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {animal.breed || animal.animal_type} • {animal.gender}
                </Typography>
                <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                  {animal.age_estimate && `Age: ${animal.age_estimate}`}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Your virtual adoption helps provide food, shelter, and medical care for {animal.name || 'this animal'}.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Choose Your Adoption Level
            </Typography>
          </Grid>
          
          {/* Adoption Levels */}
          {adoptionLevels.map((level) => (
            <Grid item xs={12} sm={6} md={4} key={level.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  border: formData.amount === level.amount.toString() ? '2px solid #1976d2' : 'none',
                  boxShadow: formData.amount === level.amount.toString() ? 3 : 1
                }}
                onClick={() => handleLevelSelect(level)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {level.name}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {formatCurrency(level.amount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {level.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Benefits:</Typography>
                    <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                      {level.benefits.map((benefit, index) => (
                        <li key={index}>
                          <Typography variant="body2">{benefit}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {/* Custom Amount Option */}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                border: !adoptionLevels.some(l => l.amount.toString() === formData.amount) ? '2px solid #1976d2' : 'none',
                boxShadow: !adoptionLevels.some(l => l.amount.toString() === formData.amount) ? 3 : 1
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
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
                    startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                  }}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Enter a custom amount to support this animal.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ mb: 3, mt: 2 }} />
            <Typography variant="h5" gutterBottom>
              Subscription Period
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <RadioGroup
                name="period"
                value={formData.period}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="MONTHLY" control={<Radio />} label="Monthly" />
                <FormControlLabel value="QUARTERLY" control={<Radio />} label="Quarterly" />
                <FormControlLabel value="ANNUALLY" control={<Radio />} label="Annually" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ mb: 3, mt: 2 }} />
            <FormControlLabel
              control={
                <Checkbox
                  name="is_gift"
                  checked={formData.is_gift}
                  onChange={handleChange}
                />
              }
              label="This is a gift"
            />
          </Grid>
          
          {/* Gift Fields */}
          {formData.is_gift && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="gift_recipient_name"
                  label="Recipient's Name"
                  fullWidth
                  value={formData.gift_recipient_name}
                  onChange={handleChange}
                  required={formData.is_gift}
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
                />
              </Grid>
            </>
          )}
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={submitting}
              onClick={handleSubmit}
              sx={{ mt: 2 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Complete Virtual Adoption'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default VirtualAdoptionForm;