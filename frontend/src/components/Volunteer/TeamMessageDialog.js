// Enhanced TeamMessageDialog.js with impressive styling

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Slide,
  Fade,
  Zoom,
  Divider,
  Chip,
  alpha,
} from '@mui/material';
import {
  Send as SendIcon,
  Message as MessageIcon,
  CheckCircle as CheckIcon,
  LocationOn as LocationIcon,
  Pets as PetsIcon,
  AutoAwesome as SparkleIcon,
  Star as StarIcon,
  SupportAgent as SupportIcon,
  Emergency as EmergencyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import api from '../../redux/api';

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
  50% { transform: translateY(-10px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px ${alpha(customTheme.accent, 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha(customTheme.accent, 0)}; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const successPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const TeamMessageDialog = ({ open, onClose, assignment }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/volunteers/rescue-assignments/send_team_message/', {
        report_id: assignment?.report_details?.id || assignment?.report?.id || assignment?.id,
        message: message.trim()
      });

      if (response.data.success) {
        setSuccess(true);
        setMessage('');
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending team message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!assignment) return null;

  // Extract animal type and location for display
  const animalType = assignment.report_details?.animal_type || 
                    assignment.opportunity_details?.title || 
                    'Animal';
  const location = assignment.report_details?.location_details || 
                  assignment.opportunity_details?.location || 
                  'Unknown location';

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      TransitionComponent={Transition}
      TransitionProps={{ timeout: 600 }}
      PaperProps={{
        sx: {
          borderRadius: 6,
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
          boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.15)}`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.05)} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.05)} 0%, transparent 50%)
            `,
            pointerEvents: 'none',
            zIndex: -1
          }
        }
      }}
    >
      {/* Enhanced Dialog Header */}
      <DialogTitle sx={{ 
        p: 0,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box
          sx={{
            background: `
              linear-gradient(135deg, 
                ${alpha(customTheme.primary, 0.1)} 0%, 
                ${alpha(customTheme.accent, 0.08)} 50%,
                ${alpha(customTheme.secondary, 0.06)} 100%
              )
            `,
            p: 4,
            position: 'relative'
          }}
        >
          {/* Floating Background Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 20,
              animation: `${float} 6s ease-in-out infinite`,
              animationDelay: '0s',
              opacity: 0.3
            }}
          >
            <StarIcon sx={{ fontSize: 20, color: customTheme.accent }} />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: 30,
              left: 30,
              animation: `${sparkle} 4s infinite`,
              animationDelay: '1s'
            }}
          >
            <SparkleIcon sx={{ fontSize: 16, color: customTheme.secondary }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Zoom in timeout={800}>
                <Avatar
                  sx={{
                    bgcolor: customTheme.primary,
                    width: 60,
                    height: 60,
                    mr: 3,
                    boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                    animation: `${pulse} 3s infinite`
                  }}
                >
                  <SupportIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Zoom>
              
              <Box>
                <Slide direction="right" in timeout={1000}>
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 800,
                      background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 80%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.01em',
                      mb: 0.5
                    }}
                  >
                    Message Team Coordinators
                  </Typography>
                </Slide>
                
                <Fade in timeout={1200}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: alpha(customTheme.primary, 0.8),
                      fontWeight: 500
                    }}
                  >
                    Get guidance and support for your mission
                  </Typography>
                </Fade>
              </Box>
            </Box>

            <Button
              onClick={handleClose}
              sx={{
                minWidth: 48,
                height: 48,
                borderRadius: 3,
                color: alpha(customTheme.primary, 0.7),
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: alpha(customTheme.primary, 0.1),
                  transform: 'rotate(90deg)',
                  color: customTheme.primary
                }
              }}
            >
              <CloseIcon />
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          {/* Mission Info Card */}
          <Fade in timeout={1000}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 4,
                background: `
                  linear-gradient(135deg, 
                    ${alpha(customTheme.grey, 0.4)} 0%, 
                    ${alpha(customTheme.background, 0.6)} 100%
                  )
                `,
                border: `2px solid ${alpha(customTheme.primary, 0.15)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 4,
                  height: '100%',
                  background: `linear-gradient(180deg, ${customTheme.accent} 0%, ${customTheme.secondary} 100%)`,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(customTheme.primary, 0.1),
                    mr: 3,
                    animation: `${float} 4s ease-in-out infinite`
                  }}
                >
                  <PetsIcon sx={{ fontSize: 32, color: customTheme.primary }} />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: customTheme.primary,
                      fontWeight: 700,
                      mb: 1,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Mission Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<PetsIcon />}
                      label={animalType}
                      sx={{
                        backgroundColor: alpha(customTheme.primary, 0.15),
                        color: customTheme.primary,
                        fontWeight: 600,
                        border: `1px solid ${alpha(customTheme.primary, 0.3)}`,
                        '& .MuiChip-icon': {
                          color: customTheme.primary
                        }
                      }}
                    />
                    
                    {assignment.status && (
                      <Chip
                        label={assignment.status}
                        color={
                          assignment.status === 'COMPLETED' ? 'success' : 
                          assignment.status === 'IN_PROGRESS' ? 'warning' : 'primary'
                        }
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ 
                mb: 3, 
                backgroundColor: alpha(customTheme.primary, 0.2),
                height: 2
              }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon sx={{ color: customTheme.accent, mr: 2, fontSize: 24 }} />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}
                >
                  {location}
                </Typography>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.7),
                  fontStyle: 'italic',
                  mt: 2,
                  pl: 4,
                  borderLeft: `3px solid ${alpha(customTheme.secondary, 0.3)}`,
                  background: alpha(customTheme.secondary, 0.05),
                  py: 2,
                  borderRadius: '0 8px 8px 0'
                }}
              >
                Use this form to communicate with rescue coordinators for guidance, 
                report complications, provide status updates, or request additional support.
              </Typography>
            </Paper>
          </Fade>

          {/* Error Alert */}
          {error && (
            <Slide direction="down" in timeout={600}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  fontSize: '1rem',
                  backgroundColor: alpha('#f44336', 0.1),
                  border: `2px solid #f44336`,
                  backdropFilter: 'blur(10px)',
                  '& .MuiAlert-icon': {
                    fontSize: '1.3rem',
                  },
                  animation: `${slideInUp} 0.6s ease-out`
                }}
                onClose={() => setError('')}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {error}
                </Typography>
              </Alert>
            </Slide>
          )}

          {/* Success Alert */}
          {success && (
            <Zoom in timeout={800}>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  fontSize: '1rem',
                  backgroundColor: alpha(customTheme.success, 0.1),
                  border: `2px solid ${customTheme.success}`,
                  backdropFilter: 'blur(10px)',
                  animation: `${successPulse} 1s ease infinite`,
                  '& .MuiAlert-icon': {
                    fontSize: '1.3rem',
                    animation: `${sparkle} 2s infinite`
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Message sent to team members!
                </Typography>
              </Alert>
            </Zoom>
          )}

          {/* Enhanced Message Input */}
          <Fade in timeout={1200}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: customTheme.primary,
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <MessageIcon sx={{ mr: 2, color: customTheme.accent }} />
                Your Message to Coordinators
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message Content"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Request guidance, report complications, provide status updates, ask for backup support..."
                disabled={isLoading || success}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    fontSize: '1.1rem',
                    '& fieldset': {
                      borderColor: alpha(customTheme.primary, 0.3),
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: customTheme.secondary,
                      borderWidth: 2,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: customTheme.primary,
                      borderWidth: 3,
                      boxShadow: `0 0 0 3px ${alpha(customTheme.primary, 0.1)}`,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: customTheme.primary,
                      fontWeight: 500,
                      padding: '16px 14px',
                      lineHeight: 1.6
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: customTheme.primary,
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&.Mui-focused': {
                      color: customTheme.primary,
                    },
                    '&.MuiInputLabel-shrink': {
                      fontSize: '0.9rem',
                      transform: 'translate(14px, -9px) scale(0.85)',
                    },
                  }
                }}
              />
              
              {/* Character Counter and Tips */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 2 
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: alpha(customTheme.primary, 0.6),
                    fontWeight: 500
                  }}
                >
                  {message.length} characters
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: alpha(customTheme.primary, 0.7),
                      fontWeight: 500,
                      mr: 1
                    }}
                  >
                    Include mission ID #{assignment.id} for reference
                  </Typography>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: customTheme.success,
                      animation: `${pulse} 2s infinite`
                    }}
                  />
                </Box>
              </Box>
              
              {/* Quick Message Suggestions */}
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.08)} 0%, ${alpha(customTheme.secondary, 0.03)} 100%)`,
                  border: `1px solid ${alpha(customTheme.secondary, 0.2)}`
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: customTheme.primary,
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Quick Message Templates:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    "Need backup - animal is more aggressive than expected",
                    "Requesting veterinary support at location",
                    "Unable to locate animal - requesting guidance",
                    "Mission completed successfully - animal secured",
                    "Encountered access issues at location - need assistance"
                  ].map((template, index) => (
                    <Button
                      key={index}
                      variant="text"
                      size="small"
                      onClick={() => setMessage(template)}
                      disabled={isLoading || success}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        color: alpha(customTheme.primary, 0.8),
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: 2,
                        py: 1,
                        px: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(customTheme.secondary, 0.1),
                          color: customTheme.primary,
                          transform: 'translateX(8px)'
                        }
                      }}
                    >
                      • {template}
                    </Button>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Fade>
        </Box>
      </DialogContent>
      
      {/* Enhanced Dialog Actions */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${alpha(customTheme.primary, 0.05)} 0%, ${alpha(customTheme.accent, 0.03)} 100%)`,
          borderTop: `2px solid ${alpha(customTheme.primary, 0.1)}`,
          p: 4
        }}
      >
        <DialogActions sx={{ p: 0, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleClose}
            disabled={isLoading}
            sx={{ 
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              color: alpha(customTheme.primary, 0.7),
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: alpha(customTheme.primary, 0.08),
                color: customTheme.primary,
                transform: 'translateY(-2px)'
              }
            }}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleSendMessage}
            variant="contained"
            disabled={isLoading || success || !message.trim()}
            startIcon={
              isLoading ? 
                <CircularProgress size={20} color="inherit" /> : 
                <SendIcon />
            }
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              minWidth: 160,
              background: success ? 
                `linear-gradient(45deg, ${customTheme.success} 30%, ${alpha(customTheme.success, 0.8)} 90%)` :
                `linear-gradient(45deg, ${customTheme.accent} 30%, ${customTheme.secondary} 90%)`,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                transition: 'left 0.6s ease',
              },
              '&:hover:not(:disabled)': {
                background: success ? 
                  `linear-gradient(45deg, ${alpha(customTheme.success, 0.9)} 30%, ${customTheme.success} 90%)` :
                  `linear-gradient(45deg, ${alpha(customTheme.accent, 0.9)} 30%, ${alpha(customTheme.secondary, 0.9)} 90%)`,
                transform: 'translateY(-3px)',
                boxShadow: `0 12px 35px ${alpha(success ? customTheme.success : customTheme.accent, 0.4)}`,
                '&::before': {
                  left: '100%'
                }
              },
              '&:disabled': {
                background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.3)} 30%, ${alpha(customTheme.primary, 0.2)} 90%)`,
                color: alpha('#ffffff', 0.6),
                cursor: message.trim() ? 'not-allowed' : 'default'
              },
              ...(success && {
                animation: `${successPulse} 1s ease infinite`
              })
            }}
          >
            {isLoading ? 'Sending Message...' : 
             success ? 'Message Sent!' : 
             'Send Message'}
          </Button>
        </DialogActions>
        
        {/* Quick Help Note */}
        <Fade in timeout={1800}>
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 3,
            backgroundColor: alpha(customTheme.grey, 0.3),
            border: `1px solid ${alpha(customTheme.primary, 0.1)}`
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: alpha(customTheme.primary, 0.8),
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <EmergencyIcon sx={{ fontSize: 16, mr: 1, color: customTheme.accent }} />
              For immediate emergencies, call emergency services directly. 
              This messaging system is for coordination and non-urgent support.
            </Typography>
          </Box>
        </Fade>
      </Paper>
    </Dialog>
  );
};

export default TeamMessageDialog;