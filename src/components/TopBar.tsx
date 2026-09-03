import { ClipboardList } from 'lucide-react'
import type { View } from '../hooks/useFieldSurvey'
import { ConnectionStatus, type ConnectionState } from './ConnectionStatus'
import { InstallButton, type InstallPromptEvent } from './InstallButton'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '../lib/cn'
import { t, type Locale } from '../i18n'

export function TopBar({
  view,
  onNavigate,
  connection,
  lastSync,
  locale,
  onLocale,
  installEvent,
  installed,
  onInstallConsumed
}: {
  view: View
  onNavigate: (view: View) => void
  connection: ConnectionState
  lastSync?: string | null
  locale: Locale
  onLocale: (locale: Locale) => void
  installEvent: InstallPromptEvent | null
  installed: boolean
  onInstallConsumed: () => void
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-3 py-2 sm:px-4 md:h-14 md:flex-row md:items-center md:justify-between md:gap-3 md:py-0">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-white">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-slate-900">{t(locale, 'appName')}</p>
            <p className="hidden font-mono text-[10px] uppercase tracking-wide text-slate-500 sm:block">
              {t(locale, 'campusOs')}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {(
              [
                ['home', 'navHome'],
                ['inspect', 'navInspect'],
                ['records', 'navRecords']
              ] as const
            ).map(([id, key]) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={cn(
                  'min-h-11 rounded-[10px] px-3 text-sm font-medium',
                  view === id ? 'bg-slate-100 text-navy-800' : 'text-slate-600 hover:bg-slate-50'
                )}
                aria-current={view === id ? 'page' : undefined}
              >
                {t(locale, key)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher locale={locale} onChange={onLocale} />
            <ConnectionStatus state={connection} lastSync={lastSync} locale={locale} />
            <InstallButton
              locale={locale}
              promptEvent={installEvent}
              onPromptUsed={onInstallConsumed}
              installed={installed}
              appearance="icon"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
