import React, { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  searchPlaces,
  searchNearby,
  fetchRouteWaypoints,
  type OsmPlace,
  type PlaceType,
  PLACE_TYPE_LABEL,
} from '@/lib/dlog/osm'
import { simplifyWaypoints } from '@/lib/dlog/gpx'
import { C, RADIUS } from '@/lib/theme'

type Filter = 'All' | 'Indoor Wall' | 'Outdoor Crag' | 'Walking & Summits'
const FILTERS: Filter[] = ['All', 'Indoor Wall', 'Outdoor Crag', 'Walking & Summits']

const FILTER_TYPES: Record<Filter, PlaceType[] | null> = {
  'All': null,
  'Indoor Wall': ['indoor-wall'],
  'Outdoor Crag': ['outdoor-crag'],
  'Walking & Summits': ['walking-route', 'summit'],
}

// Curated popular UK MTA-relevant places shown before search
const POPULAR: OsmPlace[] = [
  { id: 'pop-snowdon-pyg', name: 'Snowdon — Pyg Track', type: 'walking-route', lat: 53.0685, lng: -4.0762, subtitle: 'Snowdonia, Wales' },
  { id: 'pop-snowdon-miners', name: 'Snowdon — Miners Track', type: 'walking-route', lat: 53.0685, lng: -4.0762, subtitle: 'Snowdonia, Wales' },
  { id: 'pop-ben-nevis', name: 'Ben Nevis — Tourist Path', type: 'walking-route', lat: 56.7968, lng: -5.0037, subtitle: 'Fort William, Scotland' },
  { id: 'pop-helvellyn-striding', name: 'Helvellyn — Striding Edge', type: 'walking-route', lat: 54.5272, lng: -3.0160, subtitle: 'Lake District' },
  { id: 'pop-scafell', name: 'Scafell Pike', type: 'summit', lat: 54.4543, lng: -3.2111, subtitle: 'Lake District, England' },
  { id: 'pop-pen-y-fan', name: 'Pen y Fan', type: 'summit', lat: 51.8836, lng: -3.4370, subtitle: 'Brecon Beacons, Wales' },
  { id: 'pop-stanage', name: 'Stanage Edge', type: 'outdoor-crag', lat: 53.3619, lng: -1.6505, subtitle: 'Peak District' },
  { id: 'pop-froggatt', name: 'Froggatt Edge', type: 'outdoor-crag', lat: 53.3103, lng: -1.6341, subtitle: 'Peak District' },
  { id: 'pop-tremadog', name: 'Tremadog', type: 'outdoor-crag', lat: 52.9269, lng: -4.1453, subtitle: 'Snowdonia, Wales' },
  { id: 'pop-glenmore', name: 'Glenmore Climbing Wall', type: 'indoor-wall', lat: 57.1723, lng: -3.7083, subtitle: 'Aviemore, Scotland' },
]

export default function DiscoverScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [results, setResults] = useState<OsmPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const all = await searchPlaces(q)
      const types = FILTER_TYPES[filter]
      setResults(types ? all.filter(p => types.includes(p.type)) : all)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  const onQueryChange = (text: string) => {
    setQuery(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(text), 600)
  }

  const onFilterChange = (f: Filter) => {
    setFilter(f)
    if (query.trim()) doSearch(query)
  }

  const handleSelect = async (place: OsmPlace) => {
    setLoadingId(place.id)
    try {
      let waypoints: { id: string; name: string; lat: number; lng: number }[] = []

      if (place.type === 'walking-route' && place.id.startsWith('osm-relation-')) {
        // Fetch the actual GPS track from OSM
        const pts = await fetchRouteWaypoints(place.id)
        if (pts.length > 0) {
          const simplified = simplifyWaypoints(pts.map((p, i) => ({ id: `pt-${i}`, name: `Point ${i + 1}`, ...p })))
          waypoints = simplified
        }
      }

      // Pre-seed the GPX builder with this place
      await AsyncStorage.setItem('mta:dlog:builder-init', JSON.stringify({
        location: { name: place.name, lat: place.lat, lng: place.lng },
        waypoints,
      }))

      // Go to GPX builder
      router.push('/dlog/gpx-builder')
    } catch (e) {
      Alert.alert('Error', 'Could not load place. Please try again.')
    } finally {
      setLoadingId(null)
    }
  }

  const displayList: OsmPlace[] = searched
    ? results
    : POPULAR.filter(p => {
        const types = FILTER_TYPES[filter]
        return !types || types.includes(p.type)
      })

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <View style={styles.searchIcon}>
            <View style={styles.searchCircle} />
            <View style={styles.searchHandle} />
          </View>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search venues, crags, routes..."
            placeholderTextColor={C.textMuted}
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query)}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults([]); setSearched(false) }} hitSlop={8}>
              <View style={styles.clearBtn}>
                <View style={styles.clearX1} />
                <View style={styles.clearX2} />
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filtersWrap}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={f => f}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => onFilterChange(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          )}
        />
      </View>

      {/* Section header */}
      <Text style={styles.sectionLabel}>
        {searched ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 'Popular UK places'}
      </Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={C.green} size="large" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
              onPress={() => handleSelect(item)}
              disabled={loadingId === item.id}
            >
              <View style={[styles.typeTag, typeTagColor(item.type)]}>
                <Text style={styles.typeTagText}>{PLACE_TYPE_LABEL[item.type]}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                {item.subtitle ? (
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                ) : null}
              </View>
              {loadingId === item.id ? (
                <ActivityIndicator color={C.green} size="small" />
              ) : (
                <View style={styles.arrowWrap}>
                  <View style={styles.arrowLine1} />
                  <View style={styles.arrowLine2} />
                </View>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            searched ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyHint}>
                  Try a different name, or use the GPX Builder to place a pin manually.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.builderBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push('/dlog/gpx-builder')}
                >
                  <Text style={styles.builderBtnText}>Open GPX Builder</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}

function typeTagColor(type: PlaceType) {
  switch (type) {
    case 'indoor-wall': return { backgroundColor: '#1C2B3A', borderColor: '#5B9BFF' }
    case 'outdoor-crag': return { backgroundColor: '#1C2B12', borderColor: C.green }
    case 'walking-route': return { backgroundColor: '#2B1C12', borderColor: '#FF8A3D' }
    case 'summit': return { backgroundColor: '#2B1C2B', borderColor: '#C084FC' }
    default: return { backgroundColor: C.surface, borderColor: C.border }
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchIcon: { width: 18, height: 18, position: 'relative', flexShrink: 0 },
  searchCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.textMuted,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchHandle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 6,
    height: 2,
    backgroundColor: C.textMuted,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: { flex: 1, fontSize: 15, color: C.text },
  clearBtn: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  clearX1: { position: 'absolute', width: 12, height: 2, backgroundColor: C.textMuted, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2: { position: 'absolute', width: 12, height: 2, backgroundColor: C.textMuted, borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  filtersWrap: { marginBottom: 4 },
  filters: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.green, borderColor: C.green },
  filterText: { fontSize: 13, fontWeight: '600', color: C.textSec },
  filterTextActive: { color: '#0A0F08' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: C.textMuted },

  list: { paddingHorizontal: 16, paddingBottom: 48 },

  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeTag: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  typeTagText: { fontSize: 10, fontWeight: '700', color: C.textSec, letterSpacing: 0.4 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: C.textMuted },

  arrowWrap: { width: 16, height: 16, position: 'relative', flexShrink: 0 },
  arrowLine1: {
    position: 'absolute', width: 8, height: 2, backgroundColor: C.textMuted,
    borderRadius: 1, transform: [{ rotate: '45deg' }, { translateY: -2 }], top: 5, left: 3,
  },
  arrowLine2: {
    position: 'absolute', width: 8, height: 2, backgroundColor: C.textMuted,
    borderRadius: 1, transform: [{ rotate: '-45deg' }, { translateY: 2 }], top: 5, left: 3,
  },

  empty: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  builderBtn: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  builderBtnText: { fontSize: 14, fontWeight: '700', color: C.green },
})
