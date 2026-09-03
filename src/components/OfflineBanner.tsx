import { WifiOff } from 'lucide-react'
import { t, type Locale } from '../i18n'

export function OfflineBanner({ visible, locale }: { visible: boolean; locale: Locale }) {
  if (!visible) return null
  return (
    <div
      role="status"
      className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-3 py-2 text-[13px] leading-snug text-amber-900 sm:px-4"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      {t(locale, 'offlineBanner')}
    </div>
  )
}
