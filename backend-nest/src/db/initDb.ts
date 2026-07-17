import { pool } from './pool'
import { config } from '../config/env'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { logger } from '../utils/logger'

const __filename = fileURLToPath(import.meta.url),
    __dirname = dirname(__filename)

export const initDb = async () => {
    if (!config.databaseUrl?.trim()) {
        logger.error('DATABASE_URL не задан')
        process.exit(1)
    }

    try {
        //TODO: переработать
        const migrations = [
            'create_classrooms.sql',
            'create_request_logs.sql',
            'add_tokens_approximate.sql',
            'add_grade.sql',
            'add_teacher_token.sql',
        ]

        for (const migration of migrations) {
            const migrationPath = join(__dirname, 'migrations', migration)
            try {
                const sql = readFileSync(migrationPath, 'utf-8')
                await pool.query(sql)
                logger.info(`DB - migration applied: ${migration}`)
            } catch (err: unknown) {
                // пропускаем ошибки о существующих колонках
                const pgError = err as { code?: string }
                if (pgError.code === '42701' || pgError.code === '42P07') {
                    logger.debug(`migrations skipped: ${migration}`)
                } else {
                    throw err
                }
            }
        }

        logger.info('db - all migrations completed')
    } catch (err) {
        logger.error('db - failed to initialize', err)
        process.exit(1)
    }
}
