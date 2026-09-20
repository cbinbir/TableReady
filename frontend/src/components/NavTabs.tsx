import { useParties } from '../state/PartiesContext'

export type Tab = 'waitlist' | 'tables' | 'history'

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'waitlist', label: 'Waitlist', icon: '⏱️' },
  { id: 'tables', label: 'Tables', icon: '🍽️' },
  { id: 'history', label: 'History', icon: '📋' },
]

export function NavTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const { waiting } = useParties()

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-1 px-2 sm:px-4">
        <span className="mr-2 hidden shrink-0 text-lg font-bold text-violet-600 sm:inline dark:text-violet-400">
          TableReady
        </span>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-3 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
              active === tab.id
                ? 'border-violet-600 text-violet-700 dark:text-violet-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span aria-hidden>{tab.icon}</span>
            {tab.label}
            {tab.id === 'waitlist' && waiting.length > 0 && (
              <span className="ml-0.5 rounded-full bg-violet-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                {waiting.length}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
