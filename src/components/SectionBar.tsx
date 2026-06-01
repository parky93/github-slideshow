import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { SectionScore } from '../lib/types'
import { C, RADIUS, STATUS } from '../lib/theme'

interface Props {
  section: SectionScore
}

export function SectionBar({ section }: Props) {
  const color = STATUS[section.light]
  const pct = Math.round(section.score * 100)
  const completion = Math.round(section.completion * 100)

  const fillColors: [string, string] = section.light === 'green'
    ? [C.greenBright, C.green]
    : section.light === 'amber'
      ? [C.amber, '#fde68a']
      : [C.red, '#fca5a5']

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{section.title}</Text>
        <Text style={[styles.score, { color }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={fillColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${Math.max(pct, 2)}%` as any }]}
        />
      </View>
      <Text style={styles.sub}>{completion}% rated</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.borderSubtle,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    flex: 1,
    marginRight: 8,
  },
  score: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    backgroundColor: C.bg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  sub: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 6,
    textAlign: 'right',
    fontWeight: '600',
  },
})
