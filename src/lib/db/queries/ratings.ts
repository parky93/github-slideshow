import AsyncStorage from '@react-native-async-storage/async-storage'
import { getJSON, setJSON } from '../client'
import type { RatingValue, ProgressSnapshot, TargetDate, TrainingLogEntry } from '../../types'

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

export async function setTargetDate(qualificationId: number, date: string | null): Promise<void> {
  if (date === null) {
    await AsyncStorage.removeItem(`mta:target:${qualificationId}`)
  } else {
    await setJSON(`mta:target:${qualificationId}`, { qualificationId, date } as TargetDate)
  }
}

export async function getTargetDate(qualificationId: number): Promise<TargetDate | null> {
  return getJSON<TargetDate>(`mta:target:${qualificationId}`)
}

export async function getLogEntries(itemId: number): Promise<TrainingLogEntry[]> {
  return (await getJSON<TrainingLogEntry[]>(`mta:log:${itemId}`)) ?? []
}

export async function addLogEntry(itemId: number, date: string, notes: string): Promise<TrainingLogEntry> {
  const entry: TrainingLogEntry = {
    id: String(Date.now()),
    itemId,
    date,
    notes,
    createdAt: new Date().toISOString(),
  }
  const existing = await getJSON<TrainingLogEntry[]>(`mta:log:${itemId}`) ?? []
  await setJSON(`mta:log:${itemId}`, [entry, ...existing])
  return entry
}

export async function deleteLogEntry(itemId: number, entryId: string): Promise<void> {
  const existing = await getJSON<TrainingLogEntry[]>(`mta:log:${itemId}`) ?? []
  await setJSON(`mta:log:${itemId}`, existing.filter(e => e.id !== entryId))
}

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
