import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NewTableInput } from '../api/types'
import { Modal } from './Modal'

export function AddTableForm({
  onSubmit,
  onClose,
}: {
  onSubmit: (input: NewTableInput) => Promise<void>
  onClose: () => void
}) {
  const [label, setLabel] = useState('')
  const [seats, setSeats] = useState(2)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!label.trim()) {
      setError('Table name is required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ label: label.trim(), seats })
      onClose()
    } catch {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Add table" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          Table name
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="T9 or Patio 3"
            className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          Seats
          <input
            type="number"
            min={1}
            value={seats}
            onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-lg bg-violet-600 py-2.5 text-base font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {submitting ? 'Adding…' : 'Add table'}
        </button>
      </form>
    </Modal>
  )
}
