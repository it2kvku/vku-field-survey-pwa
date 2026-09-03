import { t, type Locale } from '../i18n'
import { cn } from '../lib/cn'

export function LanguageSwitcher({
  locale,
  onChange
}: {
  locale: Locale
  onChange: (locale: Locale) => void
}) {
  return (
    <div
      role="group"
      aria-label={t(locale, 'language')}
      className="inline-flex rounded-md border border-slate-200 bg-white p-0.5"
    >
      {(['en', 'vi'] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => onChange(code)}
          className={cn(
            'min-h-8 min-w-8 rounded px-1.5 font-mono text-[11px] font-semibold sm:min-h-9 sm:min-w-10 sm:px-2',
            locale === code ? 'bg-navy-800 text-white' : 'text-slate-500 hover:bg-slate-50'
          )}
        >
          {t(locale, code === 'en' ? 'langEn' : 'langVi')}
        </button>
      ))}
    </div>
  )
}
