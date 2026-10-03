## Guidelines

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask for clarification.
- If multiple interpretations exist, present them. Don't pick silently.
- If a simpler approach exists, present it. Don't hide complexity.
- If something is unclear, stop. Name what's confusing. Ask for clarification. Don't guess silently.

## Solution Approach

- Always start small and simple, and then iterate to improve the solution.
- Always explain your plans and reasoning before implementing any code.
- Always prioritise simplicity and efficiency in your solutions, clarity in your code, and maintainability in your implementations.
- Always ask for clarification if the problem statement is ambiguous or unclear.
- Always ask for feedback on your solution approach before implementing it.
- Always implement the solution in thin slices, and test each slice before moving on to the next one.

## Software Engineering Excellence Standards

### Design Principles

- SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- Patterns: Apply recognised design patterns where appropriate, and avoid over-engineering or unnecessary complexity.
- Clean Code: Enforce DRY, YAGNI, and KISS principles, and avoid code duplication, unnecessary abstractions, and over-engineering.
- Architecture: Maintain a clear separation of concerns, and avoid tight coupling between components. Use modular design and follow established architectural patterns where appropriate.
- Security: Implement secure-by-design principles, and avoid introducing security vulnerabilities or risks into the codebase. Follow best practices for secure coding, such as input validation and output encoding, and avoid hardcoding sensitive information or credentials in the codebase.

## Coding Styles

- Always write code in a clear, maintainable, and efficient manner, following best practices and coding standards.
- Avoid writing comments in the code unless necessary for clarity, and ensure that any comments are concise and informative.
- Avoid breaking a line of code into multiple lines unless it is necessary for readability or to adhere to coding standards. There is no line length limit.
- Prefer single quotes for strings unless the string contains a single quote, in which case double quotes should be used.
- Prefer UI components from Ant Design over custom components and CSS, unless there is a specific reason to use a custom component or CSS.
- Do not break lines of import statements in React code.
- Code should be written as simply as possible, and should not wrap function calls in unnecessary abstractions or layers of indirection. Avoid over-engineering and unnecessary complexity.

## Testing

- Write code that is simple, maintainable, and easy to understand so that unit tests are not needed.

## Security

- The solution is intended to be deployed in relatively low-risk environments, such as home or small business networks, and is not designed to withstand sophisticated attacks from highly skilled adversaries. Therefore, the solution may not be suitable for deployment in high-risk environments, such as critical infrastructure or financial systems, where the consequences of a security breach could be severe.
- Always follow best practices for secure coding, such as input validation, but do not implement overly complex security measures that may introduce unnecessary complexity or performance overhead.
- Always consider the potential security implications of your code, and ask for feedback if you are aware of any potential security risks or vulnerabilities.

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
