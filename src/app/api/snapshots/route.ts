import { NextResponse } from 'next/server'
import { saveProgressSnapshot } from '@/lib/db/queries/snapshots'

export async function POST(request: Request) {
  const body = await request.json()
  const { qualificationSlug, label } = body

  if (!qualificationSlug) {
    return NextResponse.json({ error: 'qualificationSlug required' }, { status: 400 })
  }

  try {
    const snapshot = await saveProgressSnapshot(qualificationSlug, label)
    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Failed to save snapshot:', error)
    return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 })
  }
}
