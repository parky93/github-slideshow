// Shared TypeScript types that mirror the Prisma models + app-specific extensions

export type RatingValue = 1 | 2 | 3 | 4 | 5
export type ConfidenceValue = 1 | 2 | 3 | 4 | 5

export const RATING_LABELS: Record<RatingValue, string> = {
  1: 'Not yet',
  2: 'Emerging',
  3: 'Developing',
  4: 'Solid',
  5: 'Assessment ready',
}

export const RATING_COLORS: Record<RatingValue, string> = {
  1: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
  2: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
  3: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
  4: 'bg-lime-100 text-lime-700 border-lime-200 hover:bg-lime-200',
  5: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
}

export const RATING_ACTIVE_COLORS: Record<RatingValue, string> = {
  1: 'bg-red-500 text-white border-red-500',
  2: 'bg-orange-500 text-white border-orange-500',
  3: 'bg-amber-500 text-white border-amber-500',
  4: 'bg-lime-500 text-white border-lime-500',
  5: 'bg-green-600 text-white border-green-600',
}

export const CONFIDENCE_LABELS: Record<ConfidenceValue, string> = {
  1: 'Very unsure',
  2: 'Unsure',
  3: 'Fairly sure',
  4: 'Sure',
  5: 'Very sure',
}

export const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not started', color: 'text-slate-400' },
  { value: 'aware', label: 'Aware of it', color: 'text-blue-500' },
  { value: 'practised', label: 'Practised a bit', color: 'text-amber-500' },
  { value: 'independent', label: 'Can do independently', color: 'text-lime-600' },
  { value: 'assessment_ready', label: 'Assessment ready', color: 'text-green-600' },
] as const

export type ItemStatus = 'not_started' | 'aware' | 'practised' | 'independent' | 'assessment_ready'

export const ITEM_TAGS = [
  'navigation',
  'ropework',
  'leadership',
  'weather',
  'emergency procedures',
  'teaching',
  'movement coaching',
  'participant management',
  'campcraft',
  'terrain judgement',
  'river lore',
  'access',
  'environment',
  'equipment',
  'first aid',
] as const

export type ItemTag = typeof ITEM_TAGS[number]

export type QualificationCategory = 'walking' | 'climbing' | 'coaching'
export type QualificationType = 'qualification' | 'module'

export interface QualKeyInfo {
  trainingDays?: string
  assessmentDays?: string
  prerequisites?: string[]
  entryAge?: string
  recommendedExperience?: string
  registrationRequired?: boolean
}

// ---- Enriched data types for UI consumption ----

export interface QualificationWithMeta {
  id: string
  slug: string
  title: string
  category: QualificationCategory
  pathway: string
  qualType: QualificationType
  officialUrl: string
  handbookUrl?: string | null
  checklistUrl?: string | null
  summary?: string | null
  keyInfo?: QualKeyInfo | null
  sourceLastCheckedAt?: Date | null
  sourceLastChangedAt?: Date | null
  isActive: boolean
  isFavourite: boolean
  lastViewedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  // Computed
  totalItems?: number
  ratedItems?: number
  overallScore?: number
  completionPct?: number
}

export interface SectionWithItems {
  id: string
  qualificationId: string
  title: string
  description?: string | null
  order: number
  parentSectionId?: string | null
  weight: number
  isActive: boolean
  items: ChecklistItemWithRating[]
  // Computed
  sectionScore?: number
  sectionCompletion?: number
  trafficLight?: 'red' | 'amber' | 'green'
}

export interface ChecklistItemWithRating {
  id: string
  qualificationId: string
  sectionId: string
  stableKey: string
  prompt: string
  description?: string | null
  sourceType: string
  sourceUrl?: string | null
  order: number
  extractionConfidence: number
  isActive: boolean
  defaultTags: string[]
  rating?: UserRatingData | null
}

export interface UserRatingData {
  id: string
  checklistItemId: string
  ratingValue?: number | null
  confidenceValue?: number | null
  status: ItemStatus
  needsCoaching: boolean
  notes?: string | null
  evidenceSummary?: string | null
  tags: string[]
  lastPractisedAt?: Date | null
  updatedAt: Date
}

export interface ReadinessScore {
  overallScore: number        // 0-100
  overallPct: number          // same, as percentage display
  scoreConfidence: number     // 0-100, based on completion
  completionPct: number       // % of items rated
  totalItems: number
  ratedItems: number
  sectionScores: SectionScore[]
  trafficLight: 'red' | 'amber' | 'green'
}

export interface SectionScore {
  sectionId: string
  sectionTitle: string
  score: number              // 0-100
  completion: number         // 0-100
  itemCount: number
  ratedCount: number
  trafficLight: 'red' | 'amber' | 'green'
}

export interface ReadinessInsights {
  weakestSections: SectionScore[]
  strongestSections: SectionScore[]
  topImprovements: ChecklistItemWithRating[]
  unratedItems: ChecklistItemWithRating[]
  needsCoachingItems: ChecklistItemWithRating[]
  practiseNextItems: ChecklistItemWithRating[]
  summary: string
}

export interface RefreshProgress {
  step: string
  status: 'running' | 'done' | 'error' | 'warning'
  message: string
  detail?: string
  timestamp: Date
}

export interface RefreshResult {
  success: boolean
  fetchMethod: 'fetch' | 'playwright' | 'cached'
  urlsFetched: string[]
  changeSet?: {
    itemsAdded: number
    itemsRemoved: number
    itemsChanged: number
    sectionsChanged: number
    summary: string
    requiresReview: boolean
    details?: {
      added: Array<{ stableKey: string; prompt: string; section: string }>
      removed: Array<{ stableKey: string; prompt: string; section: string }>
      changed: Array<{ stableKey: string; oldPrompt: string; newPrompt: string; section: string }>
    }
  }
  errors?: string[]
  warnings?: string[]
}
