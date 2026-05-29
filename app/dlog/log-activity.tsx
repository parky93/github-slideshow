import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ACTIVITY_TYPES, type Waypoint } from '@/lib/dlog/types'
import { saveActivity } from '@/lib/dlog/storage'
import { calcDistanceKm } from '@/lib/dlog/gpx'

function getTodayISO() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

function formatDateDisplay(iso: string) {
  const [y, m, day] = iso.split('-')
  return `${day}/${m}/${y}`
}

function parseDateInput(s: string): string | null {
  // Accepts DD/MM/YYYY
  const parts = s.split('/')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return null
  const iso = `${yyyy}-${mm}-${dd}`
  if (isNaN(Date.parse(iso))) return null
  return iso
}

export default function LogActivityScreen() {
  const router = useRouter()
  const { typeId } = useLocalSearchParams<{ typeId: string }>()

  const activityType = ACTIVITY_TYPES.find(t => t.id === typeId)

  const [dateInput, setDateInput] = useState(formatDateDisplay(getTodayISO()))
  const [locationName, setLocationName] = useState('')
  const [locationLat, setLocationLat] = useState<number | null>(null)
  const [locationLng, setLocationLng] = useState<number | null>(null)
  const [durationHours, setDurationHours] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [isQmd, setIsQmd] = useState(false)
  const [isMultiPitch, setIsMultiPitch] = useState(false)
  const [notes, setNotes] = useState('')
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])

  // Check for pending location from location-search screen
  useFocusEffect(
    useCallback(() => {
      async function checkPendingLocation() {
        const raw = await AsyncStorage.getItem('mta:dlog:pending-location')
        if (raw) {
          const loc = JSON.parse(raw)
          setLocationName(loc.name || loc.displayName || '')
          setLocationLat(loc.lat ?? null)
          setLocationLng(loc.lng ?? null)
          await AsyncStorage.removeItem('mta:dlog:pending-location')
        }
      }
      async function checkPendingWaypoints() {
        const raw = await AsyncStorage.getItem('mta:dlog:pending-waypoints')
        if (raw) {
          const wps: Waypoint[] = JSON.parse(raw)
          setWaypoints(wps)
          const dist = calcDistanceKm(wps)
          if (dist > 0) setDistanceKm(String(dist))
          await AsyncStorage.removeItem('mta:dlog:pending-waypoints')
        }
      }
      checkPendingLocation()
      checkPendingWaypoints()
    }, [])
  )

  const handleSave = async () => {
    if (!activityType) {
      Alert.alert('Error', 'No activity type selected')
      return
    }

    const isoDate = parseDateInput(dateInput)
    if (!isoDate) {
      Alert.alert('Invalid Date', 'Please enter date in DD/MM/YYYY format')
      return
    }

    const id = Date.now().toString()
    const activity = {
      id,
      activityTypeId: activityType.id,
      activityLabel: activityType.label,
      date: isoDate,
      locationName: locationName.trim() || 'Unknown location',
      lat: locationLat,
      lng: locationLng,
      durationHours: durationHours ? parseFloat(durationHours) : null,
      distanceKm: distanceKm ? parseFloat(distanceKm) : null,
      isQmd,
      isMultiPitch,
      notes: notes.trim(),
      waypoints,
      gpxFilename: null,
      createdAt: new Date().toISOString(),
    }

    await saveActivity(activity)
    router.replace(`/dlog/export?activityId=${id}`)
  }

  if (!activityType) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Unknown activity type</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Activity type (read-only) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Activity Type</Text>
            <Pressable
              style={({ pressed }) => [styles.readOnlyRow, pressed && { opacity: 0.7 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.readOnlyValue}>{activityType.label}</Text>
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#536644"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location</Text>
            <Pressable
              style={({ pressed }) => [styles.locationRow, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/dlog/location-search')}
            >
              <View style={styles.pinIconSmall}>
                <View style={styles.pinDotSmall} />
              </View>
              <Text style={[styles.locationText, !locationName && styles.locationPlaceholder]}>
                {locationName || 'Search for a location...'}
              </Text>
              <View style={styles.rowChevron}>
                <View style={styles.chevronLine1} />
                <View style={styles.chevronLine2} />
              </View>
            </Pressable>
          </View>

          {/* Duration */}
          <View style={styles.sectionRow}>
            <View style={[styles.section, styles.flex]}>
              <Text style={styles.sectionLabel}>Duration (hours)</Text>
              <TextInput
                style={styles.input}
                value={durationHours}
                onChangeText={setDurationHours}
                placeholder="e.g. 4.5"
                placeholderTextColor="#536644"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.section, styles.flex]}>
              <Text style={styles.sectionLabel}>Distance (km)</Text>
              <TextInput
                style={styles.input}
                value={distanceKm}
                onChangeText={setDistanceKm}
                placeholder="optional"
                placeholderTextColor="#536644"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* QMD toggle */}
          {activityType.hasQmd && (
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>Quality Mountain Day</Text>
                  <Text style={styles.toggleHint}>Tag this as a QMD for DLOG</Text>
                </View>
                <Switch
                  value={isQmd}
                  onValueChange={setIsQmd}
                  trackColor={{ false: '#2E4A1E', true: '#4A8B28' }}
                  thumbColor="#ECF0E6"
                />
              </View>
            </View>
          )}

          {/* Multi-pitch toggle */}
          {activityType.hasPitchToggle && (
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>Multi-pitch</Text>
                  <Text style={styles.toggleHint}>Off = single pitch</Text>
                </View>
                <Switch
                  value={isMultiPitch}
                  onValueChange={setIsMultiPitch}
                  trackColor={{ false: '#2E4A1E', true: '#4A8B28' }}
                  thumbColor="#ECF0E6"
                />
              </View>
            </View>
          )}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Conditions, companions, highlights..."
              placeholderTextColor="#536644"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Waypoints */}
          <View style={styles.section}>
            <View style={styles.waypointsHeader}>
              <Text style={styles.sectionLabel}>Waypoints / Route</Text>
              <Pressable
                style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
                onPress={() => router.push('/dlog/gpx-builder')}
              >
                <Text style={styles.addBtnText}>+ Build GPX</Text>
              </Pressable>
            </View>
            {waypoints.length === 0 ? (
              <Text style={styles.noWaypoints}>No waypoints added. Use GPX Builder to plan your route.</Text>
            ) : (
              waypoints.map((wp, i) => (
                <View key={wp.id} style={styles.waypointRow}>
                  <View style={styles.waypointNum}>
                    <Text style={styles.waypointNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.waypointName}>{wp.name}</Text>
                  <Text style={styles.waypointCoords}>
                    {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Save button */}
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>Save Activity</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F1A0A' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 48, paddingTop: 12 },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#8FA882', fontSize: 15 },

  section: {
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#536644',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A2E10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#ECF0E6',
  },
  notesInput: {
    minHeight: 90,
    paddingTop: 13,
  },

  readOnlyRow: {
    backgroundColor: '#1A2E10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ECF0E6',
  },
  changeText: {
    fontSize: 13,
    color: '#4A8B28',
    fontWeight: '600',
  },

  locationRow: {
    backgroundColor: '#1A2E10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pinIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2E4A1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4A8B28' },
  locationText: { flex: 1, fontSize: 15, color: '#ECF0E6', fontWeight: '500' },
  locationPlaceholder: { color: '#536644', fontWeight: '400' },
  rowChevron: { width: 16, height: 16, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  chevronLine1: {
    position: 'absolute', width: 8, height: 2, backgroundColor: '#536644',
    borderRadius: 1, transform: [{ rotate: '45deg' }, { translateY: -3 }],
  },
  chevronLine2: {
    position: 'absolute', width: 8, height: 2, backgroundColor: '#536644',
    borderRadius: 1, transform: [{ rotate: '-45deg' }, { translateY: 3 }],
  },

  toggleRow: {
    backgroundColor: '#1A2E10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#ECF0E6' },
  toggleHint: { fontSize: 12, color: '#536644', marginTop: 2 },

  waypointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: '#1A2E10',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A8B28',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#4A8B28' },
  noWaypoints: {
    fontSize: 13,
    color: '#536644',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2E10',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    gap: 10,
  },
  waypointNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4A8B28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointNumText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  waypointName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#ECF0E6' },
  waypointCoords: { fontSize: 11, color: '#536644' },

  saveBtn: {
    backgroundColor: '#4A8B28',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
})
