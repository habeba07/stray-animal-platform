import React from 'react';
import { Box, Typography, Tooltip, Card, CardContent, alpha, Zoom } from '@mui/material';
import { keyframes } from '@mui/system';
import * as MuiIcons from '@mui/icons-material';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px ${alpha(customTheme.accent, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0)}; }
`;

const shine = keyframes`
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

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

  const getBadgeColors = () => {
    if (earned) {
      return {
        background: `linear-gradient(135deg, ${customTheme.accent} 0%, ${customTheme.secondary} 100%)`,
        border: `3px solid ${customTheme.success}`,
        iconColor: '#ffffff',
        textColor: '#ffffff',
        shadowColor: customTheme.accent
      };
    } else {
      return {
        background: `linear-gradient(135deg, ${alpha(customTheme.grey, 0.6)} 0%, ${alpha(customTheme.grey, 0.3)} 100%)`,
        border: `2px solid ${alpha(customTheme.primary, 0.3)}`,
        iconColor: alpha(customTheme.primary, 0.6),
        textColor: alpha(customTheme.primary, 0.7),
        shadowColor: customTheme.primary
      };
    }
  };

  const colors = getBadgeColors();

  return (
    <Zoom in timeout={600}>
      <Tooltip 
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {achievement.description || 'Achievement'}
            </Typography>
            {(achievement.points_reward || 0) > 0 && (
              <Typography variant="body2" sx={{ color: customTheme.accent }}>
                Reward: +{achievement.points_reward} points
              </Typography>
            )}
          </Box>
        }
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              color: customTheme.primary,
              border: `2px solid ${customTheme.primary}`,
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              fontSize: '0.9rem',
              maxWidth: 300
            }
          },
          arrow: {
            sx: {
              color: 'rgba(255, 255, 255, 0.95)',
              '&::before': {
                border: `2px solid ${customTheme.primary}`
              }
            }
          }
        }}
      >
        <Card
          sx={{
            width: small ? 100 : 140,
            height: small ? 120 : 160,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            background: colors.background,
            border: colors.border,
            borderRadius: small ? 3 : 4,
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: earned ? 'scale(1)' : 'scale(0.95)',
            opacity: earned ? 1 : 0.7,
            animation: earned ? `${float} 4s ease-in-out infinite` : 'none',
            '&:hover': {
              transform: earned ? 'scale(1.1) translateY(-8px)' : 'scale(1.05) translateY(-4px)',
              boxShadow: earned ? 
                `0 20px 40px ${alpha(colors.shadowColor, 0.4)}, 0 0 20px ${alpha(colors.shadowColor, 0.3)}` :
                `0 12px 25px ${alpha(colors.shadowColor, 0.2)}`,
              borderColor: earned ? customTheme.success : customTheme.primary,
              '& .achievement-icon': {
                transform: 'scale(1.2) rotate(10deg)',
                animation: earned ? `${pulse} 1.5s infinite` : 'none'
              },
              '& .shine-effect': {
                animation: `${shine} 1.5s ease-in-out`
              }
            },
            '&::before': earned ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 20%, ${alpha('#ffffff', 0.3)} 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%)
              `,
              pointerEvents: 'none',
              zIndex: 1
            } : {},
          }}
        >
          {/* Shine effect for earned achievements */}
          {earned && (
            <Box
              className="shine-effect"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(45deg, transparent 30%, ${alpha('#ffffff', 0.3)} 50%, transparent 70%)`,
                zIndex: 2,
                pointerEvents: 'none'
              }}
            />
          )}

          <CardContent 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: small ? 1.5 : 2,
              position: 'relative',
              zIndex: 3,
              height: '100%'
            }}
          >
            {/* Achievement Icon */}
            <Box
              className="achievement-icon"
              sx={{
                position: 'relative',
                transition: 'all 0.3s ease',
                mb: small ? 1 : 1.5
              }}
            >
              <IconComponent
                sx={{
                  fontSize: small ? 32 : 48,
                  color: colors.iconColor,
                  transition: 'all 0.3s ease',
                  filter: earned ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
                }}
              />
              
              {/* Sparkle effect for earned achievements */}
              {earned && !small && (
                <>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 12,
                      height: 12,
                      background: customTheme.accent,
                      borderRadius: '50%',
                      animation: `${sparkle} 2s infinite`,
                      animationDelay: '0s'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -6,
                      left: -6,
                      width: 8,
                      height: 8,
                      background: customTheme.secondary,
                      borderRadius: '50%',
                      animation: `${sparkle} 2s infinite`,
                      animationDelay: '0.7s'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      left: -10,
                      width: 6,
                      height: 6,
                      background: '#ffffff',
                      borderRadius: '50%',
                      animation: `${sparkle} 2s infinite`,
                      animationDelay: '1.3s'
                    }}
                  />
                </>
              )}
            </Box>

            {/* Achievement Name */}
            <Typography
              variant={small ? 'caption' : 'subtitle2'}
              align="center"
              sx={{ 
                color: colors.textColor,
                fontWeight: earned ? 700 : 600,
                fontSize: small ? '0.7rem' : '0.9rem',
                lineHeight: 1.2,
                textShadow: earned ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                mb: small ? 0.5 : 1,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {achievement.name || 'Achievement'}
            </Typography>

            {/* Points Reward */}
            {!small && (achievement.points_reward || 0) > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: small ? 4 : 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: earned ? 
                    `linear-gradient(45deg, ${customTheme.success} 0%, ${customTheme.secondary} 100%)` :
                    alpha(customTheme.primary, 0.2),
                  color: earned ? '#ffffff' : customTheme.primary,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  border: earned ? 
                    `1px solid ${customTheme.success}` :
                    `1px solid ${alpha(customTheme.primary, 0.3)}`,
                  boxShadow: earned ? `0 4px 12px ${alpha(customTheme.success, 0.3)}` : 'none'
                }}
              >
                +{achievement.points_reward}
              </Box>
            )}

            {/* Earned indicator */}
            {earned && (
              <Box
                sx={{
                  position: 'absolute',
                  top: small ? 4 : 8,
                  right: small ? 4 : 8,
                  width: small ? 16 : 20,
                  height: small ? 16 : 20,
                  background: `linear-gradient(45deg, ${customTheme.success} 0%, ${customTheme.secondary} 100%)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid #ffffff`,
                  boxShadow: `0 4px 12px ${alpha(customTheme.success, 0.4)}`,
                  animation: `${pulse} 3s infinite`
                }}
              >
                <MuiIcons.Check sx={{ 
                  fontSize: small ? 10 : 12, 
                  color: '#ffffff',
                  fontWeight: 'bold'
                }} />
              </Box>
            )}
          </CardContent>
        </Card>
      </Tooltip>
    </Zoom>
  );
}

export default AchievementBadge;