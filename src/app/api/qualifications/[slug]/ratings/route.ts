import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json()

  const {
    checklistItemId,
    ratingValue,
    confidenceValue,
    notes,
    evidenceSummary,
    needsCoaching,
    tags,
    lastPractisedAt,
  } = body

  if (!checklistItemId) {
    return NextResponse.json({ error: 'checklistItemId required' }, { status: 400 })
  }

  try {
    const existing = await prisma.userRating.findUnique({
      where: { checklistItemId },
    })

    if (existing) {
      // Save history entry
      await prisma.ratingHistory.create({
        data: {
          userRatingId: existing.id,
          ratingValue: existing.ratingValue,
          confidenceValue: existing.confidenceValue,
          status: existing.status,
          notes: existing.notes,
        },
      })

      // Update rating (only update provided fields)
      await prisma.userRating.update({
        where: { checklistItemId },
        data: {
          ...(ratingValue !== undefined && { ratingValue }),
          ...(confidenceValue !== undefined && { confidenceValue }),
          ...(notes !== undefined && { notes }),
          ...(evidenceSummary !== undefined && { evidenceSummary }),
          ...(needsCoaching !== undefined && { needsCoaching }),
          ...(tags !== undefined && { tags: JSON.stringify(tags) }),
          ...(lastPractisedAt !== undefined && { lastPractisedAt: lastPractisedAt ? new Date(lastPractisedAt) : null }),
          ...(ratingValue !== undefined && {
            status: getRatingStatus(ratingValue),
          }),
        },
      })
    } else {
      await prisma.userRating.create({
        data: {
          checklistItemId,
          ratingValue: ratingValue ?? null,
          confidenceValue: confidenceValue ?? null,
          status: ratingValue ? getRatingStatus(ratingValue) : 'not_started',
          needsCoaching: needsCoaching ?? false,
          notes: notes ?? null,
          evidenceSummary: evidenceSummary ?? null,
          tags: JSON.stringify(tags ?? []),
          lastPractisedAt: lastPractisedAt ? new Date(lastPractisedAt) : null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save rating:', error)
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}

function getRatingStatus(ratingValue: number): string {
  if (ratingValue <= 1) return 'not_started'
  if (ratingValue === 2) return 'aware'
  if (ratingValue === 3) return 'practised'
  if (ratingValue === 4) return 'independent'
  return 'assessment_ready'
}
