import {
    Controller,
    Get,
    Query,
    Res,
    Req,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response, Request } from 'express'
import { LogService } from '../services/log.service'
import { ClassroomRepository } from '../repositories/classroom.repository'
import { verifyTeacherToken } from '../utils/teacherAuth'

@ApiTags('Logs')
@Controller('api/logs')
export class LogsController {
    constructor(
        private logService: LogService,
        private classroomRepo: ClassroomRepository
    ) {}

    @Get()
    async getLogs(
        @Req() req: Request,
        @Query('classroom_code') classroomCode: string,
        @Query('page') pageStr?: string,
        @Query('limit') limitStr?: string,
        @Query('search') search?: string,
        @Query('mode') mode?: string,
        @Query('status') status?: string,
        @Query('image_attached') imageAttached?: string,
        @Query('sort') sort?: string
    ) {
        if (!classroomCode) {
            throw new BadRequestException({ error: 'classroom_code is required' })
        }

        const classroom = await this.classroomRepo.findByCode(classroomCode)
        if (!classroom) {
            throw new NotFoundException({ error: 'Classroom not found' })
        }

        const teacherCheck = await verifyTeacherToken(req, this.classroomRepo, classroomCode)
        if (!teacherCheck.ok) {
            throw new ForbiddenException({ error: teacherCheck.error })
        }

        const page = parseInt(pageStr || '1') || 1
        const limit = parseInt(limitStr || '20') || 20

        const result = await this.logService.getLogsByClassroomCodePaginated(
            classroomCode,
            page,
            limit,
            { search, mode, status, image_attached: imageAttached, sort }
        )

        return {
            classroom_code: classroomCode,
            count: result.logs.length,
            total: result.total,
            page: result.page,
            total_pages: result.totalPages,
            limit,
            logs: result.logs.map((log: (typeof result.logs)[number]) => ({
                id: log.id,
                timestamp: log.timestamp,
                classroom_id: log.classroomId,
                session_id: log.sessionId,
                mode: log.mode,
                prompt_hash: log.promptHash,
                image_attached: log.imageAttached,
                tokens_input: log.tokensInput,
                tokens_output: log.tokensOutput,
                tokens_is_approximate: log.tokensIsApproximate,
                status: log.status,
                response_time_ms: log.responseTimeMs,
                error_message: log.errorMessage,
            })),
        }
    }

    @Get('export')
    async exportLogs(
        @Req() req: Request,
        @Res() res: Response,
        @Query('classroom_code') classroomCode: string
    ) {
        if (!classroomCode) {
            throw new BadRequestException({ error: 'classroom_code is required' })
        }

        const classroom = await this.classroomRepo.findByCode(classroomCode)
        if (!classroom) {
            throw new NotFoundException({ error: 'Classroom not found' })
        }

        const teacherCheck = await verifyTeacherToken(req, this.classroomRepo, classroomCode)
        if (!teacherCheck.ok) {
            throw new ForbiddenException({ error: teacherCheck.error })
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
        ]
        const csvRows = [headers.join(',')]

        for (const log of logs) {
            const row = [
                log.timestamp,
                log.sessionId,
                log.mode,
                log.promptHash || '',
                log.imageAttached,
                log.tokensInput || 0,
                log.tokensOutput || 0,
                log.tokensIsApproximate,
                log.status,
                log.responseTimeMs,
                log.errorMessage ? `"${log.errorMessage.replace(/"/g, '""')}"` : '',
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
    }
}
