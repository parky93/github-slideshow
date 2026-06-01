export type RatingValue = 1 | 2 | 3 | 4 | 5

export const RATING_LABELS: Record<RatingValue, string> = {
  1: 'New',
  2: 'Aware',
  3: 'Learning',
  4: 'Confident',
  5: 'Ready',
}

// Dark-tinted backgrounds for active rating buttons (matches HTML .rb.rN.on)
export const RATING_COLORS: Record<RatingValue, string> = {
  1: '#3f1818',
  2: '#3f2a10',
  3: '#3f3010',
  4: '#1a3020',
  5: '#0f2a18',
}

// Border + text color when active
export const RATING_ACTIVE_COLORS: Record<RatingValue, string> = {
  1: '#f87171',
  2: '#fb923c',
  3: '#fbbf24',
  4: '#4ade80',
  5: '#22c55e',
}

export const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Very unsure',
  2: 'Unsure',
  3: 'Moderate',
  4: 'Confident',
  5: 'Very confident',
}

export type TrafficLight = 'red' | 'amber' | 'green'

export const TRAFFIC_COLORS: Record<TrafficLight, string> = {
  red: '#ef4444',
  amber: '#f59e0b',
  green: '#22c55e',
}

export interface UserRating {
  id: number
  itemId: number
  ratingValue: RatingValue | null
  confidenceValue: number | null
  notes: string
  tags: string[]
  needsCoaching: boolean
  updatedAt: string
}

export interface ChecklistItem {
  id: number
  sectionId: number
  prompt: string
  detail: string | null
  sortOrder: number
  isCoachingItem: boolean
  rating: UserRating | null
}

export interface Section {
  id: number
  qualificationId: number
  title: string
  sortOrder: number
  items: ChecklistItem[]
}

export interface Qualification {
  id: number
  slug: string
  name: string
  category: string
  qualType: string
  pathway: string | null
  summary: string | null
  officialUrl: string | null
  isFavourite: boolean
  lastViewedAt: string | null
}

export interface QualificationWithMeta extends Qualification {
  totalItems: number
  ratedItems: number
  readinessScore: number
}

export interface SectionScore {
  sectionId: number
  title: string
  score: number
  completion: number
  light: TrafficLight
}

export interface ReadinessScore {
  overall: number
  completion: number
  light: TrafficLight
  sectionScores: SectionScore[]
}

export interface ProgressSnapshot {
  id: number
  qualificationId: number
  score: number
  completion: number
  label: string | null
  createdAt: string
}

export interface TargetDate {
  qualificationId: number
  date: string  // ISO date string (date only, e.g. "2025-09-15")
}

export interface CoachingNeedItem {
  qualId: number
  qualName: string
  qualSlug: string
  itemId: number
  prompt: string
  sectionTitle: string
  ratingValue: RatingValue | null
  notes: string
}

export interface TrainingLogEntry {
  id: string
  itemId: number
  date: string       // ISO date e.g. "2025-09-15"
  notes: string
  createdAt: string  // ISO datetime
}
