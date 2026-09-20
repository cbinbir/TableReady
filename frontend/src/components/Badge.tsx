import type { ReactNode } from 'react'

type BadgeTone = 'neutral' | 'purple' | 'green' | 'red' | 'amber' | 'gray'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200',
  purple: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  red: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  gray: 'bg-gray-200 text-gray-600 dark:bg-gray-600/30 dark:text-gray-300',
}

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
