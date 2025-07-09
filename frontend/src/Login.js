import React, { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Send login request to get token
      const response = await fetch('http://localhost:8000/api-token-auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      // If login successful, save token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        alert('Login successful!');
        window.location.href = '/'; // Redirect to home page
      } else {
        setError('Login failed: ' + (data.detail || 'Unknown error'));
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