# API Request/Response Examples

Base URL: `http://localhost:5000/api/v1`

## 1. Signup
POST `/auth/signup`

```json
{
  "name": "Ravi",
  "email": "ravi@farm.com",
  "password": "StrongPass1!",
  "region": "Karnataka",
  "language": "en"
}
```

Response:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "65ff...",
    "name": "Ravi",
    "email": "ravi@farm.com",
    "role": "farmer",
    "region": "Karnataka",
    "language": "en"
  }
}
```

## 2. Crop Prediction
POST `/crop/predict`
Headers: `Authorization: Bearer <jwt>`

```json
{
  "soilType": "black",
  "rainfall": 145,
  "temperature": 29,
  "region": "Karnataka"
}
```

Response:
```json
{
  "recommendations": [
    { "crop": "rice", "score": 0.73 },
    { "crop": "maize", "score": 0.17 },
    { "crop": "sugarcane", "score": 0.07 }
  ],
  "confidence": 0.73,
  "featureImportance": [
    { "feature": "num__rainfall", "importance": 0.32 }
  ],
  "modelVersion": "v1"
}
```

## 3. Fertilizer Recommendation
POST `/fertilizer/recommend`

```json
{
  "crop": "rice",
  "npk": { "n": 34, "p": 28, "k": 31 }
}
```

Response:
```json
{
  "fertilizer": "Urea",
  "dosageKgPerAcre": 42.4,
  "organicAlternatives": ["Composted farmyard manure", "Vermicompost tea"],
  "confidence": 0.81,
  "modelVersion": "v1"
}
```

## 4. Chatbot
POST `/chatbot/query`

```json
{
  "message": "My leaves are yellow with fungus",
  "context": ["Unseasonal rain last week"],
  "region": "Karnataka",
  "language": "en"
}
```

Response:
```json
{
  "answer": "Considering recent context: Unseasonal rain last week. Leaf spot often indicates fungal stress...",
  "confidence": 0.64,
  "source": "rules",
  "intent": "disease_help"
}
```

## 5. Weather + Alerts
GET `/weather/current?region=Karnataka`

Response:
```json
{
  "current": {
    "region": "Karnataka",
    "tempC": 30,
    "humidity": 63,
    "condition": "partly cloudy",
    "windKph": 11
  },
  "forecast": [
    {
      "date": "2026-02-16",
      "minTemp": 22,
      "maxTemp": 34,
      "humidity": 61,
      "rainMm": 2,
      "description": "light rain"
    }
  ],
  "alerts": []
}
```

## 6. Admin Model Upload
POST `/admin/models/upload` (multipart/form-data)
- `name`: crop_model
- `version`: v2
- `metadata`: {"note":"improved accuracy"}
- `modelFile`: binary
