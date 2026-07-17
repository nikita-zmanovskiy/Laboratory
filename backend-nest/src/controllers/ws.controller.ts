import {
    Controller,
    Get,
    Query,
    Req,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { CsrfService } from '../services/csrf.service'
import { ClassroomRepository } from '../repositories/classroom.repository'
import { getStudentTokenFromRequest, getTeacherTokenFromRequest } from '../utils/authCookie'
import { verifyTeacherToken } from '../utils/teacherAuth'

@ApiTags('WebSocket')
@Controller('api/ws')
export class WsController {
    constructor(
        private csrfService: CsrfService,
        private classroomRepo: ClassroomRepository
    ) {}

    @Get('token')
    async getToken(@Req() req: Request, @Query('classroom_code') classroomCodeRaw?: string) {
        const classroomCode = classroomCodeRaw?.trim().toUpperCase()
        if (!classroomCode) {
            throw new BadRequestException({ error: 'classroom_code is required' })
        }

        const teacherToken = getTeacherTokenFromRequest(req)
        if (teacherToken) {
            const teacherCheck = await verifyTeacherToken(req, this.classroomRepo, classroomCode)
            if (teacherCheck.ok) {
                return { token: teacherToken, role: 'teacher' as const }
            }
        }

        const studentToken = getStudentTokenFromRequest(req)
        if (studentToken) {
            const validation = this.csrfService.validateToken(studentToken)
            if (validation.valid) {
                const tokenInfo = this.csrfService.findByToken(studentToken)
                if (
                    tokenInfo &&
                    (tokenInfo.classroomCode === 'unknown' ||
                        tokenInfo.classroomCode.toUpperCase() === classroomCode)
                ) {
                    return { token: studentToken, role: 'student' as const }
                }
            }
        }

        throw new ForbiddenException({
            error: 'Access denied for this classroom',
        })
    }
}
