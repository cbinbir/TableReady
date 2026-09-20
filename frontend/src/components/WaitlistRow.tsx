import { useState } from 'react'
import type { Party } from '../api/types'
import { formatElapsed } from '../lib/format'
import { Badge } from './Badge'

interface WaitlistRowProps {
  party: Party
  position: number
  isFirst: boolean
  isLast: boolean
  now: number
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onSeat: () => void
  onNoShow: () => void
  onCancel: () => void
}

export function WaitlistRow({
  party,
  position,
  isFirst,
  isLast,
  now,
  onMoveUp,
  onMoveDown,
  onEdit,
  onSeat,
  onNoShow,
  onCancel,
}: WaitlistRowProps) {
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 sm:flex-col sm:gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label="Move up"
          className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 disabled:opacity-30 dark:border-slate-600"
        >
          ▲
        </button>
        <span className="w-5 text-center text-sm font-semibold text-slate-400">{position}</span>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label="Move down"
          className="rounded-md border border-slate-200 px-2 py-1 text-slate-500 disabled:opacity-30 dark:border-slate-600"
        >
          ▼
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{party.name}</span>
          {party.source === 'call-ahead' && <Badge tone="purple">📞 Call-ahead</Badge>}
          <Badge tone="neutral">
            {party.partySize} {party.partySize === 1 ? 'guest' : 'guests'}
          </Badge>
          <Badge tone="amber">~{party.estimatedWaitMinutes} min</Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500 dark:text-slate-400">
          <span>Waiting {formatElapsed(party.createdAt, now)}</span>
          {party.phone && <span>{party.phone}</span>}
        </div>
        {party.notes && (
          <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-400">{party.notes}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onNoShow}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          No-show
        </button>
        {confirmingCancel ? (
          <button
            type="button"
            onClick={() => {
              onCancel()
              setConfirmingCancel(false)
            }}
            onBlur={() => setConfirmingCancel(false)}
            className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-300"
          >
            Confirm cancel?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingCancel(true)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={onSeat}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Seat
        </button>
      </div>
    </li>
  )
}
