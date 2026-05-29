import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface NominatimResult {
  place_id: number
  display_name: string
  name?: string
  lat: string
  lon: string
}

interface LocationItem {
  id: string
  name: string
  displayName: string
  lat: number
  lng: number
  isManual?: boolean
}

export default function LocationSearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationItem[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=10&countrycodes=gb`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'MTAReadyApp/1.0' },
      })
      const data: NominatimResult[] = await res.json()
      setResults(
        data.map(r => ({
          id: String(r.place_id),
          name: r.display_name.split(',')[0],
          displayName: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        }))
      )
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(query)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  const selectLocation = async (item: LocationItem) => {
    await AsyncStorage.setItem('mta:dlog:pending-location', JSON.stringify({
      name: item.name,
      displayName: item.displayName,
      lat: item.lat,
      lng: item.lng,
    }))
    router.back()
  }

  const selectManual = async () => {
    if (!query.trim()) return
    await AsyncStorage.setItem('mta:dlog:pending-location', JSON.stringify({
      name: query.trim(),
      displayName: query.trim(),
      lat: null,
      lng: null,
    }))
    router.back()
  }

  const renderItem = ({ item }: { item: LocationItem }) => (
    <Pressable
      style={({ pressed }) => [styles.resultRow, pressed && { opacity: 0.7 }]}
      onPress={() => selectLocation(item)}
    >
      <View style={styles.pinIcon}>
        <View style={styles.pinDot} />
      </View>
      <View style={styles.resultText}>
        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.resultDisplay} numberOfLines={1}>{item.displayName}</Text>
      </View>
    </Pressable>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.searchBar}>
          <View style={styles.searchIconWrap}>
            <View style={styles.searchCircle} />
            <View style={styles.searchHandle} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Search for a location..."
            placeholderTextColor="#536644"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Manual entry option */}
        {query.length > 0 && (
          <Pressable
            style={({ pressed }) => [styles.manualRow, pressed && { opacity: 0.7 }]}
            onPress={selectManual}
          >
            <View style={styles.manualIcon}>
              <View style={styles.manualLine1} />
              <View style={styles.manualLine2} />
            </View>
            <Text style={styles.manualText}>Use "{query}" as manual entry</Text>
          </Pressable>
        )}

        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#4A8B28" />
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !loading && query.length >= 2 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A0A' },
  flex: { flex: 1 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    gap: 10,
  },
  searchIconWrap: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  searchCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8FA882',
  },
  searchHandle: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 6,
    height: 2,
    backgroundColor: '#8FA882',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#ECF0E6',
    paddingVertical: 14,
  },

  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2E4A1E',
  },
  manualIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#1A2E10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualLine1: { width: 14, height: 2, backgroundColor: '#8FA882', borderRadius: 1, marginBottom: 3 },
  manualLine2: { width: 10, height: 2, backgroundColor: '#8FA882', borderRadius: 1 },
  manualText: {
    fontSize: 14,
    color: '#8FA882',
    fontStyle: 'italic',
    flex: 1,
  },

  loadingWrap: { paddingVertical: 20, alignItems: 'center' },

  list: { paddingHorizontal: 16, paddingBottom: 48 },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2E10',
    gap: 12,
  },
  pinIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A2E10',
    borderWidth: 1,
    borderColor: '#2E4A1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A8B28',
  },
  resultText: { flex: 1 },
  resultName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ECF0E6',
    marginBottom: 3,
  },
  resultDisplay: {
    fontSize: 12,
    color: '#536644',
  },
  emptyWrap: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#536644' },
})
