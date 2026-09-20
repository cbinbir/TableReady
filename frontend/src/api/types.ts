// Shared domain types for TableReady.
// These describe the shape of data flowing through src/api/client.ts,
// which is the single boundary between the UI and the backend
// (currently mocked — see src/api/mockBackend.ts).

export type PartySource = 'walk-in' | 'call-ahead'

export type PartyStatus = 'waiting' | 'seated' | 'no-show' | 'cancelled'

export interface Party {
  id: string
  name: string
  partySize: number
  phone: string
  notes: string
  source: PartySource
  estimatedWaitMinutes: number
  status: PartyStatus
  /** Sort key among status === 'waiting' parties; lower comes first. */
  order: number
  createdAt: string
  updatedAt: string
  seatedAt: string | null
}

export interface NewPartyInput {
  name: string
  partySize: number
  phone: string
  notes: string
  source: PartySource
  estimatedWaitMinutes: number
}

export type PartyEditableFields = Partial<
  Pick<Party, 'name' | 'partySize' | 'phone' | 'notes' | 'source' | 'estimatedWaitMinutes'>
>

export type TableStatus = 'open' | 'occupied' | 'dirty'

export interface RestaurantTable {
  id: string
  label: string
  seats: number
  status: TableStatus
  updatedAt: string
}

export interface NewTableInput {
  label: string
  seats: number
}
