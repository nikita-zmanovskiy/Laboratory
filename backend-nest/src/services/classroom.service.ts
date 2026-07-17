import { Injectable } from '@nestjs/common'
import { ClassroomRepository } from '../repositories/classroom.repository'
import { WebSocketService } from './websocket.service'
import { logger } from '../utils/logger'

@Injectable()
export class ClassroomService {
    constructor(
        private classroomRepo: ClassroomRepository,
        private wsService: WebSocketService
    ) {}

    async getOrCreateClassroom(
        sessionId: string,
        title?: string
    ): Promise<{
        code: string
        isNew: boolean
        title: string
        expiresAt: Date
    }> {
        const code = this.generateClassroomCode()
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

        const classroom = await this.classroomRepo.create({
            id: crypto.randomUUID(),
            code,
            title: title || `Session ${sessionId.substring(0, 8)}`,
            expiresAt,
        })

        return {
            code: classroom.code,
            isNew: true,
            title: classroom.title || '',
            expiresAt,
        }
    }

    async getClassroomStats(code: string) {
        return this.classroomRepo.getStats(code)
    }

    private generateClassroomCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let code = ''
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)]
        }
        return code
    }

    async cleanupExpiredClassrooms() {
        try {
            const codes = await this.classroomRepo.cleanupExpiredClassrooms()
            if (codes.length > 0) {
                for (const code of codes) {
                    this.wsService.broadcastClassroomClosed(code, 'expired')
                }
                logger.info(`cleanup - deactivated ${codes.length} expired classrooms`)
            }
        } catch (error) {
            logger.error('cleanup - error', error)
        }
    }
}
