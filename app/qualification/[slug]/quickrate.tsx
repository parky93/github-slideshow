import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { RatingPills } from '@/components/RatingPills'
import { getQualificationBySlug, getSectionsWithItems } from '@/lib/db/queries/qualifications'
import { upsertRating } from '@/lib/db/queries/ratings'
import type { ChecklistItem, Section, RatingValue } from '@/lib/types'
import { C } from '@/lib/theme'

interface QueueItem {
  item: ChecklistItem
  sectionTitle: string
}

export default function QuickRateScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [originalCount, setOriginalCount] = useState(0)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const qual = await getQualificationBySlug(slug)
      if (!qual) return
      const sections: Section[] = await getSectionsWithItems(qual.id)
      const unrated: QueueItem[] = []
      for (const section of sections) {
        for (const item of section.items) {
          if (!item.rating?.ratingValue) {
            unrated.push({ item, sectionTitle: section.title })
          }
        }
      }
      setQueue(unrated)
      setOriginalCount(unrated.length)
      if (unrated.length === 0) setDone(true)
    }
    load()
  }, [slug])

  const current = queue[0] ?? null
  const remaining = queue.length

  const handleRate = useCallback(async (value: RatingValue) => {
    if (!current || saving) return
    setSaving(true)
    try {
      await upsertRating(current.item.id, { ratingValue: value })
      setQueue(prev => {
        const next = prev.slice(1)
        if (next.length === 0) setDone(true)
        return next
      })
    } finally {
      setSaving(false)
    }
  }, [current, saving])

  const handleSkip = useCallback(() => {
    if (!current) return
    setQueue(prev => {
      if (prev.length <= 1) return prev
      const [first, ...rest] = prev
      return [...rest, first]
    })
  }, [current])

  if (done) {
    return (
      <View style={styles.screen}>
        <View style={styles.completionWrap}>
          {/* Green checkmark drawn with Views */}
          <View style={styles.checkCircle}>
            <View style={styles.checkLeft} />
            <View style={styles.checkRight} />
          </View>
          <Text style={styles.completionTitle}>All items rated!</Text>
          <Text style={styles.completionSub}>
            {originalCount === 0
              ? 'There were no unrated items for this qualification.'
              : `You rated ${originalCount} item${originalCount !== 1 ? 's' : ''}.`}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.doneBtnLabel}>Done</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (!current) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: C.textSec, fontSize: 14 }}>Loading…</Text>
      </View>
    )
  }

  const progress = originalCount - remaining

  return (
    <View style={styles.screen}>
      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: originalCount > 0 ? `${(progress / originalCount) * 100}%` : '0%' },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>{remaining} of {originalCount} remaining</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{current.sectionTitle}</Text>
        <Text style={styles.promptText}>{current.item.prompt}</Text>
      </View>

      {/* Rating pills */}
      <View style={styles.ratingWrap}>
        <Text style={styles.ratingLabel}>How would you rate this?</Text>
        <RatingPills
          value={current.item.rating?.ratingValue ?? null}
          onChange={handleRate}
          disabled={saving}
        />
      </View>

      {/* Skip */}
      <Pressable
        onPress={handleSkip}
        style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.skipLabel}>Skip for now</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 20 },

  progressRow: {
    marginBottom: 24,
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: C.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.green,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.green,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  promptText: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    lineHeight: 32,
    letterSpacing: -0.3,
  },

  ratingWrap: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
    gap: 12,
  },
  ratingLabel: {
    fontSize: 13,
    color: C.textSec,
    fontWeight: '600',
  },

  skipBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: Platform.OS === 'ios' ? 10 : 4,
  },
  skipLabel: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: '600',
  },

  /* Completion screen */
  completionWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.surfaceHi,
    borderWidth: 3,
    borderColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  checkLeft: {
    position: 'absolute',
    width: 14,
    height: 3,
    backgroundColor: C.green,
    borderRadius: 2,
    bottom: 28,
    left: 16,
    transform: [{ rotate: '45deg' }],
  },
  checkRight: {
    position: 'absolute',
    width: 28,
    height: 3,
    backgroundColor: C.green,
    borderRadius: 2,
    bottom: 30,
    right: 12,
    transform: [{ rotate: '-55deg' }],
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.3,
  },
  completionSub: {
    fontSize: 14,
    color: C.textSec,
    textAlign: 'center',
    lineHeight: 20,
  },
  doneBtn: {
    marginTop: 16,
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  doneBtnLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
