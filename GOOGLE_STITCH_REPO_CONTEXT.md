# Smart Agri Hub Repo Context for Google Stitch

## Purpose
Use this document as a high-signal product and codebase brief for designing a new 3D interactive website on top of the existing Smart Agri Hub repo.

The goal is to redesign the frontend visually, possibly with immersive 3D/interactive storytelling, without breaking:

- existing routes
- auth flows
- backend API contracts
- admin workflows
- ML-assisted prediction flows
- marketplace cart and checkout behavior

This repo is not a brochure site. It is a working full-stack agritech product with authenticated dashboards, AI prediction tools, an e-commerce marketplace, and an admin control panel.

---

## Product Summary

Smart Agri Hub is a multi-module agritech platform for farmers and admins.

Core product areas:

- farmer dashboard and analytics
- crop prediction
- fertilizer recommendation
- weather insights
- AI chatbot
- marketplace with cart and order placement
- government scheme discovery
- profile and prediction history
- journal and crop calendar
- admin operations panel
- system evaluation page

Primary user roles:

- `farmer`
- `admin`

The frontend is already functional. Any redesign should preserve product behavior and backend integration.

---

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- socket.io-client

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT auth
- Socket.IO
- Swagger

### ML Service

- FastAPI
- joblib-based model loading
- crop prediction
- fertilizer recommendation support
- chatbot support
- plant detection / plant vision support

---

## Top-Level Repo Structure

```text
FinalYearProject/
  frontend/        React + Vite app
  backend/         Express API + MongoDB models/controllers/routes
  ml-service/      FastAPI ML microservice
  docs/            project docs
  .agents/         local workflow/agent metadata
```

---

## Frontend Structure

### Frontend Root

```text
frontend/
  public/
  src/
    api/
    components/
      admin/
      marketplace/
    context/
    hooks/
    pages/
    utils/
    App.jsx
    main.jsx
    index.css
  tailwind.config.js
  package.json
```

### Important Frontend Files

- `frontend/src/App.jsx`
  Defines all routes and the shared app shell.
- `frontend/src/api/axiosClient.js`
  Axios client using `VITE_API_URL` or `http://localhost:5001/api/v1`.
- `frontend/src/context/AuthContext.jsx`
  Stores token and user in localStorage, validates token on mount with `/auth/me`.
- `frontend/src/context/CartContext.jsx`
  LocalStorage-backed marketplace cart.
- `frontend/src/components/Navbar.jsx`
  Shared navigation shell.
- `frontend/src/index.css`
  Global design system, tokens, utility classes, page shell styles.

### Frontend Pages

- `DashboardPage.jsx`
- `LoginPage.jsx`
- `SignupPage.jsx`
- `CropPredictionPage.jsx`
- `FertilizerPage.jsx`
- `ChatbotPage.jsx`
- `MarketplacePage.jsx`
- `GovernmentSchemesPage.jsx`
- `WeatherPredictionPage.jsx`
- `ProfilePage.jsx`
- `OrdersPage.jsx`
- `PredictionHistoryPage.jsx`
- `JournalPage.jsx`
- `CropCalendarPage.jsx`
- `AdminPage.jsx`
- `SystemEvalPage.jsx`
- `NotFoundPage.jsx`

### Recently Modularized UI Areas

#### Admin Components

```text
frontend/src/components/admin/
  AdminShared.jsx
  AdminOverviewTab.jsx
  AdminFarmersTab.jsx
  AdminMarketplaceTab.jsx
  AdminModelsTab.jsx
  AdminLogsTab.jsx
  AdminSettingsTab.jsx
  FarmerDetailModal.jsx
```

#### Marketplace Components

```text
frontend/src/components/marketplace/
  MarketplaceHero.jsx
  ProductGrid.jsx
  CartSection.jsx
  CheckoutSection.jsx
  OrderConfirmation.jsx
  MarketplaceFloatingActions.jsx
```

---

## Frontend Route Map

| Route | Page | Access | Purpose |
|---|---|---|---|
| `/` | Dashboard | Protected | Main farmer command center |
| `/login` | Login | Public | Auth entry |
| `/signup` | Signup | Public | New account creation |
| `/crop-prediction` | Crop Prediction | Protected | Predict best crops from farm inputs |
| `/fertilizer` | Fertilizer | Protected | Recommend fertilizer and dosage |
| `/chatbot` | Chatbot | Protected | Conversational agronomy assistant |
| `/marketplace` | Marketplace | Protected | Browse products, add to cart, checkout |
| `/govt-schemes` | Government Schemes | Protected | Search/filter schemes |
| `/weather-prediction` | Weather Prediction | Protected | Weather data and forecast views |
| `/profile` | Profile | Protected | View and update user profile |
| `/orders` | Orders | Protected | View user's orders |
| `/prediction-history` | Prediction History | Protected | View previous AI predictions |
| `/journal` | Journal | Protected | Farm journal CRUD |
| `/crop-calendar` | Crop Calendar | Protected | Seasonal planning calendar |
| `/admin` | Admin Control Panel | Protected, admin only | Platform operations |
| `/system-eval` | System Evaluation | Protected | Model/system evaluation view |

### Route Guard Rules

- Most pages are wrapped in `ProtectedRoute`.
- `/admin` is protected with `roles={['admin']}`.
- `AuthContext` stores `token` and `user` in localStorage.
- `AuthContext` validates token on mount using `GET /auth/me`.

Do not redesign auth in a way that changes this behavior unless the code is updated accordingly.

---

## Current UX Information Architecture

### Dashboard

Acts like a farmer command center:

- summary metrics
- crop/fertilizer/chat counts
- recent crop prediction trend
- weather pattern/alerts
- soil health indicators
- downloadable report PDF

### Prediction Tools

- crop prediction is form-driven and may include image-assisted plant detection
- fertilizer page is structured around soil/NPK and crop recommendation flows
- chatbot is an AI assistant with confidence/source metadata

### Marketplace

- searchable and filterable product catalog
- localStorage cart
- quantity management
- checkout form
- order confirmation
- order history page

### Admin

Admin is a multi-tab operations panel:

- overview
- farmers
- marketplace inventory
- ML model registry
- prediction and chat logs
- announcements and audit log

This is not a mock admin. It has working CRUD and status actions.

---

## Backend Structure

### Backend Root

```text
backend/src/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  data/
  scripts/
```

### Core Backend Layers

- `routes/`
  Express route definitions.
- `controllers/`
  Main request handlers and response shapes.
- `models/`
  MongoDB/Mongoose domain models.
- `services/`
  Weather, ML client, reports, seeding, sockets, Gemini, etc.
- `middleware/`
  auth, role checks, error handling.

---

## Backend API Surface

Base API prefix:

- `/api/v1`

Health endpoints:

- `/health`
- `/api/v1/health`

### Auth Routes

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/profile`
- `PATCH /api/v1/auth/password`

Typical auth response:

```json
{
  "token": "jwt",
  "user": {
    "_id": "...",
    "name": "User Name",
    "email": "user@example.com",
    "role": "farmer"
  }
}
```

### Dashboard Routes

- `GET /api/v1/dashboard/analytics`
- `GET /api/v1/dashboard/report/pdf`

Dashboard analytics shape:

```json
{
  "summary": {
    "cropPredictions": 0,
    "fertilizerRecommendations": 0,
    "chatQueries": 0
  },
  "cropYieldTrend": [],
  "weatherPattern": [],
  "soilHealth": [],
  "alerts": []
}
```

### Crop Routes

- `POST /api/v1/crop/predict`
- `POST /api/v1/crop/detect-plant`

### Fertilizer Routes

- `POST /api/v1/fertilizer/recommend`

### Chatbot Routes

- `POST /api/v1/chatbot/query`

### Weather Routes

- `GET /api/v1/weather/current`

### Marketplace Routes

- `GET /api/v1/products`
- `GET /api/v1/products/:productCode`

Product list response shape:

```json
{
  "products": [
    {
      "id": "P123",
      "productCode": "P123",
      "name": "Premium Seeds",
      "category": "Seeds",
      "brand": "Brand",
      "price": 1500,
      "unit": "10 kg",
      "stock": 5,
      "rating": 4.5,
      "description": "Text",
      "image": "https://...",
      "isActive": true
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 24,
    "totalPages": 1
  },
  "categories": ["Seeds", "Tools"]
}
```

### Order Routes

- `POST /api/v1/orders`
- `GET /api/v1/orders/my`

### Prediction History Routes

- `GET /api/v1/predictions/history`

### Journal Routes

- `GET /api/v1/journal`
- `POST /api/v1/journal`
- `PATCH /api/v1/journal/:id`
- `DELETE /api/v1/journal/:id`

### Government Scheme Routes

- `GET /api/v1/schemes`
- `GET /api/v1/schemes/:schemeCode`

Scheme list response shape:

```json
{
  "schemes": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "filters": {
    "search": "",
    "category": "all",
    "state": "all",
    "mode": "all"
  },
  "categories": []
}
```

### Public Announcement Route

- `GET /api/v1/announcements`

### Admin Routes

- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/farmers`
- `GET /api/v1/admin/farmers/:farmerId`
- `PATCH /api/v1/admin/farmers/:farmerId/status`
- `GET /api/v1/admin/predictions`
- `GET /api/v1/admin/predictions/analytics`
- `GET /api/v1/admin/chat-logs`
- `GET /api/v1/admin/models`
- `POST /api/v1/admin/models/upload`
- `PATCH /api/v1/admin/models/:modelId/status`
- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `PATCH /api/v1/admin/products/:productCode`
- `DELETE /api/v1/admin/products/:productCode`
- `GET /api/v1/admin/announcements`
- `POST /api/v1/admin/announcements`
- `DELETE /api/v1/admin/announcements/:announcementId`
- `GET /api/v1/admin/audit-log`

Admin stats response shape:

```json
{
  "farmers": {
    "total": 104,
    "active": 100,
    "blocked": 4,
    "newThisWeek": 8
  },
  "products": {
    "total": 45,
    "active": 45,
    "lowStock": 3
  },
  "predictions": {
    "total": 1205,
    "byType": [],
    "thisWeek": 154
  },
  "chats": {
    "total": 430,
    "thisWeek": 12
  },
  "models": {
    "total": 6
  }
}
```

Admin list/detail patterns:

```json
{
  "farmers": []
}
```

```json
{
  "farmer": {},
  "predCount": 10,
  "chatCount": 5
}
```

```json
{
  "logs": []
}
```

```json
{
  "models": []
}
```

```json
{
  "announcements": []
}
```

---

## Core Domain Models

Main backend models:

- `User`
- `Product`
- `Order`
- `PredictionLog`
- `ChatLog`
- `FarmJournal`
- `GovernmentScheme`
- `Announcement`
- `AuditLog`
- `ModelRegistry`

### Important Conceptual Entities

#### User

- name
- email
- password
- role
- region
- language
- isActive

#### Product

- productCode
- name
- category
- brand
- price
- unit
- stock
- rating
- description
- image
- isActive

#### Prediction Log

- type
- confidence
- input
- output
- user
- createdAt

#### Chat Log

- user
- message
- response
- source
- confidence
- createdAt

#### Model Registry

- name
- version
- status
- metadata
- fileUrl
- uploadedBy

---

## ML Service Structure

```text
ml-service/
  app/
    main.py
    model_loader.py
    plant_features.py
    schemas.py
    training.py
  models/
    crop_model.joblib
    fertilizer_model.joblib
    intent_model.joblib
    metadata.joblib
    plant_vision_model.joblib
  scripts/
    train_models.py
```

### ML Service Role

The ML service is a dedicated microservice that powers:

- crop recommendations
- fertilizer-related logic
- chatbot intent support
- plant detection / plant health assistance

It is not purely decorative AI. It produces real data the product consumes.

---

## Existing State and Integration Constraints

These are important if you want Stitch to propose a new website without breaking the working app.

### Do Not Break

- existing route paths
- auth token persistence in localStorage
- `axiosClient` usage
- `VITE_API_URL`
- admin-only route protection
- cart behavior in `CartContext`
- backend response shapes
- checkout flow
- prediction history and logs
- admin CRUD flows

### Current Shared State

#### AuthContext

- stores `token`
- stores `user`
- validates auth on mount with `/auth/me`
- exposes `login`, `signup`, `updateUser`, `logout`

#### CartContext

- localStorage key: `smart_agri_cart_v1`
- stores cart items locally
- computes `itemCount`
- computes `totalAmount`

### HTTP Client Behavior

`frontend/src/api/axiosClient.js`

- adds `Authorization: Bearer <token>` automatically
- clears local auth storage on `401`

---

## Design Direction for a 3D Interactive Website

If Google Stitch is generating a new experience, it should treat this as a premium, operational agritech platform, not a gaming site and not a generic AI landing page.

### Recommended Visual Direction

- premium agritech brand
- deep forest greens, slate neutrals, terracotta accents
- clean white and soft mineral surfaces
- subtle glass panels where appropriate
- large-radius cards
- atmospheric gradients and field-inspired depth
- motion that feels intentional and useful

### Recommended 3D / Spatial Ideas

- floating terrain or crop-field diorama for the dashboard hero
- animated weather layer for forecast pages
- product pedestals or rotational product cards for marketplace hero moments
- network/node visualization for AI model registry and admin analytics
- seasonal crop calendar as a 3D time-band or circular cycle
- interactive soil layers or nutrient rings for fertilizer/crop prediction pages

### Use 3D Sparingly

3D should enhance:

- navigation
- explanation
- trust
- storytelling
- data comprehension

3D should not block:

- forms
- tables
- mobile responsiveness
- readability
- checkout
- admin actions

---

## Page-by-Page Redesign Notes for Stitch

### Dashboard

Should feel like a mission-control surface for a farmer.

Include:

- summary KPIs
- weather intelligence
- crop trend visualization
- alerts
- soil health blocks

3D suggestion:

- soft animated topographic or farm-grid scene behind the hero

### Crop Prediction

Should feel like a smart agronomy lab.

Include:

- structured input form
- strong result reveal
- plant image assist state if applicable

3D suggestion:

- layered soil, moisture, and crop suitability visualization

### Fertilizer

Should feel diagnostic and precise.

3D suggestion:

- nutrient rings or molecular-style nutrient nodes

### Chatbot

Should feel reliable and conversational, not gimmicky.

3D suggestion:

- subtle knowledge-orbit or assistant pulse, not a cartoon robot

### Marketplace

Should feel commerce-ready.

Must preserve:

- product filtering
- add to cart
- cart management
- checkout
- order confirmation

3D suggestion:

- premium product stage, floating category objects, subtle depth on cards

### Government Schemes

Should feel official, searchable, and trusted.

3D suggestion:

- map-like or layered administrative discovery patterns

### Admin

Should feel like a high-trust operations center.

Must preserve:

- overview stats
- farmer management
- marketplace inventory
- model registry
- logs
- announcements
- audit log

3D suggestion:

- restrained data-space visuals in hero/header only

---

## Prompt Constraints for Google Stitch

Use these as non-negotiable instructions:

1. Keep all existing routes functional.
2. Do not replace working features with placeholders.
3. Do not invent fake APIs.
4. Preserve auth, admin gating, cart, checkout, and backend response shapes.
5. Prioritize real product UI over landing-page-only visuals.
6. Make the site feel like a premium agritech operating system.
7. Keep mobile and desktop both usable.
8. Treat 3D as enhancement, not obstruction.

---

## Ready-to-Paste Stitch Brief

```text
You are redesigning an existing production-style agritech platform called Smart Agri Hub.

This is a real full-stack product, not a landing page. The repo already has working frontend routes, authentication, admin tools, AI prediction flows, a marketplace with cart and checkout, a journal, a crop calendar, and backend APIs.

Your task is to design a stunning 3D interactive website and UI system for this product without breaking the existing information architecture or workflows.

Key rules:
- Preserve all route paths and product modules.
- Do not remove forms, tables, admin controls, cart behavior, checkout, or logs.
- Do not invent fake data-only features that replace real functionality.
- Keep the product feeling premium, trustworthy, modern, and operational.
- Use 3D and interaction as enhancement, not as obstruction.

Product modules:
- farmer dashboard
- crop prediction
- fertilizer recommendation
- chatbot
- marketplace
- government schemes
- weather prediction
- profile
- orders
- prediction history
- journal
- crop calendar
- admin control panel
- system evaluation

Design direction:
- premium agritech
- deep forest green, slate, terracotta
- clean white/mineral surfaces
- subtle glassmorphism
- large-radius panels
- refined motion
- immersive but usable 3D scenes

Important technical constraints:
- React + Vite + Tailwind frontend
- Express + MongoDB backend
- FastAPI ML service
- JWT auth
- protected routes
- admin-only route at /admin
- cart stored in localStorage
- axios client with bearer token injection
- backend APIs already exist and must be preserved

The experience should feel like a “3D agritech operating system” rather than a generic dashboard template.
```

---

## Suggested File for Designers to Read First

If someone wants to inspect the implementation after reading this brief, start here:

- `frontend/src/App.jsx`
- `frontend/src/index.css`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/pages/MarketplacePage.jsx`
- `frontend/src/pages/AdminPage.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/CartContext.jsx`
- `frontend/src/api/axiosClient.js`
- `backend/src/app.js`
- `backend/src/routes/`
- `backend/src/controllers/`
- `ml-service/app/main.py`

---

## Final Note

This repo already contains working business logic. The redesign should sit on top of the current architecture and elevate it into a premium, interactive, spatial agritech experience without reducing functional depth.
