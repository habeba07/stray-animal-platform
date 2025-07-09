import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import api from '../../redux/api';

function PointsDisplay() {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await api.get('/activities/my_points/');
      setPoints(response.data.total_points);
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress size={20} />;

  return (
    <Box 
      component={Link} 
      to="/dashboard"
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        ml: 2,
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.8,
          transform: 'scale(1.05)',
        },
        transition: 'all 0.2s ease'
      }}
    >
      <EmojiEventsIcon sx={{ color: 'gold', mr: 1 }} />
      <Typography variant="subtitle1">
        {points} points
      </Typography>
    </Box>
  );
}

export default PointsDisplay;