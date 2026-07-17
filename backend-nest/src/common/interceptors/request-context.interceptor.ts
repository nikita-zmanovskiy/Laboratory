import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request, Response } from 'express'
import crypto from 'node:crypto'
import { logger, requestContextStorage, type RequestContext } from '../../utils/logger'

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

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const req = context.switchToHttp().getRequest<Request>()
        const res = context.switchToHttp().getResponse<Response>()
        const ctx = buildContext(req)
        const startedAt = Date.now()

        return new Observable((subscriber) => {
            requestContextStorage.run(ctx, () => {
                next.handle().subscribe({
                    next: (value) => subscriber.next(value),
                    error: (err) => subscriber.error(err),
                    complete: () => {
                        const durationMs = Date.now() - startedAt
                        const meta = {
                            requestId: ctx.requestId,
                            method: ctx.method,
                            path: ctx.path,
                            statusCode: res.statusCode,
                            durationMs,
                            classroomCode: ctx.classroomCode,
                            sessionId: ctx.sessionId,
                        }

                        if (res.statusCode >= 500) {
                            logger.error('http request completed', meta)
                        } else if (res.statusCode >= 400) {
                            logger.warn('http request completed', meta)
                        } else {
                            logger.info('http request completed', meta)
                        }

                        subscriber.complete()
                    },
                })
            })
        })
    }
}
