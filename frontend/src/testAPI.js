// testAPI.js - Direct test
console.log('TEST FILE LOADED - NEW DEPLOYMENT WORKING!');
fetch('https://pawrescue-backend.onrender.com/api/animals/')
  .then(response => response.json())
  .then(data => console.log('Production API test:', data));