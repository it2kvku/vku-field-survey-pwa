import { Home, ClipboardPlus, Files } from 'lucide-react'
import { cn } from '../lib/cn'
import type { View } from '../hooks/useFieldSurvey'
import { t, type Locale } from '../i18n'

export function MobileBottomNav({
  view,
  onNavigate,
  locale
}: {
  view: View
  onNavigate: (view: View) => void
  locale: Locale
}) {
  const items: { id: View; key: 'navHome' | 'navInspect' | 'navRecords'; icon: typeof Home }[] = [
    { id: 'home', key: 'navHome', icon: Home },
    { id: 'inspect', key: 'navInspect', icon: ClipboardPlus },
    { id: 'records', key: 'navRecords', icon: Files }
  ]

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex min-h-14 w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold',
                  active ? 'text-navy-800' : 'text-slate-500'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                {t(locale, item.key)}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
