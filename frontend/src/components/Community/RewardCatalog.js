import React, { useState, useEffect } from 'react';
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
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import api from '../../redux/api';

function RewardCatalog() {
  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchRewardsAndPoints();
  }, []);

  const fetchRewardsAndPoints = async () => {
    try {
      setLoading(true);
      const [rewardsRes, pointsRes] = await Promise.all([
        api.get('/rewards/'),
        api.get('/activities/my_points/')
      ]);
      setRewards(rewardsRes.data);
      setUserPoints(pointsRes.data.total_points);
    } catch (err) {
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    try {
      setRedeeming(true);
      await api.post(`/rewards/${selectedReward.id}/redeem/`);
      setConfirmOpen(false);
      setError('');
      // Refresh data
      fetchRewardsAndPoints();
      alert('Reward redeemed successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to redeem reward');
    } finally {
      setRedeeming(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Reward Catalog
        </Typography>
        <Chip
          icon={<LocalOfferIcon />}
          label={`Your Points: ${userPoints}`}
          color="primary"
          sx={{ fontSize: '1.1rem', py: 2, px: 1 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {rewards.map((reward) => (
          <Grid item xs={12} sm={6} md={4} key={reward.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {reward.image_url && (
                <CardMedia
                  component="img"
                  height="200"
                  image={reward.image_url}
                  alt={reward.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {reward.name}
                </Typography>
                <Chip
                  label={reward.reward_type}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {reward.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {reward.points_required} points
                </Typography>
                {reward.quantity_available > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {reward.quantity_available} left
                  </Typography>
                )}
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={userPoints < reward.points_required || !reward.is_active}
                  onClick={() => handleRedeemClick(reward)}
                >
                  {userPoints < reward.points_required ? 'Not Enough Points' : 'Redeem'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Redemption</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to redeem "{selectedReward?.name}" for {selectedReward?.points_required} points?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRedeem} disabled={redeeming}>
            {redeeming ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default RewardCatalog;