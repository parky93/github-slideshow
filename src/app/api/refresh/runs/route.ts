import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET() {
  const runs = await prisma.refreshRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
    include: { changeSet: true, qualification: { select: { title: true, slug: true } } },
  })
  return NextResponse.json(runs)
}
