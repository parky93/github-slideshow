import AsyncStorage from '@react-native-async-storage/async-storage'

export async function getJSON<T>(key: string): Promise<T | null> {
  const val = await AsyncStorage.getItem(key)
  return val ? (JSON.parse(val) as T) : null
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

export async function initDatabase(): Promise<void> {
  // No-op — AsyncStorage needs no schema setup
}
