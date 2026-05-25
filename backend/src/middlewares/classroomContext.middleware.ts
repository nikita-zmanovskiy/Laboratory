import type { Request, Response, NextFunction } from 'express'
import { ClassroomRepository } from '../repositories/classroom.repository.js'
import { isExpired } from '../utils/moscowTime.js'
import { getWebSocketService } from '../services/websocket.service.js'
import { RateLimitService } from '../services/rateLimit.service.js'
import { enrichRequestContext, logger } from '../utils/logger.js'

const classroomRepo = new ClassroomRepository()
const rateLimitService = new RateLimitService()

export const classroomContextMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.path.startsWith('/api/generate') || req.path.includes('/images/')) {
        return next()
    }

    const headerCode = req.headers['x-classroom-code'] as string,
        bodyCode = req.body?.classroom_code,
        classroomCode = headerCode || bodyCode

    if (!classroomCode) {
        return res.status(400).json({
            error: 'classroom_code is required',
        })
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const bruteKey = `ip:${ip}:classroom`

    const bruteCheck = rateLimitService.checkBruteForce(bruteKey)
    if (!bruteCheck.allowed) {
        return res.status(429).json({ error: bruteCheck.reason })
    }

    if (!/^[A-Z0-9]{6}$/.test(classroomCode)) {
        rateLimitService.recordFailure(bruteKey)
        return res.status(400).json({
            error: 'Invalid classroom_code format',
        })
    }

    const classroom = await classroomRepo.findByCode(classroomCode)

    if (!classroom) {
        rateLimitService.recordFailure(bruteKey)
        return res.status(404).json({
            error: 'Classroom not found',
        })
    }

    if (classroom.expires_at && isExpired(classroom.expires_at)) {
        if (classroom.is_active) {
            await classroomRepo.deactivate(classroom.id)
            logger.info(`classroom - auto-deactivated expired classroom: ${classroomCode}`)
            const wsService = getWebSocketService()
            if (wsService) {
                wsService.broadcastClassroomClosed(classroomCode, 'expired')
            }
        }

        return res.status(410).json({
            error: 'Classroom has expired',
            expired_at: classroom.expires_at,
        })
    }
    if (!classroom.is_active) {
        return res.status(410).json({
            error: 'Classroom is no longer active',
        })
    }

    req.body.classroom_code = classroomCode
    req.body.classroom_id = classroom.id

    enrichRequestContext({
        classroomCode,
        sessionId: req.body?.session_id,
    })

    next()
}
