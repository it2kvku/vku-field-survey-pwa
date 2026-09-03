import { MoreHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import type { SurveyRecord } from '../types'
import { formatDate } from '../utils'
import { buildingLabel, categoryLabel, conditionLabel, statusLabel, t, type Locale } from '../i18n'

export function InspectionCard({
  record,
  index,
  locale,
  onView,
  onEdit,
  onDuplicate,
  onDelete
}: {
  record: SurveyRecord
  index: number
  locale: Locale
  onView: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.28 }}
    >
      <Card className="p-3 sm:p-4">
        <div className="flex gap-3">
          {record.photoDataUrl ? (
            <img
              src={record.photoDataUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg object-cover sm:h-16 sm:w-16"
            />
          ) : (
            <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-100 sm:h-16 sm:w-16" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{record.facilityName}</p>
                <p className="truncate font-mono text-[10px] text-slate-500">{record.id}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-slate-500 hover:bg-slate-50"
                    aria-label={t(locale, 'recordActions')}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={onView}>{t(locale, 'view')}</DropdownMenuItem>
                  <DropdownMenuItem onSelect={onEdit}>{t(locale, 'edit')}</DropdownMenuItem>
                  <DropdownMenuItem onSelect={onDuplicate}>{t(locale, 'duplicate')}</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-700" onSelect={onDelete}>
                    {t(locale, 'delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <Badge tone={record.status}>{statusLabel(locale, record.status)}</Badge>
              <Badge tone={record.condition}>{conditionLabel(locale, record.condition)}</Badge>
            </div>
            <p className="mt-1 truncate text-xs text-slate-600">
              {buildingLabel(locale, record.building)} · {categoryLabel(locale, record.category)}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {record.inspectorName} · {formatDate(record.createdAt, locale)}
            </p>
          </div>
        </div>
      </Card>
    </motion.article>
  )
}
