import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import communitiesRouter from './routes/communities.js'
import threadsRouter from './routes/threads.js'
import adminRouter from './routes/admin.js'

const app = express()
const PORT = Number(process.env.PORT ?? 4000)
const INSTANCE = process.env.INSTANCE ?? 'api'

app.use(cors({ origin: '*' }))
app.use(express.json())

// Attach instance name to every response for load-balancing demo
app.use((_req, res, next) => {
  res.setHeader('X-Instance', INSTANCE)
  next()
})

app.use('/api/auth', authRouter)
app.use('/api/communities', communitiesRouter)
app.use('/api/threads', threadsRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', instance: INSTANCE, ts: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[${INSTANCE}] listening on :${PORT}`)
})
