import React, { useState, useCallback } from 'react'
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
import {
  ACTIVITY_TYPES,
  type Waypoint,
  DLOG_FREQUENCY,
  DLOG_TYPES,
  DLOG_STYLES,
  DLOG_ADJ_GRADES,
  DLOG_TECH_GRADES,
  DLOG_DURATIONS,
} from '@/lib/dlog/types'
import { saveActivity } from '@/lib/dlog/storage'
import { calcDistanceKm } from '@/lib/dlog/gpx'
import { MapPreview } from '@/components/MapPreview'
import { PickerModal } from '@/components/PickerModal'
import { C, RADIUS } from '@/lib/theme'

function getTodayISO() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

function formatDateDisplay(iso: string) {
  const [y, m, day] = iso.split('-')
  return `${day}/${m}/${y}`
}

function parseDateInput(s: string): string | null {
  const parts = s.split('/')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return null
  const iso = `${yyyy}-${mm}-${dd}`
  if (isNaN(Date.parse(iso))) return null
  return iso
}

// Small inline chevron drawn with two rectangles
function Chevron() {
  return (
    <View style={styles.rowChevron}>
      <View style={styles.chevronLine1} />
      <View style={styles.chevronLine2} />
    </View>
  )
}

interface PickerRowProps {
  label: string
  value: string
  placeholder?: string
  onPress: () => void
}

function PickerRow({ label, value, placeholder, onPress }: PickerRowProps) {
  const hasValue = value !== '' && value !== undefined
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Pressable
        style={({ pressed }) => [styles.pickerRow, pressed && { opacity: 0.7 }]}
        onPress={onPress}
      >
        <Text style={[styles.pickerRowValue, !hasValue && styles.pickerRowPlaceholder]}>
          {hasValue ? value : (placeholder ?? 'Select...')}
        </Text>
        <Chevron />
      </Pressable>
    </View>
  )
}

type PickerKey =
  | 'frequency'
  | 'type'
  | 'style'
  | 'adjGrade'
  | 'techGrade'
  | 'duration'

export default function LogActivityScreen() {
  const router = useRouter()
  const { typeId } = useLocalSearchParams<{ typeId: string }>()

  const activityType = ACTIVITY_TYPES.find(t => t.id === typeId)
  const isClimbing = activityType?.category === 'climbing-outdoor' || activityType?.category === 'climbing-indoor'

  // Core fields
  const [dateInput, setDateInput] = useState(formatDateDisplay(getTodayISO()))
  const [endDateInput, setEndDateInput] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationLat, setLocationLat] = useState<number | null>(null)
  const [locationLng, setLocationLng] = useState<number | null>(null)
  const [distanceKm, setDistanceKm] = useState('')
  const [isQmd, setIsQmd] = useState(false)
  const [isMultiPitch, setIsMultiPitch] = useState(false)
  const [description, setDescription] = useState('')
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])

  // DLOG picker fields
  const [dlogDuration, setDlogDuration] = useState('')
  const [dlogFrequency, setDlogFrequency] = useState('None')
  const [dlogType, setDlogType] = useState('')
  const [dlogStyle, setDlogStyle] = useState('')
  const [adjectivalGrade, setAdjectivalGrade] = useState('N/A')
  const [technicalGrade, setTechnicalGrade] = useState('N/A')
  const [numRoutes, setNumRoutes] = useState(1)
  const [expeditions, setExpeditions] = useState('')

  // Picker modal state
  const [activePicker, setActivePicker] = useState<PickerKey | null>(null)

  const isMultiDay = dlogDuration === 'Multi-day'

  // Check for pending location or waypoints when screen focuses
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

    let isoEndDate: string | undefined
    if (isMultiDay && endDateInput.trim()) {
      const parsed = parseDateInput(endDateInput.trim())
      if (!parsed) {
        Alert.alert('Invalid End Date', 'Please enter end date in DD/MM/YYYY format')
        return
      }
      isoEndDate = parsed
    }

    const id = Date.now().toString()
    const activity = {
      id,
      activityTypeId: activityType.id,
      activityLabel: activityType.label,
      date: isoDate,
      endDate: isoEndDate,
      locationName: locationName.trim() || 'Unknown location',
      lat: locationLat,
      lng: locationLng,
      durationHours: null,
      distanceKm: distanceKm ? parseFloat(distanceKm) : null,
      isQmd,
      isMultiPitch,
      notes: description.trim(),
      description: description.trim(),
      waypoints,
      gpxFilename: null,
      createdAt: new Date().toISOString(),
      // DLOG fields
      dlogDuration: dlogDuration || undefined,
      dlogFrequency: dlogFrequency !== 'None' ? dlogFrequency : undefined,
      dlogType: dlogType || undefined,
      dlogStyle: dlogStyle || undefined,
      adjectivalGrade: adjectivalGrade !== 'N/A' ? adjectivalGrade : undefined,
      technicalGrade: technicalGrade !== 'N/A' ? technicalGrade : undefined,
      numRoutes: isClimbing ? numRoutes : undefined,
      expeditions: expeditions.trim() || undefined,
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

  // Picker config
  const pickerConfig: Record<PickerKey, { title: string; options: string[]; value: string; onSelect: (v: string) => void }> = {
    frequency: { title: 'Frequency', options: DLOG_FREQUENCY, value: dlogFrequency, onSelect: setDlogFrequency },
    type: { title: 'Activity Type', options: DLOG_TYPES, value: dlogType, onSelect: setDlogType },
    style: { title: 'Style', options: DLOG_STYLES, value: dlogStyle, onSelect: setDlogStyle },
    adjGrade: { title: 'Adjectival Grade', options: DLOG_ADJ_GRADES, value: adjectivalGrade, onSelect: setAdjectivalGrade },
    techGrade: { title: 'Technical Grade', options: DLOG_TECH_GRADES, value: technicalGrade, onSelect: setTechnicalGrade },
    duration: { title: 'Duration', options: DLOG_DURATIONS, value: dlogDuration, onSelect: setDlogDuration },
  }

  const currentPicker = activePicker ? pickerConfig[activePicker] : null

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
            <Text style={styles.sectionLabel}>Start Date</Text>
            <TextInput
              style={styles.input}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={C.textMuted}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Duration picker */}
          <PickerRow
            label="Duration"
            value={dlogDuration}
            placeholder="Select duration..."
            onPress={() => setActivePicker('duration')}
          />

          {/* End date — only shown when Multi-day is selected */}
          {isMultiDay && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>End Date</Text>
              <TextInput
                style={styles.input}
                value={endDateInput}
                onChangeText={setEndDateInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={C.textMuted}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          )}

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
              <Chevron />
            </Pressable>
          </View>

          {/* Distance */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Distance (km)</Text>
            <TextInput
              style={styles.input}
              value={distanceKm}
              onChangeText={setDistanceKm}
              placeholder="Optional"
              placeholderTextColor={C.textMuted}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Frequency picker */}
          <PickerRow
            label="Frequency"
            value={dlogFrequency}
            onPress={() => setActivePicker('frequency')}
          />

          {/* Climbing-specific fields */}
          {isClimbing && (
            <>
              <PickerRow
                label="Type"
                value={dlogType}
                placeholder="Select type..."
                onPress={() => setActivePicker('type')}
              />
              <PickerRow
                label="Style"
                value={dlogStyle}
                placeholder="Select style..."
                onPress={() => setActivePicker('style')}
              />
              <PickerRow
                label="Adjectival Grade"
                value={adjectivalGrade}
                onPress={() => setActivePicker('adjGrade')}
              />
              <PickerRow
                label="Technical Grade"
                value={technicalGrade}
                onPress={() => setActivePicker('techGrade')}
              />

              {/* Number of routes stepper */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Number of Routes</Text>
                <View style={styles.stepperRow}>
                  <Pressable
                    style={({ pressed }) => [styles.stepperBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => setNumRoutes(n => Math.max(0, n - 1))}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </Pressable>
                  <Text style={styles.stepperValue}>{numRoutes}</Text>
                  <Pressable
                    style={({ pressed }) => [styles.stepperBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => setNumRoutes(n => n + 1)}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* Expeditions */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Expeditions</Text>
            <TextInput
              style={styles.input}
              value={expeditions}
              onChangeText={setExpeditions}
              placeholder="None"
              placeholderTextColor={C.textMuted}
            />
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
                  trackColor={{ false: C.border, true: C.green }}
                  thumbColor={C.text}
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
                  trackColor={{ false: C.border, true: C.green }}
                  thumbColor={C.text}
                />
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.descInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Conditions, companions, highlights..."
              placeholderTextColor={C.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Waypoints / Route */}
          <View style={styles.section}>
            <View style={styles.waypointsHeader}>
              <Text style={styles.sectionLabel}>Waypoints / Route</Text>
              <Pressable
                style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
                onPress={async () => {
                  await AsyncStorage.setItem('mta:dlog:builder-init', JSON.stringify({
                    location: locationLat != null && locationLng != null
                      ? { name: locationName || 'Location', lat: locationLat, lng: locationLng }
                      : null,
                    waypoints,
                  }))
                  router.push('/dlog/gpx-builder')
                }}
              >
                <Text style={styles.addBtnText}>+ Build GPX</Text>
              </Pressable>
            </View>
            <MapPreview
              waypoints={
                waypoints.length > 0
                  ? waypoints
                  : locationLat != null && locationLng != null
                    ? [{ id: 'loc', name: locationName || 'Location', lat: locationLat, lng: locationLng }]
                    : []
              }
            />
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

      {/* Picker modals */}
      {currentPicker && (
        <PickerModal
          visible={activePicker !== null}
          title={currentPicker.title}
          options={currentPicker.options}
          selected={currentPicker.value}
          onSelect={currentPicker.onSelect}
          onClose={() => setActivePicker(null)}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 48, paddingTop: 12 },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: C.textSec, fontSize: 15 },

  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
  },
  descInput: {
    minHeight: 90,
    paddingTop: 13,
  },

  pickerRow: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerRowValue: {
    fontSize: 15,
    fontWeight: '500',
    color: C.text,
    flex: 1,
  },
  pickerRowPlaceholder: {
    color: C.textMuted,
    fontWeight: '400',
  },

  readOnlyRow: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  changeText: {
    fontSize: 13,
    color: C.green,
    fontWeight: '600',
  },

  locationRow: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
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
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  locationText: { flex: 1, fontSize: 15, color: C.text, fontWeight: '500' },
  locationPlaceholder: { color: C.textMuted, fontWeight: '400' },
  rowChevron: { width: 16, height: 16, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  chevronLine1: {
    position: 'absolute', width: 8, height: 2, backgroundColor: C.textMuted,
    borderRadius: 1, transform: [{ rotate: '45deg' }, { translateY: -3 }],
  },
  chevronLine2: {
    position: 'absolute', width: 8, height: 2, backgroundColor: C.textMuted,
    borderRadius: 1, transform: [{ rotate: '-45deg' }, { translateY: 3 }],
  },

  toggleRow: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: C.text },
  toggleHint: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: C.green,
    lineHeight: 22,
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    minWidth: 32,
    textAlign: 'center',
  },

  waypointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.green,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: C.green },
  noWaypoints: {
    fontSize: 13,
    color: C.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    gap: 10,
  },
  waypointNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waypointNumText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  waypointName: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  waypointCoords: { fontSize: 11, color: C.textMuted },

  saveBtn: {
    backgroundColor: C.green,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
})
