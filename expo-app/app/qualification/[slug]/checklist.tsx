import React, { useCallback, useState, useRef } from 'react'
import {
  View, Text, SectionList, Pressable, TextInput,
  StyleSheet, Animated,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { RatingPills } from '@/components/RatingPills'
import { getQualificationBySlug, getSectionsWithItems } from '@/lib/db/queries/qualifications'
import { upsertRating, saveSnapshot } from '@/lib/db/queries/ratings'
import { calculateReadinessScore } from '@/lib/scoring/score'
import { CONFIDENCE_LABELS } from '@/lib/types'
import type { Section, ChecklistItem, RatingValue } from '@/lib/types'

interface ListSection { title: string; data: ChecklistItem[] }

export default function ChecklistScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [sections, setSections] = useState<Section[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [saving, setSaving] = useState<number | null>(null)
  const notesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(() => {
    const q = getQualificationBySlug(slug)
    if (!q) return
    setSections(getSectionsWithItems(q.id))
  }, [slug])

  React.useEffect(() => { load() }, [load])

  const ratedCount = sections.flatMap(s => s.items).filter(i => i.rating?.ratingValue).length
  const totalCount = sections.flatMap(s => s.items).length

  const rate = useCallback((item: ChecklistItem, value: RatingValue) => {
    upsertRating(item.id, { ratingValue: value })
    setSaving(item.id)
    setSections(prev => prev.map(s => ({
      ...s,
      items: s.items.map(i => i.id === item.id
        ? { ...i, rating: { ...(i.rating ?? { id: 0, itemId: i.id, notes: '', tags: [], needsCoaching: false, updatedAt: '' }), ratingValue: value, confidenceValue: i.rating?.confidenceValue ?? null }  }
        : i),
    })))
    setTimeout(() => {
      setSaving(null)
      // Snapshot after each rating
      const q = getQualificationBySlug(slug)
      if (q) {
        const all = getSectionsWithItems(q.id)
        const score = calculateReadinessScore(all)
        if (score.completion > 0) saveSnapshot(q.id, score.overall, score.completion)
      }
    }, 300)
  }, [slug])

  const setConfidence = useCallback((item: ChecklistItem, value: number) => {
    upsertRating(item.id, { confidenceValue: value })
    setSections(prev => prev.map(s => ({
      ...s,
      items: s.items.map(i => i.id === item.id
        ? { ...i, rating: { ...(i.rating ?? { id: 0, itemId: i.id, ratingValue: null, notes: '', tags: [], needsCoaching: false, updatedAt: '' }), confidenceValue: value } }
        : i),
    })))
  }, [])

  const setNotes = useCallback((item: ChecklistItem, text: string) => {
    setSections(prev => prev.map(s => ({
      ...s,
      items: s.items.map(i => i.id === item.id
        ? { ...i, rating: { ...(i.rating ?? { id: 0, itemId: i.id, ratingValue: null, confidenceValue: null, tags: [], needsCoaching: false, updatedAt: '' }), notes: text } }
        : i),
    })))
    if (notesTimeout.current) clearTimeout(notesTimeout.current)
    notesTimeout.current = setTimeout(() => upsertRating(item.id, { notes: text }), 800)
  }, [])

  const listSections: ListSection[] = sections.map(s => ({ title: s.title, data: s.items }))

  return (
    <SectionList
      sections={listSections}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled
      ListHeaderComponent={
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: totalCount ? `${(ratedCount / totalCount) * 100}%` : '0%' }]} />
          <Text style={styles.progressLabel}>{ratedCount}/{totalCount} rated</Text>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <ItemRow
          item={item}
          isExpanded={expanded === item.id}
          isSaving={saving === item.id}
          onToggle={() => setExpanded(prev => prev === item.id ? null : item.id)}
          onRate={v => rate(item, v)}
          onConfidence={v => setConfidence(item, v)}
          onNotes={t => setNotes(item, t)}
        />
      )}
    />
  )
}

interface ItemRowProps {
  item: ChecklistItem
  isExpanded: boolean
  isSaving: boolean
  onToggle: () => void
  onRate: (v: RatingValue) => void
  onConfidence: (v: number) => void
  onNotes: (t: string) => void
}

function ItemRow({ item, isExpanded, isSaving, onToggle, onRate, onConfidence, onNotes }: ItemRowProps) {
  return (
    <View style={[styles.item, isSaving && styles.itemSaving]}>
      <Pressable onPress={onToggle} style={styles.itemHeader}>
        <Text style={styles.prompt}>{item.prompt}</Text>
        <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
      </Pressable>

      <View style={styles.ratingRow}>
        <RatingPills value={item.rating?.ratingValue ?? null} onChange={onRate} />
      </View>

      {isExpanded && (
        <View style={styles.detail}>
          {/* Confidence */}
          <Text style={styles.detailLabel}>Confidence</Text>
          <View style={styles.confRow}>
            {[1, 2, 3, 4, 5].map(v => (
              <Pressable
                key={v}
                onPress={() => onConfidence(v)}
                style={[styles.confPill, item.rating?.confidenceValue === v && styles.confPillActive]}
              >
                <Text style={[styles.confLabel, item.rating?.confidenceValue === v && styles.confLabelActive]}>
                  {v}
                </Text>
              </Pressable>
            ))}
          </View>
          {item.rating?.confidenceValue && (
            <Text style={styles.confText}>{CONFIDENCE_LABELS[item.rating.confidenceValue]}</Text>
          )}

          {/* Notes */}
          <Text style={[styles.detailLabel, { marginTop: 10 }]}>Notes</Text>
          <TextInput
            style={styles.notes}
            multiline
            placeholder="Add notes…"
            placeholderTextColor="#9ca3af"
            value={item.rating?.notes ?? ''}
            onChangeText={t => onNotes(t)}
          />
        </View>
      )}
    </View>
  )
}

const BRAND = '#2d7d2d'

const styles = StyleSheet.create({
  list: { paddingBottom: 40 },
  progressBar: {
    height: 36,
    backgroundColor: '#e5e7eb',
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: BRAND,
    borderRadius: 8,
  },
  progressLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    zIndex: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  item: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  itemSaving: { opacity: 0.6 },
  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  prompt: { flex: 1, fontSize: 14, color: '#111827', lineHeight: 20, marginRight: 8 },
  chevron: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  ratingRow: { marginBottom: 4 },
  detail: { paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#f3f4f6', marginTop: 6 },
  detailLabel: { fontSize: 11, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  confRow: { flexDirection: 'row', gap: 6 },
  confPill: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center',
  },
  confPillActive: { backgroundColor: BRAND },
  confLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  confLabelActive: { color: '#fff' },
  confText: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  notes: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#111827',
    minHeight: 60,
    textAlignVertical: 'top',
  },
})
