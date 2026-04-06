import { prisma } from '@/lib/db/client'
import { parseJsonSafe } from '@/lib/utils'
import { calculateReadinessScore } from '@/lib/scoring/score'
import { getQualificationBySlug } from './qualifications'

export async function saveProgressSnapshot(qualificationSlug: string, label?: string) {
  const qual = await getQualificationBySlug(qualificationSlug)
  if (!qual) return null

  const score = calculateReadinessScore(qual.sections as any)
  const sectionScores: Record<string, number> = {}
  score.sectionScores.forEach((s) => {
    sectionScores[s.sectionId] = s.score
  })

  return prisma.progressSnapshot.create({
    data: {
      qualificationId: qual.id,
      overallScore: score.overallScore,
      completionPct: score.completionPct,
      sectionScores: JSON.stringify(sectionScores),
      totalItems: score.totalItems,
      ratedItems: score.ratedItems,
      label,
    },
  })
}

export async function getProgressSnapshots(qualificationId: string) {
  const snapshots = await prisma.progressSnapshot.findMany({
    where: { qualificationId },
    orderBy: { takenAt: 'asc' },
  })

  return snapshots.map((s) => ({
    ...s,
    sectionScores: parseJsonSafe<Record<string, number>>(s.sectionScores, {}),
  }))
}
