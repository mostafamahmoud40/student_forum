import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

// GET /api/threads?category=&search=
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category, search } = req.query as { category?: string; search?: string }

  const threads = await prisma.thread.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      author: { select: { id: true, name: true, email: true, isBanned: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({
    threads: threads.map((t) => ({
      ...t,
      commentsCount: t._count.comments,
      time: timeAgo(t.createdAt),
    })),
  })
})

// GET /api/threads/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const thread = await prisma.thread.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      author: { select: { id: true, name: true, email: true, isBanned: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!thread) { res.status(404).json({ error: 'Not found' }); return }

  await prisma.thread.update({ where: { id: thread.id }, data: { views: { increment: 1 } } })

  res.json({
    thread: {
      ...thread,
      time: timeAgo(thread.createdAt),
      comments: thread.comments.map((c) => ({ ...c, time: timeAgo(c.createdAt) })),
    },
  })
})

// POST /api/threads
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { title, content, category, communityId } = req.body as {
    title: string; content: string; category: string; communityId?: number
  }
  if (!title || !content || !category) {
    res.status(400).json({ error: 'title, content and category are required' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (user?.isBanned) {
    res.status(403).json({ error: 'Your account is banned from posting' })
    return
  }

  const thread = await prisma.thread.create({
    data: {
      title,
      content,
      category,
      authorId: req.user!.userId,
      communityId: communityId ?? null,
    },
    include: { author: { select: { id: true, name: true, email: true } } },
  })

  if (communityId) {
    await prisma.community.update({
      where: { id: communityId },
      data: { discussionsCount: { increment: 1 } },
    })
  }

  res.status(201).json({ thread: { ...thread, time: 'Just now', commentsCount: 0 } })
})

// PATCH /api/threads/:id
router.patch('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const thread = await prisma.thread.findUnique({
    where: { id: Number(req.params.id) },
    include: { _count: { select: { comments: true } } },
  })
  if (!thread) { res.status(404).json({ error: 'Not found' }); return }

  const isOwner = thread.authorId === req.user!.userId
  if (!isOwner) { res.status(403).json({ error: 'Forbidden' }); return }
  if (thread._count.comments > 0) {
    res.status(409).json({ error: 'Cannot edit a thread that has replies' }); return
  }

  const { title, content } = req.body as { title?: string; content?: string }
  const updated = await prisma.thread.update({
    where: { id: thread.id },
    data: { ...(title ? { title } : {}), ...(content ? { content } : {}) },
  })
  res.json({ thread: updated })
})

// DELETE /api/threads/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const thread = await prisma.thread.findUnique({
    where: { id: Number(req.params.id) },
    include: { _count: { select: { comments: true } } },
  })
  if (!thread) { res.status(404).json({ error: 'Not found' }); return }

  const isAdmin = req.user!.role === 'admin'
  const isOwner = thread.authorId === req.user!.userId

  if (!isAdmin && !isOwner) { res.status(403).json({ error: 'Forbidden' }); return }
  if (!isAdmin && thread._count.comments > 0) {
    res.status(409).json({ error: 'Cannot delete a thread that has replies' }); return
  }

  await prisma.thread.delete({ where: { id: thread.id } })
  res.json({ success: true })
})

// POST /api/threads/:id/like
router.post('/:id/like', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const threadId = Number(req.params.id)
  const userId = req.user!.userId

  const existing = await prisma.threadLike.findUnique({
    where: { userId_threadId: { userId, threadId } },
  })
  if (existing) { res.status(409).json({ error: 'Already liked' }); return }

  await prisma.$transaction([
    prisma.threadLike.create({ data: { userId, threadId } }),
    prisma.thread.update({ where: { id: threadId }, data: { likes: { increment: 1 } } }),
  ])
  res.json({ success: true })
})

// GET /api/threads/:id/comments
router.get('/:id/comments', async (req: Request, res: Response): Promise<void> => {
  const comments = await prisma.comment.findMany({
    where: { threadId: Number(req.params.id) },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ comments: comments.map((c) => ({ ...c, time: timeAgo(c.createdAt) })) })
})

// POST /api/threads/:id/comments
router.post('/:id/comments', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const threadId = Number(req.params.id)
  const { content } = req.body as { content: string }
  if (!content?.trim()) { res.status(400).json({ error: 'content is required' }); return }

  const thread = await prisma.thread.findUnique({ where: { id: threadId } })
  if (!thread) { res.status(404).json({ error: 'Thread not found' }); return }
  if (thread.isLocked) { res.status(403).json({ error: 'Thread is locked' }); return }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (user?.isBanned) { res.status(403).json({ error: 'Your account is banned from posting' }); return }

  const comment = await prisma.comment.create({
    data: { threadId, authorId: req.user!.userId, content: content.trim() },
    include: { author: { select: { id: true, name: true } } },
  })

  await prisma.community.updateMany({
    where: { id: thread.communityId ?? -1 },
    data: { interactionsCount: { increment: 1 } },
  })

  res.status(201).json({ comment: { ...comment, time: 'Just now' } })
})

// POST /api/comments/:id/like
router.post('/comments/:id/like', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const commentId = Number(req.params.id)
  const userId = req.user!.userId

  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  })
  if (existing) { res.status(409).json({ error: 'Already liked' }); return }

  await prisma.$transaction([
    prisma.commentLike.create({ data: { userId, commentId } }),
    prisma.comment.update({ where: { id: commentId }, data: { likes: { increment: 1 } } }),
  ])
  res.json({ success: true })
})

// GET /api/threads/me  — current user's threads
router.get('/me/list', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const threads = await prisma.thread.findMany({
    where: { authorId: req.user!.userId },
    include: { _count: { select: { comments: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({
    threads: threads.map((t) => ({
      ...t,
      commentsCount: t._count.comments,
      time: timeAgo(t.createdAt),
    })),
  })
})

export default router
