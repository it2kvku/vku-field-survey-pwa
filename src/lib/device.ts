const DEVICE_KEY = 'vku-device-id'
const LOCALE_KEY = 'vku-locale'

export function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) return existing
  const id = `dev-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
  localStorage.setItem(DEVICE_KEY, id)
  return id
}

export function readCachedLocale(): 'en' | 'vi' | null {
  const value = localStorage.getItem(LOCALE_KEY)
  return value === 'en' || value === 'vi' ? value : null
}

export function cacheLocale(locale: 'en' | 'vi') {
  localStorage.setItem(LOCALE_KEY, locale)
}
