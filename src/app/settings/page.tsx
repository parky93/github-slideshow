'use client'

import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Mountain,
  ExternalLink,
  Trash2,
  Info,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  async function handleClearRatings() {
    if (
      !confirm(
        'This will delete all your ratings and progress. This cannot be undone. Are you sure?'
      )
    )
      return

    await fetch('/api/ratings/clear', { method: 'DELETE' })
    window.location.reload()
  }

  return (
    <AppShell title="Settings">
      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        {/* App info */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-mountain-600 flex items-center justify-center">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">MT Assessment Tracker</p>
              <p className="text-xs text-muted-foreground">Version 0.1.0</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unofficial self-assessment tool for Mountain Training qualification candidates.
            Not affiliated with or endorsed by Mountain Training.
          </p>
        </div>

        {/* Data */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Data
          </h2>
          <div className="rounded-xl border bg-card divide-y">
            <button
              onClick={handleClearRatings}
              className="flex items-center justify-between w-full p-4 hover:bg-destructive/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">Clear all ratings</p>
                  <p className="text-xs text-muted-foreground">Remove all your progress data</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Official resources */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Official resources
          </h2>
          <div className="rounded-xl border bg-card divide-y">
            <a
              href="https://www.mountain-training.org/qualifications"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">Mountain Training qualifications</p>
                <p className="text-xs text-muted-foreground">Official qualification pages</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a
              href="https://www.mountain-training.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">mountain-training.org</p>
                <p className="text-xs text-muted-foreground">Official Mountain Training website</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </section>

        {/* Legal */}
        <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              This app is a personal self-assessment tool only. It does not make official
              assessment decisions. Qualification decisions are made solely by Mountain Training
              assessors.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              All data is stored locally on your device. Nothing is sent to external servers.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
