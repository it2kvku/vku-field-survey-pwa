import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

export function SectionHeader({
  index,
  title,
  hint
}: {
  index: string
  title: string
  hint?: string
}) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <span className="font-mono text-[11px] font-semibold text-navy-700">{index}</span>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  className
}: {
  label: string
  value: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('rounded-[12px] border border-slate-200 bg-white p-4 shadow-card', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

export function QuickAction({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-45"
      {...props}
    >
      {children}
    </button>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action
}: {
  icon: ReactNode
  title: string
  body: string
  action: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-[12px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mb-3 text-navy-700">{icon}</div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{body}</p>
      <div className="mt-5">{action}</div>
    </div>
  )
}

export function SyncStatus({ message }: { message: string | null }) {
  if (!message) return null
  return <p className="text-xs font-medium text-slate-500">{message}</p>
}
