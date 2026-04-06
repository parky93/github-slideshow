import crypto from 'crypto'

/**
 * Generate a deterministic stable key for a checklist item.
 *
 * The key is based on the qualification slug, section title, and item prompt.
 * Normalisation ensures small wording changes don't break mappings.
 *
 * Key format: first 12 hex chars of SHA-256(qualSlug:normSection:normPrompt)
 */

export function normaliseText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
}

export function generateStableKey(
  qualSlug: string,
  sectionTitle: string,
  itemPrompt: string
): string {
  const input = `${qualSlug}:${normaliseText(sectionTitle)}:${normaliseText(itemPrompt)}`
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 12)
}

/**
 * Validate that a stable key looks correct (12 hex chars).
 */
export function isValidStableKey(key: string): boolean {
  return /^[0-9a-f]{12}$/.test(key)
}
