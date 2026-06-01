import AsyncStorage from '@react-native-async-storage/async-storage'
import { getJSON, setJSON } from '../db/client'
import type { DLogActivity } from './types'

const INDEX_KEY = 'mta:dlog:activity-ids'
const actKey = (id: string) => `mta:dlog:activity:${id}`

// One-time migration from the old single-blob format to per-activity keys.
async function migrateIfNeeded(): Promise<void> {
  const old = await getJSON<DLogActivity[]>('mta:dlog:activities')
  if (!old || old.length === 0) return
  const existingIds = (await getJSON<string[]>(INDEX_KEY)) ?? []
  if (existingIds.length > 0) {
    await AsyncStorage.removeItem('mta:dlog:activities')
    return
  }
  const ids: string[] = []
  for (const a of old) {
    await setJSON(actKey(a.id), a)
    ids.push(a.id)
  }
  await setJSON(INDEX_KEY, ids)
  await AsyncStorage.removeItem('mta:dlog:activities')
}

export async function getIsPro(): Promise<boolean> {
  const v = await AsyncStorage.getItem('mta:isPro')
  return v === 'true'
}
export async function setIsPro(v: boolean): Promise<void> {
  await AsyncStorage.setItem('mta:isPro', v ? 'true' : 'false')
}

export async function saveActivity(a: DLogActivity): Promise<void> {
  await migrateIfNeeded()
  await setJSON(actKey(a.id), a)
  const ids = (await getJSON<string[]>(INDEX_KEY)) ?? []
  if (!ids.includes(a.id)) {
    await setJSON(INDEX_KEY, [a.id, ...ids])
  }
}

export async function getActivities(): Promise<DLogActivity[]> {
  await migrateIfNeeded()
  const ids = (await getJSON<string[]>(INDEX_KEY)) ?? []
  const results = await Promise.all(ids.map(id => getJSON<DLogActivity>(actKey(id))))
  return results.filter((a): a is DLogActivity => a != null)
}

export async function getActivityById(id: string): Promise<DLogActivity | null> {
  await migrateIfNeeded()
  return getJSON<DLogActivity>(actKey(id))
}

export async function deleteActivity(id: string): Promise<void> {
  await migrateIfNeeded()
  await AsyncStorage.removeItem(actKey(id))
  const ids = (await getJSON<string[]>(INDEX_KEY)) ?? []
  await setJSON(INDEX_KEY, ids.filter(i => i !== id))
}
