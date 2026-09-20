import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../api/client'
import type { NewPartyInput, Party, PartyEditableFields } from '../api/types'

interface PartiesContextValue {
  parties: Party[]
  loading: boolean
  error: string | null
  waiting: Party[]
  history: Party[]
  addParty: (input: NewPartyInput) => Promise<void>
  updateParty: (id: string, patch: PartyEditableFields) => Promise<void>
  reorderParty: (id: string, direction: 'up' | 'down') => Promise<void>
  seatParty: (id: string) => Promise<void>
  markNoShow: (id: string) => Promise<void>
  cancelParty: (id: string) => Promise<void>
  recallParty: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const PartiesContext = createContext<PartiesContextValue | null>(null)

export function PartiesProvider({ children }: { children: ReactNode }) {
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const list = await api.waitlist.list()
      setParties(list)
      setError(null)
    } catch {
      setError('Could not load the waitlist. Try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addParty = useCallback(async (input: NewPartyInput) => {
    const created = await api.waitlist.add(input)
    setParties((prev) => [...prev, created])
  }, [])

  const updateParty = useCallback(async (id: string, patch: PartyEditableFields) => {
    const updated = await api.waitlist.update(id, patch)
    setParties((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const reorderParty = useCallback(async (id: string, direction: 'up' | 'down') => {
    const all = await api.waitlist.reorder(id, direction)
    setParties(all)
  }, [])

  const seatParty = useCallback(async (id: string) => {
    const updated = await api.waitlist.seat(id)
    setParties((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const markNoShow = useCallback(async (id: string) => {
    const updated = await api.waitlist.markNoShow(id)
    setParties((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const cancelParty = useCallback(async (id: string) => {
    const updated = await api.waitlist.cancel(id)
    setParties((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const recallParty = useCallback(async (id: string) => {
    const updated = await api.waitlist.recall(id)
    setParties((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const waiting = useMemo(
    () => parties.filter((p) => p.status === 'waiting').sort((a, b) => a.order - b.order),
    [parties],
  )

  const history = useMemo(
    () =>
      [...parties].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [parties],
  )

  const value: PartiesContextValue = {
    parties,
    loading,
    error,
    waiting,
    history,
    addParty,
    updateParty,
    reorderParty,
    seatParty,
    markNoShow,
    cancelParty,
    recallParty,
    refresh,
  }

  return <PartiesContext.Provider value={value}>{children}</PartiesContext.Provider>
}

export function useParties(): PartiesContextValue {
  const ctx = useContext(PartiesContext)
  if (!ctx) throw new Error('useParties must be used within a PartiesProvider')
  return ctx
}
