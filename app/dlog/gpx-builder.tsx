import React, { useState, useRef, useCallback } from 'react'
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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { type Waypoint } from '@/lib/dlog/types'
import { calcDistanceKm } from '@/lib/dlog/gpx'

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
  var polyline = L.polyline([], {color: '#4A8B28', weight: 3}).addTo(map);
  
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

  const distanceKm = calcDistanceKm(waypoints)

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

  const handleDone = async () => {
    await AsyncStorage.setItem('mta:dlog:pending-waypoints', JSON.stringify(waypoints))
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
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback
        />
      </View>

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
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
  safe: { flex: 1, backgroundColor: '#0F1A0A' },
  mapContainer: { width: '100%' },
  map: { flex: 1 },
  panel: { flex: 1, backgroundColor: '#0F1A0A' },
  panelContent: { padding: 16, paddingBottom: 48 },

  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1A2E10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E4A1E',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  distIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  distLine: { width: 16, height: 2, backgroundColor: '#4A8B28', borderRadius: 1 },
  distText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#ECF0E6' },
  waypointCount: { fontSize: 13, color: '#8FA882', fontWeight: '600' },

  wpRow: {
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
  wpNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4A8B28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wpNumText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  wpNameWrap: { flex: 1 },
  wpName: { fontSize: 14, fontWeight: '600', color: '#ECF0E6' },
  wpCoords: { fontSize: 11, color: '#536644', marginTop: 2 },
  wpEditInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ECF0E6',
    borderBottomWidth: 1,
    borderBottomColor: '#4A8B28',
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
    backgroundColor: '#EF4444',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    position: 'absolute',
    width: 14,
    height: 2,
    backgroundColor: '#EF4444',
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  emptyHint: { fontSize: 13, color: '#536644', fontStyle: 'italic', textAlign: 'center', paddingVertical: 12 },

  doneBtn: {
    backgroundColor: '#4A8B28',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  doneBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
})
