import { describe, it, expect } from 'vitest'
import { scoreItem, scoreSection, calculateReadinessScore, getTrafficLight, getReadinessLabel } from '@/lib/scoring/score'
import type { SectionWithItems } from '@/lib/types'

describe('scoreItem', () => {
  it('returns 0 for unrated item', () => {
    expect(scoreItem(null, null)).toBe(0)
    expect(scoreItem(undefined, undefined)).toBe(0)
  })

  it('returns full score for rating 5 with confidence 5', () => {
    const score = scoreItem(5, 5)
    expect(score).toBe(1.0) // (5/5) * (0.7 + 0.3 * (5/5)) = 1 * 1 = 1.0
  })

  it('uses default confidence of 0.6 when confidence not provided', () => {
    const score = scoreItem(5, null)
    expect(score).toBeCloseTo(0.7 + 0.3 * 0.6) // 0.88
  })

  it('handles rating 1 correctly', () => {
    const score = scoreItem(1, 5)
    expect(score).toBeCloseTo(0.2) // (1/5) * 1.0 = 0.2
  })

  it('clamps rating to valid range', () => {
    expect(scoreItem(6, 5)).toBe(scoreItem(5, 5))
    expect(scoreItem(0, 5)).toBe(0)
  })
})

describe('getTrafficLight', () => {
  it('returns red for low scores', () => {
    expect(getTrafficLight(0)).toBe('red')
    expect(getTrafficLight(39)).toBe('red')
  })

  it('returns amber for middle scores', () => {
    expect(getTrafficLight(40)).toBe('amber')
    expect(getTrafficLight(69)).toBe('amber')
  })

  it('returns green for high scores', () => {
    expect(getTrafficLight(70)).toBe('green')
    expect(getTrafficLight(100)).toBe('green')
  })
})

describe('calculateReadinessScore', () => {
  const makeItem = (id: string, ratingValue: number | null, confidenceValue: number | null = null) => ({
    id,
    qualificationId: 'qual-1',
    sectionId: 'section-1',
    stableKey: id,
    prompt: `Item ${id}`,
    sourceType: 'manual',
    order: 0,
    extractionConfidence: 1,
    isActive: true,
    defaultTags: [],
    rating: ratingValue !== null ? {
      id: `rating-${id}`,
      checklistItemId: id,
      ratingValue,
      confidenceValue,
      status: 'practised',
      needsCoaching: false,
      notes: null,
      evidenceSummary: null,
      tags: [],
      lastPractisedAt: null,
      updatedAt: new Date(),
    } : null,
  })

  const makeSection = (id: string, title: string, items: any[]): SectionWithItems => ({
    id,
    qualificationId: 'qual-1',
    title,
    order: 0,
    weight: 1,
    isActive: true,
    items,
  })

  it('returns zero score for empty qualification', () => {
    const result = calculateReadinessScore([])
    expect(result.overallScore).toBe(0)
    expect(result.totalItems).toBe(0)
  })

  it('returns zero score for all-unrated items', () => {
    const sections = [
      makeSection('s1', 'Navigation', [makeItem('i1', null), makeItem('i2', null)])
    ]
    const result = calculateReadinessScore(sections)
    expect(result.overallScore).toBe(0)
    expect(result.completionPct).toBe(0)
    expect(result.ratedItems).toBe(0)
    expect(result.totalItems).toBe(2)
  })

  it('returns 100% for fully rated with 5s', () => {
    const sections = [
      makeSection('s1', 'Navigation', [
        makeItem('i1', 5, 5),
        makeItem('i2', 5, 5),
      ])
    ]
    const result = calculateReadinessScore(sections)
    expect(result.overallScore).toBe(100)
    expect(result.completionPct).toBe(100)
    expect(result.trafficLight).toBe('green')
  })

  it('correctly computes section scores', () => {
    const sections = [
      makeSection('s1', 'Navigation', [makeItem('i1', 4, 4), makeItem('i2', 2, 2)])
    ]
    const result = calculateReadinessScore(sections)
    expect(result.sectionScores).toHaveLength(1)
    expect(result.sectionScores[0].sectionTitle).toBe('Navigation')
    expect(result.sectionScores[0].ratedCount).toBe(2)
  })

  it('treats unrated items as 0 in section average', () => {
    const sections = [
      makeSection('s1', 'Section', [
        makeItem('i1', 5, 5), // score = 1.0
        makeItem('i2', null), // score = 0
      ])
    ]
    const result = calculateReadinessScore(sections)
    // Average: (1.0 + 0) / 2 = 0.5 → 50%
    expect(result.overallScore).toBe(50)
    expect(result.completionPct).toBe(50)
  })

  it('uses section weight in overall average', () => {
    const section1 = { ...makeSection('s1', 'Section 1', [makeItem('i1', 5, 5)]), weight: 2 }
    const section2 = { ...makeSection('s2', 'Section 2', [makeItem('i2', 1, 1)]), weight: 1 }
    const result = calculateReadinessScore([section1, section2])
    // Section 1: 100%, weight 2
    // Section 2: ~20%, weight 1
    // Weighted avg: (100*2 + ~20*1) / 3 ≈ 73.3
    expect(result.overallScore).toBeGreaterThan(60)
    expect(result.overallScore).toBeLessThan(90)
  })
})

describe('getReadinessLabel', () => {
  it('returns appropriate labels', () => {
    expect(getReadinessLabel(0)).toBe('Just starting out')
    expect(getReadinessLabel(50)).toBe('Building foundations')
    expect(getReadinessLabel(84)).toBe('Looking strong')
    expect(getReadinessLabel(90)).toBe('Assessment ready')
  })
})
