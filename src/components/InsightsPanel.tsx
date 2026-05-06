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
        <AccentRow
          indicatorColor="#ef4444"
          label="Focus area"
          value={insights.weakestSection}
          valueColor="#ef4444"
        />
      )}
      {insights.strongestSection && insights.strongestSection !== insights.weakestSection && (
        <AccentRow
          indicatorColor="#22c55e"
          label="Strongest"
          value={insights.strongestSection}
          valueColor="#22c55e"
        />
      )}
      {insights.topToImprove.length > 0 && (
        <View style={styles.row}>
          <View style={[styles.indicator, { backgroundColor: '#f59e0b' }]} />
          <View style={styles.rowBody}>
            <Text style={styles.rowLabel}>Top to improve</Text>
            {insights.topToImprove.map(t => (
              <View key={t} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

function AccentRow({
  indicatorColor,
  label,
  value,
  valueColor,
}: {
  indicatorColor: string
  label: string
  value: string
  valueColor: string
}) {
  return (
    <View style={[styles.accentRow, { borderLeftColor: indicatorColor }]}>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, { color: valueColor }]}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#536644',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  /* Accented rows (focus / strongest) */
  accentRow: {
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
    paddingLeft: 12,
    marginBottom: 12,
  },

  /* Plain row (top to improve) */
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    marginTop: 3,
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    color: '#536644',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* Bullet list */
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#536644',
    marginRight: 8,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 13,
    color: '#8FA882',
    flex: 1,
    lineHeight: 18,
  },
})
