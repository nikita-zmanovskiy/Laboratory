import type { CsrfService } from '../services/csrf.service.js'
import type { ClassroomRepository } from '../repositories/classroom.repository.js'

export type WsAuthRole = 'teacher' | 'student'

export type WsAuthResult = { ok: true; role: WsAuthRole } | { ok: false; reason: string }

const CLASSROOM_CODE_RE = /^[A-Z0-9]{6}$/i
const TOKEN_RE = /^[a-f0-9]{64}$/

export const validateWsAccess = async (
    classroomCode: string,
    token: string,
    csrfService: CsrfService,
    classroomRepo: ClassroomRepository
): Promise<WsAuthResult> => {
    const normalizedCode = classroomCode?.trim().toUpperCase() ?? ''

    if (!CLASSROOM_CODE_RE.test(normalizedCode)) {
        return { ok: false, reason: 'invalid classroom code' }
    }

    if (!token || !TOKEN_RE.test(token)) {
        return { ok: false, reason: 'invalid or missing token' }
    }

    const classroom = await classroomRepo.findByCode(normalizedCode)
    if (!classroom) {
        return { ok: false, reason: 'classroom not found' }
    }

    if (!classroom.is_active) {
        return { ok: false, reason: 'classroom is not active' }
    }

    if (classroom.expires_at && new Date() > new Date(classroom.expires_at)) {
        return { ok: false, reason: 'classroom has expired' }
    }

    const teacherToken = await classroomRepo.getTeacherToken(normalizedCode)
    if (teacherToken && teacherToken === token) {
        return { ok: true, role: 'teacher' }
    }

    const tokenValidation = csrfService.validateToken(token)
    if (!tokenValidation.valid) {
        return { ok: false, reason: tokenValidation.error || 'invalid token' }
    }

    const tokenInfo = csrfService.findByToken(token)
    if (!tokenInfo) {
        return { ok: false, reason: 'token not found' }
    }

    if (
        tokenInfo.classroomCode !== 'unknown' &&
        tokenInfo.classroomCode.toUpperCase() !== normalizedCode
    ) {
        return { ok: false, reason: 'token does not belong to this classroom' }
    }

    return { ok: true, role: 'student' }
}
