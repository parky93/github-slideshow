import React, { useCallback, useState } from 'react'
import { View, Text, SectionList, StyleSheet, Pressable } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { getCoachingNeeds } from '@/lib/db/queries/qualifications'
import { RATING_LABELS, RATING_ACTIVE_COLORS } from '@/lib/types'
import type { CoachingNeedItem, RatingValue } from '@/lib/types'
import { C } from '@/lib/theme'

interface Group { title: string; slug: string; data: CoachingNeedItem[] }

export default function CoachingNeedsScreen() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [total, setTotal] = useState(0)

  useFocusEffect(useCallback(() => {
    let active = true
    async function load() {
      const items = await getCoachingNeeds()
      if (!active) return
      setTotal(items.length)
      const map = new Map<number, Group>()
      for (const item of items) {
        if (!map.has(item.qualId)) {
          map.set(item.qualId, { title: item.qualName, slug: item.qualSlug, data: [] })
        }
        map.get(item.qualId)!.data.push(item)
      }
      setGroups(Array.from(map.values()))
    }
    load()
    return () => { active = false }
  }, []))

  if (groups.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyDot} />
        <Text style={styles.emptyTitle}>No coaching needs flagged</Text>
        <Text style={styles.emptyHint}>
          Open any checklist item, expand it, and toggle "Flag for coaching" to add it here.
        </Text>
      </View>
    )
  }

  return (
    <SectionList
      sections={groups}
      keyExtractor={item => String(item.itemId)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <Text style={styles.heading}>{total} item{total !== 1 ? 's' : ''} flagged across {groups.length} qual{groups.length !== 1 ? 's' : ''}</Text>
      }
      renderSectionHeader={({ section }) => (
        <Pressable
          style={styles.sectionHeader}
          onPress={() => router.push(`/qualification/${(section as Group).slug}`)}
        >
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionCount}>{section.data.length}</Text>
        </Pressable>
      )}
      renderItem={({ item }) => (
        <NeedRow item={item} />
      )}
    />
  )
}

function NeedRow({ item }: { item: CoachingNeedItem }) {
  const ratingColor = item.ratingValue ? RATING_ACTIVE_COLORS[item.ratingValue as RatingValue] : C.textMuted
  const ratingLabel = item.ratingValue ? RATING_LABELS[item.ratingValue as RatingValue] : 'Unrated'

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.section}>{item.sectionTitle}</Text>
        <View style={[styles.ratingBadge, { backgroundColor: ratingColor + '22' }]}>
          <Text style={[styles.ratingText, { color: ratingColor }]}>{ratingLabel}</Text>
        </View>
      </View>
      <Text style={styles.prompt}>{item.prompt}</Text>
      {item.notes ? (
        <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 48 },
  heading: {
    fontSize: 13,
    color: C.textMuted,
    fontWeight: '600',
    paddingTop: 20,
    paddingBottom: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.bgElevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: -16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSec,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: C.orange,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  section: {
    fontSize: 11,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  ratingBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  prompt: {
    fontSize: 14,
    color: C.text,
    lineHeight: 20,
  },
  notes: {
    fontSize: 12,
    color: C.textSec,
    marginTop: 6,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: C.bg,
  },
  emptyDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.surface,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
    lineHeight: 20,
  },
})
