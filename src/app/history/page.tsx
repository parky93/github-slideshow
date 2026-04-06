import { AppShell } from '@/components/layout/AppShell'
import { getAllQualifications } from '@/lib/db/queries/qualifications'
import { getProgressSnapshots } from '@/lib/db/queries/snapshots'
import { QualCard } from '@/components/qualification/QualCard'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const qualifications = await getAllQualifications()
  const inProgress = qualifications.filter((q) => (q.ratedItems ?? 0) > 0)

  return (
    <AppShell title="Progress">
      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        {inProgress.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <h2 className="font-semibold mb-1">No progress yet</h2>
            <p className="text-sm text-muted-foreground">
              Start rating skills in a qualification to track your progress here.
            </p>
            <Link
              href="/qualifications"
              className="mt-4 inline-block text-sm text-primary font-medium"
            >
              Browse qualifications →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Tap a qualification to see detailed history and trends.
            </p>
            {inProgress.map((q) => (
              <Link key={q.id} href={`/qualifications/${q.slug}/history`}>
                <QualCard qualification={q} />
              </Link>
            ))}
          </>
        )}
      </div>
    </AppShell>
  )
}
