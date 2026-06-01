import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { RATING_LABELS, RATING_COLORS, RATING_ACTIVE_COLORS } from '../lib/types'
import type { RatingValue } from '../lib/types'

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
        return (
          <Pressable
            key={r}
            onPress={() => !disabled && onChange(r)}
            style={({ pressed }) => [
              styles.pill,
              { backgroundColor: active ? RATING_ACTIVE_COLORS[r] : RATING_COLORS[r] },
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
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  pillPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8FA882',
  },
  labelActive: {
    color: '#ECF0E6',
    fontWeight: '700',
  },
})
