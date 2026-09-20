# TableReady Backend

FastAPI implementation of the contract in [`../openapi.yaml`](../openapi.yaml). Data lives in an
in-memory mock store (`src/tableready_backend/store.py`) — no real database yet, by design, so it
can be swapped in later without touching the routers.

## Setup

Requires [uv](https://docs.astral.sh/uv/).

```bash
cd backend
uv sync
```

## Run

```bash
uv run uvicorn tableready_backend.main:app --reload
```

Serves the API under `/api` (e.g. `http://127.0.0.1:8000/api/parties`), matching the `servers` entry
in `openapi.yaml`. Interactive docs at `/docs`.

## Test

```bash
uv run pytest
```

Tests were written against `openapi.yaml` first, then the routers were implemented to satisfy them.
Each test gets a fresh app instance with an empty store (`create_app(seed=False)`) and arranges its
own parties/tables through the API rather than depending on seed data.

## Structure

```
src/tableready_backend/
  models.py      # Pydantic schemas mirroring openapi.yaml's components.schemas
  store.py        # in-memory mock "database" + demo seed data
  dependencies.py  # FastAPI dependency exposing the request's Store
  routers/
    parties.py     # /api/parties endpoints
    tables.py       # /api/tables endpoints
  main.py           # app factory: wires routers + error-response shaping
```

## Notes

- Error responses are shaped as `{"message": str}` (matching `openapi.yaml`'s `Error` schema)
  instead of FastAPI's defaults — see the exception handlers in `main.py`.
- Invalid request bodies return `400` (per `openapi.yaml`), not FastAPI's default `422`.
- No authentication is implemented, matching the frontend, which sends no credentials today.
