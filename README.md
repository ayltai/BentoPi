# BentoPi

BentoPi is a multi-purpose, self-hosted dashboard designed for Raspberry Pi. It provides real-time information such as weather, news, and transport disruptions, making it ideal for home automation, information kiosks, or personal dashboards.

## Goals & Purpose

- **Self-hosted**: All data is processed and displayed locally on your Raspberry Pi.
- **Dashboard**: Aggregates weather, news, transport information, and security camera feeds in a single interface.
- **Extensible**: Easily add new data sources or dashboard widgets.
- **Modern UI**: Built with React and Ant Design for a responsive, user-friendly experience.
- **API Backend**: FastAPI-based backend for data aggregation and sensor integration.

## Project Structure

- `frontend/`: React + TypeScript dashboard UI.
- `backend/`: FastAPI Python backend serving APIs and static files.

## Getting Started

### Prerequisites

- Node.js >= 22 and pnpm >= 10 for frontend. This project targets Node.js v22 by default as it is the latest LTS version that supports 32-bit ARM architecture commonly used by Raspberry Pi Zero 2 W.
- Python >= 3.10 for backend. This project targets Python 3.13 by default as it is the version bundled with Raspberry Pi OS Lite (Trixie).

### Running the Frontend (Development)

```sh
cd frontend
pnpm i
pnpm start
```

- Access the dashboard at `http://localhost:5173` (default Vite port).

### Running the Backend (Development)

```sh
cd backend
make venv
source venv/bin/activate
make upgrade
make
```

- Backend API runs at `http://localhost:8000`.

### Building the Frontend for Production

```sh
cd frontend
pnpm build
```

- The build output will be placed in `frontend/dist/`.

### Running the Backend with Production Frontend

1. Build the frontend as above.
2. The build output will be automatically copied to the backend's web directory (automated in Docker build).
3. Start the backend:

```sh
cd backend
make venv
source venv/bin/activate
make upgrade
make prod
```

- Access the dashboard at `http://localhost:8000/web`.

### Docker

Build and run the complete system using Docker:

```sh
cd backend
docker build -t bentopi .
docker run -p 8000:8000 bentopi
```

## Development Notes

- **Frontend**: Hot-reloading, TypeScript, React 19, Ant Design 5.
- **Backend**: FastAPI, CORS enabled, sensor integration via SMBus.
- **Testing**: Run `pnpm test` in frontend, `make test` in backend.

## License

MIT
