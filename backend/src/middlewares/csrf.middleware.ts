import type { Request, Response, NextFunction } from 'express'
import { csrfService } from '../routes/csrf.routes.js'
import { RateLimitService } from '../services/rateLimit.service.js'
import { getStudentTokenFromRequest, getTeacherTokenFromRequest } from '../utils/authCookie.js'

const rateLimitService = new RateLimitService()

const isTeacherClassroomRoute = (path: string): boolean =>
    /^\/api\/classrooms\/[A-Za-z0-9]+\/(extend|deactivate|teacher-session)$/.test(path)

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET') {
        next()
        return
    }
    if (
        req.path.startsWith('/api/csrf/') ||
        req.path === '/health' ||
        req.path.startsWith('/api-docs')
    ) {
        next()
        return
    }

    if (isTeacherClassroomRoute(req.path)) {
        const teacherToken = getTeacherTokenFromRequest(req)
        if (!teacherToken || !/^[a-f0-9]{64}$/.test(teacherToken)) {
            res.status(403).json({ error: 'Teacher authentication required' })
            return
        }
        next()
        return
    }

    const csrfToken = getStudentTokenFromRequest(req)
    const sessionId = req.body?.session_id as string | undefined

    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const bruteKey = `ip:${ip}`
    const bruteCheck = rateLimitService.checkBruteForce(bruteKey)
    if (!bruteCheck.allowed) {
        res.status(429).json({
            error: bruteCheck.reason,
            retry_after: bruteCheck.retryAfter,
        })
        return
    }
    if (!csrfToken) {
        rateLimitService.recordFailure(bruteKey)
        res.status(403).json({ error: 'CSRF token required' })
        return
    }
    const validation = csrfService.validateToken(csrfToken, sessionId)

    if (!validation.valid) {
        rateLimitService.recordFailure(bruteKey)
        res.status(403).json({ error: validation.error || 'Invalid token' })
        return
    }

    const classroomCode = (req.headers['x-classroom-code'] as string) || req.body?.classroom_code
    if (classroomCode && sessionId) {
        const tokenInfo = csrfService.getTokenInfo(sessionId)
        if (
            tokenInfo &&
            tokenInfo.classroomCode !== 'unknown' &&
            tokenInfo.classroomCode.toUpperCase() !== classroomCode.toUpperCase()
        ) {
            res.status(403).json({ error: 'token does not belong to this classroom' })
            return
        }
    }
    next()
}
