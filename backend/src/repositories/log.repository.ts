import { pool } from '../db/pool.js'
import type { RequestLog } from '../types/models.js'

export class LogRepository {
    async findByClassroomCode(classroomCode: string): Promise<RequestLog[]> {
        const { rows } = await pool.query(
            `
            SELECT rl.* 
            FROM request_logs rl
            JOIN classrooms c ON rl.classroom_id = c.id
            WHERE UPPER(c.code) = UPPER($1)
            ORDER BY rl.timestamp DESC
            LIMIT 100
        `,
            [classroomCode]
        )

        return rows
    }
    async findByClassroomCodePaginated(
        classroomCode: string,
        page: number = 1,
        limit: number = 20,
        filters?: {
            search?: string
            mode?: string
            status?: string
            image_attached?: string
            sort?: string
        }
    ): Promise<{ logs: RequestLog[]; total: number; page: number; totalPages: number }> {
        const offset = (page - 1) * limit

        let whereConditions = `UPPER(c.code) = UPPER($1)`
        const params: Array<string | number> = [classroomCode]
        let paramIndex = 2

        if (filters?.search) {
            whereConditions += ` AND rl.session_id ILIKE $${paramIndex}`
            params.push(`%${filters.search}%`)
            paramIndex++
        }

        if (filters?.mode && filters.mode !== 'all') {
            whereConditions += ` AND rl.mode = $${paramIndex}`
            params.push(filters.mode)
            paramIndex++
        }

        if (filters?.status === 'success') {
            whereConditions += ` AND rl.status = 200`
        } else if (filters?.status === 'error') {
            whereConditions += ` AND rl.status >= 400`
        }

        if (filters?.image_attached === 'with_image') {
            whereConditions += ` AND rl.image_attached = true`
        } else if (filters?.image_attached === 'no_image') {
            whereConditions += ` AND rl.image_attached = false`
        }

        const sortOrder = filters?.sort === 'oldest' ? 'ASC' : 'DESC'

        const countQuery = `
            SELECT COUNT(*) as total
            FROM request_logs rl
            JOIN classrooms c ON rl.classroom_id = c.id
            WHERE ${whereConditions}
        `

        const countResult = await pool.query(countQuery, params)
        const total = parseInt(countResult.rows[0].total)
        const totalPages = Math.ceil(total / limit)

        const dataQuery = `
            SELECT rl.* 
            FROM request_logs rl
            JOIN classrooms c ON rl.classroom_id = c.id
            WHERE ${whereConditions}
            ORDER BY rl.timestamp ${sortOrder}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `

        const dataParams = [...params, limit, offset]
        const { rows } = await pool.query(dataQuery, dataParams)

        return {
            logs: rows,
            total,
            page,
            totalPages,
        }
    }
    async create(log: Omit<RequestLog, 'id'>): Promise<RequestLog> {
        const { rows } = await pool.query(
            `
            INSERT INTO request_logs (
                timestamp, classroom_id, session_id, mode, 
                prompt_hash, image_attached, tokens_input, 
                tokens_output,tokens_is_approximate, status, response_time_ms, error_message
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `,
            [
                log.timestamp,
                log.classroom_id,
                log.session_id,
                log.mode,
                log.prompt_hash,
                log.image_attached,
                log.tokens_input,
                log.tokens_output,
                log.tokens_is_approximate,
                log.status,
                log.response_time_ms,
                log.error_message,
            ]
        )
        return rows[0]
    }
}
