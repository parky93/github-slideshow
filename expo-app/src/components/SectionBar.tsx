import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TRAFFIC_COLORS } from '../lib/types'
import type { SectionScore } from '../lib/types'

interface Props {
  section: SectionScore
}

export function SectionBar({ section }: Props) {
  const color = TRAFFIC_COLORS[section.light]
  const pct = Math.round(section.score * 100)
  const completion = Math.round(section.completion * 100)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{section.title}</Text>
        <Text style={[styles.score, { color }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.sub}>{completion}% rated</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  score: {
    fontSize: 14,
    fontWeight: '700',
  },
  track: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  sub: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
})
