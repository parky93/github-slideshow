import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import type { TrafficLight } from '../lib/types'
import { getReadinessLabel } from '../lib/scoring/score'
import { C, STATUS } from '../lib/theme'

interface Props {
  score: number
  light: TrafficLight
  size?: number
}

const RING_GRADIENTS: Record<TrafficLight, [string, string]> = {
  green: [C.greenBright, C.green],
  amber: [C.amber, '#fde68a'],
  red: [C.red, '#fca5a5'],
}

export function ReadinessRing({ score, light, size = 120 }: Props) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, score))
  const offset = circumference * (1 - clamped)
  const [from, to] = RING_GRADIENTS[light]
  const pct = Math.round(score * 100)
  const labelColor = STATUS[light]

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={C.surfaceHi}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
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
        <Text style={[styles.pct, { color: labelColor, fontSize: size * 0.3 }]}>{pct}</Text>
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
    fontWeight: '800',
    letterSpacing: -1,
  },
  hint: {
    fontSize: 10,
    color: C.textSec,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
})
