import { notFound } from 'next/navigation'
import { getQualificationBySlug } from '@/lib/db/queries/qualifications'
import { getProgressSnapshots } from '@/lib/db/queries/snapshots'
import { AppShell } from '@/components/layout/AppShell'
import { ReadinessRing } from '@/components/charts/ReadinessRing'
import { formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function QualificationHistoryPage({ params }: Props) {
  const { slug } = await params
  const qual = await getQualificationBySlug(slug)
  if (!qual) notFound()

  const snapshots = await getProgressSnapshots(qual.id)

  return (
    <AppShell
      title="Progress history"
      showBack
      backHref={`/qualifications/${slug}`}
    >
      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {snapshots.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-semibold mb-1">No history yet</p>
            <p className="text-sm text-muted-foreground">
              Rating your skills will automatically save progress snapshots here.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {snapshots.length} progress snapshot{snapshots.length !== 1 ? 's' : ''} recorded
            </p>

            <div className="space-y-3">
              {[...snapshots].reverse().map((snapshot, i) => {
                const prev = snapshots[snapshots.length - i - 2]
                const delta = prev ? snapshot.overallScore - prev.overallScore : null

                return (
                  <div key={snapshot.id} className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-4">
                      <ReadinessRing score={snapshot.overallScore} size="sm" showLabel={false} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {Math.round(snapshot.overallScore)}% ready
                          </span>
                          {delta !== null && (
                            <span
                              className={
                                delta > 0
                                  ? 'text-green-600 text-xs flex items-center gap-0.5'
                                  : delta < 0
                                  ? 'text-red-500 text-xs flex items-center gap-0.5'
                                  : 'text-muted-foreground text-xs flex items-center gap-0.5'
                              }
                            >
                              {delta > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : delta < 0 ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {snapshot.ratedItems}/{snapshot.totalItems} items rated •{' '}
                          {formatDate(snapshot.takenAt)}
                        </p>
                        {snapshot.label && (
                          <p className="text-xs text-primary mt-0.5">{snapshot.label}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
