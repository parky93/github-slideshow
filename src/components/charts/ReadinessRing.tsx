'use client'

import { cn } from '@/lib/utils'
import { getReadinessLabel } from '@/lib/scoring/score'

interface ReadinessRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizeMap = {
  sm: { outer: 64, stroke: 5, fontSize: 'text-sm', labelSize: 'text-[10px]' },
  md: { outer: 96, stroke: 7, fontSize: 'text-lg', labelSize: 'text-xs' },
  lg: { outer: 140, stroke: 9, fontSize: 'text-2xl', labelSize: 'text-sm' },
}

export function ReadinessRing({ score, size = 'md', showLabel = true, className }: ReadinessRingProps) {
  const { outer, stroke, fontSize, labelSize } = sizeMap[size]
  const radius = (outer - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, score))
  const offset = circumference - (progress / 100) * circumference

  const ringColor =
    progress < 40 ? '#ef4444' : progress < 70 ? '#f59e0b' : '#16a34a'

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: outer, height: outer }}>
        <svg
          width={outer}
          height={outer}
          viewBox={`0 0 ${outer} ${outer}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <circle
            cx={outer / 2}
            cy={outer / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold tabular-nums leading-none', fontSize)} style={{ color: ringColor }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('text-muted-foreground font-medium text-center', labelSize)}>
          {getReadinessLabel(progress)}
        </span>
      )}
    </div>
  )
}
