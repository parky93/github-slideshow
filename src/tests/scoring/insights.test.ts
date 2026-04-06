import { describe, it, expect } from 'vitest'
import { generateInsights } from '@/lib/scoring/insights'
import { calculateReadinessScore } from '@/lib/scoring/score'
import type { SectionWithItems } from '@/lib/types'

function makeItem(id: string, ratingValue: number | null, needsCoaching = false) {
  return {
    id,
    qualificationId: 'q1',
    sectionId: 's1',
    stableKey: id,
    prompt: `Item ${id}`,
    sourceType: 'manual',
    order: 0,
    extractionConfidence: 1,
    isActive: true,
    defaultTags: [],
    rating: ratingValue !== null ? {
      id: `r${id}`,
      checklistItemId: id,
      ratingValue,
      confidenceValue: 3,
      status: 'practised',
      needsCoaching,
      notes: null,
      evidenceSummary: null,
      tags: [],
      lastPractisedAt: null,
      updatedAt: new Date(),
    } : null,
  }
}

describe('generateInsights', () => {
  const sections: SectionWithItems[] = [
    {
      id: 's1',
      qualificationId: 'q1',
      title: 'Navigation',
      order: 0,
      weight: 1,
      isActive: true,
      items: [makeItem('i1', 1), makeItem('i2', 1)], // weak
    },
    {
      id: 's2',
      qualificationId: 'q1',
      title: 'Meteorology',
      order: 1,
      weight: 1,
      isActive: true,
      items: [makeItem('i3', 5), makeItem('i4', 5)], // strong
    },
    {
      id: 's3',
      qualificationId: 'q1',
      title: 'Emergency',
      order: 2,
      weight: 1,
      isActive: true,
      items: [makeItem('i5', null), makeItem('i6', null)], // unrated
    },
  ]

  const readiness = calculateReadinessScore(sections)
  const insights = generateInsights(sections, readiness)

  it('identifies weak sections', () => {
    expect(insights.weakestSections[0].sectionTitle).toBe('Emergency') // unrated = 0%
  })

  it('identifies strong sections', () => {
    const strongTitles = insights.strongestSections.map((s) => s.sectionTitle)
    expect(strongTitles).toContain('Meteorology')
  })

  it('lists unrated items', () => {
    expect(insights.unratedItems.length).toBe(2)
    const unratedIds = insights.unratedItems.map((i) => i.id)
    expect(unratedIds).toContain('i5')
    expect(unratedIds).toContain('i6')
  })

  it('lists top improvements from low-rated items', () => {
    expect(insights.topImprovements.length).toBeGreaterThan(0)
    const improvIds = insights.topImprovements.map((i) => i.id)
    expect(improvIds).toContain('i1')
    expect(improvIds).toContain('i2')
  })

  it('generates a summary string', () => {
    expect(typeof insights.summary).toBe('string')
    expect(insights.summary.length).toBeGreaterThan(10)
  })
})
