import { FACILITY_BUILDINGS, type SurveyRecord } from '../types'
import { Input } from './ui/input'
import { cn } from '../lib/cn'
import { buildingLabel, categoryLabel, t, type Locale } from '../i18n'

export type ConditionFilter = 'all' | SurveyRecord['condition']
export type StatusFilter = 'all' | SurveyRecord['status']

export function FilterBar({
  query,
  condition,
  building,
  category,
  status,
  locale,
  onQuery,
  onCondition,
  onBuilding,
  onCategory,
  onStatus
}: {
  query: string
  condition: ConditionFilter
  building: string
  category: string
  status: StatusFilter
  locale: Locale
  onQuery: (value: string) => void
  onCondition: (value: ConditionFilter) => void
  onBuilding: (value: string) => void
  onCategory: (value: string) => void
  onStatus: (value: StatusFilter) => void
}) {
  const conditions: ConditionFilter[] = ['all', 'good', 'fair', 'poor', 'critical']

  return (
    <div className="space-y-3">
      <Input
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder={t(locale, 'searchRecords')}
        aria-label={t(locale, 'searchRecords')}
      />
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {conditions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onCondition(item)}
            className={cn(
              'min-h-10 shrink-0 rounded-md border px-3 text-xs font-semibold',
              condition === item
                ? 'border-navy-700 bg-navy-800 text-white'
                : 'border-slate-200 bg-white text-slate-600'
            )}
          >
            {item === 'all'
              ? t(locale, 'all')
              : item === 'good'
                ? t(locale, 'condGood')
                : item === 'fair'
                  ? t(locale, 'condFair')
                  : item === 'poor'
                    ? t(locale, 'condPoor')
                    : t(locale, 'condCritical')}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <select
          aria-label={t(locale, 'building')}
          className="h-11 w-full min-w-0 rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
          value={building}
          onChange={(event) => onBuilding(event.target.value)}
        >
          <option value="">{t(locale, 'allBuildings')}</option>
          {FACILITY_BUILDINGS.map((item) => (
            <option key={item} value={item}>
              {buildingLabel(locale, item)}
            </option>
          ))}
        </select>
        <select
          aria-label={t(locale, 'category')}
          className="h-11 w-full min-w-0 rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
          value={category}
          onChange={(event) => onCategory(event.target.value)}
        >
          <option value="">{t(locale, 'allCategories')}</option>
          {(['classroom', 'lab', 'restroom', 'electrical', 'plumbing', 'other'] as const).map((key) => (
            <option key={key} value={key}>
              {categoryLabel(locale, key)}
            </option>
          ))}
        </select>
        <select
          aria-label={t(locale, 'synced')}
          className="h-11 w-full min-w-0 rounded-[10px] border border-slate-200 bg-white px-3 text-sm"
          value={status}
          onChange={(event) => onStatus(event.target.value as StatusFilter)}
        >
          <option value="all">{t(locale, 'allSync')}</option>
          <option value="queued">{t(locale, 'queued')}</option>
          <option value="synced">{t(locale, 'synced')}</option>
        </select>
      </div>
    </div>
  )
}
