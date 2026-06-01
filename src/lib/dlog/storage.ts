import AsyncStorage from '@react-native-async-storage/async-storage'
import { getJSON, setJSON } from '../db/client'
import type { DLogActivity } from './types'

export async function getIsPro(): Promise<boolean> {
  const v = await AsyncStorage.getItem('mta:isPro')
  return v === 'true'
}
export async function setIsPro(v: boolean): Promise<void> {
  await AsyncStorage.setItem('mta:isPro', v ? 'true' : 'false')
}
export async function saveActivity(a: DLogActivity): Promise<void> {
  const existing = (await getJSON<DLogActivity[]>('mta:dlog:activities')) ?? []
  await setJSON('mta:dlog:activities', [a, ...existing])
}
export async function getActivities(): Promise<DLogActivity[]> {
  return (await getJSON<DLogActivity[]>('mta:dlog:activities')) ?? []
}
export async function deleteActivity(id: string): Promise<void> {
  const existing = await getActivities()
  await setJSON('mta:dlog:activities', existing.filter(a => a.id !== id))
}
