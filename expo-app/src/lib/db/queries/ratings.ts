import { db } from '../client'
import type { RatingValue, ProgressSnapshot } from '../../types'

export function upsertRating(
  itemId: number,
  patch: Partial<{
    ratingValue: RatingValue | null
    confidenceValue: number | null
    notes: string
    tags: string[]
    needsCoaching: boolean
  }>,
): void {
  const existing = db.getFirstSync<{ id: number }>('SELECT id FROM user_ratings WHERE item_id = ?', [itemId])
  const now = new Date().toISOString()

  if (existing) {
    const sets: string[] = ['updated_at = ?']
    const vals: unknown[] = [now]
    if ('ratingValue' in patch) { sets.push('rating_value = ?'); vals.push(patch.ratingValue ?? null) }
    if ('confidenceValue' in patch) { sets.push('confidence_value = ?'); vals.push(patch.confidenceValue ?? null) }
    if ('notes' in patch) { sets.push('notes = ?'); vals.push(patch.notes) }
    if ('tags' in patch) { sets.push('tags = ?'); vals.push(JSON.stringify(patch.tags)) }
    if ('needsCoaching' in patch) { sets.push('needs_coaching = ?'); vals.push(patch.needsCoaching ? 1 : 0) }
    vals.push(itemId)
    db.runSync(`UPDATE user_ratings SET ${sets.join(', ')} WHERE item_id = ?`, vals as any)
  } else {
    db.runSync(
      `INSERT INTO user_ratings (item_id, rating_value, confidence_value, notes, tags, needs_coaching, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        itemId,
        patch.ratingValue ?? null,
        patch.confidenceValue ?? null,
        patch.notes ?? '',
        JSON.stringify(patch.tags ?? []),
        patch.needsCoaching ? 1 : 0,
        now,
      ],
    )
  }
}

export function saveSnapshot(qualificationId: number, score: number, completion: number, label?: string): void {
  db.runSync(
    'INSERT INTO progress_snapshots (qualification_id, score, completion, label) VALUES (?, ?, ?, ?)',
    [qualificationId, score, completion, label ?? null],
  )
}

export function getSnapshots(qualificationId: number): ProgressSnapshot[] {
  return db.getAllSync<ProgressSnapshot>(
    `SELECT id, qualification_id as qualificationId, score, completion, label, created_at as createdAt
     FROM progress_snapshots WHERE qualification_id = ? ORDER BY created_at DESC`,
    [qualificationId],
  )
}
