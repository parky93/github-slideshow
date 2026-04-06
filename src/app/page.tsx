import { getAllQualifications } from '@/lib/db/queries/qualifications'
import { AppShell } from '@/components/layout/AppShell'
import { QualCard } from '@/components/qualification/QualCard'
import { Mountain, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const qualifications = await getAllQualifications()

  const walking = qualifications.filter((q) => q.category === 'walking')
  const climbingCoaching = qualifications.filter(
    (q) => q.category === 'climbing' || q.category === 'coaching'
  )

  const recentlyViewed = qualifications
    .filter((q) => q.lastViewedAt)
    .sort((a, b) => new Date(b.lastViewedAt!).getTime() - new Date(a.lastViewedAt!).getTime())
    .slice(0, 3)

  const favourites = qualifications.filter((q) => q.isFavourite)

  // Active qualifications (at least 1 item rated)
  const inProgress = qualifications
    .filter((q) => (q.ratedItems ?? 0) > 0)
    .sort((a, b) => (b.completionPct ?? 0) - (a.completionPct ?? 0))

  return (
    <AppShell>
      {/* Hero header */}
      <div className="bg-gradient-to-b from-mountain-700 to-mountain-800 text-white px-4 pt-12 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Mountain className="h-6 w-6" />
            <span className="text-sm font-medium opacity-80">MT Assessment Tracker</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Ready for assessment?</h1>
          <p className="text-sm opacity-75">
            Track your readiness across Mountain Training qualifications.
          </p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        {/* Quick search */}
        <Link
          href="/qualifications"
          className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search qualifications...</span>
        </Link>

        {/* In progress */}
        {inProgress.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              In progress
            </h2>
            <div className="space-y-2">
              {inProgress.slice(0, 3).map((q) => (
                <QualCard key={q.id} qualification={q} />
              ))}
            </div>
          </section>
        )}

        {/* Favourites */}
        {favourites.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Favourites
            </h2>
            <div className="space-y-2">
              {favourites.map((q) => (
                <QualCard key={q.id} qualification={q} />
              ))}
            </div>
          </section>
        )}

        {/* Recently viewed */}
        {recentlyViewed.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Recently viewed
            </h2>
            <div className="space-y-2">
              {recentlyViewed.map((q) => (
                <QualCard key={q.id} qualification={q} />
              ))}
            </div>
          </section>
        )}

        {/* Walking pathway */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Walking pathway
            </h2>
            <Link href="/qualifications?pathway=walking" className="text-xs text-primary font-medium">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {walking.slice(0, 4).map((q) => (
              <QualCard key={q.id} qualification={q} />
            ))}
          </div>
        </section>

        {/* Climbing & Coaching pathway */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Climbing & Coaching
            </h2>
            <Link href="/qualifications?pathway=climbing" className="text-xs text-primary font-medium">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {climbingCoaching.slice(0, 4).map((q) => (
              <QualCard key={q.id} qualification={q} />
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
          <p>
            This is an unofficial self-assessment support tool. It is not affiliated with or
            endorsed by Mountain Training. Always refer to official Mountain Training resources for
            accurate qualification information.{' '}
            <a
              href="https://www.mountain-training.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mountain-training.org
            </a>
          </p>
        </div>
      </div>
    </AppShell>
  )
}
