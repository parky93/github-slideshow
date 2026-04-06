'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { RatingPillsLabeled } from '@/components/checklist/RatingPills'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Tag,
  Calendar,
  AlertCircle,
  Zap,
  List,
  Filter,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { RatingValue, ChecklistItemWithRating, SectionWithItems } from '@/lib/types'
import { RATING_LABELS, ITEM_TAGS } from '@/lib/types'

type FilterMode = 'all' | 'unrated' | 'weak' | 'needs-coaching'
type ViewMode = 'sections' | 'quick'

interface ChecklistData {
  slug: string
  title: string
  sections: SectionWithItems[]
}

export default function ChecklistPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  const [data, setData] = useState<ChecklistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterMode>(
    (searchParams.get('filter') as FilterMode) ?? 'all'
  )
  const [viewMode, setViewMode] = useState<ViewMode>('sections')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState<Set<string>>(new Set())

  // Quick-rate mode state
  const [quickIndex, setQuickIndex] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/qualifications/${slug}/checklist`)
      const json = await res.json()
      setData(json)
      // Default: expand all sections
      setExpandedSections(new Set(json.sections.map((s: SectionWithItems) => s.id)))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const allItems = useMemo(() => {
    if (!data) return []
    return data.sections.flatMap((s) =>
      s.items.map((item) => ({ ...item, sectionTitle: s.title }))
    )
  }, [data])

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filter === 'unrated') return !item.rating?.ratingValue
      if (filter === 'weak') return item.rating?.ratingValue && item.rating.ratingValue <= 2
      if (filter === 'needs-coaching') return item.rating?.needsCoaching
      return true
    })
  }, [allItems, filter])

  const ratedCount = allItems.filter((i) => i.rating?.ratingValue).length
  const totalCount = allItems.length
  const completionPct = totalCount > 0 ? (ratedCount / totalCount) * 100 : 0

  async function saveRating(
    itemId: string,
    updates: {
      ratingValue?: number | null
      confidenceValue?: number | null
      notes?: string | null
      needsCoaching?: boolean
      tags?: string[]
    }
  ) {
    setSaving((prev) => new Set(prev).add(itemId))
    try {
      await fetch(`/api/qualifications/${slug}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklistItemId: itemId, ...updates }),
      })
      await fetchData()
    } finally {
      setSaving((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }

  function toggleItem(itemId: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  if (loading) {
    return (
      <AppShell title="Checklist" showBack backHref={`/qualifications/${slug}`}>
        <div className="px-4 py-4 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </AppShell>
    )
  }

  if (!data) {
    return (
      <AppShell title="Checklist" showBack backHref={`/qualifications/${slug}`}>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">Could not load checklist</p>
        </div>
      </AppShell>
    )
  }

  // Quick rate mode
  if (viewMode === 'quick') {
    const quickItems = filteredItems
    const currentItem = quickItems[quickIndex]

    return (
      <AppShell
        title="Quick rate"
        showBack
        backHref={`/qualifications/${slug}`}
        headerRight={
          <button
            onClick={() => setViewMode('sections')}
            className="text-sm text-primary font-medium px-2"
          >
            Done
          </button>
        }
      >
        <div className="px-4 py-4 max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>
                {quickIndex + 1} of {quickItems.length}
              </span>
              <span>{Math.round(completionPct)}% complete</span>
            </div>
            <Progress value={((quickIndex + 1) / quickItems.length) * 100} />
          </div>

          {currentItem ? (
            <div className="space-y-4">
              {/* Section label */}
              <Badge variant="secondary" className="text-xs">
                {(currentItem as any).sectionTitle}
              </Badge>

              {/* Item prompt */}
              <h2 className="text-lg font-medium leading-snug">{currentItem.prompt}</h2>

              {/* Rating */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">How ready are you?</p>
                <RatingPillsLabeled
                  value={currentItem.rating?.ratingValue}
                  onChange={async (v) => {
                    await saveRating(currentItem.id, { ratingValue: v })
                    if (quickIndex < quickItems.length - 1) {
                      setQuickIndex((i) => i + 1)
                    } else {
                      setViewMode('sections')
                    }
                  }}
                  size="md"
                />
              </div>

              {/* Skip / Previous */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={quickIndex === 0}
                  onClick={() => setQuickIndex((i) => i - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (quickIndex < quickItems.length - 1) setQuickIndex((i) => i + 1)
                    else setViewMode('sections')
                  }}
                >
                  {quickIndex < quickItems.length - 1 ? 'Skip' : 'Finish'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-semibold">All done!</p>
              <p className="text-sm text-muted-foreground mt-1">
                You have rated all {filter === 'all' ? '' : filter + ' '}items.
              </p>
              <Button className="mt-4" onClick={() => setViewMode('sections')}>
                Back to checklist
              </Button>
            </div>
          )}
        </div>
      </AppShell>
    )
  }

  // Sections view (default)
  return (
    <AppShell
      title={data.title}
      showBack
      backHref={`/qualifications/${slug}`}
      headerRight={
        <button
          onClick={() => {
            setViewMode('quick')
            setQuickIndex(0)
          }}
          className="flex items-center gap-1 text-sm text-primary font-medium px-2"
        >
          <Zap className="h-3.5 w-3.5" />
          Quick
        </button>
      }
    >
      <div className="max-w-2xl mx-auto">
        {/* Sticky progress bar */}
        <div className="sticky top-[57px] z-30 bg-background/95 backdrop-blur border-b px-4 py-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span>{ratedCount}/{totalCount} rated</span>
            <span>{Math.round(completionPct)}%</span>
          </div>
          <Progress value={completionPct} className="h-1.5" />
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* Filter bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {([
              { key: 'all', label: 'All' },
              { key: 'unrated', label: 'Unrated' },
              { key: 'weak', label: 'Weak' },
              { key: 'needs-coaching', label: 'Coaching needed' },
            ] as { key: FilterMode; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors shrink-0',
                  filter === key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sections */}
          {data.sections.map((section) => {
            const sectionItems = filter === 'all'
              ? section.items
              : section.items.filter((item) => {
                  if (filter === 'unrated') return !item.rating?.ratingValue
                  if (filter === 'weak') return item.rating?.ratingValue && item.rating.ratingValue <= 2
                  if (filter === 'needs-coaching') return item.rating?.needsCoaching
                  return true
                })

            if (sectionItems.length === 0) return null

            const sectionRated = section.items.filter((i) => i.rating?.ratingValue).length
            const sectionTotal = section.items.length
            const sectionPct = sectionTotal > 0 ? (sectionRated / sectionTotal) * 100 : 0

            const isExpanded = expandedSections.has(section.id)

            return (
              <div key={section.id} className="rounded-xl border bg-card overflow-hidden">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm">{section.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            sectionPct < 40 ? 'bg-red-500' : sectionPct < 70 ? 'bg-amber-500' : 'bg-green-600'
                          )}
                          style={{ width: `${sectionPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {sectionRated}/{sectionTotal}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Items */}
                {isExpanded && (
                  <div className="divide-y border-t">
                    {sectionItems.map((item) => {
                      const isItemExpanded = expandedItems.has(item.id)
                      const isSaving = saving.has(item.id)
                      const rating = item.rating

                      return (
                        <div key={item.id} className={cn('p-4', isSaving && 'opacity-60')}>
                          {/* Item prompt */}
                          <div
                            className="flex items-start gap-2 cursor-pointer"
                            onClick={() => toggleItem(item.id)}
                          >
                            <div className="flex-1">
                              <p className="text-sm leading-snug">{item.prompt}</p>
                              {rating?.ratingValue && (
                                <p className={cn(
                                  'text-xs mt-1',
                                  rating.ratingValue <= 2 ? 'text-red-500' :
                                  rating.ratingValue === 3 ? 'text-amber-600' : 'text-green-600'
                                )}>
                                  {RATING_LABELS[rating.ratingValue as RatingValue]}
                                </p>
                              )}
                            </div>
                            {isItemExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            )}
                          </div>

                          {/* Rating pills — always visible */}
                          <div className="mt-3">
                            <RatingPillsLabeled
                              value={rating?.ratingValue}
                              onChange={(v) => saveRating(item.id, { ratingValue: v })}
                              disabled={isSaving}
                            />
                          </div>

                          {/* Expanded details */}
                          {isItemExpanded && (
                            <div className="mt-4 space-y-3 pt-3 border-t">
                              {/* Confidence */}
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Confidence in this rating
                                </p>
                                <div className="flex gap-1.5">
                                  {([1, 2, 3, 4, 5] as const).map((c) => (
                                    <button
                                      key={c}
                                      onClick={() => saveRating(item.id, { confidenceValue: c })}
                                      className={cn(
                                        'flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all',
                                        rating?.confidenceValue === c
                                          ? 'bg-slate-700 text-white border-slate-700'
                                          : 'bg-background text-muted-foreground border-border hover:bg-muted'
                                      )}
                                    >
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Needs coaching toggle */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  I need coaching on this
                                </span>
                                <button
                                  onClick={() =>
                                    saveRating(item.id, { needsCoaching: !rating?.needsCoaching })
                                  }
                                  className={cn(
                                    'relative inline-flex h-5 w-9 rounded-full transition-colors',
                                    rating?.needsCoaching ? 'bg-primary' : 'bg-muted'
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5',
                                      rating?.needsCoaching ? 'translate-x-4' : 'translate-x-0.5'
                                    )}
                                  />
                                </button>
                              </div>

                              {/* Notes */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                                  <MessageSquare className="h-3 w-3" />
                                  Notes
                                </label>
                                <NoteField
                                  value={rating?.notes ?? ''}
                                  onSave={(notes) => saveRating(item.id, { notes })}
                                />
                              </div>

                              {/* Tags */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                                  <Tag className="h-3 w-3" />
                                  Tags
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                  {ITEM_TAGS.slice(0, 8).map((tag) => {
                                    const isSelected = rating?.tags?.includes(tag)
                                    return (
                                      <button
                                        key={tag}
                                        onClick={() => {
                                          const current = rating?.tags ?? []
                                          const next = isSelected
                                            ? current.filter((t) => t !== tag)
                                            : [...current, tag]
                                          saveRating(item.id, { tags: next })
                                        }}
                                        className={cn(
                                          'px-2 py-1 rounded-full text-[10px] border transition-colors',
                                          isSelected
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground border-border'
                                        )}
                                      >
                                        {tag}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}

// Note field with debounced save
function NoteField({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [local, setLocal] = useState(value)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(v: string) {
    setLocal(v)
    if (timer) clearTimeout(timer)
    setTimer(setTimeout(() => onSave(v), 800))
  }

  return (
    <Textarea
      value={local}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Add notes, evidence or examples..."
      className="text-sm min-h-[60px] resize-none"
      rows={2}
    />
  )
}
