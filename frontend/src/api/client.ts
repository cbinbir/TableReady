// Centralized backend access point.
//
// Every backend call in the app goes through this module. Today it delegates
// to an in-memory/localStorage mock (mockBackend.ts). When a real backend
// exists, only this file needs to change — swap each method body for a
// `fetch(...)` call and keep the same function signatures — and nothing
// elsewhere in the UI has to change.

import { mockBackend } from './mockBackend'
import type {
  NewPartyInput,
  NewTableInput,
  Party,
  PartyEditableFields,
  RestaurantTable,
  TableStatus,
} from './types'

export const api = {
  waitlist: {
    list: (): Promise<Party[]> => mockBackend.getParties(),

    add: (input: NewPartyInput): Promise<Party> => mockBackend.createParty(input),

    update: (id: string, patch: PartyEditableFields): Promise<Party> =>
      mockBackend.updateParty(id, patch),

    reorder: (id: string, direction: 'up' | 'down'): Promise<Party[]> =>
      mockBackend.reorderParty(id, direction),

    seat: (id: string): Promise<Party> =>
      mockBackend.updateParty(id, { status: 'seated', seatedAt: new Date().toISOString() }),

    markNoShow: (id: string): Promise<Party> =>
      mockBackend.updateParty(id, { status: 'no-show' }),

    cancel: (id: string): Promise<Party> => mockBackend.updateParty(id, { status: 'cancelled' }),

    recall: (id: string): Promise<Party> => mockBackend.updateParty(id, { status: 'waiting' }),
  },

  tables: {
    list: (): Promise<RestaurantTable[]> => mockBackend.getTables(),

    add: (input: NewTableInput): Promise<RestaurantTable> => mockBackend.createTable(input),

    setStatus: (id: string, status: TableStatus): Promise<RestaurantTable> =>
      mockBackend.updateTableStatus(id, status),

    remove: (id: string): Promise<void> => mockBackend.deleteTable(id),
  },

  history: {
    list: (): Promise<Party[]> => mockBackend.getParties(),
  },

  dev: {
    resetDemoData: (): Promise<void> => mockBackend.resetDemoData(),
  },
}
