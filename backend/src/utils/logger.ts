import { config } from '../config/env.js'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const levelPriority: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
}

const currentLevel = (config.logLevel in levelPriority ? config.logLevel : 'info') as LogLevel

const shouldLog = (level: LogLevel): boolean =>
    levelPriority[level] >= levelPriority[currentLevel]

export const logger = {
    debug: (message: string, meta?: unknown) => {
        if (shouldLog('debug')) console.debug(message, meta ?? '')
    },
    info: (message: string, meta?: unknown) => {
        if (shouldLog('info')) console.info(message, meta ?? '')
    },
    warn: (message: string, meta?: unknown) => {
        if (shouldLog('warn')) console.warn(message, meta ?? '')
    },
    error: (message: string, meta?: unknown) => {
        if (shouldLog('error')) console.error(message, meta ?? '')
    },
}
