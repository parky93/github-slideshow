import { getJSON, setJSON } from '../client'
import type { RatingValue, ProgressSnapshot } from '../../types'

interface StoredRating {
  ratingValue: RatingValue | null
  confidenceValue: number | null
  notes: string
  tags: string[]
  needsCoaching: boolean
  updatedAt: string
}

export async function upsertRating(
  itemId: number,
  patch: Partial<{
    ratingValue: RatingValue | null
    confidenceValue: number | null
    notes: string
    tags: string[]
    needsCoaching: boolean
  }>,
): Promise<void> {
  const existing = await getJSON<StoredRating>(`mta:rating:${itemId}`)
  const updated: StoredRating = {
    ratingValue: existing?.ratingValue ?? null,
    confidenceValue: existing?.confidenceValue ?? null,
    notes: existing?.notes ?? '',
    tags: existing?.tags ?? [],
    needsCoaching: existing?.needsCoaching ?? false,
    updatedAt: new Date().toISOString(),
    ...patch,
  }
  await setJSON(`mta:rating:${itemId}`, updated)
}

export async function saveSnapshot(
  qualificationId: number,
  score: number,
  completion: number,
  label?: string,
): Promise<void> {
  const existing = await getJSON<ProgressSnapshot[]>(`mta:snapshots:${qualificationId}`) ?? []
  const snapshot: ProgressSnapshot = {
    id: Date.now(),
    qualificationId,
    score,
    completion,
    label: label ?? null,
    createdAt: new Date().toISOString(),
  }
  await setJSON(`mta:snapshots:${qualificationId}`, [snapshot, ...existing])
}

export async function getSnapshots(qualificationId: number): Promise<ProgressSnapshot[]> {
  return (await getJSON<ProgressSnapshot[]>(`mta:snapshots:${qualificationId}`)) ?? []
}
