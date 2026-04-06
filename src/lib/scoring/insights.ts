import type {
  ChecklistItemWithRating,
  SectionWithItems,
  ReadinessScore,
  ReadinessInsights,
  SectionScore,
} from '@/lib/types'

export function generateInsights(
  sections: SectionWithItems[],
  readiness: ReadinessScore
): ReadinessInsights {
  const allItems = sections.flatMap((s) => s.items).filter((i) => i.isActive)
  const unratedItems = allItems.filter((i) => !i.rating?.ratingValue)
  const ratedItems = allItems.filter((i) => i.rating?.ratingValue != null)
  const needsCoachingItems = allItems.filter((i) => i.rating?.needsCoaching)

  // Sort sections by score ascending for weakest
  const sortedByScore = [...readiness.sectionScores].sort((a, b) => a.score - b.score)
  const weakestSections = sortedByScore.slice(0, 3)
  const strongestSections = [...sortedByScore].reverse().slice(0, 3)

  // Top improvements: lowest-rated rated items
  const lowRatedItems = ratedItems
    .filter((i) => (i.rating?.ratingValue ?? 0) <= 2)
    .sort((a, b) => (a.rating?.ratingValue ?? 0) - (b.rating?.ratingValue ?? 0))
    .slice(0, 5)

  // Practise next: items rated 3 (developing) - almost there
  const practiseNextItems = ratedItems
    .filter((i) => i.rating?.ratingValue === 3)
    .slice(0, 5)

  // Build summary string
  const summary = buildSummary(readiness, weakestSections, strongestSections, unratedItems.length)

  return {
    weakestSections,
    strongestSections,
    topImprovements: lowRatedItems,
    unratedItems: unratedItems.slice(0, 10),
    needsCoachingItems,
    practiseNextItems,
    summary,
  }
}

function buildSummary(
  readiness: ReadinessScore,
  weakest: SectionScore[],
  strongest: SectionScore[],
  unratedCount: number
): string {
  const parts: string[] = []

  if (readiness.completionPct < 10) {
    parts.push('You\'re just getting started — rate more items to get a clear picture.')
  } else if (readiness.completionPct < 50) {
    parts.push(`You've rated ${Math.round(readiness.completionPct)}% of items so far.`)
  } else {
    parts.push(`Overall readiness: ${Math.round(readiness.overallPct)}%.`)
  }

  if (weakest.length > 0 && weakest[0].ratedCount > 0) {
    parts.push(`Focus on ${weakest[0].sectionTitle} — your lowest-scoring section.`)
  }

  if (strongest.length > 0 && strongest[0].score >= 70) {
    parts.push(`You look strong in ${strongest[0].sectionTitle}.`)
  }

  if (unratedCount > 0) {
    parts.push(`${unratedCount} items still need a rating.`)
  }

  return parts.join(' ')
}
