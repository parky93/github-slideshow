import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { TRAFFIC_COLORS } from '../lib/types'
import type { TrafficLight } from '../lib/types'
import { getReadinessLabel } from '../lib/scoring/score'

interface Props {
  score: number
  light: TrafficLight
  size?: number
}

export function ReadinessRing({ score, light, size = 120 }: Props) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(1, Math.max(0, score)))
  const color = TRAFFIC_COLORS[light]
  const pct = Math.round(score * 100)

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1A2E10"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.label, { width: size, height: size }]}>
        <Text style={[styles.pct, { color }]}>{pct}%</Text>
        <Text style={styles.hint} numberOfLines={2}>{getReadinessLabel(score)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pct: {
    fontSize: 26,
    fontWeight: '700',
  },
  hint: {
    fontSize: 11,
    color: '#8FA882',
    textAlign: 'center',
    marginTop: 2,
  },
})
