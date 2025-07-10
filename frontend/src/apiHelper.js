// apiHelper.js - Force production URL

// Hardcode production URL for now
const API_URL = 'https://pawrescue-backend.onrender.com/api';

console.log('FORCED PRODUCTION URL - Using:', API_URL);

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