import type { Request, Response, NextFunction } from 'express'
import { LogService } from '../services/log.service.js'
import { ClassroomRepository } from '../repositories/classroom.repository.js'
import { verifyTeacherToken } from '../utils/teacherAuth.js'

export class LogsController {
    constructor(
        private logService: LogService,
        private classroomRepo: ClassroomRepository
    ) {}

    getLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const classroomCode = req.query.classroom_code as string

            if (!classroomCode) {
                return res.status(400).json({ error: 'classroom_code is required' })
            }

            const classroom = await this.classroomRepo.findByCode(classroomCode)
            if (!classroom) {
                return res.status(404).json({ error: 'Classroom not found' })
            }

            const teacherCheck = await verifyTeacherToken(req, this.classroomRepo, classroomCode)
            if (!teacherCheck.ok) {
                return res.status(teacherCheck.status).json({ error: teacherCheck.error })
            }

            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 20

            const filters = {
                search: req.query.search as string,
                mode: req.query.mode as string,
                status: req.query.status as string,
                image_attached: req.query.image_attached as string,
                sort: req.query.sort as string,
            }

            const result = await this.logService.getLogsByClassroomCodePaginated(
                classroomCode,
                page,
                limit,
                filters
            )

            return res.json({
                classroom_code: classroomCode,
                count: result.logs.length,
                total: result.total,
                page: result.page,
                total_pages: result.totalPages,
                limit: limit,
                logs: result.logs,
            })
        } catch (error) {
            next(error)
        }
    }
    exportLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const classroomCode = req.query.classroom_code as string

            if (!classroomCode) {
                return res.status(400).json({ error: 'classroom_code is required' })
            }

            const classroom = await this.classroomRepo.findByCode(classroomCode)
            if (!classroom) {
                return res.status(404).json({ error: 'Classroom not found' })
            }

            const teacherCheck = await verifyTeacherToken(req, this.classroomRepo, classroomCode)
            if (!teacherCheck.ok) {
                return res.status(teacherCheck.status).json({ error: teacherCheck.error })
            }

            const logs = await this.logService.getLogsByClassroomCode(classroomCode)

            const headers = [
                    'Timestamp',
                    'Session ID',
                    'Mode',
                    'Prompt Hash',
                    'Image Attached',
                    'Tokens Input',
                    'Tokens Output',
                    'Tokens Approximate',
                    'Status',
                    'Response Time (ms)',
                    'Error Message',
                ],
                csvRows = [headers.join(',')]

            for (const log of logs) {
                const row = [
                    log.timestamp,
                    log.session_id,
                    log.mode,
                    log.prompt_hash || '',
                    log.image_attached,
                    log.tokens_input || 0,
                    log.tokens_output || 0,
                    log.tokens_is_approximate,
                    log.status,
                    log.response_time_ms,
                    log.error_message ? `"${log.error_message.replace(/"/g, '""')}"` : '',
                ]
                csvRows.push(row.join(','))
            }

            const csvContent = csvRows.join('\n')

            res.setHeader('Content-Type', 'text/csv; charset=utf-8')
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=logs-${classroomCode}-${Date.now()}.csv`
            )
            res.send(csvContent)
        } catch (error) {
            next(error)
        }
    }
}
