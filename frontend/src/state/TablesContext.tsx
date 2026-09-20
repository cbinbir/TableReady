import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../api/client'
import type { NewTableInput, RestaurantTable, TableStatus } from '../api/types'

interface TablesContextValue {
  tables: RestaurantTable[]
  loading: boolean
  error: string | null
  addTable: (input: NewTableInput) => Promise<void>
  setTableStatus: (id: string, status: TableStatus) => Promise<void>
  removeTable: (id: string) => Promise<void>
}

const TablesContext = createContext<TablesContextValue | null>(null)

export function TablesProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.tables
      .list()
      .then((list) => {
        setTables(list)
        setError(null)
      })
      .catch(() => setError('Could not load tables. Try again.'))
      .finally(() => setLoading(false))
  }, [])

  const addTable = useCallback(async (input: NewTableInput) => {
    const created = await api.tables.add(input)
    setTables((prev) => [...prev, created])
  }, [])

  const setTableStatus = useCallback(async (id: string, status: TableStatus) => {
    const updated = await api.tables.setStatus(id, status)
    setTables((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }, [])

  const removeTable = useCallback(async (id: string) => {
    await api.tables.remove(id)
    setTables((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value: TablesContextValue = {
    tables,
    loading,
    error,
    addTable,
    setTableStatus,
    removeTable,
  }

  return <TablesContext.Provider value={value}>{children}</TablesContext.Provider>
}

export function useTables(): TablesContextValue {
  const ctx = useContext(TablesContext)
  if (!ctx) throw new Error('useTables must be used within a TablesProvider')
  return ctx
}
