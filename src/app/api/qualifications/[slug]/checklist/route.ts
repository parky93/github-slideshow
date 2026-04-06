import { NextResponse } from 'next/server'
import { getQualificationBySlug } from '@/lib/db/queries/qualifications'
import { parseJsonSafe } from '@/lib/utils'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const qual = await getQualificationBySlug(slug)

  if (!qual) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    slug: qual.slug,
    title: qual.title,
    sections: qual.sections.map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order,
      weight: s.weight,
      items: s.items.map((item) => ({
        id: item.id,
        sectionId: item.sectionId,
        stableKey: item.stableKey,
        prompt: item.prompt,
        description: item.description,
        defaultTags: parseJsonSafe<string[]>(item.defaultTags as any, []),
        isActive: item.isActive,
        order: item.order,
        rating: item.rating
          ? {
              id: item.rating.id,
              ratingValue: item.rating.ratingValue,
              confidenceValue: item.rating.confidenceValue,
              status: item.rating.status,
              needsCoaching: item.rating.needsCoaching,
              notes: item.rating.notes,
              evidenceSummary: item.rating.evidenceSummary,
              tags: parseJsonSafe<string[]>(item.rating.tags as any, []),
              lastPractisedAt: item.rating.lastPractisedAt,
              updatedAt: item.rating.updatedAt,
            }
          : null,
      })),
    })),
  })
}
