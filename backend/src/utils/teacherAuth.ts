import type { Request } from 'express'
import { ClassroomRepository } from '../repositories/classroom.repository.js'
import { getTeacherTokenFromRequest } from './authCookie.js'

export const verifyTeacherToken = async (
    req: Request,
    classroomRepo: ClassroomRepository,
    classroomCode: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> => {
    const csrfToken = getTeacherTokenFromRequest(req)
    if (!csrfToken) {
        return { ok: false, status: 403, error: 'Authentication required' }
    }

    const teacherToken = await classroomRepo.getTeacherToken(classroomCode)
    if (!teacherToken || csrfToken !== teacherToken) {
        return { ok: false, status: 403, error: 'Access denied' }
    }

    return { ok: true }
}
