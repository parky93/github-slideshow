import { notFound } from 'next/navigation'
import { getQualificationBySlug, updateQualLastViewed } from '@/lib/db/queries/qualifications'
import { getProgressSnapshots } from '@/lib/db/queries/snapshots'
import { calculateReadinessScore } from '@/lib/scoring/score'
import { generateInsights } from '@/lib/scoring/insights'
import { AppShell } from '@/components/layout/AppShell'
import { ReadinessRing } from '@/components/charts/ReadinessRing'
import { SectionBar } from '@/components/charts/SectionBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ExternalLink,
  RefreshCw,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate, parseJsonSafe } from '@/lib/utils'
import type { QualKeyInfo } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ slug: string }>
}

export default async function QualificationDashboard({ params }: Props) {
  const { slug } = await params
  const qual = await getQualificationBySlug(slug)

  if (!qual) notFound()

  // Update last viewed
  updateQualLastViewed(slug).catch(() => {})

  const sections = qual.sections as any
  const readiness = calculateReadinessScore(sections)
  const insights = generateInsights(sections, readiness)
  const keyInfo = parseJsonSafe<QualKeyInfo>(typeof qual.keyInfo === 'string' ? qual.keyInfo : JSON.stringify(qual.keyInfo ?? {}), {})

  const snapshots = await getProgressSnapshots(qual.id)
  const previousSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null

  return (
    <AppShell
      title={qual.title}
      showBack
      backHref="/qualifications"
      headerRight={
        <Link href={`/qualifications/${slug}/refresh`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </Link>
      }
    >
      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        {/* Hero readiness card */}
        <div className="rounded-xl border bg-card shadow-sm p-5">
          <div className="flex items-center gap-5">
            <ReadinessRing score={readiness.overallScore} size="lg" />
            <div className="flex-1">
              <h2 className="font-semibold text-base">{qual.title}</h2>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <Badge variant="outline" className="text-xs">
                  {qual.pathway}
                </Badge>
                {readiness.totalItems > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {readiness.ratedItems}/{readiness.totalItems} rated
                  </Badge>
                )}
              </div>

              {/* Confidence note */}
              {readiness.completionPct < 50 && readiness.totalItems > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Rate more items for a reliable score
                </p>
              )}

              {/* Trend vs previous */}
              {previousSnapshot && (
                <p className="text-xs mt-2">
                  {readiness.overallScore > previousSnapshot.overallScore ? (
                    <span className="text-green-600">
                      ↑ +{(readiness.overallScore - previousSnapshot.overallScore).toFixed(1)}%
                      since last snapshot
                    </span>
                  ) : readiness.overallScore < previousSnapshot.overallScore ? (
                    <span className="text-red-500">
                      ↓ {(readiness.overallScore - previousSnapshot.overallScore).toFixed(1)}%
                      since last snapshot
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No change since last snapshot</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Link href={`/qualifications/${slug}/checklist`}>
              <Button className="w-full gap-2 text-sm">
                <ClipboardList className="h-4 w-4" />
                Rate skills
              </Button>
            </Link>
            <Link href={`/qualifications/${slug}/history`}>
              <Button variant="outline" className="w-full gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                Progress
              </Button>
            </Link>
          </div>
        </div>

        {/* Section breakdown */}
        {readiness.sectionScores.length > 0 && (
          <section>
            <h3 className="font-semibold mb-3 text-sm">Section breakdown</h3>
            <div className="rounded-xl border bg-card p-4 space-y-4">
              {readiness.sectionScores.map((s) => (
                <Link key={s.sectionId} href={`/qualifications/${slug}/checklist?section=${s.sectionId}`}>
                  <SectionBar
                    title={s.sectionTitle}
                    score={s.score}
                    completion={s.completion}
                    itemCount={s.itemCount}
                    ratedCount={s.ratedCount}
                    className="hover:opacity-80 transition-opacity"
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Insights */}
        {readiness.ratedItems > 0 && (
          <section>
            <h3 className="font-semibold mb-3 text-sm">Insights</h3>
            <div className="space-y-3">
              {insights.weakestSections.length > 0 && insights.weakestSections[0].ratedCount > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-700">Focus area</p>
                      <p className="text-sm text-red-600 mt-0.5">
                        {insights.weakestSections[0].sectionTitle} —{' '}
                        {Math.round(insights.weakestSections[0].score)}% ready
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {insights.strongestSections.length > 0 && insights.strongestSections[0].score >= 70 && (
                <div className="rounded-xl border border-green-200 bg-green-50/50 p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-700">Strong area</p>
                      <p className="text-sm text-green-600 mt-0.5">
                        {insights.strongestSections[0].sectionTitle} —{' '}
                        {Math.round(insights.strongestSections[0].score)}% ready
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {insights.topImprovements.length > 0 && (
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Top items to improve</p>
                      <ul className="mt-2 space-y-1">
                        {insights.topImprovements.slice(0, 3).map((item) => (
                          <li key={item.id} className="text-sm text-muted-foreground flex items-start gap-1">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span className="line-clamp-2">{item.prompt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {insights.unratedItems.length > 0 && (
                <Link href={`/qualifications/${slug}/checklist?filter=unrated`}>
                  <div className="rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                    <p className="text-sm font-medium">
                      {insights.unratedItems.length} items still need a rating
                    </p>
                    <p className="text-xs text-primary mt-1">Tap to rate unrated items →</p>
                  </div>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Key information */}
        {keyInfo && Object.keys(keyInfo).length > 0 && (
          <section>
            <h3 className="font-semibold mb-3 text-sm">Key information</h3>
            <div className="rounded-xl border bg-card p-4 space-y-2">
              {keyInfo.trainingDays && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Training</span>
                  <span className="font-medium">{keyInfo.trainingDays}</span>
                </div>
              )}
              {keyInfo.assessmentDays && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Assessment</span>
                  <span className="font-medium">{keyInfo.assessmentDays}</span>
                </div>
              )}
              {keyInfo.prerequisites && keyInfo.prerequisites.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Prerequisites</span>
                  <ul className="mt-1 space-y-0.5">
                    {keyInfo.prerequisites.map((p, i) => (
                      <li key={i} className="text-xs flex items-start gap-1">
                        <span className="text-muted-foreground">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Official links */}
        <section>
          <h3 className="font-semibold mb-3 text-sm">Official resources</h3>
          <div className="rounded-xl border bg-card divide-y">
            <a
              href={qual.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">Qualification page</p>
                <p className="text-xs text-muted-foreground">mountain-training.org</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            {qual.handbookUrl && (
              <a
                href={qual.handbookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">Candidate handbook</p>
                  <p className="text-xs text-muted-foreground">Official handbook</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
            {qual.checklistUrl && (
              <a
                href={qual.checklistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">Skills checklist</p>
                  <p className="text-xs text-muted-foreground">Official assessment checklist</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
          </div>
        </section>

        {/* Source info */}
        <div className="text-xs text-muted-foreground text-center pb-2">
          {qual.sourceLastCheckedAt ? (
            <p>Data last refreshed: {formatDate(qual.sourceLastCheckedAt)}</p>
          ) : (
            <p>Seeded data — tap refresh to check for updates</p>
          )}
        </div>
      </div>
    </AppShell>
  )
}
