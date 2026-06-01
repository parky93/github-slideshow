import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { getAllQualifications, getCoachingNeeds } from '@/lib/db/queries/qualifications'
import { getTargetDate, daysUntil } from '@/lib/db/queries/ratings'
import { C, RADIUS, GRAD, trafficColor } from '@/lib/theme'
import type { QualificationWithMeta } from '@/lib/types'

const BG = C.bg
const SURFACE = C.surface
const SURFACE_2 = C.surfaceHi
const BORDER = C.border
const PRIMARY = C.green
const ORANGE = C.orange
const ORANGE_LT = C.orange
const TEXT_PRI = C.text
const TEXT_SEC = C.textSec
const TEXT_MUT = C.textMuted

const RED = C.red
const AMBER = C.amber
const GREEN = C.greenStatus

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
      {/* Hero avg readiness tile */}
      <View style={styles.heroTile}>
        <LinearGradient
          colors={GRAD.greenGlow}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.heroLabel}>Average readiness</Text>
        <View style={styles.heroNumRow}>
          <Text style={styles.heroNum}>{activeQuals.length > 0 ? Math.round(avgReadiness * 100) : 0}</Text>
          <Text style={styles.heroPct}>%</Text>
        </View>
        <Text style={styles.heroSub}>across {activeQuals.length} active qualification{activeQuals.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Stat tiles */}
      <View style={styles.cardRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalRated}/{totalItems}</Text>
          <Text style={styles.statLabel}>Items rated</Text>
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
                      { width: `${Math.max(pct, 2)}%` as any, backgroundColor: dot },
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
  container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 },

  /* Hero tile */
  heroTile: {
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_MUT,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroNumRow: { flexDirection: 'row', alignItems: 'flex-start' },
  heroNum: { fontSize: 52, fontWeight: '800', color: TEXT_PRI, letterSpacing: -2, lineHeight: 54 },
  heroPct: { fontSize: 24, fontWeight: '800', color: C.greenBright, marginTop: 6, marginLeft: 2 },
  heroSub: { fontSize: 13, color: TEXT_SEC, marginTop: 4, fontWeight: '600' },

  /* Stat tiles */
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT_PRI,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_MUT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 6,
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
