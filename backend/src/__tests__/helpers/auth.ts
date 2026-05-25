import type { Response } from 'supertest'

const STUDENT_COOKIE = 'lab_student'
const TEACHER_COOKIE = 'lab_teacher'

function parseCookie(res: Response, name: string): string | undefined {
    const raw = res.headers['set-cookie']
    if (!raw) return undefined

    const cookies = Array.isArray(raw) ? raw : [raw]
    for (const entry of cookies) {
        const match = entry.match(new RegExp(`^${name}=([^;]+)`))
        if (match?.[1]) return decodeURIComponent(match[1])
    }
    return undefined
}

export function getStudentTokenFromResponse(res: Response): string {
    const token = parseCookie(res, STUDENT_COOKIE)
    if (!token) {
        throw new Error(`${STUDENT_COOKIE} cookie missing in response`)
    }
    return token
}

export function getTeacherTokenFromResponse(res: Response): string {
    const token = parseCookie(res, TEACHER_COOKIE)
    if (!token) {
        throw new Error(`${TEACHER_COOKIE} cookie missing in response`)
    }
    return token
}

/** Токен учителя: cookie lab_teacher или тот же student-токен до создания класса. */
export function getTeacherTokenFromResponses(...responses: Response[]): string {
    for (const res of responses) {
        const fromTeacher = parseCookie(res, TEACHER_COOKIE)
        if (fromTeacher) return fromTeacher
    }
    return getStudentTokenFromResponse(responses[0]!)
}
