import type { Request, Response, NextFunction } from 'express'
import { CsrfService } from '../services/csrf.service.js'
import { ClassroomRepository } from '../repositories/classroom.repository.js'
import { getStudentTokenFromRequest, getTeacherTokenFromRequest } from '../utils/authCookie.js'
import { verifyTeacherToken } from '../utils/teacherAuth.js'

export class WsController {
    constructor(
        private csrfService: CsrfService,
        private classroomRepo: ClassroomRepository
    ) {}

    /** Возвращает токен для query-параметра WebSocket (cookie → JSON, т.к. WS на другом порту). */
    getToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const classroomCode = (req.query.classroom_code as string)?.trim().toUpperCase()
            if (!classroomCode) {
                return res.status(400).json({ error: 'classroom_code is required' })
            }

            const teacherToken = getTeacherTokenFromRequest(req)
            if (teacherToken) {
                const teacherCheck = await verifyTeacherToken(
                    req,
                    this.classroomRepo,
                    classroomCode
                )
                if (teacherCheck.ok) {
                    return res.json({ token: teacherToken, role: 'teacher' as const })
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
                        return res.json({ token: studentToken, role: 'student' as const })
                    }
                }
            }

            return res.status(403).json({ error: 'Access denied for this classroom' })
        } catch (error) {
            next(error)
        }
    }
}
