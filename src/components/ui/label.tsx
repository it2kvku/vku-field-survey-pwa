import type { ComponentProps } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '../../lib/cn'

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500',
        className
      )}
      {...props}
    />
  )
}
