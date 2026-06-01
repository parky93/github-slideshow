import type { Waypoint } from './types'

export function buildGpx(activityName: string, date: string, waypoints: Waypoint[]): string {
  const trkpts = waypoints.map(wp => {
    const ele = wp.ele != null ? `\n        <ele>${wp.ele}</ele>` : ''
    return `      <trkpt lat="${wp.lat}" lon="${wp.lng}">${ele}
        <time>${date}T12:00:00Z</time>
        <name>${escapeXml(wp.name)}</name>
      </trkpt>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MTA Ready App" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(activityName)}</name>
    <time>${date}T12:00:00Z</time>
  </metadata>
  <trk>
    <name>${escapeXml(activityName)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function calcDistanceKm(waypoints: Waypoint[]): number {
  let total = 0
  for (let i = 1; i < waypoints.length; i++) {
    total += haversineKm(waypoints[i - 1].lat, waypoints[i - 1].lng, waypoints[i].lat, waypoints[i].lng)
  }
  return Math.round(total * 10) / 10
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function deg2rad(d: number) { return d * Math.PI / 180 }
