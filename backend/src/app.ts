import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { config } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { generateRouter } from './routes/generate.routes.js';
import { classroomRouter } from './routes/classroom.routes.js';
import { logsRouter } from './routes/logs.routes.js';
import { csrfRouter } from './routes/csrf.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { csrfMiddleware } from './middlewares/csrf.middleware.js';
import { classroomContextMiddleware } from './middlewares/classroomContext.middleware.js';
import { rateLimitMiddleware } from './middlewares/rateLimit.middleware.js';
import { statsRouter } from "./routes/stats.routes.js";

const app = express()

app.use(helmet({
    contentSecurityPolicy: config.csp.enabled
        ? {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                objectSrc: ["'none'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'blob:'],
                connectSrc: ["'self'", ...config.cors.origins],
                frameAncestors: ["'none'"],
            },
        }
        : false,
    crossOriginEmbedderPolicy: false,
}))
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json({ limit: config.jsonLimit }))

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
app.use('/api/classrooms', classroomRouter)
app.use('/api/generate', generateRouter)
app.use('/api/logs', logsRouter)

app.use(errorMiddleware)

export { app }
