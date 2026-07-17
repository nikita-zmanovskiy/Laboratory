import type { Request, Response } from 'express'
import { config } from '../config/env'

export const TEACHER_COOKIE_NAME = 'lab_teacher'

export const STUDENT_COOKIE_NAME = 'lab_student'

const cookieBaseOptions = () => ({
    httpOnly: true,
    secure: config.isProduction || config.https,
    sameSite: (config.isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    path: '/',
})

const setCookie = (res: Response, name: string, token: string, expiresAt: Date): void => {
    const maxAge = Math.max(0, expiresAt.getTime() - Date.now())
    res.cookie(name, token, {
        ...cookieBaseOptions(),
        maxAge,
    })
}

export const setTeacherCookie = (res: Response, token: string, expiresAt: Date): void => {
    setCookie(res, TEACHER_COOKIE_NAME, token, expiresAt)
}

export const setStudentCookie = (res: Response, token: string, expiresAt: Date): void => {
    setCookie(res, STUDENT_COOKIE_NAME, token, expiresAt)
}

export const clearTeacherCookie = (res: Response): void => {
    res.clearCookie(TEACHER_COOKIE_NAME, cookieBaseOptions())
}

export const clearStudentCookie = (res: Response): void => {
    res.clearCookie(STUDENT_COOKIE_NAME, cookieBaseOptions())
}

export const clearAllAuthCookies = (res: Response): void => {
    clearTeacherCookie(res)
    clearStudentCookie(res)
}

export const getTeacherTokenFromRequest = (req: Request): string | undefined => {
    const fromCookie = req.cookies?.[TEACHER_COOKIE_NAME] as string | undefined
    const legacyCookie = req.cookies?.lab_csrf as string | undefined
    const fromHeader = req.headers['x-teacher-token'] as string | undefined
    return fromCookie || fromHeader || legacyCookie
}

export const getStudentTokenFromRequest = (req: Request): string | undefined => {
    const fromCookie = req.cookies?.[STUDENT_COOKIE_NAME] as string | undefined
    const fromHeader = req.headers['x-csrf-token'] as string | undefined
    return fromCookie || fromHeader
}

export const CSRF_COOKIE_NAME = STUDENT_COOKIE_NAME

export const getCsrfTokenFromRequest = getStudentTokenFromRequest

export const setCsrfCookie = setStudentCookie

export const clearCsrfCookie = clearStudentCookie
