import React, { useRef } from 'react'
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import type { QualificationWithMeta } from '../lib/types'
import { getTrafficLight } from '../lib/scoring/score'
import { C, RADIUS, STATUS } from '../lib/theme'

interface Props {
  qual: QualificationWithMeta
  onPress: () => void
}

export function QualCard({ qual, onPress }: Props) {
  const light = qual.totalItems > 0 ? getTrafficLight(qual.readinessScore) : null
  const pct = Math.round(qual.readinessScore * 100)
  const color = light ? STATUS[light] : C.textMuted
  const hasChecklist = qual.totalItems > 0

  const scale = useRef(new Animated.Value(1)).current

  const fillColors: [string, string] = light === 'green'
    ? [C.green, C.greenBright]
    : light === 'amber'
      ? [C.amber, '#fde68a']
      : [C.red, '#fca5a5']

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={() => {
          Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 4 }).start()
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }}
        onPressOut={() => {
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start()
        }}
        onPress={onPress}
        style={styles.pressable}
        accessibilityRole="button"
      >
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={2}>{qual.name}</Text>
            {hasChecklist ? (
              <View style={styles.numCol}>
                <View style={styles.numRow}>
                  <Text style={[styles.pct, { color }]}>{pct}</Text>
                  <Text style={[styles.pctSign, { color }]}>%</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyChip}>
                <Text style={styles.emptyChipText}>No checklist</Text>
              </View>
            )}
          </View>

          {hasChecklist && (
            <>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={fillColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.max(pct, 2)}%` as any }]}
                />
              </View>
              <Text style={styles.meta}>{qual.ratedItems}/{qual.totalItems} rated</Text>
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  pressable: {},
  body: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginRight: 12,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  numCol: {
    alignItems: 'flex-end',
  },
  numRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pct: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 40,
    fontVariant: ['tabular-nums'],
  },
  pctSign: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    marginLeft: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: C.bg,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  meta: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '600',
    textAlign: 'right',
    letterSpacing: 0.2,
  },
  emptyChip: {
    alignSelf: 'flex-start',
    backgroundColor: C.surfaceHi,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 3,
    borderWidth: 1,
    borderColor: C.borderSubtle,
  },
  emptyChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
})
