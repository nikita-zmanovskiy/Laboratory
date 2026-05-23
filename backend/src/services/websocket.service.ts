import { WebSocketServer, WebSocket } from 'ws'
import { Server, IncomingMessage } from 'http'
import type { Socket } from 'net'
import type { RequestLog } from '../types/models.js'
import type { CsrfService } from './csrf.service.js'
import type { ClassroomRepository } from '../repositories/classroom.repository.js'
import { validateWsAccess } from '../utils/wsAuth.js'
import { logger } from '../utils/logger.js'

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

    constructor(
        private csrfService: CsrfService,
        private classroomRepo: ClassroomRepository
    ) {
        wsInstance = this
    }

    static getInstance(): WebSocketService | null {
        return wsInstance
    }

    initialize(server: Server) {
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

            logger.debug(
                `ws - client connected: ${clientId} (${role}, classroom: ${classroomCode})`
            )

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

        logger.info('ws - webSocket server initialized on /ws (token required)')
    }

    private async handleUpgrade(
        request: IncomingMessage,
        socket: Socket,
        head: Buffer,
        url: URL
    ): Promise<void> {
        const classroomCode = url.searchParams.get('classroom') ?? ''
        const token = url.searchParams.get('token') ?? ''

        const auth = await validateWsAccess(
            classroomCode,
            token,
            this.csrfService,
            this.classroomRepo
        )

        if (!auth.ok) {
            logger.warn(`ws - connection rejected: ${auth.reason}`)
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

    broadcastLog(classroomCode: string, logEntry: RequestLog) {
        if (!this.wss) return

        const normalizedCode = classroomCode.toUpperCase()
        const message = JSON.stringify({
            type: 'new_log',
            classroom_code: normalizedCode,
            log: logEntry,
            timestamp: new Date().toISOString(),
        })

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

        logger.debug(`[WS] Sent log to ${sent} clients for classroom ${normalizedCode}`)
    }

    broadcastClassroomClosed(classroomCode: string, reason: string = 'expired'): void {
        if (!this.wss) return

        const normalizedCode = classroomCode.toUpperCase()
        const message = JSON.stringify({
            type: 'classroom_closed',
            classroom_code: normalizedCode,
            reason,
            message: reason === 'deactivated' ? 'Учитель завершил урок' : 'Время урока истекло',
            timestamp: new Date().toISOString(),
        })

        this.clients.forEach((client) => {
            if (
                client.ws.readyState === WebSocket.OPEN &&
                client.classroomCode === normalizedCode
            ) {
                client.ws.send(message)
            }
        })

        logger.info(`ws - classroom ${normalizedCode} closed (${reason})`)
    }

    broadcastClassroomExtended(classroomCode: string, newExpiresAt: Date): void {
        if (!this.wss) return

        const normalizedCode = classroomCode.toUpperCase()
        const message = JSON.stringify({
            type: 'classroom_extended',
            classroom_code: normalizedCode,
            new_expires_at: newExpiresAt,
            message: 'Время урока продлено',
            timestamp: new Date().toISOString(),
        })

        this.clients.forEach((client) => {
            if (
                client.ws.readyState === WebSocket.OPEN &&
                client.classroomCode === normalizedCode
            ) {
                client.ws.send(message)
            }
        })

        logger.info(`ws - classroom ${normalizedCode} extended`)
    }

    private generateClientId(): string {
        return Math.random().toString(36).substring(2, 15)
    }
}
