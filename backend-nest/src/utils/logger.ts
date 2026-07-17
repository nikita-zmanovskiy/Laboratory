import { AsyncLocalStorage } from 'node:async_hooks'
import pino from 'pino'

import { config } from '../config/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type RequestContext = {
    requestId: string
    method?: string
    path?: string
    ip?: string
    userAgent?: string
    classroomCode?: string
    sessionId?: string
}

type LogMeta = Record<string, unknown> | Error | unknown

export const requestContextStorage = new AsyncLocalStorage<RequestContext>()

export const enrichRequestContext = (patch: Partial<RequestContext>): void => {
    const store = requestContextStorage.getStore()
    if (store) {
        Object.assign(store, patch)
    }
}

export const runWithRequestContext = <T>(context: RequestContext, fn: () => T): T =>
    requestContextStorage.run(context, fn)

export const runWithRequestContextAsync = <T>(
    context: RequestContext,
    fn: () => Promise<T>
): Promise<T> => requestContextStorage.run(context, fn)

const isProduction = config.nodeEnv === 'production'

const baseLogger = pino(
    {
        level: config.logLevel ?? 'info',

        base: {
            service: 'ai-lab-backend',
            env: config.nodeEnv,
        },

        timestamp: pino.stdTimeFunctions.isoTime,

        redact: {
            paths: [
                'password',
                'token',
                'csrfToken',
                'teacherToken',
                'studentToken',
                'authorization',
                'cookie',
                'headers.authorization',
                'headers.cookie',
                'headers.x-csrf-token',
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers.x-csrf-token',
                'body.image',
                'image',
                'prompt',
                'result.text',
                'result.content',
            ],
            censor: '[REDACTED]',
        },

        serializers: {
            err: pino.stdSerializers.err,
        },
    },

    !isProduction
        ? pino.transport({
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
              },
          })
        : undefined
)

const normalizeMeta = (meta?: LogMeta): Record<string, unknown> => {
    if (!meta) return {}

    if (meta instanceof Error) {
        return { err: meta }
    }

    if (typeof meta === 'object') {
        return meta as Record<string, unknown>
    }

    return { value: meta }
}

const withRequestContext = (meta?: LogMeta): Record<string, unknown> => {
    const context = requestContextStorage.getStore()

    return {
        ...context,
        ...normalizeMeta(meta),
    }
}

const log = (level: LogLevel, message: string, meta?: LogMeta): void => {
    baseLogger[level](withRequestContext(meta), message)
}

export const logger = {
    debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
    info: (message: string, meta?: LogMeta) => log('info', message, meta),
    warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
    error: (message: string, meta?: LogMeta) => log('error', message, meta),

    child: (bindings: Record<string, unknown>) => {
        const childLogger = baseLogger.child(bindings)

        return {
            debug: (message: string, meta?: LogMeta) => {
                childLogger.debug(withRequestContext(meta), message)
            },
            info: (message: string, meta?: LogMeta) => {
                childLogger.info(withRequestContext(meta), message)
            },
            warn: (message: string, meta?: LogMeta) => {
                childLogger.warn(withRequestContext(meta), message)
            },
            error: (message: string, meta?: LogMeta) => {
                childLogger.error(withRequestContext(meta), message)
            },
        }
    },
}
