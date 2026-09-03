export function generateId(): string {
  return `survey-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function formatDate(iso: string, locale: 'en' | 'vi' = 'vi'): string {
  return new Date(iso).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const VI_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

export function formatToday(locale: 'en' | 'vi'): string {
  const now = new Date()
  if (locale === 'vi') {
    return `${VI_WEEKDAYS[now.getDay()]}, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`
  }
  return now
    .toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    .toUpperCase()
}

export interface GpsFix {
  lat: number
  lng: number
  accuracy?: number
}

export async function getGpsFix(): Promise<GpsFix | null> {
  if (!('geolocation' in navigator)) return null

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  })
}

export async function getGpsPosition(): Promise<{ lat: number; lng: number } | null> {
  const fix = await getGpsFix()
  return fix ? { lat: fix.lat, lng: fix.lng } : null
}

export function isOnline(): boolean {
  return navigator.onLine
}

export async function updateAppBadge(count: number): Promise<void> {
  if ('setAppBadge' in navigator) {
    try {
      if (count > 0) await navigator.setAppBadge(count)
      else await navigator.clearAppBadge()
    } catch {
      // Badging API not supported or denied
    }
  }
}
