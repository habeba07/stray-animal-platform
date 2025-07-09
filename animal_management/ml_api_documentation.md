# ML System API Documentation

## Available Endpoints

### 1. Adoption Likelihood Prediction
- **URL**: `/adoptions/api/predict-adoption/`
- **Method**: POST
- **Body**: `{"animal_id": 123}`
- **Response**: 
```json
{
  "success": true,
  "prediction": {
    "adoption_likelihood": 0.752,
    "confidence": "high",
    "method": "advanced_ml_89.5"
  }
}
```

### 2. Collaborative Recommendations  
- **URL**: `/adoptions/api/collaborative-recommendations/`
- **Method**: GET
- **Params**: `?user_id=123`
- **Response**:
```json
{
  "success": true,
  "recommendations": [
    {
      "animal_type": "DOG",
      "score": 14.2,
      "reason": "Users similar to you adopted dogs"
    }
  ]
}
```

### 3. ML System Status
- **URL**: `/adoptions/api/ml-status/`
- **Method**: GET
- **Response**:
```json
{
  "status": "operational",
  "models_loaded": {
    "core_ml": true,
    "advanced_model": true,
    "collaborative": true
  },
  "ready_for_production": true
}
```

### 4. Behavioral Clustering
- **URL**: `/adoptions/api/behavioral-cluster/`
- **Method**: POST
- **Body**: `{"profile_id": 123}`
- **Response**:
```json
{
  "success": true,
  "cluster_info": {
    "cluster_id": 2,
    "recommendations": ["Best for active families", "Great with children"],
    "cluster_description": "Behavioral Cluster 2"
  }
}
```

## Usage Examples

### JavaScript Frontend Integration
```javascript
// Predict adoption likelihood
fetch('/adoptions/api/predict-adoption/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({animal_id: 123})
})
.then(response => response.json())
.then(data => console.log(data.prediction));

// Get collaborative recommendations
fetch('/adoptions/api/collaborative-recommendations/?user_id=456')
.then(response => response.json())
.then(data => console.log(data.recommendations));
```
