import * as Collapsible from '@radix-ui/react-collapsible'
import { Bell, ChevronDown, Plus } from 'lucide-react'
import { NumberTicker } from '../components/NumberTicker'
import { QuickAction, StatCard } from '../components/primitives'
import { Button } from '../components/ui/button'
import { InstallButton } from '../components/InstallButton'
import { t } from '../i18n'
import { formatToday } from '../utils'
import type { useFieldSurvey } from '../hooks/useFieldSurvey'

export function HomePage({
  survey
}: {
  survey: ReturnType<typeof useFieldSurvey>
}) {
  const { locale } = survey
  const today = formatToday(locale)
  const queued = survey.counts.queued
  const status =
    survey.connection === 'offline'
      ? t(locale, 'statusOffline')
      : queued
        ? t(locale, 'statusQueued', { n: queued })
        : t(locale, 'statusClear')

  return (
    <div className="space-y-6">
      <section>
        <p
          className={`font-mono text-[11px] font-semibold tracking-wide text-navy-700 ${
            locale === 'en' ? 'uppercase' : ''
          }`}
        >
          {today}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {t(locale, 'campusInspection')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{status}</p>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label={t(locale, 'total')} value={<NumberTicker value={survey.counts.total} />} />
        <StatCard label={t(locale, 'queued')} value={<NumberTicker value={survey.counts.queued} />} />
        <StatCard label={t(locale, 'synced')} value={<NumberTicker value={survey.counts.synced} />} />
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {t(locale, 'quickActions')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => survey.newInspection()}>
            <Plus className="h-4 w-4" />
            {t(locale, 'newInspection')}
          </Button>
          <QuickAction
            onClick={() => void survey.flushQueue()}
            disabled={!survey.counts.queued || !survey.online}
          >
            {t(locale, 'syncQueue')}
          </QuickAction>
          <InstallButton
            locale={locale}
            promptEvent={survey.installEvent}
            onPromptUsed={survey.consumeInstallEvent}
            installed={survey.installed}
            appearance="action"
          />
          <QuickAction onClick={() => void survey.requestNotify()}>
            <Bell className="h-4 w-4" />
            {survey.notifyEnabled ? t(locale, 'notificationsOn') : t(locale, 'enableAlerts')}
          </QuickAction>
        </div>
      </section>

      <Collapsible.Root>
        <Collapsible.Trigger className="flex min-h-11 w-full items-center justify-between rounded-[12px] border border-slate-200 bg-white px-4 text-left text-sm font-semibold text-slate-800">
          {t(locale, 'howOffline')}
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Collapsible.Trigger>
        <Collapsible.Content className="mt-2 rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <ol className="list-decimal space-y-1 pl-4">
            <li>{t(locale, 'offlineStep1')}</li>
            <li>{t(locale, 'offlineStep2')}</li>
            <li>{t(locale, 'offlineStep3')}</li>
            <li>{t(locale, 'offlineStep4')}</li>
          </ol>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  )
}
