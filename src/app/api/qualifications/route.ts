import { NextResponse } from 'next/server'
import { getAllQualifications } from '@/lib/db/queries/qualifications'

export async function GET() {
  try {
    const qualifications = await getAllQualifications()
    return NextResponse.json(qualifications)
  } catch (error) {
    console.error('Failed to fetch qualifications:', error)
    return NextResponse.json({ error: 'Failed to fetch qualifications' }, { status: 500 })
  }
}
