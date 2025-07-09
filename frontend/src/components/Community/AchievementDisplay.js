import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import api from '../../redux/api';
import AchievementBadge from './AchievementBadge';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AchievementDisplay() {
  const [myAchievements, setMyAchievements] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [myRes, availableRes] = await Promise.all([
        api.get('/achievements/my_achievements/'),
        api.get('/achievements/available/')
      ]);
      
      setMyAchievements(myRes.data);
      setAvailableAchievements(availableRes.data);
    } catch (err) {
      setError('Failed to load achievements');
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
        Achievements
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Earned (${myAchievements.length})`} />
          <Tab label={`Available (${availableAchievements.length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {myAchievements.length === 0 ? (
            <Typography color="text.secondary" align="center">
              You haven't earned any achievements yet. Keep contributing!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {myAchievements.map((userAchievement) => (
                <Grid item xs={6} sm={4} md={3} key={userAchievement.id}>
                  <AchievementBadge 
                    achievement={userAchievement.achievement_details} 
                    earned={true} 
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {availableAchievements.length === 0 ? (
            <Typography color="text.secondary" align="center">
              You've earned all available achievements! Amazing!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {availableAchievements.map((achievement) => (
                <Grid item xs={6} sm={4} md={3} key={achievement.id}>
                  <AchievementBadge 
                    achievement={achievement} 
                    earned={false} 
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default AchievementDisplay;