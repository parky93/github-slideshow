/**
 * Orchestrates fetching and parsing a qualification page.
 * Returns structured qualification data ready for database upsert.
 */

import { fetchPage, fetchBinary, politeDelay } from './fetcher'
import { parseQualificationPage, type ParsedQualification, type ParsedResourceLink } from './html-parser'
import { parsePdf } from './pdf-parser'
import { generateStableKey } from '@/lib/mapping/stable-key'

export interface ParsedQualFull extends ParsedQualification {
  slug: string
  officialUrl: string
  checklistUrl?: string
  handbookUrl?: string
  checklistSections?: Array<{
    title: string
    items: string[]
    order: number
  }>
  fetchMethod: 'fetch' | 'playwright' | 'cached'
  errors: string[]
  warnings: string[]
}

export async function parseQualificationFull(
  slug: string,
  officialUrl: string,
  onProgress?: (msg: string) => void
): Promise<ParsedQualFull> {
  const errors: string[] = []
  const warnings: string[] = []
  const log = (msg: string) => onProgress?.(msg)

  log(`Fetching qualification page: ${officialUrl}`)

  const pageResult = await fetchPage(officialUrl)

  if (!pageResult) {
    errors.push(`Could not fetch ${officialUrl} — site may be blocking automated access`)
    return {
      slug,
      officialUrl,
      title: slug,
      summary: '',
      pathway: '',
      keyInfo: {},
      sections: [],
      resourceLinks: [],
      confidence: 0,
      fetchMethod: 'cached',
      errors,
      warnings,
    }
  }

  log(`Parsing qualification page (method: ${pageResult.method})`)
  const parsed = parseQualificationPage(pageResult.html, officialUrl)

  log(`Extracted ${parsed.sections.length} sections, ${parsed.resourceLinks.length} resource links`)

  // Try to fetch checklist PDF
  let checklistUrl: string | undefined
  let handbookUrl: string | undefined
  let checklistSections = parsed.sections

  const checklistLink = parsed.resourceLinks.find((l) => l.type === 'checklist')
  const handbookLink = parsed.resourceLinks.find((l) => l.type === 'handbook')

  if (checklistLink) {
    checklistUrl = checklistLink.url
    log(`Found checklist resource: ${checklistUrl}`)

    if (checklistUrl.toLowerCase().endsWith('.pdf')) {
      await politeDelay(1000)
      log('Downloading checklist PDF...')
      const pdfBuffer = await fetchBinary(checklistUrl)

      if (pdfBuffer) {
        log('Parsing checklist PDF...')
        const pdfResult = await parsePdf(pdfBuffer)

        if (pdfResult.sections.length > 0) {
          log(`PDF yielded ${pdfResult.sections.length} sections`)
          checklistSections = pdfResult.sections
        } else {
          warnings.push('Checklist PDF downloaded but no sections extracted — using page syllabus')
        }
      } else {
        warnings.push('Could not download checklist PDF')
      }
    }
  }

  if (handbookLink) {
    handbookUrl = handbookLink.url
  }

  return {
    slug,
    officialUrl,
    title: parsed.title,
    summary: parsed.summary,
    pathway: parsed.pathway,
    keyInfo: parsed.keyInfo,
    sections: parsed.sections,
    checklistSections,
    resourceLinks: parsed.resourceLinks,
    confidence: parsed.confidence,
    checklistUrl,
    handbookUrl,
    fetchMethod: pageResult.method,
    errors,
    warnings,
  }
}

/**
 * Generate structured checklist items with stable keys from parsed sections.
 */
export function buildChecklistItems(
  qualSlug: string,
  sections: Array<{ title: string; items: string[]; order: number }>
): Array<{
  stableKey: string
  prompt: string
  sectionTitle: string
  sectionOrder: number
  order: number
}> {
  const result: Array<{
    stableKey: string
    prompt: string
    sectionTitle: string
    sectionOrder: number
    order: number
  }> = []

  for (const section of sections) {
    for (let i = 0; i < section.items.length; i++) {
      const prompt = section.items[i]
      if (!prompt || prompt.length < 3) continue

      result.push({
        stableKey: generateStableKey(qualSlug, section.title, prompt),
        prompt,
        sectionTitle: section.title,
        sectionOrder: section.order,
        order: i,
      })
    }
  }

  return result
}
