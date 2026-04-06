import { normaliseText } from './stable-key'

export interface ItemForMapping {
  stableKey: string
  prompt: string
  sectionTitle: string
  order: number
}

export interface MappingResult {
  oldKey: string
  newKey: string
  confidence: number
  method: 'exact' | 'fuzzy' | 'positional' | 'unmatched'
}

/**
 * Jaro-Winkler similarity between two strings.
 * Returns 0-1. ≥ 0.85 considered a good match.
 */
function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0

  const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1
  const s1Matches = new Array(s1.length).fill(false)
  const s2Matches = new Array(s2.length).fill(false)

  let matches = 0
  let transpositions = 0

  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchDistance)
    const end = Math.min(i + matchDistance + 1, s2.length)

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue
      s1Matches[i] = true
      s2Matches[j] = true
      matches++
      break
    }
  }

  if (matches === 0) return 0

  let k = 0
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue
    while (!s2Matches[k]) k++
    if (s1[i] !== s2[k]) transpositions++
    k++
  }

  return (
    (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3
  )
}

function jaroWinklerSimilarity(s1: string, s2: string): number {
  const jaro = jaroSimilarity(s1, s2)
  const prefixLength = Math.min(
    4,
    [...s1].findIndex((c, i) => c !== s2[i]) === -1 ? Math.min(s1.length, s2.length) : [...s1].findIndex((c, i) => c !== s2[i])
  )
  return jaro + prefixLength * 0.1 * (1 - jaro)
}

/**
 * Map old checklist items to new items after a refresh.
 *
 * Strategy:
 * 1. Exact stableKey match → confidence 1.0
 * 2. Fuzzy text match (Jaro-Winkler ≥ 0.85) → confidence 0.7-0.99
 * 3. Positional + partial text → confidence 0.4-0.69
 * 4. No match → unmatched
 */
export function mapItems(
  oldItems: ItemForMapping[],
  newItems: ItemForMapping[]
): MappingResult[] {
  const results: MappingResult[] = []
  const matchedNewKeys = new Set<string>()

  for (const oldItem of oldItems) {
    // 1. Exact key match
    const exactMatch = newItems.find((n) => n.stableKey === oldItem.stableKey)
    if (exactMatch) {
      results.push({
        oldKey: oldItem.stableKey,
        newKey: exactMatch.stableKey,
        confidence: 1.0,
        method: 'exact',
      })
      matchedNewKeys.add(exactMatch.stableKey)
      continue
    }

    // 2. Fuzzy text match
    const normOld = normaliseText(oldItem.prompt)
    let bestFuzzyScore = 0
    let bestFuzzyItem: ItemForMapping | null = null

    for (const newItem of newItems) {
      if (matchedNewKeys.has(newItem.stableKey)) continue
      const normNew = normaliseText(newItem.prompt)
      const similarity = jaroWinklerSimilarity(normOld, normNew)
      if (similarity > bestFuzzyScore) {
        bestFuzzyScore = similarity
        bestFuzzyItem = newItem
      }
    }

    if (bestFuzzyScore >= 0.85 && bestFuzzyItem) {
      results.push({
        oldKey: oldItem.stableKey,
        newKey: bestFuzzyItem.stableKey,
        confidence: bestFuzzyScore,
        method: 'fuzzy',
      })
      matchedNewKeys.add(bestFuzzyItem.stableKey)
      continue
    }

    // 3. Positional fallback
    const sameSectionItems = newItems.filter(
      (n) =>
        !matchedNewKeys.has(n.stableKey) &&
        normaliseText(n.sectionTitle) === normaliseText(oldItem.sectionTitle) &&
        Math.abs(n.order - oldItem.order) <= 1
    )

    if (sameSectionItems.length > 0 && bestFuzzyScore >= 0.5) {
      const positionalMatch = sameSectionItems[0]
      results.push({
        oldKey: oldItem.stableKey,
        newKey: positionalMatch.stableKey,
        confidence: bestFuzzyScore * 0.8,
        method: 'positional',
      })
      matchedNewKeys.add(positionalMatch.stableKey)
      continue
    }

    // 4. Unmatched
    results.push({
      oldKey: oldItem.stableKey,
      newKey: '',
      confidence: 0,
      method: 'unmatched',
    })
  }

  return results
}
