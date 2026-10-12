# Travel Planner — Frontend

React 19 and Vite frontend for Travel Planner. This repository is deployed separately from the Spring Boot API.

## Run locally

Requirements: Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to the backend API URL, including `/api` (for example, `https://your-api.example/api`). The Docker image reads `API_BASE_URL` at runtime and expects the same `/api` suffix. Keep the backend CORS allowlist aligned with this frontend's deployed origin.

## Build and deploy

```sh
npm run build
```

The included Dockerfile serves the production build with Nginx. For Railway, connect this repository and use its root as the service build context. Set `API_BASE_URL` to the deployed backend URL ending in `/api`, then generate a public domain for the frontend service.

## Scope

This repository contains only the browser application and its static assets. API implementation, database schema, and server configuration live in [TravelPlanner-backend](https://github.com/ishithaabburi2006/TravelPlanner-backend).
