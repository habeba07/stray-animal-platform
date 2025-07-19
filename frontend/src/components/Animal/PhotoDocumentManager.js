import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Fade,
  Zoom,
  IconButton,
  CardMedia,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  PhotoCamera,
  AttachFile,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import api from '../../redux/api';

// Custom theme colors
const theme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

const PhotoDocumentManager = ({ animal, onUpdate }) => {
  const { user } = useSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentType, setDocumentType] = useState('medical');
  const [documentDescription, setDocumentDescription] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Enhanced photo upload with multiple files and validation
  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // Check if adding these photos would exceed the limit
    const currentPhotoCount = animal.photos ? animal.photos.length : 0;
    const totalPhotos = currentPhotoCount + files.length;

    if (totalPhotos > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    // Validate each file
    for (let file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Invalid file type, only images allowed');
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large, maximum 10MB allowed');
        return;
      }
    }

    setUploading(true);
    setError('');

    try {
      // Upload each file individually
      for (let file of files) {
        const formData = new FormData();
        formData.append('photo', file);

        await api.post(`/animals/${animal.id}/upload_photo/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(`${files.length} photo(s) uploaded successfully!`);
      onUpdate(); // Refresh animal data
    } catch (error) {
      setError('Failed to upload photos');
      console.error('Photo upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoDelete = async (photoIndex) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      setUploading(true);
      await api.delete(`/animals/${animal.id}/photos/${photoIndex}/`);
      setSuccess('Photo deleted successfully!');
      onUpdate(); // Refresh animal data
    } catch (error) {
      setError('Failed to delete photo');
      console.error('Photo delete error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!documentDescription.trim()) {
      setError('Please provide a description for the document');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', documentType);
    formData.append('description', documentDescription);

    try {
      const response = await api.post(`/animals/${animal.id}/upload_document/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess('Document uploaded successfully!');
        setDocumentDescription('');
        onUpdate(); // Refresh animal data
      }
    } catch (error) {
      setError('Failed to upload document');
      console.error('Document upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentDelete = async (documentIndex) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setUploading(true);
      await api.delete(`/animals/${animal.id}/documents/${documentIndex}/`);
      setSuccess('Document deleted successfully!');
      onUpdate(); // Refresh animal data
    } catch (error) {
      setError('Failed to delete document');
      console.error('Document delete error:', error);
    } finally {
      setUploading(false);
    }
  };

  const openGallery = (index) => {
    setSelectedPhotoIndex(index);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
  };

  const navigatePhoto = (direction) => {
    const photoCount = animal.photos ? animal.photos.length : 0;
    if (direction === 'next') {
      setSelectedPhotoIndex((prev) => (prev + 1) % photoCount);
    } else {
      setSelectedPhotoIndex((prev) => (prev - 1 + photoCount) % photoCount);
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4,
        textAlign: 'center',
        p: 3,
        background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 100%)`,
        borderRadius: 3,
        border: `1px solid ${theme.secondary}30`,
      }}>
        <Typography variant="h4" sx={{ 
          color: theme.primary, 
          fontWeight: 'bold',
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}>
          <ImageIcon sx={{ fontSize: 32, color: theme.accent }} />
          Photos & Documents
          <DescriptionIcon sx={{ fontSize: 32, color: theme.secondary }} />
        </Typography>
        <Typography variant="body1" sx={{ color: theme.primary, opacity: 0.8 }}>
          {user?.user_type === 'PUBLIC' 
            ? 'View photos and documents for this animal'
            : 'Manage photos and documents for this animal'
          }
        </Typography>
      </Box>

      {/* Success/Error Messages */}
      {error && (
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)',
              border: `1px solid ${theme.accent}30`,
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Fade>
      )}
      
      {success && (
        <Fade in>
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)',
              border: `1px solid ${theme.success}30`,
            }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        </Fade>
      )}

      <Grid container spacing={4}>
        {/* Photo Upload Section */}
        <Grid item xs={12} md={6}>
          <Zoom in timeout={500}>
            <Card sx={{
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.secondary}30`,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.secondary}, ${theme.accent})`,
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: 4, pt: 5 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3,
                  color: theme.primary,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <PhotoCamera sx={{ color: theme.secondary, fontSize: 28 }} />
                  Animal Photos ({animal.photos ? animal.photos.length : 0}/5)
                </Typography>
                
                {user?.user_type !== 'PUBLIC' && (
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploading || (animal.photos && animal.photos.length >= 5)}
                      startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      sx={{
                        background: (animal.photos && animal.photos.length >= 5) 
                          ? '#ccc' 
                          : `linear-gradient(135deg, ${theme.secondary}, ${theme.accent})`,
                        color: 'white',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        '&:hover': {
                          background: (animal.photos && animal.photos.length >= 5) 
                            ? '#ccc' 
                            : `linear-gradient(135deg, ${theme.secondary}dd, ${theme.accent}dd)`,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                        },
                        '&:disabled': {
                          background: '#ccc',
                          color: 'white',
                        }
                      }}
                    >
                      {uploading ? 'Uploading...' : (animal.photos && animal.photos.length >= 5) ? 'Photo Limit Reached' : 'Upload Photos'}
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </Button>
                    <Typography variant="caption" sx={{ 
                      display: 'block', 
                      mt: 1, 
                      color: theme.primary, 
                      opacity: 0.7 
                    }}>
                      Multiple selection allowed.
                    </Typography>
                  </Box>
                )}

                {/* Enhanced Gallery View */}
                {animal.photos && animal.photos.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      color: theme.primary, 
                      fontWeight: 'bold' 
                    }}>
                      Photo Gallery
                    </Typography>
                    <ImageList variant="masonry" cols={2} gap={8}>
                      {animal.photos.map((photo, index) => (
                        <ImageListItem key={index}>
                          <CardMedia
                            component="img"
                            image={photo}
                            alt={`${animal.name || 'Animal'} photo ${index + 1}`}
                            sx={{
                              borderRadius: 2,
                              cursor: 'pointer',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              }
                            }}
                            onClick={() => openGallery(index)}
                          />
                          <ImageListItemBar
                            title={`Photo ${index + 1}`}
                            actionIcon={
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  sx={{ color: 'white' }}
                                  onClick={() => openGallery(index)}
                                >
                                  <FullscreenIcon />
                                </IconButton>
                                {user?.user_type !== 'PUBLIC' && (
                                  <IconButton
                                    sx={{ color: 'white' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePhotoDelete(index);
                                    }}
                                    disabled={uploading}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}
                              </Box>
                            }
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}

                {(!animal.photos || animal.photos.length === 0) && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    border: `2px dashed ${theme.secondary}30`,
                    borderRadius: 3,
                    backgroundColor: theme.background 
                  }}>
                    <ImageIcon sx={{ fontSize: 60, color: theme.primary, opacity: 0.3, mb: 2 }} />
                    <Typography variant="body1" sx={{ color: theme.primary, opacity: 0.7 }}>
                      No photos uploaded yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Document Upload Section */}
        <Grid item xs={12} md={6}>
          <Zoom in timeout={600}>
            <Card sx={{
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.secondary}30`,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${theme.accent}, ${theme.secondary})`,
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: 4, pt: 5 }}>
                <Typography variant="h5" sx={{ 
                  mb: 3,
                  color: theme.primary,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AttachFile sx={{ color: theme.accent, fontSize: 28 }} />
                  Documents
                </Typography>
                
                {user?.user_type !== 'PUBLIC' && (
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Document Type</InputLabel>
                      <Select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        sx={{ borderRadius: 3 }}
                      >
                        <MenuItem value="medical">Medical Record</MenuItem>
                        <MenuItem value="vaccination">Vaccination Record</MenuItem>
                        <MenuItem value="adoption">Adoption Papers</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Document Description"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      sx={{ mb: 2 }}
                      multiline
                      rows={2}
                    />
                    
                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploading || !documentDescription.trim()}
                      startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
                        color: 'white',
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.accent}dd, ${theme.secondary}dd)`,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                        },
                        '&:disabled': {
                          background: '#ccc',
                          color: 'white',
                        }
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Document'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleDocumentUpload}
                        hidden
                      />
                    </Button>
                  </Box>
                )}

                {/* Document List - UPDATED SECTION */}
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: theme.background,
                  borderRadius: 3,
                  border: `1px solid ${theme.secondary}30`,
                }}>
                  <Typography variant="body1" sx={{ 
                    color: theme.primary, 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}>
                    <DescriptionIcon sx={{ color: theme.accent }} />
                    Documents: {animal.documents ? animal.documents.length : 0}
                  </Typography>
                  
                  {animal.documents && animal.documents.length > 0 ? (
                    <Box sx={{ mt: 2 }}>
                      {animal.documents.map((doc, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2,
                          p: 2,
                          border: `1px solid ${theme.secondary}30`,
                          borderRadius: 2,
                          backgroundColor: 'white',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }
                        }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.primary }}>
                              {doc.type}: {doc.description}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.primary, opacity: 0.7 }}>
                              {doc.filename}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => window.open(`http://localhost:8000${doc.url}`, '_blank')}
                              sx={{ 
                                color: theme.secondary,
                                '&:hover': {
                                  backgroundColor: `${theme.secondary}20`,
                                }
                              }}
                              title="Download Document"
                            >
                              <DownloadIcon />
                            </IconButton>
                            {user?.user_type !== 'PUBLIC' && (
                              <IconButton
                                size="small"
                                onClick={() => handleDocumentDelete(index)}
                                sx={{ 
                                  color: theme.accent,
                                  '&:hover': {
                                    backgroundColor: `${theme.accent}20`,
                                  }
                                }}
                                disabled={uploading}
                                title="Delete Document"
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      border: `2px dashed ${theme.secondary}30`,
                      borderRadius: 3,
                      backgroundColor: theme.background 
                    }}>
                      <DescriptionIcon sx={{ fontSize: 60, color: theme.primary, opacity: 0.3, mb: 2 }} />
                      <Typography variant="body2" sx={{ 
                        color: theme.primary, 
                        opacity: 0.7 
                      }}>
                        No documents uploaded yet
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Full Screen Gallery Dialog */}
      <Dialog
        open={galleryOpen}
        onClose={closeGallery}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'white'
        }}>
          <Typography variant="h6">
            Photo {selectedPhotoIndex + 1} of {animal.photos ? animal.photos.length : 0}
          </Typography>
          <IconButton onClick={closeGallery} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          {animal.photos && animal.photos[selectedPhotoIndex] && (
            <img
              src={animal.photos[selectedPhotoIndex]}
              alt={`${animal.name || 'Animal'} photo ${selectedPhotoIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => navigatePhoto('prev')}
            disabled={!animal.photos || animal.photos.length <= 1}
            sx={{ color: 'white', borderColor: 'white' }}
            variant="outlined"
          >
            Previous
          </Button>
          <Button 
            onClick={() => navigatePhoto('next')}
            disabled={!animal.photos || animal.photos.length <= 1}
            sx={{ color: 'white', borderColor: 'white' }}
            variant="outlined"
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhotoDocumentManager;