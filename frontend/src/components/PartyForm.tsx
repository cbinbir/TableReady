import { useState } from 'react'
import type { FormEvent } from 'react'
import type { NewPartyInput, Party, PartySource } from '../api/types'
import { Modal } from './Modal'

interface PartyFormProps {
  title: string
  submitLabel: string
  initial?: Party
  onSubmit: (input: NewPartyInput) => Promise<void>
  onClose: () => void
}

export function PartyForm({ title, submitLabel, initial, onSubmit, onClose }: PartyFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [partySize, setPartySize] = useState(initial?.partySize ?? 2)
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [source, setSource] = useState<PartySource>(initial?.source ?? 'walk-in')
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState(initial?.estimatedWaitMinutes ?? 15)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (partySize < 1) {
      setError('Party size must be at least 1.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        partySize,
        phone: phone.trim(),
        notes: notes.trim(),
        source,
        estimatedWaitMinutes,
      })
      onClose()
    } catch {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          {(['walk-in', 'call-ahead'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSource(opt)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                source === opt
                  ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                  : 'border-slate-200 text-slate-500 dark:border-slate-600 dark:text-slate-400'
              }`}
            >
              {opt === 'walk-in' ? 'Walk-in' : 'Call-ahead'}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          Name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Party name"
            className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            Party size
            <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-600">
              <button
                type="button"
                onClick={() => setPartySize((n) => Math.max(1, n - 1))}
                className="px-3 py-2 text-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                aria-label="Decrease party size"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={partySize}
                onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))}
                className="w-full border-0 bg-transparent py-2 text-center text-base text-slate-900 outline-none dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setPartySize((n) => n + 1)}
                className="px-3 py-2 text-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                aria-label="Increase party size"
              >
                +
              </button>
            </div>
          </label>

          <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            Est. wait (min)
            <input
              type="number"
              min={0}
              step={5}
              value={estimatedWaitMinutes}
              onChange={(e) => setEstimatedWaitMinutes(Math.max(0, Number(e.target.value) || 0))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          Phone
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="555-0100"
            className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="High chair, booth preference, allergies..."
            rows={2}
            className="resize-none rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>

        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-lg bg-violet-600 py-2.5 text-base font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </form>
    </Modal>
  )
}
