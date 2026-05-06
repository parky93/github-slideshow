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
        {/* Top row: name + readiness badge */}
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>{qual.name}</Text>
          {hasChecklist ? (
            <View style={[styles.badge, { backgroundColor: color + '22' }]}>
              <Text style={[styles.badgeText, { color }]}>{pct}%</Text>
            </View>
          ) : (
            <View style={styles.badgeMuted}>
              <Text style={styles.badgeTextMuted}>No checklist yet</Text>
            </View>
          )}
        </View>

        {/* Meta line */}
        {hasChecklist && (
          <Text style={styles.meta}>
            {qual.ratedItems}/{qual.totalItems} rated
          </Text>
        )}

        {/* Progress bar */}
        {hasChecklist ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%` as any, backgroundColor: color },
              ]}
            />
          </View>
        ) : (
          <View style={styles.progressTrackEmpty} />
        )}
      </View>

      {/* Chevron */}
      <View style={styles.chevronWrap}>
        <View style={styles.chevronLine} />
        <View style={styles.chevronLine2} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.984 }],
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  indicator: {
    width: 6,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#ECF0E6',
    marginRight: 8,
    lineHeight: 21,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeMuted: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#243D17',
    alignSelf: 'flex-start',
  },
  badgeTextMuted: {
    fontSize: 11,
    fontWeight: '500',
    color: '#536644',
  },
  meta: {
    fontSize: 12,
    color: '#8FA882',
    marginBottom: 10,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#0F1A0A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressTrackEmpty: {
    height: 4,
    backgroundColor: '#0F1A0A',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  /* Geometric chevron — two lines forming a > */
  chevronWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 16,
    paddingLeft: 4,
    width: 28,
  },
  chevronLine: {
    width: 8,
    height: 2,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: -2.5 }],
  },
  chevronLine2: {
    width: 8,
    height: 2,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateY: 2.5 }],
  },
})
