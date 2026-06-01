import React, { useCallback, useState, useRef, useEffect } from 'react'
import { View, Text, SectionList, Pressable, TextInput, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { RatingPills } from '@/components/RatingPills'
import { getQualificationBySlug, getSectionsWithItems } from '@/lib/db/queries/qualifications'
import { upsertRating, saveSnapshot, getLogEntries, addLogEntry, deleteLogEntry } from '@/lib/db/queries/ratings'
import { calculateReadinessScore } from '@/lib/scoring/score'
import { CONFIDENCE_LABELS } from '@/lib/types'
import type { Section, ChecklistItem, RatingValue, TrainingLogEntry } from '@/lib/types'

interface ListSection { title: string; data: ChecklistItem[]; sectionObj: Section }

const BRAND = '#4A8B28'
const ORANGE = '#C4621A'

function todayISO(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function todayDDMMYYYY(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  return `${dy}/${mm}/${d.getFullYear()}`
}

function parseDDMMYYYY(s: string): string | null {
  const parts = s.split('/')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  if (yyyy.length !== 4) return null
  const iso = `${yyyy}-${mm}-${dd}`
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : iso
}

function formatLogDate(iso: string): string {
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy}`
}

export default function ChecklistScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [sections, setSections] = useState<Section[]>([])
  const [qualId, setQualId] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [unratedOnly, setUnratedOnly] = useState(false)
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
  const unratedCount = totalCount - ratedCount

  const updateItem = useCallback((itemId: number, patch: Partial<ChecklistItem['rating']>) => {
    setSections(prev => prev.map(s => ({
      ...s,
      items: s.items.map(i => {
        if (i.id !== itemId) return i
        const base = i.rating ?? { id: 0, itemId: i.id, ratingValue: null, confidenceValue: null, notes: '', tags: [], needsCoaching: false, updatedAt: '' }
        return { ...i, rating: { ...base, ...patch } }
      }),
    })))
  }, [])

  const rate = useCallback(async (item: ChecklistItem, value: RatingValue) => {
    updateItem(item.id, { ratingValue: value })
    await upsertRating(item.id, { ratingValue: value })
    if (qualId) {
      const fresh = await getSectionsWithItems(qualId)
      const sc = calculateReadinessScore(fresh)
      if (sc.completion > 0) saveSnapshot(qualId, sc.overall, sc.completion).catch(() => {})
    }
  }, [qualId, updateItem])

  const setConfidence = useCallback((item: ChecklistItem, value: number) => {
    updateItem(item.id, { confidenceValue: value })
    upsertRating(item.id, { confidenceValue: value }).catch(() => {})
  }, [updateItem])

  const setNotes = useCallback((item: ChecklistItem, text: string) => {
    updateItem(item.id, { notes: text })
    if (notesTimeout.current) clearTimeout(notesTimeout.current)
    notesTimeout.current = setTimeout(() => upsertRating(item.id, { notes: text }).catch(() => {}), 800)
  }, [updateItem])

  const toggleCoaching = useCallback((item: ChecklistItem) => {
    const next = !item.rating?.needsCoaching
    updateItem(item.id, { needsCoaching: next })
    upsertRating(item.id, { needsCoaching: next }).catch(() => {})
  }, [updateItem])

  const listSections: ListSection[] = sections
    .map(s => ({
      title: s.title,
      sectionObj: s,
      data: unratedOnly ? s.items.filter(i => !i.rating?.ratingValue) : s.items,
    }))
    .filter(s => s.data.length > 0)

  return (
    <SectionList
      sections={listSections}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>{ratedCount}/{totalCount} rated</Text>
              <Text style={styles.progressPct}>{Math.round(progressPct)}%</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setUnratedOnly(v => !v)}
            style={[styles.filterBtn, unratedOnly && styles.filterBtnActive]}
          >
            <View style={[styles.filterDot, unratedOnly && styles.filterDotActive]} />
            <Text style={[styles.filterLabel, unratedOnly && styles.filterLabelActive]}>
              {unratedOnly ? `Showing ${unratedCount} unrated` : 'Show unrated only'}
            </Text>
          </Pressable>
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
                <Text style={styles.sectionCountText}>{sec.items.length}</Text>
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
          onToggleCoaching={() => toggleCoaching(item)}
        />
      )}
    />
  )
}

function ItemRow({ item, isExpanded, onToggle, onRate, onConfidence, onNotes, onToggleCoaching }: {
  item: ChecklistItem; isExpanded: boolean
  onToggle: () => void; onRate: (v: RatingValue) => void
  onConfidence: (v: number) => void; onNotes: (t: string) => void
  onToggleCoaching: () => void
}) {
  const isRated = !!item.rating?.ratingValue
  const needsCoaching = !!item.rating?.needsCoaching

  const [logs, setLogs] = useState<TrainingLogEntry[]>([])
  const [logsLoaded, setLogsLoaded] = useState(false)
  const [showAddLog, setShowAddLog] = useState(false)
  const [logDate, setLogDate] = useState('')
  const [logNotes, setLogNotes] = useState('')

  useEffect(() => {
    if (isExpanded && !logsLoaded) {
      getLogEntries(item.id).then(entries => {
        setLogs(entries)
        setLogsLoaded(true)
      })
    }
  }, [isExpanded, logsLoaded, item.id])

  const handleAddLog = async () => {
    const iso = parseDDMMYYYY(logDate) ?? todayISO()
    const entry = await addLogEntry(item.id, iso, logNotes)
    setLogs(prev => [entry, ...prev])
    setLogDate('')
    setLogNotes('')
    setShowAddLog(false)
  }

  const handleDeleteLog = async (entryId: string) => {
    await deleteLogEntry(item.id, entryId)
    setLogs(prev => prev.filter(e => e.id !== entryId))
  }

  const openAddLog = () => {
    setLogDate(todayDDMMYYYY())
    setLogNotes('')
    setShowAddLog(true)
  }

  return (
    <View style={[styles.item, isExpanded && styles.itemExpanded, needsCoaching && styles.itemCoaching]}>
      <Pressable onPress={onToggle} style={styles.itemHeader} hitSlop={{ top: 4, bottom: 4 }}>
        <View style={[styles.ratedDot, isRated && styles.ratedDotActive]} />
        <Text style={styles.prompt}>{item.prompt}</Text>
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

          <Text style={[styles.detailLabel, { marginTop: 14 }]}>Notes</Text>
          <TextInput
            style={styles.notes}
            multiline
            placeholder="Add notes..."
            placeholderTextColor="#536644"
            value={item.rating?.notes ?? ''}
            onChangeText={t => onNotes(t)}
          />

          <Pressable onPress={onToggleCoaching} style={styles.coachingToggle}>
            <View style={[styles.coachingDot, needsCoaching && styles.coachingDotActive]} />
            <Text style={[styles.coachingLabel, needsCoaching && styles.coachingLabelActive]}>
              {needsCoaching ? 'Flagged for coaching' : 'Flag for coaching'}
            </Text>
          </Pressable>

          {/* Training log */}
          <View style={styles.logSection}>
            <View style={styles.logHeaderRow}>
              <Text style={styles.detailLabel}>Training log</Text>
              {logs.length > 0 && (
                <View style={styles.logCountBadge}>
                  <Text style={styles.logCountText}>{logs.length}</Text>
                </View>
              )}
            </View>

            {logs.map(entry => (
              <View key={entry.id} style={styles.logEntry}>
                <View style={styles.logDateChip}>
                  <Text style={styles.logDateText}>{formatLogDate(entry.date)}</Text>
                </View>
                <Text style={styles.logEntryNotes} numberOfLines={2}>{entry.notes || 'No notes'}</Text>
                <Pressable onPress={() => handleDeleteLog(entry.id)} hitSlop={8} style={styles.logDeleteBtn}>
                  <View style={styles.logDeleteX1} />
                  <View style={styles.logDeleteX2} />
                </Pressable>
              </View>
            ))}

            {showAddLog ? (
              <View style={styles.logForm}>
                <TextInput
                  style={styles.logDateInput}
                  value={logDate}
                  onChangeText={setLogDate}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#536644"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
                <TextInput
                  style={styles.logNotesInput}
                  value={logNotes}
                  onChangeText={setLogNotes}
                  placeholder="What did you practise?"
                  placeholderTextColor="#536644"
                  multiline
                />
                <View style={styles.logFormBtns}>
                  <Pressable onPress={handleAddLog} style={styles.logSaveBtn}>
                    <Text style={styles.logSaveBtnText}>Save</Text>
                  </Pressable>
                  <Pressable onPress={() => setShowAddLog(false)} style={styles.logCancelBtn}>
                    <Text style={styles.logCancelBtnText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable onPress={openAddLog} style={styles.logAddBtn}>
                <View style={styles.logAddPlus}>
                  <View style={styles.logPlusH} />
                  <View style={styles.logPlusV} />
                </View>
                <Text style={styles.logAddBtnText}>Add training entry</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { paddingBottom: 48, backgroundColor: '#0F1A0A' },

  header: { marginHorizontal: 16, marginTop: 16, marginBottom: 8, gap: 10 },

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
    backgroundColor: BRAND,
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
  progressLabel: { fontSize: 14, fontWeight: '600', color: '#ECF0E6' },
  progressPct: { fontSize: 14, fontWeight: '800', color: '#ECF0E6' },

  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1A2E10',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2E4A1E',
  },
  filterBtnActive: {
    backgroundColor: '#C4621A22',
    borderColor: '#C4621A',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#536644',
  },
  filterDotActive: { backgroundColor: '#C4621A' },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#8FA882' },
  filterLabelActive: { color: '#E8893A' },

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
  sectionMeta: { flexDirection: 'row', gap: 6 },
  sectionCountBadge: {
    backgroundColor: '#1A2E10',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCountText: { fontSize: 11, fontWeight: '600', color: '#8FA882' },
  sectionRatedBadge: {
    backgroundColor: '#0F2E1A',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionRatedText: { fontSize: 11, fontWeight: '600', color: '#22C55E' },

  item: {
    backgroundColor: '#1A2E10',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2E4A1E',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },
  itemExpanded: { backgroundColor: '#243D17' },
  itemCoaching: { borderLeftWidth: 3, borderLeftColor: ORANGE },

  itemHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },

  ratedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E4A1E',
    marginRight: 10,
    marginTop: 6,
    flexShrink: 0,
  },
  ratedDotActive: { backgroundColor: BRAND },

  prompt: { flex: 1, fontSize: 14, color: '#ECF0E6', lineHeight: 20, marginRight: 10 },

  chevronIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chevronIconUp: { transform: [{ rotate: '180deg' }] },
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
  confPillActive: { backgroundColor: BRAND },
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

  coachingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1A2E10',
    borderWidth: 1,
    borderColor: '#2E4A1E',
    alignSelf: 'flex-start',
  },
  coachingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E4A1E',
    borderWidth: 2,
    borderColor: '#536644',
  },
  coachingDotActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  coachingLabel: { fontSize: 13, fontWeight: '600', color: '#536644' },
  coachingLabelActive: { color: '#E8893A' },

  /* Training log */
  logSection: {
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2E4A1E',
    paddingTop: 14,
  },
  logHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logCountBadge: {
    backgroundColor: '#1A2E10',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  logCountText: { fontSize: 11, fontWeight: '700', color: '#8FA882' },

  logEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    backgroundColor: '#1A2E10',
    borderRadius: 10,
    padding: 10,
  },
  logDateChip: {
    backgroundColor: '#0F1A0A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  logDateText: { fontSize: 11, fontWeight: '700', color: '#8FA882' },
  logEntryNotes: { flex: 1, fontSize: 13, color: '#ECF0E6', lineHeight: 18 },
  logDeleteBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logDeleteX1: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  logDeleteX2: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  logForm: {
    backgroundColor: '#1A2E10',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  logDateInput: {
    borderWidth: 1,
    borderColor: '#2E4A1E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#ECF0E6',
    backgroundColor: '#0F1A0A',
  },
  logNotesInput: {
    borderWidth: 1,
    borderColor: '#2E4A1E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#ECF0E6',
    minHeight: 56,
    textAlignVertical: 'top',
    backgroundColor: '#0F1A0A',
  },
  logFormBtns: { flexDirection: 'row', gap: 8 },
  logSaveBtn: {
    flex: 1,
    backgroundColor: BRAND,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logSaveBtnText: { fontSize: 13, fontWeight: '700', color: '#ECF0E6' },
  logCancelBtn: {
    flex: 1,
    backgroundColor: '#0F1A0A',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E4A1E',
  },
  logCancelBtnText: { fontSize: 13, fontWeight: '600', color: '#8FA882' },

  logAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
  },
  logAddPlus: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logPlusH: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    backgroundColor: '#4A8B28',
    borderRadius: 1,
  },
  logPlusV: {
    position: 'absolute',
    width: 1.5,
    height: 12,
    backgroundColor: '#4A8B28',
    borderRadius: 1,
  },
  logAddBtnText: { fontSize: 13, fontWeight: '600', color: '#8FA882' },
})
