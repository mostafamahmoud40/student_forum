import express from 'express'
import cors from 'cors'
import client from 'prom-client'
import authRouter from './routes/auth.js'
import communitiesRouter from './routes/communities.js'
import threadsRouter from './routes/threads.js'
import adminRouter from './routes/admin.js'

const app = express()
const PORT = Number(process.env.PORT ?? 4000)
const INSTANCE = process.env.INSTANCE ?? 'api'

const metricsRegister = new client.Registry()
metricsRegister.setDefaultLabels({ service: 'api', replica: INSTANCE })
client.collectDefaultMetrics({ register: metricsRegister })

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status', 'replica'],
  registers: [metricsRegister],
})

app.use(cors({ origin: '*' }))
app.use(express.json())

// Attach instance name to every response for load-balancing demo
app.use((req, res, next) => {
  res.setHeader('X-Instance', INSTANCE)
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      path: req.route?.path ?? req.path,
      status: String(res.statusCode),
      replica: INSTANCE,
    })
  })
  next()
})

app.use('/api/auth', authRouter)
app.use('/api/communities', communitiesRouter)
app.use('/api/threads', threadsRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', instance: INSTANCE, ts: new Date().toISOString() })
})

// Prometheus application metrics (scraped by monitoring/prometheus)
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metricsRegister.contentType)
  res.end(await metricsRegister.metrics())
})

app.listen(PORT, () => {
  console.log(`[${INSTANCE}] listening on :${PORT}`)
})
