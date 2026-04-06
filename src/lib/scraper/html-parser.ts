import * as cheerio from 'cheerio'

export interface ParsedQualification {
  title: string
  summary: string
  pathway: string
  keyInfo: {
    trainingDays?: string
    assessmentDays?: string
    prerequisites?: string[]
    entryAge?: string
    recommendedExperience?: string
  }
  sections: ParsedSection[]
  resourceLinks: ParsedResourceLink[]
  confidence: number
}

export interface ParsedSection {
  title: string
  items: string[]
  order: number
}

export interface ParsedResourceLink {
  type: 'checklist' | 'handbook' | 'guide' | 'pdf' | 'other'
  label: string
  url: string
}

/**
 * Parse a Mountain Training qualification page HTML.
 * Tries multiple selector strategies in order of specificity.
 */
export function parseQualificationPage(html: string, baseUrl: string): ParsedQualification {
  const $ = cheerio.load(html)

  const title = extractTitle($)
  const summary = extractSummary($)
  const pathway = extractPathway($, baseUrl)
  const keyInfo = extractKeyInfo($)
  const sections = extractSyllabusSections($)
  const resourceLinks = extractResourceLinks($, baseUrl)

  // Confidence based on how much we extracted
  let confidence = 0.3
  if (title) confidence += 0.2
  if (sections.length > 0) confidence += 0.3
  if (resourceLinks.length > 0) confidence += 0.1
  if (summary) confidence += 0.1

  return {
    title,
    summary,
    pathway,
    keyInfo,
    sections,
    resourceLinks,
    confidence: Math.min(1, confidence),
  }
}

function extractTitle($: cheerio.CheerioAPI): string {
  // Try common heading selectors
  const selectors = [
    'h1.qualification-title',
    '.page-header h1',
    'main h1',
    'article h1',
    '.content h1',
    'h1',
  ]

  for (const sel of selectors) {
    const text = $(sel).first().text().trim()
    if (text && text.length > 3) return text
  }

  return $('title').text().replace(' | Mountain Training', '').trim()
}

function extractSummary($: cheerio.CheerioAPI): string {
  const selectors = [
    '.qualification-summary',
    '.page-intro p',
    '.intro p',
    'main > p:first-of-type',
    '.content > p:first-of-type',
  ]

  for (const sel of selectors) {
    const text = $(sel).first().text().trim()
    if (text && text.length > 20) return text
  }

  return ''
}

function extractPathway($: cheerio.CheerioAPI, baseUrl: string): string {
  if (baseUrl.includes('/walking/')) return 'Walking'
  if (baseUrl.includes('/climbing/')) return 'Climbing & Coaching'

  // Try breadcrumb
  const breadcrumb = $('.breadcrumb, nav[aria-label="breadcrumb"]').text()
  if (breadcrumb.toLowerCase().includes('walking')) return 'Walking'
  if (breadcrumb.toLowerCase().includes('climbing')) return 'Climbing & Coaching'

  return 'Unknown'
}

function extractKeyInfo($: cheerio.CheerioAPI): ParsedQualification['keyInfo'] {
  const info: ParsedQualification['keyInfo'] = {}

  // Look for key info table or list
  const text = $('body').text()

  const trainingMatch = text.match(/training[:\s]+(\d+[\s-]*days?)/i)
  if (trainingMatch) info.trainingDays = trainingMatch[1]

  const assessmentMatch = text.match(/assessment[:\s]+(\d+[\s-]*days?)/i)
  if (assessmentMatch) info.assessmentDays = assessmentMatch[1]

  return info
}

function extractSyllabusSections($: cheerio.CheerioAPI): ParsedSection[] {
  const sections: ParsedSection[] = []

  // Strategy 1: Look for explicit syllabus section
  const syllabusSelectors = [
    '.syllabus',
    '#syllabus',
    '[data-section="syllabus"]',
    '.content-section',
  ]

  for (const sel of syllabusSelectors) {
    const container = $(sel)
    if (container.length === 0) continue

    container.find('h2, h3').each((i, el) => {
      const heading = $(el).text().trim()
      if (!heading || heading.length < 3) return

      const items: string[] = []
      $(el)
        .nextUntil('h2, h3')
        .find('li')
        .each((_, li) => {
          const text = $(li).text().trim()
          if (text) items.push(text)
        })

      if (heading) {
        sections.push({ title: heading, items, order: sections.length })
      }
    })

    if (sections.length > 0) return sections
  }

  // Strategy 2: Find h2/h3 elements followed by bullet lists in main content
  $('main, article, .content').find('h2, h3').each((i, el) => {
    const heading = $(el).text().trim()
    if (!heading || heading.length < 3) return

    // Skip UI chrome headings (not skill section titles)
    const skip = ['overview', 'contact', 'footer', 'main menu', 'site menu', 'breadcrumb']
    if (skip.some((s) => heading.toLowerCase() === s)) return

    const items: string[] = []
    $(el)
      .nextUntil('h2, h3')
      .filter('ul, ol')
      .find('li')
      .each((_, li) => {
        const text = $(li).text().trim()
        if (text) items.push(text)
      })

    if (items.length > 0) {
      sections.push({ title: heading, items, order: sections.length })
    }
  })

  return sections
}

function extractResourceLinks($: cheerio.CheerioAPI, baseUrl: string): ParsedResourceLink[] {
  const links: ParsedResourceLink[] = []
  const seen = new Set<string>()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()

    if (!href) return

    const absoluteUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString()

    if (seen.has(absoluteUrl)) return
    seen.add(absoluteUrl)

    const lowerHref = href.toLowerCase()
    const lowerText = text.toLowerCase()

    let type: ParsedResourceLink['type'] = 'other'

    if (lowerHref.includes('.pdf') || lowerText.includes('pdf')) {
      if (lowerText.includes('checklist') || lowerHref.includes('checklist')) {
        type = 'checklist'
      } else if (lowerText.includes('handbook') || lowerHref.includes('handbook')) {
        type = 'handbook'
      } else {
        type = 'pdf'
      }
    } else if (lowerText.includes('checklist')) {
      type = 'checklist'
    } else if (lowerText.includes('handbook')) {
      type = 'handbook'
    } else if (lowerText.includes('guide')) {
      type = 'guide'
    } else {
      return // Skip non-resource links
    }

    links.push({ type, label: text, url: absoluteUrl })
  })

  return links
}

/**
 * Parse the Mountain Training qualifications index page to discover all qual URLs.
 */
export function parseQualificationIndex(
  html: string,
  baseUrl = 'https://www.mountain-training.org'
): Array<{ title: string; url: string; pathway: string }> {
  const $ = cheerio.load(html)
  const qualifications: Array<{ title: string; url: string; pathway: string }> = []
  const seen = new Set<string>()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().trim()

    if (!href || !text) return

    // Only qualification paths
    if (!href.includes('/qualifications/')) return
    if (href.split('/').length < 4) return // Need at least /qualifications/pathway/name

    const absoluteUrl = href.startsWith('http') ? href : baseUrl + href

    if (seen.has(absoluteUrl)) return
    seen.add(absoluteUrl)

    const pathParts = href.split('/').filter(Boolean)
    let pathway = 'Unknown'
    if (pathParts[1] === 'walking') pathway = 'Walking'
    else if (pathParts[1] === 'climbing') pathway = 'Climbing & Coaching'

    qualifications.push({ title: text, url: absoluteUrl, pathway })
  })

  return qualifications
}
