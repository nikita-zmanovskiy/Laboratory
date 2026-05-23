import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import type { RequestLog } from '../types/models.js'
import { logger } from '../utils/logger.js'

interface WSClient {
    ws: WebSocket
    classroomCode?: string
    subscribedAt: Date
}

let wsInstance: WebSocketService | null = null

export const getWebSocketService = (): WebSocketService | null => {
    return wsInstance
}

export class WebSocketService {
    private wss: WebSocketServer | null = null
    private clients: Map<string, WSClient> = new Map()

    constructor() {
        wsInstance = this
    }

    static getInstance(): WebSocketService | null {
        return wsInstance
    }

    initialize(server: Server) {
        this.wss = new WebSocketServer({ server, path: '/ws',  verifyClient: (info, cb) => {
            cb(true)
        } })

        this.wss.on('connection', (ws: WebSocket, req) => {
            const clientId = this.generateClientId(),
             url = new URL(req.url || '', 'http://localhost'),
             classroomCode = url.searchParams.get('classroom') || undefined

            this.clients.set(clientId, {
                ws,
                classroomCode,
                subscribedAt: new Date()
            })

            logger.debug(`ws - client connected: ${clientId} (classroom: ${classroomCode || 'all'})`)

            ws.send(JSON.stringify({
                type: 'connected',
                clientId,
                classroomCode,
                message: 'connected to real-time log stream'
            }))

            ws.on('message', (data: Buffer) => {
                try {
                    const message = JSON.parse(data.toString())

                    if (message.type === 'subscribe' && message.classroom) {
                        const client = this.clients.get(clientId)
                        if (client) {
                            client.classroomCode = message.classroom
                            ws.send(JSON.stringify({
                                type: 'subscribed',
                                classroom: message.classroom
                            }))
                        }
                    }
                } catch (e) {
                    logger.warn('ws - invalid message', e)
                }
            })

            ws.on('close', () => {
                this.clients.delete(clientId)
                logger.debug(`ws - client disconnected: ${clientId}`)
            })

            ws.on('error', (error) => {
                logger.error(`ws client error: ${clientId}`, error)
                this.clients.delete(clientId)
            })
        })

        this.wss.on('error', (error) => {
            logger.error('ws - server error', error)
        })

        logger.info('ws - webSocket server initialized on /ws')
    }

    broadcastLog(classroomCode: string, logEntry: RequestLog) {
        if (!this.wss) return
    
        const message = JSON.stringify({
            type: 'new_log',
            classroom_code: classroomCode,
            log: logEntry,
            timestamp: new Date().toISOString()
        })
    
        logger.debug(`[WS] Broadcasting to ${this.clients.size} clients for classroom ${classroomCode}`)
        
        let sent = 0
        this.clients.forEach((client) => {
            if (
                client.ws.readyState === WebSocket.OPEN &&
                (!client.classroomCode || client.classroomCode === classroomCode)
            ) {
                client.ws.send(message)
                sent++
            }
        })
        
        logger.debug(`[WS] Sent to ${sent} clients`)
    }
    broadcastClassroomClosed(classroomCode: string, reason: string = 'expired'): void {
        if (!this.wss) return

        const message = JSON.stringify({
            type: 'classroom_closed',
            classroom_code: classroomCode,
            reason: reason,
            message: reason === 'deactivated'
                ? 'Учитель завершил урок'
                : 'Время урока истекло',
            timestamp: new Date().toISOString()
        })

        this.clients.forEach((client) => {
            if (
                client.ws.readyState === WebSocket.OPEN &&
                client.classroomCode === classroomCode
            ) {
                client.ws.send(message)
            }
        })

        logger.info(`ws - classroom ${classroomCode} closed (${reason}), notified ${this.clients.size} clients`)
    }

    private generateClientId(): string {
        return Math.random().toString(36).substring(2, 15)
    }
    broadcastClassroomExtended(classroomCode: string, newExpiresAt: Date): void {
        if (!this.wss) return
    
        const message = JSON.stringify({
            type: 'classroom_extended',
            classroom_code: classroomCode,
            new_expires_at: newExpiresAt,
            message: 'Время урока продлено',
            timestamp: new Date().toISOString()
        })
    
        this.clients.forEach((client) => {
            if (
                client.ws.readyState === WebSocket.OPEN &&
                client.classroomCode === classroomCode
            ) {
                client.ws.send(message)
            }
        })
        
        logger.info(`ws - classroom ${classroomCode} extended, notified clients`)
    }
}
