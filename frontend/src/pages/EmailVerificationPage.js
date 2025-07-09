import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Avatar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import api from '../redux/api';

const customTheme = {
  primary: '#8d6e63',
  secondary: '#81c784',
  success: '#4caf50',
  background: '#fff8e1',
  grey: '#f3e5ab',
};

function EmailVerificationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('No verification token provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.post('/users/verify_email/', {
          token: token
        });

        setSuccess(true);
        setError('');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Email verified successfully! You can now login.'
            }
          });
        }, 3000);

      } catch (err) {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Verification failed. Please try again or contact support.');
        }
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${customTheme.background} 0%, ${customTheme.grey} 100%)`,
      py: 8,
      px: 2,
    }}>
      <Container maxWidth="sm">
        <Box sx={{
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: 4,
          p: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          {loading && (
            <>
              <Avatar sx={{
                bgcolor: customTheme.primary,
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
              }}>
                <CircularProgress size={40} sx={{ color: 'white' }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: customTheme.primary, mb: 2 }}>
                Verifying Your Email
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Please wait while we verify your email address...
              </Typography>
            </>
          )}

          {success && !loading && (
            <>
              <Avatar sx={{
                bgcolor: customTheme.success,
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
              }}>
                <CheckCircleIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: customTheme.success, mb: 2 }}>
                Email Verified Successfully!
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Your email has been verified. You can now login to your account.
              </Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                Redirecting to login page in 3 seconds...
              </Alert>
              <Button
                variant="contained"
                component={Link}
                to="/login"
                sx={{
                  backgroundColor: customTheme.success,
                  '&:hover': { backgroundColor: '#45a049' }
                }}
              >
                Go to Login
              </Button>
            </>
          )}

          {error && !loading && (
            <>
              <Avatar sx={{
                bgcolor: '#f44336',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
              }}>
                <ErrorIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ color: '#f44336', mb: 2 }}>
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register"
                  sx={{
                    backgroundColor: customTheme.primary,
                    '&:hover': { backgroundColor: customTheme.primary + 'dd' }
                  }}
                >
                  Register Again
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/login"
                  sx={{
                    borderColor: customTheme.primary,
                    color: customTheme.primary,
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default EmailVerificationPage;