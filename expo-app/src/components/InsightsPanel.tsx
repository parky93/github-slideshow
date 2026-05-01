import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { ReadinessScore } from '../lib/types'
import { generateInsights } from '../lib/scoring/insights'

interface Props {
  score: ReadinessScore
}

export function InsightsPanel({ score }: Props) {
  const insights = generateInsights(score)
  if (!insights.weakestSection) return null

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Insights</Text>

      {insights.weakestSection && (
        <Row emoji="🎯" label="Focus area" value={insights.weakestSection} color="#ef4444" />
      )}
      {insights.strongestSection && insights.strongestSection !== insights.weakestSection && (
        <Row emoji="💪" label="Strongest" value={insights.strongestSection} color="#22c55e" />
      )}
      {insights.topToImprove.length > 0 && (
        <View style={styles.row}>
          <Text style={styles.emoji}>📈</Text>
          <View style={styles.rowBody}>
            <Text style={styles.rowLabel}>Top to improve</Text>
            {insights.topToImprove.map(t => (
              <Text key={t} style={styles.bullet}>• {t}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

function Row({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, { color }]}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  heading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bullet: {
    fontSize: 13,
    color: '#374151',
    marginTop: 2,
  },
})
