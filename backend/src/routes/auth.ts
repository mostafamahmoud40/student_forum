import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { signToken, requireAuth } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

const GU_EMAIL_REGEX = /(@gu\.edu\.eg|\.gu\.edu\.eg)$/i

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string }

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }
  if (!GU_EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: 'Must use a Galala University email (@gu.edu.eg)' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  if (user.status === 'Restricted') {
    res.status(403).json({ error: 'Your account has been restricted. Contact admin.' })
    return
  }

  const token = signToken({ userId: user.id, role: user.role, email: user.email })
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, major: user.major },
  })
})

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, major, password } = req.body as {
    name: string; email: string; major: string; password: string
  }

  if (!name || !email || !major || !password) {
    res.status(400).json({ error: 'All fields are required' })
    return
  }
  if (!GU_EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: 'Must use a Galala University email (@gu.edu.eg)' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'Email already registered' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, passwordHash, major, role: 'student', status: 'Active' },
  })

  const token = signToken({ userId: user.id, role: user.role, email: user.email })
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, major: user.major },
  })
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, role: true, major: true, status: true },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({ user })
})

export default router
