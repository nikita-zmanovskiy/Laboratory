import crypto from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'
import { logger, requestContextStorage, type RequestContext } from '../utils/logger.js'

const buildContext = (req: Request): RequestContext => ({
    requestId: crypto.randomUUID(),
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    classroomCode:
        (req.headers['x-classroom-code'] as string | undefined) || req.body?.classroom_code,
    sessionId: req.body?.session_id,
})

export const requestContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const context = buildContext(req)
    const startedAt = Date.now()

    requestContextStorage.run(context, () => {
        res.on('finish', () => {
            const durationMs = Date.now() - startedAt
            const meta = {
                requestId: context.requestId,
                method: context.method,
                path: context.path,
                statusCode: res.statusCode,
                durationMs,
                classroomCode: context.classroomCode,
                sessionId: context.sessionId,
            }

            if (res.statusCode >= 500) {
                logger.error('http request completed', meta)
            } else if (res.statusCode >= 400) {
                logger.warn('http request completed', meta)
            } else {
                logger.info('http request completed', meta)
            }
        })

        next()
    })
}
