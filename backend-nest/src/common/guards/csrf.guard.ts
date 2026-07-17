import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Request } from 'express'
import { CsrfService } from '../../services/csrf.service'
import { RateLimitService } from '../../services/rateLimit.service'
import { getStudentTokenFromRequest, getTeacherTokenFromRequest } from '../../utils/authCookie'

const isTeacherClassroomRoute = (path: string): boolean =>
    /^\/api\/classrooms\/[A-Za-z0-9]+\/(extend|deactivate|teacher-session)$/.test(path)

@Injectable()
export class CsrfGuard implements CanActivate {
    constructor(
        private csrfService: CsrfService,
        private rateLimitService: RateLimitService
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>()
        // const res = context.switchToHttp().getResponse<Response>()

        if (req.method === 'GET') {
            return true
        }

        const path = req.path
        if (path.startsWith('/api/csrf/') || path === '/health' || path.startsWith('/api-docs')) {
            return true
        }

        if (isTeacherClassroomRoute(path)) {
            const teacherToken = getTeacherTokenFromRequest(req)
            if (!teacherToken || !/^[a-f0-9]{64}$/.test(teacherToken)) {
                throw new ForbiddenException('Teacher authentication required')
            }
            return true
        }

        const csrfToken = getStudentTokenFromRequest(req)
        const sessionId = req.body?.session_id as string | undefined
        const ip = req.ip || req.socket.remoteAddress || 'unknown'
        const bruteKey = `ip:${ip}`

        const bruteCheck = this.rateLimitService.checkBruteForce(bruteKey)
        if (!bruteCheck.allowed) {
            throw new HttpException(
                { error: bruteCheck.reason, retry_after: bruteCheck.retryAfter },
                HttpStatus.TOO_MANY_REQUESTS
            )
        }

        if (!csrfToken) {
            this.rateLimitService.recordFailure(bruteKey)
            throw new ForbiddenException('CSRF token required')
        }

        const validation = this.csrfService.validateToken(csrfToken, sessionId)
        if (!validation.valid) {
            this.rateLimitService.recordFailure(bruteKey)
            throw new ForbiddenException(validation.error || 'Invalid token')
        }

        const classroomCode =
            (req.headers['x-classroom-code'] as string) || req.body?.classroom_code
        if (classroomCode && sessionId) {
            const tokenInfo = this.csrfService.getTokenInfo(sessionId)
            if (
                tokenInfo &&
                tokenInfo.classroomCode !== 'unknown' &&
                tokenInfo.classroomCode.toUpperCase() !== classroomCode.toUpperCase()
            ) {
                throw new ForbiddenException('token does not belong to this classroom')
            }
        }

        return true
    }
}
