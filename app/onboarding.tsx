import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
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
              <View style={[styles.groupDot, { backgroundColor: '#4A8B28' }]} />
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
              <View style={[styles.groupDot, { backgroundColor: '#C4621A' }]} />
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
          style={({ pressed }) => [styles.getStartedBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.getStartedLabel}>
            {selected.size === 0 ? 'Get started (show all)' : `Get started with ${selected.size} qual${selected.size !== 1 ? 's' : ''}`}
          </Text>
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
  screen: { flex: 1, backgroundColor: '#0F1A0A' },
  scrollView: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 32, paddingBottom: 24 },

  header: { marginBottom: 24 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ECF0E6',
    letterSpacing: -0.4,
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8FA882',
    lineHeight: 20,
  },

  selectAllRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  selectAllBtn: {
    backgroundColor: '#1A2E10',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#2E4A1E',
  },
  selectAllLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8FA882',
  },

  group: { marginBottom: 20 },
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
    color: '#8FA882',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },

  qualCard: {
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2E4A1E',
    marginBottom: 8,
    overflow: 'hidden',
  },
  qualCardSelected: {
    borderColor: '#4A8B28',
    backgroundColor: '#1A2E10',
  },
  qualCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  qualCardText: { flex: 1 },
  qualName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8FA882',
    lineHeight: 20,
  },
  qualNameSelected: {
    color: '#ECF0E6',
  },
  qualPathway: {
    fontSize: 12,
    color: '#536644',
    marginTop: 3,
  },

  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#536644',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxOuterSelected: {
    borderColor: '#4A8B28',
    backgroundColor: '#4A8B28',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },

  bottomPad: { height: 16 },

  footer: {
    backgroundColor: '#0A1306',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: '#2E4A1E',
  },
  getStartedBtn: {
    backgroundColor: '#4A8B28',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  getStartedLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
