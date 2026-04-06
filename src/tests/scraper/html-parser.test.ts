import { describe, it, expect } from 'vitest'
import { parseQualificationPage, parseQualificationIndex } from '@/lib/scraper/html-parser'

const SAMPLE_QUAL_HTML = `
<!DOCTYPE html>
<html>
<head><title>Mountain Leader | Mountain Training</title></head>
<body>
  <nav class="breadcrumb">
    <a href="/">Home</a> / <a href="/qualifications">Qualifications</a> /
    <a href="/qualifications/walking">Walking</a> / Mountain Leader
  </nav>
  <main>
    <h1>Mountain Leader</h1>
    <p class="intro">The Mountain Leader award is the UK's premier qualification for leading groups in mountain terrain.</p>

    <h2>Syllabus</h2>

    <h3>Navigation</h3>
    <ul>
      <li>Use a map accurately in all conditions</li>
      <li>Take and follow a bearing</li>
      <li>Navigate at night</li>
    </ul>

    <h3>Meteorology</h3>
    <ul>
      <li>Interpret weather forecasts</li>
      <li>Recognise weather patterns in the field</li>
    </ul>

    <h3>Emergency Procedures</h3>
    <ul>
      <li>Manage a mountain casualty</li>
      <li>Summon mountain rescue</li>
    </ul>

    <h2>Resources</h2>
    <a href="/files/ml-checklist.pdf">ML Skills Checklist PDF</a>
    <a href="/files/ml-handbook.pdf">Candidate Handbook</a>
  </main>
</body>
</html>
`

const SAMPLE_INDEX_HTML = `
<!DOCTYPE html>
<html>
<body>
  <main>
    <h2>Walking</h2>
    <a href="/qualifications/walking/mountain-leader">Mountain Leader</a>
    <a href="/qualifications/walking/winter-mountain-leader">Winter Mountain Leader</a>

    <h2>Climbing</h2>
    <a href="/qualifications/climbing/rock-climbing-instructor">Rock Climbing Instructor</a>
    <a href="/qualifications/climbing/climbing-wall-instructor">Climbing Wall Instructor</a>

    <a href="/about">About (not a qual)</a>
    <a href="/qualifications">All qualifications</a>
  </main>
</body>
</html>
`

describe('parseQualificationPage', () => {
  it('extracts the title', () => {
    const result = parseQualificationPage(SAMPLE_QUAL_HTML, 'https://www.mountain-training.org/qualifications/walking/mountain-leader')
    expect(result.title).toBe('Mountain Leader')
  })

  it('extracts summary text', () => {
    const result = parseQualificationPage(SAMPLE_QUAL_HTML, 'https://www.mountain-training.org/qualifications/walking/mountain-leader')
    expect(result.summary).toContain('Mountain Leader award')
  })

  it('detects walking pathway from URL', () => {
    const result = parseQualificationPage(SAMPLE_QUAL_HTML, 'https://www.mountain-training.org/qualifications/walking/mountain-leader')
    expect(result.pathway).toBe('Walking')
  })

  it('extracts syllabus sections with items', () => {
    const result = parseQualificationPage(SAMPLE_QUAL_HTML, 'https://www.mountain-training.org/qualifications/walking/mountain-leader')
    expect(result.sections.length).toBeGreaterThan(0)
    const navSection = result.sections.find((s) => s.title === 'Navigation')
    expect(navSection).toBeDefined()
    expect(navSection?.items).toContain('Use a map accurately in all conditions')
  })

  it('extracts resource links including checklist PDF', () => {
    const result = parseQualificationPage(SAMPLE_QUAL_HTML, 'https://www.mountain-training.org/qualifications/walking/mountain-leader')
    const checklist = result.resourceLinks.find((l) => l.type === 'checklist')
    expect(checklist).toBeDefined()
    expect(checklist?.url).toContain('ml-checklist.pdf')
  })

  it('extracts handbook link', () => {
    const result = parseQualificationPage(SAMPLE_QUAL_HTML, 'https://www.mountain-training.org')
    const handbook = result.resourceLinks.find((l) => l.type === 'handbook')
    expect(handbook).toBeDefined()
  })

  it('assigns a confidence score > 0', () => {
    const result = parseQualificationPage(SAMPLE_QUAL_HTML, 'https://www.mountain-training.org')
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })
})

describe('parseQualificationIndex', () => {
  it('extracts qualification URLs', () => {
    const result = parseQualificationIndex(SAMPLE_INDEX_HTML)
    expect(result.length).toBeGreaterThanOrEqual(4)
  })

  it('assigns correct pathway from URL path', () => {
    const result = parseQualificationIndex(SAMPLE_INDEX_HTML)
    const ml = result.find((q) => q.url.includes('mountain-leader'))
    expect(ml?.pathway).toBe('Walking')
    const rci = result.find((q) => q.url.includes('rock-climbing-instructor'))
    expect(rci?.pathway).toBe('Climbing & Coaching')
  })

  it('excludes non-qualification links', () => {
    const result = parseQualificationIndex(SAMPLE_INDEX_HTML)
    const aboutLink = result.find((q) => q.url.includes('/about'))
    expect(aboutLink).toBeUndefined()
  })
})
