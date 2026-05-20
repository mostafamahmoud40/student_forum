import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// All routes require admin role
router.use(requireAdmin)

// ── Students ────────────────────────────────────────────────────────────────

// GET /api/admin/students?search=
router.get('/students', async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query as { search?: string }
  const students = await prisma.user.findMany({
    where: {
      role: 'student',
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { major: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, email: true, major: true, status: true, isBanned: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ students })
})

// PATCH /api/admin/students/:id/status
router.patch('/students/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body as { status: string }
  const allowed = ['Active', 'Restricted', 'Pending']
  if (!allowed.includes(status)) {
    res.status(400).json({ error: `status must be one of ${allowed.join(', ')}` })
    return
  }
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { status },
    select: { id: true, name: true, email: true, status: true },
  })
  res.json({ user })
})

// ── Communities ─────────────────────────────────────────────────────────────

// POST /api/admin/communities
router.post('/communities', async (req: Request, res: Response): Promise<void> => {
  const { title, tag, imageUrl, avatarUrl, description, creator } = req.body as {
    title: string; tag?: string; imageUrl: string; avatarUrl?: string
    description: string; creator: string
  }
  if (!title || !imageUrl || !description || !creator) {
    res.status(400).json({ error: 'title, imageUrl, description, creator are required' })
    return
  }
  const community = await prisma.community.create({
    data: { title, tag: tag ?? 'Public', imageUrl, avatarUrl, description, creator },
  })
  res.status(201).json({ community })
})

// PATCH /api/admin/communities/:id
router.patch('/communities/:id', async (req: Request, res: Response): Promise<void> => {
  const data = req.body as Partial<{
    title: string; tag: string; imageUrl: string; description: string; creator: string
  }>
  const community = await prisma.community.update({
    where: { id: Number(req.params.id) },
    data,
  })
  res.json({ community })
})

// DELETE /api/admin/communities/:id
router.delete('/communities/:id', async (req: Request, res: Response): Promise<void> => {
  await prisma.community.delete({ where: { id: Number(req.params.id) } })
  res.json({ success: true })
})

// ── Threads ─────────────────────────────────────────────────────────────────

// PATCH /api/admin/threads/:id/lock
router.patch('/threads/:id/lock', async (req: Request, res: Response): Promise<void> => {
  const thread = await prisma.thread.findUnique({ where: { id: Number(req.params.id) } })
  if (!thread) { res.status(404).json({ error: 'Not found' }); return }
  const updated = await prisma.thread.update({
    where: { id: thread.id },
    data: { isLocked: !thread.isLocked },
  })
  res.json({ thread: updated })
})

// DELETE /api/admin/threads/:id
router.delete('/threads/:id', async (req: Request, res: Response): Promise<void> => {
  await prisma.thread.delete({ where: { id: Number(req.params.id) } })
  res.json({ success: true })
})

// ── Ban users ────────────────────────────────────────────────────────────────

// POST /api/admin/users/ban
router.post('/users/ban', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string }
  if (!email) { res.status(400).json({ error: 'email is required' }); return }
  await prisma.user.updateMany({ where: { email }, data: { isBanned: true } })
  res.json({ success: true })
})

// ── Moderation ───────────────────────────────────────────────────────────────

// GET /api/admin/moderation
router.get('/moderation', async (_req: Request, res: Response): Promise<void> => {
  const items = await prisma.flaggedPost.findMany({
    where: { resolved: false },
    include: { thread: { select: { id: true, title: true } } },
    orderBy: [
      { severity: 'asc' }, // High sorts first alphabetically — handled on client
      { createdAt: 'desc' },
    ],
  })
  res.json({ items })
})

// PATCH /api/admin/moderation/:id/approve  — dismiss flag, keep post
router.patch('/moderation/:id/approve', async (req: Request, res: Response): Promise<void> => {
  await prisma.flaggedPost.update({
    where: { id: Number(req.params.id) },
    data: { resolved: true },
  })
  res.json({ success: true })
})

// DELETE /api/admin/moderation/:id  — remove flagged post + its thread
router.delete('/moderation/:id', async (req: Request, res: Response): Promise<void> => {
  const flagged = await prisma.flaggedPost.findUnique({ where: { id: Number(req.params.id) } })
  if (!flagged) { res.status(404).json({ error: 'Not found' }); return }
  // Delete thread cascades comments and flaggedPosts
  await prisma.thread.delete({ where: { id: flagged.threadId } })
  res.json({ success: true })
})

export default router
