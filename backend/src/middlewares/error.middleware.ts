import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'

export const errorMiddleware = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        logger.warn(`[${err.statusCode}] ${err.message}`)
    } else {
        logger.error('[500]', err.message)
    }

    //не отправлен ли ответ
    if (res.headersSent) {
        return next(err)
    }

    const statusCode = err instanceof AppError ? err.statusCode : 500,
        message = err instanceof AppError ? err.message : 'Internal server error'

    res.status(statusCode).json({
        error: message,
        session_id: req.body?.session_id || null,
        classroom_code: req.body?.classroom_code || req.headers?.['x-classroom-code'] || null,
    })
}
