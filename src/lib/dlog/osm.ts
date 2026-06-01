const NOMINATIM = 'https://nominatim.openstreetmap.org'
const OVERPASS = 'https://overpass-api.de/api/interpreter'
const UA = 'MTAReadyApp/1.0 (mta-ready)'

export type PlaceType = 'indoor-wall' | 'outdoor-crag' | 'walking-route' | 'summit' | 'place'

export interface OsmPlace {
  id: string
  name: string
  type: PlaceType
  lat: number
  lng: number
  subtitle: string
}

export async function searchPlaces(query: string): Promise<OsmPlace[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '20',
    countrycodes: 'gb',
    addressdetails: '1',
    extratags: '1',
  })
  const res = await fetch(`${NOMINATIM}/search?${params}`, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en' },
  })
  if (!res.ok) return []
  const data: any[] = await res.json()
  return data.map(item => ({
    id: `nom-${item.osm_type}-${item.osm_id}`,
    name: (item.name || item.display_name.split(',')[0]).trim(),
    type: classifyNominatim(item),
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    subtitle: buildSubtitle(item),
  }))
}

// Search OSM Overpass for climbing venues + peaks near a UK coordinate
export async function searchNearby(lat: number, lng: number, radiusM = 20000): Promise<OsmPlace[]> {
  const q = `[out:json][timeout:15];(node["sport"="climbing"](around:${radiusM},${lat},${lng});way["sport"="climbing"](around:${radiusM},${lat},${lng});node["natural"="peak"](around:${radiusM},${lat},${lng}););out center;`
  try {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: `data=${encodeURIComponent(q)}`,
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.elements as any[])
      .filter(el => el.tags?.name)
      .map(el => ({
        id: `osm-${el.type}-${el.id}`,
        name: el.tags.name as string,
        type: classifyOverpass(el),
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
        subtitle: el.tags['addr:town'] || el.tags['addr:city'] || el.tags.ele ? `${el.tags.ele}m` : '',
      }))
      .filter(p => p.lat && p.lng)
  } catch {
    return []
  }
}

// Fetch the GPS track for a named hiking route relation from OSM
export async function fetchRouteWaypoints(osmRelationId: string): Promise<{ lat: number; lng: number }[]> {
  const id = osmRelationId.replace(/^osm-relation-/, '')
  const q = `[out:json][timeout:20];relation(${id});(._;>;);out body;`
  try {
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: `data=${encodeURIComponent(q)}`,
    })
    if (!res.ok) return []
    const data = await res.json()
    const nodes: Record<string, { lat: number; lng: number }> = {}
    for (const el of data.elements as any[]) {
      if (el.type === 'node') nodes[el.id] = { lat: el.lat, lng: el.lon }
    }
    const pts: { lat: number; lng: number }[] = []
    for (const el of data.elements as any[]) {
      if (el.type === 'way' && el.nodes) {
        for (const nid of el.nodes) {
          if (nodes[nid]) pts.push(nodes[nid])
        }
      }
    }
    return pts
  } catch {
    return []
  }
}

function classifyNominatim(item: any): PlaceType {
  const cls: string = item.class ?? ''
  const type: string = item.type ?? ''
  const extra = item.extratags ?? {}
  if (extra.sport === 'climbing' && (extra.indoor === 'yes' || cls === 'leisure')) return 'indoor-wall'
  if (extra.sport === 'climbing') return 'outdoor-crag'
  if (type === 'peak') return 'summit'
  if (cls === 'route' || type === 'hiking' || extra.route === 'hiking') return 'walking-route'
  return 'place'
}

function classifyOverpass(el: any): PlaceType {
  const t = el.tags ?? {}
  if (t.natural === 'peak') return 'summit'
  if (t.sport === 'climbing') return t.indoor === 'yes' || t.building ? 'indoor-wall' : 'outdoor-crag'
  if (t.route === 'hiking' || t.route === 'foot') return 'walking-route'
  return 'place'
}

function buildSubtitle(item: any): string {
  const a = item.address ?? {}
  const parts = [a.town || a.city || a.village, a.county].filter(Boolean)
  return parts.join(', ')
}

export const PLACE_TYPE_LABEL: Record<PlaceType, string> = {
  'indoor-wall': 'Indoor Wall',
  'outdoor-crag': 'Outdoor Crag',
  'walking-route': 'Walking Route',
  'summit': 'Summit',
  'place': 'Place',
}

export const PLACE_TYPE_EMOJI: Record<PlaceType, string> = {
  'indoor-wall': '🏟',
  'outdoor-crag': '🧗',
  'walking-route': '🥾',
  'summit': '⛰',
  'place': '📍',
}
