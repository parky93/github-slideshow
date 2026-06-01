import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { getIsPro, setIsPro } from '@/lib/dlog/storage'
import { C, RADIUS } from '@/lib/theme'

export default function SettingsScreen() {
  const router = useRouter()
  const [isPro, setIsProState] = useState(false)

  useEffect(() => {
    getIsPro().then(v => setIsProState(v))
  }, [])

  const handleResetQuals = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await AsyncStorage.multiRemove(['mta:onboarded', 'mta:active-quals'])
    router.replace('/onboarding')
  }

  const handleProToggle = async (v: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsProState(v)
    await setIsPro(v)
  }

  return (
    <View style={styles.screen}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Qualifications</Text>

        <Pressable
          onPress={handleResetQuals}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
        >
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Reset active qualifications</Text>
            <Text style={styles.rowHint}>Choose which qualifications to track from scratch</Text>
          </View>
          <View style={styles.chevron}>
            <View style={styles.chevronLine1} />
            <View style={styles.chevronLine2} />
          </View>
        </Pressable>
      </View>

      {/* Developer tools */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Developer Tools</Text>

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Pro access</Text>
            <Text style={styles.rowHint}>For testing only — enables DLOG Toolkit</Text>
          </View>
          <Switch
            value={isPro}
            onValueChange={handleProToggle}
            trackColor={{ false: C.border, true: C.green }}
            thumbColor={C.text}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 20 },

  section: {
    marginTop: 16,
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 12,
  },
  rowContent: { flex: 1 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  rowHint: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 3,
    lineHeight: 17,
  },

  chevron: {
    width: 16,
    height: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLine1: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: C.textMuted,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateY: -3 }],
  },
  chevronLine2: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: C.textMuted,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: 3 }],
  },
})
