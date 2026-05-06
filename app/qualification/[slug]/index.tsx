import React, { useCallback, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Modal, TextInput } from 'react-native'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { ReadinessRing } from '@/components/ReadinessRing'
import { SectionBar } from '@/components/SectionBar'
import { InsightsPanel } from '@/components/InsightsPanel'
import { getQualificationBySlug, getSectionsWithItems, markQualViewed, toggleFavourite } from '@/lib/db/queries/qualifications'
import { calculateReadinessScore } from '@/lib/scoring/score'
import { getTargetDate, setTargetDate, daysUntil } from '@/lib/db/queries/ratings'
import type { Qualification, ReadinessScore, TargetDate } from '@/lib/types'

const BRAND = '#4A8B28'
const ORANGE = '#C4621A'

export default function DashboardScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const [qual, setQual] = useState<Qualification | null>(null)
  const [score, setScore] = useState<ReadinessScore | null>(null)
  const [target, setTarget] = useState<TargetDate | null>(null)
  const [showDateModal, setShowDateModal] = useState(false)
  const [dateInput, setDateInput] = useState('')

  useFocusEffect(useCallback(() => {
    let active = true
    async function load() {
      const q = await getQualificationBySlug(slug)
      if (!q || !active) return
      setQual(q)
      markQualViewed(q.id).catch(() => {})
      const [sections, td] = await Promise.all([
        getSectionsWithItems(q.id),
        getTargetDate(q.id),
      ])
      if (!active) return
      setScore(calculateReadinessScore(sections))
      setTarget(td)
    }
    load()
    return () => { active = false }
  }, [slug]))

  if (!qual) return null

  const onToggleFav = async () => {
    await toggleFavourite(qual.id)
    setQual(q => q ? { ...q, isFavourite: !q.isFavourite } : q)
  }

  const openDateModal = () => {
    if (target) {
      const d = new Date(target.date)
      setDateInput(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`)
    } else {
      setDateInput('')
    }
    setShowDateModal(true)
  }

  const saveDate = async () => {
    const parts = dateInput.trim().split('/')
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number)
      if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y > 2020) {
        const iso = new Date(y, m - 1, d).toISOString().split('T')[0]
        await setTargetDate(qual.id, iso)
        setTarget({ qualificationId: qual.id, date: iso })
      }
    }
    setShowDateModal(false)
  }

  const clearDate = async () => {
    await setTargetDate(qual.id, null)
    setTarget(null)
    setShowDateModal(false)
  }

  const hasScore = score && score.sectionScores.length > 0
  const days = target ? daysUntil(target.date) : null

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{qual.name}</Text>
            {qual.pathway && <Text style={styles.pathway}>{qual.pathway}</Text>}
          </View>
          <Pressable onPress={onToggleFav} style={styles.favBtn} accessibilityRole="button">
            <View style={[styles.favDot, qual.isFavourite && styles.favDotActive]} />
          </Pressable>
        </View>

        {/* Target date card */}
        <Pressable onPress={openDateModal} style={styles.targetCard}>
          <View style={styles.targetLeft}>
            <View style={[styles.targetDot, target && days !== null && days >= 0 && styles.targetDotActive]} />
            <View>
              <Text style={styles.targetLabel}>Assessment target</Text>
              {target ? (
                <Text style={styles.targetValue}>
                  {new Date(target.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              ) : (
                <Text style={styles.targetPlaceholder}>Tap to set a date</Text>
              )}
            </View>
          </View>
          {days !== null && (
            <View style={[styles.countdownBadge, days < 0 && styles.countdownPast]}>
              <Text style={styles.countdownNum}>{Math.abs(days)}</Text>
              <Text style={styles.countdownUnit}>{days < 0 ? 'days ago' : 'days'}</Text>
            </View>
          )}
        </Pressable>

        {hasScore ? (
          <>
            <View style={styles.ringRow}>
              <ReadinessRing score={score.overall} light={score.light} size={140} />
              <View style={styles.statsCol}>
                <StatChip label="Rated" value={`${Math.round(score.completion * 100)}%`} />
                <StatChip label="Sections" value={String(score.sectionScores.length)} />
                <StatChip
                  label="Status"
                  value={score.light.toUpperCase()}
                  valueColor={score.light === 'green' ? '#22c55e' : score.light === 'amber' ? '#f59e0b' : '#ef4444'}
                />
              </View>
            </View>

            {qual.summary ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryAccent} />
                <Text style={styles.summaryText}>{qual.summary}</Text>
              </View>
            ) : null}

            <InsightsPanel score={score} />

            <Text style={styles.sectionHeading}>Section Breakdown</Text>
            {score.sectionScores.map(s => <SectionBar key={s.sectionId} section={s} />)}
          </>
        ) : (
          <>
            {qual.summary ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryAccent} />
                <Text style={styles.summaryText}>{qual.summary}</Text>
              </View>
            ) : null}
            <View style={styles.empty}>
              <View style={styles.emptyDot} />
              <Text style={styles.emptyText}>No checklist items yet</Text>
              <Text style={styles.emptyHint}>Tap "Rate checklist" below to get started.</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={styles.stickyBar}>
        <Pressable
          onPress={() => router.push(`/qualification/${slug}/checklist`)}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.primaryBtnLabel}>Rate checklist</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/qualification/${slug}/history`)}
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.secondaryBtnLabel}>History</Text>
        </Pressable>
      </View>

      {/* Target date modal */}
      <Modal visible={showDateModal} transparent animationType="fade" onRequestClose={() => setShowDateModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDateModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Assessment target date</Text>
            <Text style={styles.modalHint}>Enter date as DD/MM/YYYY</Text>
            <TextInput
              style={styles.modalInput}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="e.g. 15/09/2025"
              placeholderTextColor="#536644"
              keyboardType="numbers-and-punctuation"
              autoFocus
            />
            <View style={styles.modalActions}>
              {target && (
                <Pressable onPress={clearDate} style={styles.clearBtn}>
                  <Text style={styles.clearBtnLabel}>Clear</Text>
                </Pressable>
              )}
              <Pressable onPress={saveDate} style={styles.saveBtn}>
                <Text style={styles.saveBtnLabel}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

function StatChip({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F1A0A' },
  scroll: { padding: 16, paddingBottom: 110 },

  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: '#ECF0E6', letterSpacing: -0.3 },
  pathway: { fontSize: 13, color: '#E8893A', marginTop: 4, fontWeight: '600' },

  favBtn: { paddingLeft: 12, paddingTop: 4 },
  favDot: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: ORANGE, backgroundColor: 'transparent',
  },
  favDotActive: { backgroundColor: ORANGE },

  /* Target date card */
  targetCard: {
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2E4A1E',
  },
  targetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  targetDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#2E4A1E', borderWidth: 2, borderColor: '#536644',
  },
  targetDotActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  targetLabel: { fontSize: 11, color: '#536644', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  targetValue: { fontSize: 14, fontWeight: '600', color: '#ECF0E6' },
  targetPlaceholder: { fontSize: 14, color: '#536644' },
  countdownBadge: {
    backgroundColor: ORANGE + '22',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  countdownPast: { backgroundColor: '#1A2E10' },
  countdownNum: { fontSize: 18, fontWeight: '800', color: '#E8893A' },
  countdownUnit: { fontSize: 10, color: '#8FA882', fontWeight: '600' },

  /* Ring + stats */
  ringRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  statsCol: { flex: 1, gap: 8 },
  statChip: {
    backgroundColor: '#1A2E10', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  statLabel: { fontSize: 10, color: '#536644', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  statValue: { fontSize: 15, fontWeight: '700', color: '#ECF0E6' },

  summaryCard: {
    backgroundColor: '#1A2E10', borderRadius: 14, padding: 14, marginBottom: 16,
    flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2, overflow: 'hidden',
  },
  summaryAccent: { width: 4, backgroundColor: BRAND, borderRadius: 2, marginRight: 12, alignSelf: 'stretch' },
  summaryText: { flex: 1, fontSize: 14, color: '#8FA882', lineHeight: 21 },

  sectionHeading: {
    fontSize: 12, fontWeight: '700', color: '#536644',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, marginTop: 20,
  },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A2E10', marginBottom: 16 },
  emptyText: { color: '#ECF0E6', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyHint: { color: '#536644', fontSize: 13, textAlign: 'center', lineHeight: 18 },

  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0A1306', paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    flexDirection: 'row', gap: 10,
    borderTopWidth: 1, borderTopColor: '#2E4A1E',
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 10,
  },
  primaryBtn: { flex: 1, backgroundColor: BRAND, borderRadius: 13, paddingVertical: 15, alignItems: 'center' },
  primaryBtnLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flex: 1, backgroundColor: '#1A2E10', borderRadius: 13, paddingVertical: 15,
    alignItems: 'center', borderWidth: 1, borderColor: '#2E4A1E',
  },
  secondaryBtnLabel: { color: '#8FA882', fontWeight: '700', fontSize: 15 },

  /* Date modal */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1A2E10', borderRadius: 18, padding: 24,
    width: '85%', borderWidth: 1, borderColor: '#2E4A1E',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#ECF0E6', marginBottom: 4 },
  modalHint: { fontSize: 13, color: '#536644', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#0F1A0A', borderRadius: 10, borderWidth: 1, borderColor: '#2E4A1E',
    padding: 14, fontSize: 18, color: '#ECF0E6', fontWeight: '600',
    letterSpacing: 1, textAlign: 'center',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  clearBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 13,
    alignItems: 'center', backgroundColor: '#243D17',
  },
  clearBtnLabel: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  saveBtn: { flex: 2, borderRadius: 10, paddingVertical: 13, alignItems: 'center', backgroundColor: BRAND },
  saveBtnLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
