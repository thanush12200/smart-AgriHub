# Deployment Guide

## 1. Containerized Deployment (Recommended for Local/VPS)

```bash
cd /Users/thanush/Downloads/FinalYearProject
docker compose up --build -d
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- ML Service: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017`

## 2. Frontend (Netlify)
This repo ships with a Netlify config:
- `netlify.toml` (at repo root) sets:
  - base: `frontend`
  - build: `npm ci && npm run build`
  - publish: `dist` (relative to base directory)
  - SPA redirect for React Router (`/* -> /index.html`)

### Netlify Deploy Steps
1. Push this repo to GitHub.
2. Netlify -> Add new site -> Import from Git.
3. Set environment variables (Site settings -> Environment variables):
   - `VITE_API_URL=https://<backend-domain>/api/v1`
   - `VITE_SOCKET_URL=https://<backend-domain>`
4. Deploy.

## 3. Backend (Render/Railway/AWS)
You need a backend host that supports long-running Node + WebSockets (Socket.IO). Render/Railway/Fly/AWS are good options.

### Required Backend Env Vars
- `MONGO_URI` (MongoDB Atlas recommended)
- `JWT_SECRET` (set a strong value)
- `ML_SERVICE_URL=https://<ml-domain>` (FastAPI ML service base URL)
- `WEATHER_API_KEY=...`
- `GEMINI_API_KEY=...`
- `CLIENT_URL=https://<your-netlify-site>.netlify.app` (for CORS + Socket.IO)

### Admin Bootstrapping (First Deploy Only)
To ensure admin login exists on a fresh DB:
- `AUTO_SEED_ADMIN=true`
- `ADMIN_EMAIL=admin@smartagrihub.com`
- `ADMIN_PASSWORD=<strong password>`

After the first successful deploy + admin login:
- set `AUTO_SEED_ADMIN=false`

## 4. ML Service (Render/AWS ECS)
1. Deploy `ml-service` Docker container.
2. Run command:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
3. Add model artifact volume or bake artifacts into image.

## 5. CI/CD Suggestions
- Lint + unit tests + security scans on pull requests.
- Build/version Docker images with semantic tags.
- Use blue/green rollout for backend and ML services.
