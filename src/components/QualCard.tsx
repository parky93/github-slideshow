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
        <View style={[styles.accent, { backgroundColor: color }]} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={2}>{qual.name}</Text>
            <View style={styles.chevronWrap}>
              <View style={[styles.chevronLine, { backgroundColor: C.textMuted }]} />
              <View style={[styles.chevronLine2, { backgroundColor: C.textMuted }]} />
            </View>
          </View>

          {hasChecklist ? (
            <>
              <View style={styles.statRow}>
                <Text style={[styles.pct, { color }]}>{pct}<Text style={styles.pctSign}>%</Text></Text>
                <Text style={styles.meta}>{qual.ratedItems}/{qual.totalItems} rated</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={fillColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${Math.max(pct, 2)}%` as any }]}
                />
              </View>
            </>
          ) : (
            <View style={styles.emptyChip}>
              <Text style={styles.emptyChipText}>No checklist yet</Text>
            </View>
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginRight: 8,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    gap: 10,
  },
  pct: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  pctSign: {
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    fontSize: 12,
    color: C.textSec,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    backgroundColor: C.bg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyChip: {
    alignSelf: 'flex-start',
    backgroundColor: C.surfaceHi,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 2,
  },
  emptyChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chevronWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
    marginTop: 2,
  },
  chevronLine: {
    position: 'absolute',
    width: 9,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateY: -3 }],
  },
  chevronLine2: {
    position: 'absolute',
    width: 9,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: 3 }],
  },
})
