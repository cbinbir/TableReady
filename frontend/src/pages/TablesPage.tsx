import { useState } from 'react'
import { AddTableForm } from '../components/AddTableForm'
import { TableCard } from '../components/TableCard'
import { EmptyState } from '../components/EmptyState'
import { useTables } from '../state/TablesContext'

export function TablesPage() {
  const { tables, loading, error, addTable, setTableStatus, removeTable } = useTables()
  const [showAddForm, setShowAddForm] = useState(false)

  const openCount = tables.filter((t) => t.status === 'open').length

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Tables</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {openCount} open of {tables.length}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          + Add table
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">Loading tables…</p>
      ) : tables.length === 0 ? (
        <EmptyState icon="🍽️" title="No tables yet" subtitle="Add your first table to start tracking status." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onSetStatus={(status) => setTableStatus(table.id, status)}
              onRemove={() => removeTable(table.id)}
            />
          ))}
        </div>
      )}

      {showAddForm && <AddTableForm onSubmit={addTable} onClose={() => setShowAddForm(false)} />}
    </div>
  )
}
