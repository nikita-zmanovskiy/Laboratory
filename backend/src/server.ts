import { app } from './app.js'
import { config } from './config/env.js'
import { initDb } from './db/initDb.js'
import { WebSocketService } from './services/websocket.service.js'
import { csrfService } from './routes/csrf.routes.js'
import { ClassroomRepository } from './repositories/classroom.repository.js'
import { logger } from './utils/logger.js'
import http from 'http'

const start = async () => {
    await initDb()
    const server = http.createServer(app)
    const classroomRepo = new ClassroomRepository()
    const wsService = new WebSocketService(csrfService, classroomRepo)

    await wsService.initialize(server)

    server.listen(config.port, () => {
        logger.info(`Server is running on http://localhost:${config.port}`)
        logger.info(`WebSocket available at ws://localhost:${config.port}/ws`)
        if (config.redis.url) {
            logger.info(`WebSocket fan-out: Redis Pub/Sub (${config.redis.wsChannel})`)
        } else {
            logger.warn(
                'WebSocket fan-out: single instance only (set REDIS_URL for horizontal scale)'
            )
        }
    })

    const shutdown = async (signal: string) => {
        logger.info(`server - ${signal}, shutting down`)
        await wsService.shutdown()
        server.close(() => process.exit(0))
        setTimeout(() => process.exit(1), 10_000).unref()
    }

    process.on('SIGTERM', () => void shutdown('SIGTERM'))
    process.on('SIGINT', () => void shutdown('SIGINT'))
}

start().catch((error: unknown) => {
    logger.error('server - failed to start', error)
    process.exit(1)
})
