import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { fetchPage, politeDelay } from '@/lib/scraper/fetcher'
import { parseQualificationPage, parseQualificationIndex } from '@/lib/scraper/html-parser'
import { generateStableKey } from '@/lib/mapping/stable-key'
import { mapItems } from '@/lib/mapping/item-mapper'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const qualificationSlug = body.slug as string | undefined

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const refreshRun = await prisma.refreshRun.create({
        data: {
          status: 'running',
          triggeredBy: 'user',
          qualificationId: null,
        },
      })

      const log: string[] = []
      const errors: string[] = []
      const urlsFetched: string[] = []
      let fetchMethod = 'fetch'

      try {
        if (qualificationSlug) {
          // Single qualification refresh
          const qual = await prisma.qualification.findUnique({
            where: { slug: qualificationSlug },
            include: {
              sections: {
                include: { items: true },
              },
            },
          })

          if (!qual) {
            send({ step: 'error', message: 'Qualification not found', status: 'error' })
            controller.close()
            return
          }

          send({
            step: 'fetch',
            message: `Fetching ${qual.title} from Mountain Training...`,
            status: 'running',
          })

          const pageResult = await fetchPage(qual.officialUrl)
          urlsFetched.push(qual.officialUrl)

          if (!pageResult) {
            errors.push(
              `Could not fetch ${qual.officialUrl} — Mountain Training website may be blocking automated access. Your existing data has been preserved.`
            )
            send({
              step: 'fetch',
              message: 'Could not reach Mountain Training website',
              detail:
                'The site may be blocking automated access. Your existing data is unchanged.',
              status: 'warning',
            })

            await prisma.refreshRun.update({
              where: { id: refreshRun.id },
              data: {
                status: 'partial',
                completedAt: new Date(),
                errors: errors.join('\n'),
                urlsFetched: JSON.stringify(urlsFetched),
              },
            })

            send({ step: 'done', message: 'Refresh completed with warnings', status: 'warning' })
            controller.close()
            return
          }

          fetchMethod = pageResult.method
          send({
            step: 'fetch',
            message: `Fetched via ${pageResult.method}`,
            status: 'done',
          })

          send({
            step: 'parse',
            message: 'Parsing qualification data...',
            status: 'running',
          })

          const parsed = parseQualificationPage(pageResult.html, qual.officialUrl)
          log.push(`Parsed: ${parsed.sections.length} sections, confidence: ${parsed.confidence.toFixed(2)}`)

          send({
            step: 'parse',
            message: `Found ${parsed.sections.length} sections (confidence: ${(parsed.confidence * 100).toFixed(0)}%)`,
            status: 'done',
          })

          // Check for changes
          send({ step: 'diff', message: 'Comparing with existing data...', status: 'running' })

          const existingItems = qual.sections.flatMap((s) =>
            s.items.map((item) => ({
              stableKey: item.stableKey,
              prompt: item.prompt,
              sectionTitle: s.title,
              order: item.order,
            }))
          )

          // Build new items from parsed sections
          const newItems: Array<{ stableKey: string; prompt: string; sectionTitle: string; order: number }> = []
          for (const section of parsed.sections) {
            for (let i = 0; i < section.items.length; i++) {
              const prompt = section.items[i]
              newItems.push({
                stableKey: generateStableKey(qual.slug, section.title, prompt),
                prompt,
                sectionTitle: section.title,
                order: i,
              })
            }
          }

          if (newItems.length === 0) {
            send({
              step: 'diff',
              message: 'No new checklist items extracted from page',
              detail: 'The page structure may have changed. Existing data preserved.',
              status: 'warning',
            })
          } else {
            const mappings = mapItems(existingItems, newItems)
            const exactMatches = mappings.filter((m) => m.method === 'exact').length
            const unmatched = mappings.filter((m) => m.method === 'unmatched').length
            const newItemCount = newItems.filter(
              (n) => !mappings.find((m) => m.newKey === n.stableKey)
            ).length

            send({
              step: 'diff',
              message: `${exactMatches} items matched, ${unmatched} unmatched, ${newItemCount} new`,
              status: 'done',
            })

            // Update qualification metadata
            await prisma.qualification.update({
              where: { id: qual.id },
              data: {
                sourceLastCheckedAt: new Date(),
                ...(parsed.title && parsed.title !== qual.title
                  ? { title: parsed.title }
                  : {}),
                ...(parsed.summary ? { summary: parsed.summary } : {}),
              },
            })

            const changeSet = await prisma.changeSet.create({
              data: {
                refreshRunId: refreshRun.id,
                qualificationId: qual.id,
                itemsAdded: newItemCount,
                itemsRemoved: unmatched,
                itemsChanged: 0,
                sectionsChanged:
                  parsed.sections.length !== qual.sections.length ? 1 : 0,
                summary: `${exactMatches} items matched. ${newItemCount > 0 ? `${newItemCount} new items found.` : ''} ${unmatched > 0 ? `${unmatched} items could not be matched.` : ''}`,
                requiresReview: unmatched > 0 || newItemCount > 0,
              },
            })
          }

          await prisma.refreshRun.update({
            where: { id: refreshRun.id },
            data: {
              status: 'completed',
              completedAt: new Date(),
              log: log.join('\n'),
              errors: errors.join('\n'),
              fetchMethod,
              urlsFetched: JSON.stringify(urlsFetched),
              qualificationId: qual.id,
            },
          })

          send({
            step: 'done',
            message: 'Refresh complete',
            status: 'done',
            refreshRunId: refreshRun.id,
          })
        } else {
          // Discover all qualifications
          send({
            step: 'discover',
            message: 'Fetching qualification index from Mountain Training...',
            status: 'running',
          })

          const indexResult = await fetchPage('https://www.mountain-training.org/qualifications')

          if (!indexResult) {
            send({
              step: 'discover',
              message: 'Could not reach Mountain Training website',
              status: 'warning',
            })
          } else {
            urlsFetched.push('https://www.mountain-training.org/qualifications')
            const discovered = parseQualificationIndex(indexResult.html)
            send({
              step: 'discover',
              message: `Found ${discovered.length} qualification pages`,
              status: 'done',
            })
          }

          await prisma.refreshRun.update({
            where: { id: refreshRun.id },
            data: {
              status: 'completed',
              completedAt: new Date(),
              urlsFetched: JSON.stringify(urlsFetched),
            },
          })

          send({ step: 'done', message: 'Discovery complete', status: 'done' })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(msg)
        send({ step: 'error', message: `Unexpected error: ${msg}`, status: 'error' })

        await prisma.refreshRun.update({
          where: { id: refreshRun.id },
          data: { status: 'failed', completedAt: new Date(), errors: msg },
        })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

export async function GET() {
  // Return recent refresh runs
  const runs = await prisma.refreshRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
    include: { changeSet: true },
  })
  return NextResponse.json(runs)
}
