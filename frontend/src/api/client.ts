// Centralized backend access point.
//
// Every backend call in the app goes through this module — nothing else
// should reach past it. It talks to the real backend in `../../../backend`
// over HTTP, following `openapi.yaml` at the repo root exactly (paths,
// methods, request/response bodies, status codes).
//
// Requests use a relative `/api/...` base, matching openapi.yaml's `servers`
// entry ("relative to wherever the frontend is served from"). In dev, Vite's
// server proxy (see vite.config.ts) forwards `/api/*` to the FastAPI backend
// so no absolute URL or CORS config is needed on the frontend side.

import type {
  NewPartyInput,
  NewTableInput,
  Party,
  PartyEditableFields,
  RestaurantTable,
  TableStatus,
} from './types'

const API_BASE = '/api'

class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const body: unknown = await response.json()
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
        message = body.message
      }
    } catch {
      // Non-JSON error body — fall back to the generic message above.
    }
    throw new ApiError(message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  waitlist: {
    list: (): Promise<Party[]> => request('/parties'),

    add: (input: NewPartyInput): Promise<Party> =>
      request('/parties', { method: 'POST', body: JSON.stringify(input) }),

    update: (id: string, patch: PartyEditableFields): Promise<Party> =>
      request(`/parties/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),

    reorder: (id: string, direction: 'up' | 'down'): Promise<Party[]> =>
      request(`/parties/${id}/reorder`, { method: 'POST', body: JSON.stringify({ direction }) }),

    seat: (id: string): Promise<Party> => request(`/parties/${id}/seat`, { method: 'POST' }),

    markNoShow: (id: string): Promise<Party> =>
      request(`/parties/${id}/no-show`, { method: 'POST' }),

    cancel: (id: string): Promise<Party> => request(`/parties/${id}/cancel`, { method: 'POST' }),

    recall: (id: string): Promise<Party> => request(`/parties/${id}/recall`, { method: 'POST' }),
  },

  tables: {
    list: (): Promise<RestaurantTable[]> => request('/tables'),

    add: (input: NewTableInput): Promise<RestaurantTable> =>
      request('/tables', { method: 'POST', body: JSON.stringify(input) }),

    setStatus: (id: string, status: TableStatus): Promise<RestaurantTable> =>
      request(`/tables/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

    remove: (id: string): Promise<void> => request(`/tables/${id}`, { method: 'DELETE' }),
  },

  history: {
    list: (): Promise<Party[]> => request('/parties'),
  },
}
