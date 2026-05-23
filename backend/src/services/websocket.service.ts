import { WebSocketServer, WebSocket } from 'ws'
import { Server, IncomingMessage } from 'http'
import type { Socket } from 'net'
import type { RequestLog } from '../types/models.js'
import type { WsBroadcastEvent } from '../types/wsBroadcast.js'
import type { CsrfService } from './csrf.service.js'
import type { ClassroomRepository } from '../repositories/classroom.repository.js'
import { RedisWsPubSub } from './redisWsPubSub.service.js'
import { validateWsAccess } from '../utils/wsAuth.js'
import crypto from 'node:crypto'
import { logger, runWithRequestContextAsync } from '../utils/logger.js'

interface WSClient {
    ws: WebSocket
    classroomCode: string
    role: 'teacher' | 'student'
    subscribedAt: Date
}

let wsInstance: WebSocketService | null = null

export const getWebSocketService = (): WebSocketService | null => {
    return wsInstance
}

export class WebSocketService {
    private wss: WebSocketServer | null = null
    private clients: Map<string, WSClient> = new Map()
    private readonly pubSub = new RedisWsPubSub()

    constructor(
        private csrfService: CsrfService,
        private classroomRepo: ClassroomRepository
    ) {
        wsInstance = this
    }

    static getInstance(): WebSocketService | null {
        return wsInstance
    }

    async initialize(server: Server): Promise<void> {
        await this.pubSub.connect((event) => this.handleBroadcastEvent(event))

        this.wss = new WebSocketServer({ noServer: true })

        server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
            const url = new URL(request.url || '', 'http://localhost')

            if (url.pathname !== '/ws') {
                socket.destroy()
                return
            }

            void this.handleUpgrade(request, socket, head, url)
        })

        this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            const clientId = this.generateClientId()
            const url = new URL(req.url || '', 'http://localhost')
            const classroomCode = url.searchParams.get('classroom')?.toUpperCase() || ''
            const role = (url.searchParams.get('role') as 'teacher' | 'student') || 'student'

            this.clients.set(clientId, {
                ws,
                classroomCode,
                role,
                subscribedAt: new Date(),
            })

            logger.debug('ws - client connected', { clientId, role, classroomCode })

            ws.send(
                JSON.stringify({
                    type: 'connected',
                    clientId,
                    classroomCode,
                    role,
                    message: 'connected to classroom stream',
                })
            )

            ws.on('close', () => {
                this.clients.delete(clientId)
                logger.debug('ws - client disconnected', { clientId })
            })

            ws.on('error', (error) => {
                logger.error('ws - client error', { clientId, err: error })
                this.clients.delete(clientId)
            })
        })

        this.wss.on('error', (error) => {
            logger.error('ws - server error', error)
        })

        logger.info('ws - webSocket server initialized on /ws (token required)')
    }

    async shutdown(): Promise<void> {
        for (const [clientId, client] of this.clients.entries()) {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.close(1001, 'server shutting down')
            }
            this.clients.delete(clientId)
        }
        await this.pubSub.disconnect()
        this.wss = null
        wsInstance = null
    }

    private handleBroadcastEvent(event: WsBroadcastEvent): void {
        switch (event.kind) {
            case 'new_log':
                this.deliverToClassroom(
                    event.classroomCode,
                    JSON.stringify({
                        type: 'new_log',
                        classroom_code: event.classroomCode.toUpperCase(),
                        log: event.log,
                        timestamp: new Date().toISOString(),
                    })
                )
                break
            case 'classroom_closed':
                this.deliverToClassroom(
                    event.classroomCode,
                    JSON.stringify({
                        type: 'classroom_closed',
                        classroom_code: event.classroomCode.toUpperCase(),
                        reason: event.reason,
                        message:
                            event.reason === 'deactivated'
                                ? 'Учитель завершил урок'
                                : 'Время урока истекло',
                        timestamp: new Date().toISOString(),
                    })
                )
                logger.info(
                    `ws - classroom ${event.classroomCode.toUpperCase()} closed (${event.reason})`
                )
                break
            case 'classroom_extended':
                this.deliverToClassroom(
                    event.classroomCode,
                    JSON.stringify({
                        type: 'classroom_extended',
                        classroom_code: event.classroomCode.toUpperCase(),
                        new_expires_at: event.newExpiresAt,
                        message: 'Время урока продлено',
                        timestamp: new Date().toISOString(),
                    })
                )
                logger.info(`ws - classroom ${event.classroomCode.toUpperCase()} extended`)
                break
        }
    }

    private deliverToClassroom(classroomCode: string, message: string): void {
        const normalizedCode = classroomCode.toUpperCase()
        let sent = 0

        this.clients.forEach((client) => {
            if (
                client.ws.readyState === WebSocket.OPEN &&
                client.classroomCode === normalizedCode
            ) {
                client.ws.send(message)
                sent++
            }
        })

        if (sent > 0) {
            logger.debug('ws - message delivered', { sent, classroomCode: normalizedCode })
        }
    }

    private async handleUpgrade(
        request: IncomingMessage,
        socket: Socket,
        head: Buffer,
        url: URL
    ): Promise<void> {
        const classroomCode = url.searchParams.get('classroom') ?? ''
        const token = url.searchParams.get('token') ?? ''
        const wsContext = {
            requestId: crypto.randomUUID(),
            method: 'GET',
            path: url.pathname + url.search,
            ip: request.socket.remoteAddress,
            userAgent: request.headers['user-agent'],
            classroomCode: classroomCode.toUpperCase() || undefined,
        }

        await runWithRequestContextAsync(wsContext, () =>
            this.handleUpgradeWithContext(request, socket, head, url, classroomCode, token)
        )
    }

    private async handleUpgradeWithContext(
        request: IncomingMessage,
        socket: Socket,
        head: Buffer,
        url: URL,
        classroomCode: string,
        token: string
    ): Promise<void> {
        const auth = await validateWsAccess(
            classroomCode,
            token,
            this.csrfService,
            this.classroomRepo
        )

        if (!auth.ok) {
            logger.warn('ws - connection rejected', { reason: auth.reason })
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
            socket.destroy()
            return
        }

        url.searchParams.set('classroom', classroomCode.toUpperCase())
        url.searchParams.set('role', auth.role)
        request.url = `${url.pathname}?${url.searchParams.toString()}`

        if (!this.wss) {
            socket.destroy()
            return
        }

        this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss?.emit('connection', ws, request)
        })
    }

    broadcastLog(classroomCode: string, logEntry: RequestLog): void {
        void this.pubSub.publish({
            kind: 'new_log',
            classroomCode,
            log: logEntry,
        })
    }

    broadcastClassroomClosed(classroomCode: string, reason: string = 'expired'): void {
        void this.pubSub.publish({
            kind: 'classroom_closed',
            classroomCode,
            reason,
        })
    }

    broadcastClassroomExtended(classroomCode: string, newExpiresAt: Date): void {
        void this.pubSub.publish({
            kind: 'classroom_extended',
            classroomCode,
            newExpiresAt: newExpiresAt.toISOString(),
        })
    }

    getLocalClientCount(): number {
        return this.clients.size
    }

    private generateClientId(): string {
        return Math.random().toString(36).substring(2, 15)
    }
}
