'use client'

import { cn } from '@/lib/utils'
import { getTrafficLight } from '@/lib/scoring/score'

interface SectionBarProps {
  title: string
  score: number
  completion: number
  itemCount: number
  ratedCount: number
  className?: string
}

const trafficColors = {
  red: { bar: 'bg-red-500', text: 'text-red-600', dot: 'bg-red-500' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-600', dot: 'bg-amber-500' },
  green: { bar: 'bg-green-600', text: 'text-green-600', dot: 'bg-green-500' },
}

export function SectionBar({ title, score, completion, itemCount, ratedCount, className }: SectionBarProps) {
  const light = getTrafficLight(score)
  const colors = trafficColors[light]
  const displayScore = ratedCount === 0 ? 0 : score

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('w-2 h-2 rounded-full shrink-0', colors.dot)} />
          <span className="text-sm font-medium truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            {ratedCount}/{itemCount}
          </span>
          <span className={cn('text-sm font-semibold tabular-nums w-10 text-right', colors.text)}>
            {ratedCount === 0 ? '—' : `${Math.round(displayScore)}%`}
          </span>
        </div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        {/* Completion background */}
        <div
          className="absolute inset-y-0 left-0 bg-muted-foreground/20 rounded-full transition-all duration-500"
          style={{ width: `${completion}%` }}
        />
        {/* Score bar */}
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-700', colors.bar)}
          style={{ width: `${displayScore}%` }}
        />
      </div>
    </div>
  )
}
