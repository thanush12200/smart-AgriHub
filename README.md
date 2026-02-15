# Smart Agri Hub

Production-ready full-stack web platform for farmers and agriculture startups.

## Tech Stack
- Frontend: React.js, Tailwind CSS, Axios, Recharts
- Backend: Node.js, Express.js, MongoDB, JWT auth, Swagger
- ML Service: FastAPI, scikit-learn, model inference APIs
- Real-time: Socket.IO weather alerts
- Deployment: Docker, Vercel/Netlify + Render/AWS

## Monorepo Structure
```
/Users/thanush/Downloads/FinalYearProject
├── frontend/        # React app
├── backend/         # Express API + MongoDB
├── ml-service/      # FastAPI ML microservice
├── docs/            # Architecture, API, security, roadmap
├── infra/           # Infra placeholders (IaC friendly)
└── docker-compose.yml
```

## Quick Start (Local)
1. Backend
```bash
cd /Users/thanush/Downloads/FinalYearProject/backend
cp .env.example .env
npm install
npm run dev
```

2. ML service
```bash
cd /Users/thanush/Downloads/FinalYearProject/ml-service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/train_models.py
uvicorn app.main:app --reload --port 8000
```

3. Frontend
```bash
cd /Users/thanush/Downloads/FinalYearProject/frontend
cp .env.example .env
npm install
npm run dev
```

4. Docker (optional)
```bash
cd /Users/thanush/Downloads/FinalYearProject
docker compose up --build
```

## Key Features Delivered
- JWT authentication with Farmer/Admin roles
- AI chatbot with confidence-based fallback rules
- Crop prediction with confidence + feature importance
- Fertilizer recommendation with dosage and organic alternatives
- Real-time weather + alert streaming
- Farmer analytics dashboard + downloadable PDF reports
- Admin panel for farmer/model/log management

## API Docs
- Swagger UI: `http://localhost:5000/api-docs`

## Docs
- `docs/SYSTEM_ARCHITECTURE.md`
- `docs/API_EXAMPLES.md`
- `docs/DEPLOYMENT.md`
- `docs/SECURITY_BEST_PRACTICES.md`
- `docs/ROADMAP.md`
