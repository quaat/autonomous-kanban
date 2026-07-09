# Autonomous Kanban FastAPI Backend

This is a minimal, contract-only FastAPI backend for local development against the existing frontend HTTP API boundary.

The application is created through `create_app()` in `app/main.py`. Uvicorn still uses the module-level `app`, while tests can call `create_app(repository=InMemoryRepository())` for isolated state. The repository is attached at `app.state.repository`, and routers resolve it through FastAPI dependency injection.

It is intentionally:

- in-memory and non-durable
- unauthenticated
- local/development oriented
- seeded from the root `fixtures/*.json` files
- not connected to real worker execution, coding agents, LLMs, GitHub/repositories, queues, or production databases

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Run

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Then point the frontend at it:

```bash
cd ..
VITE_API_MODE=http VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

## Test

```bash
cd backend
python -m ruff check app tests
python -m pytest
```

## Endpoints

- `GET /healthz`
- `GET /readyz`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/{id}`
- `POST /api/tasks/{id}/move`
- `GET /api/activity-events`
- `POST /api/activity-events`
- `GET /api/workflow/nodes`
- `GET /api/workflow/edges`
- `PATCH /api/workflow/nodes/{id}` (`label`, `subtitle`, `position`, and `config` only; `type` is not patchable)
- `POST /api/workflow/validate`
- `POST /api/workflow/simulate`
- `POST /api/workflow/publish`
