import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Chip,
  Box,
  Divider,
  Rating,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideocamIcon from '@mui/icons-material/Videocam';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import api from '../../redux/api';

function ResourceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [resource, setResource] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  
  useEffect(() => {
    fetchResource();
  }, [slug]);
  
  const fetchResource = async () => {
    try {
      setLoading(true);
      const resourceRes = await api.get(`/resources/${slug}/`);
      setResource(resourceRes.data);
      
      // Get ratings for this resource
      const ratingsRes = await api.get(`/resource-ratings/resource_ratings/?resource_id=${resourceRes.data.id}`);
      setRatings(ratingsRes.data);
      
      // Check if user has already rated
      if (user) {
        const userRatingObj = ratingsRes.data.find(r => r.user === user.user_id);
        if (userRatingObj) {
          setUserRating(userRatingObj.rating);
          setComment(userRatingObj.comment || '');
        }
      }
    } catch (err) {
      setError('Failed to load resource');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (userRating === 0) {
      setError('Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      await api.post('/resource-ratings/', {
        resource: resource.id,
        rating: userRating,
        comment: comment
      });
      
      setRatingSuccess(true);
      fetchResource(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'ARTICLE':
        return <MenuBookIcon />;
      case 'VIDEO':
        return <VideocamIcon />;
      case 'INFOGRAPHIC':
        return <InsertDriveFileIcon />;
      case 'FAQ':
        return <HelpOutlineIcon />;
      case 'CHECKLIST':
        return <ListAltIcon />;
      default:
        return <MenuBookIcon />;
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'PPP');
  };
  
  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (!resource) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Resource not found</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/resources')}
        sx={{ mb: 2 }}
      >
        Back to Resources
      </Button>
      
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {resource.title}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              icon={getResourceTypeIcon(resource.resource_type)}
              label={resource.resource_type}
              color="primary"
            />
            
            <Chip
              icon={<CalendarTodayIcon />}
              label={formatDate(resource.created_at)}
              variant="outlined"
            />
            
            {resource.category_details && (
              <Chip label={resource.category_details.name} />
            )}
            
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
              {resource.view_count} views
            </Typography>
            
            {resource.average_rating && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={resource.average_rating} precision={0.5} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({resource.rating_count})
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              By {resource.author_details?.first_name} {resource.author_details?.last_name || resource.author_details?.username}
            </Typography>
          </Box>
          
          {resource.featured_image && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <img
                src={resource.featured_image}
                alt={resource.title}
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
              />
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body1" component="div">
          <div dangerouslySetInnerHTML={{ __html: resource.content }} />
        </Typography>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Rate this Resource
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {ratingSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Your rating has been submitted!
            </Alert>
          )}
          
          {!user ? (
            <Alert severity="info">
              Please <Button onClick={() => navigate('/login')}>log in</Button> to rate this resource
            </Alert>
          ) : (
            <form onSubmit={handleRatingSubmit}>
              <Box sx={{ mb: 2 }}>
                <Typography component="legend">Your Rating</Typography>
                <Rating
                  name="user-rating"
                  value={userRating}
                  onChange={(event, newValue) => {
                    setUserRating(newValue);
                  }}
                  size="large"
                />
              </Box>
              
              <TextField
                label="Your Comment (Optional)"
                multiline
                rows={3}
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || userRating === 0}
              >
                {submitting ? <CircularProgress size={24} /> : 'Submit Rating'}
              </Button>
            </form>
          )}
        </Box>
        
        <Box>
          <Typography variant="h5" gutterBottom>
            User Ratings and Comments ({ratings.length})
          </Typography>
          
          {ratings.length === 0 ? (
            <Alert severity="info">
              No ratings yet. Be the first to rate this resource!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {ratings.map((rating) => (
                <Grid item xs={12} key={rating.id}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>
                      {rating.user_details.username[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          {rating.user_details.username}
                        </Typography>
                        <Rating value={rating.rating} readOnly size="small" />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(rating.created_at)}
                      </Typography>
                      {rating.comment && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {rating.comment}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Divider />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default ResourceDetail;