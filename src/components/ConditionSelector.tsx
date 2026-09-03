import { AlertTriangle, CheckCircle2, MinusCircle, Skull } from 'lucide-react'
import { cn } from '../lib/cn'
import type { SurveyRecord } from '../types'
import { t, type Locale } from '../i18n'

export function ConditionSelector({
  value,
  onChange,
  locale
}: {
  value: SurveyRecord['condition']
  onChange: (value: SurveyRecord['condition']) => void
  locale: Locale
}) {
  const options: {
    value: SurveyRecord['condition']
    label: ReturnType<typeof t>
    description: ReturnType<typeof t>
    icon: typeof CheckCircle2
  }[] = [
    { value: 'good', label: t(locale, 'condGood'), description: t(locale, 'condGoodHint'), icon: CheckCircle2 },
    { value: 'fair', label: t(locale, 'condFair'), description: t(locale, 'condFairHint'), icon: MinusCircle },
    { value: 'poor', label: t(locale, 'condPoor'), description: t(locale, 'condPoorHint'), icon: AlertTriangle },
    {
      value: 'critical',
      label: t(locale, 'condCritical'),
      description: t(locale, 'condCriticalHint'),
      icon: Skull
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={t(locale, 'sectionCondition')}>
      {options.map((option) => {
        const Icon = option.icon
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex min-h-[88px] flex-col items-start gap-1 rounded-[12px] border px-3 py-3 text-left',
              selected
                ? 'border-navy-700 bg-navy-50 text-navy-900'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-semibold">{option.label}</span>
            <span className="text-[11px] text-slate-500">{option.description}</span>
          </button>
        )
      })}
    </div>
  )
}
