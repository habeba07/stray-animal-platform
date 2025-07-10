// apiHelper.js - Debug version

// Debug: Let's see what environment variables are available
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  all_env: process.env
});

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

console.log('Using API_URL:', API_URL);

// Rest of your code stays the same...
function getToken() {
  return localStorage.getItem('authToken');
}

export default {
  async get(endpoint) {
    const token = getToken();
    const headers = token ? { 'Authorization': `Token ${token}` } : {};
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
    
    return response.json();
  },
  
  async post(endpoint, data) {
    const token = getToken();
    const headers = token ? { 'Authorization': `Token ${token}` } : {};
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
};