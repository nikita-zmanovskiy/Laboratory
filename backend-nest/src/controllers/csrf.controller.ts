import {
    Controller,
    Get,
    Query,
    Delete,
    Post,
    Res,
    Req,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response, Request } from 'express'
import { CsrfService } from '../services/csrf.service'
import { RateLimitService } from '../services/rateLimit.service'
import { setStudentCookie, clearStudentCookie, STUDENT_COOKIE_NAME } from '../utils/authCookie'

@ApiTags('CSRF')
@Controller('api/csrf')
export class CsrfController {
    constructor(
        private csrfService: CsrfService,
        private rateLimitService: RateLimitService
    ) {}

    @Get('token')
    getToken(
        @Query('session_id') sessionId: string | undefined,
        @Res({ passthrough: true }) res: Response
    ) {
        const { token, isNew } = this.csrfService.getOrCreateToken(sessionId)
        const tokenInfo = this.csrfService.findByToken(token)
        const expiresAt = tokenInfo?.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000)

        setStudentCookie(res, token, expiresAt)

        return {
            session_id: sessionId || null,
            is_new: isNew,
            expires_at: expiresAt,
            message: isNew
                ? 'Session cookie set. Token is stored in HTTPOnly cookie.'
                : 'Using existing session cookie.',
        }
    }

    @Post('refresh')
    refreshToken(
        @Query('session_id') sessionId: string,
        @Res({ passthrough: true }) res: Response
    ) {
        if (!sessionId) {
            throw new BadRequestException({
                error: 'session_id is required to refresh token',
            })
        }

        const newToken = this.csrfService.refreshToken(sessionId)
        if (!newToken) {
            throw new NotFoundException({
                error: 'Session not found or token expired',
            })
        }

        this.rateLimitService.resetLimit(`token:${newToken.substring(0, 16)}`)

        const tokenInfo = this.csrfService.getTokenInfo(sessionId)
        if (tokenInfo) {
            setStudentCookie(res, newToken, tokenInfo.expiresAt)
        }

        return {
            session_id: sessionId,
            message: 'Session cookie refreshed. Rate limit reset.',
        }
    }

    @Delete('token')
    revokeToken(@Query('session_id') sessionId: string, @Res({ passthrough: true }) res: Response) {
        if (!sessionId) {
            throw new BadRequestException({
                error: 'session_id is required to revoke token',
            })
        }

        this.csrfService.revokeToken(sessionId)
        clearStudentCookie(res)

        return {
            message: 'Token revoked and session cookie cleared',
            session_id: sessionId,
        }
    }

    @Get('status')
    getStatus(@Req() req: Request) {
        const token = (req.cookies?.[STUDENT_COOKIE_NAME] || req.headers['x-csrf-token']) as string
        const ip = req.ip || req.socket.remoteAddress || 'unknown'
        const key = token ? `token:${token.substring(0, 16)}` : `ip:${ip}`
        const stats = this.rateLimitService.getStats(key)

        if (!stats) {
            return {
                message: 'No rate limit data',
                limit: 10,
                window_seconds: 3,
            }
        }

        return {
            requests_made: stats.count,
            requests_remaining: Math.max(0, 10 - stats.count),
            limit: 10,
            window_seconds: 3,
            window_remaining_ms: stats.windowRemaining,
            blocked: stats.blocked,
        }
    }
}
