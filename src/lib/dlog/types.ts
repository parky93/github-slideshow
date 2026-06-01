export type ActivityCategory = 'walking' | 'climbing-outdoor' | 'climbing-indoor' | 'other'

export interface ActivityType {
  id: string
  category: ActivityCategory
  label: string
  hasQmd?: boolean     // show Quality Mountain Day toggle
  hasPitchToggle?: boolean  // single/multi pitch
}

export const ACTIVITY_TYPES: ActivityType[] = [
  // Walking
  { id: 'mountain-walk', category: 'walking', label: 'Mountain Walk', hasQmd: true },
  { id: 'hill-moorland', category: 'walking', label: 'Hill & Moorland Walk', hasQmd: true },
  { id: 'lowland-walk', category: 'walking', label: 'Lowland Walk' },
  { id: 'winter-walk', category: 'walking', label: 'Winter Walk' },
  { id: 'scramble', category: 'walking', label: 'Scramble' },
  // Outdoor climbing
  { id: 'trad-climbing', category: 'climbing-outdoor', label: 'Trad Climbing', hasPitchToggle: true },
  { id: 'sport-climbing', category: 'climbing-outdoor', label: 'Sport Climbing' },
  { id: 'outdoor-bouldering', category: 'climbing-outdoor', label: 'Outdoor Bouldering' },
  { id: 'winter-climbing', category: 'climbing-outdoor', label: 'Winter Climbing' },
  // Indoor climbing
  { id: 'top-rope', category: 'climbing-indoor', label: 'Top Rope Session' },
  { id: 'lead-session', category: 'climbing-indoor', label: 'Lead Climbing Session' },
  { id: 'indoor-bouldering', category: 'climbing-indoor', label: 'Indoor Bouldering' },
  { id: 'observer-session', category: 'climbing-indoor', label: 'Observer/Assistant Session' },
  // Other
  { id: 'alpine', category: 'other', label: 'Alpine' },
]

export interface Waypoint {
  id: string
  name: string
  lat: number
  lng: number
  ele?: number
}

export interface LocationResult {
  name: string
  displayName: string
  lat: number
  lng: number
}

export interface DLogActivity {
  id: string
  activityTypeId: string
  activityLabel: string
  date: string          // ISO date "2025-09-15"
  locationName: string
  lat: number | null
  lng: number | null
  durationHours: number | null
  distanceKm: number | null
  isQmd: boolean
  isMultiPitch: boolean
  notes: string
  waypoints: Waypoint[]
  gpxFilename: string | null
  createdAt: string
}

export const DLOG_CHECKLISTS: Record<string, string[]> = {
  'mountain-walk': [
    'Have you tagged this as a QMD if applicable?',
    'Have you noted which summits you visited?',
    'Did you log group size and your role?',
  ],
  'hill-moorland': [
    'Have you tagged this as a Quality Day if applicable?',
    'Did you note the terrain type (moorland / ridge / valley)?',
  ],
  'trad-climbing': [
    'Have you selected the correct discipline (Trad, not Sport)?',
    'Have you noted the grade?',
    'Single pitch or multi pitch — is it selected correctly?',
  ],
  'sport-climbing': [
    'Have you selected Sport Climbing (not Trad)?',
    'Have you noted the grade?',
  ],
  'top-rope': [
    'Have you searched for the wall by name in DLOG?',
    'Session type selected: Top Rope',
  ],
  'lead-session': [
    'Have you searched for the wall by name in DLOG?',
    'Session type selected: Lead Climbing',
  ],
  'indoor-bouldering': [
    'Have you searched for the wall by name in DLOG?',
    'Session type selected: Bouldering',
  ],
  'observer-session': [
    'Have you noted your role (Observer / Assistant)?',
    'Have you logged the wall name?',
  ],
}
