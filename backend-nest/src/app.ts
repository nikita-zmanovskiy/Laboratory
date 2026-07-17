import express, { Request, Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import { config } from './config/env'
import { corsOptions } from './config/cors'
import { generateRouter } from './routes/generate.routes'
import { classroomRouter } from './routes/classroom.routes'
import { logsRouter } from './routes/logs.routes'
import { csrfRouter } from './routes/csrf.routes'
import { healthRouter } from './routes/health.routes'
import { requestContextMiddleware } from './middlewares/requestContext.middleware'
import { errorMiddleware } from './middlewares/error.middleware'
import { csrfMiddleware } from './middlewares/csrf.middleware'
import { classroomContextMiddleware } from './middlewares/classroomContext.middleware'
import { rateLimitMiddleware } from './middlewares/rateLimit.middleware'
import { statsRouter } from './routes/stats.routes'
import { wsRouter } from './routes/ws.routes'

const app = express()

app.use(
    helmet({
        contentSecurityPolicy: config.csp.enabled
            ? {
                  directives: {
                      defaultSrc: ["'self'"],
                      baseUri: ["'self'"],
                      fontSrc: ["'self'", 'https:', 'data:'],
                      formAction: ["'self'"],
                      frameAncestors: ["'self'"],
                      imgSrc: ["'self'", 'data:', 'blob:'],
                      objectSrc: ["'none'"],
                      scriptSrc: ["'self'"],
                      scriptSrcAttr: ["'none'"],
                      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
                      connectSrc: ["'self'", ...config.cors.origins, 'ws:', 'wss:'],
                      upgradeInsecureRequests: config.csp.upgradeInsecureRequests ? [] : null,
                  },
              }
            : false,

        crossOriginEmbedderPolicy: false,
    })
)
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json({ limit: config.jsonLimit }))
app.use(requestContextMiddleware)

app.use('/health', healthRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api-docs.json', (req: Request, res: Response) => {
    res.json(swaggerSpec)
})
app.use('/api/csrf', csrfRouter)

app.use(rateLimitMiddleware)
app.use(csrfMiddleware)
app.use(classroomContextMiddleware)

app.use('/api/stats', statsRouter)
app.use('/api/ws', wsRouter)
app.use('/api/classrooms', classroomRouter)
app.use('/api/generate', generateRouter)
app.use('/api/logs', logsRouter)

app.use(errorMiddleware)

export { app }
