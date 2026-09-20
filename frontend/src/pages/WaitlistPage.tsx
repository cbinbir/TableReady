import { useEffect, useState } from 'react'
import { PartyForm } from '../components/PartyForm'
import { WaitlistRow } from '../components/WaitlistRow'
import { EmptyState } from '../components/EmptyState'
import { useParties } from '../state/PartiesContext'
import type { Party } from '../api/types'

export function WaitlistPage() {
  const { waiting, loading, error, addParty, updateParty, reorderParty, seatParty, markNoShow, cancelParty } =
    useParties()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingParty, setEditingParty] = useState<Party | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Waitlist</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {waiting.length} {waiting.length === 1 ? 'party' : 'parties'} waiting
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          + Add party
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">Loading waitlist…</p>
      ) : waiting.length === 0 ? (
        <EmptyState
          icon="🪑"
          title="No one's waiting"
          subtitle="Add a walk-in or call-ahead party to get started."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {waiting.map((party, index) => (
            <WaitlistRow
              key={party.id}
              party={party}
              position={index + 1}
              isFirst={index === 0}
              isLast={index === waiting.length - 1}
              now={now}
              onMoveUp={() => reorderParty(party.id, 'up')}
              onMoveDown={() => reorderParty(party.id, 'down')}
              onEdit={() => setEditingParty(party)}
              onSeat={() => seatParty(party.id)}
              onNoShow={() => markNoShow(party.id)}
              onCancel={() => cancelParty(party.id)}
            />
          ))}
        </ul>
      )}

      {showAddForm && (
        <PartyForm
          title="Add party"
          submitLabel="Add to waitlist"
          onSubmit={addParty}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {editingParty && (
        <PartyForm
          title="Edit party"
          submitLabel="Save changes"
          initial={editingParty}
          onSubmit={(input) => updateParty(editingParty.id, input)}
          onClose={() => setEditingParty(null)}
        />
      )}
    </div>
  )
}
