import { app } from './app.js'
import { config } from './config/env.js'
import { initDb } from './db/initDb.js'
import { WebSocketService } from './services/websocket.service.js'
import { logger } from './utils/logger.js'
import http from 'http'


const start = async () => {
    await initDb()
    const server = http.createServer(app),
     wsService = new WebSocketService()


    wsService.initialize(server)

    server.listen(config.port, () => {
        logger.info(`Server is running on http://localhost:${config.port}`)
        logger.info(`WebSocket available at ws://localhost:${config.port}/ws`)
    })
}

start().catch((error: unknown) => {
    logger.error('server - failed to start', error)
})
