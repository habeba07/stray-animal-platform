import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../redux/slices/authSlice';
import { Box, Button, TextField, Typography, Container, Alert, CircularProgress } from '@mui/material';

function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Check if already authenticated on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('LoginPage useEffect - checking stored user:', !!storedUser);
    if (storedUser && storedUser.token) {
      console.log('Already authenticated, redirecting...');
      setIsAuthenticated && setIsAuthenticated(true);
      navigate('/', { replace: true });
    }
  }, [setIsAuthenticated, navigate]);

  // Handle login success
  useEffect(() => {
    if (isSuccess && user) {
      console.log('Login successful, user:', user);
      setIsAuthenticated && setIsAuthenticated(true);
      
      // Force a re-render by dispatching a custom event
      window.dispatchEvent(new Event('storage'));
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }

    // Reset auth state
    return () => {
      dispatch(reset());
    };
  }, [isSuccess, user, setIsAuthenticated, navigate, dispatch]);

  const handleLogin = async (event) => {
    event.preventDefault();
    console.log('Attempting login with:', { username, password: '***' });
    
    // Use Redux action for login
    dispatch(login({ username, password }));
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        
        {isError && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{message}</Alert>}
        
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;