# TableReady

A lean, host-controlled waitlist and table-status tool for a single restaurant. See [`_docs/specs.md`](_docs/specs.md) for the full product spec.

## Status

- **Frontend**: implemented in [`frontend/`](frontend) — Waitlist, Tables, and History screens are fully interactive.
- **API contract**: [`openapi.yaml`](openapi.yaml) — every endpoint the frontend expects from a backend.
- **Backend**: implemented in [`backend/`](backend) — FastAPI, matching `openapi.yaml`, backed by an in-memory mock store (no real database yet).

The frontend now calls `backend/` directly (`frontend/src/api/client.ts` makes real `fetch` requests) — its own mock has been removed.

## Running both together

```bash
# terminal 1
cd backend && uv sync && uv run uvicorn tableready_backend.main:app --reload

# terminal 2
cd frontend && npm install && npm run dev
```

Vite's dev server proxies `/api/*` to the backend (see `frontend/vite.config.ts`), so the frontend
never needs an absolute URL or CORS config — open `http://localhost:5173`.

## Frontend

Stack: Vite + React + TypeScript + Tailwind CSS.

```bash
cd frontend
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
```

## Backend

Stack: FastAPI + uv, with an in-memory mock store standing in for a real database.

```bash
cd backend
uv sync
uv run uvicorn tableready_backend.main:app --reload   # dev server, serves /api/*
uv run pytest                                           # tests (written against openapi.yaml first)
```
