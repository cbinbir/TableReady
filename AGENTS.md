# AGENTS.md

## Project

TableReady — a lean, host-controlled waitlist and table-status tool for a single restaurant. Full product spec: [`_docs/specs.md`](_docs/specs.md).

## Status

- `frontend/` — implemented (Waitlist, Tables, History screens, fully interactive).
- `openapi.yaml` (repo root) — the API contract the frontend expects, derived from `frontend/src/api/client.ts`.
- `backend/` — implemented (FastAPI, matches `openapi.yaml`, in-memory mock store — no real database yet).
- `frontend/src/api/client.ts` now calls `backend/` directly over HTTP (`/api/...`, proxied to it by Vite in dev — see `frontend/vite.config.ts`). The frontend's own mock (`mockBackend.ts`) has been removed.

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
    types.ts        # domain types (Party, RestaurantTable, ...) — mirrors openapi.yaml
    client.ts        # the ONLY module the UI should import backend calls from; fetches backend/
  state/              # React contexts wrapping api/client.ts (PartiesContext, TablesContext)
  pages/              # WaitlistPage, TablesPage, HistoryPage
  components/         # presentational pieces used by pages
  lib/format.ts        # date/time formatting helpers
```

### Conventions

- **All backend access goes through `src/api/client.ts`.** It's a thin `fetch` wrapper over
  `backend/`'s endpoints, using relative `/api/...` paths (matching `openapi.yaml`'s `servers`
  entry) so it works unchanged through Vite's dev proxy or a same-origin production deploy.
  Nothing else in the app should call `fetch` directly.
- State is shared via `PartiesProvider` / `TablesProvider` (React Context) rather than prop-drilling or a global store library.
- No routing library — tab switching in `App.tsx` is plain `useState`, since this is a single-device, single-screen-at-a-time app per the spec (no auth, no multi-page deep-linking requirement).
- The Tables page uses a wider container (`max-w-5xl`) than Waitlist/History (`max-w-3xl`): its
  3-button-per-card status row needs more room per column at the 4-column breakpoint, or labels
  truncate. Keep this in mind before changing either page's grid/column breakpoints.

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
- CORS (`main.py`) only allowlists local dev origins (5173/4173) as a fallback for hitting the
  backend directly; the frontend dev server proxies `/api/*` instead (same-origin, no CORS
  needed) — see `frontend/vite.config.ts`.
