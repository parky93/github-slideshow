import React, { useCallback, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { ReadinessRing } from '@/components/ReadinessRing'
import { SectionBar } from '@/components/SectionBar'
import { InsightsPanel } from '@/components/InsightsPanel'
import { getQualificationBySlug, getSectionsWithItems, markQualViewed, toggleFavourite } from '@/lib/db/queries/qualifications'
import { calculateReadinessScore } from '@/lib/scoring/score'
import type { Qualification, ReadinessScore } from '@/lib/types'

const BRAND = '#2d7d2d'

export default function DashboardScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const [qual, setQual] = useState<Qualification | null>(null)
  const [score, setScore] = useState<ReadinessScore | null>(null)

  useFocusEffect(useCallback(() => {
    let active = true
    async function load() {
      const q = await getQualificationBySlug(slug)
      if (!q || !active) return
      setQual(q)
      markQualViewed(q.id).catch(() => {})
      const sections = await getSectionsWithItems(q.id)
      if (active) setScore(calculateReadinessScore(sections))
    }
    load()
    return () => { active = false }
  }, [slug]))

  if (!qual) return null

  const onToggleFav = async () => {
    await toggleFavourite(qual.id)
    setQual(q => q ? { ...q, isFavourite: !q.isFavourite } : q)
  }

  const hasScore = score && score.sectionScores.length > 0

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{qual.name}</Text>
            {qual.pathway && <Text style={styles.pathway}>{qual.pathway}</Text>}
          </View>
          <Pressable onPress={onToggleFav} style={styles.favBtn} accessibilityRole="button" accessibilityLabel="Toggle favourite">
            <View style={[styles.favDot, qual.isFavourite && styles.favDotActive]} />
          </Pressable>
        </View>

        {hasScore ? (
          <>
            {/* Ring + stats chips */}
            <View style={styles.ringRow}>
              <ReadinessRing score={score.overall} light={score.light} size={140} />
              <View style={styles.statsCol}>
                <StatChip
                  label="Rated"
                  value={`${Math.round(score.completion * 100)}%`}
                />
                <StatChip
                  label="Sections"
                  value={String(score.sectionScores.length)}
                />
                <StatChip
                  label="Status"
                  value={score.light.toUpperCase()}
                  valueColor={
                    score.light === 'green'
                      ? '#22c55e'
                      : score.light === 'amber'
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                />
              </View>
            </View>

            {/* Summary info card */}
            {qual.summary ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>{qual.summary}</Text>
              </View>
            ) : null}

            <InsightsPanel score={score} />

            <Text style={styles.sectionHeading}>Section Breakdown</Text>
            {score.sectionScores.map(s => (
              <SectionBar key={s.sectionId} section={s} />
            ))}
          </>
        ) : (
          <>
            {qual.summary ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryText}>{qual.summary}</Text>
              </View>
            ) : null}
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No checklist items yet</Text>
              <Text style={styles.emptyHint}>Tap "Rate checklist" below to get started once items are added.</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky bottom action bar */}
      <View style={styles.stickyBar}>
        <Pressable
          onPress={() => router.push(`/qualification/${slug}/checklist`)}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.primaryBtnLabel}>Rate checklist</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/qualification/${slug}/history`)}
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.secondaryBtnLabel}>View history</Text>
        </Pressable>
      </View>
    </View>
  )
}

function StatChip({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, paddingBottom: 110 },

  /* Header */
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  pathway: { fontSize: 13, color: BRAND, marginTop: 4, fontWeight: '600' },

  /* Favourite button — geometric dot */
  favBtn: { paddingLeft: 12, paddingTop: 4 },
  favDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ef4444',
    backgroundColor: 'transparent',
  },
  favDotActive: {
    backgroundColor: '#ef4444',
  },

  /* Ring + stats */
  ringRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  statsCol: { flex: 1, gap: 8 },
  statChip: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statLabel: { fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#111827' },

  /* Summary card */
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryText: { fontSize: 14, color: '#374151', lineHeight: 21 },

  /* Section breakdown heading */
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 20,
  },

  /* Empty state */
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#374151', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyHint: { color: '#9ca3af', fontSize: 13, textAlign: 'center', lineHeight: 18 },

  /* Sticky bottom bar */
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnLabel: { color: '#374151', fontWeight: '700', fontSize: 15 },
})
