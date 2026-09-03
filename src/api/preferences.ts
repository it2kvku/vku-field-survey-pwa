import type { Locale } from '../i18n'
import { getDeviceId } from '../lib/device'

export async function fetchLocale(): Promise<Locale | null> {
  if (!navigator.onLine) return null
  try {
    const response = await fetch(`/api/preferences?deviceId=${encodeURIComponent(getDeviceId())}`, {
      cache: 'no-store'
    })
    if (!response.ok) return null
    const data = (await response.json()) as { locale?: string }
    return data.locale === 'vi' || data.locale === 'en' ? data.locale : null
  } catch {
    return null
  }
}

export async function saveLocale(locale: Locale): Promise<boolean> {
  if (!navigator.onLine) return false
  try {
    const response = await fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId(), locale })
    })
    return response.ok
  } catch {
    return false
  }
}
