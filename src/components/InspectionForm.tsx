import { useMemo, useState } from 'react'
import { FACILITY_BUILDINGS, type SurveyRecord } from '../types'
import { ConditionSelector } from './ConditionSelector'
import { LocationCard } from './LocationCard'
import { PhotoUploader } from './PhotoUploader'
import { SectionHeader } from './primitives'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import type { GpsFix } from '../utils'
import { buildingLabel, categoryLabel, t, type Locale } from '../i18n'

export interface InspectionDraft {
  inspectorName: string
  facilityName: string
  building: string
  inspectionDate: string
  category: SurveyRecord['category']
  condition: SurveyRecord['condition']
  notes: string
  photoDataUrl?: string
  gps: GpsFix | null
}

export function emptyDraft(): InspectionDraft {
  return {
    inspectorName: '',
    facilityName: '',
    building: FACILITY_BUILDINGS[0],
    inspectionDate: new Date().toISOString().slice(0, 10),
    category: 'classroom',
    condition: 'good',
    notes: '',
    photoDataUrl: undefined,
    gps: null
  }
}

export function draftFromRecord(record: SurveyRecord): InspectionDraft {
  return {
    inspectorName: record.inspectorName,
    facilityName: record.facilityName,
    building: record.building,
    inspectionDate: record.inspectionDate,
    category: record.category,
    condition: record.condition,
    notes: record.notes,
    photoDataUrl: record.photoDataUrl,
    gps:
      record.gpsLat != null && record.gpsLng != null
        ? { lat: record.gpsLat, lng: record.gpsLng }
        : null
  }
}

export function InspectionForm({
  draft,
  onChange,
  onCaptureGps,
  locating,
  gpsStatus,
  onPhotoFile,
  onRemovePhoto,
  onSubmit,
  submitting,
  editing,
  locale
}: {
  draft: InspectionDraft
  onChange: (patch: Partial<InspectionDraft>) => void
  onCaptureGps: () => void
  locating: boolean
  gpsStatus: string
  onPhotoFile: (file: File) => void
  onRemovePhoto: () => void
  onSubmit: () => void
  submitting: boolean
  editing: boolean
  locale: Locale
}) {
  const [buildingQuery, setBuildingQuery] = useState('')
  const buildings = useMemo(() => {
    const q = buildingQuery.trim().toLowerCase()
    if (!q) return [...FACILITY_BUILDINGS]
    return FACILITY_BUILDINGS.filter((item) => {
      const label = buildingLabel(locale, item).toLowerCase()
      return item.toLowerCase().includes(q) || label.includes(q)
    })
  }, [buildingQuery, locale])

  return (
    <form
      className="space-y-6 pb-24"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <section>
        <SectionHeader index="01" title={t(locale, 'sectionFacility')} hint={t(locale, 'sectionFacilityHint')} />
        <div className="space-y-3 rounded-[12px] border border-slate-200 bg-white p-4 shadow-card">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="inspectorName">{t(locale, 'inspector')}</Label>
              <Input
                id="inspectorName"
                required
                maxLength={80}
                autoComplete="name"
                value={draft.inspectorName}
                onChange={(event) => onChange({ inspectorName: event.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inspectionDate">{t(locale, 'date')}</Label>
              <Input
                id="inspectionDate"
                type="date"
                required
                value={draft.inspectionDate}
                onChange={(event) => onChange({ inspectionDate: event.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="facilityName">{t(locale, 'facility')}</Label>
            <Input
              id="facilityName"
              required
              maxLength={120}
              placeholder={t(locale, 'facilityPlaceholder')}
              value={draft.facilityName}
              onChange={(event) => onChange({ facilityName: event.target.value })}
            />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader index="02" title={t(locale, 'sectionLocation')} hint={t(locale, 'sectionLocationHint')} />
        <div className="space-y-3">
          <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-card">
            <Label htmlFor="buildingSearch">{t(locale, 'building')}</Label>
            <Input
              id="buildingSearch"
              className="mt-1.5"
              placeholder={t(locale, 'searchBuildings')}
              value={buildingQuery}
              onChange={(event) => setBuildingQuery(event.target.value)}
            />
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {buildings.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onChange({ building: item })}
                  className={`min-h-11 w-full min-w-0 rounded-[10px] border px-3 text-left text-sm leading-snug ${
                    draft.building === item
                      ? 'border-navy-700 bg-navy-50 font-semibold text-navy-900'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {buildingLabel(locale, item)}
                </button>
              ))}
            </div>
          </div>
          <LocationCard
            locale={locale}
            status={gpsStatus}
            fix={draft.gps}
            locating={locating}
            onCapture={onCaptureGps}
          />
        </div>
      </section>

      <section>
        <SectionHeader index="03" title={t(locale, 'sectionCondition')} hint={t(locale, 'sectionConditionHint')} />
        <div className="space-y-3 rounded-[12px] border border-slate-200 bg-white p-4 shadow-card">
          <div className="grid gap-1.5">
            <Label htmlFor="category">{t(locale, 'category')}</Label>
            <select
              id="category"
              className="h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
              value={draft.category}
              onChange={(event) =>
                onChange({ category: event.target.value as SurveyRecord['category'] })
              }
            >
              {(['classroom', 'lab', 'restroom', 'electrical', 'plumbing', 'other'] as const).map(
                (key) => (
                  <option key={key} value={key}>
                    {categoryLabel(locale, key)}
                  </option>
                )
              )}
            </select>
          </div>
          <ConditionSelector
            locale={locale}
            value={draft.condition}
            onChange={(condition) => onChange({ condition })}
          />
        </div>
      </section>

      <section>
        <SectionHeader index="04" title={t(locale, 'sectionNotes')} hint={t(locale, 'sectionNotesHint')} />
        <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-card">
          <Textarea
            maxLength={800}
            value={draft.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            placeholder={t(locale, 'notesPlaceholder')}
            aria-label={t(locale, 'notes')}
          />
          <p className="mt-1 text-right font-mono text-[11px] text-slate-400">
            {draft.notes.length}/800
          </p>
        </div>
      </section>

      <section>
        <SectionHeader index="05" title={t(locale, 'sectionEvidence')} hint={t(locale, 'sectionEvidenceHint')} />
        <div className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-card">
          <PhotoUploader
            locale={locale}
            preview={draft.photoDataUrl}
            onFile={onPhotoFile}
            onRemove={onRemovePhoto}
          />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-slate-200 bg-white/95 p-3 pb-[calc(env(safe-area-inset-bottom)+3.5rem)] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:pb-0">
        <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
          {submitting ? t(locale, 'saving') : editing ? t(locale, 'editInspection') : t(locale, 'saveInspection')}
        </Button>
        <p className="mt-2 text-center text-xs text-slate-500 md:text-left">
          {t(locale, 'saveWorksOffline')}
        </p>
      </div>
    </form>
  )
}
