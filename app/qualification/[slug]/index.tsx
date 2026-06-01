import React, { useCallback, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Modal, TextInput, Share } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { ReadinessRing } from '@/components/ReadinessRing'
import { SectionBar } from '@/components/SectionBar'
import { InsightsPanel } from '@/components/InsightsPanel'
import { getQualificationBySlug, getSectionsWithItems, markQualViewed, toggleFavourite } from '@/lib/db/queries/qualifications'
import { calculateReadinessScore, getReadinessLabel } from '@/lib/scoring/score'
import { getTargetDate, setTargetDate, daysUntil, saveSnapshot } from '@/lib/db/queries/ratings'
import { C, RADIUS, GRAD } from '@/lib/theme'
import type { Qualification, ReadinessScore, TargetDate } from '@/lib/types'

const BRAND = C.green
const ORANGE = C.orange

export default function DashboardScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const [qual, setQual] = useState<Qualification | null>(null)
  const [score, setScore] = useState<ReadinessScore | null>(null)
  const [target, setTarget] = useState<TargetDate | null>(null)
  const [showDateModal, setShowDateModal] = useState(false)
  const [dateInput, setDateInput] = useState('')
  const [showCheckpointModal, setShowCheckpointModal] = useState(false)
  const [checkpointLabel, setCheckpointLabel] = useState('')
  const [unratedCount, setUnratedCount] = useState(0)

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
      const count = sections.reduce((acc, s) => acc + s.items.filter(i => !i.rating?.ratingValue).length, 0)
      setUnratedCount(count)
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

  const shareReadiness = async () => {
    if (!qual || !score) return
    const lines: string[] = [
      `${qual.name} — Readiness Summary`,
      `Overall: ${Math.round(score.overall * 100)}% (${getReadinessLabel(score.overall)})`,
      `Completion: ${Math.round(score.completion * 100)}% of items rated`,
      '',
      'Section Breakdown:',
      ...score.sectionScores.map(s =>
        `  ${s.title}: ${Math.round(s.score * 100)}% [${s.light.toUpperCase()}]`
      ),
    ]
    if (target && days !== null) {
      lines.push('')
      lines.push(`Assessment target: ${new Date(target.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} (${days >= 0 ? `${days} days to go` : `${Math.abs(days)} days ago`})`)
    }
    lines.push('')
    lines.push('Generated with MTA Ready')
    await Share.share({ message: lines.join('\n') })
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
            <View style={styles.ringCard}>
              <LinearGradient
                colors={GRAD.greenGlow}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <ReadinessRing score={score.overall} light={score.light} size={132} />
              <View style={styles.statsCol}>
                <StatChip label="Rated" value={`${Math.round(score.completion * 100)}%`} />
                <StatChip label="Sections" value={String(score.sectionScores.length)} />
                <StatChip
                  label="Status"
                  value={score.light.toUpperCase()}
                  valueColor={score.light === 'green' ? C.greenStatus : score.light === 'amber' ? C.amber : C.red}
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

            <Pressable
              onPress={() => { setCheckpointLabel(''); setShowCheckpointModal(true) }}
              style={({ pressed }) => [styles.checkpointBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.checkpointBtnLabel}>Save checkpoint</Text>
            </Pressable>
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
          style={({ pressed }) => [{ flex: 2 }, pressed && { opacity: 0.9 }]}
        >
          <LinearGradient
            colors={GRAD.cta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnLabel}>Checklist</Text>
          </LinearGradient>
        </Pressable>
        {unratedCount > 0 && (
          <Pressable
            onPress={() => router.push(`/qualification/${slug}/quickrate`)}
            style={({ pressed }) => [styles.secondaryBtn, styles.quickRateBtn, { flex: 1 }, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.quickRateBtnLabel}>Quick Rate</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => router.push(`/qualification/${slug}/history`)}
          style={({ pressed }) => [styles.secondaryBtn, { flex: 1 }, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.secondaryBtnLabel}>History</Text>
        </Pressable>
        <Pressable
          onPress={shareReadiness}
          disabled={!hasScore}
          style={({ pressed }) => [styles.secondaryBtn, styles.shareBtn, { flex: 1 }, pressed && { opacity: 0.85 }, !hasScore && { opacity: 0.4 }]}
        >
          <Text style={styles.shareBtnLabel}>Share</Text>
        </Pressable>
      </View>

      {/* Checkpoint modal */}
      <Modal visible={showCheckpointModal} transparent animationType="fade" onRequestClose={() => setShowCheckpointModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCheckpointModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Save checkpoint</Text>
            <Text style={styles.modalHint}>Give this snapshot an optional name</Text>
            <TextInput
              style={styles.modalInput}
              value={checkpointLabel}
              onChangeText={setCheckpointLabel}
              placeholder="e.g. Week 4 review"
              placeholderTextColor={C.textMuted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={async () => {
                  if (!qual || !score) return
                  await saveSnapshot(qual.id, score.overall, score.completion, checkpointLabel || undefined)
                  setShowCheckpointModal(false)
                }}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnLabel}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
              placeholderTextColor={C.textMuted}
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
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 120 },

  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  headerText: { flex: 1 },
  name: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.6, lineHeight: 34 },
  pathway: { fontSize: 13, color: C.orange, marginTop: 6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  favBtn: { paddingLeft: 12, paddingTop: 6 },
  favDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: ORANGE, backgroundColor: 'transparent',
  },
  favDotActive: { backgroundColor: ORANGE },

  /* Target date card */
  targetCard: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
  },
  targetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  targetDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: C.border, borderWidth: 2, borderColor: C.textMuted,
  },
  targetDotActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  targetLabel: { fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4, fontWeight: '700' },
  targetValue: { fontSize: 15, fontWeight: '700', color: C.text },
  targetPlaceholder: { fontSize: 15, color: C.textMuted },
  countdownBadge: {
    backgroundColor: ORANGE + '22',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  countdownPast: { backgroundColor: C.surfaceHi },
  countdownNum: { fontSize: 22, fontWeight: '800', color: C.orange, letterSpacing: -0.5 },
  countdownUnit: { fontSize: 10, color: C.textSec, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },

  /* Ring + stats */
  ringCard: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16,
    borderRadius: RADIUS.xl, padding: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.green, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 6,
  },
  statsCol: { flex: 1, gap: 10 },
  statChip: {
    backgroundColor: C.bg, borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: C.borderSubtle,
  },
  statLabel: { fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4, fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '800', color: C.text, letterSpacing: -0.4 },

  summaryCard: {
    backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: 18, marginBottom: 16,
    flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: C.borderSubtle,
  },
  summaryAccent: { width: 4, backgroundColor: BRAND, borderRadius: 2, marginRight: 14, alignSelf: 'stretch' },
  summaryText: { flex: 1, fontSize: 14, color: C.textSec, lineHeight: 21 },

  sectionHeading: {
    fontSize: 12, fontWeight: '700', color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14, marginTop: 24,
  },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyDot: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, marginBottom: 16 },
  emptyText: { color: C.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptyHint: { color: C.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 },

  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.bgElevated, paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    flexDirection: 'row', gap: 10,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  primaryBtn: { flex: 1, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnLabel: { color: '#0A0F08', fontWeight: '800', fontSize: 15 },
  secondaryBtn: {
    flex: 1, backgroundColor: C.surface, borderRadius: RADIUS.md, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: C.border,
  },
  secondaryBtnLabel: { color: C.textSec, fontWeight: '700', fontSize: 15 },
  shareBtn: { borderColor: C.orange + '44' },
  shareBtnLabel: { color: C.orange, fontWeight: '700', fontSize: 15 },
  quickRateBtn: { borderColor: C.green + '66' },
  quickRateBtnLabel: { color: C.greenBright, fontWeight: '700', fontSize: 14 },

  checkpointBtn: { marginTop: 24, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border, paddingVertical: 14, alignItems: 'center', backgroundColor: C.surface },
  checkpointBtnLabel: { color: C.textSec, fontWeight: '700', fontSize: 14 },

  /* Date modal */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    backgroundColor: C.surfaceHi, borderRadius: RADIUS.xl, padding: 24,
    width: '85%', borderWidth: 1, borderColor: C.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 4 },
  modalHint: { fontSize: 13, color: C.textMuted, marginBottom: 16 },
  modalInput: {
    backgroundColor: C.bg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: C.border,
    padding: 14, fontSize: 18, color: C.text, fontWeight: '700',
    letterSpacing: 1, textAlign: 'center',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  clearBtn: {
    flex: 1, borderRadius: RADIUS.sm, paddingVertical: 14,
    alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  clearBtnLabel: { color: C.red, fontWeight: '700', fontSize: 14 },
  saveBtn: { flex: 2, borderRadius: RADIUS.sm, paddingVertical: 14, alignItems: 'center', backgroundColor: C.green },
  saveBtnLabel: { color: '#0A0F08', fontWeight: '800', fontSize: 14 },
})
