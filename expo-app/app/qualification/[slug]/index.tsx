import React, { useCallback, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { ReadinessRing } from '@/components/ReadinessRing'
import { SectionBar } from '@/components/SectionBar'
import { InsightsPanel } from '@/components/InsightsPanel'
import { getQualificationBySlug, getSectionsWithItems, markQualViewed, toggleFavourite } from '@/lib/db/queries/qualifications'
import { calculateReadinessScore } from '@/lib/scoring/score'
import type { Qualification, ReadinessScore } from '@/lib/types'

export default function DashboardScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const [qual, setQual] = useState<Qualification | null>(null)
  const [score, setScore] = useState<ReadinessScore | null>(null)

  useFocusEffect(useCallback(() => {
    const q = getQualificationBySlug(slug)
    if (!q) return
    setQual(q)
    markQualViewed(q.id)
    const sections = getSectionsWithItems(q.id)
    setScore(calculateReadinessScore(sections))
  }, [slug]))

  if (!qual) return null

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name}>{qual.name}</Text>
          {qual.pathway && <Text style={styles.pathway}>{qual.pathway}</Text>}
        </View>
        <Pressable onPress={() => { toggleFavourite(qual.id); setQual(q => q ? { ...q, isFavourite: !q.isFavourite } : q) }}>
          <Text style={styles.heart}>{qual.isFavourite ? '♥' : '♡'}</Text>
        </Pressable>
      </View>

      {/* Readiness ring */}
      {score && score.sectionScores.length > 0 ? (
        <>
          <View style={styles.ringRow}>
            <ReadinessRing score={score.overall} light={score.light} size={140} />
            <View style={styles.ringMeta}>
              <Stat label="Rated" value={`${Math.round(score.completion * 100)}%`} />
              <Stat label="Sections" value={String(score.sectionScores.length)} />
              <Stat label="Status" value={score.light.toUpperCase()} color={score.light === 'green' ? '#22c55e' : score.light === 'amber' ? '#f59e0b' : '#ef4444'} />
            </View>
          </View>

          <InsightsPanel score={score} />

          <Text style={styles.sectionHeading}>Section Breakdown</Text>
          {score.sectionScores.map(s => (
            <SectionBar key={s.sectionId} section={s} />
          ))}
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No checklist items yet</Text>
        </View>
      )}

      {/* Summary */}
      {qual.summary ? <Text style={styles.summary}>{qual.summary}</Text> : null}

      {/* Actions */}
      <View style={styles.actions}>
        {score && score.sectionScores.length > 0 && (
          <>
            <ActionBtn label="Rate checklist" color="#2d7d2d" onPress={() => router.push(`/qualification/${slug}/checklist`)} />
            <ActionBtn label="View history" color="#6b7280" onPress={() => router.push(`/qualification/${slug}/history`)} />
          </>
        )}
      </View>
    </ScrollView>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
    </View>
  )
}

function ActionBtn({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, { backgroundColor: color }, pressed && styles.btnPressed]}
    >
      <Text style={styles.btnLabel}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  pathway: { fontSize: 13, color: '#2d7d2d', marginTop: 2, fontWeight: '600' },
  heart: { fontSize: 26, color: '#ef4444', paddingLeft: 12 },
  ringRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 24 },
  ringMeta: { flex: 1, gap: 10 },
  stat: {},
  statLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.4 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12, marginTop: 20 },
  summary: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginTop: 20 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#9ca3af', fontSize: 15 },
  actions: { gap: 10, marginTop: 24 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnPressed: { opacity: 0.8 },
  btnLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
