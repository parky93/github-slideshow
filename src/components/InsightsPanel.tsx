import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { ReadinessScore } from '../lib/types'
import { generateInsights } from '../lib/scoring/insights'
import { C, RADIUS } from '../lib/theme'

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
          indicatorColor={C.red}
          label="Focus area"
          value={insights.weakestSection}
          valueColor={C.red}
        />
      )}
      {insights.strongestSection && insights.strongestSection !== insights.weakestSection && (
        <AccentRow
          indicatorColor={C.greenStatus}
          label="Strongest"
          value={insights.strongestSection}
          valueColor={C.greenStatus}
        />
      )}
      {insights.topToImprove.length > 0 && (
        <View style={styles.row}>
          <View style={[styles.indicator, { backgroundColor: C.amber }]} />
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
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  accentRow: {
    borderLeftWidth: 3,
    borderLeftColor: C.border,
    paddingLeft: 14,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 4,
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
    fontWeight: '700',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.textMuted,
    marginRight: 8,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 13,
    color: C.textSec,
    flex: 1,
    lineHeight: 18,
  },
})
