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
      ListHeaderComponent={<Text style={styles.heading}>{snapshots.length} snapshots</Text>}
      renderItem={({ item, index }) => {
        const prev = snapshots[index + 1]
        const delta = prev ? item.score - prev.score : null
        const light = getTrafficLight(item.score)
        const date = new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        const time = new Date(item.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        return (
          <View style={styles.card}>
            <ReadinessRing score={item.score} light={light} size={80} />
            <View style={styles.cardBody}>
              <Text style={styles.date}>{date} · {time}</Text>
              {item.label && <Text style={styles.label}>{item.label}</Text>}
              <Text style={styles.completion}>{Math.round(item.completion * 100)}% rated</Text>
              {delta !== null && (
                <Text style={[styles.delta, { color: delta > 0 ? '#22c55e' : delta < 0 ? '#ef4444' : '#9ca3af' }]}>
                  {delta > 0 ? '▲' : delta < 0 ? '▼' : '─'} {Math.abs(Math.round(delta * 100))}%
                </Text>
              )}
            </View>
          </View>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 13, color: '#9ca3af', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardBody: { flex: 1, marginLeft: 16 },
  date: { fontSize: 13, fontWeight: '600', color: '#111827' },
  label: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  completion: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  delta: { fontSize: 14, fontWeight: '700', marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
})
