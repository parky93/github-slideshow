import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { getJSON } from '@/lib/db/client'
import type { StoredQual } from '@/lib/db/seed'

interface FlatItem {
  qualName: string
  qualSlug: string
  sectionTitle: string
  itemId: number
  prompt: string
  rated: boolean
}

export default function SearchScreen() {
  const router = useRouter()
  const inputRef = useRef<TextInput>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [allItems, setAllItems] = useState<FlatItem[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load all items on mount
  useEffect(() => {
    async function loadAll() {
      const quals = (await getJSON<StoredQual[]>('mta:quals')) ?? []
      const items: FlatItem[] = []
      for (const q of quals) {
        for (const s of q.sections) {
          for (const item of s.items) {
            const rating = await getJSON<{ ratingValue: number | null }>(`mta:rating:${item.id}`)
            items.push({
              qualName: q.name,
              qualSlug: q.slug,
              sectionTitle: s.title,
              itemId: item.id,
              prompt: item.prompt,
              rated: !!(rating?.ratingValue),
            })
          }
        }
      }
      setAllItems(items)
    }
    loadAll()
  }, [])

  // Auto-focus
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  // Debounce query
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  const results = debouncedQuery.trim().length === 0
    ? []
    : allItems.filter(item =>
        item.prompt.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        item.sectionTitle.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        item.qualName.toLowerCase().includes(debouncedQuery.toLowerCase())
      )

  const renderItem = useCallback(({ item }: { item: FlatItem }) => (
    <Pressable
      style={({ pressed }) => [styles.resultRow, pressed && { opacity: 0.75 }]}
      onPress={() => router.push(`/qualification/${item.qualSlug}/checklist`)}
    >
      <View style={styles.resultMeta}>
        <Text style={styles.resultQual}>{item.qualName}</Text>
        <Text style={styles.resultSection}> · {item.sectionTitle}</Text>
      </View>
      <View style={styles.resultMain}>
        <Text style={styles.resultPrompt} numberOfLines={2}>{item.prompt}</Text>
        <View style={[styles.ratingDot, item.rated ? styles.ratingDotGreen : styles.ratingDotDim]} />
      </View>
    </Pressable>
  ), [router])

  return (
    <View style={styles.screen}>
      {/* Search input */}
      <View style={styles.inputWrapper}>
        <View style={styles.searchIconWrap}>
          {/* Magnifying glass drawn with Views */}
          <View style={styles.searchCircle} />
          <View style={styles.searchHandle} />
        </View>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search checklist items..."
          placeholderTextColor="#536644"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {debouncedQuery.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <View style={[styles.searchCircle, styles.emptyCircle]} />
            <View style={[styles.searchHandle, styles.emptyHandle]} />
          </View>
          <Text style={styles.emptyTitle}>Search checklist items</Text>
          <Text style={styles.emptyHint}>Search across all qualifications</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptyHint}>No items match '{debouncedQuery}'</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => String(item.itemId)}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F1A0A' },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2E10',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    gap: 10,
  },
  searchIconWrap: {
    width: 20,
    height: 20,
    position: 'relative',
    marginRight: 2,
  },
  searchCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#8FA882',
    backgroundColor: 'transparent',
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
    color: '#ECF0E6',
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  },

  list: { paddingHorizontal: 16, paddingBottom: 32 },

  resultRow: {
    backgroundColor: '#1A2E10',
    borderRadius: 12,
    padding: 14,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#2E4A1E',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  resultQual: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A8B28',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultSection: {
    fontSize: 11,
    color: '#8FA882',
    fontWeight: '500',
  },
  resultMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  resultPrompt: {
    flex: 1,
    fontSize: 15,
    color: '#ECF0E6',
    fontWeight: '500',
    lineHeight: 21,
  },
  ratingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    flexShrink: 0,
  },
  ratingDotGreen: { backgroundColor: '#4A8B28' },
  ratingDotDim: { backgroundColor: '#2E4A1E', borderWidth: 1, borderColor: '#536644' },

  separator: { height: 0 },

  /* Empty states */
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
    gap: 8,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    position: 'relative',
    marginBottom: 8,
  },
  emptyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#536644',
    top: 0,
    left: 0,
  },
  emptyHandle: {
    width: 12,
    height: 3,
    bottom: 6,
    right: 4,
    backgroundColor: '#536644',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ECF0E6',
  },
  emptyHint: {
    fontSize: 14,
    color: '#536644',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
})
