import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva(
  'inline-flex max-w-full items-center rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide',
  {
    variants: {
      tone: {
        queued: 'bg-amber-50 text-amber-800',
        synced: 'bg-emerald-50 text-emerald-800',
        draft: 'bg-slate-100 text-slate-600',
        good: 'bg-emerald-50 text-emerald-800',
        fair: 'bg-amber-50 text-amber-800',
        poor: 'bg-rose-50 text-rose-800',
        critical: 'bg-red-700 text-red-50',
        mute: 'bg-slate-100 text-slate-600'
      }
    },
    defaultVariants: { tone: 'mute' }
  }
)

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
