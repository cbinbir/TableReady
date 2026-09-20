import { useMemo, useState } from 'react'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { useParties } from '../state/PartiesContext'
import type { Party, PartyStatus } from '../api/types'
import { dayKey, formatClockTime, formatDayLabel } from '../lib/format'

const statusFilters: Array<{ value: PartyStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'seated', label: 'Seated' },
  { value: 'no-show', label: 'No-show' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusBadge: Record<PartyStatus, { tone: 'green' | 'amber' | 'red' | 'gray'; label: string }> = {
  waiting: { tone: 'amber', label: 'Waiting' },
  seated: { tone: 'green', label: 'Seated' },
  'no-show': { tone: 'red', label: 'No-show' },
  cancelled: { tone: 'gray', label: 'Cancelled' },
}

export function HistoryPage() {
  const { history, loading, error, recallParty } = useParties()
  const [filter, setFilter] = useState<PartyStatus | 'all'>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? history : history.filter((p) => p.status === filter)),
    [history, filter],
  )

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; parties: Party[] }>()
    for (const party of filtered) {
      const key = dayKey(party.createdAt)
      if (!map.has(key)) map.set(key, { label: formatDayLabel(party.createdAt), parties: [] })
      map.get(key)!.parties.push(party)
    }
    return Array.from(map.values())
  }, [filtered])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Daily log of every party, kept for the record.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-violet-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-400">Loading history…</p>
      ) : groups.length === 0 ? (
        <EmptyState icon="📋" title="Nothing here yet" subtitle="Entries will show up as parties move through the waitlist." />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.label} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{group.label}</h2>
              <ul className="flex flex-col gap-2">
                {group.parties.map((party) => {
                  const badge = statusBadge[party.status]
                  return (
                    <li
                      key={party.id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{party.name}</span>
                          {party.source === 'call-ahead' && <Badge tone="purple">📞 Call-ahead</Badge>}
                          <Badge tone="neutral">
                            {party.partySize} {party.partySize === 1 ? 'guest' : 'guests'}
                          </Badge>
                          <Badge tone={badge.tone}>{badge.label}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                          Added {formatClockTime(party.createdAt)}
                          {party.status === 'seated' && party.seatedAt && ` · Seated ${formatClockTime(party.seatedAt)}`}
                          {party.phone && ` · ${party.phone}`}
                        </p>
                        {party.notes && (
                          <p className="mt-0.5 text-sm italic text-slate-500 dark:text-slate-400">{party.notes}</p>
                        )}
                      </div>
                      {(party.status === 'no-show' || party.status === 'cancelled') && (
                        <button
                          type="button"
                          onClick={() => recallParty(party.id)}
                          className="shrink-0 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:self-center dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Back to waitlist
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
