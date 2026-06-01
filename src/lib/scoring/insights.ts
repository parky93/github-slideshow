import type { ReadinessScore } from '../types'

export interface ReadinessInsights {
  weakestSection: string | null
  strongestSection: string | null
  topToImprove: string[]
}

export function generateInsights(score: ReadinessScore): ReadinessInsights {
  if (score.sectionScores.length === 0) {
    return { weakestSection: null, strongestSection: null, topToImprove: [] }
  }
  const sorted = [...score.sectionScores].sort((a, b) => a.score - b.score)
  return {
    weakestSection: sorted[0]?.title ?? null,
    strongestSection: sorted[sorted.length - 1]?.title ?? null,
    topToImprove: sorted.slice(0, 3).map(s => s.title),
  }
}
