import React, { useState } from 'react';

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  
  try {
    // Use environment-aware API URL
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    
    // Send login request to correct endpoint
    const response = await fetch(`${API_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    // If login successful, save complete user data
    if (data.token) {
      const userData = {
        token: data.token,
        user_id: data.user_id,
        username: data.username,
        user_type: data.user_type,
      };
      
      localStorage.setItem('user', JSON.stringify(userData));  // Fixed storage key
      alert('Login successful!');
      window.location.href = '/';
    } else {
      setError('Login failed: ' + (data.error || data.detail || 'Unknown error'));
    }
  } catch (error) {
    setError('Login failed: Network error');
    console.error('Login error:', error);
  }
};

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h1>Login</h1>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ display: 'block', width: '100%', padding: '8px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ display: 'block', width: '100%', padding: '8px' }}
            />
          </label>
        </div>
        
        <button 
          type="submit" 
          style={{ 
            padding: '10px 15px', 
            background: '#4CAF50', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer' 
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;