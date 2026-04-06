/**
 * PDF extraction for Mountain Training checklist documents.
 * Uses pdf-parse to extract text, then structure it into sections and items.
 */

import type { ParsedSection } from './html-parser'

export interface PdfParseResult {
  sections: ParsedSection[]
  rawText: string
  pageCount: number
  confidence: number
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  let pdfParse: typeof import('pdf-parse')
  try {
    pdfParse = (await import('pdf-parse')).default as any
  } catch {
    console.warn('[pdf-parser] pdf-parse not available')
    return { sections: [], rawText: '', pageCount: 0, confidence: 0 }
  }

  let data: { text: string; numpages: number }
  try {
    data = await pdfParse(buffer)
  } catch (err) {
    console.error('[pdf-parser] Parse error:', err)
    return { sections: [], rawText: '', pageCount: 0, confidence: 0 }
  }

  const sections = extractSectionsFromText(data.text)
  const confidence = sections.length > 0 ? 0.7 : 0.2

  return {
    sections,
    rawText: data.text,
    pageCount: data.numpages,
    confidence,
  }
}

function extractSectionsFromText(text: string): ParsedSection[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const sections: ParsedSection[] = []
  let currentSection: ParsedSection | null = null

  for (const line of lines) {
    if (isLikelySectionHeading(line)) {
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection)
      }
      currentSection = { title: line, items: [], order: sections.length }
    } else if (isLikelyChecklistItem(line)) {
      if (currentSection) {
        currentSection.items.push(cleanItemText(line))
      } else {
        // Items before first heading — create a default section
        currentSection = { title: 'General', items: [], order: 0 }
        currentSection.items.push(cleanItemText(line))
      }
    }
  }

  if (currentSection && currentSection.items.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

function isLikelySectionHeading(line: string): boolean {
  if (line.length < 3 || line.length > 80) return false

  // All caps
  if (line === line.toUpperCase() && line.length > 5) return true

  // Numbered heading like "1." or "Section 1"
  if (/^(section\s+)?\d+[.:]\s+/i.test(line)) return true

  // Bold-like (PDF extractors sometimes use ** or similar)
  if (/^\*\*.*\*\*$/.test(line)) return true

  // Common MT section names
  const knownSections = [
    'navigation',
    'meteorology',
    'emergency',
    'leadership',
    'campcraft',
    'group management',
    'access',
    'ropework',
    'terrain',
    'river',
    'movement',
    'coaching',
    'teaching',
  ]
  if (knownSections.some((s) => line.toLowerCase().includes(s)) && line.length < 50) return true

  return false
}

function isLikelyChecklistItem(line: string): boolean {
  if (line.length < 10) return false

  // Bullet points
  if (/^[•·▪▸\-*]\s/.test(line)) return true

  // Checkbox markers
  if (/^\[[ x]\]\s/i.test(line)) return true

  // Numbered items
  if (/^\d+[.)]\s/.test(line)) return true

  // Long descriptive lines (likely item text)
  if (line.length > 20 && line.length < 200 && !line.endsWith(':')) return true

  return false
}

function cleanItemText(text: string): string {
  return text
    .replace(/^[•·▪▸\-*]\s+/, '')
    .replace(/^\[[ x]\]\s+/i, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}
