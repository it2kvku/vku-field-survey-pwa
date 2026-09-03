import { InspectionForm } from '../components/InspectionForm'
import { t } from '../i18n'
import type { useFieldSurvey } from '../hooks/useFieldSurvey'

export function InspectPage({ survey }: { survey: ReturnType<typeof useFieldSurvey> }) {
  const { locale } = survey
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">
        {survey.editingId ? t(locale, 'editInspection') : t(locale, 'newInspection')}
      </h1>
      <p className="mt-1 mb-5 text-sm text-slate-500">{t(locale, 'inspectLead')}</p>
      <InspectionForm
        locale={locale}
        draft={survey.draft}
        onChange={(patch) => survey.setDraft((current) => ({ ...current, ...patch }))}
        onCaptureGps={() => void survey.captureGps()}
        locating={survey.locating}
        gpsStatus={survey.gpsStatus}
        onPhotoFile={(file) => void survey.onPhotoFile(file)}
        onRemovePhoto={() => survey.setDraft((current) => ({ ...current, photoDataUrl: undefined }))}
        onSubmit={() => void survey.submitDraft()}
        submitting={survey.submitting}
        editing={Boolean(survey.editingId)}
      />
    </div>
  )
}
