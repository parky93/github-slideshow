import type {
  ChecklistItemWithRating,
  SectionWithItems,
  ReadinessScore,
  SectionScore,
} from '@/lib/types'

/**
 * Core readiness scoring algorithm.
 *
 * For each rated item:
 *   itemScore = ratingValue / 5
 *   itemConfidence = confidenceValue / 5
 *   weightedScore = itemScore * (0.7 + 0.3 * itemConfidence)
 *
 * Unrated items score 0 and drag down the average.
 * Section score = mean of all item weighted scores (unrated = 0).
 * Overall score = weighted mean of section scores.
 * Confidence = (ratedItems / totalItems) * 100
 */

export function scoreItem(
  ratingValue: number | null | undefined,
  confidenceValue: number | null | undefined
): number {
  if (!ratingValue) return 0
  const r = Math.min(5, Math.max(1, ratingValue)) / 5
  const c = confidenceValue ? Math.min(5, Math.max(1, confidenceValue)) / 5 : 0.6
  return r * (0.7 + 0.3 * c)
}

export function scoreSection(items: ChecklistItemWithRating[]): SectionScore & {
  sectionId: string
  sectionTitle: string
} {
  const activeItems = items.filter((i) => i.isActive)
  if (activeItems.length === 0) {
    return {
      sectionId: '',
      sectionTitle: '',
      score: 0,
      completion: 0,
      itemCount: 0,
      ratedCount: 0,
      trafficLight: 'red',
    }
  }

  const ratedItems = activeItems.filter((i) => i.rating?.ratingValue != null)
  const totalScore = activeItems.reduce((sum, item) => {
    return sum + scoreItem(item.rating?.ratingValue, item.rating?.confidenceValue)
  }, 0)

  const score = (totalScore / activeItems.length) * 100
  const completion = (ratedItems.length / activeItems.length) * 100

  return {
    sectionId: '',
    sectionTitle: '',
    score: Math.round(score * 10) / 10,
    completion: Math.round(completion * 10) / 10,
    itemCount: activeItems.length,
    ratedCount: ratedItems.length,
    trafficLight: getTrafficLight(score),
  }
}

export function getTrafficLight(score: number): 'red' | 'amber' | 'green' {
  if (score < 40) return 'red'
  if (score < 70) return 'amber'
  return 'green'
}

export function calculateReadinessScore(sections: SectionWithItems[]): ReadinessScore {
  const activeSections = sections.filter((s) => s.isActive)

  if (activeSections.length === 0) {
    return {
      overallScore: 0,
      overallPct: 0,
      scoreConfidence: 0,
      completionPct: 0,
      totalItems: 0,
      ratedItems: 0,
      sectionScores: [],
      trafficLight: 'red',
    }
  }

  const sectionScores: SectionScore[] = activeSections.map((section) => {
    const result = scoreSection(section.items)
    return {
      ...result,
      sectionId: section.id,
      sectionTitle: section.title,
    }
  })

  // Weighted mean of section scores
  const totalWeight = activeSections.reduce((sum, s) => sum + s.weight, 0)
  const weightedScoreSum = activeSections.reduce((sum, section, i) => {
    return sum + sectionScores[i].score * section.weight
  }, 0)

  const overallScore = totalWeight > 0 ? weightedScoreSum / totalWeight : 0

  // Overall completion
  const totalItems = sectionScores.reduce((sum, s) => sum + s.itemCount, 0)
  const ratedItems = sectionScores.reduce((sum, s) => sum + s.ratedCount, 0)
  const completionPct = totalItems > 0 ? (ratedItems / totalItems) * 100 : 0

  // Score confidence is dampened by completion
  const scoreConfidence = completionPct

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    overallPct: Math.round(overallScore * 10) / 10,
    scoreConfidence: Math.round(scoreConfidence * 10) / 10,
    completionPct: Math.round(completionPct * 10) / 10,
    totalItems,
    ratedItems,
    sectionScores,
    trafficLight: getTrafficLight(overallScore),
  }
}

export function getReadinessLabel(score: number): string {
  if (score < 20) return 'Just starting out'
  if (score < 40) return 'Early stages'
  if (score < 55) return 'Building foundations'
  if (score < 70) return 'Developing well'
  if (score < 85) return 'Looking strong'
  return 'Assessment ready'
}

export function getReadinessColor(score: number): string {
  if (score < 40) return 'text-red-600'
  if (score < 70) return 'text-amber-600'
  return 'text-green-600'
}

export function getReadinessBg(score: number): string {
  if (score < 40) return 'bg-red-50 border-red-200'
  if (score < 70) return 'bg-amber-50 border-amber-200'
  return 'bg-green-50 border-green-200'
}
