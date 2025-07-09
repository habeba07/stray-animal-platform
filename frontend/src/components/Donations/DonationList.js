import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import api from '../../redux/api';
import { useNavigate } from 'react-router-dom';

function DonationList() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/donation-campaigns/active/');
      setCampaigns(response.data);
    } catch (err) {
      setError('Failed to load donation campaigns');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Support Our Cause
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {campaigns.map((campaign) => (
          <Grid item xs={12} md={6} key={campaign.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {campaign.title}
                </Typography>
                <Chip
                  label={campaign.campaign_type}
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {campaign.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Progress: ${campaign.current_amount} / ${campaign.target_amount}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={campaign.progress_percentage || 0}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/donate/${campaign.id}`)}
                >
                  Donate Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default DonationList;