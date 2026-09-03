import { Camera, ImagePlus, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { Button } from './ui/button'
import { t, type Locale } from '../i18n'

export function PhotoUploader({
  preview,
  onFile,
  onRemove,
  locale
}: {
  preview?: string
  onFile: (file: File) => void
  onRemove: () => void
  locale: Locale
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          event.target.value = ''
        }}
      />
      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100"
        >
          <Camera className="h-6 w-6 text-navy-700" />
          <span className="font-semibold">{t(locale, 'addPhoto')}</span>
          <span className="text-xs text-slate-500">{t(locale, 'photoHint')}</span>
        </button>
      ) : (
        <div className="space-y-3">
          <img
            src={preview}
            alt={t(locale, 'photoAlt')}
            className="h-44 w-full rounded-[12px] object-cover"
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
              {t(locale, 'replace')}
            </Button>
            <Button type="button" variant="ghost" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
              {t(locale, 'remove')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
