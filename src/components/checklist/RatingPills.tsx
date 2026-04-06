'use client'

import { cn } from '@/lib/utils'
import { RATING_LABELS, RATING_COLORS, RATING_ACTIVE_COLORS } from '@/lib/types'
import type { RatingValue } from '@/lib/types'

interface RatingPillsProps {
  value?: number | null
  onChange?: (value: RatingValue) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

const ratings: RatingValue[] = [1, 2, 3, 4, 5]

export function RatingPills({ value, onChange, disabled, size = 'md', className }: RatingPillsProps) {
  return (
    <div className={cn('flex gap-1.5', className)}>
      {ratings.map((r) => {
        const isActive = value === r
        return (
          <button
            key={r}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(r)}
            className={cn(
              'flex-1 rounded-lg border font-medium transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'active:scale-95',
              size === 'md' ? 'py-2 text-xs' : 'py-1.5 text-[10px]',
              isActive ? RATING_ACTIVE_COLORS[r] : RATING_COLORS[r]
            )}
            title={RATING_LABELS[r]}
            aria-pressed={isActive}
            aria-label={`Rate as ${RATING_LABELS[r]}`}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}

interface RatingPillsLabeledProps extends RatingPillsProps {
  showLabels?: boolean
}

export function RatingPillsLabeled({ showLabels = true, ...props }: RatingPillsLabeledProps) {
  return (
    <div className="space-y-1.5">
      <RatingPills {...props} />
      {showLabels && props.value && (
        <p className="text-center text-xs text-muted-foreground">
          {RATING_LABELS[props.value as RatingValue]}
        </p>
      )}
      {showLabels && !props.value && (
        <div className="flex justify-between px-0.5">
          <span className="text-[9px] text-muted-foreground">Not yet</span>
          <span className="text-[9px] text-muted-foreground">Assessment ready</span>
        </div>
      )}
    </div>
  )
}
