import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CircularProgress, 
  Box, 
  Alert, 
  Container,
  Typography,
  Button,
  Paper,
  Fade,
  Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VirtualAdoptionCertificate from '../components/VirtualAdoption/VirtualAdoptionCertificate';
import api from '../redux/api';

// Custom theme colors
const theme = {
  primary: '#8d6e63',       // Warm Brown
  secondary: '#81c784',     // Soft Green
  success: '#4caf50',       // Fresh Green
  grey: '#f3e5ab',          // Warm Cream
  accent: '#ff8a65',        // Gentle Orange
  background: '#fff8e1',    // Soft Cream
};

function VirtualAdoptionCertificatePage() {
  const { adoptionId } = useParams();
  const navigate = useNavigate();
  const [adoption, setAdoption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdoption();
  }, [adoptionId]);

  const fetchAdoption = async () => {
    try {
      const response = await api.get(`/virtual-adoptions/${adoptionId}/`);
      setAdoption(response.data);
    } catch (err) {
      setError('Failed to load adoption details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={80} 
            thickness={4}
            sx={{ 
              color: theme.primary,
              mb: 3
            }} 
          />
          <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 'bold', mb: 1 }}>
            Preparing Your Certificate
          </Typography>
          <Typography variant="body1" sx={{ color: theme.primary, opacity: 0.8 }}>
            Creating your personalized virtual adoption certificate...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !adoption) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Container maxWidth="sm">
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 3,
              backgroundColor: '#f44336',
              boxShadow: '0 8px 32px rgba(244, 67, 54, 0.4)',
            }}>
              <WorkspacePremiumIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography 
              variant="h4" 
              sx={{ 
                color: theme.primary,
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Certificate Not Found
            </Typography>
          </Box>

          <Fade in>
            <Paper sx={{
              p: 4,
              textAlign: 'center',
              background: `linear-gradient(135deg, white 0%, ${theme.grey}30 100%)`,
              borderRadius: 4,
              border: `1px solid ${theme.secondary}30`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)',
                  '& .MuiAlert-message': {
                    fontSize: '1.1rem'
                  }
                }}
              >
                {error || 'Virtual adoption certificate not found'}
              </Alert>
              
              <Typography variant="body1" sx={{ 
                color: theme.primary, 
                mb: 4,
                lineHeight: 1.6
              }}>
                We couldn't find the certificate you're looking for. This might happen if:
              </Typography>
              
              <Box sx={{ 
                textAlign: 'left', 
                mb: 4,
                pl: 2,
                borderLeft: `4px solid ${theme.secondary}`,
                backgroundColor: theme.background,
                p: 3,
                borderRadius: 2
              }}>
                <Typography variant="body2" sx={{ color: theme.primary, mb: 1 }}>
                  • The certificate link has expired
                </Typography>
                <Typography variant="body2" sx={{ color: theme.primary, mb: 1 }}>
                  • The virtual adoption was cancelled
                </Typography>
                <Typography variant="body2" sx={{ color: theme.primary, mb: 1 }}>
                  • You don't have permission to view this certificate
                </Typography>
                <Typography variant="body2" sx={{ color: theme.primary }}>
                  • There was a temporary server issue
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/virtual-adoptions/my')}
                  sx={{
                    borderColor: theme.primary,
                    color: theme.primary,
                    fontWeight: 'bold',
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: theme.primary,
                      backgroundColor: theme.grey,
                    }
                  }}
                >
                  Back to My Adoptions
                </Button>
                
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    fontWeight: 'bold',
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    boxShadow: '0 4px 15px rgba(141, 110, 99, 0.4)',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(141, 110, 99, 0.5)',
                    }
                  }}
                >
                  Try Again
                </Button>
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.background,
    }}>
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
        backdropFilter: 'blur(10px)',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${theme.accent}10 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, ${theme.secondary}10 0%, transparent 50%),
                       radial-gradient(circle at 40% 80%, ${theme.primary}10 0%, transparent 50%)`,
          zIndex: 0,
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ 
                    width: 60, 
                    height: 60, 
                    mr: 3,
                    backgroundColor: theme.accent,
                    boxShadow: '0 8px 32px rgba(255, 138, 101, 0.4)',
                  }}>
                    <WorkspacePremiumIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                      color: theme.primary,
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    Virtual Adoption Certificate
                  </Typography>
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: theme.primary,
                    opacity: 0.8,
                    maxWidth: 500,
                  }}
                >
                  Your official certificate for virtually adopting {adoption.animal_details.name || 'this animal'}
                </Typography>
              </Box>
              
              <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/virtual-adoptions/my')}
                sx={{
                  borderColor: theme.primary,
                  color: theme.primary,
                  fontWeight: 'bold',
                  borderRadius: 3,
                  px: 4,
                  py: 2,
                  borderWidth: 2,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  '&:hover': {
                    borderColor: theme.primary,
                    backgroundColor: theme.grey,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  }
                }}
              >
                Back to My Adoptions
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Certificate Component */}
      <Fade in timeout={1200}>
        <Box>
          <VirtualAdoptionCertificate adoption={adoption} />
        </Box>
      </Fade>
    </Box>
  );
}

export default VirtualAdoptionCertificatePage;