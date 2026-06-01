import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { getActivities, deleteActivity, getIsPro } from '@/lib/dlog/storage'
import type { DLogActivity } from '@/lib/dlog/types'
import { C, RADIUS, GRAD } from '@/lib/theme'

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function LogbookTab() {
  const router = useRouter()
  const [isPro, setIsPro] = useState<boolean | null>(null)
  const [activities, setActivities] = useState<DLogActivity[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const pro = await getIsPro()
    setIsPro(pro)
    if (pro) setActivities(await getActivities())
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const handleDelete = (id: string, label: string) => {
    Alert.alert('Delete Activity', `Remove "${label}" from your logbook?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteActivity(id)
          await load()
        },
      },
    ])
  }

  // Pro gate
  if (isPro === false) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.lockWrap}>
          <LinearGradient colors={GRAD.cta} style={styles.lockIcon}>
            <View style={styles.lockBody} />
            <View style={styles.lockShackle} />
          </LinearGradient>
          <Text style={styles.lockTitle}>Logbook is a Pro feature</Text>
          <Text style={styles.lockHint}>
            Track every walk and climb, build GPX files and export DLOG-ready summaries.
          </Text>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/paywall')}
          >
            <LinearGradient colors={GRAD.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.lockBtn}>
              <Text style={styles.lockBtnText}>Unlock DLOG Toolkit</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const renderItem = ({ item }: { item: DLogActivity }) => (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(`/dlog/export?activityId=${item.id}`)}
    >
      <View style={styles.rowLeft}>
        <View style={styles.dateChip}>
          <Text style={styles.dateChipText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.rowInfo}>
          <View style={styles.rowTitleRow}>
            <Text style={styles.rowTitle}>{item.activityLabel}</Text>
            {item.isQmd && (
              <View style={styles.qmdBadge}>
                <Text style={styles.qmdText}>QMD</Text>
              </View>
            )}
          </View>
          <View style={styles.rowMeta}>
            {item.locationName ? (
              <Text style={styles.rowLocation} numberOfLines={1}>{item.locationName}</Text>
            ) : null}
            {(item.durationHours != null || item.dlogDuration) && (
              <Text style={styles.rowDuration}>{item.durationHours != null ? `${item.durationHours}h` : item.dlogDuration}</Text>
            )}
            {item.distanceKm != null && <Text style={styles.rowDuration}>{item.distanceKm}km</Text>}
          </View>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
        onPress={() => handleDelete(item.id, item.activityLabel)}
        hitSlop={8}
      >
        <View style={styles.xLine1} />
        <View style={styles.xLine2} />
      </Pressable>
    </Pressable>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={activities}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Logbook</Text>
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
              onPress={() => router.push('/dlog/activity-type')}
            >
              <LinearGradient colors={GRAD.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.logBtn}>
                <Text style={styles.logBtnText}>+ Log</Text>
              </LinearGradient>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <View style={styles.emptyLine1} />
              <View style={styles.emptyLine2} />
              <View style={styles.emptyLine3} />
            </View>
            <Text style={styles.emptyTitle}>No activities logged yet</Text>
            <Text style={styles.emptyHint}>Tap "Log" to record your first day out</Text>
            <Pressable
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
              onPress={() => router.push('/dlog/activity-type')}
            >
              <LinearGradient colors={GRAD.cta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Log Activity</Text>
              </LinearGradient>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  list: { paddingHorizontal: 20, paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
  logBtn: { borderRadius: RADIUS.pill, paddingHorizontal: 18, paddingVertical: 10 },
  logBtnText: { fontSize: 14, fontWeight: '800', color: '#0A0F08' },

  row: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dateChip: { backgroundColor: C.surfaceHi, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, flexShrink: 0 },
  dateChipText: { fontSize: 12, fontWeight: '700', color: C.textSec },
  rowInfo: { flex: 1 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rowTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  qmdBadge: { backgroundColor: C.green, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  qmdText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  rowLocation: { fontSize: 12, color: C.textMuted, flex: 1, flexShrink: 1 },
  rowDuration: { fontSize: 12, color: C.textSec, fontWeight: '600', flexShrink: 0 },

  deleteBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 },
  xLine1: { position: 'absolute', width: 14, height: 2, backgroundColor: C.textMuted, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xLine2: { position: 'absolute', width: 14, height: 2, backgroundColor: C.textMuted, borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: {
    width: 48, height: 48, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 20, padding: 10,
  },
  emptyLine1: { width: 28, height: 2, backgroundColor: C.border, borderRadius: 1 },
  emptyLine2: { width: 22, height: 2, backgroundColor: C.border, borderRadius: 1 },
  emptyLine3: { width: 25, height: 2, backgroundColor: C.border, borderRadius: 1 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: { borderRadius: RADIUS.lg, paddingHorizontal: 24, paddingVertical: 13 },
  emptyBtnText: { fontSize: 15, fontWeight: '800', color: '#0A0F08' },

  /* Pro gate */
  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  lockIcon: {
    width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    shadowColor: C.green, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  lockBody: { width: 28, height: 22, borderRadius: 5, backgroundColor: '#0A0F08' },
  lockShackle: {
    position: 'absolute', top: 18, width: 18, height: 16, borderWidth: 4, borderColor: '#0A0F08',
    borderBottomColor: 'transparent', borderTopLeftRadius: 9, borderTopRightRadius: 9,
  },
  lockTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 10, textAlign: 'center', letterSpacing: -0.4 },
  lockHint: { fontSize: 15, color: C.textSec, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  lockBtn: {
    borderRadius: RADIUS.pill, paddingHorizontal: 28, paddingVertical: 15,
    shadowColor: C.green, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  lockBtnText: { fontSize: 16, fontWeight: '800', color: '#0A0F08' },
})
