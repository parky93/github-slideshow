import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { TRAFFIC_COLORS } from '../lib/types'
import type { QualificationWithMeta } from '../lib/types'
import { getTrafficLight } from '../lib/scoring/score'

interface Props {
  qual: QualificationWithMeta
  onPress: () => void
}

export function QualCard({ qual, onPress }: Props) {
  const light = qual.totalItems > 0 ? getTrafficLight(qual.readinessScore) : null
  const pct = Math.round(qual.readinessScore * 100)
  const color = light ? TRAFFIC_COLORS[light] : '#d1d5db'
  const hasChecklist = qual.totalItems > 0

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
    >
      {/* Left color indicator — 6px wide */}
      <View style={[styles.indicator, { backgroundColor: color }]} />

      {/* Main body */}
      <View style={styles.body}>
        {/* Top row: name + badge */}
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>{qual.name}</Text>
          {hasChecklist ? (
            <View style={[styles.badge, { backgroundColor: color + '22' }]}>
              <Text style={[styles.badgeText, { color }]}>{pct}%</Text>
            </View>
          ) : (
            <View style={styles.badgeMuted}>
              <Text style={styles.badgeTextMuted}>—</Text>
            </View>
          )}
        </View>

        {/* Meta line */}
        {hasChecklist ? (
          <Text style={styles.meta}>
            {qual.ratedItems}/{qual.totalItems} rated
          </Text>
        ) : (
          <View style={styles.noChecklistBadge}>
            <Text style={styles.noChecklistText}>No checklist yet</Text>
          </View>
        )}

        {/* Progress bar — bottom of body */}
        {hasChecklist && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%` as any, backgroundColor: color },
              ]}
            />
          </View>
        )}
      </View>

      {/* Arrow */}
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  indicator: {
    width: 6,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
    lineHeight: 21,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeMuted: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
  },
  badgeTextMuted: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
  },
  meta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 10,
  },
  noChecklistBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
  },
  noChecklistText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  arrow: {
    fontSize: 20,
    color: '#9ca3af',
    paddingRight: 14,
  },
})
