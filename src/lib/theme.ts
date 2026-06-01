export const C = {
  // Backgrounds
  bg:           '#0a0f0a',
  bgElevated:   '#111811',
  surface:      '#111811',
  surfaceHi:    '#182018',
  surfaceHi2:   '#1e281e',
  // Borders — glass-edge technique: white at low opacity on dark bg
  border:       'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  borderBright: 'rgba(255,255,255,0.14)',
  // Greens
  green:        '#22c55e',   // --green2
  greenBright:  '#4ade80',   // --green
  greenDim:     '#15803d',
  // Accents
  blue:         '#60a5fa',
  purple:       '#a78bfa',
  amber:        '#fbbf24',
  orange:       '#fb923c',
  red:          '#f87171',
  // Text
  text:         '#e8f5e8',
  textSec:      '#9ab89a',
  textMuted:    '#5a7a5a',
  // Status aliases
  greenStatus:  '#22c55e',
}

export const GRAD = {
  cta:       ['#22c55e', '#4ade80'] as const,
  greenGlow: ['#1e281e', '#111811'] as const,
  hero:      ['#16241000', '#0a0f0a'] as const,
  ring:      ['#4ade80', '#22c55e'] as const,
}

export const RADIUS = { sm: 7, md: 12, lg: 16, xl: 22, pill: 999 }
export const SPACE  = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }

export const STATUS = {
  red:   C.red,
  amber: C.amber,
  green: C.greenStatus,
}

export function trafficColor(score: number): string {
  if (score >= 0.65) return STATUS.green
  if (score >= 0.35) return STATUS.amber
  return STATUS.red
}
