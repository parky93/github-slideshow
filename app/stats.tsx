import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { getAllQualifications, getCoachingNeeds } from '@/lib/db/queries/qualifications'
import { getTargetDate, daysUntil } from '@/lib/db/queries/ratings'
import type { QualificationWithMeta } from '@/lib/types'

const BG = '#0F1A0A'
const SURFACE = '#1A2E10'
const SURFACE_2 = '#243D17'
const BORDER = '#2E4A1E'
const PRIMARY = '#4A8B28'
const ORANGE = '#C4621A'
const ORANGE_LT = '#E8893A'
const HEADER_BG = '#0A1306'
const TEXT_PRI = '#ECF0E6'
const TEXT_SEC = '#8FA882'
const TEXT_MUT = '#536644'

const RED = '#EF4444'
const AMBER = '#F59E0B'
const GREEN = '#22C55E'

function trafficColor(score: number): string {
  if (score >= 0.65) return GREEN
  if (score >= 0.35) return AMBER
  return RED
}

interface TargetEntry {
  qual: QualificationWithMeta
  dateStr: string
  days: number
}

export default function StatsScreen() {
  const router = useRouter()
  const [quals, setQuals] = useState<QualificationWithMeta[]>([])
  const [coachingCount, setCoachingCount] = useState(0)
  const [targets, setTargets] = useState<TargetEntry[]>([])

  useFocusEffect(
    useCallback(() => {
      let active = true
      async function load() {
        const [allQuals, coachingItems] = await Promise.all([
          getAllQualifications(),
          getCoachingNeeds(),
        ])
        if (!active) return

        setQuals(allQuals)
        setCoachingCount(coachingItems.length)

        const targetEntries: TargetEntry[] = []
        for (const q of allQuals) {
          const td = await getTargetDate(q.id)
          if (td) {
            const days = daysUntil(td.date)
            if (days >= 0) {
              targetEntries.push({ qual: q, dateStr: td.date, days })
            }
          }
        }
        targetEntries.sort((a, b) => a.days - b.days)
        if (active) setTargets(targetEntries)
      }
      load()
      return () => { active = false }
    }, []),
  )

  const totalItems = quals.reduce((s, q) => s + q.totalItems, 0)
  const totalRated = quals.reduce((s, q) => s + q.ratedItems, 0)
  const activeQuals = quals.filter(q => q.ratedItems > 0)
  const avgReadiness =
    activeQuals.length > 0
      ? activeQuals.reduce((s, q) => s + q.readinessScore, 0) / activeQuals.length
      : 0
  const sortedActive = [...activeQuals].sort((a, b) => b.readinessScore - a.readinessScore)
  const recentlyViewed = [...quals]
    .filter(q => q.lastViewedAt !== null)
    .sort((a, b) => (b.lastViewedAt! > a.lastViewedAt! ? 1 : -1))
    .slice(0, 5)

  function formatDate(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Top stat cards */}
      <View style={styles.cardRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {totalRated}/{totalItems}
          </Text>
          <Text style={styles.statLabel}>Items rated</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {activeQuals.length > 0 ? Math.round(avgReadiness * 100) : 0}%
          </Text>
          <Text style={styles.statLabel}>Avg readiness</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, coachingCount > 0 && { color: ORANGE_LT }]}>
            {coachingCount}
          </Text>
          <Text style={styles.statLabel}>Coaching flags</Text>
        </View>
      </View>

      {/* Active qualifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: PRIMARY }]} />
          <Text style={styles.sectionTitle}>Active qualifications</Text>
          {sortedActive.length > 0 && (
            <Text style={styles.sectionCount}>{sortedActive.length}</Text>
          )}
        </View>

        {sortedActive.length === 0 ? (
          <Text style={styles.emptyMsg}>No qualifications rated yet</Text>
        ) : (
          sortedActive.map(q => {
            const pct = Math.round(q.readinessScore * 100)
            const dot = trafficColor(q.readinessScore)
            return (
              <Pressable
                key={q.slug}
                style={styles.qualRow}
                onPress={() => router.push(`/qualification/${q.slug}`)}
              >
                <View style={styles.qualRowTop}>
                  <Text style={styles.qualName} numberOfLines={1}>{q.name}</Text>
                  <View style={[styles.trafficDot, { backgroundColor: dot }]} />
                  <Text style={[styles.qualPct, { color: dot }]}>{pct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${pct}%` as any, backgroundColor: dot },
                    ]}
                  />
                </View>
              </Pressable>
            )
          })
        )}
      </View>

      {/* Upcoming targets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: ORANGE }]} />
          <Text style={styles.sectionTitle}>Upcoming targets</Text>
          {targets.length > 0 && (
            <Text style={styles.sectionCount}>{targets.length}</Text>
          )}
        </View>

        {targets.length === 0 ? (
          <Text style={styles.emptyMsg}>No target dates set</Text>
        ) : (
          targets.map(({ qual, dateStr, days }) => (
            <Pressable
              key={qual.slug}
              style={styles.targetRow}
              onPress={() => router.push(`/qualification/${qual.slug}`)}
            >
              <View style={styles.targetInfo}>
                <Text style={styles.targetName} numberOfLines={1}>{qual.name}</Text>
                <Text style={styles.targetDate}>{formatDate(dateStr)}</Text>
              </View>
              <View style={styles.daysBadge}>
                <Text style={styles.daysText}>
                  {days === 0 ? 'Today' : `${days}d`}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Recently viewed */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: TEXT_SEC }]} />
          <Text style={styles.sectionTitle}>Recently viewed</Text>
        </View>

        {recentlyViewed.length === 0 ? (
          <Text style={styles.emptyMsg}>No quals viewed yet</Text>
        ) : (
          <View style={styles.pillWrap}>
            {recentlyViewed.map(q => (
              <Pressable
                key={q.slug}
                style={styles.pill}
                onPress={() => router.push(`/qualification/${q.slug}`)}
              >
                <Text style={styles.pillText} numberOfLines={1}>{q.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  container: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48 },

  /* Top stat cards */
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_PRI,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },

  /* Section */
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_SEC,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_MUT,
  },
  emptyMsg: {
    fontSize: 13,
    color: TEXT_MUT,
    paddingVertical: 8,
  },

  /* Active qual rows */
  qualRow: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  qualRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  qualName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRI,
  },
  trafficDot: { width: 8, height: 8, borderRadius: 4 },
  qualPct: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  barTrack: {
    height: 4,
    backgroundColor: SURFACE_2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },

  /* Target rows */
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  },
  targetInfo: { flex: 1 },
  targetName: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRI,
    marginBottom: 2,
  },
  targetDate: {
    fontSize: 12,
    color: TEXT_SEC,
  },
  daysBadge: {
    backgroundColor: ORANGE + '22',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  daysText: {
    fontSize: 12,
    fontWeight: '700',
    color: ORANGE_LT,
  },

  /* Recently viewed pills */
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    backgroundColor: SURFACE_2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_SEC,
  },
})
