import { db } from '../client'
import type { Qualification, QualificationWithMeta, Section, ChecklistItem, UserRating } from '../../types'

interface QualRow {
  id: number
  slug: string
  name: string
  category: string
  qual_type: string
  pathway: string | null
  summary: string | null
  official_url: string | null
  is_favourite: number
  last_viewed_at: string | null
}

function mapQual(row: QualRow): Qualification {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    qualType: row.qual_type,
    pathway: row.pathway,
    summary: row.summary,
    officialUrl: row.official_url,
    isFavourite: row.is_favourite === 1,
    lastViewedAt: row.last_viewed_at,
  }
}

export function getAllQualifications(): QualificationWithMeta[] {
  const rows = db.getAllSync<QualRow>('SELECT * FROM qualifications ORDER BY pathway, name')
  return rows.map(row => {
    const total = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM checklist_items ci
       JOIN sections s ON s.id = ci.section_id
       WHERE s.qualification_id = ?`,
      [row.id],
    )?.count ?? 0

    const rated = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM user_ratings ur
       JOIN checklist_items ci ON ci.id = ur.item_id
       JOIN sections s ON s.id = ci.section_id
       WHERE s.qualification_id = ? AND ur.rating_value IS NOT NULL`,
      [row.id],
    )?.count ?? 0

    const scoreRow = db.getFirstSync<{ avg: number | null }>(
      `SELECT AVG(
         CASE WHEN ur.rating_value IS NULL THEN 0
         ELSE (CAST(ur.rating_value AS REAL)/5) * (0.7 + 0.3 * COALESCE(CAST(ur.confidence_value AS REAL)/5, 0.6))
         END
       ) as avg
       FROM checklist_items ci
       JOIN sections s ON s.id = ci.section_id
       LEFT JOIN user_ratings ur ON ur.item_id = ci.id
       WHERE s.qualification_id = ?`,
      [row.id],
    )

    return {
      ...mapQual(row),
      totalItems: total,
      ratedItems: rated,
      readinessScore: scoreRow?.avg ?? 0,
    }
  })
}

export function getQualificationBySlug(slug: string): Qualification | null {
  const row = db.getFirstSync<QualRow>('SELECT * FROM qualifications WHERE slug = ?', [slug])
  return row ? mapQual(row) : null
}

export function getSectionsWithItems(qualificationId: number): Section[] {
  const sections = db.getAllSync<{
    id: number; qualification_id: number; title: string; sort_order: number
  }>('SELECT * FROM sections WHERE qualification_id = ? ORDER BY sort_order', [qualificationId])

  return sections.map(s => {
    const rows = db.getAllSync<{
      id: number
      section_id: number
      prompt: string
      detail: string | null
      sort_order: number
      is_coaching_item: number
      r_id: number | null
      rating_value: number | null
      confidence_value: number | null
      notes: string | null
      tags: string | null
      needs_coaching: number | null
      updated_at: string | null
    }>(
      `SELECT ci.*,
              ur.id          as r_id,
              ur.rating_value,
              ur.confidence_value,
              ur.notes,
              ur.tags,
              ur.needs_coaching,
              ur.updated_at
       FROM checklist_items ci
       LEFT JOIN user_ratings ur ON ur.item_id = ci.id
       WHERE ci.section_id = ?
       ORDER BY ci.sort_order`,
      [s.id],
    )

    const items: ChecklistItem[] = rows.map(i => {
      const rating: UserRating | null = i.r_id
        ? {
            id: i.r_id,
            itemId: i.id,
            ratingValue: i.rating_value as any,
            confidenceValue: i.confidence_value,
            notes: i.notes ?? '',
            tags: JSON.parse(i.tags ?? '[]'),
            needsCoaching: i.needs_coaching === 1,
            updatedAt: i.updated_at ?? '',
          }
        : null

      return {
        id: i.id,
        sectionId: i.section_id,
        prompt: i.prompt,
        detail: i.detail,
        sortOrder: i.sort_order,
        isCoachingItem: i.is_coaching_item === 1,
        rating,
      }
    })

    return {
      id: s.id,
      qualificationId: s.qualification_id,
      title: s.title,
      sortOrder: s.sort_order,
      items,
    }
  })
}

export function markQualViewed(id: number): void {
  db.runSync("UPDATE qualifications SET last_viewed_at = datetime('now') WHERE id = ?", [id])
}

export function toggleFavourite(id: number): void {
  db.runSync(
    'UPDATE qualifications SET is_favourite = CASE WHEN is_favourite = 1 THEN 0 ELSE 1 END WHERE id = ?',
    [id],
  )
}
