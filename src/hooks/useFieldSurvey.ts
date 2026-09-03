import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchLocale, saveLocale } from '../api/preferences'
import { deleteRemoteSurvey, fetchRemoteSurveys, syncSurvey } from '../api/sync'
import { draftFromRecord, emptyDraft, type InspectionDraft } from '../components/InspectionForm'
import { cacheLocale, readCachedLocale } from '../lib/device'
import { compressPhoto } from '../lib/photo'
import {
  enqueuePending,
  mergeSnapshotAndPending,
  readPending,
  readSnapshot,
  writePending,
  writeSnapshot
} from '../lib/pendingStore'
import { t, type Locale } from '../i18n'
import type { SurveyRecord } from '../types'
import { isStandaloneDisplay } from '../lib/pwa'
import { formatDate, generateId, getGpsFix, isOnline, updateAppBadge } from '../utils'

export type View = 'home' | 'inspect' | 'records'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useFieldSurvey() {
  const [view, setView] = useState<View>('home')
  const [records, setRecords] = useState<SurveyRecord[]>([])
  const [online, setOnline] = useState(isOnline())
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() => isStandaloneDisplay())
  const [notifyEnabled, setNotifyEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  )
  const [draft, setDraft] = useState<InspectionDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [gpsKind, setGpsKind] = useState<'idle' | 'locating' | 'ok' | 'fail'>('idle')
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [locale, setLocaleState] = useState<Locale>(() => readCachedLocale() ?? 'vi')

  const counts = useMemo(() => {
    return {
      total: records.length,
      queued: records.filter((r) => r.status === 'queued').length,
      synced: records.filter((r) => r.status === 'synced').length
    }
  }, [records])

  const connection = syncing ? 'syncing' : online ? 'online' : 'offline'
  const gpsStatus =
    gpsKind === 'locating'
      ? t(locale, 'locating')
      : gpsKind === 'fail'
        ? t(locale, 'gpsFail')
        : gpsKind === 'ok'
          ? draft.gps
            ? `GPS: ${draft.gps.lat.toFixed(5)}, ${draft.gps.lng.toFixed(5)}`
            : t(locale, 'gpsIdle')
          : t(locale, 'gpsIdle')

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  const refresh = useCallback(async () => {
    const pending = readPending()
    let snapshot = readSnapshot()
    if (isOnline()) {
      const remote = await fetchRemoteSurveys()
      snapshot = remote
      writeSnapshot(remote)
    }
    const merged = mergeSnapshotAndPending(snapshot, pending)
    setRecords(merged)
    await updateAppBadge(merged.filter((r) => r.status === 'queued').length)
  }, [])

  const registerBackgroundSync = useCallback(async () => {
    const reg = await navigator.serviceWorker?.ready
    const syncManager = (
      reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }
    )?.sync
    if (syncManager) {
      try {
        await syncManager.register('sync-surveys')
      } catch {
        /* optional */
      }
    }
  }, [])

  const notifyQueued = useCallback(
    async (facility: string) => {
      if (!notifyEnabled || !navigator.serviceWorker) return
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(t(locale, 'toastSavedLocal'), {
        body: `${facility} — ${t(locale, 'toastWillSync')}`,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: 'vku-queued'
      })
    },
    [locale, notifyEnabled]
  )

  const flushQueue = useCallback(async () => {
    const pending = readPending()
    const upserts = pending.filter((op) => op.type === 'upsert')
    const deletes = pending.filter((op) => op.type === 'delete')
    if (!pending.length) {
      showToast(t(locale, 'toastQueueEmpty'))
      return
    }
    if (!isOnline()) {
      showToast(t(locale, 'toastStillOffline'))
      return
    }

    setSyncing(true)
    showToast(t(locale, 'toastSyncing', { n: upserts.length || pending.length }))

    const remaining = [...pending]
    let synced = 0
    let failed = 0

    for (const op of upserts) {
      if (op.type !== 'upsert') continue
      if (await syncSurvey(op.record)) {
        synced++
        const idx = remaining.findIndex(
          (item) => item.type === 'upsert' && item.record.id === op.record.id
        )
        if (idx >= 0) remaining.splice(idx, 1)
      } else failed++
    }

    for (const op of deletes) {
      if (op.type !== 'delete') continue
      if (await deleteRemoteSurvey(op.id)) {
        const idx = remaining.findIndex((item) => item.type === 'delete' && item.id === op.id)
        if (idx >= 0) remaining.splice(idx, 1)
      } else failed++
    }

    writePending(remaining)
    setSyncing(false)
    setLastSync(formatDate(new Date().toISOString(), locale))
    if (failed === 0) showToast(t(locale, 'toastAllSynced'))
    else showToast(t(locale, 'toastPartial', { synced, failed }))
    await refresh()
  }, [locale, refresh, showToast])

  const persistRecord = useCallback(
    async (record: SurveyRecord) => {
      enqueuePending({ type: 'upsert', record })
      const currentlyOnline = isOnline()
      if (currentlyOnline && (await syncSurvey(record))) {
        writePending(readPending().filter((op) => !(op.type === 'upsert' && op.record.id === record.id)))
        setLastSync(formatDate(record.updatedAt, locale))
        showToast(t(locale, 'toastAllSynced'))
      } else if (currentlyOnline) {
        await registerBackgroundSync()
        showToast(t(locale, 'toastD1Failed'))
      } else {
        await registerBackgroundSync()
        await notifyQueued(record.facilityName)
        showToast(t(locale, 'toastSavedLocal'))
        window.setTimeout(() => showToast(t(locale, 'toastWillSync')), 1400)
      }
      await refresh()
    },
    [locale, notifyQueued, refresh, registerBackgroundSync, showToast]
  )

  const submitDraft = useCallback(async () => {
    setSubmitting(true)
    let gps = draft.gps
    if (!gps) {
      setGpsKind('locating')
      setLocating(true)
      gps = await getGpsFix()
      setLocating(false)
      setGpsKind(gps ? 'ok' : 'fail')
      if (gps) setDraft((current) => ({ ...current, gps }))
    }

    const now = new Date().toISOString()
    const existing = editingId ? records.find((r) => r.id === editingId) : undefined
    const record: SurveyRecord = {
      id: existing?.id ?? generateId(),
      facilityName: draft.facilityName.trim(),
      building: draft.building,
      inspectorName: draft.inspectorName.trim(),
      inspectionDate: draft.inspectionDate,
      condition: draft.condition,
      category: draft.category,
      notes: draft.notes.trim(),
      photoDataUrl: draft.photoDataUrl,
      gpsLat: gps?.lat,
      gpsLng: gps?.lng,
      status: 'queued',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    }

    await persistRecord(record)
    setDraft(emptyDraft())
    setEditingId(null)
    setGpsKind('idle')
    setView('records')
    setSubmitting(false)
  }, [draft, editingId, persistRecord, records])

  const removeRecord = useCallback(
    async (id: string) => {
      enqueuePending({ type: 'delete', id })
      if (isOnline()) {
        const ok = await deleteRemoteSurvey(id)
        if (ok) {
          writePending(readPending().filter((op) => !(op.type === 'delete' && op.id === id)))
        }
      } else {
        await registerBackgroundSync()
      }
      showToast(t(locale, 'toastDeleted'))
      await refresh()
    },
    [locale, refresh, registerBackgroundSync, showToast]
  )

  const startEdit = useCallback((record: SurveyRecord) => {
    setDraft(draftFromRecord(record))
    setEditingId(record.id)
    setGpsKind(record.gpsLat != null ? 'ok' : 'idle')
    setView('inspect')
  }, [])

  const duplicateRecord = useCallback(
    async (source: SurveyRecord) => {
      const now = new Date().toISOString()
      await persistRecord({
        ...source,
        id: generateId(),
        status: 'queued',
        createdAt: now,
        updatedAt: now
      })
    },
    [persistRecord]
  )

  const captureGps = useCallback(async () => {
    setLocating(true)
    setGpsKind('locating')
    const gps = await getGpsFix()
    setLocating(false)
    if (gps) {
      setDraft((current) => ({ ...current, gps }))
      setGpsKind('ok')
    } else {
      setGpsKind('fail')
    }
  }, [])

  const onPhotoFile = useCallback(async (file: File) => {
    const photoDataUrl = await compressPhoto(file)
    setDraft((current) => ({ ...current, photoDataUrl }))
  }, [])

  const requestNotify = useCallback(async () => {
    if (!('Notification' in window)) {
      showToast(t(locale, 'toastNotifyUnsupported'))
      return
    }
    const permission = await Notification.requestPermission()
    setNotifyEnabled(permission === 'granted')
    showToast(t(locale, permission === 'granted' ? 'toastNotifyOn' : 'toastNotifyOff'))
  }, [locale, showToast])

  const consumeInstallEvent = useCallback(() => {
    setInstallEvent(null)
  }, [])

  const setLocale = useCallback(
    async (next: Locale) => {
      setLocaleState(next)
      cacheLocale(next)
      document.documentElement.lang = next === 'vi' ? 'vi' : 'en'
      document.title = t(next, 'appName')
      await saveLocale(next)
    },
    []
  )

  useEffect(() => {
    const boot = async () => {
      const remoteLocale = await fetchLocale()
      if (remoteLocale) {
        setLocaleState(remoteLocale)
        cacheLocale(remoteLocale)
        document.documentElement.lang = remoteLocale === 'vi' ? 'vi' : 'en'
        document.title = t(remoteLocale, 'appName')
      } else {
        document.documentElement.lang = locale === 'vi' ? 'vi' : 'en'
        document.title = t(locale, 'appName')
        if (isOnline()) await saveLocale(locale)
      }
      await refresh()
    }
    void boot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  useEffect(() => {
    const onOnline = () => {
      setOnline(true)
      showToast(t(locale, 'toastBackOnline'))
      void saveLocale(locale)
      void flushQueue()
    }
    const onOffline = () => {
      setOnline(false)
      showToast(t(locale, 'toastOfflineMode'))
    }
    const onInstall = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    const onAppInstalled = () => {
      setInstalled(true)
      setInstallEvent(null)
      showToast(t(locale, 'appInstalled'))
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('beforeinstallprompt', onInstall)
    window.addEventListener('appinstalled', onAppInstalled)

    const onMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === 'SYNC_SURVEYS') void flushQueue()
    }
    navigator.serviceWorker?.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('beforeinstallprompt', onInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
      navigator.serviceWorker?.removeEventListener('message', onMessage)
    }
  }, [flushQueue, locale, showToast])

  const newInspection = useCallback(() => {
    setEditingId(null)
    setDraft(emptyDraft())
    setGpsKind('idle')
    setView('inspect')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const navigate = useCallback((next: View) => {
    if (next !== 'inspect') {
      setEditingId(null)
      setDraft(emptyDraft())
      setGpsKind('idle')
    }
    setView(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return {
    view,
    navigate,
    newInspection,
    records,
    counts,
    online,
    connection: connection as 'online' | 'syncing' | 'offline',
    lastSync,
    toast,
    installEvent,
    installed,
    consumeInstallEvent,
    notifyEnabled,
    draft,
    setDraft,
    editingId,
    gpsStatus,
    locating,
    submitting,
    locale,
    setLocale,
    flushQueue,
    submitDraft,
    removeRecord,
    startEdit,
    duplicateRecord,
    captureGps,
    onPhotoFile,
    requestNotify
  }
}
