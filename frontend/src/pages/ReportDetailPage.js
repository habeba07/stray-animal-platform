import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportById, updateReportStatus, reset } from '../redux/slices/reportSlice';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardMedia,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardContent,
} from '@mui/material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PetsIcon from '@mui/icons-material/Pets';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ImageIcon from '@mui/icons-material/Image';

// Fix for Leaflet marker icon
// Create a custom icon with inline SVG to avoid path issues
const customIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="#1976d2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { currentReport, isLoading, isError, message } = useSelector((state) => state.reports);
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [imageError, setImageError] = useState({});
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(fetchReportById(id));
    }
    
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch, id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ASSIGNED':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleStatusSubmit = () => {
    if (newStatus && currentReport) {
      dispatch(updateReportStatus({ id: currentReport.id, status: newStatus }));
      setStatusDialogOpen(false);
    }
  };

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
    console.error(`Error loading image at index ${index}`);
  };

  const canUpdateStatus = user && ['SHELTER', 'STAFF', 'AUTHORITY'].includes(user.user_type);

  if (isLoading || !currentReport) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/reports')}
        sx={{ mb: 2 }}
      >
        Back to Reports
      </Button>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            <PetsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Report #{currentReport.id}
          </Typography>
          <Chip
            label={currentReport.status}
            color={getStatusColor(currentReport.status)}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Animal Information
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Type:</strong> {currentReport.animal_details?.animal_type || 'Not specified'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Gender:</strong> {currentReport.animal_details?.gender || 'Not specified'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Color:</strong> {currentReport.animal_details?.color || 'Not specified'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Description:</strong> {currentReport.description}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Condition:</strong> {currentReport.animal_condition || 'Not specified'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Report Details
            </Typography>
            <Typography variant="body1" gutterBottom>
              <PersonIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              <strong>Reported by:</strong> {currentReport.reporter_details?.username || 'Anonymous'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <AccessTimeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              <strong>Report Date:</strong> {formatDate(currentReport.created_at)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <LocationOnIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              <strong>Location Details:</strong> {currentReport.location_details || 'Not provided'}
            </Typography>
            {currentReport.assigned_to && (
              <Typography variant="body1" gutterBottom>
                <AssignmentIndIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                <strong>Assigned to:</strong> {currentReport.assigned_to_details?.username || 'Unknown'}
              </Typography>
            )}
            {currentReport.rescue_time && (
              <Typography variant="body1" gutterBottom>
                <AccessTimeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                <strong>Rescue Time:</strong> {formatDate(currentReport.rescue_time)}
              </Typography>
            )}
          </Grid>
        </Grid>

        {canUpdateStatus && (
          <Box sx={{ mt: 3, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setStatusDialogOpen(true)}
            >
              Update Status
            </Button>
          </Box>
        )}

        {currentReport.rescue_notes && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rescue Notes
            </Typography>
            <Typography variant="body1">
              {currentReport.rescue_notes}
            </Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            {currentReport.location && (
              <Box sx={{ height: '300px', width: '100%' }}>
                <MapContainer
                  center={[currentReport.location.lat, currentReport.location.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker 
                    position={[currentReport.location.lat, currentReport.location.lng]} 
                    icon={customIcon}
                  />
                </MapContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Photos
            </Typography>
            
            {/* Debug information */}
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
              Photos data: {currentReport.photos ? `${currentReport.photos.length} photos found` : 'No photos array'}
            </Typography>
            
      
            {currentReport.photos && currentReport.photos.length > 0 ? (
  <Grid container spacing={2}>
    {currentReport.photos.map((photo, index) => {
      // Fix the image URL if needed
      let imageUrl = photo;
      
      // Check if it's a relative URL without /media/ prefix
      if (photo.startsWith('reports/')) {
        // Add the /media/ prefix
        imageUrl = `/media/${photo}`;
      }
      // If it contains '/reports/' without '/media/'
      else if (photo.includes('/reports/') && !photo.includes('/media/')) {
        // Extract the part after '/reports/' and add '/media/reports/'
        const parts = photo.split('/reports/');
        if (parts.length > 1) {
          imageUrl = `/media/reports/${parts[1]}`;
        }
      }
      
      // Create absolute URL for direct access
      const absoluteImageUrl = `http://localhost:8000${imageUrl}`;
      
      console.log('Original URL:', photo);
      console.log('Fixed URL:', imageUrl);
      console.log('Absolute URL:', absoluteImageUrl);
      
      return (
        <Grid item xs={12} sm={6} key={index}>
          <Card sx={{ height: '100%' }}>
            {!imageError[index] ? (
              <CardMedia
                component="img"
                height="180"
                image={absoluteImageUrl}  // Use absolute URL here too
                alt={`Animal photo ${index + 1}`}
                onError={() => handleImageError(index)}
                sx={{ objectFit: 'cover' }}
              />
            ) : (
              <Box 
                sx={{ 
                  height: 180, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.100' 
                }}
              >
                <ImageIcon sx={{ fontSize: 80, color: 'grey.400' }} />
              </Box>
            )}
            <CardContent sx={{ py: 1 }}>
              <Typography variant="caption" sx={{ 
                display: 'block', 
                fontSize: '10px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                color: 'text.secondary'
              }}>
                {photo}
              </Typography>
              <Typography variant="caption" sx={{ 
                display: 'block', 
                fontSize: '10px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                color: 'primary.main'
              }}>
                Fixed URL: {absoluteImageUrl}
              </Typography>
              <Button 
                size="small" 
                color="primary" 
                component="a"
                href={absoluteImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 1 }}
              >
                Open Image
              </Button>
            </CardContent>
          </Card>
        </Grid>
      );
    })}
  </Grid>
) : (
  <Box sx={{ 
    p: 4, 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    bgcolor: 'grey.100',
    borderRadius: 1
  }}>
    <Typography variant="body1" sx={{ mb: 2 }}>No photos available</Typography>
    <Typography variant="caption" color="text.secondary">
      If you uploaded photos, there might be an issue with the upload process or backend storage.
    </Typography>
  </Box>
)}
          </Paper>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Update Report Status
          </Typography>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={newStatus}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="ASSIGNED">Assigned</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleStatusSubmit}
              disabled={!newStatus}
            >
              Update
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default ReportDetailPage;