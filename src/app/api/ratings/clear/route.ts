import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function DELETE() {
  try {
    await prisma.ratingHistory.deleteMany()
    await prisma.userRating.deleteMany()
    await prisma.progressSnapshot.deleteMany()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear ratings:', error)
    return NextResponse.json({ error: 'Failed to clear ratings' }, { status: 500 })
  }
}
