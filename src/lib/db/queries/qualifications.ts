import { prisma } from '@/lib/db/client'
import { parseJsonSafe } from '@/lib/utils'
import type { QualificationWithMeta, QualKeyInfo, QualificationCategory, QualificationType } from '@/lib/types'
import { calculateReadinessScore } from '@/lib/scoring/score'

export async function getAllQualifications(): Promise<QualificationWithMeta[]> {
  const quals = await prisma.qualification.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
    include: {
      sections: {
        where: { isActive: true },
        include: {
          items: {
            where: { isActive: true },
            include: { rating: true },
          },
        },
      },
    },
  })

  return quals.map((q) => {
    const allItems = q.sections.flatMap((s) => s.items)
    const ratedItems = allItems.filter((i) => i.rating?.ratingValue != null)
    const sections = q.sections.map((s) => ({
      ...s,
      weight: s.weight,
      items: s.items.map((item) => ({
        ...item,
        defaultTags: parseJsonSafe<string[]>(item.defaultTags, []),
        rating: item.rating
          ? {
              ...item.rating,
              tags: parseJsonSafe<string[]>(item.rating.tags, []),
            }
          : null,
      })),
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const score = calculateReadinessScore(sections as any)

    return {
      ...q,
      category: q.category as QualificationCategory,
      qualType: q.qualType as QualificationType,
      keyInfo: parseJsonSafe<QualKeyInfo>(q.keyInfo ?? null, {}),
      totalItems: allItems.length,
      ratedItems: ratedItems.length,
      overallScore: score.overallScore,
      completionPct: score.completionPct,
    }
  })
}

export async function getQualificationBySlug(slug: string) {
  const qual = await prisma.qualification.findUnique({
    where: { slug },
    include: {
      sections: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          items: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
              rating: {
                include: {
                  history: {
                    orderBy: { recordedAt: 'desc' },
                    take: 10,
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!qual) return null

  return {
    ...qual,
    keyInfo: parseJsonSafe<QualKeyInfo>(qual.keyInfo ?? null, {}),
    sections: qual.sections.map((s) => ({
      ...s,
      items: s.items.map((item) => ({
        ...item,
        defaultTags: parseJsonSafe<string[]>(item.defaultTags, []),
        rating: item.rating
          ? {
              ...item.rating,
              tags: parseJsonSafe<string[]>(item.rating.tags, []),
            }
          : null,
      })),
    })),
  }
}

export async function updateQualLastViewed(slug: string) {
  await prisma.qualification.update({
    where: { slug },
    data: { lastViewedAt: new Date() },
  })
}

export async function toggleQualFavourite(slug: string) {
  const qual = await prisma.qualification.findUnique({ where: { slug } })
  if (!qual) return
  await prisma.qualification.update({
    where: { slug },
    data: { isFavourite: !qual.isFavourite },
  })
}
