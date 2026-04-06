'use client'

import Link from 'next/link'
import { cn, formatRelativeDate } from '@/lib/utils'
import { ReadinessRing } from '@/components/charts/ReadinessRing'
import { Badge } from '@/components/ui/badge'
import { Heart, Star } from 'lucide-react'
import type { QualificationWithMeta } from '@/lib/types'

interface QualCardProps {
  qualification: QualificationWithMeta
  className?: string
}

const categoryColors: Record<string, string> = {
  walking: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  climbing: 'bg-blue-50 text-blue-700 border-blue-200',
  coaching: 'bg-violet-50 text-violet-700 border-violet-200',
}

export function QualCard({ qualification: q, className }: QualCardProps) {
  const score = q.overallScore ?? 0
  const completion = q.completionPct ?? 0
  const totalItems = q.totalItems ?? 0

  return (
    <Link
      href={`/qualifications/${q.slug}`}
      className={cn(
        'block rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]',
        className
      )}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Readiness ring */}
        <div className="shrink-0">
          <ReadinessRing score={score} size="sm" showLabel={false} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-snug">{q.title}</h3>
            {q.isFavourite && (
              <Heart className="h-4 w-4 text-red-400 fill-red-400 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0', categoryColors[q.category])}
            >
              {q.pathway}
            </Badge>
            {totalItems > 0 && (
              <span className="text-xs text-muted-foreground">
                {q.ratedItems ?? 0}/{totalItems} rated
              </span>
            )}
          </div>

          {/* Progress bar */}
          {totalItems > 0 ? (
            <div className="mt-2">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
                    score < 40 ? 'bg-red-500' : score < 70 ? 'bg-amber-500' : 'bg-green-600'
                  )}
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              {q.summary?.slice(0, 60)}...
            </p>
          )}

          {q.lastViewedAt && (
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Viewed {formatRelativeDate(q.lastViewedAt)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
