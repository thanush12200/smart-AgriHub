# Smart Agri Hub - System Architecture

## 1. High-Level Architecture

```text
[React Frontend]
   |  HTTPS + JWT + WebSocket
   v
[Express API Gateway]
   |-- MongoDB (users, logs, model registry)
   |-- FastAPI ML Service (inference)
   |-- Weather Provider APIs
   |-- Socket.IO Alert Stream
```

## 2. Component Breakdown

1. Frontend (React + Tailwind)
- Farmer workflow: auth, dashboard, crop/fertilizer predictions, chatbot.
- Admin workflow: farmer management, logs, model upload metadata.
- Real-time alert listener via Socket.IO.

2. Backend (Express + MongoDB)
- Auth module: JWT issue/verify, role-based authorization.
- Domain APIs: crop prediction, fertilizer recommendation, weather, dashboard analytics.
- Admin APIs: monitor farmers, prediction/chat logs, model registry.
- Swagger docs at `/api-docs`.

3. ML Microservice (FastAPI + scikit-learn)
- Crop model (RandomForest + one-hot features).
- Fertilizer model (RandomForest + NPK/crop inputs).
- NLP intent model (TF-IDF + Logistic Regression).
- Rule fallback for low-confidence chatbot responses.

4. Data Layer (MongoDB)
- `User`, `PredictionLog`, `ChatLog`, `ModelRegistry` collections.

## 3. Scalability Design
- Stateless frontend/backend/ML containers.
- Independent horizontal scaling per service.
- API gateway pattern allows routing to future ML versions.
- Model registry supports staged rollout.

## 4. Error Handling and Observability
- Centralized Express error middleware.
- Request logs via Morgan + Winston.
- Structured failure responses with HTTP codes.
- Health endpoints: backend `/health`, ML `/health`.

## 5. Security Boundaries
- JWT authentication for every protected route.
- RBAC with strict admin routes.
- Rate limiting + Helmet + CORS.
- Password hashing with bcrypt.
