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
  Tooltip,
  Alert,
  Badge,
  InputAdornment,
  Paper,
  CircularProgress
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

const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  grey: '#f3e5ab',
  accent: '#ff8a65',
  background: '#fff8e1',
};

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
    if (score >= 60) return '#ff9800';
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
      case 'high': return <StarIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with search and stats - Staff Only */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isStaff ? 'All Adoption Applications' : 'Adoption Applications'}
        </Typography>
        
        {isStaff && (
          <>
            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Chip 
                label={`${applications.filter(a => a.status === 'PENDING').length} Pending Review`}
                color="warning"
                icon={<WarningIcon />}
              />
              <Chip 
                label={`${applications.filter(a => a.status === 'APPROVED').length} Approved`}
                color="success"
                icon={<CheckCircle />}
              />
              <Chip 
                label={`${applications.filter(a => a.compatibility_score >= 90).length} High Match (90%+)`}
                color="primary"
                icon={<StarIcon />}
              />
            </Box>

            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search by animal name or applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          </>
        )}
      </Box>

      {!isStaff && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You are viewing adoption applications in read-only mode. Contact staff for application processing.
        </Alert>
      )}

      {/* Applications Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: customTheme.background }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: customTheme.primary }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Animal</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Applicant</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Match Score</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Days Waiting</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedApplications.map((app) => {
              const priority = getPriorityLevel(app);
              const daysWaiting = calculateDaysWaiting(app.created_at);
              const isPending = app.status === 'PENDING';
              
              return (
                <TableRow 
                  key={app.id}
                  sx={{
                    backgroundColor: isPending ? '#fff3e0' : 'transparent',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    borderLeft: priority === 'urgent' ? '4px solid #f44336' : 
                               priority === 'high' ? '4px solid #ff9800' : 'none'
                  }}
                >
                  <TableCell>
                    {getPriorityIcon(priority)}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{app.id}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {app.animal_details?.name || 'Unknown'}({app.animal_details?.animal_type || app.animal_details?.type || 'Unknown'})
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {app.applicant_details?.username || app.applicant_details?.name || 'Unknown'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={app.status}
                      color={app.status === 'PENDING' ? 'warning' : 
                             app.status === 'APPROVED' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    {app.compatibility_score ? (
                      <Tooltip title={getCompatibilityTooltip(app.compatibility_score, app)}>
                        <Chip
                          label={`${app.compatibility_score}%`}
                          size="small"
                          sx={{
                            backgroundColor: getCompatibilityColor(app.compatibility_score),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color={daysWaiting > 14 ? 'error' : daysWaiting > 7 ? 'warning.main' : 'text.primary'}
                      fontWeight={daysWaiting > 7 ? 'bold' : 'normal'}
                    >
                      {daysWaiting} days
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {isStaff && isPending && (
                        <>
                          <Tooltip title="Quick Approve">
                            <IconButton
                              size="small"
                              onClick={() => handleQuickAction('approve', app)}
                              sx={{ 
                                color: customTheme.success,
                                '&:hover': { backgroundColor: customTheme.success + '20' }
                              }}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Quick Reject">
                            <IconButton
                              size="small"
                              onClick={() => handleQuickAction('reject', app)}
                              sx={{ 
                                color: '#f44336',
                                '&:hover': { backgroundColor: '#f4433620' }
                              }}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => window.open(`/adoption/applications/${app.id}`, '_blank')}
                          sx={{ 
                            color: customTheme.primary,
                            '&:hover': { backgroundColor: customTheme.primary + '20' }
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, type: '', app: null })}>
        <DialogTitle>
          {actionDialog.type === 'approve' ? 'Approve Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
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
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: '', app: null })}>
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            disabled={updating}
            variant="contained"
            color={actionDialog.type === 'approve' ? 'success' : 'error'}
          >
            {updating ? <CircularProgress size={20} /> : 
             (actionDialog.type === 'approve' ? 'Approve' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedAdoptionApplications;