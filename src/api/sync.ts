import type { SurveyRecord, SyncResult } from '../types'

export async function syncSurvey(record: SurveyRecord): Promise<boolean> {
  if (!navigator.onLine) return false

  try {
    const response = await fetch('/api/surveys/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    })
    return response.ok
  } catch {
    return false
  }
}

export async function fetchRemoteSurveys(): Promise<SurveyRecord[]> {
  if (!navigator.onLine) return []

  try {
    const response = await fetch('/api/surveys', { cache: 'no-store' })
    if (!response.ok) return []
    const data = (await response.json()) as { surveys?: SurveyRecord[] }
    return data.surveys ?? []
  } catch {
    return []
  }
}

export async function deleteRemoteSurvey(id: string): Promise<boolean> {
  if (!navigator.onLine) return false

  try {
    const response = await fetch(`/api/surveys/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return response.ok
  } catch {
    return false
  }
}

export async function syncAllQueued(records: SurveyRecord[]): Promise<SyncResult> {
  let synced = 0
  let failed = 0

  for (const record of records) {
    if (await syncSurvey(record)) synced++
    else failed++
  }

  return { synced, failed }
}
