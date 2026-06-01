import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { getActivityById, saveActivity } from '@/lib/dlog/storage'
import { buildGpx } from '@/lib/dlog/gpx'
import { DLOG_CHECKLISTS, type DLogActivity } from '@/lib/dlog/types'
import { MapPreview } from '@/components/MapPreview'
import { C } from '@/lib/theme'

export default function ExportScreen() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>()
  const router = useRouter()
  const [activity, setActivity] = useState<DLogActivity | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const found = await getActivityById(activityId)
      if (found) {
        setActivity(found)
        setSaved(true)
      }
    }
    load()
  }, [activityId])

  // Use the recorded route if present, otherwise fall back to a single
  // pin at the chosen location so there's always something to upload.
  const gpxWaypoints = (() => {
    if (!activity) return []
    if (activity.waypoints.length > 0) return activity.waypoints
    if (activity.lat != null && activity.lng != null) {
      return [{ id: 'loc', name: activity.locationName || 'Location', lat: activity.lat, lng: activity.lng }]
    }
    return []
  })()

  const handleDownloadGpx = async () => {
    if (!activity || gpxWaypoints.length === 0) return
    const gpxContent = buildGpx(activity.activityLabel, activity.date, gpxWaypoints, activity)
    const safeName = `${activity.activityTypeId}-${activity.date}`.replace(/[^a-z0-9-]/gi, '-')
    const filename = `${safeName}.gpx`
    try {
      const file = new File(Paths.cache, filename)
      file.create({ overwrite: true })
      file.write(gpxContent)
      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/gpx+xml',
          dialogTitle: 'Save GPX file',
          UTI: 'com.topografix.gpx',
        })
      } else {
        Alert.alert('Sharing not available', 'Cannot share files on this device.')
      }
      try { file.delete() } catch {}
    } catch (e: any) {
      console.error('GPX export error:', e)
      Alert.alert('Export failed', 'Could not create the GPX file. Please try again.')
    }
  }

  const handleShareSummary = async () => {
    if (!activity) return
    const summary = buildSummary(activity)
    try {
      const file = new File(Paths.cache, `dlog-summary-${activity.id}.txt`)
      file.write(summary)
      const canShare = await Sharing.isAvailableAsync()
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share DLOG Summary',
        })
      } else {
        Alert.alert('Sharing not available', 'Cannot share on this device.')
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to share summary.')
    }
  }

  const handleSaveToLogbook = async () => {
    if (!activity || saved) return
    await saveActivity(activity)
    setSaved(true)
    Alert.alert('Saved', 'Activity added to your logbook.')
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading activity...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const checklist = DLOG_CHECKLISTS[activity.activityTypeId] ?? []
  const summary = buildSummary(activity)
  const hasRoute = activity.waypoints.length > 0
  const hasGpx = gpxWaypoints.length > 0

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header info */}
        <View style={styles.headerCard}>
          <Text style={styles.activityTitle}>{activity.activityLabel}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaChip}>{formatDate(activity.date)}</Text>
            {activity.locationName ? (
              <Text style={styles.metaChip}>{activity.locationName}</Text>
            ) : null}
            {activity.isQmd && (
              <View style={styles.qmdBadge}>
                <Text style={styles.qmdText}>QMD</Text>
              </View>
            )}
          </View>
        </View>

        {/* GPX section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>GPX File</Text>
          {hasGpx ? (
            <>
              <MapPreview waypoints={gpxWaypoints} />
              <Text style={styles.sectionHint}>
                {hasRoute
                  ? `${activity.waypoints.length} point${activity.waypoints.length !== 1 ? 's' : ''} — upload to DLOG to plot your route on the map.`
                  : 'A location pin will be generated. Build or import a full route for a complete track.'}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.actionBtn, styles.actionBtnGreen, pressed && { opacity: 0.7 }]}
                onPress={handleDownloadGpx}
              >
                <View style={styles.downloadIcon}>
                  <View style={styles.dlArrow} />
                  <View style={styles.dlLine} />
                  <View style={styles.dlBase} />
                </View>
                <Text style={styles.actionBtnText}>Download GPX File</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.actionBtn, styles.actionBtnMuted, pressed && { opacity: 0.7 }]}
                onPress={() => router.push('/dlog/gpx-builder')}
              >
                <Text style={styles.actionBtnText}>{hasRoute ? 'Edit / import route' : 'Build or import a route'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.sectionHint}>
                No route or location yet. Add one to generate a GPX file for DLOG.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.actionBtn, styles.actionBtnGreen, pressed && { opacity: 0.7 }]}
                onPress={() => router.push('/dlog/gpx-builder')}
              >
                <Text style={styles.actionBtnText}>Build or import a route</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* DLOG Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>DLOG Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnMuted, pressed && { opacity: 0.7 }]}
            onPress={handleShareSummary}
          >
            <View style={styles.shareIcon}>
              <View style={styles.shareArrow} />
            </View>
            <Text style={styles.actionBtnText}>Share Summary</Text>
          </Pressable>
        </View>

        {/* DLOG Checklist */}
        {checklist.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>DLOG Checklist</Text>
            {checklist.map((item, i) => (
              <View key={i} style={styles.checkItem}>
                <View style={styles.checkbox}>
                  <View style={styles.checkShort} />
                  <View style={styles.checkLong} />
                </View>
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Open DLOG */}
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnGreen, styles.fullWidthBtn, pressed && { opacity: 0.7 }]}
          onPress={() => Linking.openURL('https://cms.tahdah.me')}
        >
          <Text style={styles.actionBtnText}>Open DLOG</Text>
          <View style={styles.externalIcon}>
            <View style={styles.extArrow} />
          </View>
        </Pressable>

        {/* Save to logbook / View logbook */}
        {!saved ? (
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnMuted, styles.fullWidthBtn, pressed && { opacity: 0.7 }]}
            onPress={handleSaveToLogbook}
          >
            <Text style={styles.actionBtnText}>Save to Logbook</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnMuted, styles.fullWidthBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/dlog/logbook')}
          >
            <Text style={styles.actionBtnText}>View Logbook</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function buildSummary(a: DLogActivity): string {
  const lines = [
    `Activity: ${a.activityLabel}`,
    `Date: ${formatDate(a.date)}`,
  ]
  if (a.endDate) lines.push(`End Date: ${formatDate(a.endDate)}`)
  lines.push(`Location: ${a.locationName || 'Not specified'}`)
  if (a.dlogDuration) lines.push(`Duration: ${a.dlogDuration}`)
  else if (a.durationHours != null) lines.push(`Duration: ${a.durationHours} hours`)
  if (a.distanceKm != null) lines.push(`Distance: ${a.distanceKm} km`)
  if (a.dlogFrequency) lines.push(`Frequency: ${a.dlogFrequency}`)
  if (a.dlogType) lines.push(`Type: ${a.dlogType}`)
  if (a.dlogStyle) lines.push(`Style: ${a.dlogStyle}`)
  if (a.adjectivalGrade) lines.push(`Adjectival Grade: ${a.adjectivalGrade}`)
  if (a.technicalGrade) lines.push(`Technical Grade: ${a.technicalGrade}`)
  if (a.numRoutes != null) lines.push(`Number of Routes: ${a.numRoutes}`)
  if (a.expeditions) lines.push(`Expeditions: ${a.expeditions}`)
  if (a.isQmd) lines.push('QMD: Yes')
  if (a.isMultiPitch) lines.push('Multi-pitch: Yes')
  const desc = a.description || a.notes
  if (desc) lines.push(`Description: ${desc}`)
  return lines.join('\n')
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 48, paddingTop: 16 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.textSec, fontSize: 15 },

  headerCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    backgroundColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 13,
    color: C.textSec,
    fontWeight: '600',
  },
  qmdBadge: {
    backgroundColor: C.green,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qmdText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  sectionCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSec,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 13,
    color: C.textMuted,
    marginBottom: 12,
  },

  summaryCard: {
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
    color: C.textSec,
    lineHeight: 22,
    fontFamily: 'monospace',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  actionBtnGreen: {
    backgroundColor: C.green,
  },
  actionBtnMuted: {
    backgroundColor: C.border,
  },
  fullWidthBtn: {
    marginBottom: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },

  /* Download icon */
  downloadIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dlArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: 2,
  },
  dlLine: {
    position: 'absolute',
    top: 1,
    width: 2,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  dlBase: {
    position: 'absolute',
    bottom: 1,
    width: 14,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },

  /* Share icon */
  shareIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: C.text,
  },

  /* External link icon */
  externalIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: C.text,
    transform: [{ rotate: '45deg' }],
  },

  /* Checklist */
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.green,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 2,
    flexShrink: 0,
  },
  checkShort: {
    position: 'absolute',
    width: 5,
    height: 2,
    backgroundColor: C.green,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateX: -2 }, { translateY: 1 }],
  },
  checkLong: {
    position: 'absolute',
    width: 9,
    height: 2,
    backgroundColor: C.green,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: -1 }],
  },
  checkText: {
    flex: 1,
    fontSize: 14,
    color: C.textSec,
    lineHeight: 20,
  },
})
