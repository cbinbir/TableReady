import { useState } from 'react'
import type { RestaurantTable, TableStatus } from '../api/types'

const statusStyles: Record<TableStatus, { card: string; dot: string; label: string; short: string }> = {
  open: {
    card: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10',
    dot: 'bg-emerald-500',
    label: 'Open',
    short: 'Open',
  },
  occupied: {
    card: 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10',
    dot: 'bg-rose-500',
    label: 'Occupied',
    short: 'Occ.',
  },
  dirty: {
    card: 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10',
    dot: 'bg-amber-500',
    label: 'Needs cleaning',
    short: 'Dirty',
  },
}

const statuses: TableStatus[] = ['open', 'occupied', 'dirty']

export function TableCard({
  table,
  onSetStatus,
  onRemove,
}: {
  table: RestaurantTable
  onSetStatus: (status: TableStatus) => void
  onRemove: () => void
}) {
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const style = statusStyles[table.status]

  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm ${style.card}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{table.label}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {table.seats} {table.seats === 1 ? 'seat' : 'seats'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (confirmingRemove ? onRemove() : setConfirmingRemove(true))}
          onBlur={() => setConfirmingRemove(false)}
          aria-label="Remove table"
          className="rounded-full p-1 text-xs text-slate-400 hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10"
        >
          {confirmingRemove ? 'Confirm ✕' : '✕'}
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        {style.label}
      </div>

      <div className="flex gap-1.5">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onSetStatus(status)}
            disabled={status === table.status}
            className={`min-w-0 flex-1 truncate rounded-lg border px-1 py-1.5 text-[11px] font-medium transition-colors sm:text-xs ${
              status === table.status
                ? 'cursor-default border-slate-900/10 bg-white/70 text-slate-400 dark:bg-slate-900/40 dark:text-slate-500'
                : 'border-slate-900/10 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {statusStyles[status].short}
          </button>
        ))}
      </div>
    </div>
  )
}
