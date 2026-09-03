import { Dialog, DialogContent } from './ui/dialog'
import { Button } from './ui/button'

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onOpenChange
}: {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title}>
        <p className="text-sm text-slate-600">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
