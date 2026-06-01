import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { RATING_LABELS, RATING_ACTIVE_COLORS, RATING_COLORS } from '../lib/types'
import type { RatingValue } from '../lib/types'
import { C } from '../lib/theme'

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
        const accentColor = RATING_ACTIVE_COLORS[r]
        const bgColor = active ? RATING_COLORS[r] : C.surfaceHi
        const borderColor = active ? accentColor : C.border
        const textColor = active ? accentColor : C.textMuted
        return (
          <Pressable
            key={r}
            onPress={() => !disabled && onChange(r)}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: bgColor, borderColor },
              pressed && styles.btnPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, { color: textColor }]}>
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
    gap: 5,
  },
  btn: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  btnPressed: {
    transform: [{ scale: 0.94 }],
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
  },
})
