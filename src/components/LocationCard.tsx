import { MapPin } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import type { GpsFix } from '../utils'
import { t, type Locale } from '../i18n'

export function LocationCard({
  status,
  fix,
  onCapture,
  locating,
  locale
}: {
  status: string
  fix: GpsFix | null
  locating: boolean
  onCapture: () => void
  locale: Locale
}) {
  return (
    <Card className="p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 shrink-0 text-navy-700" />
            {t(locale, 'location')}
          </p>
          <p className="mt-1 break-words text-xs text-slate-500">{status}</p>
          {fix ? (
            <p className="mt-2 break-all font-mono text-xs text-slate-700">
              {fix.lat.toFixed(5)}, {fix.lng.toFixed(5)}
              {fix.accuracy != null ? ` · ±${Math.round(fix.accuracy)} m` : ''}
            </p>
          ) : (
            <p className="mt-2 font-mono text-xs text-slate-400">{t(locale, 'noCoordinates')}</p>
          )}
        </div>
        <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={onCapture} disabled={locating}>
          {locating ? t(locale, 'locating') : t(locale, 'capture')}
        </Button>
      </div>
    </Card>
  )
}
