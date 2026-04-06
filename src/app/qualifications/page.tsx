'use client'

import { useEffect, useState, useMemo } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { QualCard } from '@/components/qualification/QualCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QualificationWithMeta } from '@/lib/types'

type FilterPathway = 'all' | 'walking' | 'climbing'

export default function QualificationsPage() {
  const [qualifications, setQualifications] = useState<QualificationWithMeta[]>([])
  const [search, setSearch] = useState('')
  const [pathway, setPathway] = useState<FilterPathway>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/qualifications')
      .then((r) => r.json())
      .then((data) => {
        setQualifications(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return qualifications.filter((q) => {
      const matchSearch =
        !search ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.pathway.toLowerCase().includes(search.toLowerCase())

      const matchPathway =
        pathway === 'all' ||
        (pathway === 'walking' && q.category === 'walking') ||
        (pathway === 'climbing' && (q.category === 'climbing' || q.category === 'coaching'))

      return matchSearch && matchPathway
    })
  }, [qualifications, search, pathway])

  const grouped = useMemo(() => {
    const groups: Record<string, QualificationWithMeta[]> = {}
    filtered.forEach((q) => {
      if (!groups[q.pathway]) groups[q.pathway] = []
      groups[q.pathway].push(q)
    })
    return groups
  }, [filtered])

  return (
    <AppShell title="Qualifications">
      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search qualifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {(['all', 'walking', 'climbing'] as FilterPathway[]).map((f) => (
            <button
              key={f}
              onClick={() => setPathway(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                pathway === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              )}
            >
              {f === 'all' ? 'All' : f === 'walking' ? 'Walking' : 'Climbing & Coaching'}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium">No qualifications found</p>
            <p className="text-sm">Try a different search or filter</p>
          </div>
        ) : (
          Object.entries(grouped).map(([pathwayName, quals]) => (
            <section key={pathwayName}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {pathwayName}
              </h2>
              <div className="space-y-2">
                {quals.map((q) => (
                  <QualCard key={q.id} qualification={q} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </AppShell>
  )
}
