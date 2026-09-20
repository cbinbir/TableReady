# AGENTS.md

## Project

TableReady — a lean, host-controlled waitlist and table-status tool for a single restaurant. Full product spec: [`_docs/specs.md`](_docs/specs.md).

## Status

- `frontend/` — implemented (Waitlist, Tables, History screens, fully interactive).
- `openapi.yaml` (repo root) — the API contract the frontend expects, derived from `frontend/src/api/client.ts`.
- `backend/` — implemented (FastAPI, matches `openapi.yaml`, in-memory mock store — no real database yet).
- The frontend still talks to its own mock (`frontend/src/api/client.ts`), not `backend/`, yet. Wiring them together (pointing `client.ts` at `backend/`'s endpoints) is the next step.

## Frontend

Stack: Vite + React + TypeScript + Tailwind CSS v4.

```bash
cd frontend
npm install
npm run dev      # dev server
npm run build    # type-check (tsc -b) + production build
npm run lint      # oxlint
```

### Structure

```
frontend/src/
  api/
    types.ts        # domain types (Party, RestaurantTable, ...)
    client.ts        # the ONLY module the UI should import backend calls from
    mockBackend.ts    # in-memory + localStorage mock "server" — client.ts internals only
  state/              # React contexts wrapping api/client.ts (PartiesContext, TablesContext)
  pages/              # WaitlistPage, TablesPage, HistoryPage
  components/         # presentational pieces used by pages
  lib/format.ts        # date/time formatting helpers
```

### Conventions

- **All backend access goes through `src/api/client.ts`.** Nothing outside `api/` should import `mockBackend.ts` directly. When a real backend exists, only `client.ts` needs to change (swap method bodies for `fetch` calls) — signatures should stay the same so pages/state don't need edits.
- State is shared via `PartiesProvider` / `TablesProvider` (React Context) rather than prop-drilling or a global store library.
- No routing library — tab switching in `App.tsx` is plain `useState`, since this is a single-device, single-screen-at-a-time app per the spec (no auth, no multi-page deep-linking requirement).
- Mock data persists to `localStorage` (`tableready:v1`) so the demo survives a page refresh, mirroring the spec's requirement that the waitlist/history isn't session-only.

## Backend

Stack: FastAPI + [uv](https://docs.astral.sh/uv/). Implements [`../openapi.yaml`](openapi.yaml).

```bash
cd backend
uv sync
uv run uvicorn tableready_backend.main:app --reload   # dev server
uv run pytest                                           # tests
```

### Structure

```
backend/src/tableready_backend/
  models.py       # Pydantic schemas mirroring openapi.yaml's components.schemas
  store.py         # in-memory mock "database" (Store class) + demo seed data
  dependencies.py   # get_store() — pulls the request's Store out of app.state
  routers/
    parties.py      # /api/parties endpoints
    tables.py        # /api/tables endpoints
  main.py            # create_app() factory: wires routers, shapes error responses
backend/tests/
  conftest.py    # `client` fixture — fresh app + empty store per test
  helpers.py      # create_party() / create_table() — arrange fixtures through the API
```

### Conventions

- Tests were written against `openapi.yaml` first (red), then the routers were implemented to
  make them pass (green). Keep following that order for new endpoints/behavior.
- Each test gets its own `Store` via `create_app(seed=False)` — no shared global state between
  tests, and no test depends on the demo seed's specific content. Arrange data through the API
  (see `tests/helpers.py`), not by reaching into the store.
- Error responses are shaped `{"message": str}` (the OpenAPI `Error` schema), not FastAPI's
  default `{"detail": str}` — see the exception handlers in `main.py`. Invalid request bodies
  return `400`, not FastAPI's default `422`. Keep both when adding endpoints.
- `store.py` is the only place holding restaurant state; routers never touch dicts directly.
  Swapping in a real database later should only mean rewriting `Store`'s methods.
- No authentication — matches the frontend, which sends no credentials yet.
