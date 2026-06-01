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
import { getActivities, deleteActivity } from '@/lib/dlog/storage'
import type { DLogActivity } from '@/lib/dlog/types'

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function LogbookScreen() {
  const router = useRouter()
  const [activities, setActivities] = useState<DLogActivity[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const all = await getActivities()
    setActivities(all)
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const handleDelete = (id: string, label: string) => {
    Alert.alert(
      'Delete Activity',
      `Remove "${label}" from your logbook?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteActivity(id)
            await load()
          },
        },
      ]
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
            {item.durationHours != null && (
              <Text style={styles.rowDuration}>{item.durationHours}h</Text>
            )}
            {item.distanceKm != null && (
              <Text style={styles.rowDuration}>{item.distanceKm}km</Text>
            )}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A8B28" />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Logbook</Text>
            <Pressable
              style={({ pressed }) => [styles.logBtn, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/dlog/activity-type')}
            >
              <Text style={styles.logBtnText}>+ Log Activity</Text>
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
            <Text style={styles.emptyHint}>Tap "Log Activity" to record your first day out</Text>
            <Pressable
              style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/dlog/activity-type')}
            >
              <Text style={styles.emptyBtnText}>Log Activity</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A0A' },
  list: { paddingHorizontal: 16, paddingBottom: 48 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ECF0E6',
    letterSpacing: -0.3,
  },
  logBtn: {
    backgroundColor: '#4A8B28',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  logBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  row: {
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dateChip: {
    backgroundColor: '#2E4A1E',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexShrink: 0,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8FA882',
  },
  rowInfo: { flex: 1 },
  rowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ECF0E6',
  },
  qmdBadge: {
    backgroundColor: '#4A8B28',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qmdText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  rowLocation: {
    fontSize: 12,
    color: '#536644',
    flex: 1,
    flexShrink: 1,
  },
  rowDuration: {
    fontSize: 12,
    color: '#8FA882',
    fontWeight: '600',
    flexShrink: 0,
  },

  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  xLine1: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: '#536644',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  /* Empty state */
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#1A2E10',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 20,
    padding: 10,
  },
  emptyLine1: { width: 28, height: 2, backgroundColor: '#2E4A1E', borderRadius: 1 },
  emptyLine2: { width: 22, height: 2, backgroundColor: '#2E4A1E', borderRadius: 1 },
  emptyLine3: { width: 25, height: 2, backgroundColor: '#2E4A1E', borderRadius: 1 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ECF0E6',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#536644',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: '#4A8B28',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
