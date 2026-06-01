// Modern design system for MTA Ready
// Premium forest-dark palette inspired by Strava / Whoop / Linear / Things 3.

export const C = {
  // Backgrounds — deeper, richer than before
  bg: '#0A0F08',          // near-black forest base
  bgElevated: '#0E150B',
  surface: '#15200E',      // card base
  surfaceHi: '#1C2B12',    // elevated/active card
  border: '#283D1B',
  borderSubtle: '#1E2E14',
  // Greens
  green: '#5BA82E',
  greenBright: '#8FE34A',  // lime accent for highlights/CTAs
  greenDim: '#3C6B1F',
  // Text
  text: '#F2F6EC',
  textSec: '#9DB58C',
  textMuted: '#5E7350',
  // Status (brightened)
  red: '#FF5A5A',
  amber: '#FFB23E',
  greenStatus: '#5BD96B',
  blue: '#5B9BFF',
  orange: '#FF8A3D',
}

// Gradients (use with expo-linear-gradient)
export const GRAD = {
  cta: ['#5BA82E', '#8FE34A'] as const,        // primary buttons
  greenGlow: ['#1C2B12', '#15200E'] as const,  // card surfaces
  hero: ['#16241000', '#0A0F08'] as const,
  ring: ['#8FE34A', '#5BA82E'] as const,
}

export const RADIUS = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 }
export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 }

// Traffic-light status colors (brightened to match new theme)
export const STATUS = {
  red: C.red,
  amber: C.amber,
  green: C.greenStatus,
}

export function trafficColor(score: number): string {
  if (score >= 0.65) return STATUS.green
  if (score >= 0.35) return STATUS.amber
  return STATUS.red
}
