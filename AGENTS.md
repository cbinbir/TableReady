# AGENTS.md

## Project

TableReady — a lean, host-controlled waitlist and table-status tool for a single restaurant. Full product spec: [`_docs/specs.md`](_docs/specs.md).

## Status

- `frontend/` — implemented (Waitlist, Tables, History screens, fully interactive).
- Backend — not implemented yet. The frontend calls a mock backend; see below.

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
