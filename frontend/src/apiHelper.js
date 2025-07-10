// apiHelper.js - Safe environment-aware version

// This will use the environment variable, or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Simple function to get the auth token
function getToken() {
  return localStorage.getItem('authToken');
}

// Export simple fetch functions
export default {
  // GET request with authentication
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
  
  // POST request with authentication
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