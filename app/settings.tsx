import React, { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { getIsPro, setIsPro } from '@/lib/dlog/storage'

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
            trackColor={{ false: '#2E4A1E', true: '#4A8B28' }}
            thumbColor="#ECF0E6"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F1A0A', padding: 16 },

  section: {
    marginTop: 16,
    backgroundColor: '#1A2E10',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#536644',
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
    borderTopColor: '#2E4A1E',
    gap: 12,
  },
  rowContent: { flex: 1 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ECF0E6',
  },
  rowHint: {
    fontSize: 12,
    color: '#536644',
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
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateY: -3 }],
  },
  chevronLine2: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: 3 }],
  },
})
