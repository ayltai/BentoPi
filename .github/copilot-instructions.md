# Copilot Instructions for BentoPi

## Project Overview
- **BentoPi** is a self-hosted dashboard for Raspberry Pi, aggregating weather, news, transport, and sensor data.
- **Architecture:**
  - `frontend/`: React 19 + TypeScript, Vite, Ant Design 5. UI for dashboard, communicates with backend via REST APIs.
  - `backend/`: FastAPI (Python 3.10+), provides REST APIs for sensors, system info, and serves static frontend files in production.
- **Target device:** Raspberry Pi Zero 2 W (480x320 touchscreen), but works on any Pi, ARM, or x86 computers.

## Key Workflows
- **Frontend development:**
  - `cd frontend && pnpm i && pnpm start`
  - Access at `http://localhost:5173`
- **Frontend build:**
  - `pnpm build` (output auto-copied to `backend/web/`)
- **Backend development:**
  - `cd backend && make venv && source venv/bin/activate && make upgrade && make`
  - API at `http://localhost:8000`
- **Production:**
  - Build frontend, then run backend with `make prod` (serves frontend at `/web`)
- **Docker:**
  - `cd backend && docker build -t bentopi . && docker run -p 8000:8000 bentopi`

## Testing & Linting
- **Frontend:** `pnpm test` (Vitest), `pnpm lint` (ESLint, see `eslint.config.js`)
- **Backend:** `make test` (pytest), `make lint` (autopep8, pycodestyle, pylint)

## Patterns & Conventions
- **API endpoints:**
  - Sensor: `/api/v1/sensors/temperature`, `/humidity`
  - System: `/api/v1/system/cpu/temperature`, `/voltage`, `/frequency`, `/mem/total`, `/mem/usage`
- **Frontend API access:**
  - Uses RTK Query (`src/apis/sensorService.ts`, `systemService.ts`), base URL from `src/constants.ts` (`API_ENDPOINT`)
  - Retry logic via `API_MAX_RETRIES`
- **Frontend constants:**
  - Screen size, polling intervals, and API endpoint in `src/constants.ts`
- **Backend sensors:**
  - SHT20 sensor via `smbus2` and `sht20` (see `src/routers/sensors.py`)
  - System info via `/proc` and `vcgencmd` (see `src/routers/system.py`)
- **Static files:**
  - In production, frontend is served at `/web` by FastAPI using a custom `SpaStaticFiles` class (see `src/main.py`)

## Integration Points
- **Frontend ↔ Backend:** REST API, versioned under `/api/v1/`
- **External dependencies:**
  - Backend: FastAPI, SHT20, SMBus2, Sentry SDK
  - Frontend: React, Ant Design, Redux Toolkit, Sentry, FontAwesome

## Notable Files
- `frontend/src/constants.ts`: Central config for API endpoints, intervals, screen size
- `frontend/src/apis/`: RTK Query API definitions for backend endpoints
- `backend/src/routers/`: FastAPI routers for sensors and system info
- `backend/Makefile`: Developer commands for backend
- `frontend/eslint.config.js`: Project-specific ESLint config

## Tips for AI Agents
- Always update both frontend and backend when changing API contracts
- Use Makefile and pnpm scripts for all build/test/lint tasks
- Follow the REST endpoint structure and naming conventions as in existing routers/services
- For new sensors or system metrics, add a FastAPI router and corresponding RTK Query service
