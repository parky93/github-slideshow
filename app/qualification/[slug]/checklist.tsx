import React, { useCallback, useState, useRef, useEffect } from 'react'
import { View, Text, SectionList, Pressable, TextInput, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { RatingPills } from '@/components/RatingPills'
import { getQualificationBySlug, getSectionsWithItems } from '@/lib/db/queries/qualifications'
import { upsertRating, saveSnapshot } from '@/lib/db/queries/ratings'
import { calculateReadinessScore } from '@/lib/scoring/score'
import { CONFIDENCE_LABELS } from '@/lib/types'
import type { Section, ChecklistItem, RatingValue } from '@/lib/types'

interface ListSection { title: string; data: ChecklistItem[]; sectionObj: Section }

const BRAND = '#4A8B28'

export default function ChecklistScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [sections, setSections] = useState<Section[]>([])
  const [qualId, setQualId] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const notesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      const q = await getQualificationBySlug(slug)
      if (!q) return
      setQualId(q.id)
      setSections(await getSectionsWithItems(q.id))
    }
    load()
  }, [slug])

  const allItems = sections.flatMap(s => s.items)
  const ratedCount = allItems.filter(i => i.rating?.ratingValue).length
  const totalCount = allItems.length
  const progressPct = totalCount ? (ratedCount / totalCount) * 100 : 0

  const rate = useCallback(async (item: ChecklistItem, value: RatingValue) => {
    setSections(prev => prev.map(s => ({
      ...s,
      items: s.items.map(i => i.id === item.id
        ? { ...i, rating: { ...(i.rating ?? { id: 0, itemId: i.id, notes: '', tags: [], needsCoaching: false, updatedAt: '' }), ratingValue: value, confidenceValue: i.rating?.confidenceValue ?? null } }
        : i),
    })))
    await upsertRating(item.id, { ratingValue: value })
    if (qualId) {
      const fresh = await getSectionsWithItems(qualId)
      const sc = calculateReadinessScore(fresh)
      if (sc.completion > 0) saveSnapshot(qualId, sc.overall, sc.completion).catch(() => {})
    }
  }, [qualId])

  const setConfidence = useCallback((item: ChecklistItem, value: number) => {
    setSections(prev => prev.map(s => ({
      ...s,
      items: s.items.map(i => i.id === item.id
        ? { ...i, rating: { ...(i.rating ?? { id: 0, itemId: i.id, ratingValue: null, notes: '', tags: [], needsCoaching: false, updatedAt: '' }), confidenceValue: value } }
        : i),
    })))
    upsertRating(item.id, { confidenceValue: value }).catch(() => {})
  }, [])

  const setNotes = useCallback((item: ChecklistItem, text: string) => {
    setSections(prev => prev.map(s => ({
      ...s,
      items: s.items.map(i => i.id === item.id
        ? { ...i, rating: { ...(i.rating ?? { id: 0, itemId: i.id, ratingValue: null, confidenceValue: null, tags: [], needsCoaching: false, updatedAt: '' }), notes: text } }
        : i),
    })))
    if (notesTimeout.current) clearTimeout(notesTimeout.current)
    notesTimeout.current = setTimeout(() => upsertRating(item.id, { notes: text }).catch(() => {}), 800)
  }, [])

  const listSections: ListSection[] = sections.map(s => ({
    title: s.title,
    data: s.items,
    sectionObj: s,
  }))

  return (
    <SectionList
      sections={listSections}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled
      ListHeaderComponent={
        <View style={styles.progressBarWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>{ratedCount}/{totalCount} items rated</Text>
            <Text style={styles.progressPct}>{Math.round(progressPct)}%</Text>
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => {
        const sec = (section as ListSection).sectionObj
        const secRated = sec.items.filter(i => i.rating?.ratingValue).length
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionMeta}>
              <View style={styles.sectionCountBadge}>
                <Text style={styles.sectionCountText}>{sec.items.length} items</Text>
              </View>
              {secRated > 0 && (
                <View style={styles.sectionRatedBadge}>
                  <Text style={styles.sectionRatedText}>{secRated} rated</Text>
                </View>
              )}
            </View>
          </View>
        )
      }}
      renderItem={({ item }) => (
        <ItemRow
          item={item}
          isExpanded={expanded === item.id}
          onToggle={() => setExpanded(prev => prev === item.id ? null : item.id)}
          onRate={v => rate(item, v)}
          onConfidence={v => setConfidence(item, v)}
          onNotes={t => setNotes(item, t)}
        />
      )}
    />
  )
}

function ItemRow({ item, isExpanded, onToggle, onRate, onConfidence, onNotes }: {
  item: ChecklistItem; isExpanded: boolean
  onToggle: () => void; onRate: (v: RatingValue) => void
  onConfidence: (v: number) => void; onNotes: (t: string) => void
}) {
  const isRated = !!item.rating?.ratingValue

  return (
    <View style={[styles.item, isExpanded && styles.itemExpanded]}>
      <Pressable onPress={onToggle} style={styles.itemHeader} hitSlop={{ top: 4, bottom: 4 }}>
        {/* Rated indicator dot */}
        <View style={[styles.ratedDot, isRated && styles.ratedDotActive]} />
        <Text style={styles.prompt}>{item.prompt}</Text>
        {/* Larger chevron */}
        <View style={[styles.chevronIcon, isExpanded && styles.chevronIconUp]}>
          <View style={styles.chevronA} />
          <View style={styles.chevronB} />
        </View>
      </Pressable>

      <View style={styles.ratingRow}>
        <RatingPills value={item.rating?.ratingValue ?? null} onChange={onRate} />
      </View>

      {isExpanded && (
        <View style={styles.detail}>
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
          {item.rating?.confidenceValue ? (
            <Text style={styles.confText}>{CONFIDENCE_LABELS[item.rating.confidenceValue]}</Text>
          ) : null}
          <Text style={[styles.detailLabel, { marginTop: 12 }]}>Notes</Text>
          <TextInput
            style={styles.notes}
            multiline
            placeholder="Add notes..."
            placeholderTextColor="#536644"
            value={item.rating?.notes ?? ''}
            onChangeText={t => onNotes(t)}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { paddingBottom: 48, backgroundColor: '#0F1A0A' },

  /* Progress bar */
  progressBarWrap: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#1A2E10',
  },
  progressTrack: {
    height: 48,
    backgroundColor: '#243D17',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#4A8B28',
    borderRadius: 12,
  },
  progressLabelRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ECF0E6',
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ECF0E6',
  },

  /* Section header */
  sectionHeader: {
    backgroundColor: '#0A1306',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2E4A1E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ECF0E6',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
  },
  sectionMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  sectionCountBadge: {
    backgroundColor: '#1A2E10',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8FA882',
  },
  sectionRatedBadge: {
    backgroundColor: '#0F2E1A',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionRatedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
  },

  /* Item row */
  item: {
    backgroundColor: '#1A2E10',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2E4A1E',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  itemExpanded: {
    backgroundColor: '#243D17',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  /* Rated indicator */
  ratedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E4A1E',
    marginRight: 10,
    marginTop: 6,
    flexShrink: 0,
  },
  ratedDotActive: {
    backgroundColor: '#4A8B28',
  },
  prompt: {
    flex: 1,
    fontSize: 14,
    color: '#ECF0E6',
    lineHeight: 20,
    marginRight: 10,
  },

  /* Larger geometric chevron */
  chevronIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 0,
  },
  chevronIconUp: {
    transform: [{ rotate: '180deg' }],
  },
  chevronA: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateX: -3 }],
  },
  chevronB: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateX: 3 }],
  },

  ratingRow: { marginBottom: 4 },

  /* Expanded detail */
  detail: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2E4A1E',
    marginTop: 6,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#536644',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  confRow: { flexDirection: 'row', gap: 8 },
  confPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#243D17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confPillActive: { backgroundColor: '#4A8B28' },
  confLabel: { fontSize: 14, fontWeight: '600', color: '#8FA882' },
  confLabelActive: { color: '#ECF0E6' },
  confText: { fontSize: 12, color: '#536644', marginTop: 6 },
  notes: {
    borderWidth: 1,
    borderColor: '#2E4A1E',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#ECF0E6',
    minHeight: 64,
    textAlignVertical: 'top',
    backgroundColor: '#0F1A0A',
  },
})
