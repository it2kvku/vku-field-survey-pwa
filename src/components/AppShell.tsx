import type { ReactNode } from 'react'
import { GridBackground } from './GridBackground'
import type { InstallPromptEvent } from './InstallButton'
import { MobileBottomNav } from './MobileBottomNav'
import { OfflineBanner } from './OfflineBanner'
import { TopBar } from './TopBar'
import type { View } from '../hooks/useFieldSurvey'
import type { ConnectionState } from './ConnectionStatus'
import type { Locale } from '../i18n'

export function AppShell({
  view,
  onNavigate,
  connection,
  lastSync,
  locale,
  onLocale,
  installEvent,
  installed,
  onInstallConsumed,
  children
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
  children: ReactNode
}) {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <GridBackground />
      <TopBar
        view={view}
        onNavigate={onNavigate}
        connection={connection}
        lastSync={lastSync}
        locale={locale}
        onLocale={onLocale}
        installEvent={installEvent}
        installed={installed}
        onInstallConsumed={onInstallConsumed}
      />
      <OfflineBanner visible={connection === 'offline'} locale={locale} />
      <main className="mx-auto w-full max-w-5xl px-3 pb-28 pt-5 sm:px-4 md:pb-12">{children}</main>
      <MobileBottomNav view={view} onNavigate={onNavigate} locale={locale} />
    </div>
  )
}
