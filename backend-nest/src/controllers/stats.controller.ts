import {
    Controller,
    Get,
    Param,
    Req,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { ClassroomService } from '../services/classroom.service'
import { ClassroomRepository } from '../repositories/classroom.repository'
import { CsrfService } from '../services/csrf.service'
import { getStudentTokenFromRequest } from '../utils/authCookie'
import { verifyTeacherToken } from '../utils/teacherAuth'

@ApiTags('Stats')
@Controller('api/stats')
export class StatsController {
    constructor(
        private classroomService: ClassroomService,
        private classroomRepo: ClassroomRepository,
        private csrfService: CsrfService
    ) {}

    @Get()
    async getGlobalStats(@Req() req: Request) {
        const csrfToken = getStudentTokenFromRequest(req)
        if (!csrfToken) {
            throw new ForbiddenException({ error: 'CSRF token is required' })
        }

        const validation = this.csrfService.validateToken(csrfToken)
        if (!validation.valid) {
            throw new ForbiddenException({
                error: validation.error || 'Invalid or expired CSRF token',
            })
        }

        const global = await this.classroomRepo.getGlobalStats()

        return {
            global: {
                total_classrooms: global?.total_classrooms ?? 0,
                active_classrooms: global?.active_classrooms ?? 0,
                total_requests: global?.total_requests ?? 0,
                total_sessions: global?.total_sessions ?? 0,
            },
        }
    }

    @Get(':classroomCode')
    async getClassroomStats(@Param('classroomCode') classroomCode: string, @Req() req: Request) {
        if (!classroomCode) {
            throw new BadRequestException({ error: 'classroomCode is required' })
        }

        const classroom = await this.classroomRepo.findByCode(classroomCode)
        if (!classroom) {
            throw new NotFoundException({ error: 'Classroom not found' })
        }

        const teacherCheck = await verifyTeacherToken(req, this.classroomRepo, classroomCode)
        if (!teacherCheck.ok) {
            throw new ForbiddenException({ error: teacherCheck.error })
        }

        const stats = await this.classroomService.getClassroomStats(classroomCode)

        if (!stats || stats.total_requests === 0) {
            return {
                classroom_code: classroomCode,
                message: 'No data yet',
                stats: {
                    total_requests: 0,
                    text_requests: 0,
                    image_requests: 0,
                    errors: 0,
                    avg_response_time: 0,
                    active_sessions: 0,
                    top_students: [],
                    charts: {
                        tokens_over_time: [],
                        requests_per_minute: [],
                        mode_distribution: { text: 0, image: 0 },
                        avg_tokens_per_request: 0,
                    },
                },
            }
        }

        return {
            classroom_code: classroomCode,
            stats,
            expires_at: stats.expires_at,
        }
    }
}
