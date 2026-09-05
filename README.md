# Weather App

This project is split into two apps:

- Frontend: React + Vite app
- Backend: Node.js + Express API

## Folder structure

- `frontend/` — weather UI and client-side logic
- `backend/` — API server that proxies requests to Open-Meteo and geocoding services

## Start backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend runs at:

- http://localhost:5000

## Start frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0
```

Frontend runs at:

- http://localhost:5174

## API endpoints

- `GET /health`
- `GET /api/weather?latitude=...&longitude=...`
- `GET /api/geocode?name=Delhi`
- `GET /api/reverse-geocode?lat=...&lon=...`

## Notes

- The frontend uses a Vite proxy for `/api` requests during development.
- The backend keeps third-party weather API calls off the browser.
