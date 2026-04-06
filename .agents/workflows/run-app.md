---
description: How to correctly run the full Smart Agri Hub application locally
---
To correctly "run the app", follow these precise commands. Use persistent background terminals or separate terminal windows. DO NOT use the `--open` flag for the frontend as it crashes the terminal session.

// turbo-all

1. Start the Machine Learning Service
Run this persistent command to activate the virtual environment and start the uvicorn server on port 8000:
`cd ml-service && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000`

2. Start the Node.js Backend
Run this persistent command to start the backend on port 5001:
`cd backend && npm run dev`

3. Start the React Frontend
Run this persistent command to start the frontend on port 5173. NEVER use `--open` or it will immediately crash the background process:
`cd frontend && npm run dev`
