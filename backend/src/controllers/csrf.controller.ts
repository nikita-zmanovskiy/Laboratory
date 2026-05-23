import type { Request, Response } from 'express'
import { CsrfService } from '../services/csrf.service.js'
import { RateLimitService } from '../services/rateLimit.service.js'
import { setStudentCookie, clearStudentCookie, getStudentTokenFromRequest, STUDENT_COOKIE_NAME } from '../utils/authCookie.js'

export class CsrfController {
    constructor(
        private csrfService: CsrfService,
        private rateLimitService: RateLimitService
    ) {}

    getToken = (req: Request, res: Response) => {
        const sessionId = req.query.session_id as string | undefined

        const { token, isNew } = this.csrfService.getOrCreateToken(sessionId)

        // время истечения
        const tokenInfo = this.csrfService.findByToken(token)
        const expiresAt = tokenInfo?.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000)

        setStudentCookie(res, token, expiresAt)

        res.json({
            session_id: sessionId || null,
            is_new: isNew,
            expires_at: expiresAt,
            message: isNew
                ? 'Session cookie set. Token is stored in HTTPOnly cookie.'
                : 'Using existing session cookie.'
        })
    }

    refreshToken = (req: Request, res: Response) => {
        const sessionId = req.query.session_id as string

        if (!sessionId) {
            return res.status(400).json({ error: 'session_id is required to refresh token' })
        }

        const newToken = this.csrfService.refreshToken(sessionId)

        if (!newToken) {
            return res.status(404).json({ error: 'Session not found or token expired' })
        }

        this.rateLimitService.resetLimit(`token:${newToken.substring(0, 16)}`)

        const tokenInfo = this.csrfService.getTokenInfo(sessionId)
        if (tokenInfo) {
            setStudentCookie(res, newToken, tokenInfo.expiresAt)
        }

        res.json({
            session_id: sessionId,
            message: 'Session cookie refreshed. Rate limit reset.'
        })
    }

    revokeToken = (req: Request, res: Response) => {
        const sessionId = req.query.session_id as string

        if (!sessionId) {
            return res.status(400).json({ error: 'session_id is required to revoke token' })
        }

        this.csrfService.revokeToken(sessionId)
        clearStudentCookie(res)

        res.json({
            message: 'Token revoked and session cookie cleared',
            session_id: sessionId
        })
    }

    getStatus = (req: Request, res: Response) => {
        const token = (req.cookies?.[STUDENT_COOKIE_NAME] || req.headers['x-csrf-token']) as string,
         ip = req.ip || req.socket.remoteAddress || 'unknown'

        const key = token ? `token:${token.substring(0, 16)}` : `ip:${ip}`,
         stats = this.rateLimitService.getStats(key)

        if (!stats) {
            return res.json({
                message: 'No rate limit data',
                limit: 10,
                window_seconds: 3
            })
        }

        res.json({
            requests_made: stats.count,
            requests_remaining: Math.max(0, 10 - stats.count),
            limit: 10,
            window_seconds: 3,
            window_remaining_ms: stats.windowRemaining,
            blocked: stats.blocked
        })
    }
}