import AsyncStorage from '@react-native-async-storage/async-storage'
import { getJSON, setJSON } from '../client'
import type { StoredQual } from '../seed'
import type { Qualification, QualificationWithMeta, Section, ChecklistItem, UserRating, CoachingNeedItem } from '../../types'

async function loadQuals(): Promise<StoredQual[]> {
  return (await getJSON<StoredQual[]>('mta:quals')) ?? []
}

interface Meta { isFavourite: boolean; lastViewedAt: string | null }

async function getMeta(qualId: number): Promise<Meta> {
  return (await getJSON<Meta>(`mta:meta:${qualId}`)) ?? { isFavourite: false, lastViewedAt: null }
}

interface StoredRating {
  ratingValue: number | null
  confidenceValue: number | null
  notes: string
  tags: string[]
  needsCoaching: boolean
  updatedAt: string
}

async function getRating(itemId: number): Promise<StoredRating | null> {
  return getJSON<StoredRating>(`mta:rating:${itemId}`)
}

function toQual(q: StoredQual, meta: Meta): Qualification {
  return {
    id: q.id, slug: q.slug, name: q.name, category: q.category,
    qualType: q.qualType, pathway: q.pathway, summary: q.summary,
    officialUrl: q.officialUrl, isFavourite: meta.isFavourite, lastViewedAt: meta.lastViewedAt,
  }
}

export async function getAllQualifications(): Promise<QualificationWithMeta[]> {
  const quals = await loadQuals()
  return Promise.all(quals.map(async q => {
    const meta = await getMeta(q.id)
    const allItems = q.sections.flatMap(s => s.items)
    const ratings = await Promise.all(allItems.map(i => getRating(i.id)))
    const ratedItems = ratings.filter(r => r?.ratingValue).length
    const totalItems = allItems.length
    const rawScore = ratings.reduce((sum, r, idx) => {
      if (!r?.ratingValue) return sum
      const rv = r.ratingValue / 5
      const cv = r.confidenceValue ? r.confidenceValue / 5 : 0.6
      return sum + rv * (0.7 + 0.3 * cv)
    }, 0)
    return {
      ...toQual(q, meta),
      totalItems,
      ratedItems,
      readinessScore: totalItems > 0 ? rawScore / totalItems : 0,
    }
  }))
}

export async function getQualificationBySlug(slug: string): Promise<Qualification | null> {
  const quals = await loadQuals()
  const q = quals.find(q => q.slug === slug)
  if (!q) return null
  const meta = await getMeta(q.id)
  return toQual(q, meta)
}

export async function getSectionsWithItems(qualificationId: number): Promise<Section[]> {
  const quals = await loadQuals()
  const q = quals.find(q => q.id === qualificationId)
  if (!q) return []

  return Promise.all(q.sections.map(async s => {
    const items: ChecklistItem[] = await Promise.all(s.items.map(async i => {
      const r = await getRating(i.id)
      const rating: UserRating | null = r
        ? { id: i.id, itemId: i.id, ratingValue: r.ratingValue as any,
            confidenceValue: r.confidenceValue, notes: r.notes,
            tags: r.tags, needsCoaching: r.needsCoaching, updatedAt: r.updatedAt }
        : null
      return { id: i.id, sectionId: s.id, prompt: i.prompt, detail: null,
               sortOrder: i.sortOrder, isCoachingItem: false, rating }
    }))
    return { id: s.id, qualificationId: q.id, title: s.title, sortOrder: s.sortOrder, items }
  }))
}

export async function markQualViewed(id: number): Promise<void> {
  const meta = await getMeta(id)
  await setJSON(`mta:meta:${id}`, { ...meta, lastViewedAt: new Date().toISOString() })
}

export async function toggleFavourite(id: number): Promise<void> {
  const meta = await getMeta(id)
  await setJSON(`mta:meta:${id}`, { ...meta, isFavourite: !meta.isFavourite })
}

export async function getCoachingNeeds(): Promise<CoachingNeedItem[]> {
  const quals = await loadQuals()
  const results: CoachingNeedItem[] = []
  for (const q of quals) {
    for (const s of q.sections) {
      for (const item of s.items) {
        const r = await getRating(item.id)
        if (r?.needsCoaching) {
          results.push({
            qualId: q.id,
            qualName: q.name,
            qualSlug: q.slug,
            itemId: item.id,
            prompt: item.prompt,
            sectionTitle: s.title,
            ratingValue: (r.ratingValue as any) ?? null,
            notes: r.notes ?? '',
          })
        }
      }
    }
  }
  return results
}
