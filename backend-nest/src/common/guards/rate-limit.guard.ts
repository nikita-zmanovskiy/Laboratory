import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { RateLimitService } from '../../services/rateLimit.service'
import { logger } from '../../utils/logger'

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(private rateLimitService: RateLimitService) {}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>()
        const res = context.switchToHttp().getResponse<Response>()

        if (req.method === 'GET') {
            return true
        }

        if (
            req.path === '/api/csrf/token' ||
            req.path.startsWith('/api-docs') ||
            req.path === '/health'
        ) {
            return true
        }

        const csrfToken = req.headers['x-csrf-token'] as string
        const ip = req.ip || req.socket.remoteAddress || 'unknown'
        const sessionId = req.body?.session_id || 'no-session'
        const rateLimitKey = csrfToken ? `token:${csrfToken.substring(0, 16)}` : `ip:${ip}`

        const result = this.rateLimitService.checkRateLimit(rateLimitKey)

        res.setHeader('X-RateLimit-Limit', '10')
        res.setHeader('X-RateLimit-Window', '60 seconds')

        if (!result.allowed) {
            res.setHeader('X-RateLimit-Remaining', '0')
            res.setHeader('Retry-After', String(result.retryAfter || 60))

            logger.warn('rateLimit - blocked request', {
                key: rateLimitKey,
                ip,
                session: sessionId,
                reason: result.reason,
            })

            throw new HttpException(
                {
                    error: result.reason,
                    retry_after_seconds: result.retryAfter,
                    limit: 10,
                    window_seconds: 60,
                },
                HttpStatus.TOO_MANY_REQUESTS
            )
        }

        const stats = this.rateLimitService.getStats(rateLimitKey)
        if (stats) {
            res.setHeader('X-RateLimit-Remaining', String(Math.max(0, 10 - stats.count)))
            res.setHeader('X-RateLimit-Reset', String(Math.ceil(stats.windowRemaining / 1000)))
        }

        return true
    }
}
