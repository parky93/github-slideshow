import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { useRouter } from 'expo-router'
import { Alert } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { File } from 'expo-file-system'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { type Waypoint } from '@/lib/dlog/types'
import { calcDistanceKm, parseGpx, simplifyWaypoints } from '@/lib/dlog/gpx'
import { C } from '@/lib/theme'

const SCREEN_HEIGHT = Dimensions.get('window').height
const MAP_HEIGHT = Math.round(SCREEN_HEIGHT * 0.55)

const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  body { margin: 0; padding: 0; }
  #map { width: 100%; height: 100vh; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map').setView([54.5, -3.5], 8);
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenTopoMap',
    maxZoom: 17
  }).addTo(map);
  
  var waypoints = [];
  var markers = [];
  var polyline = L.polyline([], {color: '#8FE34A', weight: 4}).addTo(map);

  function fitToWaypoints() {
    if (waypoints.length > 0) {
      var bounds = L.latLngBounds(waypoints.map(function(w){ return [w.lat, w.lng]; }));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }
  
  function updatePolyline() {
    polyline.setLatLngs(waypoints.map(function(w) { return [w.lat, w.lng]; }));
  }
  
  map.on('click', function(e) {
    var wp = { id: Date.now().toString(), lat: e.latlng.lat, lng: e.latlng.lng, name: 'Waypoint ' + (waypoints.length + 1), ele: null };
    waypoints.push(wp);
    var marker = L.marker([wp.lat, wp.lng]).addTo(map).bindPopup(wp.name);
    markers.push(marker);
    updatePolyline();
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'waypointsUpdated', waypoints: waypoints }));
  });
  
  window.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'setWaypoints') {
        markers.forEach(function(m) { map.removeLayer(m); });
        markers = [];
        waypoints = msg.waypoints;
        waypoints.forEach(function(wp) {
          var m = L.marker([wp.lat, wp.lng]).addTo(map).bindPopup(wp.name);
          markers.push(m);
        });
        updatePolyline();
        fitToWaypoints();
      }
      if (msg.type === 'removeWaypoint') {
        waypoints = waypoints.filter(function(w) { return w.id !== msg.id; });
        markers.forEach(function(m) { map.removeLayer(m); });
        markers = [];
        waypoints.forEach(function(wp) {
          var m = L.marker([wp.lat, wp.lng]).addTo(map).bindPopup(wp.name);
          markers.push(m);
        });
        updatePolyline();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'waypointsUpdated', waypoints: waypoints }));
      }
    } catch(err) {}
  });
</script>
</body>
</html>`

export default function GpxBuilderScreen() {
  const router = useRouter()
  const webViewRef = useRef<WebView>(null)
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [seedLoaded, setSeedLoaded] = useState(false)
  const seedRef = useRef<Waypoint[]>([])
  const seededRef = useRef(false)

  const distanceKm = calcDistanceKm(waypoints)

  // Load any location/route passed in from the activity form, and seed the map:
  // a searched location drops as a single pin; an existing route loads its points.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('mta:dlog:builder-init')
        if (raw) {
          const init = JSON.parse(raw) as { location: { name: string; lat: number; lng: number } | null; waypoints: Waypoint[] }
          let seed: Waypoint[] = []
          if (init.waypoints && init.waypoints.length > 0) {
            seed = init.waypoints
          } else if (init.location) {
            seed = [{ id: Date.now().toString(), name: init.location.name, lat: init.location.lat, lng: init.location.lng, ele: undefined }]
          }
          seedRef.current = seed
          if (seed.length > 0) setWaypoints(seed)
        }
      } catch {}
      setSeedLoaded(true)
    })()
  }, [])

  // Once both the map is ready and the seed is loaded, push the seed onto the map (once).
  useEffect(() => {
    if (mapReady && seedLoaded && !seededRef.current && seedRef.current.length > 0) {
      seededRef.current = true
      webViewRef.current?.postMessage(JSON.stringify({ type: 'setWaypoints', waypoints: seedRef.current }))
    }
  }, [mapReady, seedLoaded])

  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data)
      if (msg.type === 'waypointsUpdated') {
        setWaypoints(msg.waypoints)
      }
    } catch {}
  }, [])

  const removeWaypoint = (id: string) => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'removeWaypoint', id }))
  }

  const startEdit = (wp: Waypoint) => {
    setEditingId(wp.id)
    setEditName(wp.name)
  }

  const finishEdit = (id: string) => {
    const updated = waypoints.map(wp => wp.id === id ? { ...wp, name: editName } : wp)
    setWaypoints(updated)
    webViewRef.current?.postMessage(JSON.stringify({ type: 'setWaypoints', waypoints: updated }))
    setEditingId(null)
    setEditName('')
  }

  const handleImportGpx = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/gpx+xml', 'application/octet-stream', 'application/xml', 'text/xml', '*/*'],
        copyToCacheDirectory: true,
      })
      if (res.canceled || !res.assets?.[0]) return
      const asset = res.assets[0]
      if (!asset.name?.toLowerCase().endsWith('.gpx')) {
        Alert.alert('Not a GPX file', 'Please choose a file ending in .gpx')
        return
      }
      const file = new File(asset.uri)
      const xml = await file.text()
      const parsed = simplifyWaypoints(parseGpx(xml))
      if (parsed.length === 0) {
        Alert.alert('No track found', 'Could not read any track points from that GPX file.')
        return
      }
      setWaypoints(parsed)
      webViewRef.current?.postMessage(JSON.stringify({ type: 'setWaypoints', waypoints: parsed }))
      Alert.alert('Imported', `${parsed.length} points loaded from ${asset.name}.`)
    } catch (e: any) {
      Alert.alert('Import failed', e?.message ? String(e.message) : 'Could not read that file.')
    }
  }

  const handleDone = async () => {
    await AsyncStorage.setItem('mta:dlog:pending-waypoints', JSON.stringify(waypoints))
    await AsyncStorage.removeItem('mta:dlog:builder-init')
    router.back()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.mapContainer, { height: MAP_HEIGHT }]}>
        <WebView
          ref={webViewRef}
          source={{ html: MAP_HTML }}
          style={styles.map}
          onMessage={handleMessage}
          onLoadEnd={() => setMapReady(true)}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback
        />
      </View>

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
        {/* Import existing GPX (from a watch / Strava / Garmin) */}
        <Pressable
          style={({ pressed }) => [styles.importBtn, pressed && { opacity: 0.7 }]}
          onPress={handleImportGpx}
        >
          <View style={styles.importIcon}>
            <View style={styles.importArrow} />
            <View style={styles.importLine} />
            <View style={styles.importBase} />
          </View>
          <Text style={styles.importText}>Import GPX from watch or app</Text>
        </Pressable>

        {/* Distance */}
        <View style={styles.distRow}>
          <View style={styles.distIcon}>
            <View style={styles.distLine} />
          </View>
          <Text style={styles.distText}>
            {distanceKm > 0 ? `${distanceKm} km` : 'Tap map to add waypoints'}
          </Text>
          <Text style={styles.waypointCount}>{waypoints.length} pts</Text>
        </View>

        {/* Waypoint list */}
        {waypoints.map((wp, i) => (
          <View key={wp.id} style={styles.wpRow}>
            <View style={styles.wpNum}>
              <Text style={styles.wpNumText}>{i + 1}</Text>
            </View>
            {editingId === wp.id ? (
              <TextInput
                style={styles.wpEditInput}
                value={editName}
                onChangeText={setEditName}
                onBlur={() => finishEdit(wp.id)}
                onSubmitEditing={() => finishEdit(wp.id)}
                autoFocus
              />
            ) : (
              <Pressable style={styles.wpNameWrap} onPress={() => startEdit(wp)}>
                <Text style={styles.wpName}>{wp.name}</Text>
                <Text style={styles.wpCoords}>{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.wpDelete, pressed && { opacity: 0.7 }]}
              onPress={() => removeWaypoint(wp.id)}
            >
              <View style={styles.xLine1} />
              <View style={styles.xLine2} />
            </Pressable>
          </View>
        ))}

        {waypoints.length === 0 && (
          <Text style={styles.emptyHint}>Tap anywhere on the map to add waypoints</Text>
        )}

        {/* Done button */}
        <Pressable
          style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.7 }]}
          onPress={handleDone}
        >
          <Text style={styles.doneBtnText}>Done — Add to Activity</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  mapContainer: { width: '100%' },
  map: { flex: 1 },
  panel: { flex: 1, backgroundColor: C.bg },
  panelContent: { padding: 16, paddingBottom: 48 },

  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.surfaceHi,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.green,
    paddingVertical: 13,
    marginBottom: 12,
  },
  importText: { fontSize: 15, fontWeight: '700', color: C.greenBright },
  importIcon: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  importArrow: {
    width: 0, height: 0,
    borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: C.greenBright,
    marginBottom: 3,
  },
  importLine: { position: 'absolute', top: 1, width: 2, height: 7, backgroundColor: C.greenBright, borderRadius: 1 },
  importBase: { position: 'absolute', bottom: 0, width: 12, height: 2, backgroundColor: C.greenBright, borderRadius: 1 },

  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  distIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  distLine: { width: 16, height: 2, backgroundColor: C.green, borderRadius: 1 },
  distText: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },
  waypointCount: { fontSize: 13, color: C.textSec, fontWeight: '600' },

  wpRow: {
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
  wpNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wpNumText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  wpNameWrap: { flex: 1 },
  wpName: { fontSize: 14, fontWeight: '600', color: C.text },
  wpCoords: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  wpEditInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    borderBottomWidth: 1,
    borderBottomColor: C.green,
    paddingVertical: 2,
  },
  wpDelete: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  xLine1: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: C.red,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: C.red,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  emptyHint: { fontSize: 13, color: C.textMuted, fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },

  doneBtn: {
    backgroundColor: C.green,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  doneBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
})
