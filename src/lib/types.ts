export type RatingValue = 1 | 2 | 3 | 4 | 5

export const RATING_LABELS: Record<RatingValue, string> = {
  1: 'Not yet',
  2: 'Aware',
  3: 'Practicing',
  4: 'Confident',
  5: 'Ready',
}

export const RATING_COLORS: Record<RatingValue, string> = {
  1: '#3B1515',
  2: '#3B2200',
  3: '#152340',
  4: '#0F2E1A',
  5: '#0A2614',
}

export const RATING_ACTIVE_COLORS: Record<RatingValue, string> = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#3B82F6',
  4: '#22C55E',
  5: '#16A34A',
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
