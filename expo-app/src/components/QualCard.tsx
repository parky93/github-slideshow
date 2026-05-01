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

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{qual.name}</Text>
        {qual.totalItems > 0 ? (
          <Text style={styles.meta}>
            {qual.ratedItems}/{qual.totalItems} rated · <Text style={{ color }}>{pct}%</Text>
          </Text>
        ) : (
          <Text style={styles.meta}>No checklist yet</Text>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  indicator: {
    width: 4,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    padding: 14,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
  },
  arrow: {
    fontSize: 20,
    color: '#9ca3af',
    paddingRight: 14,
  },
})
