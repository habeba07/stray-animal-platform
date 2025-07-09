import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Box,
  Chip,
  LinearProgress,
  Divider,
  Tooltip,
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useSelector } from 'react-redux';
import api from '../../redux/api';

function AdoptionMatchesPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);
  const [hasProfile, setHasProfile] = useState(true);
  const [mlPredictions, setMlPredictions] = useState({}); // NEW: ML predictions

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMatches();
  }, [user, navigate]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // Fetch existing compatibility matches
      const response = await api.get('/adoption-matches/my_matches/');
      setMatches(response.data);
      
      // NEW: Fetch ML adoption likelihood predictions for matched animals
      await fetchMLPredictions(response.data);
      
      setError('');
    } catch (err) {
      if (err.response?.status === 400) {
        setHasProfile(false);
        setError('Please create an adopter profile first.');
      } else {
        setError('Failed to load matches. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch ML predictions for the matched animals
  const fetchMLPredictions = async (matchedAnimals) => {
    try {
      // Get a larger set of predictions to find our matched animals
      const response = await api.get('/dashboard/analytics/ml_adoption_predictions/?limit=100');
      const predictions = {};
      
      // Map predictions to our matched animals
      matchedAnimals.forEach(match => {
        const animalPrediction = response.data.animals?.find(
          animal => animal.id === match.animal_details.id
        );
        
        if (animalPrediction) {
          predictions[match.animal_details.id] = {
            likelihood: animalPrediction.adoption_likelihood,
            percentage: animalPrediction.likelihood_percentage,
            factors: animalPrediction.top_factors || [],
            confidence: animalPrediction.confidence
          };
        }
      });
      
      setMlPredictions(predictions);
    } catch (error) {
      console.warn('ML predictions not available:', error);
      // Don't show error to user - ML is enhancement, not required
    }
  };

  const handleApplyForAdoption = (animalId) => {
    navigate(`/adoption/apply/${animalId}`);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Possible Match';
    return 'Challenging Match';
  };

  // NEW: Get adoption likelihood color
  const getLikelihoodColor = (likelihood) => {
    if (likelihood > 0.7) return 'success';
    if (likelihood > 0.4) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Adoption Matches
      </Typography>

      {/* NEW: Show if ML is working */}
      {Object.keys(mlPredictions).length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon />
            <span>✨ Enhanced with AI adoption predictions from your trained ML model!</span>
          </Box>
        </Alert>
      )}

      {error && (
        <Alert 
          severity={hasProfile ? "error" : "warning"} 
          sx={{ mb: 2 }}
          action={
            !hasProfile && (
              <Button color="inherit" size="small" onClick={() => navigate('/adoption/profile')}>
                Create Profile
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      {matches.length === 0 && !error && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No matches found. Please check back later or update your profile.
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {matches.map((match) => {
          // NEW: Get ML prediction for this animal
          const mlPrediction = mlPredictions[match.animal_details.id];
          
          return (
            <Grid item xs={12} md={6} key={match.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative' }}>
                  {match.animal_details.photos && match.animal_details.photos.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="300"
                      image={match.animal_details.photos[0]}
                      alt={match.animal_details.name}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 300,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.200',
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                    </Box>
                  )}
                  
                  {/* Existing compatibility score chip */}
                  <Chip
                    icon={<FavoriteIcon />}
                    label={`${Math.round(match.overall_score)}% Match`}
                    color={getScoreColor(match.overall_score)}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                    }}
                  />
                  
                  {/* NEW: ML Adoption Likelihood chip */}
                  {mlPrediction && (
                    <Tooltip title="AI-powered adoption likelihood prediction">
                      <Chip
                        icon={<SmartToyIcon />}
                        label={`${mlPrediction.percentage}% AI`}
                        color={getLikelihoodColor(mlPrediction.likelihood)}
                        sx={{
                          position: 'absolute',
                          top: 60,
                          right: 16,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {match.animal_details.name || 'Unnamed'}
                  </Typography>
                  
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {match.animal_details.animal_type} • {match.animal_details.breed || 'Unknown breed'} • {match.animal_details.gender}
                  </Typography>

                  {/* Existing compatibility score section */}
                  <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Compatibility Score: {getScoreLabel(match.overall_score)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={match.overall_score} 
                      color={getScoreColor(match.overall_score)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>

                  {/* NEW: ML Adoption Likelihood section (only if available) */}
                  {mlPrediction && (
                    <Box sx={{ my: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SmartToyIcon sx={{ fontSize: 16 }} />
                        AI Adoption Likelihood: {mlPrediction.percentage}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={mlPrediction.percentage} 
                        color={getLikelihoodColor(mlPrediction.likelihood)}
                        sx={{ height: 8, borderRadius: 4, opacity: 0.8 }}
                      />
                      {mlPrediction.factors.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          AI factors: {mlPrediction.factors.slice(0, 2).join(', ')}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Existing detailed scores - keep exactly as they were */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Lifestyle Match
                      </Typography>
                      <Typography variant="body1">
                        {Math.round(match.lifestyle_score)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Experience Match
                      </Typography>
                      <Typography variant="body1">
                        {Math.round(match.experience_score)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Housing Match
                      </Typography>
                      <Typography variant="body1">
                        {Math.round(match.housing_score)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Family Match
                      </Typography>
                      <Typography variant="body1">
                        {Math.round(match.family_score)}%
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Keep existing match reasons */}
                  {match.match_reasons && match.match_reasons.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="success.main" gutterBottom>
                        Why This Match Works:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {match.match_reasons.map((reason, index) => (
                          <li key={index}>
                            <Typography variant="body2">{reason}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}

                  {/* Keep existing challenges */}
                  {match.potential_challenges && match.potential_challenges.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="warning.main" gutterBottom>
                        Considerations:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {match.potential_challenges.map((challenge, index) => (
                          <li key={index}>
                            <Typography variant="body2">{challenge}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}

                  {/* NEW: Add popularity indicator for high-likelihood animals */}
                  {mlPrediction && mlPrediction.likelihood > 0.8 && (
                    <Alert severity="info" sx={{ mt: 2, py: 0.5 }}>
                      <Typography variant="caption">
                        🔥 Popular choice! AI predicts this pet will be adopted quickly.
                      </Typography>
                    </Alert>
                  )}

                  {/* Keep existing buttons */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleApplyForAdoption(match.animal_details.id)}
                    >
                      Apply to Adopt
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/animals/${match.animal_details.id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

export default AdoptionMatchesPage;