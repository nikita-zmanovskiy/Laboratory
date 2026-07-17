import { createApp } from './createApp'
import { config } from './config/env'
import { WebSocketService } from './services/websocket.service'
import { ClassroomService } from './services/classroom.service'
import { logger } from './utils/logger'

async function bootstrap() {
    const app = await createApp()

    const wsService = app.get(WebSocketService)
    await wsService.initialize(app.getHttpServer())

    const classroomService = app.get(ClassroomService)
    setInterval(() => void classroomService.cleanupExpiredClassrooms(), 5 * 60 * 1000)

    const port = config.port
    await app.listen(port)

    logger.info(`Server is running on http://localhost:${port}`)
    logger.info(`Swagger UI: http://localhost:${port}/api-docs`)
    logger.info(`WebSocket available at ws://localhost:${port}/ws`)
    if (wsService.isRedisEnabled()) {
        logger.info(`WebSocket fan-out: Redis Pub/Sub (${config.redis.wsChannel})`)
    } else {
        logger.warn('WebSocket fan-out: single instance only (set REDIS_URL when Redis is running)')
    }
}

bootstrap().catch((error: unknown) => {
    logger.error('server - failed to start', error)
    process.exit(1)
})
