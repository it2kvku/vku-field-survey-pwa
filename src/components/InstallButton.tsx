import { useState } from 'react'
import { Download } from 'lucide-react'
import { t, type Locale } from '../i18n'
import { isIosDevice } from '../lib/pwa'
import { Button } from './ui/button'
import { Dialog, DialogContent } from './ui/dialog'
import { QuickAction } from './primitives'

export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallButton({
  locale,
  promptEvent,
  onPromptUsed,
  installed,
  appearance
}: {
  locale: Locale
  promptEvent: InstallPromptEvent | null
  onPromptUsed: () => void
  installed: boolean
  appearance: 'icon' | 'action'
}) {
  const [helpOpen, setHelpOpen] = useState(false)

  if (installed) return null

  const onClick = async () => {
    if (promptEvent) {
      await promptEvent.prompt()
      await promptEvent.userChoice
      onPromptUsed()
      return
    }
    setHelpOpen(true)
  }

  return (
    <>
      {appearance === 'icon' ? (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-9 w-9 min-h-9 shrink-0"
          onClick={() => void onClick()}
          aria-label={t(locale, 'installApp')}
        >
          <Download className="h-4 w-4" />
        </Button>
      ) : (
        <QuickAction type="button" onClick={() => void onClick()}>
          <Download className="h-4 w-4" />
          {t(locale, 'installApp')}
        </QuickAction>
      )}

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent title={t(locale, 'installApp')}>
          <p className="text-sm text-slate-600">
            {t(locale, isIosDevice() ? 'installHintIos' : 'installHintBrowser')}
          </p>
          <div className="mt-5 flex justify-end">
            <Button type="button" onClick={() => setHelpOpen(false)}>
              {t(locale, 'gotIt')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
