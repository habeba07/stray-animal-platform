import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';

function AchievementBadge({ achievement, earned = false, small = false }) {
  // Add null checking for achievement and achievement.icon
  if (!achievement) {
    return null; // Don't render anything if achievement is undefined
  }

  // Safely get the icon with fallback
  const iconName = achievement.icon ? 
    achievement.icon.charAt(0).toUpperCase() + achievement.icon.slice(1) : 
    'EmojiEvents'; // Default fallback icon
    
  const IconComponent = MuiIcons[iconName] || MuiIcons.EmojiEvents;

  return (
    <Tooltip title={achievement.description || 'Achievement'}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: small ? 1 : 2,
          m: 1,
          border: '2px solid',
          borderColor: earned ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          opacity: earned ? 1 : 0.5,
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
            borderColor: 'primary.main',
          },
          cursor: 'pointer',
          width: small ? 80 : 120,
        }}
      >
        <IconComponent
          sx={{
            fontSize: small ? 30 : 50,
            color: earned ? 'primary.main' : 'grey.500',
          }}
        />
        <Typography
          variant={small ? 'caption' : 'subtitle2'}
          align="center"
          sx={{ mt: 1 }}
        >
          {achievement.name || 'Achievement'}
        </Typography>
        {!small && (achievement.points_reward || 0) > 0 && (
          <Typography variant="caption" color="primary">
            +{achievement.points_reward} points
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

export default AchievementBadge;