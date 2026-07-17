import {
    Controller,
    Post,
    Get,
    Param,
    Query,
    Body,
    Res,
    Req,
    HttpCode,
    HttpStatus,
    UsePipes,
    ForbiddenException,
    NotFoundException,
    GoneException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Response, Request } from 'express'
import { randomUUID } from 'crypto'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { ClassroomRepository } from '../repositories/classroom.repository'
import { CsrfService } from '../services/csrf.service'
import { WebSocketService } from '../services/websocket.service'
import {
    setTeacherCookie,
    setStudentCookie,
    clearAllAuthCookies,
    getStudentTokenFromRequest,
} from '../utils/authCookie'
import { verifyTeacherToken } from '../utils/teacherAuth'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { createClassroomSchema } from '../schemas/classroom.schema'

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeRoomCode(): string {
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]!
    }
    return code
}

@ApiTags('Classrooms')
@Controller('api/classrooms')
export class ClassroomController {
    constructor(
        private classroomRepo: ClassroomRepository,
        private csrfService: CsrfService,
        private wsService: WebSocketService
    ) {}

    @Get(':code/join')
    async join(
        @Param('code') code: string,
        @Query('student_id') studentId: string | undefined,
        @Res({ passthrough: true }) res: Response
    ) {
        const resolvedStudentId = studentId || `student-${Date.now()}`
        const classroom = await this.classroomRepo.findByCode(code)

        if (!classroom) {
            throw new NotFoundException({ error: 'Classroom not found' })
        }
        if (!classroom.isActive) {
            throw new GoneException({ error: 'Classroom is not active' })
        }
        if (!classroom.expiresAt || new Date() > new Date(classroom.expiresAt)) {
            throw new GoneException({ error: 'Classroom has expired' })
        }

        const expiresAt = new Date(classroom.expiresAt)
        const sessionId = `student-${code}-${resolvedStudentId}`
        const token = this.csrfService.createToken(sessionId, code, expiresAt)
        setStudentCookie(res, token, expiresAt)

        return {
            classroom_code: code,
            student_id: resolvedStudentId,
            expires_at: classroom.expiresAt,
            message: 'Joined. Session stored in HTTPOnly cookie.',
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(createClassroomSchema))
    async create(
        @Body()
        body: {
            title: string
            expires_in_minutes?: number
            grade?: number
        },
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const { title, expires_in_minutes, grade } = body
        const expiresInMinutes = expires_in_minutes || 1440
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)
        const classGrade = grade || 11

        for (let attempt = 0; attempt < 8; attempt++) {
            const code = makeRoomCode()
            try {
                const row = await this.classroomRepo.create({
                    id: randomUUID(),
                    code,
                    title,
                    expiresAt,
                    grade: classGrade,
                })

                const creatorToken = getStudentTokenFromRequest(req)
                if (!creatorToken) {
                    throw new ForbiddenException({ error: 'Authentication required' })
                }

                await this.classroomRepo.setTeacherToken(row.id, creatorToken)
                setTeacherCookie(res, creatorToken, expiresAt)

                return {
                    id: row.id,
                    code: row.code,
                    title: row.title,
                    is_active: row.isActive,
                    expires_at: row.expiresAt,
                    grade: classGrade,
                    expires_in_minutes: expiresInMinutes,
                    message: 'Students join via GET /api/classrooms/' + code + '/join?student_id=1',
                }
            } catch (e: unknown) {
                if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
                    continue
                }
                throw e
            }
        }

        throw new InternalServerErrorException({
            error: 'Failed to generate unique code',
        })
    }

    @Post(':code/extend')
    async extend(
        @Param('code') code: string,
        @Body() body: { additional_minutes: number },
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const { additional_minutes } = body

        if (!additional_minutes || additional_minutes < 1 || additional_minutes > 120) {
            throw new BadRequestException({
                error: 'additional_minutes must be between 1 and 120',
            })
        }

        const classroom = await this.classroomRepo.findByCode(code)
        if (!classroom) {
            throw new NotFoundException({ error: 'Classroom not found' })
        }
        if (!classroom.isActive) {
            throw new GoneException({ error: 'Classroom is not active' })
        }

        const teacherCheck = await verifyTeacherToken(req, this.classroomRepo, code)
        if (!teacherCheck.ok) {
            throw new ForbiddenException({ error: teacherCheck.error })
        }

        if (classroom.expiresAt && new Date() > new Date(classroom.expiresAt)) {
            throw new GoneException({ error: 'Classroom has expired' })
        }

        const updated = await this.classroomRepo.extend(code, additional_minutes)
        if (!updated) {
            throw new InternalServerErrorException({
                error: 'Failed to extend classroom',
            })
        }

        if (updated.expiresAt) {
            this.csrfService.syncTokensExpiryForClassroom(code, new Date(updated.expiresAt))
            const currentToken = getStudentTokenFromRequest(req)
            if (currentToken) {
                setTeacherCookie(res, currentToken, new Date(updated.expiresAt))
            }
        }

        if (updated.expiresAt) {
            this.wsService.broadcastClassroomExtended(code, new Date(updated.expiresAt))
        }

        return {
            code: updated.code,
            old_expires_at: classroom.expiresAt,
            new_expires_at: updated.expiresAt,
            added_minutes: additional_minutes,
            message: `Classroom extended by ${additional_minutes} minutes. Tokens also extended.`,
        }
    }

    @Post(':code/teacher-session')
    async teacherSession(
        @Param('code') code: string,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const classroom = await this.classroomRepo.findByCode(code)

        if (!classroom) {
            throw new NotFoundException({ error: 'Classroom not found' })
        }
        if (!classroom.isActive) {
            throw new GoneException({ error: 'Classroom is not active' })
        }
        if (!classroom.expiresAt || new Date() > new Date(classroom.expiresAt)) {
            throw new GoneException({ error: 'Classroom has expired' })
        }

        const teacherCheck = await verifyTeacherToken(req, this.classroomRepo, code)
        if (!teacherCheck.ok) {
            throw new ForbiddenException({ error: teacherCheck.error })
        }

        const expiresAt = new Date(classroom.expiresAt)
        const sessionId = `teacher-preview-${code}`
        const token = this.csrfService.createToken(sessionId, code, expiresAt)
        setStudentCookie(res, token, expiresAt)

        return {
            classroom_code: code,
            session_id: sessionId,
            expires_at: classroom.expiresAt,
            message: 'Teacher preview session for chat',
        }
    }

    @Post(':code/deactivate')
    async deactivate(
        @Param('code') code: string,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const classroom = await this.classroomRepo.findByCode(code)

        if (!classroom) {
            throw new NotFoundException({ error: 'Classroom not found' })
        }

        const teacherCheck = await verifyTeacherToken(req, this.classroomRepo, code)
        if (!teacherCheck.ok) {
            throw new ForbiddenException({
                error: 'Access denied. Only the teacher who created this classroom can deactivate it.',
            })
        }

        await this.classroomRepo.deactivate(classroom.id)
        clearAllAuthCookies(res)
        this.wsService.broadcastClassroomClosed(code, 'deactivated')

        return {
            message: 'Classroom deactivated',
            code,
            is_active: false,
        }
    }
}
