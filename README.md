# TableReady

A lean, host-controlled waitlist and table-status tool for a single restaurant. See [`_docs/specs.md`](_docs/specs.md) for the full product spec.

## Status

- **Frontend**: implemented in [`frontend/`](frontend) — Waitlist, Tables, and History screens are fully interactive.
- **Backend**: not yet implemented. The frontend talks to a single mock API layer (`frontend/src/api/client.ts`) backed by an in-memory/localStorage store, so it can be swapped for a real backend later without touching the UI.

## Frontend

Stack: Vite + React + TypeScript + Tailwind CSS.

```bash
cd frontend
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
```
