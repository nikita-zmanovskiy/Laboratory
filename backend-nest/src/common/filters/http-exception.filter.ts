import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest()

        if (response.headersSent) {
            return
        }

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
        let message = 'Internal server error'
        let details: unknown

        if (exception instanceof AppError) {
            statusCode = exception.statusCode
            message = exception.message
            logger.warn(exception.message, { statusCode })
        } else if (exception instanceof HttpException) {
            statusCode = exception.getStatus()
            const res = exception.getResponse()

            if (typeof res === 'string') {
                message = res
            } else if (res && typeof res === 'object') {
                const obj = res as Record<string, unknown>
                if (typeof obj.error === 'string') {
                    message = obj.error
                } else if (typeof obj.message === 'string') {
                    message = obj.message
                } else if (Array.isArray(obj.message)) {
                    message = obj.message.join(', ')
                } else {
                    message = 'Error'
                }
                if ('details' in obj) {
                    details = obj.details
                }
            }

            if (statusCode >= 500) {
                logger.error('http exception', exception)
            }
        } else if (exception instanceof Error) {
            logger.error('unhandled error', exception)
        }

        const body: Record<string, unknown> = {
            error: message,
            session_id: request.body?.session_id || null,
            classroom_code:
                request.body?.classroom_code || request.headers?.['x-classroom-code'] || null,
        }

        if (details !== undefined) {
            body.details = details
        }

        response.status(statusCode).json(body)
    }
}
