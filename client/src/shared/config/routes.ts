/**
 * Конфигурация маршрутов приложения
 *
 * Статические маршруты: home, chat, teacher, teacherClassroomRoot
 * Динамические маршруты: teacherClassroom(code) - страница конкретного класса учителя
 */

/**
 * Проверяет является ли путь публичным (не требует авторизации)
 *
 * @param pathname - текущий путь или null
 * @returns true если путь null или соответствует home
 */

/**
 * Проверяет является ли путь страницей конкретного класса учителя
 *
 * @param pathname - текущий путь или null
 * @returns true если путь начинается с /teacher/classroom/
 */

/**
 * Проверяет является ли путь любой страницей учителя
 *
 * @param pathname - текущий путь или null
 * @returns true если путь начинается с /teacher
 */

export const appRoutes = {
    home: "/",
    chat: "/chat",
    teacher: "/teacher",
    teacherClassroomRoot: "/teacher/classroom",
    teacherClassroom: (code: string) => `/teacher/classroom/${code}`,
} as const

export const isPublicRoute = (pathname: string | null) => {
    return !pathname || pathname === appRoutes.home
}

export const isTeacherClassroomRoute = (pathname: string | null) => {
    return Boolean(pathname?.startsWith(`${appRoutes.teacherClassroomRoot}/`))
}

export const isTeacherRoute = (pathname: string | null) => {
    return Boolean(pathname?.startsWith(appRoutes.teacher))
}
