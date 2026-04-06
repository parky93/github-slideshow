import { describe, it, expect } from 'vitest'
import { mapItems } from '@/lib/mapping/item-mapper'
import type { ItemForMapping } from '@/lib/mapping/item-mapper'

function item(key: string, prompt: string, section = 'Navigation', order = 0): ItemForMapping {
  return { stableKey: key, prompt, sectionTitle: section, order }
}

describe('mapItems', () => {
  it('returns empty array for empty inputs', () => {
    expect(mapItems([], [])).toEqual([])
  })

  it('exact-matches items with same stableKey', () => {
    const old = [item('abc123def456', 'Use a compass correctly', 'Navigation', 0)]
    const newItems = [item('abc123def456', 'Use a compass correctly', 'Navigation', 0)]
    const result = mapItems(old, newItems)
    expect(result).toHaveLength(1)
    expect(result[0].method).toBe('exact')
    expect(result[0].confidence).toBe(1.0)
    expect(result[0].oldKey).toBe('abc123def456')
    expect(result[0].newKey).toBe('abc123def456')
  })

  it('fuzzy-matches items with similar text', () => {
    const old = [item('oldkey000001', 'Use a map and compass to navigate in poor visibility')]
    const newItems = [item('newkey000001', 'Use a map and compass to navigate in poor visibility conditions')]
    const result = mapItems(old, newItems)
    expect(result).toHaveLength(1)
    expect(result[0].method).toBe('fuzzy')
    expect(result[0].confidence).toBeGreaterThan(0.85)
  })

  it('marks unmatched items correctly', () => {
    const old = [item('oldkey000001', 'Use a compass', 'Navigation', 0)]
    const newItems = [item('newkey000002', 'Assess avalanche risk on steep terrain', 'Avalanche Awareness', 5)]
    const result = mapItems(old, newItems)
    expect(result).toHaveLength(1)
    expect(result[0].method).toBe('unmatched')
    expect(result[0].confidence).toBe(0)
    expect(result[0].newKey).toBe('')
  })

  it('handles multiple items and does not double-match', () => {
    const old = [
      item('key1', 'Use a compass'),
      item('key2', 'Use a compass'), // duplicate prompt
    ]
    const newItems = [
      item('key3', 'Use a compass'),
    ]
    const result = mapItems(old, newItems)
    expect(result).toHaveLength(2)
    // One should match, one should be unmatched
    const matched = result.filter((r) => r.method !== 'unmatched')
    const unmatched = result.filter((r) => r.method === 'unmatched')
    expect(matched).toHaveLength(1)
    expect(unmatched).toHaveLength(1)
  })

  it('prefers exact match over fuzzy when available', () => {
    const old = [item('exact_key_001', 'Navigate in poor visibility')]
    const newItems = [
      item('exact_key_001', 'Navigate in poor visibility'), // exact
      item('fuzzy_key_001', 'Navigate in poor visibility conditions'), // fuzzy
    ]
    const result = mapItems(old, newItems)
    expect(result[0].method).toBe('exact')
    expect(result[0].newKey).toBe('exact_key_001')
  })
})
