/**
 * Discover qualification URLs from the Mountain Training website.
 * Falls back to the seeded qualification list if the site is unreachable.
 */

import { fetchPage } from './fetcher'
import { parseQualificationIndex } from './html-parser'

export interface DiscoveredQualification {
  title: string
  url: string
  pathway: string
  slug: string
}

const INDEX_URL = 'https://www.mountain-training.org/qualifications'

/**
 * Extract slug from a Mountain Training qualification URL.
 * e.g. https://www.mountain-training.org/qualifications/walking/mountain-leader
 *      → mountain-leader
 */
export function slugFromUrl(url: string): string {
  const parts = url.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

export async function discoverQualifications(): Promise<DiscoveredQualification[]> {
  const result = await fetchPage(INDEX_URL)
  if (!result) {
    console.warn('[discovery] Could not fetch qualification index — using seeded list')
    return []
  }

  const found = parseQualificationIndex(result.html)
  return found.map((q) => ({
    ...q,
    slug: slugFromUrl(q.url),
  }))
}
