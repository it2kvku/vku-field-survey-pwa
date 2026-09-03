import { useMemo, useState } from 'react'
import { ClipboardPlus, FolderOpen } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { FilterBar, type ConditionFilter, type StatusFilter } from '../components/FilterBar'
import { InspectionCard } from '../components/InspectionCard'
import { EmptyState } from '../components/primitives'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'
import type { SurveyRecord } from '../types'
import { formatDate } from '../utils'
import { buildingLabel, categoryLabel, conditionLabel, statusLabel, t } from '../i18n'
import type { useFieldSurvey } from '../hooks/useFieldSurvey'

export function RecordsPage({ survey }: { survey: ReturnType<typeof useFieldSurvey> }) {
  const { locale } = survey
  const [query, setQuery] = useState('')
  const [condition, setCondition] = useState<ConditionFilter>('all')
  const [building, setBuilding] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [viewing, setViewing] = useState<SurveyRecord | null>(null)
  const [pendingDelete, setPendingDelete] = useState<SurveyRecord | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return survey.records.filter((record) => {
      if (condition !== 'all' && record.condition !== condition) return false
      if (building && record.building !== building) return false
      if (category && record.category !== category) return false
      if (status !== 'all' && record.status !== status) return false
      if (!q) return true
      return (
        record.facilityName.toLowerCase().includes(q) ||
        record.inspectorName.toLowerCase().includes(q) ||
        record.id.toLowerCase().includes(q) ||
        record.building.toLowerCase().includes(q) ||
        buildingLabel(locale, record.building).toLowerCase().includes(q)
      )
    })
  }, [building, category, condition, locale, query, status, survey.records])

  if (!survey.records.length) {
    return (
      <EmptyState
        icon={<FolderOpen className="h-8 w-8" />}
        title={t(locale, 'emptyTitle')}
        body={t(locale, 'emptyBody')}
        action={
          <Button onClick={() => survey.newInspection()}>
            <ClipboardPlus className="h-4 w-4" />
            {t(locale, 'newInspection')}
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t(locale, 'records')}</h1>
          <p className="text-sm text-slate-500">
            {t(locale, 'recordsCount', { filtered: filtered.length, total: survey.records.length })}
          </p>
        </div>
      </div>

      <FilterBar
        query={query}
        condition={condition}
        building={building}
        category={category}
        status={status}
        locale={locale}
        onQuery={setQuery}
        onCondition={setCondition}
        onBuilding={setBuilding}
        onCategory={setCategory}
        onStatus={setStatus}
      />

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">{t(locale, 'noFilterMatch')}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((record, index) => (
            <InspectionCard
              key={record.id}
              record={record}
              index={index}
              locale={locale}
              onView={() => setViewing(record)}
              onEdit={() => survey.startEdit(record)}
              onDuplicate={() => void survey.duplicateRecord(record)}
              onDelete={() => setPendingDelete(record)}
            />
          ))}
        </div>
      )}

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        {viewing ? (
          <DialogContent title={viewing.facilityName}>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-mono text-[11px] text-slate-400">{viewing.id}</p>
              <p>
                <Badge tone={viewing.status}>{statusLabel(locale, viewing.status)}</Badge>{' '}
                <Badge tone={viewing.condition}>{conditionLabel(locale, viewing.condition)}</Badge>
              </p>
              <p>
                {buildingLabel(locale, viewing.building)} · {categoryLabel(locale, viewing.category)}
              </p>
              <p>
                {viewing.inspectorName} · {viewing.inspectionDate}
              </p>
              <p>{formatDate(viewing.createdAt, locale)}</p>
              {viewing.notes ? <p>{viewing.notes}</p> : null}
              {viewing.gpsLat != null ? (
                <p className="font-mono text-xs">
                  {viewing.gpsLat.toFixed(5)}, {viewing.gpsLng?.toFixed(5)}
                </p>
              ) : null}
              {viewing.photoDataUrl ? (
                <img src={viewing.photoDataUrl} alt="" className="mt-2 max-h-48 w-full rounded-lg object-cover" />
              ) : null}
            </div>
          </DialogContent>
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t(locale, 'deleteTitle')}
        body={t(locale, 'deleteBody')}
        confirmLabel={t(locale, 'delete')}
        cancelLabel={t(locale, 'cancel')}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void survey.removeRecord(pendingDelete.id)
        }}
      />
    </div>
  )
}
