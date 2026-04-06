'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle2, AlertTriangle, Info, Loader2, ExternalLink } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface ProgressEvent {
  step: string
  message: string
  detail?: string
  status: 'running' | 'done' | 'error' | 'warning'
  refreshRunId?: string
}

interface ChangesSummary {
  itemsAdded: number
  itemsRemoved: number
  itemsChanged: number
  sectionsChanged: number
  summary: string
  requiresReview: boolean
}

export default function RefreshPage() {
  const params = useParams()
  const slug = params.slug as string

  const [events, setEvents] = useState<ProgressEvent[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastRun, setLastRun] = useState<Date | null>(null)
  const [changesSummary, setChangesSummary] = useState<ChangesSummary | null>(null)
  const [fetchMethod, setFetchMethod] = useState<string | null>(null)

  async function startRefresh() {
    setIsRunning(true)
    setEvents([])
    setChangesSummary(null)

    try {
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as ProgressEvent & {
                itemsAdded?: number
                itemsRemoved?: number
              }

              setEvents((prev) => [...prev, event])

              if (event.step === 'fetch' && event.status === 'done') {
                setFetchMethod(event.message.includes('playwright') ? 'Playwright' : 'HTTP fetch')
              }

              if (event.step === 'done') {
                setLastRun(new Date())
                setIsRunning(false)
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      setEvents((prev) => [
        ...prev,
        {
          step: 'error',
          message: 'Network error — could not connect',
          status: 'error',
        },
      ])
      setIsRunning(false)
    }
  }

  return (
    <AppShell
      title="Refresh data"
      showBack
      backHref={`/qualifications/${slug}`}
    >
      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* Info card */}
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold mb-2">Refresh from Mountain Training</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Fetch the latest qualification information directly from mountain-training.org.
            Your existing ratings will be preserved.
          </p>

          <Button
            onClick={startRefresh}
            disabled={isRunning}
            className="w-full gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRunning ? 'Refreshing...' : 'Refresh now'}
          </Button>

          {lastRun && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Last refreshed: {formatDate(lastRun)}
              {fetchMethod && ` via ${fetchMethod}`}
            </p>
          )}
        </div>

        {/* Progress log */}
        {events.length > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">Refresh log</h3>
            <div className="space-y-2">
              {events.map((event, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {event.status === 'running' && (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    )}
                    {event.status === 'done' && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {event.status === 'warning' && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    {event.status === 'error' && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{event.message}</p>
                    {event.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Changes summary */}
        {changesSummary && (
          <div
            className={cn(
              'rounded-xl border p-4',
              changesSummary.requiresReview
                ? 'border-amber-200 bg-amber-50/50'
                : 'border-green-200 bg-green-50/50'
            )}
          >
            <h3 className="font-semibold text-sm mb-2">Changes detected</h3>
            <div className="space-y-1 text-sm">
              {changesSummary.itemsAdded > 0 && (
                <p className="text-green-700">+ {changesSummary.itemsAdded} items added</p>
              )}
              {changesSummary.itemsRemoved > 0 && (
                <p className="text-red-600">- {changesSummary.itemsRemoved} items removed</p>
              )}
              {changesSummary.itemsChanged > 0 && (
                <p className="text-amber-600">~ {changesSummary.itemsChanged} items changed</p>
              )}
              <p className="text-muted-foreground text-xs mt-2">{changesSummary.summary}</p>
            </div>
          </div>
        )}

        {/* What gets refreshed */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            What gets updated
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              Qualification title and description
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              Syllabus sections and checklist items (if parseable)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              Links to official handbook and checklist PDFs
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">🔒</span>
              Your ratings and notes are always preserved
            </li>
          </ul>
        </div>

        {/* Warning about site blocking */}
        <div className="rounded-xl bg-amber-50/50 border border-amber-200 p-4 text-xs text-amber-800">
          <p className="font-medium mb-1">Note</p>
          <p>
            Mountain Training's website uses bot protection that may block automated requests.
            If the refresh fails, your existing data is preserved unchanged.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
