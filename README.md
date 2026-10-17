# livecity-server

[![CI — Build & Test](https://github.com/invercity/livecity-server/actions/workflows/ci.yml/badge.svg)](https://github.com/invercity/livecity-server/actions/workflows/ci.yml)
[![Dependency Audit](https://github.com/invercity/livecity-server/actions/workflows/audit.yml/badge.svg)](https://github.com/invercity/livecity-server/actions/workflows/audit.yml)
[![Latest Tag](https://img.shields.io/github/v/tag/invercity/livecity-server?include_prereleases&sort=semver&label=latest%20tag)](https://github.com/invercity/livecity-server/tags)

Interactive real-time city public transport monitoring and route planning system, modernized for the **Node.js 24 / 26+**, **NestJS**, **MongoDB (GeoJSON)**, **React 19**, and **Google Maps API** stack.  
Modern upgrade of **livecity** project from 2014

---


## Tech Stack & Architecture

Livecity is structured as a TypeScript monorepo (`npm workspaces`):

- **`apps/api` — Backend (NestJS 11 + Mongoose 8):**
  - **Database & Geospatial Indexing:** MongoDB with `@nestjs/mongoose` and native GeoJSON `2dsphere` indexes (`$nearSphere`) for fast proximity queries.
  - **Real-Time Streaming (Zero-Dependency SSE):** Built-in Server-Sent Events (`@Sse('transport/stream')`) powered by `rxjs` and standard HTTP, replacing heavy `socket.io` dependencies.
  - **Native Cryptography:** Password hashing and verification implemented via Node's built-in `node:crypto` (`scrypt`, `randomBytes`, `timingSafeEqual`) with zero native C++ addon dependencies (`bcrypt` removed).
- **`apps/web` — Frontend (React 19 + Vite + Google Maps):**
  - **Interactive Map:** `@vis.gl/react-google-maps` with mobile-first responsive layout.
  - **Google Maps Transit Stops Integration:** Click directly on existing Google Maps transit stop POIs (`placeId`) to link and import official stop names and coordinates on the fly.
  - **Live Transport Updates:** Native browser `EventSource` client with automatic reconnection over mobile networks.
- **`packages/shared` — Shared Contracts:**
  - End-to-end TypeScript DTOs and interfaces shared between `@livecity/api` and `@livecity/web`.
- **Testing & CI/CD:**
  - Unit tests powered by Node's built-in test runner (`node:test` and `node:assert/strict`) with zero external test framework bloat.
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`) running `npm run typecheck`, `npm test`, and `npm run build`.
  - Dedicated Security Audit workflow (`.github/workflows/audit.yml`) running `npm audit` on every push, PR, and weekly schedule.
  - Automated Release workflow (`.github/workflows/release.yml`) that tags and publishes a new GitHub Release with auto-generated release notes whenever a PR is merged into `master` / `main`.

---

## Project Structure

```text
.
├── .github/workflows/
│   ├── audit.yml              # GitHub Actions: npm security audit (push, PR & weekly cron)
│   ├── ci.yml                 # GitHub Actions: typecheck, unit tests, build
│   └── release.yml            # GitHub Actions: auto tag & GitHub Release on merge
├── apps/
│   ├── api/                   # NestJS REST + SSE backend (@livecity/api)
│   │   └── src/
│   │       ├── auth/          # Authentication (node:crypto scrypt)
│   │       ├── common/        # Haversine & geospatial helpers
│   │       ├── guide/         # Personal route planner (Point A -> Point B)
│   │       ├── points/        # Transit stops CRUD & Google Place ID upsert
│   │       ├── routes/        # Transit routes & road segments (nodes)
│   │       └── transport/     # Active vehicles, arrival ETA & SSE stream
│   └── web/                   # React 19 + Vite frontend (@livecity/web)
├── packages/
│   └── shared/                # Shared TypeScript DTOs (@livecity/shared)
├── docker-compose.yml         # Local MongoDB 8 container
└── dev-runner.mjs             # Concurrent development launcher for API + Web
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** `>= 24.0.0` (compatible with Node.js 26)
- **MongoDB** `>= 7.0` (installed locally or via Docker)

### 2. Configure Environment
Copy the example environment file and provide your Google Maps API key:

```bash
cp .env.example .env
cp .env.example apps/web/.env
```

### 3. Start MongoDB (if using Docker)
```bash
docker compose up -d
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run in Development Mode
Starts both the NestJS backend (`http://0.0.0.0:3001/api`) and the Vite dev server (`http://0.0.0.0:5173`):

```bash
npm run dev
```

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Run both Backend API and Frontend Web servers concurrently |
| `npm run dev:api` | Run only the NestJS backend in watch mode |
| `npm run dev:web` | Run only the Vite React frontend |
| `npm run typecheck` | Run `tsc --noEmit` across all workspaces |
| `npm test` | Run unit tests across all workspaces using built-in `node:test` |
| `npm run build` | Build production bundles for all workspaces |

---

## REST & SSE API Reference

### Stops (`PointsController`)
- `GET /api/points` — List all transit stops
- `GET /api/points/near?lat=<lat>&lng=<lng>&radius=<meters>` — Find stops within radius using MongoDB `2dsphere` `$nearSphere`
- `POST /api/points` — Create a custom transit stop
- `POST /api/points/from-google-place` — Upsert a transit stop directly from a Google Maps POI (`googlePlaceId`, `title`, `lat`, `lng`)
- `PUT /api/points/:id` — Update stop details
- `DELETE /api/points/:id` — Delete a stop

### Routes & Segments (`RoutesController`)
- `GET /api/routes` / `POST /api/routes` — List or create transit routes
- `GET /api/routes/:id` / `PUT /api/routes/:id` / `DELETE /api/routes/:id` — Read, update, or delete a route (automatically syncs route references on associated stops)
- `GET /api/nodes` / `POST /api/nodes` / `DELETE /api/nodes/:id` — Manage route segments between stops

### Real-Time Transport & Arrival ETA (`TransportController`)
- `GET /api/transport` — List all active vehicles
- `GET /api/transport/stream` (**SSE**) — Real-time Server-Sent Events stream emitting `transport:updated` and `transport:removed`
- `GET /api/service/arrival/:id` — Calculate real-time arrival ETA and distance for all routes passing through stop `:id`
- `POST /api/service/transport?act=init|report|end` — Vehicle GPS telemetry endpoint

### Route Planner (`GuideController`)
- `POST /api/service/guide` — Find the optimal transit route (`TO` walk → `BUS` ride → `FROM` walk) between `{ start: { lat, lng }, end: { lat, lng } }`

### Auth (`AuthController`)
- `POST /api/service/register` — Register a user (`username`, `password`)
- `POST /api/service/login?act=login|logout` — Authenticate or log out
- `GET /api/service/app` — Get application version

---

## License

MIT
