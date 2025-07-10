// apiHelper.js - Environment-aware version

// Use environment variable or fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

console.log('API Helper - Using:', API_URL);
console.log('Environment:', process.env.NODE_ENV);

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