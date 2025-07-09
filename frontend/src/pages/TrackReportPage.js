import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  CircularProgress,
  Grid,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Report as ReportIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import api from '../redux/api';

const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  grey: '#f3e5ab',
  accent: '#ff8a65',
  background: '#fff8e1',
};

function TrackReportPage() {
  const [trackingId, setTrackingId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      // Try to find report by tracking ID or regular ID
      const response = await api.get(`/reports/track/${trackingId.trim()}/`);
      setReport(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Report not found. Please check your tracking ID.');
      } else {
        setError('Unable to track report. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <PendingIcon sx={{ color: '#ff9800' }} />;
      case 'ASSIGNED':
        return <AssignmentIcon sx={{ color: '#2196f3' }} />;
      case 'IN_PROGRESS':
        return <AssignmentIcon sx={{ color: '#3f51b5' }} />;
      case 'COMPLETED':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'CANCELLED':
        return <CancelIcon sx={{ color: '#f44336' }} />;
      default:
        return <ReportIcon sx={{ color: '#757575' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimelineData = (report) => {
    const timeline = [
      {
        title: 'Report Submitted',
        description: 'Your report was successfully submitted',
        date: report.created_at,
        icon: <ReportIcon />,
        color: 'primary',
      },
    ];

    if (report.status !== 'PENDING') {
      timeline.push({
        title: 'Under Review',
        description: 'Our team is reviewing your report',
        date: report.updated_at,
        icon: <AssignmentIcon />,
        color: 'info',
      });
    }

    if (report.assigned_to) {
      timeline.push({
        title: 'Volunteer Assigned',
        description: `Assigned to ${report.assigned_to_name || 'rescue volunteer'}`,
        date: report.updated_at,
        icon: <PersonIcon />,
        color: 'info',
      });
    }

    if (report.status === 'COMPLETED') {
      timeline.push({
        title: 'Rescue Completed',
        description: 'Animal has been successfully rescued',
        date: report.rescue_time || report.updated_at,
        icon: <CheckCircleIcon />,
        color: 'success',
      });
    }

    if (report.status === 'CANCELLED') {
      timeline.push({
        title: 'Report Cancelled',
        description: 'This report has been cancelled',
        date: report.updated_at,
        icon: <CancelIcon />,
        color: 'error',
      });
    }

    return timeline;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            bgcolor: customTheme.primary,
            width: 70,
            height: 70,
            mx: 'auto',
            mb: 2,
          }}
        >
          <SearchIcon sx={{ fontSize: 35 }} />
        </Avatar>
        <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 700, mb: 2 }}>
          Track Your Report
        </Typography>
        <Typography variant="h6" sx={{ color: customTheme.primary, opacity: 0.8 }}>
          Enter your tracking ID to check the status of your animal report
        </Typography>
      </Box>

      {/* Search Form */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Tracking ID or Report Number"
                placeholder="e.g., PWR-2025-001 or #123"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleTrack}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: customTheme.primary,
                  '&:hover': {
                    backgroundColor: customTheme.primary + 'dd',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Track Report'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Report Details */}
      {report && (
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${customTheme.secondary} 90%)`,
              color: 'white',
              p: 3,
            }}
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 60 }}>
                  <ReportIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Report #{report.id}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Tracking ID: {report.tracking_id || `PWR-${report.id.toString().padStart(4, '0')}`}
                </Typography>
              </Grid>
              <Grid item>
                <Chip
                  label={report.status.replace('_', ' ')}
                  color={getStatusColor(report.status)}
                  size="large"
                  sx={{ fontWeight: 600, fontSize: '1rem' }}
                />
              </Grid>
            </Grid>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Basic Info */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PetsIcon sx={{ color: customTheme.primary, mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Animal Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.animal_type || 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ color: customTheme.primary, mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Reported On
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatDate(report.created_at)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationIcon sx={{ color: customTheme.primary, mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {report.latitude && report.longitude
                        ? `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`
                        : 'Location not available'}
                    </Typography>
                    {report.location_details && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {report.location_details}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Description */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: customTheme.primary, mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {report.description}
              </Typography>
              {report.animal_condition && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Animal Condition
                  </Typography>
                  <Typography variant="body1">{report.animal_condition}</Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Progress Steps */}
            <Box>
              <Typography variant="h6" sx={{ color: customTheme.primary, mb: 3 }}>
                Progress Timeline
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {getTimelineData(report).map((item, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    p: 2,
                    backgroundColor: index === 0 ? customTheme.secondary + '20' : 'transparent',
                    borderRadius: 2,
                    border: `1px solid ${customTheme.primary}20`
                  }}
                >
                  <Avatar sx={{ bgcolor: `${item.color}.main`, width: 40, height: 40 }}>
                    {item.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(item.date)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

            {/* Additional Notes */}
            {report.rescue_notes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: customTheme.primary, mb: 2 }}>
                    Updates & Notes
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {report.rescue_notes}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card sx={{ mt: 4, borderRadius: 3, backgroundColor: customTheme.background }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: customTheme.primary, mb: 2 }}>
            Need Help?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            • Your tracking ID was provided when you submitted the report
            • You can also use the report number (e.g., #123)
            • Reports are typically reviewed within 2-4 hours
            • For urgent cases, call our emergency hotline: 1-800-RESCUE
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: customTheme.primary,
              color: customTheme.primary,
              '&:hover': {
                borderColor: customTheme.primary,
                backgroundColor: customTheme.primary + '10',
              },
            }}
          >
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default TrackReportPage;