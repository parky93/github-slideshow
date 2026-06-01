import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import type { Waypoint } from '@/lib/dlog/types'
import { C, RADIUS } from '@/lib/theme'

interface Props {
  waypoints: Waypoint[]
  height?: number
}

// Read-only Leaflet/OpenTopoMap preview showing a pin (single location) or a
// route polyline (multiple waypoints). Auto-fits to the points.
export function MapPreview({ waypoints, height = 180 }: Props) {
  const html = useMemo(() => {
    const pts = JSON.stringify(waypoints.map(w => [w.lat, w.lng]))
    return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;padding:0;width:100%;height:100vh;background:#0A0F08;}</style>
</head>
<body>
<div id="map"></div>
<script>
  var pts = ${pts};
  var map = L.map('map', { zoomControl: false, attributionControl: false, dragging: true, scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17 }).addTo(map);
  if (pts.length === 1) {
    map.setView(pts[0], 13);
    L.marker(pts[0]).addTo(map);
  } else if (pts.length > 1) {
    var line = L.polyline(pts, { color: '#4ade80', weight: 4 }).addTo(map);
    L.marker(pts[0]).addTo(map);
    L.marker(pts[pts.length - 1]).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [24, 24] });
  } else {
    map.setView([54.5, -3.5], 6);
  }
</script>
</body>
</html>`
  }, [waypoints])

  if (waypoints.length === 0) return null

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        source={{ html }}
        style={styles.web}
        scrollEnabled={false}
        javaScriptEnabled
        originWhitelist={['*']}
        pointerEvents="none"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
    backgroundColor: C.bg,
  },
  web: { flex: 1, backgroundColor: C.bg },
})
