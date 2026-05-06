import React, { useCallback, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { ReadinessRing } from '@/components/ReadinessRing'
import { getQualificationBySlug } from '@/lib/db/queries/qualifications'
import { getSnapshots } from '@/lib/db/queries/ratings'
import { getTrafficLight } from '@/lib/scoring/score'
import type { ProgressSnapshot } from '@/lib/types'

export default function HistoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [snapshots, setSnapshots] = useState<ProgressSnapshot[]>([])

  useFocusEffect(useCallback(() => {
    let active = true
    async function load() {
      const q = await getQualificationBySlug(slug)
      if (!q || !active) return
      const snaps = await getSnapshots(q.id)
      if (active) setSnapshots(snaps)
    }
    load()
    return () => { active = false }
  }, [slug]))

  if (snapshots.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyDot} />
        <Text style={styles.emptyTitle}>No history yet</Text>
        <Text style={styles.emptyHint}>Rate checklist items to start tracking your progress.</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={snapshots}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Text style={styles.heading}>{snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''}</Text>
        </View>
      }
      renderItem={({ item, index }) => {
        const prev = snapshots[index + 1]
        const delta = prev ? item.score - prev.score : null
        const light = getTrafficLight(item.score)
        const date = new Date(item.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        })
        const time = new Date(item.createdAt).toLocaleTimeString('en-GB', {
          hour: '2-digit', minute: '2-digit',
        })
        const deltaColor = delta === null ? '#9ca3af' : delta > 0 ? '#22c55e' : delta < 0 ? '#ef4444' : '#9ca3af'
        const deltaSymbol = delta === null ? null : delta > 0 ? '+' : delta < 0 ? '-' : null

        return (
          <View style={styles.card}>
            <ReadinessRing score={item.score} light={light} size={80} />
            <View style={styles.cardBody}>
              <Text style={styles.date}>{date}</Text>
              <Text style={styles.time}>{time}</Text>
              {item.label ? <Text style={styles.label}>{item.label}</Text> : null}
              <Text style={styles.completion}>{Math.round(item.completion * 100)}% rated</Text>
              {delta !== null && (
                <View style={styles.deltaRow}>
                  <View style={[styles.deltaDot, { backgroundColor: deltaColor }]} />
                  <Text style={[styles.delta, { color: deltaColor }]}>
                    {deltaSymbol}{Math.abs(Math.round(delta * 100))}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 48, backgroundColor: '#0F1A0A' },
  listHeader: { paddingTop: 20, paddingBottom: 12 },
  heading: { fontSize: 13, color: '#536644', fontWeight: '600' },

  card: {
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardBody: { flex: 1, marginLeft: 16 },
  date: { fontSize: 14, fontWeight: '700', color: '#ECF0E6' },
  time: { fontSize: 12, color: '#8FA882', marginTop: 1 },
  label: { fontSize: 12, color: '#8FA882', marginTop: 4 },
  completion: { fontSize: 12, color: '#536644', marginTop: 4 },

  /* Delta indicator */
  deltaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  deltaDot: { width: 8, height: 8, borderRadius: 4 },
  delta: { fontSize: 13, fontWeight: '700' },

  /* Empty state */
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#0F1A0A' },
  emptyDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A2E10',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#ECF0E6', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#8FA882', textAlign: 'center', lineHeight: 20 },
})
