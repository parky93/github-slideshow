import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { C, RADIUS, GRAD } from '@/lib/theme'
import { getJSON, setJSON } from '@/lib/db/client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { StoredQual } from '@/lib/db/seed'

interface QualOption {
  id: number
  slug: string
  name: string
  category: string
  pathway: string | null
}

export default function OnboardingScreen({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter()
  const [quals, setQuals] = useState<QualOption[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function load() {
      const stored = (await getJSON<StoredQual[]>('mta:quals')) ?? []
      const options: QualOption[] = stored.map(q => ({
        id: q.id,
        slug: q.slug,
        name: q.name,
        category: q.category,
        pathway: q.pathway,
      }))
      setQuals(options)
      // Pre-select any already saved active quals
      const active = await getJSON<number[]>('mta:active-quals')
      if (active && active.length > 0) {
        setSelected(new Set(active))
      }
    }
    load()
  }, [])

  const walking = quals.filter(q => q.category === 'walking')
  const climbing = quals.filter(q => q.category !== 'walking')

  const toggleQual = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(quals.map(q => q.id)))
  const deselectAll = () => setSelected(new Set())

  const handleGetStarted = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const activeIds = Array.from(selected)
    await setJSON('mta:active-quals', activeIds)
    await AsyncStorage.setItem('mta:onboarded', 'true')
    if (onComplete) {
      onComplete()
    } else {
      router.replace('/')
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Which qualifications are you working toward?</Text>
          <Text style={styles.subtitle}>You can change this anytime in settings</Text>
        </View>

        {/* Select all / deselect all */}
        <View style={styles.selectAllRow}>
          <Pressable
            onPress={selectAll}
            style={({ pressed }) => [styles.selectAllBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.selectAllLabel}>Select all</Text>
          </Pressable>
          <Pressable
            onPress={deselectAll}
            style={({ pressed }) => [styles.selectAllBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.selectAllLabel}>Deselect all</Text>
          </Pressable>
        </View>

        {/* Walking */}
        {walking.length > 0 && (
          <View style={styles.group}>
            <View style={styles.groupLabelRow}>
              <View style={[styles.groupDot, { backgroundColor: C.greenBright }]} />
              <Text style={styles.groupLabel}>Walking</Text>
            </View>
            {walking.map(q => (
              <QualPill
                key={q.id}
                qual={q}
                selected={selected.has(q.id)}
                onToggle={() => toggleQual(q.id)}
              />
            ))}
          </View>
        )}

        {/* Climbing & Coaching */}
        {climbing.length > 0 && (
          <View style={styles.group}>
            <View style={styles.groupLabelRow}>
              <View style={[styles.groupDot, { backgroundColor: C.orange }]} />
              <Text style={styles.groupLabel}>Climbing & Coaching</Text>
            </View>
            {climbing.map(q => (
              <QualPill
                key={q.id}
                qual={q}
                selected={selected.has(q.id)}
                onToggle={() => toggleQual(q.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Get started button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleGetStarted}
          style={({ pressed }) => [styles.getStartedShadow, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
        >
          <LinearGradient
            colors={GRAD.cta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.getStartedBtn}
          >
            <Text style={styles.getStartedLabel}>
              {selected.size === 0 ? 'Get started (show all)' : `Get started with ${selected.size} qual${selected.size !== 1 ? 's' : ''}`}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  )
}

function QualPill({
  qual,
  selected,
  onToggle,
}: {
  qual: QualOption
  selected: boolean
  onToggle: () => void
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.qualCard,
        selected && styles.qualCardSelected,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={styles.qualCardInner}>
        <View style={styles.qualCardText}>
          <Text style={[styles.qualName, selected && styles.qualNameSelected]}>
            {qual.name}
          </Text>
          {qual.pathway && (
            <Text style={styles.qualPathway}>{qual.pathway}</Text>
          )}
        </View>
        <View style={[styles.checkboxOuter, selected && styles.checkboxOuterSelected]}>
          {selected && <View style={styles.checkboxInner} />}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 24 },

  header: { marginBottom: 24 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: C.textSec,
    lineHeight: 20,
  },

  selectAllRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  selectAllBtn: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: C.border,
  },
  selectAllLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSec,
  },

  group: { marginBottom: 24 },
  groupLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textSec,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  qualCard: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  qualCardSelected: {
    borderColor: C.greenBright,
    backgroundColor: C.surfaceHi,
  },
  qualCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  qualCardText: { flex: 1 },
  qualName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textSec,
    lineHeight: 20,
  },
  qualNameSelected: {
    color: C.text,
    fontWeight: '700',
  },
  qualPathway: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 3,
  },

  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxOuterSelected: {
    borderColor: C.greenBright,
    backgroundColor: C.greenBright,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0A0F08',
  },

  bottomPad: { height: 16 },

  footer: {
    backgroundColor: C.bgElevated,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  getStartedShadow: {
    borderRadius: RADIUS.lg,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  getStartedBtn: {
    borderRadius: RADIUS.lg,
    paddingVertical: 17,
    alignItems: 'center',
  },
  getStartedLabel: {
    color: '#0A0F08',
    fontSize: 16,
    fontWeight: '800',
  },
})
