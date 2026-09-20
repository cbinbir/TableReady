// In-memory "server" that stands in for a real backend.
// It is only ever touched by src/api/client.ts — nothing else in the app
// should import from this file.

import type { NewPartyInput, NewTableInput, Party, RestaurantTable } from './types'

const STORAGE_KEY = 'tableready:v1'
const NETWORK_DELAY_MS = 220

interface StoreShape {
  parties: Party[]
  tables: RestaurantTable[]
  orderCounter: number
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function seedData(): StoreShape {
  const parties: Party[] = [
    {
      id: crypto.randomUUID(),
      name: 'Alvarez',
      partySize: 4,
      phone: '555-0142',
      notes: 'Prefers a booth',
      source: 'walk-in',
      estimatedWaitMinutes: 20,
      status: 'waiting',
      order: 1,
      createdAt: minutesAgo(18),
      updatedAt: minutesAgo(18),
      seatedAt: null,
    },
    {
      id: crypto.randomUUID(),
      name: 'Chen',
      partySize: 2,
      phone: '555-0187',
      notes: '',
      source: 'call-ahead',
      estimatedWaitMinutes: 15,
      status: 'waiting',
      order: 2,
      createdAt: minutesAgo(12),
      updatedAt: minutesAgo(12),
      seatedAt: null,
    },
    {
      id: crypto.randomUUID(),
      name: 'Okafor',
      partySize: 6,
      phone: '555-0120',
      notes: 'High chair needed',
      source: 'walk-in',
      estimatedWaitMinutes: 35,
      status: 'waiting',
      order: 3,
      createdAt: minutesAgo(6),
      updatedAt: minutesAgo(6),
      seatedAt: null,
    },
    {
      id: crypto.randomUUID(),
      name: 'Patel',
      partySize: 3,
      phone: '555-0199',
      notes: '',
      source: 'call-ahead',
      estimatedWaitMinutes: 10,
      status: 'seated',
      order: 0,
      createdAt: minutesAgo(55),
      updatedAt: minutesAgo(40),
      seatedAt: minutesAgo(40),
    },
    {
      id: crypto.randomUUID(),
      name: 'Nguyen',
      partySize: 2,
      phone: '555-0110',
      notes: 'Never showed',
      source: 'walk-in',
      estimatedWaitMinutes: 15,
      status: 'no-show',
      order: 0,
      createdAt: minutesAgo(90),
      updatedAt: minutesAgo(70),
      seatedAt: null,
    },
  ]

  const tableSeeds: Array<[string, number, RestaurantTable['status']]> = [
    ['T1', 2, 'open'],
    ['T2', 2, 'occupied'],
    ['T3', 4, 'occupied'],
    ['T4', 4, 'dirty'],
    ['T5', 4, 'open'],
    ['T6', 6, 'open'],
    ['Patio 1', 4, 'open'],
    ['Patio 2', 2, 'dirty'],
  ]

  const tables: RestaurantTable[] = tableSeeds.map(([label, seats, status]) => ({
    id: crypto.randomUUID(),
    label,
    seats,
    status,
    updatedAt: minutesAgo(30),
  }))

  return { parties, tables, orderCounter: 4 }
}

function loadStore(): StoreShape {
  if (typeof localStorage === 'undefined') return seedData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedData()
    const parsed = JSON.parse(raw) as StoreShape
    if (!parsed.parties || !parsed.tables) return seedData()
    return parsed
  } catch {
    return seedData()
  }
}

let store = loadStore()

function persist() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS))
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function touch(): string {
  return new Date().toISOString()
}

function nextOrder(): number {
  store.orderCounter += 1
  return store.orderCounter
}

export const mockBackend = {
  async getParties(): Promise<Party[]> {
    return delay(clone(store.parties))
  },

  async createParty(input: NewPartyInput): Promise<Party> {
    const now = touch()
    const party: Party = {
      id: crypto.randomUUID(),
      name: input.name,
      partySize: input.partySize,
      phone: input.phone,
      notes: input.notes,
      source: input.source,
      estimatedWaitMinutes: input.estimatedWaitMinutes,
      status: 'waiting',
      order: nextOrder(),
      createdAt: now,
      updatedAt: now,
      seatedAt: null,
    }
    store.parties.push(party)
    persist()
    return delay(clone(party))
  },

  async updateParty(id: string, patch: Partial<Party>): Promise<Party> {
    const party = store.parties.find((p) => p.id === id)
    if (!party) throw new Error(`Party ${id} not found`)
    Object.assign(party, patch, { updatedAt: touch() })
    persist()
    return delay(clone(party))
  },

  async reorderParty(id: string, direction: 'up' | 'down'): Promise<Party[]> {
    const waiting = store.parties
      .filter((p) => p.status === 'waiting')
      .sort((a, b) => a.order - b.order)
    const index = waiting.findIndex((p) => p.id === id)
    if (index === -1) throw new Error(`Party ${id} not found in waitlist`)
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= waiting.length) {
      return delay(clone(store.parties))
    }
    const a = waiting[index]
    const b = waiting[swapIndex]
    const aOrder = a.order
    a.order = b.order
    b.order = aOrder
    a.updatedAt = touch()
    b.updatedAt = touch()
    persist()
    return delay(clone(store.parties))
  },

  async getTables(): Promise<RestaurantTable[]> {
    return delay(clone(store.tables))
  },

  async createTable(input: NewTableInput): Promise<RestaurantTable> {
    const table: RestaurantTable = {
      id: crypto.randomUUID(),
      label: input.label,
      seats: input.seats,
      status: 'open',
      updatedAt: touch(),
    }
    store.tables.push(table)
    persist()
    return delay(clone(table))
  },

  async updateTableStatus(id: string, status: RestaurantTable['status']): Promise<RestaurantTable> {
    const table = store.tables.find((t) => t.id === id)
    if (!table) throw new Error(`Table ${id} not found`)
    table.status = status
    table.updatedAt = touch()
    persist()
    return delay(clone(table))
  },

  async deleteTable(id: string): Promise<void> {
    store.tables = store.tables.filter((t) => t.id !== id)
    persist()
    return delay(undefined)
  },

  async resetDemoData(): Promise<void> {
    store = seedData()
    persist()
    return delay(undefined)
  },
}
