'use server'

import { prisma } from '@/lib/db/client'
import { revalidatePath } from 'next/cache'
import { parseJsonSafe } from '@/lib/utils'

export async function upsertRating(data: {
  checklistItemId: string
  ratingValue?: number | null
  confidenceValue?: number | null
  status?: string
  needsCoaching?: boolean
  notes?: string | null
  evidenceSummary?: string | null
  tags?: string[]
  lastPractisedAt?: Date | null
  qualificationSlug: string
}) {
  const { qualificationSlug, ...ratingData } = data

  // Check if rating exists
  const existing = await prisma.userRating.findUnique({
    where: { checklistItemId: data.checklistItemId },
  })

  if (existing) {
    // Save to history first
    await prisma.ratingHistory.create({
      data: {
        userRatingId: existing.id,
        ratingValue: existing.ratingValue,
        confidenceValue: existing.confidenceValue,
        status: existing.status,
        notes: existing.notes,
      },
    })

    await prisma.userRating.update({
      where: { checklistItemId: data.checklistItemId },
      data: {
        ...ratingData,
        tags: JSON.stringify(ratingData.tags ?? parseJsonSafe<string[]>(existing.tags, [])),
      },
    })
  } else {
    await prisma.userRating.create({
      data: {
        checklistItemId: data.checklistItemId,
        ratingValue: ratingData.ratingValue,
        confidenceValue: ratingData.confidenceValue,
        status: ratingData.status ?? 'not_started',
        needsCoaching: ratingData.needsCoaching ?? false,
        notes: ratingData.notes,
        evidenceSummary: ratingData.evidenceSummary,
        tags: JSON.stringify(ratingData.tags ?? []),
        lastPractisedAt: ratingData.lastPractisedAt,
      },
    })
  }

  revalidatePath(`/qualifications/${qualificationSlug}`)
  revalidatePath(`/qualifications/${qualificationSlug}/checklist`)
}

export async function getRatingHistory(checklistItemId: string) {
  const rating = await prisma.userRating.findUnique({
    where: { checklistItemId },
    include: {
      history: {
        orderBy: { recordedAt: 'desc' },
        take: 20,
      },
    },
  })
  return rating
}
