import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Badge,
  InputAdornment,
  Paper,
  CircularProgress,
  Container,
  Grid,
  Fade,
  Slide,
  alpha,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  CheckCircle,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Message as MessageIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63', // Warm Brown
  secondary: '#81c784', // Soft Green
  success: '#4caf50', // Fresh Green
  grey: '#f3e5ab', // Warm Cream
  accent: '#ff8a65', // Gentle Orange
  background: '#fff8e1', // Soft Cream
};

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const EnhancedAdoptionApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', app: null });
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Check if current user is staff
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isStaff = currentUser?.user_type && ['STAFF', 'SHELTER', 'Shelter Staff'].includes(currentUser.user_type);

  // Fetch real data from your existing API
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const response = await fetch('http://localhost:8000/api/adoption-applications/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score) => {
    if (!score) return '#9e9e9e';
    if (score >= 90) return customTheme.success;
    if (score >= 75) return customTheme.secondary;
    if (score >= 60) return customTheme.accent;
    return '#f44336';
  };

  const getCompatibilityTooltip = (score, app) => {
    if (!score) return 'No compatibility score available';
    if (score >= 90) {
      return `Excellent match (${score}%)! Highly compatible based on lifestyle, experience, and preferences.`;
    }
    if (score >= 75) {
      return `Good match (${score}%) with strong compatibility indicators.`;
    }
    if (score >= 60) {
      return `Moderate match (${score}%). Consider additional screening.`;
    }
    return `Lower compatibility (${score}%). May need special consideration.`;
  };

  const calculateDaysWaiting = (dateString) => {
    const submittedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - submittedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPriorityLevel = (app) => {
    const daysWaiting = calculateDaysWaiting(app.created_at);
    const score = app.compatibility_score;
    
    if (daysWaiting > 14) return 'urgent';
    if (score && score >= 90) return 'high';
    if (daysWaiting > 7) return 'medium';
    return 'low';
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <WarningIcon sx={{ color: '#f44336', fontSize: 20 }} />;
      case 'high': return <StarIcon sx={{ color: customTheme.accent, fontSize: 20 }} />;
      default: return null;
    }
  };

  const handleQuickAction = (action, app) => {
    setActionDialog({ open: true, type: action, app });
    setNotes('');
  };

  const confirmAction = async () => {
    const { type, app } = actionDialog;
    setUpdating(true);
    
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const statusMap = { 
        approve: 'APPROVED', 
        reject: 'REJECTED',
        pending: 'PENDING'
      };
      
      // Use your existing update_status endpoint
      const response = await fetch(`http://localhost:8000/api/adoption-applications/${app.id}/update_status/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: statusMap[type],
          review_notes: notes
        })
      });
      
      if (response.ok) {
        const updatedApp = await response.json();
        
        // Update local state
        setApplications(prev => 
          prev.map(a => a.id === app.id ? updatedApp : a)
        );
        
        setActionDialog({ open: false, type: '', app: null });
        setNotes('');
        
        // Success feedback
        alert(`Application ${type}d successfully!`);
      } else {
        throw new Error('Failed to update application');
      }
      
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Error updating application. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    const animalName = app.animal_details?.name || '';
    const applicantName = app.applicant_details?.username || app.applicant_details?.name || '';
    
    return animalName.toLowerCase().includes(searchLower) ||
           applicantName.toLowerCase().includes(searchLower);
  });

  // Sort: pending first, then by priority/score
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    // Pending applications first
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    
    // Within pending, sort by score (high to low)
    if (a.status === 'PENDING' && b.status === 'PENDING') {
      const scoreA = a.compatibility_score || 0;
      const scoreB = b.compatibility_score || 0;
      return scoreB - scoreA;
    }
    
    // Then by date (newest first)
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
            linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
          `,
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ color: customTheme.primary, mb: 2 }}
          />
          <Typography variant="h6" sx={{ color: customTheme.primary, fontWeight: 500 }}>
            Loading applications...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.2)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.2)} 0%, transparent 50%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.3)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          right: '5%',
          animation: `${float} 8s ease-in-out infinite`,
          opacity: 0.3,
          zIndex: 0
        }}
      >
        <CheckCircle sx={{ fontSize: 40, color: customTheme.success, transform: 'rotate(15deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '3%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.3,
          zIndex: 0
        }}
      >
        <StarIcon sx={{ fontSize: 35, color: customTheme.accent, transform: 'rotate(-20deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.accent} 90%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                textAlign: 'center'
              }}
            >
              {isStaff ? 'Adoption Applications Management' : 'Adoption Applications'}
            </Typography>
            
            {isStaff && (
              <>
                {/* Quick Stats */}
                <Slide direction="up" in timeout={1000}>
                  <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
                    <Grid item>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.accent, 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                          border: `1px solid ${alpha(customTheme.accent, 0.3)}`,
                          textAlign: 'center',
                          minWidth: 140,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.accent, 0.2)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Chip 
                          label={`${applications.filter(a => a.status === 'PENDING').length} Pending Review`}
                          icon={<WarningIcon />}
                          sx={{
                            backgroundColor: customTheme.accent,
                            color: '#ffffff',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: '#ffffff' }
                          }}
                        />
                      </Paper>
                    </Grid>
                    
                    <Grid item>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.success, 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                          border: `1px solid ${alpha(customTheme.success, 0.3)}`,
                          textAlign: 'center',
                          minWidth: 140,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.success, 0.2)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Chip 
                          label={`${applications.filter(a => a.status === 'APPROVED').length} Approved`}
                          icon={<CheckCircle />}
                          sx={{
                            backgroundColor: customTheme.success,
                            color: '#ffffff',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: '#ffffff' }
                          }}
                        />
                      </Paper>
                    </Grid>
                    
                    <Grid item>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(customTheme.secondary, 0.1)} 0%, ${alpha(customTheme.background, 0.8)} 100%)`,
                          border: `1px solid ${alpha(customTheme.secondary, 0.3)}`,
                          textAlign: 'center',
                          minWidth: 140,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.2)}`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Chip 
                          label={`${applications.filter(a => a.compatibility_score >= 90).length} High Match (90%+)`}
                          icon={<StarIcon />}
                          sx={{
                            backgroundColor: customTheme.secondary,
                            color: '#ffffff',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: '#ffffff' }
                          }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </Slide>

                {/* Search */}
                <Fade in timeout={1200}>
                  <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <TextField
                      placeholder="Search by animal name or applicant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: customTheme.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        maxWidth: 400,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: 3,
                          '& fieldset': {
                            borderColor: alpha(customTheme.primary, 0.3),
                            borderWidth: 2
                          },
                          '&:hover fieldset': {
                            borderColor: customTheme.primary
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: customTheme.primary
                          }
                        }
                      }}
                    />
                  </Box>
                </Fade>
              </>
            )}
          </Box>
        </Fade>

        {!isStaff && (
          <Fade in timeout={800}>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                backgroundColor: alpha(customTheme.secondary, 0.1),
                border: `1px solid ${alpha(customTheme.secondary, 0.3)}`,
                '& .MuiAlert-icon': { color: customTheme.secondary }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                You are viewing adoption applications in read-only mode. Contact staff for application processing.
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Applications Table */}
        <Slide direction="up" in timeout={1000}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${alpha(customTheme.primary, 0.1)}`,
              overflow: 'hidden'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow 
                    sx={{ 
                      background: `linear-gradient(135deg, ${customTheme.primary} 0%, ${alpha(customTheme.primary, 0.8)} 100%)`,
                    }}
                  >
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>Priority</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>ID</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>Animal</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>Applicant</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>Match Score</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>Days Waiting</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedApplications.map((app, index) => {
                    const priority = getPriorityLevel(app);
                    const daysWaiting = calculateDaysWaiting(app.created_at);
                    const isPending = app.status === 'PENDING';
                    
                    return (
                      <TableRow 
                        key={app.id}
                        sx={{
                          backgroundColor: isPending ? alpha(customTheme.accent, 0.08) : 'transparent',
                          borderLeft: priority === 'urgent' ? `4px solid #f44336` : 
                                     priority === 'high' ? `4px solid ${customTheme.accent}` : 'none',
                          '&:hover': { 
                            backgroundColor: alpha(customTheme.primary, 0.05),
                            transform: 'translateX(2px)',
                          },
                          transition: 'all 0.3s ease',
                          animation: `${slideInUp} ${0.5 + index * 0.1}s ease-out`
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getPriorityIcon(priority)}
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={`#${app.id}`}
                            size="small"
                            sx={{
                              backgroundColor: alpha(customTheme.primary, 0.1),
                              color: customTheme.primary,
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: customTheme.primary }}>
                            {app.animal_details?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.7) }}>
                            ({app.animal_details?.animal_type || app.animal_details?.type || 'Unknown'})
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: customTheme.primary }}>
                            {app.applicant_details?.username || app.applicant_details?.name || 'Unknown'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={app.status}
                            size="small"
                            sx={{
                              backgroundColor: app.status === 'PENDING' ? customTheme.accent : 
                                             app.status === 'APPROVED' ? customTheme.success : '#9e9e9e',
                              color: '#ffffff',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        
                        <TableCell>
                          {app.compatibility_score ? (
                            <Chip
                              label={`${app.compatibility_score}%`}
                              size="small"
                              sx={{
                                backgroundColor: getCompatibilityColor(app.compatibility_score),
                                color: '#ffffff',
                                fontWeight: 700
                              }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ color: alpha(customTheme.primary, 0.5) }}>
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Typography 
                            variant="body1" 
                            sx={{
                              color: daysWaiting > 14 ? '#f44336' : 
                                     daysWaiting > 7 ? customTheme.accent : customTheme.primary,
                              fontWeight: daysWaiting > 7 ? 700 : 500
                            }}
                          >
                            {daysWaiting} days
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {isStaff && isPending && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuickAction('approve', app)}
                                  sx={{ 
                                    backgroundColor: alpha(customTheme.success, 0.1),
                                    color: customTheme.success,
                                    '&:hover': { 
                                      backgroundColor: customTheme.success,
                                      color: '#ffffff',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <ApproveIcon />
                                </IconButton>
                                
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuickAction('reject', app)}
                                  sx={{ 
                                    backgroundColor: alpha('#f44336', 0.1),
                                    color: '#f44336',
                                    '&:hover': { 
                                      backgroundColor: '#f44336',
                                      color: '#ffffff',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <RejectIcon />
                                </IconButton>
                              </>
                            )}
                            
                            <IconButton
                              size="small"
                              onClick={() => window.open(`/adoption/applications/${app.id}`, '_blank')}
                              sx={{ 
                                backgroundColor: alpha(customTheme.primary, 0.1),
                                color: customTheme.primary,
                                '&:hover': { 
                                  backgroundColor: customTheme.primary,
                                  color: '#ffffff',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Slide>

        {/* Action Confirmation Dialog */}
        <Dialog 
          open={actionDialog.open} 
          onClose={() => setActionDialog({ open: false, type: '', app: null })}
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${customTheme.primary} 0%, ${customTheme.accent} 100%)`,
              color: '#ffffff',
              fontWeight: 700
            }}
          >
            {actionDialog.type === 'approve' ? 'Approve Application' : 'Reject Application'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom sx={{ color: customTheme.primary, fontWeight: 500 }}>
              {actionDialog.type === 'approve' 
                ? `Approve adoption application for ${actionDialog.app?.animal_details?.name || 'this animal'}?`
                : `Reject adoption application for ${actionDialog.app?.animal_details?.name || 'this animal'}?`
              }
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Review Notes"
              placeholder={actionDialog.type === 'approve' 
                ? "Add any approval notes or conditions..."
                : "Reason for rejection..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha(customTheme.primary, 0.3),
                    borderWidth: 2
                  },
                  '&:hover fieldset': {
                    borderColor: customTheme.primary
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: customTheme.primary
                  }
                },
                '& .MuiInputLabel-root': {
                  color: customTheme.primary,
                  '&.Mui-focused': { color: customTheme.primary }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setActionDialog({ open: false, type: '', app: null })}
              sx={{
                color: customTheme.primary,
                fontWeight: 600,
                '&:hover': { backgroundColor: alpha(customTheme.primary, 0.05) }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={updating}
              variant="contained"
              sx={{
                backgroundColor: actionDialog.type === 'approve' ? customTheme.success : '#f44336',
                fontWeight: 700,
                px: 3,
                '&:hover': {
                  backgroundColor: actionDialog.type === 'approve' ? 
                    alpha(customTheme.success, 0.8) : alpha('#f44336', 0.8)
                }
              }}
            >
              {updating ? (
                <CircularProgress size={20} sx={{ color: '#ffffff' }} />
              ) : (
                actionDialog.type === 'approve' ? 'Approve' : 'Reject'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default EnhancedAdoptionApplications;