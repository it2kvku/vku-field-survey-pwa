import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'

export function NumberTicker({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (reduced.current) {
      setDisplay(value)
      return
    }
    const start = display
    const delta = value - start
    if (delta === 0) return
    const duration = 420
    const t0 = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      setDisplay(Math.round(start + delta * p))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span className={cn('font-semibold tabular-nums', className)}>{display}</span>
}
