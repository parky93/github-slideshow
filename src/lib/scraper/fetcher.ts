/**
 * Multi-tier fetcher for mountain-training.org
 *
 * Tier 1: fetch() with browser-like headers — fast, works if site allows
 * Tier 2: Playwright headless Chromium — handles Cloudflare/bot protection
 * Tier 3: Return null — caller falls back to cached/seeded data
 *
 * The MT site consistently returns 403 to simple requests, so Playwright
 * is the reliable path. Tier 1 is attempted first for speed.
 */

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
}

export interface FetchResult {
  html: string
  url: string
  method: 'fetch' | 'playwright'
  statusCode?: number
}

export async function fetchPage(url: string): Promise<FetchResult | null> {
  // Tier 1: standard fetch with browser headers
  try {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const html = await response.text()
      return { html, url, method: 'fetch', statusCode: response.status }
    }

    if (response.status !== 403 && response.status !== 429) {
      // Not a bot-block — real error
      console.warn(`[fetcher] HTTP ${response.status} for ${url}`)
      return null
    }

    console.info(`[fetcher] Tier 1 blocked (${response.status}), trying Playwright for ${url}`)
  } catch (err) {
    console.info(`[fetcher] Tier 1 network error, trying Playwright: ${err}`)
  }

  // Tier 2: Playwright
  return fetchWithPlaywright(url)
}

async function fetchWithPlaywright(url: string): Promise<FetchResult | null> {
  let playwright: typeof import('playwright') | null = null

  try {
    playwright = await import('playwright')
  } catch {
    console.warn('[fetcher] Playwright not available — install with: npx playwright install chromium')
    return null
  }

  const browser = await playwright.chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  })

  try {
    const context = await browser.newContext({
      userAgent: BROWSER_HEADERS['User-Agent'],
      locale: 'en-GB',
      viewport: { width: 390, height: 844 },
    })

    const page = await context.newPage()

    // Remove Playwright detection markers
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    })

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

    // Wait for main content
    await page.waitForTimeout(1500)

    const html = await page.content()

    return { html, url, method: 'playwright' }
  } catch (err) {
    console.error(`[fetcher] Playwright error for ${url}:`, err)
    return null
  } finally {
    await browser.close()
  }
}

export async function fetchBinary(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok) return null
    const buffer = await response.arrayBuffer()
    return Buffer.from(buffer)
  } catch (err) {
    console.error(`[fetcher] Binary fetch error for ${url}:`, err)
    return null
  }
}

/**
 * Rate-limited fetch wrapper — be polite to mountain-training.org
 */
export async function politeDelay(ms = 1500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
