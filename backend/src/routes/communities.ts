import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/communities
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const communities = await prisma.community.findMany({ orderBy: { membersCount: 'desc' } })
  res.json({ communities })
})

// GET /api/communities/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const community = await prisma.community.findUnique({ where: { id: Number(req.params.id) } })
  if (!community) { res.status(404).json({ error: 'Not found' }); return }
  res.json({ community })
})

// GET /api/communities/:id/threads
router.get('/:id/threads', async (req: Request, res: Response): Promise<void> => {
  const community = await prisma.community.findUnique({ where: { id: Number(req.params.id) } })
  if (!community) { res.status(404).json({ error: 'Not found' }); return }

  const threads = await prisma.thread.findMany({
    where: { communityId: Number(req.params.id) },
    include: {
      author: { select: { id: true, name: true, email: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ threads })
})

// POST /api/communities/:id/join
router.post('/:id/join', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const communityId = Number(req.params.id)
  const userId = req.user!.userId

  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId, communityId } },
  })
  if (existing) { res.status(409).json({ error: 'Already a member' }); return }

  await prisma.$transaction([
    prisma.communityMember.create({ data: { userId, communityId } }),
    prisma.community.update({ where: { id: communityId }, data: { membersCount: { increment: 1 } } }),
  ])
  res.json({ success: true })
})

// DELETE /api/communities/:id/join
router.delete('/:id/join', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const communityId = Number(req.params.id)
  const userId = req.user!.userId

  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId, communityId } },
  })
  if (!existing) { res.status(404).json({ error: 'Not a member' }); return }

  await prisma.$transaction([
    prisma.communityMember.delete({ where: { userId_communityId: { userId, communityId } } }),
    prisma.community.update({ where: { id: communityId }, data: { membersCount: { decrement: 1 } } }),
  ])
  res.json({ success: true })
})

// GET /api/communities/me/joined  — joined list for current user
router.get('/me/joined', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const memberships = await prisma.communityMember.findMany({
    where: { userId: req.user!.userId },
    include: { community: true },
  })
  res.json({ communities: memberships.map((m) => m.community) })
})

export default router
