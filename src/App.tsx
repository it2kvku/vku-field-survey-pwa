import { AppShell } from './components/AppShell'
import { HomePage } from './pages/HomePage'
import { InspectPage } from './pages/InspectPage'
import { RecordsPage } from './pages/RecordsPage'
import { useFieldSurvey } from './hooks/useFieldSurvey'

export default function App() {
  const survey = useFieldSurvey()

  return (
    <AppShell
      view={survey.view}
      onNavigate={survey.navigate}
      connection={survey.connection}
      lastSync={survey.lastSync}
      locale={survey.locale}
      onLocale={(next) => void survey.setLocale(next)}
      installEvent={survey.installEvent}
      installed={survey.installed}
      onInstallConsumed={survey.consumeInstallEvent}
    >
      {survey.view === 'inspect' ? (
        <InspectPage survey={survey} />
      ) : survey.view === 'records' ? (
        <RecordsPage survey={survey} />
      ) : (
        <HomePage survey={survey} />
      )}

      {survey.toast ? (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 max-w-[min(92vw,360px)] -translate-x-1/2 rounded-full bg-navy-950 px-4 py-2.5 text-center text-sm text-white shadow-card md:bottom-8"
        >
          {survey.toast}
        </div>
      ) : null}
    </AppShell>
  )
}
