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
        <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.sub}>{completion}% rated</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ECF0E6',
    flex: 1,
    marginRight: 8,
  },
  score: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 8,
    backgroundColor: '#1A2E10',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  sub: {
    fontSize: 11,
    color: '#536644',
    marginTop: 4,
    textAlign: 'right',
  },
})
