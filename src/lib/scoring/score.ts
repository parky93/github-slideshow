import type { Section, ReadinessScore, SectionScore, TrafficLight } from '../types'

export function scoreItem(ratingValue: number | null, confidenceValue: number | null): number {
  if (!ratingValue) return 0
  const r = Math.min(5, Math.max(1, ratingValue)) / 5
  const c = confidenceValue ? Math.min(5, Math.max(1, confidenceValue)) / 5 : 0.6
  return r * (0.7 + 0.3 * c)
}

export function getTrafficLight(score: number): TrafficLight {
  if (score < 0.4) return 'red'
  if (score < 0.7) return 'amber'
  return 'green'
}

export function getReadinessLabel(score: number): string {
  if (score >= 0.85) return 'Assessment ready'
  if (score >= 0.7) return 'Looking strong'
  if (score >= 0.5) return 'Getting there'
  if (score >= 0.3) return 'Building foundations'
  return 'Just starting'
}

export function calculateReadinessScore(sections: Section[]): ReadinessScore {
  const allItems = sections.flatMap(s => s.items)
  const total = allItems.length

  if (total === 0) {
    return { overall: 0, completion: 0, light: 'red', sectionScores: [] }
  }

  const rated = allItems.filter(i => i.rating?.ratingValue).length
  const completion = rated / total

  const rawScore = allItems.reduce((sum, item) => {
    return sum + scoreItem(
      item.rating?.ratingValue ?? null,
      item.rating?.confidenceValue ?? null,
    )
  }, 0)

  const overall = rawScore / total

  const sectionScores: SectionScore[] = sections.map(section => {
    const items = section.items
    const sTotal = items.length
    if (sTotal === 0) {
      return { sectionId: section.id, title: section.title, score: 0, completion: 0, light: 'red' as TrafficLight }
    }
    const sRated = items.filter(i => i.rating?.ratingValue).length
    const sRaw = items.reduce((sum, item) => sum + scoreItem(
      item.rating?.ratingValue ?? null,
      item.rating?.confidenceValue ?? null,
    ), 0)
    const sScore = sRaw / sTotal
    return {
      sectionId: section.id,
      title: section.title,
      score: sScore,
      completion: sRated / sTotal,
      light: getTrafficLight(sScore),
    }
  })

  return { overall, completion, light: getTrafficLight(overall), sectionScores }
}
