import { app } from './app'
import { config } from './config/env'
import { initDb } from './db/initDb'
import { WebSocketService } from './services/websocket.service'
import { csrfService } from './routes/csrf.routes'
import { ClassroomRepository } from './repositories/classroom.repository'
import { logger } from './utils/logger'
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
