import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
    NotFoundException,
    GoneException,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Request } from 'express'
import { ClassroomRepository } from '../../repositories/classroom.repository'
import { RateLimitService } from '../../services/rateLimit.service'
import { WebSocketService } from '../../services/websocket.service'
import { isExpired } from '../../utils/moscowTime'
import { enrichRequestContext, logger } from '../../utils/logger'

@Injectable()
export class ClassroomContextGuard implements CanActivate {
    constructor(
        private classroomRepo: ClassroomRepository,
        private rateLimitService: RateLimitService,
        private wsService: WebSocketService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>()

        if (!req.path.startsWith('/api/generate') || req.path.includes('/images/')) {
            return true
        }

        const headerCode = req.headers['x-classroom-code'] as string
        const bodyCode = req.body?.classroom_code
        const classroomCode = headerCode || bodyCode

        if (!classroomCode) {
            throw new BadRequestException({ error: 'classroom_code is required' })
        }

        const ip = req.ip || req.socket.remoteAddress || 'unknown'
        const bruteKey = `ip:${ip}:classroom`

        const bruteCheck = this.rateLimitService.checkBruteForce(bruteKey)
        if (!bruteCheck.allowed) {
            throw new HttpException({ error: bruteCheck.reason }, HttpStatus.TOO_MANY_REQUESTS)
        }

        if (!/^[A-Z0-9]{6}$/.test(classroomCode)) {
            this.rateLimitService.recordFailure(bruteKey)
            throw new BadRequestException({ error: 'Invalid classroom_code format' })
        }

        const classroom = await this.classroomRepo.findByCode(classroomCode)

        if (!classroom) {
            this.rateLimitService.recordFailure(bruteKey)
            throw new NotFoundException({ error: 'Classroom not found' })
        }

        if (classroom.expiresAt && isExpired(classroom.expiresAt)) {
            if (classroom.isActive) {
                await this.classroomRepo.deactivate(classroom.id)
                logger.info(`classroom - auto-deactivated expired classroom: ${classroomCode}`)
                this.wsService.broadcastClassroomClosed(classroomCode, 'expired')
            }

            throw new GoneException({
                error: 'Classroom has expired',
                expired_at: classroom.expiresAt,
            })
        }

        if (!classroom.isActive) {
            throw new GoneException({ error: 'Classroom is no longer active' })
        }

        req.body.classroom_code = classroomCode
        req.body.classroom_id = classroom.id

        enrichRequestContext({
            classroomCode,
            sessionId: req.body?.session_id,
        })

        return true
    }
}
