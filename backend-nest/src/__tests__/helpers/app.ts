import type { INestApplication } from '@nestjs/common'
import type { Server } from 'http'
import { createApp } from '../../createApp'
import { WebSocketService } from '../../services/websocket.service'
import { config } from '../../config/env'

let nestApp: INestApplication | null = null
let httpServer: Server | null = null

/** Nest HTTP server for supertest (lazy singleton). */
export async function getApp(): Promise<Server> {
    if (httpServer) {
        return httpServer
    }

    // Avoid hard Redis failures during unit/API tests
    ;(config.redis as { url: string }).url = ''

    nestApp = await createApp()
    const wsService = nestApp.get(WebSocketService)
    await wsService.initialize(nestApp.getHttpServer())
    await nestApp.init()
    httpServer = nestApp.getHttpServer() as Server
    return httpServer
}

export async function closeApp(): Promise<void> {
    if (nestApp) {
        await nestApp.close()
        nestApp = null
        httpServer = null
    }
}
