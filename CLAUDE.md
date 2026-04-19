# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EcoTraccer is a full-stack eco-tourism web application for discovering and booking sustainable trekking experiences in Uttarakhand, India. It has a React frontend and an Express/MongoDB backend as separate packages under `eco-app/`.

## Commands

### Frontend (`eco-app/Frontend/`)
```bash
npm start       # Dev server on http://localhost:3000
npm run build   # Production build
npm test        # Run tests
```

### Backend (`eco-app/server/`)
```bash
npm run dev     # Development with nodemon (port 5000)
npm start       # Production: node index.js
node seed.js    # Seed the MongoDB database
```

### Environment Setup
- **Frontend** `.env`: `REACT_APP_API_URL=http://localhost:5000`
- **Server** `.env`: `MONGODB_URI`, `OPENWEATHERMAP_API_KEY`, `JWT_SECRET`, `PORT=5000`
- Frontend `package.json` has `"proxy": "http://localhost:5000"` for dev

## Architecture

### Monorepo Layout
```
eco-app/
├── Frontend/   # React 18 SPA (Create React App)
└── server/     # Express 4 REST API (ES Modules)
```

### Frontend (`eco-app/Frontend/src/`)
- **`contexts/AuthContext.js`** — global auth state; wraps the entire app; exposes `user`, `login`, `signup`, `logout`
- **`services/api.js`** — Axios instance with a request interceptor that reads JWT from `localStorage` and injects `Authorization: Bearer <token>` on every request
- **`services/firebase.js`** — Firebase config (auth is also wired but JWT is the primary auth mechanism)
- **`App.js`** — React Router v6 routes; uses a `PublicRoute` wrapper for guest-only pages (Login, Register)
- **`pages/`** — one component per route; pages call `services/api.js` directly (no Redux/Zustand)
- **`styles/`** — one CSS file per page/component alongside Tailwind utility classes
- **`utils/helpers.js`** — shared utility functions

### Backend (`eco-app/server/`)
- **`index.js`** — Express app entry; mounts all routers under `/api/*`; ES Module syntax (`import`/`export`)
- **`middleware/auth.js`** — JWT verification; attaches decoded `user` to `req.user`; used on protected routes
- **`models/`** — Mongoose schemas: `User`, `Trek`, `Guide`
- **`routes/`** — one file per resource (`auth`, `treks`, `guides`, `weather`, `users`); guides and weather routes are JWT-protected

### Auth Flow
1. `POST /api/auth/login` → returns JWT
2. Frontend stores token in `localStorage`
3. Axios interceptor attaches token to all subsequent requests
4. Backend `auth` middleware verifies token before protected handlers run

### Key External APIs
- **OpenWeatherMap** — proxied through `GET /api/weather?lat=X&lon=Y` (requires `OPENWEATHERMAP_API_KEY`)
- **Mapbox** — used directly in the frontend via `mapbox-gl` and `react-map-gl` (key set in frontend env)

### Data Models (Mongoose)
- **Trek** — name, location, lat/lon, duration, difficulty (`easy|moderate|hard`), price, rating, isEcoFriendly, season
- **Guide** — name, specialties[], languages[], pricePerDay, certifications[], availability
- **User** — username, email, passwordHash, fullName, phone, location, bio
