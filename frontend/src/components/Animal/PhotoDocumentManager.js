import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  Chip,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PhotoCamera,
  AttachFile,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
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

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.post(`/animals/${animal.id}/upload_photo/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess('Photo uploaded successfully!');
        onUpdate(); // Refresh animal data
      }
    } catch (error) {
      setError('Failed to upload photo');
      console.error('Photo upload error:', error);
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
                  Animal Photos
                </Typography>
                
                {user?.user_type !== 'PUBLIC' && (
                  <Box sx={{ mb: 3 }}>
                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploading}
                      startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.secondary}, ${theme.success})`,
                        fontWeight: 'bold',
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        boxShadow: '0 4px 15px rgba(129, 199, 132, 0.4)',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.success}, ${theme.secondary})`,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(129, 199, 132, 0.5)',
                        },
                        '&:disabled': {
                          background: '#ccc',
                        }
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        hidden
                      />
                    </Button>
                  </Box>
                )}

                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: theme.background,
                  borderRadius: 3,
                  border: `1px solid ${theme.secondary}30`,
                  mb: 3
                }}>
                  <Typography variant="body1" sx={{ 
                    color: theme.primary, 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <ImageIcon sx={{ color: theme.accent }} />
                    Current photos: {animal.photos ? animal.photos.length : 0}
                  </Typography>
                </Paper>

                {/* Display existing photos */}
                {animal.photos && animal.photos.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ 
                      color: theme.primary, 
                      fontWeight: 'bold', 
                      mb: 2 
                    }}>
                      Photo Gallery
                    </Typography>
                    <Grid container spacing={2}>
                      {animal.photos.map((photo, index) => (
                        <Grid item xs={6} sm={4} key={index}>
                          <Zoom in timeout={300 + index * 100}>
                            <Paper sx={{
                              position: 'relative',
                              borderRadius: 3,
                              overflow: 'hidden',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                              border: `2px solid ${theme.secondary}30`,
                              '&:hover': {
                                transform: 'scale(1.05)',
                                transition: 'transform 0.3s ease',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                              }
                            }}>
                              <img
                                src={photo}
                                alt={`${animal.name} photo ${index + 1}`}
                                style={{ 
                                  width: '100%', 
                                  height: '120px', 
                                  objectFit: 'cover',
                                }}
                              />
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                p: 1,
                              }}>
                                <Typography variant="caption" sx={{ 
                                  color: 'white', 
                                  fontWeight: 'bold',
                                  fontSize: '0.7rem'
                                }}>
                                  Photo {index + 1}
                                </Typography>
                              </Box>
                            </Paper>
                          </Zoom>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {(!animal.photos || animal.photos.length === 0) && (
                  <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: theme.background,
                    borderRadius: 3,
                    border: `1px solid ${theme.secondary}30`,
                  }}>
                    <PhotoCamera sx={{ fontSize: 48, color: theme.primary, opacity: 0.5, mb: 1 }} />
                    <Typography sx={{ color: theme.primary, opacity: 0.7 }}>
                      No photos uploaded yet
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        {/* Document Upload Section */}
        <Grid item xs={12} md={6}>
          <Zoom in timeout={700}>
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
                background: `linear-gradient(90deg, ${theme.accent}, #ff7043)`,
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
                      <InputLabel sx={{ 
                        color: theme.primary,
                        fontWeight: 'bold',
                        '&.Mui-focused': { color: theme.primary }
                      }}>
                        Document Type
                      </InputLabel>
                      <Select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        label="Document Type"
                        sx={{
                          backgroundColor: 'white',
                          borderRadius: 3,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.secondary,
                            borderWidth: 2,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.primary,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.primary,
                            boxShadow: `0 0 0 3px ${theme.primary}20`,
                          },
                        }}
                      >
                        <MenuItem value="medical">Medical Record</MenuItem>
                        <MenuItem value="vaccination">Vaccination Certificate</MenuItem>
                        <MenuItem value="adoption">Adoption Document</MenuItem>
                        <MenuItem value="intake">Intake Form</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Document Description"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      multiline
                      rows={3}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          borderRadius: 3,
                          '& fieldset': {
                            borderColor: theme.secondary,
                            borderWidth: 2,
                          },
                          '&:hover fieldset': {
                            borderColor: theme.primary,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.primary,
                            boxShadow: `0 0 0 3px ${theme.primary}20`,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.primary,
                          fontWeight: 'bold',
                          '&.Mui-focused': { color: theme.primary }
                        }
                      }}
                      placeholder="Describe this document..."
                    />

                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploading || !documentDescription.trim()}
                      startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.accent}, #ff7043)`,
                        fontWeight: 'bold',
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        boxShadow: '0 4px 15px rgba(255, 138, 101, 0.4)',
                        '&:hover': {
                          background: `linear-gradient(135deg, #ff7043, ${theme.accent})`,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(255, 138, 101, 0.5)',
                        },
                        '&:disabled': {
                          background: '#ccc',
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

                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: theme.background,
                  borderRadius: 3,
                  border: `1px solid ${theme.secondary}30`,
                  mb: 3
                }}>
                  <Typography variant="body1" sx={{ 
                    color: theme.primary, 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <DescriptionIcon sx={{ color: theme.accent }} />
                    Current documents: {animal.documents ? animal.documents.length : 0}
                  </Typography>
                </Paper>

                {/* Display existing documents */}
                {animal.documents && animal.documents.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ 
                      color: theme.primary, 
                      fontWeight: 'bold', 
                      mb: 2 
                    }}>
                      Document Library
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                      {animal.documents.map((doc, index) => (
                        <Fade in timeout={300 + index * 100} key={index}>
                          <Paper sx={{ 
                            p: 2, 
                            mb: 2,
                            background: `linear-gradient(135deg, white 0%, ${theme.background}50 100%)`,
                            border: `1px solid ${theme.secondary}30`,
                            borderRadius: 3,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            '&:hover': {
                              transform: 'translateX(4px)',
                              transition: 'transform 0.2s ease',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                            }
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <DescriptionIcon sx={{ color: theme.accent, mt: 0.5 }} />
                              <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Chip
                                    label={doc.type.toUpperCase()}
                                    size="small"
                                    sx={{
                                      backgroundColor: theme.accent,
                                      color: 'white',
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 'bold',
                                    color: theme.primary,
                                    flexGrow: 1
                                  }}>
                                    {doc.filename}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ 
                                  color: theme.primary, 
                                  opacity: 0.8,
                                  fontStyle: 'italic'
                                }}>
                                  {doc.description}
                                </Typography>
                                {doc.uploaded_at && (
                                  <Typography variant="caption" sx={{ 
                                    color: theme.primary, 
                                    opacity: 0.6,
                                    display: 'block',
                                    mt: 0.5
                                  }}>
                                    Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Paper>
                        </Fade>
                      ))}
                    </Box>
                  </Box>
                )}

                {(!animal.documents || animal.documents.length === 0) && (
                  <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: theme.background,
                    borderRadius: 3,
                    border: `1px solid ${theme.secondary}30`,
                  }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: theme.primary, opacity: 0.5, mb: 1 }} />
                    <Typography sx={{ color: theme.primary, opacity: 0.7 }}>
                      No documents uploaded yet
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PhotoDocumentManager;