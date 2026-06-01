import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { RATING_LABELS, RATING_ACTIVE_COLORS } from '../lib/types'
import type { RatingValue } from '../lib/types'
import { C, RADIUS } from '../lib/theme'

interface Props {
  value: RatingValue | null
  onChange: (v: RatingValue) => void
  disabled?: boolean
}

const RATINGS: RatingValue[] = [1, 2, 3, 4, 5]

export function RatingPills({ value, onChange, disabled }: Props) {
  return (
    <View style={styles.row}>
      {RATINGS.map(r => {
        const active = value === r
        const activeColor = RATING_ACTIVE_COLORS[r]
        return (
          <Pressable
            key={r}
            onPress={() => !disabled && onChange(r)}
            style={({ pressed }) => [
              styles.pill,
              active
                ? { backgroundColor: activeColor, borderColor: activeColor }
                : { backgroundColor: C.surfaceHi, borderColor: C.border },
              active && styles.pillActive,
              pressed && styles.pillPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {RATING_LABELS[r]}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  pillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  pillPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSec,
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
})
