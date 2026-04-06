import { describe, it, expect } from 'vitest'
import { generateStableKey, normaliseText, isValidStableKey } from '@/lib/mapping/stable-key'

describe('normaliseText', () => {
  it('lowercases text', () => {
    expect(normaliseText('NAVIGATION')).toBe('navigation')
  })

  it('trims whitespace', () => {
    expect(normaliseText('  navigation  ')).toBe('navigation')
  })

  it('collapses multiple spaces', () => {
    expect(normaliseText('use a  compass   correctly')).toBe('use a compass correctly')
  })

  it('removes punctuation', () => {
    expect(normaliseText('use a compass, correctly!')).toBe('use a compass correctly')
  })
})

describe('generateStableKey', () => {
  it('returns a 12-char hex string', () => {
    const key = generateStableKey('mountain-leader', 'Navigation', 'Use a compass')
    expect(key).toMatch(/^[0-9a-f]{12}$/)
    expect(key.length).toBe(12)
  })

  it('is deterministic — same input always returns same key', () => {
    const key1 = generateStableKey('mountain-leader', 'Navigation', 'Use a compass')
    const key2 = generateStableKey('mountain-leader', 'Navigation', 'Use a compass')
    expect(key1).toBe(key2)
  })

  it('differs with different qualification slugs', () => {
    const key1 = generateStableKey('mountain-leader', 'Navigation', 'Use a compass')
    const key2 = generateStableKey('winter-mountain-leader', 'Navigation', 'Use a compass')
    expect(key1).not.toBe(key2)
  })

  it('differs with different section titles', () => {
    const key1 = generateStableKey('mountain-leader', 'Navigation', 'Use a compass')
    const key2 = generateStableKey('mountain-leader', 'Meteorology', 'Use a compass')
    expect(key1).not.toBe(key2)
  })

  it('differs with different prompts', () => {
    const key1 = generateStableKey('mountain-leader', 'Navigation', 'Use a compass')
    const key2 = generateStableKey('mountain-leader', 'Navigation', 'Set the map')
    expect(key1).not.toBe(key2)
  })

  it('is normalisation-stable — minor text differences give same key', () => {
    const key1 = generateStableKey('mountain-leader', 'Navigation', 'Use a compass accurately')
    const key2 = generateStableKey('mountain-leader', 'Navigation', 'Use a compass, accurately!')
    expect(key1).toBe(key2)
  })
})

describe('isValidStableKey', () => {
  it('accepts valid 12-char hex keys', () => {
    expect(isValidStableKey('a1b2c3d4e5f6')).toBe(true)
    expect(isValidStableKey('000000000000')).toBe(true)
  })

  it('rejects invalid keys', () => {
    expect(isValidStableKey('short')).toBe(false)
    expect(isValidStableKey('toolongkeyhere1234')).toBe(false)
    expect(isValidStableKey('UPPERCASE1234')).toBe(false)
    expect(isValidStableKey('')).toBe(false)
  })
})
