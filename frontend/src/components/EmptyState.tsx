export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-white/50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-800/30">
      <div className="text-4xl">{icon}</div>
      <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {subtitle && <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  )
}
