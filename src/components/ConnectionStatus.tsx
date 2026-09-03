import { t } from '../i18n'
import { cn } from '../lib/cn'
import type { Locale } from '../i18n'

export type ConnectionState = 'online' | 'syncing' | 'offline'

export function ConnectionStatus({
  state,
  lastSync,
  locale
}: {
  state: ConnectionState
  lastSync?: string | null
  locale: Locale
}) {
  const label =
    state === 'online' ? t(locale, 'online') : state === 'syncing' ? t(locale, 'syncing') : t(locale, 'offline')
  const color =
    state === 'online' ? 'bg-emerald-500' : state === 'syncing' ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2 text-right">
      <span
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold tracking-wide text-slate-700 sm:gap-2 sm:px-2.5"
        title={label}
        aria-label={label}
      >
        <span
          className={cn('h-2 w-2 shrink-0 rounded-full', color, state !== 'offline' && 'animate-pulse-dot')}
          aria-hidden
        />
        <span className="hidden sm:inline">{label}</span>
      </span>
      {lastSync ? (
        <span className="hidden font-mono text-[10px] text-slate-500 xl:block">
          {t(locale, 'lastSync')} {lastSync}
        </span>
      ) : null}
    </div>
  )
}
