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

// Parse an existing GPX file (from a watch, Strava, Garmin, etc.) into waypoints.
// Reads <trkpt> track points first; if none, falls back to <wpt>/<rtept> markers.
export function parseGpx(xml: string): Waypoint[] {
  const points: Waypoint[] = []
  const tags = ['trkpt', 'wpt', 'rtept']
  let chosen: RegExpMatchArray[] = []
  for (const tag of tags) {
    const re = new RegExp(`<${tag}[^>]*lat="([-\\d.]+)"[^>]*lon="([-\\d.]+)"[^>]*?(/>|>([\\s\\S]*?)</${tag}>)`, 'g')
    const matches = [...xml.matchAll(re)]
    if (matches.length > 0) { chosen = matches; break }
  }
  chosen.forEach((m, i) => {
    const lat = parseFloat(m[1])
    const lng = parseFloat(m[2])
    if (Number.isNaN(lat) || Number.isNaN(lng)) return
    const inner = m[4] ?? ''
    const eleMatch = inner.match(/<ele>([-\d.]+)<\/ele>/)
    const nameMatch = inner.match(/<name>([\s\S]*?)<\/name>/)
    points.push({
      id: `${Date.now()}-${i}`,
      lat,
      lng,
      name: nameMatch ? unescapeXml(nameMatch[1].trim()) : `Point ${i + 1}`,
      ele: eleMatch ? parseFloat(eleMatch[1]) : undefined,
    })
  })
  return points
}

// For long recorded tracks, thin out points so the map/list stays responsive
// while keeping the route shape. Keeps first, last, and every Nth point.
export function simplifyWaypoints(points: Waypoint[], maxPoints = 200): Waypoint[] {
  if (points.length <= maxPoints) return points
  const step = Math.ceil(points.length / maxPoints)
  const out: Waypoint[] = []
  for (let i = 0; i < points.length; i += step) out.push(points[i])
  if (out[out.length - 1] !== points[points.length - 1]) out.push(points[points.length - 1])
  return out
}

function unescapeXml(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
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
